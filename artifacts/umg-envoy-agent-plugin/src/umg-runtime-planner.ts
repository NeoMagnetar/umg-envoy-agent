import type { ActivationTraceView, RuntimeActivationPayload } from "./activation-runtime.js";
import { buildActivationTraceView, buildRuntimeActivationPayload } from "./activation-runtime.js";
import { resolvePaths } from "./paths.js";
import { buildLegendResolverIndex, resolveUMGPathAgainstLegend } from "./umg-legend-resolver.js";
import { buildUMGPathDocumentFromRuntime } from "./umg-path-builder.js";
import { summarizeValidationIssues, validateUMGPath } from "./umg-path-validator.js";
import type { PluginConfig, ResolvedPaths } from "./types.js";
import type { UMGPathDocument, ValidationIssue } from "./umg-path-types.js";

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
  };
}

function summarizeIssues(issues: ValidationIssue[]): { ok: boolean; errors: number; warnings: number } {
  return summarizeValidationIssues(issues);
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

  const legendIndex = buildLegendResolverIndex(paths);
  const doc = buildUMGPathDocumentFromRuntime({
    trace,
    payload,
    options: {
      use: input.use ?? "build_live_runtime_path",
      aim: input.aim ?? "deterministic_runtime_planner_route",
      need: input.need ?? ["structural_validity", "semantic_resolution", "traceable_handoff"],
      sleeveId: input.sleeveId ?? payload.sleeveId,
      legend: {
        stackDisplayOrder: Array.from(legendIndex.stackIds),
        blockToNeoBlock: {},
        neoBlockToStack: {},
        blockRoleMap: {}
      }
    }
  });

  const structuralIssues = validateUMGPath(doc);
  const semanticResult = resolveUMGPathAgainstLegend(paths, doc);
  const issues = [...structuralIssues, ...semanticResult.issues];

  return {
    doc,
    trace,
    payload,
    issues,
    structural: summarizeIssues(structuralIssues),
    semantic: summarizeIssues(semanticResult.issues),
    plannerTrace: {
      sourceMessage: input.message,
      resolvedSleeveId: doc.sleeveId,
      loadedStacks: [...doc.loadedStacks],
      activeBlocks: [...payload.activeForTurn.activeBlockIds],
      latentBlocks: [...payload.activeForTurn.latentBlockIds],
      suppressedBlocks: [...payload.activeForTurn.suppressedBlockIds],
      triggerIds: [...payload.triggerIds],
      cueKinds: trace.detectedCues.map((cue) => cue.kind),
      winnerKeys: doc.winners.map((winner) => winner.key)
    }
  };
}

export function buildPlannerFromRuntimeMessage(input: RuntimePlannerBuildInput, config?: PluginConfig): RuntimePlannerBuildResult {
  const paths = resolvePaths(config ?? {});
  return buildPlannerFromRuntimeContext({ paths, input });
}
