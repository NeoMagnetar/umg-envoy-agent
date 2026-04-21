import type { ResolvedPaths } from "./types.js";
import { type TriggerDiagnostics } from "./trigger-hooks.js";
export type RuntimeActivationSet = {
    triggerIds: string[];
    persistentBlockIds: string[];
    transientBlockIds: string[];
    suppressedBlockIds: string[];
    expiredBlockIds: string[];
};
export type RuntimeActivationPayload = {
    sleeveId?: string;
    triggerIds: string[];
    detected: RuntimeActivationSet;
    activeForTurn: RuntimeActivationSet;
    runtimeContext: {
        source: string;
        messageId: string | null;
        provenance: string[];
        notes: string[];
    };
};
export type CompilerV0TriggerState = {
    activeTriggerIds: string[];
};
export type ActivationTraceView = {
    latestUserText: string;
    triggerBlocks: Array<{
        id: string;
        priority: number;
        sourcePath: string;
        phrases: string[];
        matchMode: "includes" | "exact";
        behaviorKind: string;
    }>;
    diagnostics: TriggerDiagnostics & {
        unknownRuntimeTriggerIds: string[];
    };
    detectedCandidates: RuntimeActivationSet;
    runtimeActivationPayload: RuntimeActivationPayload;
    compilerV0TriggerState: CompilerV0TriggerState;
};
export declare function buildRuntimeActivationPayload(params: {
    paths: ResolvedPaths;
    latestUserText: string;
    sleeveId?: string;
    messageId?: string | null;
    provenance?: string[];
    notes?: string[];
}): RuntimeActivationPayload;
export declare function deriveCompilerV0TriggerState(payload: RuntimeActivationPayload, knownTriggerIds?: string[]): CompilerV0TriggerState;
export declare function buildActivationTraceView(params: {
    paths: ResolvedPaths;
    messages?: Array<{
        role?: unknown;
        content?: unknown;
    }>;
    sleeveId?: string;
    messageId?: string | null;
    provenance?: string[];
    notes?: string[];
}): ActivationTraceView;
