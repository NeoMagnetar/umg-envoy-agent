import type { BlockLibraryConfig, LibrarySourceConfig, SourceMode } from "./block-library-config.js";
export interface ResolverStatus {
    source_mode: SourceMode;
    sources: Array<{
        name: string;
        path: string;
        exists: boolean;
        canonical: boolean;
        priority: number;
        sample_like: boolean;
    }>;
    warnings: string[];
}
export declare class UMGResolver {
    private readonly config;
    private readonly pluginRoot;
    constructor(config: BlockLibraryConfig, pluginRoot: string);
    getSources(): Array<LibrarySourceConfig & {
        resolvedPath: string;
        sample_like: boolean;
    }>;
    status(): ResolverStatus;
}
export declare function resolveSourcePath(sourcePath: string, pluginRoot: string): string;
