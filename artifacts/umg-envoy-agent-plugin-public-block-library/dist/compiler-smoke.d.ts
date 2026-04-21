import { type ActivationTraceView, type CompilerV0TriggerState, type RuntimeActivationPayload } from "./activation-runtime.js";
import type { ResolvedPaths } from "./types.js";
export type CompilerSmokeResult = {
    sampleSleevePath: string;
    sampleSleeveId: string;
    inputMessage: string;
    activationTrace: ActivationTraceView;
    runtimeActivationPayload: RuntimeActivationPayload;
    compilerV0TriggerState: CompilerV0TriggerState;
    compileResult: unknown;
    summary: {
        matchedTriggerIds: string[];
        activeStackIds: string[];
        neoBlockIds: string[];
        hasErrors: boolean;
        traceEventCount: number;
    };
};
export declare function runCompilerSmokeTest(params: {
    paths: ResolvedPaths;
    message: string;
    sleeveId?: string;
}): Promise<CompilerSmokeResult>;
