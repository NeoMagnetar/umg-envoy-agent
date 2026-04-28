export interface PluginConfig {
    allowRuntimeWrites?: boolean;
    contentMode?: "bundled-public" | string;
    compilerMode?: "bundled-adapter" | string;
    debug?: boolean;
    defaultSleeveId?: string;
}
export interface PublicBlock {
    block_id: string;
    kind: "trigger" | "directive" | "instruction" | "subject" | "primary" | "philosophy" | "blueprint";
    title: string;
    text: string;
    authority: number;
    enabled?: boolean;
    tags?: string[];
}
export interface SleeveBlockRef {
    block_id: string;
    enabled?: boolean;
}
export interface PublicSleeve {
    sleeve_id: string;
    title: string;
    snap_id?: string;
    primary_shell_block_id: string;
    block_refs: SleeveBlockRef[];
    strategy?: Record<string, unknown>;
    constraints?: string[];
    context?: Record<string, unknown>;
    values?: Record<string, unknown>;
    format?: Record<string, unknown>;
    tool_requests?: Array<Record<string, unknown>>;
}
export interface RuntimeSpec {
    runtimespec_id: string;
    sleeve_id: string;
    snap_id: string;
    primary_shell_block_id: string;
    active_blocks: string[];
    prompt_parts: Array<{
        block_id: string;
        kind: string;
        authority: number;
        text: string;
    }>;
    strategy: Record<string, unknown>;
    constraints: string[];
    context: Record<string, unknown>;
    values: Record<string, unknown>;
    format: Record<string, unknown>;
    tool_requests: Array<Record<string, unknown>>;
    errors: string[];
    warnings: string[];
}
export interface RuntimeValidationResult {
    ok: boolean;
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export interface CompileSleeveResult {
    ok: boolean;
    sleeveId: string;
    runtimeSpec: RuntimeSpec;
}
export interface BlockLibrarySummary {
    totalBlocks: number;
    byKind: Record<string, number>;
    blockIds: string[];
}
export interface SleeveLoadRequest {
    sleevePath: string;
    libraryRoot?: string;
}
export interface LoadedSleeveFile {
    identity?: {
        artifact_id?: string;
        artifact_type?: string;
        version?: string;
        [key: string]: unknown;
    };
    provenance?: Record<string, unknown>;
    sleeve?: {
        name?: string;
        description?: string;
        dependencies?: {
            sleeve_ids?: string[];
            neostack_ids?: string[];
            bundle_ids?: string[];
            overlay_ids?: string[];
            schema_ids?: string[];
            [key: string]: unknown;
        };
        composition?: {
            neostack_ids?: string[];
            bundle_ids?: string[];
            overlay_ids?: string[];
            local_refs?: unknown[];
            [key: string]: unknown;
        };
        routes?: Array<Record<string, unknown>>;
        runtime?: {
            services?: string[];
            [key: string]: unknown;
        };
        capabilities?: {
            required?: string[];
            optional?: string[];
            [key: string]: unknown;
        };
        activation?: Record<string, unknown>;
        [key: string]: unknown;
    };
    metadata?: Record<string, unknown>;
    [key: string]: unknown;
}
export interface SleeveValidationResult {
    ok: boolean;
    valid: boolean;
    mode: "structural";
    errors: string[];
    warnings: string[];
}
export interface ArtifactResolutionEntry {
    artifactType: "sleeve" | "neostack" | "neoblock" | "overlay" | "bundle" | "schema";
    artifactId: string;
    expectedPath: string | null;
    exists: boolean;
    status: "resolved" | "missing" | "invalid";
}
export interface ArtifactResolutionResult {
    ok: boolean;
    libraryRoot: string;
    entries: ArtifactResolutionEntry[];
    missing: ArtifactResolutionEntry[];
    warnings: string[];
    errors: string[];
}
export interface CompilerInputPreview {
    mode: "canonical-preparation-preview";
    sleeveArtifactId: string | null;
    sleevePath: string;
    libraryRoot: string;
    routeCount: number;
    dependencyCounts: {
        sleeves: number;
        neostacks: number;
        bundles: number;
        overlays: number;
        schemas: number;
    };
    resolvedArtifactCounts: {
        resolved: number;
        missing: number;
        invalid: number;
    };
    stageBoundary: {
        compilerInvoked: false;
        stage8BridgeDeferred: true;
        runtimeOutputsWritten: false;
    };
}
export interface SleeveLoadResult {
    ok: boolean;
    sleevePath: string;
    loadedSleeve?: LoadedSleeveFile;
    validation?: SleeveValidationResult;
    artifactResolution?: ArtifactResolutionResult;
    compilerInputPreview?: CompilerInputPreview;
    warnings: string[];
    errors: string[];
}
