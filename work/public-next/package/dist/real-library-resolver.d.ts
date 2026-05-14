export type RealLibraryResolverMode = "public_curated";
export type RealLibraryResolverErrorCode = "HOLD_LIBRARY_ROOT_MISSING" | "HOLD_FORBIDDEN_ROOT_PATH" | "HOLD_RESLEEVER_CONTAMINATION_RISK" | "HOLD_UNSUPPORTED_MODE" | "HOLD_ENTRYPOINT_MISSING" | "HOLD_CATALOG_PARSE_FAILED" | "HOLD_CATALOG_SHAPE_UNKNOWN" | "HOLD_SOURCE_PATH_OUTSIDE_ALLOWLIST";
export interface RealLibraryResolverError {
    code: RealLibraryResolverErrorCode;
    message: string;
}
export interface RealLibraryCatalogSleeveEntry {
    id?: string;
    name?: string;
    status?: string;
    source_path?: string;
    notes?: string;
}
export interface RealLibraryResolverTrace {
    forbiddenPathCheck?: "passed" | "failed";
    resleeverCheck?: "passed" | "failed";
    entrypointCheck?: "passed" | "failed";
    parseCheck?: "passed" | "failed";
    allowlistCheck?: "passed" | "failed";
}
export interface RealLibraryResolverResult {
    ok: boolean;
    mode: string;
    libraryRoot: string;
    entrypoint: string;
    catalogLoaded: boolean;
    sleeveCount: number;
    sleeves: RealLibraryCatalogSleeveEntry[];
    warnings: string[];
    errors: RealLibraryResolverError[];
    trace: RealLibraryResolverTrace;
}
export interface RealLibraryResolverInput {
    libraryRoot: string;
    mode: string;
}
export declare function resolveRealLibraryPublicCurated(input: RealLibraryResolverInput): RealLibraryResolverResult;
