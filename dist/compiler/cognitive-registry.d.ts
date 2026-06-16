import type { CognitiveGovernance, CognitiveRegistry, CognitiveRegistryQueryResult, NeoStackPlanResult } from "../types.js";
export declare function cognitiveRegistryPath(metaUrl?: string): string;
export declare function loadCognitiveRegistry(metaUrl?: string): CognitiveRegistry;
export declare function queryCognitiveRegistry(input: {
    kind?: string;
    metaUrl?: string;
}): CognitiveRegistryQueryResult;
export declare function planNeoStack(input: {
    intent: string;
    metaUrl?: string;
    registry?: CognitiveRegistry;
}): NeoStackPlanResult;
export declare function validateCognitiveRegistry(registry: CognitiveRegistry): {
    ok: boolean;
    missingMoltRefs: string[];
    missingNeoBlockRefs: string[];
    governanceEntries: CognitiveGovernance[];
};
