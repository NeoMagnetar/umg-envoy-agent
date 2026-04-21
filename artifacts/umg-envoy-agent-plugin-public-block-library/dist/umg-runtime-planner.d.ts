import type { ActivationTraceView, RuntimeActivationPayload } from "./activation-runtime.js";
import { type RuntimeAlignmentTraceEntry } from "./umg-runtime-legend-alignment.js";
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
        triggerState: "matched" | "neutral" | "omitted";
    };
}
export declare function buildPlannerFromRuntimeContext(params: {
    paths: ResolvedPaths;
    input: RuntimePlannerBuildInput;
}): RuntimePlannerBuildResult;
export declare function buildPlannerFromRuntimeMessage(input: RuntimePlannerBuildInput, config?: PluginConfig): RuntimePlannerBuildResult;
