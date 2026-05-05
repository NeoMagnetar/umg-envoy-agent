import fs from "node:fs";
import path from "node:path";
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

export class UMGResolver {
  constructor(private readonly config: BlockLibraryConfig, private readonly pluginRoot: string) {}

  getSources(): Array<LibrarySourceConfig & { resolvedPath: string; sample_like: boolean }> {
    return [...this.config.umg_block_library.sources]
      .sort((a, b) => b.priority - a.priority)
      .map((source) => ({
        ...source,
        resolvedPath: resolveSourcePath(source.path, this.pluginRoot),
        sample_like: source.name.toLowerCase().includes("sample") || source.path.replaceAll("\\", "/").toLowerCase().includes("public-content/blocks")
      }));
  }

  status(): ResolverStatus {
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

    let source_mode: SourceMode = "NO_LIBRARY_MODE";
    if (existingCanonical && existingSample) source_mode = "MIXED_MODE";
    else if (existingCanonical) source_mode = "FULL_LIBRARY_MODE";
    else if (existingSample) source_mode = "SAMPLE_MODE";

    const warnings = sources
      .filter((source) => !source.exists)
      .map((source) => `Missing configured source: ${source.name} at ${source.path}`);

    return { source_mode, sources, warnings };
  }
}

export function resolveSourcePath(sourcePath: string, pluginRoot: string): string {
  if (/^[A-Za-z]:[\\/]/.test(sourcePath) || sourcePath.startsWith("/")) {
    return path.resolve(sourcePath);
  }
  return path.resolve(pluginRoot, sourcePath);
}
