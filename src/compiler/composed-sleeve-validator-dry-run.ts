import type {
  CognitiveRegistry,
  ComposedSleeveValidationSafety,
  ComposedSleeveValidationTraceEntry,
  ComposedSleeveValidatorDryRunResult,
  NeoStackSelectionTraceEntry,
  SleeveComposerDryRunResult,
} from "../types.js";
import { loadCognitiveRegistry } from "./cognitive-registry.js";
import { composeSleeveDryRun } from "./sleeve-composer-dry-run.js";

const safety: ComposedSleeveValidationSafety = {
  non_executing: true,
  writes_enabled: false,
  execution_allowed: false,
  mutation_allowed: false,
  publish_allowed: false,
};

function trace(check: string, ok: boolean, message: string, refs?: string[]): ComposedSleeveValidationTraceEntry {
  return { check, ok, message, ...(refs ? { refs } : {}) };
}

function selectedTrace(selectionTrace: NeoStackSelectionTraceEntry[], selectedId: string | null): NeoStackSelectionTraceEntry | null {
  return selectionTrace.find((entry) => entry.candidate_id === selectedId) ?? null;
}

function failClosed(input: {
  intent: string;
  composition: SleeveComposerDryRunResult;
  validationTrace: ComposedSleeveValidationTraceEntry[];
  errors: string[];
  warnings?: string[];
}): ComposedSleeveValidatorDryRunResult {
  return {
    ok: false,
    intent: input.intent,
    selected_neostack: input.composition.selected_neostack,
    proposed_sleeve_id: input.composition.proposed_sleeve_id,
    validation_status: "invalid_dry_run",
    validation_errors: input.errors,
    validation_warnings: input.warnings ?? input.composition.warnings,
    resolved_molt_blocks: input.composition.resolved_molt_blocks,
    resolved_neoblocks: input.composition.resolved_neoblocks,
    selection_trace: input.composition.selection_trace,
    composition_trace: input.composition.composition_trace,
    validation_trace: [
      ...input.validationTrace,
      trace("fail_closed", true, "Validator failed closed without execution, mutation, publication, install, or writes."),
    ],
    safety,
    source: {
      composer_tool: "umg_envoy_compose_sleeve_dry_run",
      validator_tool: "umg_envoy_validate_composed_sleeve_dry_run",
    },
  };
}

