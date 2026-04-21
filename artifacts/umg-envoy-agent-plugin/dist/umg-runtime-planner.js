import { buildActivationTraceView, buildRuntimeActivationPayload } from "./activation-runtime.js";
import { resolvePaths } from "./paths.js";
import { buildLegendResolverIndex, resolveUMGPathAgainstLegend } from "./umg-legend-resolver.js";
import { buildUMGPathDocumentFromRuntime } from "./umg-path-builder.js";
import { summarizeValidationIssues, validateUMGPath } from "./umg-path-validator.js";
function summarizeIssues(issues) {
    return summarizeValidationIssues(issues);
}
export function buildPlannerFromRuntimeContext(params) {
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
export function buildPlannerFromRuntimeMessage(input, config) {
    const paths = resolvePaths(config ?? {});
    return buildPlannerFromRuntimeContext({ paths, input });
}
