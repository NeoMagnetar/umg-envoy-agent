import type { ActivationTraceView, RuntimeActivationPayload } from "./activation-runtime.js";
import { buildActivationTraceView, buildRuntimeActivationPayload } from "./activation-runtime.js";
import { resolvePaths } from "./paths.js";
import { resolveUMGPathAgainstLegend } from "./umg-legend-resolver.js";
import { summarizeValidationIssues, validateUMGPath } from "./umg-path-validator.js";
import { alignRuntimeId, collectManyToOneMappings, loadRuntimeLegendAlignment, type RuntimeAlignmentTraceEntry } from "./umg-runtime-legend-alignment.js";
import type { PluginConfig, ResolvedPaths } from "./types.js";
import type { MoltNode, NeoBlockNode, NeoStackNode, UMGPathDocument, ValidationIssue } from "./umg-path-types.js";

export interface RuntimePlannerBuildInput {
  message: string;
  sleeveId?: string;
  messageId?: string | null;
  provenance?: string[];
  notes?: string[];
  use?: string;
  aim?: string;
  need?: string[];
}

export interface RuntimePlannerBuildResult {
  doc: UMGPathDocument;
  trace: ActivationTraceView;
  payload: RuntimeActivationPayload;
  issues: ValidationIssue[];
  alignmentTrace: RuntimeAlignmentTraceEntry[];
  structural: {
    ok: boolean;
    errors: number;
    warnings: number;
  };
  semantic: {
    ok: boolean;
    errors: number;
    warnings: number;
  };
  plannerTrace: {
    sourceMessage: string;
    resolvedSleeveId: string;
    loadedStacks: string[];
    activeBlocks: string[];
    latentBlocks: string[];
    suppressedBlocks: string[];
    triggerIds: string[];
    cueKinds: string[];
    winnerKeys: string[];
    alignedStacks: string[];
    alignedBlocks: string[];
    manyToOneWarnings: string[];
  };
}

function summarizeIssues(issues: ValidationIssue[]): { ok: boolean; errors: number; warnings: number } {
  return summarizeValidationIssues(issues);
}

function inferRole(id: string): MoltNode["role"] {
  const normalized = id.toLowerCase();
  if (normalized.startsWith("dir")) return "D";
  if (normalized.startsWith("inst")) return "I";
  if (normalized.startsWith("trg")) return "T";
  if (normalized.startsWith("aim")) return "S";
  if (normalized.startsWith("need")) return "S";
  if (normalized.startsWith("use")) return "S";
  if (normalized.startsWith("prim")) return "P";
  if (normalized.startsWith("phi")) return "H";
  if (normalized.startsWith("bp")) return "B";
  return "I";
}

function stateForId(id: string, payload: RuntimeActivationPayload): MoltNode["state"] {
  if (payload.activeForTurn.activeBlockIds.includes(id)) return "active";
  if (payload.activeForTurn.suppressedBlockIds.includes(id)) return "suppressed";
  if (payload.activeForTurn.latentBlockIds.includes(id)) return "latent";
  return "off";
}

function buildAlignedPlannerDoc(payload: RuntimeActivationPayload, input: RuntimePlannerBuildInput, alignmentTrace: RuntimeAlignmentTraceEntry[]): UMGPathDocument {
  const stackGroups = new Map<string, string[]>();

  const candidateBlockIds = Array.from(new Set([
    ...payload.activeForTurn.activeBlockIds,
    ...payload.activeForTurn.suppressedBlockIds,
    ...payload.activeForTurn.latentBlockIds
  ]));

  for (const entry of alignmentTrace.filter((item) => item.kind === "stack")) {
    if (!stackGroups.has(entry.resolvedId)) {
      stackGroups.set(entry.resolvedId, []);
    }
  }

  const blockAlignments = alignmentTrace.filter((item) => item.kind === "block");
  const moltAlignments = alignmentTrace.filter((item) => item.kind === "molt");
  const resolvedStackIds = alignmentTrace.filter((item) => item.kind === "stack").map((item) => item.resolvedId);
  const fallbackStackId = resolvedStackIds[0] ?? "S.01";

  for (const blockId of candidateBlockIds) {
    const blockEntry = blockAlignments.find((item) => item.emittedId === blockId) ?? {
      kind: "block" as const,
      emittedId: blockId,
      resolvedId: blockId,
      status: "unresolved" as const,
      source: "implicit-fallback"
    };
    const current = stackGroups.get(fallbackStackId) ?? [];
    current.push(blockEntry.resolvedId);
    stackGroups.set(fallbackStackId, current);
  }

  const stacks: NeoStackNode[] = [];
  for (const [stackId, blockIds] of stackGroups.entries()) {
    const blocks: NeoBlockNode[] = [];
    const uniqueBlockIds = Array.from(new Set(blockIds));
    for (const blockId of uniqueBlockIds) {
      const memberIds = moltAlignments
        .filter((item) => candidateBlockIds.includes(item.emittedId))
        .map((item) => item.resolvedId);
      const moltId = memberIds[0] ?? "INST.061";
      blocks.push({
        id: blockId,
        molts: [{
          state: stateForId(candidateBlockIds[0] ?? blockId, payload),
          role: inferRole(moltId),
          id: moltId
        }]
      });
    }
    stacks.push({ id: stackId, blocks });
  }

  return {
    use: input.use ?? "build_live_runtime_path",
    aim: input.aim ?? "deterministic_runtime_planner_route",
    need: input.need ?? ["structural_validity", "semantic_resolution", "traceable_handoff"],
    sleeveId: input.sleeveId ?? payload.sleeveId ?? "sample-basic-minimal",
    triggers: [...payload.triggerIds],
    gates: [],
    loadedStacks: resolvedStackIds,
    stacks,
    relationships: [],
    bundles: [],
    merges: [],
    winners: alignmentTrace
      .filter((item) => item.kind === "block" && item.status !== "unresolved")
      .slice(0, 1)
      .map((item) => ({ key: "chain", value: `${item.resolvedId}>INST.061` })),
    compiler: { stages: ["validate", "normalize", "merge", "bundle", "govern", "compile", "emit"] }
  };
}

