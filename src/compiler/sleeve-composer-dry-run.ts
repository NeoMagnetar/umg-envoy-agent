import type {
  CognitiveGovernance,
  CognitiveRegistry,
  DryRunSleeveOutlineStep,
  NeoBlock,
  NeoStack,
  ResolvedMoltBlockForComposition,
  ResolvedNeoBlockForComposition,
  SleeveComposerDryRunResult,
  SleeveCompositionTraceEntry,
} from "../types.js";
import { loadCognitiveRegistry, planNeoStack } from "./cognitive-registry.js";

function slugify(input: string): string {
  const slug = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "untitled";
}

function combineGovernance(items: Array<{ governance: CognitiveGovernance }>): CognitiveGovernance {
  return {
    read_only: items.every((item) => item.governance.read_only === true),
    allows_writes: items.some((item) => item.governance.allows_writes === true),
    requires_gate: items.some((item) => item.governance.requires_gate === true),
  };
}

function closedResult(input: {
  intent: string;
  selectionTrace?: SleeveComposerDryRunResult["selection_trace"];
  selectedNeoStack?: SleeveComposerDryRunResult["selected_neostack"];
  compositionTrace: SleeveCompositionTraceEntry[];
  warnings?: string[];
  errors: string[];
}): SleeveComposerDryRunResult {
  return {
    ok: false,
    intent: input.intent,
    selected_neostack: input.selectedNeoStack ?? null,
    proposed_sleeve_id: null,
    sleeve_id: null,
    resolved_molt_blocks: [],
    resolved_neoblocks: [],
    sleeve_outline: null,
    selection_trace: input.selectionTrace ?? [],
    composition_trace: [
      ...input.compositionTrace,
      {
        stage: "boundary",
        ok: true,
        message: "Dry-run composer failed closed before sleeve execution or writes.",
      },
    ],
    non_executing: true,
    writes_enabled: false,
    warnings: input.warnings ?? [],
    errors: input.errors,
  };
}

function resolveNeoBlocks(registry: CognitiveRegistry, stack: NeoStack) {
  const neoBlockById = new Map(registry.neoblocks.map((entry) => [entry.id, entry]));
  const enabledRefs = stack.neoblock_refs
    .filter((ref) => ref.enabled !== false)
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  const missing = enabledRefs.filter((ref) => !neoBlockById.has(ref.id)).map((ref) => ref.id);
  const resolved = enabledRefs
    .map((ref) => ({ ref, neoblock: neoBlockById.get(ref.id) }))
    .filter((entry): entry is { ref: typeof enabledRefs[number]; neoblock: NeoBlock } => Boolean(entry.neoblock));
  return { enabledRefs, missing, resolved };
}

function resolveMoltBlocks(registry: CognitiveRegistry, neoBlocks: Array<{ ref: { id: string; order: number; role?: string }; neoblock: NeoBlock }>) {
  const moltById = new Map(registry.molt_blocks.map((entry) => [entry.id, entry]));
  const missing: string[] = [];
  const resolved: ResolvedMoltBlockForComposition[] = [];

  for (const { neoblock } of neoBlocks) {
    const enabledRefs = neoblock.molt_refs
      .filter((ref) => ref.enabled !== false)
      .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0) || a.id.localeCompare(b.id));
    for (const ref of enabledRefs) {
      const molt = moltById.get(ref.id);
      if (!molt) {
        missing.push(`${neoblock.id}->${ref.id}`);
        continue;
      }
      resolved.push({
        id: molt.id,
        name: molt.name,
        purpose: molt.purpose,
        role: ref.role,
        source_neoblock_id: neoblock.id,
        inputs: molt.inputs,
        outputs: molt.outputs,
        tags: molt.tags,
        authority: molt.authority,
        risk_level: molt.risk_level,
        governance: molt.governance,
      });
    }
  }

  return { missing, resolved };
}

