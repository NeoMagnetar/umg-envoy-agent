export type SourceMode = "SAMPLE_MODE" | "FULL_LIBRARY_MODE" | "MIXED_MODE" | "NO_LIBRARY_MODE";
export type VisibilityMode = "silent" | "compact" | "developer" | "debug" | "audit";
export type DiscoveryMethod = "manifest" | "index" | "generated_index" | "fallback_walk" | "generated";
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
export declare function loadBlockLibraryConfig(configPath?: string): BlockLibraryConfig;