export function validateComposedSleeveDryRun(input: {
  intent: string;
  metaUrl?: string;
  registry?: CognitiveRegistry;
  composition?: SleeveComposerDryRunResult;
}): ComposedSleeveValidatorDryRunResult {
  const intent = input.intent.trim();
  const registry = input.registry ?? loadCognitiveRegistry(input.metaUrl ?? import.meta.url);
  const composition = input.composition ?? composeSleeveDryRun({ intent, metaUrl: input.metaUrl ?? import.meta.url, registry });
  const validationTrace: ComposedSleeveValidationTraceEntry[] = [];
  const errors: string[] = [];
  const warnings: string[] = [...composition.warnings];

  function check(label: string, ok: boolean, message: string, refs?: string[]) {
    validationTrace.push(trace(label, ok, message, refs));
    if (!ok) errors.push(message);
  }

  const neoStackById = new Map(registry.neostacks.map((entry) => [entry.id, entry]));
  const neoBlockById = new Map(registry.neoblocks.map((entry) => [entry.id, entry]));
  const moltById = new Map(registry.molt_blocks.map((entry) => [entry.id, entry]));
  const selectedNeoStackId = composition.selected_neostack?.id ?? null;
  const selectedStack = selectedNeoStackId ? neoStackById.get(selectedNeoStackId) ?? null : null;
  const winningTrace = selectedTrace(composition.selection_trace, selectedNeoStackId);

  check("intent_present", intent.length > 0, "Intent is required for composed sleeve validation.");
  check("composer_result_ok", composition.ok === true, "Composer result must be ok before validation can pass.");
  check("selected_neostack_present", Boolean(selectedNeoStackId), "Selected NeoStack is required.", selectedNeoStackId ? [selectedNeoStackId] : []);
  check("selected_neostack_resolves", Boolean(selectedStack), selectedNeoStackId ? `Selected NeoStack resolves: ${selectedNeoStackId}` : "Selected NeoStack could not resolve.", selectedNeoStackId ? [selectedNeoStackId] : []);
  check("intent_supported_by_selection_trace", Boolean(winningTrace && winningTrace.score > 0 && winningTrace.matched_tags.length > 0), selectedNeoStackId ? `Selected NeoStack has matching intent signals: ${selectedNeoStackId}` : "No supported intent selection trace was found.", winningTrace?.matched_tags);
  check("proposed_sleeve_id_present", Boolean(composition.proposed_sleeve_id), "Proposed sleeve id is required.", composition.proposed_sleeve_id ? [composition.proposed_sleeve_id] : []);
  check("sleeve_outline_present", Boolean(composition.sleeve_outline), "Sleeve outline is required.");
  check("selection_trace_present", composition.selection_trace.length > 0, "Selection trace is required.");
  check("composition_trace_present", composition.composition_trace.length > 0, "Composition trace is required.");
  check("non_executing_true", composition.non_executing === true, "Composed sleeve dry run must remain non-executing.");
  check("writes_disabled", composition.writes_enabled === false, "Composed sleeve dry run must keep writes disabled.");

  if (selectedStack) {
    const missingStackNeoBlockRefs = selectedStack.neoblock_refs
      .filter((ref) => ref.enabled !== false && !neoBlockById.has(ref.id))
      .map((ref) => `${selectedStack.id}->${ref.id}`);
    check("selected_neostack_neoblock_refs_resolve", missingStackNeoBlockRefs.length === 0, "All selected NeoStack NeoBlock refs must resolve.", missingStackNeoBlockRefs);
  }

  const unresolvedResolvedNeoBlocks = composition.resolved_neoblocks
    .filter((entry) => !neoBlockById.has(entry.id))
    .map((entry) => entry.id);
  check("resolved_neoblocks_present", composition.resolved_neoblocks.length > 0, "Resolved NeoBlocks are required.");
  check("resolved_neoblocks_resolve", unresolvedResolvedNeoBlocks.length === 0, "All resolved NeoBlocks must exist in the registry.", unresolvedResolvedNeoBlocks);

  const unresolvedResolvedMolts = composition.resolved_molt_blocks
    .filter((entry) => !moltById.has(entry.id))
    .map((entry) => entry.id);
  check("resolved_molt_blocks_present", composition.resolved_molt_blocks.length > 0, "Resolved MOLT blocks are required.");
  check("resolved_molt_blocks_resolve", unresolvedResolvedMolts.length === 0, "All resolved MOLT blocks must exist in the registry.", unresolvedResolvedMolts);

  const outline = composition.sleeve_outline;
  if (outline) {
    const outlineNeoBlocks = outline.steps.filter((step) => !neoBlockById.has(step.neoblock_id)).map((step) => step.neoblock_id);
    const outlineMolts = outline.steps.flatMap((step) => step.molt_block_ids.filter((id) => !moltById.has(id)).map((id) => `${step.neoblock_id}->${id}`));
    check("outline_selected_stack_matches", outline.selected_neostack_id === selectedNeoStackId, "Sleeve outline must reference the selected NeoStack.", [outline.selected_neostack_id]);
    check("outline_proposed_id_matches", outline.proposed_sleeve_id === composition.proposed_sleeve_id, "Sleeve outline proposed id must match the composed proposed sleeve id.", [outline.proposed_sleeve_id]);
    check("outline_neoblock_refs_resolve", outlineNeoBlocks.length === 0, "All sleeve outline NeoBlock refs must resolve.", outlineNeoBlocks);
    check("outline_molt_refs_resolve", outlineMolts.length === 0, "All sleeve outline MOLT refs must resolve.", outlineMolts);
    check("outline_counts_match", outline.neoblock_count === composition.resolved_neoblocks.length && outline.molt_block_count === composition.resolved_molt_blocks.length, "Sleeve outline counts must match resolved refs.");
  }

  const composerErrors = composition.errors.map((error) => `Composer error: ${error}`);
  if (composerErrors.length > 0) {
    errors.push(...composerErrors);
    validationTrace.push(trace("composer_errors_absent", false, "Composer errors must be absent for validation to pass.", composerErrors));
  } else {
    validationTrace.push(trace("composer_errors_absent", true, "Composer errors are absent."));
  }

  validationTrace.push(trace("execution_allowed_false", safety.execution_allowed === false, "Execution remains disallowed."));
  validationTrace.push(trace("mutation_allowed_false", safety.mutation_allowed === false, "Mutation remains disallowed."));
  validationTrace.push(trace("publish_allowed_false", safety.publish_allowed === false, "Publication remains disallowed."));

  if (errors.length > 0) {
    return failClosed({ intent, composition, validationTrace, errors, warnings });
  }

  validationTrace.push(trace("valid_dry_run_boundary", true, "Composed sleeve validation completed as a non-executing, no-write dry-run audit."));

  return {
    ok: true,
    intent,
    selected_neostack: composition.selected_neostack,
    proposed_sleeve_id: composition.proposed_sleeve_id,
    validation_status: "valid_dry_run",
    validation_errors: [],
    validation_warnings: warnings,
    resolved_molt_blocks: composition.resolved_molt_blocks,
    resolved_neoblocks: composition.resolved_neoblocks,
    selection_trace: composition.selection_trace,
    composition_trace: composition.composition_trace,
    validation_trace: validationTrace,
    safety,
    source: {
      composer_tool: "umg_envoy_compose_sleeve_dry_run",
      validator_tool: "umg_envoy_validate_composed_sleeve_dry_run",
    },
  };
}