export function buildPlannerFromRuntimeContext(params: {
  paths: ResolvedPaths;
  input: RuntimePlannerBuildInput;
}): RuntimePlannerBuildResult {
  const { paths, input } = params;

  const trace = buildActivationTraceView({
    paths,
    messages: [{ role: "user", content: input.message }],
    sleeveId: input.sleeveId,
    messageId: input.messageId ?? null,
    provenance: input.provenance ?? ["runtime-planner"],
    notes: input.notes ?? ["stage-4 deterministic runtime planner build"]
  });

  const payload = buildRuntimeActivationPayload({
    paths,
    latestUserText: input.message,
    sleeveId: input.sleeveId,
    messageId: input.messageId ?? null,
    provenance: input.provenance ?? ["runtime-planner"],
    notes: input.notes ?? ["stage-4 deterministic runtime planner build"]
  });

  const alignment = loadRuntimeLegendAlignment(paths);
  const alignmentTrace: RuntimeAlignmentTraceEntry[] = [
    ...payload.activeForTurn.loadedStackIds.map((id) => alignRuntimeId("stack", id, alignment)),
    ...payload.activeForTurn.activeBlockIds.map((id) => alignRuntimeId("block", id, alignment)),
    ...payload.activeForTurn.latentBlockIds.map((id) => alignRuntimeId("block", id, alignment)),
    ...payload.activeForTurn.suppressedBlockIds.map((id) => alignRuntimeId("block", id, alignment)),
    ...payload.activeForTurn.activeBlockIds.map((id) => alignRuntimeId("molt", id, alignment)),
    ...payload.activeForTurn.latentBlockIds.map((id) => alignRuntimeId("molt", id, alignment)),
    ...payload.activeForTurn.suppressedBlockIds.map((id) => alignRuntimeId("molt", id, alignment))
  ];

  const doc = buildAlignedPlannerDoc(payload, input, alignmentTrace);
  const structuralIssues = validateUMGPath(doc);
  const semanticResult = resolveUMGPathAgainstLegend(paths, doc);
  const issues = [...structuralIssues, ...semanticResult.issues];
  const manyToOneWarnings = collectManyToOneMappings(alignmentTrace)
    .map((item) => `${item.kind}:${item.emittedId}->${item.resolvedId} mode=${item.mode} targetKind=${item.targetKind} intent=${item.intent} sources=${item.cardinality.emittedSourceCount}`);

  return {
    doc,
    trace,
    payload,
    issues,
    alignmentTrace,
    structural: summarizeIssues(structuralIssues),
    semantic: summarizeIssues(semanticResult.issues),
    plannerTrace: {
      sourceMessage: input.message,
      resolvedSleeveId: doc.sleeveId,
      loadedStacks: [...payload.activeForTurn.loadedStackIds],
      activeBlocks: [...payload.activeForTurn.activeBlockIds],
      latentBlocks: [...payload.activeForTurn.latentBlockIds],
      suppressedBlocks: [...payload.activeForTurn.suppressedBlockIds],
      triggerIds: [...payload.triggerIds],
      cueKinds: trace.detectedCues.map((cue) => cue.kind),
      winnerKeys: doc.winners.map((winner) => winner.key),
      alignedStacks: alignmentTrace.filter((item) => item.kind === "stack").map((item) => `${item.emittedId}->${item.resolvedId}[${item.status}|${item.mode}|${item.targetKind}|${item.intent}]`),
      alignedBlocks: alignmentTrace.filter((item) => item.kind === "block").map((item) => `${item.emittedId}->${item.resolvedId}[${item.status}|${item.mode}|${item.targetKind}|${item.intent}]`),
      manyToOneWarnings
    }
  };
}

export function buildPlannerFromRuntimeMessage(input: RuntimePlannerBuildInput, config?: PluginConfig): RuntimePlannerBuildResult {
  const paths = resolvePaths(config ?? {});
  return buildPlannerFromRuntimeContext({ paths, input });
}
