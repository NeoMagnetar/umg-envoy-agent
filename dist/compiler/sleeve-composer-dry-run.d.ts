import type { CognitiveRegistry, SleeveComposerDryRunResult } from "../types.js";
export declare function composeSleeveDryRun(input: {
    intent: string;
    metaUrl?: string;
    registry?: CognitiveRegistry;
}): SleeveComposerDryRunResult;
