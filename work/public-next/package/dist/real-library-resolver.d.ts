export type RealLibraryResolverMode = "public_curated";
export type RealLibraryResolverErrorCode = "HOLD_LIBRARY_ROOT_MISSING" | "HOLD_FORBIDDEN_ROOT_PATH" | "HOLD_RESLEEVER_CONTAMINATION_RISK" | "HOLD_UNSUPPORTED_MODE" | "HOLD_ENTRYPOINT_MISSING" | "HOLD_CATALOG_PARSE_FAILED" | "HOLD_CATALOG_SHAPE_UNKNOWN" | "HOLD_SOURCE_PATH_OUTSIDE_ALLOWLIST" | "HOLD_SOURCE_PATH_POLICY_REGRESSION" | "HOLD_EXISTING_TOOL_SURFACE_REGRESSION" | "HOLD_SLEEVE_ID_REQUIRED" | "HOLD_SLEEVE_NOT_FOUND" | "HOLD_SLEEVE_NOT_LOADABLE_PUBLIC_CURATED" | "HOLD_SLEEVE_SOURCE_PATH_FORBIDDEN" | "HOLD_SLEEVE_SOURCE_PATH_OUTSIDE_ALLOWLIST" | "HOLD_SLEEVE_FILE_MISSING" | "HOLD_SLEEVE_PARSE_FAILED" | "HOLD_SLEEVE_SHAPE_UNKNOWN" | "HOLD_SHALLOW_LOAD_TARGET_REF_REQUIRED_STEP8B" | "HOLD_SHALLOW_LOAD_TARGET_NOT_CLASSIFIED_STEP8B" | "HOLD_SHALLOW_LOAD_TARGET_NOT_AVAILABLE_STEP8B" | "HOLD_SHALLOW_LOAD_TARGET_PATH_FORBIDDEN_STEP8B" | "HOLD_SHALLOW_LOAD_TARGET_PATH_OUTSIDE_ALLOWLIST_STEP8B" | "HOLD_SHALLOW_LOAD_TARGET_FILE_MISSING_STEP8B" | "HOLD_SHALLOW_LOAD_TARGET_PARSE_FAILED_STEP8B" | "HOLD_SHALLOW_LOAD_TARGET_KIND_UNSUPPORTED_STEP8B" | "HOLD_SHALLOW_LOAD_RECURSION_ATTEMPTED_STEP8B" | "HOLD_SHALLOW_LOAD_EXECUTION_ATTEMPTED_STEP8B";
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
    shallowLoadTargetRef?: string;
}
export interface RealLibrarySleeveInspectTrace {
    catalogLoaded?: boolean;
    sleeveMatched?: boolean;
    sourcePathPolicy?: "public_curated_allowlist_only";
    fileLoaded?: boolean;
    parseCheck?: "passed" | "failed";
    recursiveResolution?: "not_performed_step3" | "not_performed_step6" | "not_performed_step7";
    targetFileLoads?: "not_performed" | "not_performed_step7";
    execution?: "not_performed";
    directSourceMode?: "not_implemented";
    publicCuratedPolicy?: "strict";
}
export type RealLibraryTargetAvailabilityStatus = "TARGET_INDEX_ENTRY_FOUND_NOT_LOADED_STEP7" | "TARGET_INDEX_ENTRY_FOUND_PATH_ALLOWED_NOT_LOADED_STEP7" | "TARGET_INDEX_ENTRY_FOUND_PATH_FORBIDDEN_NOT_LOADED_STEP7" | "TARGET_INDEX_ENTRY_FOUND_PATH_MISSING_NOT_LOADED_STEP7" | "TARGET_INDEX_ENTRY_NOT_FOUND_STEP7" | "TARGET_LOOKUP_INDEX_MISSING_STEP7" | "TARGET_LOOKUP_INDEX_READ_FAILED_STEP7" | "TARGET_LOOKUP_INDEX_PARSE_FAILED_STEP7" | "TARGET_LOOKUP_INDEX_SHAPE_UNKNOWN_STEP7" | "TARGET_KIND_UNSUPPORTED_STEP7" | "TARGET_AVAILABILITY_UNKNOWN_STEP7";
export interface RealLibraryTargetAvailabilityIndexDiagnostic {
    path: string;
    exists: boolean;
    parseStatus: "PARSED_JSON" | "PARSE_FAILED" | "READ_FAILED" | "MISSING";
    shapeStatus: "NORMALIZED" | "SHAPE_UNKNOWN" | "NOT_APPLICABLE";
    entryCount: number;
    notes?: string[];
}
export interface RealLibraryTargetAvailabilityRecord {
    rawRef: string;
    inferredKind: RealLibraryReferenceInferredKind;
    moltHint?: string;
    lookupIndexes: string[];
    indexEntryFound: boolean;
    candidateId?: string;
    candidatePath?: string;
    candidatePathAllowed?: boolean;
    targetFileLoaded: false;
    resolutionStatus: RealLibraryTargetAvailabilityStatus;
    warnings: string[];
    errors: string[];
}
export interface RealLibraryTargetAvailabilityMap {
    performed: true;
    mode: "public_curated";
    targetFileLoads: "not_performed_step7";
    recursiveResolution: "not_performed_step7";
    execution: "not_performed";
    indexesLoaded: RealLibraryTargetAvailabilityIndexDiagnostic[];
    indexesMissing: RealLibraryTargetAvailabilityIndexDiagnostic[];
    indexesFailed: RealLibraryTargetAvailabilityIndexDiagnostic[];
    counts: {
        total: number;
        found: number;
        notFound: number;
        allowedPath: number;
        forbiddenPath: number;
        missing: number;
        unsupported: number;
        unknown: number;
        parseFailed: number;
        shapeUnknown: number;
    };
    references: RealLibraryTargetAvailabilityRecord[];
}
export type RealLibraryReferenceClassificationStatus = "CLASSIFIED_NOT_RESOLVED_STEP6" | "CLASSIFIED_UNKNOWN_NOT_RESOLVED_STEP6" | "MALFORMED_REFERENCE_NOT_RESOLVED_STEP6" | "DUPLICATE_REFERENCE_NOT_RESOLVED_STEP6";
export type RealLibraryReferenceInferredKind = "neoblock" | "neostack" | "moltBlock" | "tool" | "gate" | "trigger" | "unknown" | "malformed";
export interface RealLibraryReferenceClassificationRecord {
    rawRef: string;
    sourceField: string;
    declaredBucket: "neoblock" | "neostack" | "moltBlock" | "tool" | "gate" | "trigger";
    inferredKind: RealLibraryReferenceInferredKind;
    moltHint?: string;
    normalizedRef: string;
    namespace?: string;
    name?: string;
    resolutionStatus: RealLibraryReferenceClassificationStatus;
    targetLookupMode: "not_performed";
    duplicateOf?: string;
    warnings: string[];
    errors: string[];
}
export interface RealLibraryReferenceClassificationMap {
    performed: true;
    recursiveResolution: "not_performed_step6";
    targetFileLoads: "not_performed";
    execution: "not_performed";
    directSourceMode: "not_implemented";
    publicCuratedPolicy: "strict";
    counts: {
        total: number;
        neoblock: number;
        neostack: number;
        moltBlock: number;
        tool: number;
        gate: number;
        trigger: number;
        unknown: number;
        malformed: number;
        duplicate: number;
    };
    references: RealLibraryReferenceClassificationRecord[];
}
export interface RealLibraryShallowLoadedTargetSummary {
    topLevelKeys: string[];
    identityKeys: string[];
    metadataKeys: string[];
    neoblockKeys: string[];
    provenanceKeys: string[];
    id?: string;
    kind?: string;
    moltType?: string;
    status?: string;
    contentPreview?: string;
}
export interface RealLibraryTargetShallowLoadResult {
    performed: true;
    requestedRef: string;
    loadedRef: string;
    inferredKind: "neoblock";
    candidatePath: string;
    resolvedPathAllowed: true;
    targetFileLoaded: true;
    targetParseStatus: "PARSED_JSON";
    status: "SHALLOW_TARGET_LOADED_STEP8B";
    recursiveResolution: "RECURSIVE_RESOLUTION_NOT_PERFORMED_STEP8B";
    execution: "EXECUTION_NOT_PERFORMED_STEP8B";
    summary: RealLibraryShallowLoadedTargetSummary;
    warnings: string[];
    errors: string[];
}
export interface RealLibraryRuntimeSummary {
    performed: true;
    mode: "public_curated";
    libraryRoot: string;
    sleeveId: string;
    sleeveLoaded: true;
    explicitReferenceCount: number;
    classifiedReferenceCount: number;
    targetAvailabilityCount: number;
    targetAvailabilityFound: number;
    targetAvailabilityAllowed: number;
    shallowLoadedTargetCount: number;
    shallowLoadedTargets: Array<{
        ref: string;
        kind: string;
        moltType?: string;
        status?: string;
        loadStatus: string;
    }>;
    notLoadedTargetCount: number;
    notLoadedTargets: string[];
    runtimeBoundary: {
        recursiveResolution: "not_performed_step8c";
        execution: "not_performed";
        directSourceMode: "not_enabled";
        archiveFallback: "not_allowed";
        humanLaneMachineLoading: "not_allowed";
        resleeverLoading: "not_allowed";
    };
    nextCapability: "single_target_expansion_or_runtime_dashboard_projection";
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
    explicitReferences: {
        neostacks: string[];
        neoblocks: string[];
        moltBlocks: string[];
        tools: string[];
        gates: string[];
        triggers: string[];
    };
    referenceClassification: RealLibraryReferenceClassificationMap;
    targetAvailability: RealLibraryTargetAvailabilityMap;
    targetShallowLoad?: RealLibraryTargetShallowLoadResult;
    runtimeSummary?: RealLibraryRuntimeSummary | {
        performed: false;
        reason: "targetShallowLoad_not_successful";
    };
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