export function composeSleeveDryRun(input: { intent: string; metaUrl?: string; registry?: CognitiveRegistry }): SleeveComposerDryRunResult {
  const intent = input.intent.trim();
  const registry = input.registry ?? loadCognitiveRegistry(input.metaUrl ?? import.meta.url);
  const plan = planNeoStack({ intent, metaUrl: input.metaUrl ?? import.meta.url, registry });
  const compositionTrace: SleeveCompositionTraceEntry[] = [
    {
      stage: "plan_neostack",
      ok: plan.ok,
      message: plan.ok ? "NeoStack dry-run planning completed." : "NeoStack dry-run planning failed.",
      refs: plan.selected_neostack ? [plan.selected_neostack.id] : [],
    },
  ];

  if (!plan.ok || !plan.selected_neostack) {
    return closedResult({
      intent,
      selectionTrace: plan.selection_trace,
      compositionTrace,
      warnings: plan.warnings,
      errors: plan.errors.length > 0 ? plan.errors : ["No NeoStack could be selected for intent"],
    });
  }

  const stack = registry.neostacks.find((entry) => entry.id === plan.selected_neostack?.id) ?? null;
  compositionTrace.push({
    stage: "resolve_neostack",
    ok: Boolean(stack),
    message: stack ? "Selected NeoStack resolved from bundled registry." : "Selected NeoStack did not resolve from bundled registry.",
    refs: [plan.selected_neostack.id],
  });

  if (!stack) {
    return closedResult({
      intent,
      selectionTrace: plan.selection_trace,
      selectedNeoStack: plan.selected_neostack,
      compositionTrace,
      errors: [`Unresolved NeoStack reference: ${plan.selected_neostack.id}`],
    });
  }

  const neoBlocks = resolveNeoBlocks(registry, stack);
  compositionTrace.push({
    stage: "resolve_neoblocks",
    ok: neoBlocks.missing.length === 0,
    message: neoBlocks.missing.length === 0 ? "All enabled NeoBlock refs resolved." : "One or more enabled NeoBlock refs did not resolve.",
    refs: neoBlocks.missing.length === 0 ? neoBlocks.enabledRefs.map((ref) => ref.id) : neoBlocks.missing,
  });

  if (neoBlocks.missing.length > 0) {
    return closedResult({
      intent,
      selectionTrace: plan.selection_trace,
      selectedNeoStack: plan.selected_neostack,
      compositionTrace,
      errors: neoBlocks.missing.map((id) => `Unresolved NeoBlock reference: ${stack.id}->${id}`),
    });
  }

  const moltBlocks = resolveMoltBlocks(registry, neoBlocks.resolved);
  compositionTrace.push({
    stage: "resolve_molt_blocks",
    ok: moltBlocks.missing.length === 0,
    message: moltBlocks.missing.length === 0 ? "All enabled MOLT refs resolved." : "One or more enabled MOLT refs did not resolve.",
    refs: moltBlocks.missing.length === 0 ? moltBlocks.resolved.map((entry) => entry.id) : moltBlocks.missing,
  });

  if (moltBlocks.missing.length > 0) {
    return closedResult({
      intent,
      selectionTrace: plan.selection_trace,
      selectedNeoStack: plan.selected_neostack,
      compositionTrace,
      errors: moltBlocks.missing.map((ref) => `Unresolved MOLT reference: ${ref}`),
    });
  }

  const resolvedNeoBlocks: ResolvedNeoBlockForComposition[] = neoBlocks.resolved.map(({ ref, neoblock }) => ({
    id: neoblock.id,
    name: neoblock.name,
    purpose: neoblock.purpose,
    role: ref.role,
    order: ref.order,
    outputs: neoblock.outputs,
    molt_refs: neoblock.molt_refs,
    governance: neoblock.governance,
  }));

  const steps: DryRunSleeveOutlineStep[] = resolvedNeoBlocks.map((neoblock) => ({
    order: neoblock.order,
    neoblock_id: neoblock.id,
    neoblock_role: neoblock.role,
    molt_block_ids: moltBlocks.resolved
      .filter((molt) => molt.source_neoblock_id === neoblock.id)
      .map((molt) => molt.id),
    outputs: neoblock.outputs,
  }));

  const proposedSleeveId = `dry-run.${slugify(stack.id)}.${slugify(intent)}`;
  const governance = combineGovernance([stack, ...neoBlocks.resolved.map((entry) => entry.neoblock), ...moltBlocks.resolved]);
  compositionTrace.push({
    stage: "assemble_outline",
    ok: true,
    message: "Deterministic sleeve preview outline assembled without writing artifacts.",
    refs: [proposedSleeveId],
  });
  compositionTrace.push({
    stage: "boundary",
    ok: governance.allows_writes === false,
    message: "Dry-run composer produced a non-executing preview with writes disabled.",
  });

  return {
    ok: governance.allows_writes === false,
    intent,
    selected_neostack: plan.selected_neostack,
    proposed_sleeve_id: proposedSleeveId,
    sleeve_id: proposedSleeveId,
    resolved_molt_blocks: moltBlocks.resolved,
    resolved_neoblocks: resolvedNeoBlocks,
    sleeve_outline: {
      title: `Dry-run sleeve preview for ${intent}`,
      proposed_sleeve_id: proposedSleeveId,
      selected_neostack_id: stack.id,
      block_ref_count: moltBlocks.resolved.length,
      neoblock_count: resolvedNeoBlocks.length,
      molt_block_count: moltBlocks.resolved.length,
      steps,
      constraints: stack.constraints,
      intended_use: stack.intended_use,
    },
    selection_trace: plan.selection_trace,
    composition_trace: compositionTrace,
    non_executing: true,
    writes_enabled: false,
    warnings: plan.warnings,
    errors: governance.allows_writes === false ? [] : ["Composition would require writes and was blocked"],
  };
}
