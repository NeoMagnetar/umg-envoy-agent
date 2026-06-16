import type { CognitiveRegistry, ComposedSleeveValidatorDryRunResult, SleeveComposerDryRunResult } from "../types.js";
export declare function validateComposedSleeveDryRun(input: {
    intent: string;
    metaUrl?: string;
    registry?: CognitiveRegistry;
    composition?: SleeveComposerDryRunResult;
}): ComposedSleeveValidatorDryRunResult;
