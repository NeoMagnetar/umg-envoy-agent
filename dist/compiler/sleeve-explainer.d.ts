import type { PluginConfig, SleeveExplanationResult } from "../types.js";
export declare function explainSleeveById(input: {
    sleeveId: string;
    config?: PluginConfig;
    metaUrl?: string;
    includeRuntimeSpec?: boolean;
    includeMatrixSummary?: boolean;
}): SleeveExplanationResult;
