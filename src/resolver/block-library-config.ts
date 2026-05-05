import fs from "node:fs";
import path from "node:path";

export type SourceMode = "SAMPLE_MODE" | "FULL_LIBRARY_MODE" | "MIXED_MODE" | "NO_LIBRARY_MODE";
export type VisibilityMode = "silent" | "compact" | "developer" | "debug" | "audit";
export type DiscoveryMethod = "manifest" | "index" | "fallback_walk" | "generated";
export type ArtifactKind = "molt_block" | "neoblock" | "neostack" | "sleeve" | "tool" | "capability" | "domain" | "manifest" | "schema";
export type SourceKind = "ai_machine" | "human_readable" | "package_lane" | "sample" | "draft" | "unknown";

export interface LibrarySourceConfig {
  name: string;
  kind: "local" | "git" | "package";
  path: string;
  priority: number;
  required: boolean;
  canonical: boolean;
}

export interface BlockLibraryConfig {
  umg_block_library: {
    version: string;
    mode: "auto" | "sample" | "full" | "offline";
    visibility_mode: VisibilityMode;
    sources: LibrarySourceConfig[];
    indexes: {
      enabled: boolean;
      output_dir: string;
      refresh_on_start: boolean;
      allow_stale: boolean;
    };
  };
}

export interface NormalizedArtifact {
  id: string;
  kind: ArtifactKind;
  title?: string;
  description?: string;
  domains: string[];
  capabilities: string[];
  tags: string[];
  status: string;
  runtime_selectable?: boolean;
  support_only?: boolean;
  search_penalty?: boolean;
  source: {
    source_name?: string;
    repo?: string;
    path: string;
    source_kind: SourceKind;
    canonical: boolean;
    canonical_status: "canonical" | "non_canonical" | "sample" | "draft" | "unknown";
    discovery_method: DiscoveryMethod;
  };
  raw?: unknown;
}

function defaultConfig(): BlockLibraryConfig {
  return {
    umg_block_library: {
      version: "0.1.0",
      mode: "auto",
      visibility_mode: "developer",
      sources: [
        {
          name: "packaged_samples",
          kind: "local",
          path: "./public-content/blocks",
          priority: 10,
          required: true,
          canonical: false
        },
        {
          name: "full_umg_block_library",
          kind: "local",
          path: "C:/.openclaw/workspace/UMG-Block-Library",
          priority: 100,
          required: false,
          canonical: true
        }
      ],
      indexes: {
        enabled: true,
        output_dir: "C:/.openclaw/umg/index",
        refresh_on_start: false,
        allow_stale: true
      }
    }
  };
}

export function loadBlockLibraryConfig(configPath?: string): BlockLibraryConfig {
  const candidates = [
    configPath,
    process.env.UMG_BLOCK_LIBRARY_CONFIG,
    path.resolve(process.cwd(), "block-library.config.json"),
    "C:/.openclaw/umg/block-library.config.json"
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue;
    return JSON.parse(fs.readFileSync(candidate, "utf8")) as BlockLibraryConfig;
  }

  return defaultConfig();
}
