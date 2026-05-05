import fs from "node:fs";
import path from "node:path";
export class UMGResolver {
    config;
    pluginRoot;
    constructor(config, pluginRoot) {
        this.config = config;
        this.pluginRoot = pluginRoot;
    }
    getSources() {
        return [...this.config.umg_block_library.sources]
            .sort((a, b) => b.priority - a.priority)
            .map((source) => ({
            ...source,
            resolvedPath: resolveSourcePath(source.path, this.pluginRoot),
            sample_like: source.name.toLowerCase().includes("sample") || source.path.replaceAll("\\", "/").toLowerCase().includes("public-content/blocks")
        }));
    }
    status() {
        const sources = this.getSources().map((source) => ({
            name: source.name,
            path: source.resolvedPath,
            exists: fs.existsSync(source.resolvedPath),
            canonical: source.canonical,
            priority: source.priority,
            sample_like: source.sample_like
        }));
        const existingCanonical = sources.some((source) => source.exists && source.canonical);
        const existingSample = sources.some((source) => source.exists && source.sample_like);
        let source_mode = "NO_LIBRARY_MODE";
        if (existingCanonical && existingSample)
            source_mode = "MIXED_MODE";
        else if (existingCanonical)
            source_mode = "FULL_LIBRARY_MODE";
        else if (existingSample)
            source_mode = "SAMPLE_MODE";
        const warnings = sources
            .filter((source) => !source.exists)
            .map((source) => `Missing configured source: ${source.name} at ${source.path}`);
        return {
            source_mode,
            configured_sources: sources,
            existing_sources: sources.filter((source) => source.exists).map((source) => source.path),
            missing_sources: sources.filter((source) => !source.exists).map((source) => source.path),
            warnings
        };
    }
}
export function resolveSourcePath(sourcePath, pluginRoot) {
    if (/^[A-Za-z]:[\\/]/.test(sourcePath) || sourcePath.startsWith("/")) {
        return path.resolve(sourcePath);
    }
    return path.resolve(pluginRoot, sourcePath);
}
