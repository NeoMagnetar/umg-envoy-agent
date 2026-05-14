export type RealLibraryResolverMode = "public_curated";
export type RealLibraryResolverErrorCode = "HOLD_LIBRARY_ROOT_MISSING" | "HOLD_FORBIDDEN_ROOT_PATH" | "HOLD_RESLEEVER_CONTAMINATION_RISK" | "HOLD_UNSUPPORTED_MODE" | "HOLD_ENTRYPOINT_MISSING" | "HOLD_CATALOG_PARSE_FAILED" | "HOLD_CATALOG_SHAPE_UNKNOWN" | "HOLD_SOURCE_PATH_OUTSIDE_ALLOWLIST" | "HOLD_SOURCE_PATH_POLICY_REGRESSION" | "HOLD_EXISTING_TOOL_SURFACE_REGRESSION" | "HOLD_SLEEVE_ID_REQUIRED" | "HOLD_SLEEVE_NOT_FOUND" | "HOLD_SLEEVE_NOT_LOADABLE_PUBLIC_CURATED" | "HOLD_SLEEVE_SOURCE_PATH_FORBIDDEN" | "HOLD_SLEEVE_SOURCE_PATH_OUTSIDE_ALLOWLIST" | "HOLD_SLEEVE_FILE_MISSING" | "HOLD_SLEEVE_PARSE_FAILED" | "HOLD_SLEEVE_SHAPE_UNKNOWN";
export type RealLibrarySleeveResolutionStatus = "LOADABLE_PUBLIC_CURATED" | "NOT_LOADABLE_OUTSIDE_PUBLIC_CURATED_ALLOWLIST" | "REJECTED_FORBIDDEN_SOURCE_PATH" | "NO_SOURCE_PATH" | "SOURCE_PATH_MISSING_ON_DISK" | "SOURCE_PATH_SHAPE_UNKNOWN";
export interface RealLibraryResolverError {
    code: RealLibraryResolverErrorCode;
    message: string;
}
export interface RealLibraryCatalogSleeveEntry {
    id?: string;
    name?: string;
    title?: string;
    status?: string;
    sourcePath?: string;
    resolvedSourcePath?: string;
    resolutionStatus: RealLibrarySleeveResolutionStatus;
    warnings: string[];
    errors: RealLibraryResolverError[];
}
export interface RealLibraryResolverTrace {
    forbiddenPathCheck?: "passed" | "failed";
    resleeverCheck?: "passed" | "failed";
    entrypointCheck?: "passed" | "failed";
    parseCheck?: "passed" | "failed";
    catalogShapeCheck?: "passed" | "failed";
    allowlistCheck?: "passed" | "failed";
    sourcePathPolicy?: "public_curated_allowlist_only";
}
export interface RealLibraryResolverResult {
    ok: boolean;
    mode: string;
    libraryRoot: string;
    entrypoint: string;
    catalogLoaded: boolean;
    sleeveCount: number;
    loadableSleeveCount: number;
    rejectedSleeveCount: number;
    unloadableSleeveCount: number;
    sleeves: RealLibraryCatalogSleeveEntry[];
    warnings: string[];
    errors: RealLibraryResolverError[];
    trace: RealLibraryResolverTrace;
}
export interface RealLibraryResolverInput {
    libraryRoot: string;
    mode: string;
}
export interface RealLibrarySleeveInspectInput {
    sleeveId?: string;
    id?: string;
    libraryRoot?: string;
    mode?: string;
}
export interface RealLibrarySleeveInspectTrace {
    catalogLoaded?: boolean;
    sleeveMatched?: boolean;
    sourcePathPolicy?: "public_curated_allowlist_only";
    fileLoaded?: boolean;
    parseCheck?: "passed" | "failed";
    recursiveResolution?: "not_performed_step3";
}
export interface RealLibrarySleeveInspectSummary {
    id?: string;
    name?: string;
    title?: string;
    version?: string;
    status?: string;
    topLevelKeys: string[];
    metadataKeys: string[];
    sleeveKeys: string[];
    referenceCounts: {
        neostacks: number;
        neoblocks: number;
        moltBlocks: number;
        tools: number;
        gates: number;
        triggers: number;
    };
}
export interface RealLibrarySleeveInspectResult {
    ok: boolean;
    mode: string;
    libraryRoot: string;
    sleeveId?: string;
    sourcePath?: string;
    resolvedSourcePath?: string;
    resolutionStatus?: RealLibrarySleeveResolutionStatus;
    loaded: boolean;
    summary: RealLibrarySleeveInspectSummary | null;
    warnings: string[];
    errors: RealLibraryResolverError[];
    trace: RealLibrarySleeveInspectTrace;
}
export declare function resolveRealLibraryPublicCurated(input: RealLibraryResolverInput): RealLibraryResolverResult;
export declare function inspectRealLibraryPublicCuratedSleeve(input: RealLibrarySleeveInspectInput): RealLibrarySleeveInspectResult;
