import type { ResolvedPaths } from "./types.js";
import { type TriggerDiagnostics } from "./trigger-hooks.js";
export type RuntimeActivationSet = {
    triggerIds: string[];
    persistentBlockIds: string[];
    transientBlockIds: string[];
    suppressedBlockIds: string[];
    expiredBlockIds: string[];
    latentBlockIds: string[];
    activeBlockIds: string[];
    loadedStackIds: string[];
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
export type DetectedCue = {
    cueId: string;
    kind: "playful" | "analytical" | "formal" | "direct" | "expansive" | "list" | "narrative";
    matchedText: string;
    weight: number;
    cueGroupId: string;
};
export type ResolverDecision = {
    kind: "activation" | "suppression" | "compatibility";
    targetId: string;
    reason: string;
    sourceType: "persistentStack" | "alwaysActiveBlock" | "modulationRule";
    sourceId: string;
    sourcePath?: string;
    ruleId?: string;
};
export type PersistentStateTrace = {
    stackId: string;
    sourceType: "persistentStack";
    sourceId: string;
    sourcePath: string;
    persistentBlockIds: string[];
    alwaysActiveBlockIds: string[];
};
export type CompatibilityOutcome = {
    mode: "competing";
    participants: string[];
    winner: string;
    losers: string[];
    sourceRuleId: string;
    sourcePath: string;
};
export type StateTransition = {
    targetId: string;
    from: "latent" | "transient";
    to: "activeForTurn" | "suppressed" | "expired";
    reason: string;
    sourceRuleId?: string;
    sourcePath?: string;
};
export type ActivationTraceView = {
    latestUserText: string;
    resolverRuleSource: {
        path: string;
        schema: string;
        kind: string;
    };
    detectedCues: DetectedCue[];
    resolverDecisions: ResolverDecision[];
    loadedPersistentState: {
        stacks: PersistentStateTrace[];
    };
    compatibilityOutcomes: CompatibilityOutcome[];
    stateTransitions: StateTransition[];
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
