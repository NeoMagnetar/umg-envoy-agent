import type { PluginConfig, ResolvedPaths } from "./types.js";
export declare function createMoltBlock(paths: ResolvedPaths, config: PluginConfig, params: {
    id: string;
    title: string;
    moltType: string;
    summary: string;
    authority?: number;
    tags?: string[];
    targetFolder?: string;
}): {
    outputPath: string;
};
export declare function createNeoBlock(paths: ResolvedPaths, config: PluginConfig, params: {
    id: string;
    title: string;
    summary: string;
    blockIds?: string[];
    targetFolder?: string;
}): {
    outputPath: string;
};
export declare function createNeoStack(paths: ResolvedPaths, config: PluginConfig, params: {
    id: string;
    title: string;
    summary: string;
    memberIds?: string[];
    targetFolder?: string;
}): {
    outputPath: string;
};
export declare function createSleeve(paths: ResolvedPaths, config: PluginConfig, params: {
    id: string;
    title: string;
    stackIds: string[];
    mode?: string;
    bpMode?: string;
    notes?: string;
    targetFolder?: string;
}): {
    outputPath: string;
};
export declare function validateArtifact(payload: any, kind: string): {
    ok: boolean;
    errors: string[];
    warnings: string[];
};
