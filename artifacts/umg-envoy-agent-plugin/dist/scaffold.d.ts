import type { PluginConfig, ResolvedPaths } from "./types.js";
export declare function scaffoldMicroAgentBlock(paths: ResolvedPaths, config: PluginConfig, params: {
    id: string;
    title: string;
    role: string;
    summary: string;
    targetFolder?: string;
}): {
    outputPath: string;
};
