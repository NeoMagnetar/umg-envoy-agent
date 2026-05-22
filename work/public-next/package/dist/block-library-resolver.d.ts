export type BlockLibraryLaneClassification = "MACHINE_LOADABLE_CANDIDATE" | "PUBLIC_CURATED_CANDIDATE" | "REFERENCE_ONLY" | "FORBIDDEN";
export type BlockLibraryHoldCode = "HOLD_LIBRARY_ROOT_REQUIRED" | "HOLD_LIBRARY_ROOT_MISSING" | "HOLD_LIBRARY_ROOT_FORBIDDEN" | "HOLD_LIBRARY_PATH_GRAMMAR_INVALID" | "HOLD_LIBRARY_LANE_FORBIDDEN" | "HOLD_LIBRARY_LANE_REFERENCE_ONLY" | "HOLD_LIBRARY_MANIFEST_MISSING" | "HOLD_LIBRARY_MANIFEST_PARSE_FAILED" | "HOLD_LIBRARY_MANIFEST_SHAPE_UNKNOWN" | "HOLD_MANIFEST_ENTRY_QUERY_REQUIRED" | "HOLD_MANIFEST_ENTRY_NOT_FOUND" | "HOLD_MANIFEST_KIND_UNSUPPORTED" | "HOLD_MANIFEST_INDEX_UNAVAILABLE" | "HOLD_RAW_ENTRY_DUMP_NOT_SUPPORTED" | "HOLD_ENTRY_SOURCE_PATH_FORBIDDEN" | "HOLD_ENTRY_SOURCE_PATH_OUTSIDE_ALLOWLIST" | "HOLD_ENTRY_SHAPE_UNKNOWN" | "HOLD_SHALLOW_LOAD_GATE_QUERY_REQUIRED" | "HOLD_SHALLOW_LOAD_MODE_UNSUPPORTED" | "HOLD_TARGET_FORBIDDEN" | "HOLD_TARGET_OUTSIDE_ALLOWLIST" | "HOLD_TARGET_REFERENCE_ONLY" | "HOLD_TARGET_MISSING_ON_DISK" | "HOLD_TARGET_SHAPE_UNKNOWN" | "HOLD_SHALLOW_LOAD_GATE_UNAVAILABLE" | "HOLD_SHALLOW_SINGLE_LOAD_QUERY_REQUIRED" | "HOLD_SHALLOW_SINGLE_LOAD_MODE_UNSUPPORTED" | "HOLD_RAW_TARGET_DUMP_NOT_SUPPORTED" | "HOLD_TARGET_PARSE_FAILED" | "HOLD_SHALLOW_SINGLE_LOAD_UNAVAILABLE" | "HOLD_SHALLOW_SUMMARY_PROFILE_UNSUPPORTED" | "HOLD_SHALLOW_SUMMARY_NORMALIZATION_UNAVAILABLE" | "HOLD_NEOBLOCK_INSPECT_QUERY_REQUIRED" | "HOLD_TARGET_NOT_NEOBLOCK" | "HOLD_NEOBLOCK_INSPECT_UNAVAILABLE" | "HOLD_VISIBLE_MOLT_EXTRACT_QUERY_REQUIRED" | "HOLD_VISIBLE_MOLT_NOT_FOUND" | "HOLD_VISIBLE_MOLT_EXTRACT_UNAVAILABLE" | "HOLD_MOLT_MAP_FRAGMENT_QUERY_REQUIRED" | "HOLD_MOLT_MAP_FRAGMENT_PROJECTION_FORMAT_UNSUPPORTED" | "HOLD_MOLT_MAP_FRAGMENT_UNAVAILABLE" | "HOLD_MOLT_MAP_COMPOSE_QUERY_REQUIRED" | "HOLD_MOLT_MAP_COMPOSE_INPUT_LIMIT_EXCEEDED" | "HOLD_MOLT_MAP_COMPOSE_PROJECTION_FORMAT_UNSUPPORTED" | "HOLD_MOLT_MAP_COMPOSE_CONFLICT_POLICY_UNSUPPORTED" | "HOLD_MOLT_MAP_COMPOSE_UNAVAILABLE" | "HOLD_RESPONSE_ENVELOPE_FRAGMENT_QUERY_REQUIRED" | "HOLD_RESPONSE_ENVELOPE_FRAGMENT_PROJECTION_FORMAT_UNSUPPORTED" | "HOLD_RESPONSE_ENVELOPE_FRAGMENT_COMPOSER_NOT_NORMALIZED" | "HOLD_RESPONSE_ENVELOPE_FRAGMENT_COMPOSER_FAILED" | "HOLD_RESPONSE_ENVELOPE_FRAGMENT_UNAVAILABLE" | "HOLD_ACTIVE_STACK_PROJECTION_FORMAT_UNSUPPORTED" | "HOLD_ACTIVE_STACK_SOURCE_NOT_NORMALIZED" | "HOLD_ACTIVE_STACK_PROJECTION_UNAVAILABLE" | "HOLD_RESPONSE_ENVELOPE_ACTIVE_STACK_PROJECTION_FAILED" | "HOLD_RESPONSE_ENVELOPE_ACTIVE_STACK_PROJECTION_NOT_NORMALIZED" | "HOLD_SLEEVE_GRAPH_INDEX_PROJECTION_FORMAT_UNSUPPORTED" | "HOLD_SLEEVE_GRAPH_INDEX_SOURCE_CATALOG_UNSUPPORTED" | "HOLD_SLEEVE_GRAPH_INDEX_SLEEVE_NOT_FOUND" | "HOLD_SLEEVE_GRAPH_INDEX_CATALOG_NOT_FOUND" | "HOLD_SLEEVE_GRAPH_INDEX_CATALOG_PARSE_FAILED" | "HOLD_SLEEVE_GRAPH_INDEX_UNAVAILABLE" | "HOLD_ACTIVE_STACK_PROJECTION_RECURSION_GUARD";
export interface BlockLibraryLaneStatus {
    lane: string;
    classification: BlockLibraryLaneClassification;
    exists: boolean;
    loadPolicy: "readonly_allowed" | "not_machine_loaded" | "do_not_load";
    notes: string[];
}
export type RuntimeSleeveSessionStatus = "NO_ACTIVE_SLEEVE" | "SLEEVE_SELECTED" | "SLEEVE_ACTIVE" | "SLEEVE_HELD" | "SLEEVE_CLEARED" | "SESSION_ERROR";
export type RuntimeSleeveSessionPersistenceMode = "memory_only" | "request_scoped" | "disabled";
export type RuntimeSleeveSelectionSource = "explicit_user_request" | "explicit_agent_request" | "runtime_default" | "test_fixture" | "unknown";
export type RuntimeSleeveSessionStateV0 = {
    outputContract: {
        contractId: "umg.runtime.sleeve_session.v1";
        contractStatus: "NORMALIZED";
    };
    sessionId: string;
    sessionStatus: RuntimeSleeveSessionStatus;
    selectedSleeveId: string | null;
    activeSleeveId: string | null;
    selectionSource: RuntimeSleeveSelectionSource;
    selectionReason: string | null;
    runtimeEligible: boolean;
    selectionTimestamp: string | null;
    expiresAt: string | null;
    persistenceMode: RuntimeSleeveSessionPersistenceMode;
    automaticResponseTakeover: false;
    directSourceEnabled: false;
    lastInspectionSummary: unknown;
    lastRuntimePreviewSummary: unknown;
    warnings: string[];
    errors: Array<{
        code: string;
        message: string;
    }>;
    audit: Record<string, unknown>;
    trace: string[];
    previousSleeveId?: string | null;
};
export interface BlockLibraryStatusResult {
    ok: boolean;
    version: string;
    entrypoint: string;
    surface: string;
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    libraryRoot: string;
    rootExists: boolean;
    laneSummary: {
        machineLoadableCandidateCount: number;
        publicCuratedCandidateCount: number;
        referenceOnlyCount: number;
        forbiddenCount: number;
    };
    lanes: BlockLibraryLaneStatus[];
    warnings: string[];
    errors: Array<{
        code: BlockLibraryHoldCode;
        message: string;
    }>;
}
export type BlockLibraryManifestStatus = "PRESENT_PARSED_NORMALIZED" | "PRESENT_PARSED_SHAPE_UNKNOWN" | "PRESENT_PARSE_FAILED" | "MISSING_OPTIONAL" | "MISSING_REQUIRED" | "FORBIDDEN_PATH" | "OUTSIDE_ALLOWLIST";
export interface BlockLibraryManifestEntry {
    manifestName: string;
    entryId: string | null;
    title?: string | null;
    kind?: string | null;
    targetPath: string | null;
    targetClassification: "ALLOWED_TARGET" | "MISSING_TARGET" | "FORBIDDEN_TARGET" | "OUTSIDE_ALLOWLIST_TARGET" | "NO_TARGET_PATH";
    targetExists: boolean;
    notes: string[];
}
export interface BlockLibraryManifestRecord {
    manifestName: string;
    relativePath: string;
    required: boolean;
    status: BlockLibraryManifestStatus;
    exists: boolean;
    entryCount: number;
    normalizedEntryCount: number;
    entries: BlockLibraryManifestEntry[];
    notes: string[];
}
export interface BlockLibraryManifestIndexResult {
    ok: boolean;
    version: string;
    entrypoint: string;
    surface: string;
    mode: "real_block_library_manifest_index";
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    libraryRoot: string;
    rootExists: boolean;
    summary: {
        manifestCount: number;
        parsedManifestCount: number;
        normalizedManifestCount: number;
        missingManifestCount: number;
        parseFailedManifestCount: number;
        shapeUnknownManifestCount: number;
        totalEntryCount: number;
        allowedTargetEntryCount: number;
        missingTargetEntryCount: number;
        forbiddenTargetEntryCount: number;
        outsideAllowlistTargetEntryCount: number;
    };
    manifests: BlockLibraryManifestRecord[];
    warnings: string[];
    errors: Array<{
        code: BlockLibraryHoldCode;
        message: string;
    }>;
}
export type BlockLibraryManifestKind = "all" | "neoblock" | "moltblock" | "neostack" | "gate" | "sleeve" | "compiler" | "public_curated_catalog";
export interface BlockLibraryManifestEntryLookupMatch {
    id: string | null;
    kind: string;
    title: string | null;
    manifestKind: BlockLibraryManifestKind;
    manifestPath: string;
    sourcePath: string | null;
    targetExists: boolean;
    targetPolicy: "ALLOWED_NOT_LOADED" | "MISSING_ON_DISK" | "FORBIDDEN_TARGET" | "OUTSIDE_ALLOWLIST_TARGET" | "REFERENCE_ONLY_TARGET" | "SHAPE_UNKNOWN" | "NO_SOURCE_PATH";
    resolutionStatus: string;
    loadStatus: "not_loaded" | "shallow_loaded";
    warnings: string[];
}
export interface BlockLibraryManifestEntryLookupResult {
    ok: boolean;
    version: string;
    entrypoint: string;
    surface: string;
    mode: "real_block_library_manifest_entry_lookup";
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    query: {
        entryId: string | null;
        sourcePath: string | null;
        manifestKind: BlockLibraryManifestKind;
    };
    matchCount: number;
    matches: BlockLibraryManifestEntryLookupMatch[];
    manifestSummary?: {
        manifestCount: number;
        parsedManifestCount: number;
        normalizedManifestCount: number;
        missingManifestCount: number;
        parseFailedManifestCount: number;
        shapeUnknownManifestCount: number;
        totalEntryCount: number;
    };
    warnings: string[];
    errors: Array<{
        code: BlockLibraryHoldCode;
        message: string;
    }>;
}
export type BlockLibraryShallowLoadDecision = "ALLOW_SHALLOW_LOAD" | "DENY_FORBIDDEN_TARGET" | "DENY_OUTSIDE_ALLOWLIST" | "DENY_REFERENCE_ONLY_TARGET" | "DENY_TARGET_MISSING" | "DENY_ENTRY_NOT_FOUND" | "DENY_QUERY_REQUIRED" | "DENY_UNSUPPORTED_MANIFEST_KIND" | "DENY_UNSUPPORTED_LOAD_MODE" | "DENY_SHAPE_UNKNOWN";
export type BlockLibraryNextSafeAction = "NEXT_SAFE_ACTION_SHALLOW_LOAD_ALLOWED" | "NEXT_SAFE_ACTION_DO_NOT_LOAD" | "NEXT_SAFE_ACTION_FIX_INDEX_OR_TARGET" | "NEXT_SAFE_ACTION_USE_REFERENCE_ONLY_VIEW" | "NEXT_SAFE_ACTION_REVIEW_POLICY";
export interface BlockLibraryTargetShallowLoadGateResult {
    ok: boolean;
    version: string;
    entrypoint: string;
    mode: "real_block_library_target_shallow_load_gate";
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    query: {
        entryId: string | null;
        sourcePath: string | null;
        manifestKind: BlockLibraryManifestKind;
        intendedLoadMode: string;
    };
    gate: {
        decision: BlockLibraryShallowLoadDecision;
        canShallowLoad: boolean;
        reasonCodes: string[];
        nextSafeAction: BlockLibraryNextSafeAction;
        payloadLoaded: false;
        recursiveLoad: false;
    };
    target: BlockLibraryManifestEntryLookupMatch | null;
    entry: BlockLibraryManifestEntryLookupMatch | null;
    warnings: string[];
    errors: Array<{
        code: BlockLibraryHoldCode;
        message: string;
    }>;
}
export interface BlockLibraryTargetShallowLoadSingleResult {
    ok: boolean;
    version: string;
    entrypoint: string;
    mode: "real_block_library_target_shallow_load_single";
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    query: {
        entryId: string | null;
        sourcePath: string | null;
        manifestKind: BlockLibraryManifestKind;
        loadMode: string;
    };
    gate: {
        decision: BlockLibraryShallowLoadDecision;
        canShallowLoad: boolean;
        reasonCodes: string[];
        nextSafeAction: BlockLibraryNextSafeAction;
        payloadLoaded: boolean;
        recursiveLoad: false;
    };
    target: (BlockLibraryManifestEntryLookupMatch & {
        absolutePath: string | null;
        loadStatus: "not_loaded" | "shallow_loaded";
    }) | null;
    payload: {
        parseStatus: "PARSED_JSON" | "PARSE_FAILED";
        shapeStatus: "SHALLOW_SUMMARY_READY" | "SHALLOW_SUMMARY_UNAVAILABLE";
        topLevelKeys: string[];
        identity: Record<string, unknown>;
        metadata: Record<string, unknown>;
        provenance: Record<string, unknown>;
        contentPreview: string | null;
        referenceSummary: Record<string, number>;
        rawObject?: Record<string, unknown>;
    } | null;
    warnings: string[];
    errors: Array<{
        code: BlockLibraryHoldCode;
        message: string;
    }>;
}
export interface BlockLibraryTargetShallowSummaryNormalizeResult {
    ok: boolean;
    version: string;
    entrypoint: string;
    mode: "real_block_library_target_shallow_summary_normalize";
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    query: {
        entryId: string | null;
        sourcePath: string | null;
        manifestKind: BlockLibraryManifestKind;
        summaryProfile: string;
    };
    gate: {
        decision: BlockLibraryShallowLoadDecision;
        canShallowLoad: boolean;
        reasonCodes: string[];
        nextSafeAction: BlockLibraryNextSafeAction;
        payloadLoaded: boolean;
        recursiveLoad: false;
    };
    target: (BlockLibraryManifestEntryLookupMatch & {
        absolutePath: string | null;
        loadStatus: "not_loaded" | "shallow_loaded";
    }) | null;
    payload: {
        parseStatus: "PARSED_JSON" | "PARSE_FAILED";
        shapeStatus: "SHALLOW_SUMMARY_NORMALIZED" | "SHALLOW_SUMMARY_UNAVAILABLE";
        topLevelKeys: string[];
    } | null;
    normalizedSummary: {
        summaryStatus: "NORMALIZED" | "UNAVAILABLE";
        artifactKind: "neoblock" | "moltblock" | "neostack" | "sleeve" | "gate" | "compiler" | "unknown";
        artifactId: string | null;
        displayName: string | null;
        moltType: string | null;
        role: string | null;
        status: string | null;
        identity: Record<string, unknown> | null;
        metadata: Record<string, unknown> | null;
        content: Record<string, unknown> | null;
        moltSummary: Record<string, unknown> | null;
        referenceSummary: {
            blockRefs: number;
            neoblockRefs: number;
            neostackRefs: number;
            moltBlockRefs: number;
            toolRequests: number;
            gates: number;
            triggers: number;
            unknownRefs: number;
            resolvedRefs: number;
            loadedRefs: number;
        } | null;
        provenance: Record<string, unknown> | null;
        contentPreview: string | null;
        limitations: string[];
    } | null;
    warnings: string[];
    errors: Array<{
        code: BlockLibraryHoldCode;
        message: string;
    }>;
}
export interface BlockLibraryNeoblockInspectResult {
    ok: boolean;
    version: string;
    entrypoint: string;
    mode: "real_block_library_neoblock_inspect";
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    query: {
        neoblockId: string | null;
        entryId: string | null;
        sourcePath: string | null;
        manifestKind: BlockLibraryManifestKind;
        summaryProfile: string;
    };
    gate: {
        decision: BlockLibraryShallowLoadDecision;
        canShallowLoad: boolean;
        reasonCodes: string[];
        nextSafeAction: BlockLibraryNextSafeAction;
        payloadLoaded: boolean;
        recursiveLoad: false;
    };
    target: (BlockLibraryManifestEntryLookupMatch & {
        absolutePath: string | null;
        loadStatus: "not_loaded" | "shallow_loaded";
    }) | null;
    neoblockInspection: {
        inspectStatus: "NEOBLOCK_INSPECTED" | "NEOBLOCK_DENIED_BY_GATE" | "NEOBLOCK_NOT_FOUND" | "NEOBLOCK_TARGET_NOT_NEOBLOCK" | "NEOBLOCK_TARGET_FORBIDDEN" | "NEOBLOCK_TARGET_OUTSIDE_ALLOWLIST" | "NEOBLOCK_SHAPE_UNKNOWN" | "NEOBLOCK_PARSE_FAILED";
        neoblockId: string | null;
        artifactKind: string | null;
        moltType: string | null;
        role: string | null;
        title: string | null;
        status: string | null;
        identity: Record<string, unknown> | null;
        metadata: Record<string, unknown> | null;
        contentSummary: Record<string, unknown> | null;
        moltSummary: Record<string, unknown> | null;
        referenceSummary: {
            blockRefs: number;
            neoblockRefs: number;
            neostackRefs: number;
            moltBlockRefs: number;
            toolRequests: number;
            gates: number;
            triggers: number;
            unknownRefs: number;
            resolvedRefs: number;
            loadedRefs: number;
        } | null;
        provenance: Record<string, unknown> | null;
        contentPreview: string | null;
        limitations: string[];
    } | null;
    warnings: string[];
    errors: Array<{
        code: BlockLibraryHoldCode;
        message: string;
    }>;
}
export interface BlockLibraryMoltblockVisibleExtractResult {
    ok: boolean;
    version: string;
    entrypoint: string;
    mode: "real_block_library_moltblock_visible_extract";
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    query: {
        neoblockId: string | null;
        entryId: string | null;
        sourcePath: string | null;
        manifestKind: BlockLibraryManifestKind;
        summaryProfile: string;
    };
    sourceNeoblock: {
        inspectStatus: "NEOBLOCK_INSPECTED" | "NEOBLOCK_DENIED_BY_GATE" | "NEOBLOCK_NOT_FOUND" | "NEOBLOCK_TARGET_NOT_NEOBLOCK" | "NEOBLOCK_TARGET_FORBIDDEN" | "NEOBLOCK_TARGET_OUTSIDE_ALLOWLIST" | "NEOBLOCK_SHAPE_UNKNOWN" | "NEOBLOCK_PARSE_FAILED";
        neoblockId: string | null;
        artifactKind: string | null;
        moltType: string | null;
        payloadLoaded: boolean;
        recursiveLoad: false;
    } | null;
    visibleMoltExtraction: {
        extractStatus: "VISIBLE_MOLT_EXTRACTED" | "VISIBLE_MOLT_NOT_FOUND" | "VISIBLE_MOLT_DENIED_BY_GATE" | "VISIBLE_MOLT_SOURCE_NOT_NEOBLOCK" | "VISIBLE_MOLT_SOURCE_FORBIDDEN" | "VISIBLE_MOLT_SOURCE_OUTSIDE_ALLOWLIST" | "VISIBLE_MOLT_SHAPE_UNKNOWN" | "VISIBLE_MOLT_PARSE_FAILED";
        moltBlockId: string | null;
        sourceNeoblockId: string | null;
        moltType: string | null;
        moltTypeSource: "neoblock_inspection" | null;
        role: string | null;
        title: string | null;
        status: string | null;
        contentSummary: Record<string, unknown> | null;
        moltFields: Record<string, unknown>;
        instructionLikeFields: Record<string, unknown>;
        triggerLikeFields: Record<string, unknown>;
        blueprintLikeFields: Record<string, unknown>;
        philosophyLikeFields: Record<string, unknown>;
        subjectLikeFields: Record<string, unknown>;
        primaryLikeFields: Record<string, unknown>;
        referenceSummary: {
            blockRefs: number;
            neoblockRefs: number;
            neostackRefs: number;
            moltBlockRefs: number;
            toolRequests: number;
            gates: number;
            triggers: number;
            unknownRefs: number;
            resolvedRefs: number;
            loadedRefs: number;
        } | null;
        contentPreview: string | null;
        limitations: string[];
    } | null;
    warnings: string[];
    errors: Array<{
        code: BlockLibraryHoldCode;
        message: string;
    }>;
}
export interface BlockLibraryMoltMapFragmentResult {
    ok: boolean;
    version: string;
    entrypoint: string;
    mode: "real_block_library_molt_map_fragment";
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    query: {
        neoblockId: string | null;
        entryId: string | null;
        sourcePath: string | null;
        manifestKind: BlockLibraryManifestKind;
        summaryProfile: string;
        projectionFormat: "nl" | "json" | "both";
    };
    sourceNeoblock: {
        inspectStatus: "NEOBLOCK_INSPECTED" | "NEOBLOCK_DENIED_BY_GATE" | "NEOBLOCK_NOT_FOUND" | "NEOBLOCK_TARGET_NOT_NEOBLOCK" | "NEOBLOCK_TARGET_FORBIDDEN" | "NEOBLOCK_TARGET_OUTSIDE_ALLOWLIST" | "NEOBLOCK_SHAPE_UNKNOWN" | "NEOBLOCK_PARSE_FAILED";
        neoblockId: string | null;
        artifactKind: string | null;
        moltType: string | null;
        payloadLoaded: boolean;
        recursiveLoad: false;
    } | null;
    visibleMoltExtraction: {
        extractStatus: "VISIBLE_MOLT_EXTRACTED" | "VISIBLE_MOLT_NOT_FOUND" | "VISIBLE_MOLT_DENIED_BY_GATE" | "VISIBLE_MOLT_SOURCE_NOT_NEOBLOCK" | "VISIBLE_MOLT_SOURCE_FORBIDDEN" | "VISIBLE_MOLT_SOURCE_OUTSIDE_ALLOWLIST" | "VISIBLE_MOLT_SHAPE_UNKNOWN" | "VISIBLE_MOLT_PARSE_FAILED";
        sourceNeoblockId: string | null;
        moltBlockId: string | null;
        moltType: string | null;
        moltTypeSource: "neoblock_inspection" | null;
        triggerEvaluation: "not_performed";
    } | null;
    moltMapFragment: {
        fragmentStatus: "MOLT_MAP_FRAGMENT_READY" | "MOLT_MAP_FRAGMENT_DENIED_BY_GATE" | "MOLT_MAP_FRAGMENT_VISIBLE_MOLT_NOT_FOUND" | "MOLT_MAP_FRAGMENT_SOURCE_NOT_NEOBLOCK" | "MOLT_MAP_FRAGMENT_SOURCE_FORBIDDEN" | "MOLT_MAP_FRAGMENT_SOURCE_OUTSIDE_ALLOWLIST" | "MOLT_MAP_FRAGMENT_SHAPE_UNKNOWN" | "MOLT_MAP_FRAGMENT_PARSE_FAILED";
        fragmentKind: "single_visible_molt";
        sourceNeoblockId: string | null;
        moltBlockId: string | null;
        moltType: string | null;
        moltMapField: "Trigger" | "Directive" | "Instruction" | "Subject" | "Primary" | "Philosophy" | "Blueprint" | null;
        fieldValue: string | null;
        fieldSource: "visible_molt_extraction" | null;
        contentPreview: string | null;
        referenceSummary: {
            blockRefs: number;
            neoblockRefs: number;
            neostackRefs: number;
            moltBlockRefs: number;
            toolRequests: number;
            gates: number;
            triggers: number;
            unknownRefs: number;
            resolvedRefs: number;
            loadedRefs: number;
        } | null;
        provenance: {
            manifestPath: string | null;
            sourcePath: string | null;
            loadedFrom: "single_shallow_target" | null;
            backfillStatus: "SOURCE_PATH_BACKFILLED_FROM_MANIFEST_ENTRY" | "SOURCE_PATH_PROVIDED_BY_QUERY" | "SOURCE_PATH_NOT_AVAILABLE" | "SOURCE_PATH_BLOCKED_BY_POLICY";
        } | null;
        limitations: string[];
    } | null;
    nlProjection: string | null;
    warnings: string[];
    errors: Array<{
        code: BlockLibraryHoldCode;
        message: string;
    }>;
}
export interface BlockLibraryMoltMapComposeResult {
    ok: boolean;
    version: string;
    entrypoint: string;
    mode: "real_block_library_molt_map_compose";
    outputContract: {
        contractId: "umg.molt_map.compose.v1";
        contractStatus: "NORMALIZED";
        fieldOrder: Array<"Trigger" | "Directive" | "Instruction" | "Subject" | "Primary" | "Philosophy" | "Blueprint">;
        missingFieldValue: "n/a";
        sourceMode: "explicit_neoblock_ids";
        recursiveLoad: false;
        fullLibraryScan: false;
    };
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    query: {
        neoblockIds: string[];
        manifestKind: BlockLibraryManifestKind;
        summaryProfile: string;
        projectionFormat: "nl" | "json" | "both";
        conflictPolicy: "first_wins" | "report_only";
    };
    composition: {
        compositionStatus: "MOLT_MAP_COMPOSED" | "MOLT_MAP_COMPOSED_WITH_MISSING_FIELDS" | "MOLT_MAP_COMPOSED_WITH_DENIED_FRAGMENTS" | "MOLT_MAP_COMPOSED_WITH_CONFLICTS" | "MOLT_MAP_COMPOSE_DENIED" | "MOLT_MAP_COMPOSE_FAILED";
        compositionKind: "explicit_fragment_list";
        fieldOrder: Array<"Trigger" | "Directive" | "Instruction" | "Subject" | "Primary" | "Philosophy" | "Blueprint">;
        requestedCount: number;
        fragmentCount: number;
        composedFieldCount: number;
        missingFieldCount: number;
        duplicateFieldCount: number;
        deniedFragmentCount: number;
        recursiveLoad: false;
        fullLibraryScan: false;
        activeSleeveInspection: false;
        neostackInspection: false;
        triggerEvaluation: "not_performed";
        execution: "not_performed";
    };
    moltMap: Record<"Trigger" | "Directive" | "Instruction" | "Subject" | "Primary" | "Philosophy" | "Blueprint", {
        value: string;
        fieldStatus: "FIELD_COMPOSED" | "FIELD_MISSING" | "FIELD_CONFLICT_REPORTED" | "FIELD_DENIED_FRAGMENT";
        sourceNeoblockId: string | null;
        moltType: string | null;
        fragmentStatus: string | null;
        provenance: Record<string, unknown> | null;
        contentPreview: string | null;
        limitations: string[];
    }>;
    fragmentResults: Array<{
        requestedId: string;
        ok: boolean;
        field: string | null;
        moltType: string | null;
        fragmentStatus: "MOLT_MAP_FRAGMENT_READY" | "MOLT_MAP_FRAGMENT_DENIED" | null;
        hold: BlockLibraryHoldCode | null;
        errorCodes: BlockLibraryHoldCode[];
        sourcePath: string | null;
        manifestPath: string | null;
        payloadLoaded: boolean;
        recursiveLoad: false;
        execution: "not_performed";
    }>;
    conflicts: Array<{
        field: string;
        chosenNeoblockId: string | null;
        ignoredNeoblockIds: string[];
    }>;
    nlProjection: string | null;
    audit: {
        normalizationStatus: "COMPOSER_OUTPUT_NORMALIZED";
        contractId: "umg.molt_map.compose.v1";
        inputMode: "explicit_neoblock_ids";
        fullLibraryScan: "not_performed";
        recursiveLoad: "not_performed";
        referencedTargetLoading: "not_performed";
        externalMoltBlockFileLoading: "not_performed";
        activeSleeveInspection: "not_performed";
        neostackInspection: "not_performed";
        triggerEvaluation: "not_performed";
        execution: "not_performed";
        directSource: "not_enabled";
        libraryMutation: "not_performed";
    };
    warnings: string[];
    errors: Array<{
        code: BlockLibraryHoldCode;
        message: string;
    }>;
}
export interface BlockLibraryResponseEnvelopeFragmentResult {
    ok: boolean;
    version: string;
    entrypoint: string;
    mode: "real_block_library_response_envelope_fragment";
    outputContract: {
        contractId: "umg.response_envelope.fragment.v1";
        contractStatus: "NORMALIZED";
        sourceContractId: "umg.molt_map.compose.v1";
        sourceMode: "explicit_neoblock_ids";
        activeStackSourceContract: "umg.active_stack.projection.v1";
        activeStackSourceStatus: "NORMALIZED" | "BYPASSED_BY_QUERY";
        automaticResponseTakeover: false;
        recursiveLoad: false;
        fullLibraryScan: false;
    };
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    query: {
        neoblockIds: string[];
        project: string;
        currentState: string;
        activeTool: string;
        formalResponseContent: string;
        projectionFormat: "nl" | "json" | "both";
        includeMetadata: boolean;
        includeAudit: boolean;
        activeSleeve: string;
        activeStackBoundary: string;
        includeActiveStackProjection: boolean;
    };
    sourceComposition: BlockLibraryMoltMapComposeResult | null;
    sourceActiveStackProjection: BlockLibraryActiveStackProjectionResult | null;
    responseEnvelopeFragment: {
        fragmentStatus: "RESPONSE_ENVELOPE_FRAGMENT_READY" | "RESPONSE_ENVELOPE_FRAGMENT_READY_WITH_SOURCE_WARNINGS" | "RESPONSE_ENVELOPE_FRAGMENT_DENIED" | "RESPONSE_ENVELOPE_FRAGMENT_COMPOSER_FAILED" | "RESPONSE_ENVELOPE_FRAGMENT_UNAVAILABLE";
        fragmentKind: "explicit_molt_map_envelope";
        sections: {
            activeStack: Record<string, unknown>;
            envoyIntuition: Record<string, unknown>;
            currentContextMoltMap: Record<string, unknown>;
            formalResponseContent: Record<string, unknown>;
            metadata: Record<string, unknown>;
            audit: Record<string, unknown>;
        };
        sectionOrder: Array<"Active Stack" | "Envoy Intuition" | "Current Context — MOLT Map" | "Formal Response Content" | "Metadata">;
        automaticResponseTakeover: false;
        limitations: string[];
    } | null;
    nlProjection: string | null;
    audit: Record<string, unknown>;
    warnings: string[];
    errors: Array<{
        code: BlockLibraryHoldCode;
        message: string;
    }>;
}
type InternalCallContext = {
    caller?: string;
    depth?: number;
    disableEnvelopeSourceContext?: boolean;
};
export interface BlockLibraryActiveStackProjectionResult {
    ok: boolean;
    version: string;
    entrypoint: string;
    mode: "real_block_library_active_stack_projection";
    outputContract: {
        contractId: "umg.active_stack.projection.v1";
        contractStatus: "NORMALIZED";
        sourceMode: "explicit_runtime_state";
        automaticResponseTakeover: false;
        activeSleeveDiscovery: false;
        neostackInspection: false;
        recursiveLoad: false;
        fullLibraryScan: false;
    };
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    query: {
        project: string;
        currentState: string;
        activeTool: string;
        sourceTool: string;
        neoblockIds: string[];
        activeSleeve: string;
        boundary: string;
        projectionFormat: "nl" | "json" | "both";
        includeAudit: boolean;
    };
    activeStackProjection: {
        projectionStatus: "ACTIVE_STACK_PROJECTION_READY" | "ACTIVE_STACK_PROJECTION_READY_WITH_SOURCE_CONTEXT" | "ACTIVE_STACK_PROJECTION_DENIED" | "ACTIVE_STACK_PROJECTION_SOURCE_NOT_NORMALIZED" | "ACTIVE_STACK_PROJECTION_UNAVAILABLE";
        project: string;
        currentState: string;
        runtimeVersion: string;
        officialEntrypoint: string;
        activeTool: string;
        sourceTool: string;
        sourceContract: string;
        moltMapSourceContract: string;
        activeSleeve: string;
        neoStackState: "not_inspected";
        graphState: "not_inspected";
        boundary: string;
        automaticResponseTakeover: false;
        sourceContextStatus?: "SOURCE_CONTEXT_NORMALIZED" | "SOURCE_CONTEXT_NOT_REQUESTED" | "SOURCE_CONTEXT_NOT_EVALUATED_TO_AVOID_RECURSION";
        limitations: string[];
    } | null;
    sourceEnvelope: BlockLibraryResponseEnvelopeFragmentResult | null;
    sourceComposition: BlockLibraryMoltMapComposeResult | null;
    nlProjection: string | null;
    audit: {
        normalizationStatus: "ACTIVE_STACK_PROJECTION_NORMALIZED";
        contractId: "umg.active_stack.projection.v1";
        inputMode: "explicit_runtime_state";
        automaticResponseTakeover: "false";
        activeSleeveDiscovery: "not_performed";
        neostackInspection: "not_performed";
        graphTraversal: "not_performed";
        recursiveLoad: "not_performed";
        fullLibraryScan: "not_performed";
        referencedTargetLoading: "not_performed";
        externalMoltBlockFileLoading: "not_performed";
        triggerEvaluation: "not_performed";
        execution: "not_performed";
        directSource: "not_enabled";
        libraryMutation: "not_performed";
    };
    warnings: string[];
    errors: Array<{
        code: BlockLibraryHoldCode;
        message: string;
    }>;
}
export type BlockLibrarySleeveGraphDrilldownStatus = "SLEEVE_DRILLDOWN_READY" | "SLEEVE_NOT_FOUND" | "SLEEVE_DRILLDOWN_DENIED" | "SLEEVE_DRILLDOWN_HELD";
export type RuntimeSleeveSelectionStatus = "SLEEVE_SELECTED" | "NO_ACTIVE_SLEEVE" | "SLEEVE_NOT_FOUND" | "SELECTION_CLEARED" | "SELECTION_HELD";
export type RuntimeSleeveResolutionStatus = "RESOLVED" | "PARTIAL" | "HELD" | "DENIED" | "FAILED";
export type RuntimeCompileStatus = "COMPILED" | "PARTIAL" | "HELD" | "FAILED";
export type RuntimePreviewStatus = "RUNTIME_PREVIEW_READY" | "PARTIAL" | "HELD" | "FAILED";
export type BlockLibrarySleeveGraphIndexStatus = "SLEEVE_GRAPH_INDEX_READY" | "SLEEVE_GRAPH_INDEX_READY_WITH_WARNINGS" | "SLEEVE_GRAPH_INDEX_EMPTY" | "SLEEVE_GRAPH_INDEX_DENIED" | "SLEEVE_GRAPH_INDEX_UNAVAILABLE";
export interface BlockLibrarySleeveGraphIndexResult {
    ok: boolean;
    version: string;
    entrypoint: string;
    mode: "real_block_library_sleeve_graph_index";
    outputContract: {
        contractId: "umg.sleeve_graph.index.v1";
        contractStatus: "NORMALIZED";
        sourceMode: "read_only_reference_index";
        activation: false;
        recursiveLoad: false;
        fullLibraryScan: false;
        payloadLoading: "catalog_or_manifest_only";
    };
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    query: {
        sleeveId: string | null;
        sourceCatalog: "auto" | "sleeves_catalog" | "ai_manifest";
        projectionFormat: "nl" | "json" | "both";
        includeReferenceSummary: boolean;
        includePolicySummary: boolean;
        includeRaw: boolean;
    };
    sleeveGraphIndex: {
        indexStatus: BlockLibrarySleeveGraphIndexStatus;
        indexKind: "read_only_sleeve_reference_index";
        sourceCatalog: "auto" | "sleeves_catalog" | "ai_manifest";
        sleeveCount: number;
        focusedSleeveId: string | null;
        sleeves: Array<{
            sleeveId: string;
            title: string | null;
            sourcePath: string | null;
            catalogPath: string | null;
            policy: "MACHINE_LOADABLE_CANDIDATE" | "PUBLIC_CURATED" | "REFERENCE_ONLY" | "FORBIDDEN" | "OUTSIDE_ALLOWLIST" | "UNKNOWN";
            activationState: "not_active";
            graphStatus: "INDEXED_REFERENCE_ONLY";
            neoStackRefs: string[];
            neoBlockRefs: string[];
            moltBlockRefs: string[];
            referenceSummary: {
                neoStackRefCount: number;
                neoBlockRefCount: number;
                moltBlockRefCount: number;
                resolvedRefs: number;
                loadedRefs: number;
                unresolvedRefs: number;
                forbiddenRefs: number;
                outsideAllowlistRefs: number;
            };
            limitations: string[];
        }>;
        referenceSummary: {
            declaredSleeves: number;
            declaredNeoStacks: number;
            declaredNeoBlocks: number;
            declaredMoltBlocks: number;
            resolvedRefs: number;
            loadedRefs: number;
            unresolvedRefs: number;
            forbiddenRefs: number;
            outsideAllowlistRefs: number;
        };
        policySummary: {
            machineLoadableLanes: string[];
            publicCuratedLanes: string[];
            referenceOnlyLanes: string[];
            forbiddenLanes: string[];
        };
        limitations: string[];
    };
    nlProjection: string;
    audit: Record<string, unknown>;
    warnings: string[];
    errors: Array<{
        code: BlockLibraryHoldCode;
        message: string;
    }>;
}
export interface RuntimeSpecV0 {
    runtimeSpecVersion: "RuntimeSpecV0";
    runtimeSpecId: string;
    sleeveId: string;
    activeBlocks: string[];
    moltMap: Record<string, string>;
    promptParts: Array<{
        field: string;
        text: string;
        sourceBlockId: string | null;
    }>;
    strategy: string | null;
    constraints: string | null;
    context: {
        subject: string | null;
        primary: string | null;
    };
    values: string | null;
    format: string | null;
    toolRequests: Array<{
        kind: string;
        sourceBlockId: string | null;
        declaredAction: string;
    }>;
}
export type RuntimeToolRequestClassificationState = "unavailable" | "unknown" | "metadata_only" | "mock_only" | "preview_only" | "available_read_only" | "available_requires_approval" | "available_allowlisted_direct" | "blocked_policy" | "blocked_missing_approval" | "blocked_unsafe" | "blocked_unimplemented";
export type RuntimeToolRequestRiskLevel = "none" | "low" | "medium" | "high" | "critical";
export type RuntimeToolRequestExecutionMode = "dry_run" | "preview" | "classify_only" | "approval_required" | "approved_execute" | "blocked";
export interface RuntimeToolRequestClassificationV0 {
    requestId: string;
    sourceRuntimeSpecId: string;
    sourceSleeveId: string;
    requestedToolName: string | null;
    requestedAction: string;
    requestedArgsSummary: string;
    classification: RuntimeToolRequestClassificationState;
    riskLevel: RuntimeToolRequestRiskLevel;
    approvalRequired: boolean;
    allowlisted: boolean;
    executionMode: RuntimeToolRequestExecutionMode;
    decisionReason: string;
    trace: string[];
}
export type RuntimeExecutionGateDecision = 'allow_read_only' | 'require_approval' | 'block_policy' | 'block_unknown' | 'block_unimplemented' | 'preview_only' | 'metadata_only' | 'dry_run_only';
export type RuntimeExecutionGatePlanStatus = 'GATE_PLAN_READY' | 'GATE_PLAN_PARTIAL' | 'GATE_PLAN_HELD' | 'GATE_PLAN_FAILED';
export interface RuntimeExecutionGatePlannedActionV0 {
    requestId: string;
    requestedToolName: string | null;
    requestedAction: string;
    classification: RuntimeToolRequestClassificationState;
    riskLevel: RuntimeToolRequestRiskLevel;
    approvalRequired: boolean;
    allowlisted: boolean;
    plannedMode: RuntimeToolRequestExecutionMode;
    gateDecision: RuntimeExecutionGateDecision;
    decisionReason: string;
    checkpointPreview: {
        checkpointWouldBeRequired: boolean;
        allowedDecisions: Array<'approve' | 'deny' | 'edit' | 'dry_run_only'>;
        checkpointCreated: false;
    } | null;
    executionStatus: 'not_performed';
    trace: string[];
}
export interface RuntimeExecutionGatePlanV0 {
    gatePlanId: string;
    sourceRuntimeSpecId: string | null;
    sourceSleeveId: string | null;
    planStatus: RuntimeExecutionGatePlanStatus;
    requestCount: number;
    plannedActions: RuntimeExecutionGatePlannedActionV0[];
    readOnlyCount: number;
    approvalRequiredCount: number;
    blockedCount: number;
    unknownCount: number;
    executionStatus: 'not_performed';
    audit: {
        execution: 'not_performed';
        toolExecution: 'not_performed';
        approvalCheckpointCreated: false;
        triggerEvaluation: 'not_performed';
        libraryMutation: 'not_performed';
        packageMutation: 'not_performed';
        restart: 'not_performed';
        publish: 'not_performed';
    };
    trace: string[];
}
export type RuntimeApprovalCheckpointStatus = 'CHECKPOINT_CREATED' | 'CHECKPOINT_HELD' | 'CHECKPOINT_FAILED';
export type RuntimeApprovalStatus = 'WAITING_FOR_APPROVAL' | 'APPROVED' | 'DENIED' | 'EDIT_REQUESTED' | 'EXPIRED' | 'DRY_RUN_ONLY';
export type RuntimeCheckpointCreateStatus = 'CHECKPOINT_CREATE_READY' | 'CHECKPOINT_CREATE_PARTIAL' | 'CHECKPOINT_CREATE_HELD' | 'CHECKPOINT_CREATE_FAILED';
export interface RuntimeApprovalCheckpointV0 {
    checkpointId: string;
    checkpointStatus: RuntimeApprovalCheckpointStatus;
    sourceRuntimeSpecId: string | null;
    sourceSleeveId: string | null;
    sourceGatePlanId: string | null;
    sourceRequestId: string;
    requestedToolName: string | null;
    requestedAction: string;
    argsPreview: string;
    riskLevel: RuntimeToolRequestRiskLevel;
    approvalRequired: true;
    approvalStatus: RuntimeApprovalStatus;
    allowedDecisions: Array<'approve' | 'deny' | 'edit' | 'dry_run_only'>;
    idempotencyKey: string;
    resumeToken: string;
    createdAt: string;
    expiresAt: string | null;
    executionStatus: 'not_performed';
    audit: {
        execution: 'not_performed';
        toolExecution: 'not_performed';
        approvalCheckpointCreated: true;
        approvalCheckpointPersistence: 'not_persisted';
        triggerEvaluation: 'not_performed';
        libraryMutation: 'not_performed';
        packageMutation: 'not_performed';
        restart: 'not_performed';
        publish: 'not_performed';
    };
    trace: string[];
}
export type RuntimeApprovalCheckpointResumeStatus = 'CHECKPOINT_RESUME_READY' | 'CHECKPOINT_RESUME_HELD' | 'CHECKPOINT_RESUME_DENIED' | 'CHECKPOINT_RESUME_EDIT_REQUESTED' | 'CHECKPOINT_RESUME_DRY_RUN_ONLY' | 'CHECKPOINT_RESUME_FAILED';
export interface RuntimeApprovalCheckpointResumeV0 {
    resumeResultId: string;
    resumeStatus: RuntimeApprovalCheckpointResumeStatus;
    sourceCheckpointId: string;
    sourceRuntimeSpecId: string | null;
    sourceSleeveId: string | null;
    sourceGatePlanId: string | null;
    sourceRequestId: string;
    requestedToolName: string | null;
    requestedAction: string;
    decision: 'approve' | 'deny' | 'edit' | 'dry_run_only';
    previousApprovalStatus: RuntimeApprovalStatus;
    nextApprovalStatus: RuntimeApprovalStatus;
    allowedDecision: boolean;
    decisionAccepted: boolean;
    editRequested: boolean;
    dryRunOnly: boolean;
    executionEligible: boolean;
    executionStatus: 'not_performed';
    checkpointPersistence: 'not_persisted';
    updatedCheckpointProjection: RuntimeApprovalCheckpointV0 | null;
    audit: {
        execution: 'not_performed';
        toolExecution: 'not_performed';
        approvalCheckpointResumed: boolean;
        approvalCheckpointPersistence: 'not_persisted';
        triggerEvaluation: 'not_performed';
        libraryMutation: 'not_performed';
        packageMutation: 'not_performed';
        restart: 'not_performed';
        publish: 'not_performed';
    };
    trace: string[];
}
export type RuntimeApprovedAllowlistedExecutionStatus = 'EXECUTION_READY' | 'EXECUTION_SKIPPED' | 'EXECUTION_BLOCKED' | 'EXECUTION_FAILED';
export interface RuntimeApprovedAllowlistedExecutionV0 {
    executionResultId: string;
    executionStatus: RuntimeApprovedAllowlistedExecutionStatus;
    sourceCheckpointId: string | null;
    sourceRuntimeSpecId: string | null;
    sourceSleeveId: string | null;
    sourceGatePlanId: string | null;
    sourceRequestId: string | null;
    requestedToolName: string | null;
    requestedAction: string | null;
    approvalStatus: RuntimeApprovalStatus | null;
    executionEligible: boolean;
    allowlisted: boolean;
    readOnly: boolean;
    executedAction: string | null;
    resultSummary: string;
    resultPayload: unknown;
    sideEffectStatus: 'read_only_no_mutation' | 'not_performed';
    audit: {
        approvalVerified: boolean;
        allowlistVerified: boolean;
        readOnlyVerified: boolean;
        toolExecution: 'performed' | 'not_performed';
        triggerEvaluation: 'not_performed';
        libraryMutation: 'not_performed';
        packageMutation: 'not_performed';
        filesystemMutation: 'not_performed';
        restart: 'not_performed';
        publish: 'not_performed';
    };
    trace: string[];
}
export type RuntimeExecutionChainE2EStatus = 'CHAIN_E2E_READY' | 'CHAIN_E2E_PARTIAL' | 'CHAIN_E2E_BLOCKED' | 'CHAIN_E2E_FAILED';
export interface RuntimeExecutionChainE2EApprovedReadOnlyV0 {
    chainRunId: string;
    chainStatus: RuntimeExecutionChainE2EStatus;
    sourceSleeveId: string | null;
    runtimeSpecId: string | null;
    classifierResultId: string | null;
    gatePlanId: string | null;
    checkpointId: string | null;
    resumeResultId: string | null;
    executionResultId: string | null;
    requestedToolName: string | null;
    requestedAction: string | null;
    approvalDecision: 'approve' | 'deny' | 'dry_run_only';
    executionStatus: RuntimeApprovedAllowlistedExecutionStatus | 'not_performed';
    sideEffectStatus: 'read_only_no_mutation' | 'not_performed';
    resultSummary: string;
    resultPayload: unknown;
    classifierResult: unknown;
    gatePlanResult: unknown;
    checkpointCreateResult: unknown;
    checkpointResumeResult: unknown;
    executionResult: unknown;
    audit: {
        runtimeCompiled: boolean;
        classificationPerformed: boolean;
        gatePlanCreated: boolean;
        approvalCheckpointCreated: boolean;
        approvalCheckpointResumed: boolean;
        approvalVerified: boolean;
        allowlistVerified: boolean;
        readOnlyVerified: boolean;
        toolExecution: 'performed' | 'not_performed';
        triggerEvaluation: 'not_performed';
        libraryMutation: 'not_performed';
        packageMutation: 'not_performed';
        filesystemMutation: 'not_performed';
        restart: 'not_performed';
        publish: 'not_performed';
    };
    trace: string[];
}
export type RuntimeActiveSleeveInspectorStatus = 'INSPECTOR_READY' | 'INSPECTOR_PARTIAL' | 'INSPECTOR_HELD' | 'INSPECTOR_FAILED';
export interface RuntimeActiveSleeveIrMatrixEnvelopeInspectV0 {
    inspectorRunId: string;
    inspectorStatus: RuntimeActiveSleeveInspectorStatus;
    sourceSleeveId: string | null;
    activeSleeve: unknown;
    activeNeoStacks: unknown[];
    activeNeoBlocks: unknown[];
    activeMoltBlocks: Record<string, unknown[]>;
    runtimeSpec: unknown;
    activeStackProjection: unknown;
    moltMapProjection: unknown;
    irMatrixProjection: unknown;
    responseEnvelopePreview: unknown;
    toolRequestClassification: unknown;
    executionGatePlan: unknown;
    approvalCheckpointState: unknown;
    approvedExecutionState: unknown;
    executionStatus: 'not_performed';
    warnings: unknown[];
    errors: unknown[];
    audit: {
        execution: 'not_performed';
        toolExecution: 'not_performed';
        triggerEvaluation: 'not_performed';
        libraryMutation: 'not_performed';
        packageMutation: 'not_performed';
        filesystemMutation: 'not_performed';
        restart: 'not_performed';
        publish: 'not_performed';
    };
    trace: string[];
}
export declare function defaultBlockLibraryRoot(): string;
type NativeFixtureResolutionAttempt = {
    root: string;
    candidateFile: string;
    exists: boolean;
    matched: boolean;
    reason?: string;
};
type NativeFixtureResolutionDiagnostics = {
    requestedSleeveId: string;
    candidateRootsChecked: string[];
    candidateFilesChecked: string[];
    matchedFile: string | null;
    matchedSleeveId: string | null;
    mismatchReasons: string[];
    attempts: NativeFixtureResolutionAttempt[];
};
export declare function getBlockLibraryManifestIndex(version: string, entrypoint?: string, root?: string): BlockLibraryManifestIndexResult;
export declare function getBlockLibraryManifestEntryLookup(version: string, entrypoint?: string, root?: string, input?: {
    entryId?: string;
    sourcePath?: string;
    manifestKind?: BlockLibraryManifestKind;
    includeManifestSummary?: boolean;
    includeRaw?: boolean;
}): BlockLibraryManifestEntryLookupResult;
export declare function getBlockLibraryTargetShallowLoadGate(version: string, entrypoint?: string, root?: string, input?: {
    entryId?: string;
    sourcePath?: string;
    manifestKind?: BlockLibraryManifestKind;
    intendedLoadMode?: string;
    includeEntrySummary?: boolean;
}): BlockLibraryTargetShallowLoadGateResult;
export declare function getBlockLibraryTargetShallowLoadSingle(version: string, entrypoint?: string, root?: string, input?: {
    entryId?: string;
    sourcePath?: string;
    manifestKind?: BlockLibraryManifestKind;
    loadMode?: string;
    includeContentPreview?: boolean;
    includeRaw?: boolean;
}): BlockLibraryTargetShallowLoadSingleResult;
export declare function getBlockLibraryTargetShallowSummaryNormalize(version: string, entrypoint?: string, root?: string, input?: {
    entryId?: string;
    sourcePath?: string;
    manifestKind?: BlockLibraryManifestKind;
    summaryProfile?: string;
    includeContentPreview?: boolean;
    includeReferenceSummary?: boolean;
    includeRaw?: boolean;
}): BlockLibraryTargetShallowSummaryNormalizeResult;
export declare function getBlockLibraryNeoblockInspect(version: string, entrypoint?: string, root?: string, input?: {
    neoblockId?: string;
    entryId?: string;
    sourcePath?: string;
    manifestKind?: BlockLibraryManifestKind;
    summaryProfile?: string;
    includeContentPreview?: boolean;
    includeReferenceSummary?: boolean;
    includeRaw?: boolean;
}): BlockLibraryNeoblockInspectResult;
export declare function getBlockLibraryMoltMapCompose(version: string, entrypoint?: string, root?: string, input?: {
    neoblockIds?: string[];
    manifestKind?: BlockLibraryManifestKind;
    summaryProfile?: string;
    projectionFormat?: 'nl' | 'json' | 'both' | string;
    conflictPolicy?: 'first_wins' | 'report_only' | string;
    includeFieldProvenance?: boolean;
    includeContentPreview?: boolean;
    includeRaw?: boolean;
}): BlockLibraryMoltMapComposeResult;
export declare function getBlockLibraryActiveStackProjection(version: string, entrypoint?: string, root?: string, input?: {
    project?: string;
    currentState?: string;
    activeTool?: string;
    sourceTool?: string;
    neoblockIds?: string[];
    activeSleeve?: string;
    boundary?: string;
    projectionFormat?: 'nl' | 'json' | 'both' | string;
    includeAudit?: boolean;
    includeRaw?: boolean;
    _internal?: InternalCallContext;
}): BlockLibraryActiveStackProjectionResult;
export declare function getBlockLibraryResponseEnvelopeFragment(version: string, entrypoint?: string, root?: string, input?: {
    neoblockIds?: string[];
    project?: string;
    currentState?: string;
    activeTool?: string;
    formalResponseContent?: string;
    envoyIntuition?: string;
    projectionFormat?: 'nl' | 'json' | 'both' | string;
    includeMetadata?: boolean;
    includeAudit?: boolean;
    activeSleeve?: string;
    activeStackBoundary?: string;
    includeActiveStackProjection?: boolean;
    includeRaw?: boolean;
}): BlockLibraryResponseEnvelopeFragmentResult;
export declare function getBlockLibraryMoltMapFragment(version: string, entrypoint?: string, root?: string, input?: {
    neoblockId?: string;
    entryId?: string;
    sourcePath?: string;
    manifestKind?: BlockLibraryManifestKind;
    summaryProfile?: string;
    projectionFormat?: 'nl' | 'json' | 'both' | string;
    includeContentPreview?: boolean;
    includeReferenceSummary?: boolean;
    includeRaw?: boolean;
}): BlockLibraryMoltMapFragmentResult;
export declare function getBlockLibraryMoltblockVisibleExtract(version: string, entrypoint?: string, root?: string, input?: {
    neoblockId?: string;
    entryId?: string;
    sourcePath?: string;
    manifestKind?: BlockLibraryManifestKind;
    summaryProfile?: string;
    includeContentPreview?: boolean;
    includeReferenceSummary?: boolean;
    includeRaw?: boolean;
}): BlockLibraryMoltblockVisibleExtractResult;
export declare function getBlockLibrarySleeveGraphIndex(version: string, entrypoint?: string, root?: string, input?: {
    sleeveId?: string;
    sourceCatalog?: 'auto' | 'sleeves_catalog' | 'ai_manifest' | string;
    projectionFormat?: 'nl' | 'json' | 'both' | string;
    includeReferenceSummary?: boolean;
    includePolicySummary?: boolean;
    includeRaw?: boolean;
}): BlockLibrarySleeveGraphIndexResult;
export declare function getBlockLibrarySleeveGraphDrilldown(version: string, entrypoint?: string, root?: string, input?: {
    sleeveId?: string;
    sourceCatalog?: 'auto' | 'sleeves_catalog' | 'ai_manifest' | string;
    projectionFormat?: 'summary' | 'nl' | 'json' | 'both' | string;
    includePolicySummary?: boolean;
    includeReferenceSummary?: boolean;
    includeRaw?: boolean;
}): {
    ok: boolean;
    drilldownStatus: "SLEEVE_DRILLDOWN_HELD";
    sleeveId: null;
    sourceIndexContract: string;
    sleeveEntry: null;
    declaredNeoStackRefs: never[];
    declaredNeoBlockRefs: never[];
    visibleMoltRefs: never[];
    referenceSummary: null;
    policySummary: null;
    loadPlan: never[];
    nlProjection: string;
    errors: {
        code: string;
        message: string;
    }[];
    version: string;
    entrypoint: string;
    mode: "real_block_library_sleeve_graph_drilldown";
    outputContract: {
        contractId: "umg.sleeve_graph.drilldown.v1";
        contractStatus: "NORMALIZED";
    };
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    audit: {
        sleeveActivation: string;
        activeSleeveMutation: string;
        graphTraversal: string;
        neoStackPayloadLoading: string;
        neoBlockRecursiveLoading: string;
        externalMoltBlockFileLoading: string;
        triggerEvaluation: string;
        libraryMutation: string;
    };
    warnings: string[];
} | {
    ok: boolean;
    drilldownStatus: "SLEEVE_DRILLDOWN_DENIED";
    sleeveId: string;
    sourceIndexContract: string;
    sleeveEntry: null;
    declaredNeoStackRefs: never[];
    declaredNeoBlockRefs: never[];
    visibleMoltRefs: never[];
    referenceSummary: null;
    policySummary: null;
    loadPlan: never[];
    nlProjection: string;
    errors: {
        code: string;
        message: string;
    }[];
    version: string;
    entrypoint: string;
    mode: "real_block_library_sleeve_graph_drilldown";
    outputContract: {
        contractId: "umg.sleeve_graph.drilldown.v1";
        contractStatus: "NORMALIZED";
    };
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    audit: {
        sleeveActivation: string;
        activeSleeveMutation: string;
        graphTraversal: string;
        neoStackPayloadLoading: string;
        neoBlockRecursiveLoading: string;
        externalMoltBlockFileLoading: string;
        triggerEvaluation: string;
        libraryMutation: string;
    };
    warnings: string[];
} | {
    ok: boolean;
    drilldownStatus: string;
    sleeveId: string;
    sourceIndexContract: string;
    sleeveEntry: null;
    declaredNeoStackRefs: never[];
    declaredNeoBlockRefs: never[];
    visibleMoltRefs: never[];
    referenceSummary: null;
    policySummary: null;
    loadPlan: never[];
    nlProjection: string;
    warnings: string[];
    errors: {
        code: BlockLibraryHoldCode;
        message: string;
    }[];
    version: string;
    entrypoint: string;
    mode: "real_block_library_sleeve_graph_drilldown";
    outputContract: {
        contractId: "umg.sleeve_graph.drilldown.v1";
        contractStatus: "NORMALIZED";
    };
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    audit: {
        sleeveActivation: string;
        activeSleeveMutation: string;
        graphTraversal: string;
        neoStackPayloadLoading: string;
        neoBlockRecursiveLoading: string;
        externalMoltBlockFileLoading: string;
        triggerEvaluation: string;
        libraryMutation: string;
    };
} | {
    ok: boolean;
    drilldownStatus: "SLEEVE_NOT_FOUND";
    sleeveId: string;
    sourceIndexContract: string;
    sleeveEntry: null;
    declaredNeoStackRefs: never[];
    declaredNeoBlockRefs: never[];
    visibleMoltRefs: never[];
    referenceSummary: null;
    policySummary: null;
    loadPlan: never[];
    nlProjection: string;
    errors: {
        code: string;
        message: string;
    }[];
    version: string;
    entrypoint: string;
    mode: "real_block_library_sleeve_graph_drilldown";
    outputContract: {
        contractId: "umg.sleeve_graph.drilldown.v1";
        contractStatus: "NORMALIZED";
    };
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    audit: {
        sleeveActivation: string;
        activeSleeveMutation: string;
        graphTraversal: string;
        neoStackPayloadLoading: string;
        neoBlockRecursiveLoading: string;
        externalMoltBlockFileLoading: string;
        triggerEvaluation: string;
        libraryMutation: string;
    };
    warnings: string[];
} | {
    ok: boolean;
    drilldownStatus: "SLEEVE_DRILLDOWN_READY";
    sleeveId: string;
    sourceIndexContract: string;
    sleeveEntry: {
        sleeveId: string;
        title: string | null;
        sourcePath: string | null;
        catalogPath: string | null;
        policy: "MACHINE_LOADABLE_CANDIDATE" | "PUBLIC_CURATED" | "REFERENCE_ONLY" | "FORBIDDEN" | "OUTSIDE_ALLOWLIST" | "UNKNOWN";
        activationState: "not_active";
        graphStatus: "INDEXED_REFERENCE_ONLY";
        neoStackRefs: string[];
        neoBlockRefs: string[];
        moltBlockRefs: string[];
        referenceSummary: {
            neoStackRefCount: number;
            neoBlockRefCount: number;
            moltBlockRefCount: number;
            resolvedRefs: number;
            loadedRefs: number;
            unresolvedRefs: number;
            forbiddenRefs: number;
            outsideAllowlistRefs: number;
        };
        limitations: string[];
    };
    declaredNeoStackRefs: string[];
    declaredNeoBlockRefs: string[];
    visibleMoltRefs: string[];
    referenceSummary: {
        neoStackRefCount: number;
        neoBlockRefCount: number;
        moltBlockRefCount: number;
        resolvedRefs: number;
        loadedRefs: number;
        unresolvedRefs: number;
        forbiddenRefs: number;
        outsideAllowlistRefs: number;
    };
    policySummary: {
        policy: "REFERENCE_ONLY" | "MACHINE_LOADABLE_CANDIDATE" | "FORBIDDEN" | "OUTSIDE_ALLOWLIST" | "PUBLIC_CURATED" | "UNKNOWN";
        status: string;
    };
    loadPlan: {
        kind: string;
        ref: string;
        nextTool: string;
    }[];
    nlProjection: string;
    warnings: string[];
    errors: never[];
    version: string;
    entrypoint: string;
    mode: "real_block_library_sleeve_graph_drilldown";
    outputContract: {
        contractId: "umg.sleeve_graph.drilldown.v1";
        contractStatus: "NORMALIZED";
    };
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    audit: {
        sleeveActivation: string;
        activeSleeveMutation: string;
        graphTraversal: string;
        neoStackPayloadLoading: string;
        neoBlockRecursiveLoading: string;
        externalMoltBlockFileLoading: string;
        triggerEvaluation: string;
        libraryMutation: string;
    };
};
export declare function selectRuntimeSleeve(version: string, entrypoint?: string, root?: string, input?: {
    sleeveId?: string;
    selectionMode?: 'explicit' | 'default_config' | 'current' | 'clear' | string;
    persistSelection?: boolean;
    runtimeSessionId?: string;
}): {
    selectionStatus: "SELECTION_CLEARED";
    activeSleeveId: null;
    selectionMode: "clear";
    selectionSource: "current";
    stateMutation: "cleared_session_state";
    audit: {
        sessionId: string;
        persistSelection?: undefined;
    };
    ok: boolean;
    version: string;
    entrypoint: string;
    mode: "runtime_sleeve_select";
    outputContract: {
        contractId: "umg.sleeve.select.v1";
        contractStatus: "NORMALIZED";
    };
    readOnly: boolean;
    execution: "not_performed";
    directSource: "not_enabled";
    libraryMutation: "not_performed";
    warnings: string[];
    errors: Array<{
        code: BlockLibraryHoldCode;
        message: string;
    }>;
} | {
    selectionStatus: "NO_ACTIVE_SLEEVE" | "SLEEVE_SELECTED";
    activeSleeveId: string | null;
    selectionMode: "current";
    selectionSource: "current";
    stateMutation: "none";
    audit: {
        sessionId: string;
        persistSelection?: undefined;
    };
    ok: boolean;
    version: string;
    entrypoint: string;
    mode: "runtime_sleeve_select";
    outputContract: {
        contractId: "umg.sleeve.select.v1";
        contractStatus: "NORMALIZED";
    };
    readOnly: boolean;
    execution: "not_performed";
    directSource: "not_enabled";
    libraryMutation: "not_performed";
    warnings: string[];
    errors: Array<{
        code: BlockLibraryHoldCode;
        message: string;
    }>;
} | {
    ok: boolean;
    selectionStatus: "SELECTION_HELD";
    activeSleeveId: string | null;
    selectionMode: any;
    selectionSource: string;
    stateMutation: "none";
    audit: {
        sessionId: string;
        persistSelection?: undefined;
    };
    errors: {
        code: string;
        message: string;
    }[];
    version: string;
    entrypoint: string;
    mode: "runtime_sleeve_select";
    outputContract: {
        contractId: "umg.sleeve.select.v1";
        contractStatus: "NORMALIZED";
    };
    readOnly: boolean;
    execution: "not_performed";
    directSource: "not_enabled";
    libraryMutation: "not_performed";
    warnings: string[];
} | {
    ok: boolean;
    selectionStatus: "SLEEVE_NOT_FOUND";
    activeSleeveId: null;
    selectionMode: any;
    selectionSource: string;
    stateMutation: "none";
    audit: {
        sessionId: string;
        persistSelection?: undefined;
    };
    warnings: string[];
    errors: never[] | {
        code: BlockLibraryHoldCode;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[];
    version: string;
    entrypoint: string;
    mode: "runtime_sleeve_select";
    outputContract: {
        contractId: "umg.sleeve.select.v1";
        contractStatus: "NORMALIZED";
    };
    readOnly: boolean;
    execution: "not_performed";
    directSource: "not_enabled";
    libraryMutation: "not_performed";
} | {
    selectionStatus: "SLEEVE_SELECTED";
    activeSleeveId: string;
    selectionMode: any;
    selectionSource: "default" | "explicit";
    stateMutation: "session_state_only";
    audit: {
        sessionId: string;
        persistSelection: boolean;
    };
    ok: boolean;
    version: string;
    entrypoint: string;
    mode: "runtime_sleeve_select";
    outputContract: {
        contractId: "umg.sleeve.select.v1";
        contractStatus: "NORMALIZED";
    };
    readOnly: boolean;
    execution: "not_performed";
    directSource: "not_enabled";
    libraryMutation: "not_performed";
    warnings: string[];
    errors: Array<{
        code: BlockLibraryHoldCode;
        message: string;
    }>;
};
export declare function resolveRuntimeSleeveGraph(version: string, entrypoint?: string, root?: string, input?: {
    sleeveId?: string;
    runtimeSessionId?: string;
    resolveDepth?: 'reference_only' | 'neostack_refs' | 'neoblock_shallow' | 'molt_visible' | string;
    maxNeoStacks?: number;
    maxNeoBlocks?: number;
    maxVisibleMoltFragments?: number;
    allowRecursive?: boolean;
    mode?: string;
}): {
    ok: boolean;
    resolutionStatus: "DENIED";
    sleeveId: string | null;
    selectedSleeveSource: string;
    resolvedSleeve: null;
    resolvedNeoStacks: never[];
    resolvedNeoBlocks: never[];
    visibleMoltFragments: never[];
    composeReadyFragments: never[];
    limits: {
        maxNeoStacks: number;
        maxNeoBlocks: number;
        maxVisibleMoltFragments: number;
        allowRecursive: boolean;
    };
    audit: {
        graphTraversal: string;
        triggerEvaluation: string;
        libraryMutation: string;
        execution?: undefined;
        externalMoltBlockFileLoading?: undefined;
    };
    errors: {
        code: string;
        message: string;
    }[];
    version: string;
    entrypoint: string;
    mode: "runtime_sleeve_resolve";
    outputContract: {
        contractId: "umg.sleeve.resolve.v1";
        contractStatus: "NORMALIZED";
    };
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    warnings: string[];
    blockedRefs: Array<{
        ref: string;
        reason: string;
    }>;
} | {
    ok: boolean;
    resolutionStatus: "HELD";
    sleeveId: null;
    selectedSleeveSource: string;
    resolvedSleeve: null;
    resolvedNeoStacks: never[];
    resolvedNeoBlocks: never[];
    visibleMoltFragments: never[];
    composeReadyFragments: never[];
    limits: {
        maxNeoStacks: number;
        maxNeoBlocks: number;
        maxVisibleMoltFragments: number;
        allowRecursive: boolean;
    };
    audit: {
        graphTraversal: string;
        triggerEvaluation: string;
        libraryMutation: string;
        execution?: undefined;
        externalMoltBlockFileLoading?: undefined;
    };
    errors: {
        code: string;
        message: string;
    }[];
    version: string;
    entrypoint: string;
    mode: "runtime_sleeve_resolve";
    outputContract: {
        contractId: "umg.sleeve.resolve.v1";
        contractStatus: "NORMALIZED";
    };
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    warnings: string[];
    blockedRefs: Array<{
        ref: string;
        reason: string;
    }>;
} | {
    ok: boolean;
    resolutionStatus: "HELD";
    sleeveId: string;
    selectedSleeveSource: string;
    resolvedSleeve: null;
    resolvedNeoStacks: never[];
    resolvedNeoBlocks: never[];
    visibleMoltFragments: never[];
    composeReadyFragments: never[];
    limits: {
        maxNeoStacks: number;
        maxNeoBlocks: number;
        maxVisibleMoltFragments: number;
        allowRecursive: boolean;
    };
    audit: {
        graphTraversal: string;
        triggerEvaluation: string;
        libraryMutation: string;
        execution?: undefined;
        externalMoltBlockFileLoading?: undefined;
    };
    warnings: string[];
    errors: never[] | {
        code: BlockLibraryHoldCode;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[];
    version: string;
    entrypoint: string;
    mode: "runtime_sleeve_resolve";
    outputContract: {
        contractId: "umg.sleeve.resolve.v1";
        contractStatus: "NORMALIZED";
    };
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    blockedRefs: Array<{
        ref: string;
        reason: string;
    }>;
} | {
    ok: boolean;
    resolutionStatus: "RESOLVED" | "PARTIAL";
    sleeveId: string;
    selectedSleeveSource: "explicit" | "current";
    resolvedSleeve: {
        sleeveId: string;
        title: string | null;
        sourcePath: string | null;
        catalogPath: string | null;
        policy: "MACHINE_LOADABLE_CANDIDATE" | "PUBLIC_CURATED" | "REFERENCE_ONLY" | "FORBIDDEN" | "OUTSIDE_ALLOWLIST" | "UNKNOWN";
        activationState: "not_active";
        graphStatus: "INDEXED_REFERENCE_ONLY";
        neoStackRefs: string[];
        neoBlockRefs: string[];
        moltBlockRefs: string[];
        referenceSummary: {
            neoStackRefCount: number;
            neoBlockRefCount: number;
            moltBlockRefCount: number;
            resolvedRefs: number;
            loadedRefs: number;
            unresolvedRefs: number;
            forbiddenRefs: number;
            outsideAllowlistRefs: number;
        };
        limitations: string[];
    };
    resolvedNeoStacks: {
        ref: string;
        status: string;
    }[];
    resolvedNeoBlocks: {
        neoblockId: string;
        status: string;
        summary?: unknown;
    }[];
    visibleMoltFragments: {
        neoblockId: string;
        sourceField: string;
        sourceBlockId: string | null;
        text: string;
    }[];
    composeReadyFragments: {
        neoblockId: string;
        sourceField: string;
        sourceBlockId: string | null;
        text: string;
    }[];
    limits: {
        maxNeoStacks: number;
        maxNeoBlocks: number;
        maxVisibleMoltFragments: number;
        allowRecursive: boolean;
    };
    audit: {
        graphTraversal: string;
        triggerEvaluation: string;
        execution: string;
        libraryMutation: string;
        externalMoltBlockFileLoading: string;
    };
    errors: never[];
    version: string;
    entrypoint: string;
    mode: "runtime_sleeve_resolve";
    outputContract: {
        contractId: "umg.sleeve.resolve.v1";
        contractStatus: "NORMALIZED";
    };
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    warnings: string[];
    blockedRefs: Array<{
        ref: string;
        reason: string;
    }>;
};
export declare function compileRuntimeSleeve(version: string, entrypoint?: string, root?: string, input?: {
    sleeveId?: string;
    runtimeSessionId?: string;
    useSelectedSleeve?: boolean;
    compileMode?: string;
    resolveDepth?: 'reference_only' | 'neostack_refs' | 'neoblock_shallow' | 'molt_visible' | string;
    strictness?: 'dev' | 'prod' | string;
}): {
    ok: boolean;
    compileStatus: "HELD";
    runtimeSpecVersion: string;
    runtimeSpecId: null;
    sleeveId: string | null;
    activeBlocks: never[];
    moltMap: {};
    promptParts: never[];
    strategy: null;
    constraints: null;
    context: null;
    values: null;
    format: null;
    toolRequests: never[];
    warnings: string[];
    errors: never[] | {
        code: BlockLibraryHoldCode;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[];
    trace: {
        resolutionStatus: "RESOLVED" | "PARTIAL" | "HELD" | "DENIED";
        strictness?: undefined;
    };
    version: string;
    entrypoint: string;
    mode: "runtime_compile";
    outputContract: {
        contractId: "umg.runtime.compile.v1";
        contractStatus: "NORMALIZED";
    };
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
} | {
    ok: boolean;
    compileStatus: string;
    runtimeSpecVersion: "RuntimeSpecV0";
    runtimeSpecId: string;
    sleeveId: string;
    activeBlocks: string[];
    moltMap: Record<string, string>;
    promptParts: {
        field: string;
        text: string;
        sourceBlockId: string | null;
    }[];
    strategy: string | null;
    constraints: string | null;
    context: {
        subject: string | null;
        primary: string | null;
    };
    values: string | null;
    format: string | null;
    toolRequests: {
        kind: string;
        sourceBlockId: string | null;
        declaredAction: string;
    }[];
    warnings: string[];
    errors: {
        code: string;
        message: string;
    }[];
    trace: {
        resolutionStatus: "RESOLVED" | "PARTIAL" | "HELD" | "DENIED";
        strictness: string;
    };
    version: string;
    entrypoint: string;
    mode: "runtime_compile";
    outputContract: {
        contractId: "umg.runtime.compile.v1";
        contractStatus: "NORMALIZED";
    };
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
};
export declare function classifyRuntimeToolRequests(version: string, entrypoint?: string, root?: string, input?: {
    sleeveId?: string;
    runtimeSpec?: RuntimeSpecV0;
    compileIfMissing?: boolean;
    requestedToolName?: string;
    mode?: 'classify_only' | 'dry_run' | string;
    includeTrace?: boolean;
}): {
    ok: boolean;
    classificationStatus: "CLASSIFICATION_HELD";
    sourceRuntimeSpecId: null;
    sleeveId: string | null;
    requestCount: number;
    classifications: never[];
    blockedCount: number;
    approvalRequiredCount: number;
    readOnlyCount: number;
    unknownCount: number;
    trace: string[];
    warnings: string[];
    errors: {
        code: string;
        message: string;
    }[];
    version: string;
    entrypoint: string;
    mode: "runtime_tool_request_classify";
    outputContract: {
        contractId: "umg.runtime.tool_request.classify.v1";
        contractStatus: "NORMALIZED";
    };
    executionStatus: "not_performed";
    audit: {
        execution: "not_performed";
        triggerEvaluation: "not_performed";
        approvalCheckpointCreated: boolean;
        toolExecution: "not_performed";
        libraryMutation: "not_performed";
        packageMutation: "not_performed";
        restart: "not_performed";
        publish: "not_performed";
    };
} | {
    ok: boolean;
    classificationStatus: string;
    sourceRuntimeSpecId: string;
    sleeveId: string;
    requestCount: number;
    classifications: RuntimeToolRequestClassificationV0[];
    blockedCount: number;
    approvalRequiredCount: number;
    readOnlyCount: number;
    unknownCount: number;
    trace: string[];
    warnings: string[];
    errors: {
        code: string;
        message: string;
    }[];
    version: string;
    entrypoint: string;
    mode: "runtime_tool_request_classify";
    outputContract: {
        contractId: "umg.runtime.tool_request.classify.v1";
        contractStatus: "NORMALIZED";
    };
    executionStatus: "not_performed";
    audit: {
        execution: "not_performed";
        triggerEvaluation: "not_performed";
        approvalCheckpointCreated: boolean;
        toolExecution: "not_performed";
        libraryMutation: "not_performed";
        packageMutation: "not_performed";
        restart: "not_performed";
        publish: "not_performed";
    };
};
export declare function createRuntimeExecutionGatePlan(version: string, entrypoint?: string, root?: string, input?: {
    sleeveId?: string;
    runtimeSpec?: RuntimeSpecV0;
    classifications?: RuntimeToolRequestClassificationV0[];
    compileIfMissing?: boolean;
    classifyIfMissing?: boolean;
    mode?: 'plan_only' | 'dry_run' | string;
    includeTrace?: boolean;
    includeCheckpointPreview?: boolean;
}): {
    ok: boolean;
    planStatus: "GATE_PLAN_HELD";
    gatePlanId: string;
    sourceRuntimeSpecId: string | null;
    sourceSleeveId: string | null;
    requestCount: number;
    plannedActions: never[];
    readOnlyCount: number;
    approvalRequiredCount: number;
    blockedCount: number;
    unknownCount: number;
    trace: string[];
    warnings: string[];
    errors: {
        code: string;
        message: string;
    }[];
    version: string;
    entrypoint: string;
    mode: "runtime_execution_gate_plan";
    outputContract: {
        contractId: "umg.runtime.execution_gate.plan.v1";
        contractStatus: "NORMALIZED";
    };
    executionStatus: "not_performed";
    checkpointCreated: false;
    audit: {
        execution: "not_performed";
        toolExecution: "not_performed";
        approvalCheckpointCreated: boolean;
        triggerEvaluation: "not_performed";
        libraryMutation: "not_performed";
        packageMutation: "not_performed";
        restart: "not_performed";
        publish: "not_performed";
    };
} | {
    ok: boolean;
    planStatus: "GATE_PLAN_READY" | "GATE_PLAN_PARTIAL";
    gatePlanId: string;
    sourceRuntimeSpecId: string | null;
    sourceSleeveId: string | null;
    requestCount: number;
    plannedActions: RuntimeExecutionGatePlannedActionV0[];
    readOnlyCount: number;
    approvalRequiredCount: number;
    blockedCount: number;
    unknownCount: number;
    trace: string[];
    warnings: string[];
    errors: {
        code: string;
        message: string;
    }[];
    version: string;
    entrypoint: string;
    mode: "runtime_execution_gate_plan";
    outputContract: {
        contractId: "umg.runtime.execution_gate.plan.v1";
        contractStatus: "NORMALIZED";
    };
    executionStatus: "not_performed";
    checkpointCreated: false;
    audit: {
        execution: "not_performed";
        toolExecution: "not_performed";
        approvalCheckpointCreated: boolean;
        triggerEvaluation: "not_performed";
        libraryMutation: "not_performed";
        packageMutation: "not_performed";
        restart: "not_performed";
        publish: "not_performed";
    };
};
export declare function createRuntimeApprovalCheckpoints(version: string, entrypoint?: string, root?: string, input?: {
    sleeveId?: string;
    runtimeSpec?: RuntimeSpecV0;
    classifications?: RuntimeToolRequestClassificationV0[];
    gatePlan?: RuntimeExecutionGatePlanV0;
    createForRequestIds?: string[];
    mode?: 'checkpoint_create' | 'dry_run' | string;
    includeTrace?: boolean;
    storageMode?: 'returned_only' | string;
}): {
    ok: boolean;
    checkpointCreateStatus: "CHECKPOINT_CREATE_HELD";
    sourceRuntimeSpecId: string | null;
    sourceSleeveId: string | null;
    sourceGatePlanId: null;
    checkpointCount: number;
    checkpoints: never[];
    skippedActionCount: number;
    skippedActions: never[];
    audit: {
        execution: "not_performed";
        toolExecution: "not_performed";
        approvalCheckpointCreated: boolean;
        approvalCheckpointPersistence: "not_persisted";
        triggerEvaluation: "not_performed";
        libraryMutation: "not_performed";
        packageMutation: "not_performed";
        restart: "not_performed";
        publish: "not_performed";
    };
    trace: string[];
    warnings: string[];
    errors: {
        code: string;
        message: string;
    }[];
    version: string;
    entrypoint: string;
    mode: "runtime_approval_checkpoint_create";
    outputContract: {
        contractId: "umg.runtime.approval_checkpoint.create.v1";
        contractStatus: "NORMALIZED";
    };
    executionStatus: "not_performed";
    checkpointPersistence: "not_persisted";
} | {
    ok: boolean;
    checkpointCreateStatus: "CHECKPOINT_CREATE_READY" | "CHECKPOINT_CREATE_PARTIAL";
    sourceRuntimeSpecId: string | null;
    sourceSleeveId: string | null;
    sourceGatePlanId: string;
    checkpointCount: number;
    checkpoints: RuntimeApprovalCheckpointV0[];
    skippedActionCount: number;
    skippedActions: {
        requestId: string;
        requestedToolName: string | null;
        requestedAction: string;
        skipReason: string;
    }[];
    audit: {
        execution: "not_performed";
        toolExecution: "not_performed";
        approvalCheckpointCreated: boolean;
        approvalCheckpointPersistence: "not_persisted";
        triggerEvaluation: "not_performed";
        libraryMutation: "not_performed";
        packageMutation: "not_performed";
        restart: "not_performed";
        publish: "not_performed";
    };
    trace: string[];
    warnings: string[];
    errors: {
        code: string;
        message: string;
    }[];
    version: string;
    entrypoint: string;
    mode: "runtime_approval_checkpoint_create";
    outputContract: {
        contractId: "umg.runtime.approval_checkpoint.create.v1";
        contractStatus: "NORMALIZED";
    };
    executionStatus: "not_performed";
    checkpointPersistence: "not_persisted";
};
export declare function resumeRuntimeApprovalCheckpoint(version: string, entrypoint: string | undefined, input: {
    checkpoint?: RuntimeApprovalCheckpointV0;
    resumeToken?: string;
    decision: 'approve' | 'deny' | 'edit' | 'dry_run_only';
    editedArgsPreview?: unknown;
    decisionReason?: string;
    mode?: 'resume_only' | 'dry_run' | string;
    includeTrace?: boolean;
}): {
    ok: boolean;
    resumeStatus: RuntimeApprovalCheckpointResumeStatus;
    resumeResultId: string;
    sourceCheckpointId: string;
    sourceRuntimeSpecId: string | null;
    sourceSleeveId: string | null;
    sourceGatePlanId: string | null;
    sourceRequestId: string;
    requestedToolName: string | null;
    requestedAction: string;
    decision: "dry_run_only" | "approve" | "deny" | "edit";
    previousApprovalStatus: RuntimeApprovalStatus;
    nextApprovalStatus: RuntimeApprovalStatus;
    allowedDecision: boolean;
    decisionAccepted: boolean;
    editRequested: boolean;
    dryRunOnly: boolean;
    executionEligible: boolean;
    updatedCheckpointProjection: null;
    audit: {
        execution: "not_performed";
        toolExecution: "not_performed";
        approvalCheckpointResumed: boolean;
        approvalCheckpointPersistence: "not_persisted";
        triggerEvaluation: "not_performed";
        libraryMutation: "not_performed";
        packageMutation: "not_performed";
        restart: "not_performed";
        publish: "not_performed";
    };
    trace: string[];
    errors: {
        code: string;
        message: string;
    }[];
    warnings: never[];
    version: string;
    entrypoint: string;
    mode: "runtime_approval_checkpoint_resume";
    outputContract: {
        contractId: "umg.runtime.approval_checkpoint.resume.v1";
        contractStatus: "NORMALIZED";
    };
    checkpointPersistence: "not_persisted";
    executionStatus: "not_performed";
} | {
    ok: boolean;
    resumeStatus: "CHECKPOINT_RESUME_READY" | "CHECKPOINT_RESUME_DENIED" | "CHECKPOINT_RESUME_EDIT_REQUESTED" | "CHECKPOINT_RESUME_DRY_RUN_ONLY";
    resumeResultId: string;
    sourceCheckpointId: string;
    sourceRuntimeSpecId: string | null;
    sourceSleeveId: string | null;
    sourceGatePlanId: string | null;
    sourceRequestId: string;
    requestedToolName: string | null;
    requestedAction: string;
    decision: "dry_run_only" | "approve" | "deny" | "edit";
    previousApprovalStatus: "WAITING_FOR_APPROVAL";
    nextApprovalStatus: "DENIED" | "APPROVED" | "EDIT_REQUESTED" | "DRY_RUN_ONLY";
    allowedDecision: boolean;
    decisionAccepted: boolean;
    editRequested: boolean;
    dryRunOnly: boolean;
    executionEligible: boolean;
    updatedCheckpointProjection: RuntimeApprovalCheckpointV0;
    audit: {
        execution: "not_performed";
        toolExecution: "not_performed";
        approvalCheckpointResumed: boolean;
        approvalCheckpointPersistence: "not_persisted";
        triggerEvaluation: "not_performed";
        libraryMutation: "not_performed";
        packageMutation: "not_performed";
        restart: "not_performed";
        publish: "not_performed";
    };
    trace: string[];
    warnings: never[];
    errors: never[];
    version: string;
    entrypoint: string;
    mode: "runtime_approval_checkpoint_resume";
    outputContract: {
        contractId: "umg.runtime.approval_checkpoint.resume.v1";
        contractStatus: "NORMALIZED";
    };
    checkpointPersistence: "not_persisted";
    executionStatus: "not_performed";
};
export declare function executeApprovedAllowlistedRuntimeAction(version: string, entrypoint: string | undefined, root: string | undefined, input: {
    checkpoint?: RuntimeApprovalCheckpointV0;
    resumeResult?: RuntimeApprovalCheckpointResumeV0;
    runtimeSpec?: RuntimeSpecV0;
    gatePlan?: RuntimeExecutionGatePlanV0;
    actionArgs?: unknown;
    mode?: 'approved_execute' | 'dry_run' | string;
    includeTrace?: boolean;
}): RuntimeApprovedAllowlistedExecutionV0 & {
    ok: boolean;
    outputContract: {
        contractId: 'umg.runtime.execute_approved.allowlisted.v1';
        contractStatus: 'NORMALIZED';
    };
    errors?: Array<{
        code: string;
        message: string;
    }>;
    warnings?: string[];
};
export declare function runRuntimeExecutionChainE2EApprovedReadOnly(version: string, entrypoint?: string, root?: string, input?: {
    sleeveId?: string;
    requestedToolName?: string;
    requestedAction?: string;
    approvalDecision?: 'approve' | 'deny' | 'dry_run_only';
    mode?: 'e2e_approved_read_only' | 'dry_run' | string;
    includeTrace?: boolean;
}): {
    ok: boolean;
    outputContract: {
        contractId: "umg.runtime.execution_chain.e2e_approved_read_only.v1";
        contractStatus: "NORMALIZED";
    };
    chainRunId: string;
    chainStatus: "CHAIN_E2E_FAILED";
    sourceSleeveId: string;
    runtimeSpecId: null;
    classifierResultId: null;
    gatePlanId: null;
    checkpointId: null;
    resumeResultId: null;
    executionResultId: null;
    requestedToolName: string;
    requestedAction: string;
    approvalDecision: "dry_run_only" | "approve" | "deny";
    executionStatus: "not_performed";
    sideEffectStatus: "not_performed";
    resultSummary: string;
    resultPayload: null;
    classifierResult: null;
    gatePlanResult: null;
    checkpointCreateResult: null;
    checkpointResumeResult: null;
    executionResult: null;
    audit: {
        runtimeCompiled: boolean;
        classificationPerformed: boolean;
        gatePlanCreated: boolean;
        approvalCheckpointCreated: boolean;
        approvalCheckpointResumed: boolean;
        approvalVerified: boolean;
        allowlistVerified: boolean;
        readOnlyVerified: boolean;
        toolExecution: "not_performed";
        triggerEvaluation: "not_performed";
        libraryMutation: "not_performed";
        packageMutation: "not_performed";
        filesystemMutation: "not_performed";
        restart: "not_performed";
        publish: "not_performed";
    };
    trace: string[];
    warnings: string[];
    errors: never[] | {
        code: BlockLibraryHoldCode;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[];
} | {
    ok: boolean;
    outputContract: {
        contractId: "umg.runtime.execution_chain.e2e_approved_read_only.v1";
        contractStatus: "NORMALIZED";
    };
    chainRunId: string;
    chainStatus: "CHAIN_E2E_BLOCKED";
    sourceSleeveId: string;
    runtimeSpecId: string;
    classifierResultId: string;
    gatePlanId: string;
    checkpointId: null;
    resumeResultId: null;
    executionResultId: null;
    requestedToolName: string;
    requestedAction: string;
    approvalDecision: "dry_run_only" | "approve" | "deny";
    executionStatus: "not_performed";
    sideEffectStatus: "not_performed";
    resultSummary: string;
    resultPayload: null;
    classifierResult: {
        ok: boolean;
        classificationStatus: "CLASSIFICATION_HELD";
        sourceRuntimeSpecId: null;
        sleeveId: string | null;
        requestCount: number;
        classifications: never[];
        blockedCount: number;
        approvalRequiredCount: number;
        readOnlyCount: number;
        unknownCount: number;
        trace: string[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        version: string;
        entrypoint: string;
        mode: "runtime_tool_request_classify";
        outputContract: {
            contractId: "umg.runtime.tool_request.classify.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        audit: {
            execution: "not_performed";
            triggerEvaluation: "not_performed";
            approvalCheckpointCreated: boolean;
            toolExecution: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
    } | {
        ok: boolean;
        classificationStatus: string;
        sourceRuntimeSpecId: string;
        sleeveId: string;
        requestCount: number;
        classifications: RuntimeToolRequestClassificationV0[];
        blockedCount: number;
        approvalRequiredCount: number;
        readOnlyCount: number;
        unknownCount: number;
        trace: string[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        version: string;
        entrypoint: string;
        mode: "runtime_tool_request_classify";
        outputContract: {
            contractId: "umg.runtime.tool_request.classify.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        audit: {
            execution: "not_performed";
            triggerEvaluation: "not_performed";
            approvalCheckpointCreated: boolean;
            toolExecution: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
    };
    gatePlanResult: {
        ok: boolean;
        planStatus: "GATE_PLAN_HELD";
        gatePlanId: string;
        sourceRuntimeSpecId: string | null;
        sourceSleeveId: string | null;
        requestCount: number;
        plannedActions: never[];
        readOnlyCount: number;
        approvalRequiredCount: number;
        blockedCount: number;
        unknownCount: number;
        trace: string[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        version: string;
        entrypoint: string;
        mode: "runtime_execution_gate_plan";
        outputContract: {
            contractId: "umg.runtime.execution_gate.plan.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        checkpointCreated: false;
        audit: {
            execution: "not_performed";
            toolExecution: "not_performed";
            approvalCheckpointCreated: boolean;
            triggerEvaluation: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
    } | {
        ok: boolean;
        planStatus: "GATE_PLAN_READY" | "GATE_PLAN_PARTIAL";
        gatePlanId: string;
        sourceRuntimeSpecId: string | null;
        sourceSleeveId: string | null;
        requestCount: number;
        plannedActions: RuntimeExecutionGatePlannedActionV0[];
        readOnlyCount: number;
        approvalRequiredCount: number;
        blockedCount: number;
        unknownCount: number;
        trace: string[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        version: string;
        entrypoint: string;
        mode: "runtime_execution_gate_plan";
        outputContract: {
            contractId: "umg.runtime.execution_gate.plan.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        checkpointCreated: false;
        audit: {
            execution: "not_performed";
            toolExecution: "not_performed";
            approvalCheckpointCreated: boolean;
            triggerEvaluation: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
    };
    checkpointCreateResult: {
        ok: boolean;
        checkpointCreateStatus: "CHECKPOINT_CREATE_HELD";
        sourceRuntimeSpecId: string | null;
        sourceSleeveId: string | null;
        sourceGatePlanId: null;
        checkpointCount: number;
        checkpoints: never[];
        skippedActionCount: number;
        skippedActions: never[];
        audit: {
            execution: "not_performed";
            toolExecution: "not_performed";
            approvalCheckpointCreated: boolean;
            approvalCheckpointPersistence: "not_persisted";
            triggerEvaluation: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
        trace: string[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        version: string;
        entrypoint: string;
        mode: "runtime_approval_checkpoint_create";
        outputContract: {
            contractId: "umg.runtime.approval_checkpoint.create.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        checkpointPersistence: "not_persisted";
    } | {
        ok: boolean;
        checkpointCreateStatus: "CHECKPOINT_CREATE_READY" | "CHECKPOINT_CREATE_PARTIAL";
        sourceRuntimeSpecId: string | null;
        sourceSleeveId: string | null;
        sourceGatePlanId: string;
        checkpointCount: number;
        checkpoints: RuntimeApprovalCheckpointV0[];
        skippedActionCount: number;
        skippedActions: {
            requestId: string;
            requestedToolName: string | null;
            requestedAction: string;
            skipReason: string;
        }[];
        audit: {
            execution: "not_performed";
            toolExecution: "not_performed";
            approvalCheckpointCreated: boolean;
            approvalCheckpointPersistence: "not_persisted";
            triggerEvaluation: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
        trace: string[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        version: string;
        entrypoint: string;
        mode: "runtime_approval_checkpoint_create";
        outputContract: {
            contractId: "umg.runtime.approval_checkpoint.create.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        checkpointPersistence: "not_persisted";
    };
    checkpointResumeResult: null;
    executionResult: null;
    audit: {
        runtimeCompiled: boolean;
        classificationPerformed: boolean;
        gatePlanCreated: boolean;
        approvalCheckpointCreated: boolean;
        approvalCheckpointResumed: boolean;
        approvalVerified: boolean;
        allowlistVerified: boolean;
        readOnlyVerified: boolean;
        toolExecution: "not_performed";
        triggerEvaluation: "not_performed";
        libraryMutation: "not_performed";
        packageMutation: "not_performed";
        filesystemMutation: "not_performed";
        restart: "not_performed";
        publish: "not_performed";
    };
    trace: string[];
    warnings: string[];
    errors: {
        code: string;
        message: string;
    }[];
} | {
    ok: boolean;
    outputContract: {
        contractId: "umg.runtime.execution_chain.e2e_approved_read_only.v1";
        contractStatus: "NORMALIZED";
    };
    chainRunId: string;
    chainStatus: "CHAIN_E2E_READY" | "CHAIN_E2E_BLOCKED" | "CHAIN_E2E_FAILED";
    sourceSleeveId: string;
    runtimeSpecId: string;
    classifierResultId: string;
    gatePlanId: string;
    checkpointId: string;
    resumeResultId: string;
    executionResultId: string;
    requestedToolName: string;
    requestedAction: string;
    approvalDecision: "dry_run_only" | "approve" | "deny";
    executionStatus: RuntimeApprovedAllowlistedExecutionStatus;
    sideEffectStatus: "not_performed" | "read_only_no_mutation";
    resultSummary: string;
    resultPayload: unknown;
    classifierResult: {
        ok: boolean;
        classificationStatus: "CLASSIFICATION_HELD";
        sourceRuntimeSpecId: null;
        sleeveId: string | null;
        requestCount: number;
        classifications: never[];
        blockedCount: number;
        approvalRequiredCount: number;
        readOnlyCount: number;
        unknownCount: number;
        trace: string[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        version: string;
        entrypoint: string;
        mode: "runtime_tool_request_classify";
        outputContract: {
            contractId: "umg.runtime.tool_request.classify.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        audit: {
            execution: "not_performed";
            triggerEvaluation: "not_performed";
            approvalCheckpointCreated: boolean;
            toolExecution: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
    } | {
        ok: boolean;
        classificationStatus: string;
        sourceRuntimeSpecId: string;
        sleeveId: string;
        requestCount: number;
        classifications: RuntimeToolRequestClassificationV0[];
        blockedCount: number;
        approvalRequiredCount: number;
        readOnlyCount: number;
        unknownCount: number;
        trace: string[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        version: string;
        entrypoint: string;
        mode: "runtime_tool_request_classify";
        outputContract: {
            contractId: "umg.runtime.tool_request.classify.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        audit: {
            execution: "not_performed";
            triggerEvaluation: "not_performed";
            approvalCheckpointCreated: boolean;
            toolExecution: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
    };
    gatePlanResult: {
        ok: boolean;
        planStatus: "GATE_PLAN_HELD";
        gatePlanId: string;
        sourceRuntimeSpecId: string | null;
        sourceSleeveId: string | null;
        requestCount: number;
        plannedActions: never[];
        readOnlyCount: number;
        approvalRequiredCount: number;
        blockedCount: number;
        unknownCount: number;
        trace: string[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        version: string;
        entrypoint: string;
        mode: "runtime_execution_gate_plan";
        outputContract: {
            contractId: "umg.runtime.execution_gate.plan.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        checkpointCreated: false;
        audit: {
            execution: "not_performed";
            toolExecution: "not_performed";
            approvalCheckpointCreated: boolean;
            triggerEvaluation: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
    } | {
        ok: boolean;
        planStatus: "GATE_PLAN_READY" | "GATE_PLAN_PARTIAL";
        gatePlanId: string;
        sourceRuntimeSpecId: string | null;
        sourceSleeveId: string | null;
        requestCount: number;
        plannedActions: RuntimeExecutionGatePlannedActionV0[];
        readOnlyCount: number;
        approvalRequiredCount: number;
        blockedCount: number;
        unknownCount: number;
        trace: string[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        version: string;
        entrypoint: string;
        mode: "runtime_execution_gate_plan";
        outputContract: {
            contractId: "umg.runtime.execution_gate.plan.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        checkpointCreated: false;
        audit: {
            execution: "not_performed";
            toolExecution: "not_performed";
            approvalCheckpointCreated: boolean;
            triggerEvaluation: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
    };
    checkpointCreateResult: {
        ok: boolean;
        checkpointCreateStatus: "CHECKPOINT_CREATE_HELD";
        sourceRuntimeSpecId: string | null;
        sourceSleeveId: string | null;
        sourceGatePlanId: null;
        checkpointCount: number;
        checkpoints: never[];
        skippedActionCount: number;
        skippedActions: never[];
        audit: {
            execution: "not_performed";
            toolExecution: "not_performed";
            approvalCheckpointCreated: boolean;
            approvalCheckpointPersistence: "not_persisted";
            triggerEvaluation: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
        trace: string[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        version: string;
        entrypoint: string;
        mode: "runtime_approval_checkpoint_create";
        outputContract: {
            contractId: "umg.runtime.approval_checkpoint.create.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        checkpointPersistence: "not_persisted";
    } | {
        ok: boolean;
        checkpointCreateStatus: "CHECKPOINT_CREATE_READY" | "CHECKPOINT_CREATE_PARTIAL";
        sourceRuntimeSpecId: string | null;
        sourceSleeveId: string | null;
        sourceGatePlanId: string;
        checkpointCount: number;
        checkpoints: RuntimeApprovalCheckpointV0[];
        skippedActionCount: number;
        skippedActions: {
            requestId: string;
            requestedToolName: string | null;
            requestedAction: string;
            skipReason: string;
        }[];
        audit: {
            execution: "not_performed";
            toolExecution: "not_performed";
            approvalCheckpointCreated: boolean;
            approvalCheckpointPersistence: "not_persisted";
            triggerEvaluation: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
        trace: string[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        version: string;
        entrypoint: string;
        mode: "runtime_approval_checkpoint_create";
        outputContract: {
            contractId: "umg.runtime.approval_checkpoint.create.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        checkpointPersistence: "not_persisted";
    };
    checkpointResumeResult: {
        ok: boolean;
        resumeStatus: RuntimeApprovalCheckpointResumeStatus;
        resumeResultId: string;
        sourceCheckpointId: string;
        sourceRuntimeSpecId: string | null;
        sourceSleeveId: string | null;
        sourceGatePlanId: string | null;
        sourceRequestId: string;
        requestedToolName: string | null;
        requestedAction: string;
        decision: "dry_run_only" | "approve" | "deny" | "edit";
        previousApprovalStatus: RuntimeApprovalStatus;
        nextApprovalStatus: RuntimeApprovalStatus;
        allowedDecision: boolean;
        decisionAccepted: boolean;
        editRequested: boolean;
        dryRunOnly: boolean;
        executionEligible: boolean;
        updatedCheckpointProjection: null;
        audit: {
            execution: "not_performed";
            toolExecution: "not_performed";
            approvalCheckpointResumed: boolean;
            approvalCheckpointPersistence: "not_persisted";
            triggerEvaluation: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
        trace: string[];
        errors: {
            code: string;
            message: string;
        }[];
        warnings: never[];
        version: string;
        entrypoint: string;
        mode: "runtime_approval_checkpoint_resume";
        outputContract: {
            contractId: "umg.runtime.approval_checkpoint.resume.v1";
            contractStatus: "NORMALIZED";
        };
        checkpointPersistence: "not_persisted";
        executionStatus: "not_performed";
    } | {
        ok: boolean;
        resumeStatus: "CHECKPOINT_RESUME_READY" | "CHECKPOINT_RESUME_DENIED" | "CHECKPOINT_RESUME_EDIT_REQUESTED" | "CHECKPOINT_RESUME_DRY_RUN_ONLY";
        resumeResultId: string;
        sourceCheckpointId: string;
        sourceRuntimeSpecId: string | null;
        sourceSleeveId: string | null;
        sourceGatePlanId: string | null;
        sourceRequestId: string;
        requestedToolName: string | null;
        requestedAction: string;
        decision: "dry_run_only" | "approve" | "deny" | "edit";
        previousApprovalStatus: "WAITING_FOR_APPROVAL";
        nextApprovalStatus: "DENIED" | "APPROVED" | "EDIT_REQUESTED" | "DRY_RUN_ONLY";
        allowedDecision: boolean;
        decisionAccepted: boolean;
        editRequested: boolean;
        dryRunOnly: boolean;
        executionEligible: boolean;
        updatedCheckpointProjection: RuntimeApprovalCheckpointV0;
        audit: {
            execution: "not_performed";
            toolExecution: "not_performed";
            approvalCheckpointResumed: boolean;
            approvalCheckpointPersistence: "not_persisted";
            triggerEvaluation: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
        trace: string[];
        warnings: never[];
        errors: never[];
        version: string;
        entrypoint: string;
        mode: "runtime_approval_checkpoint_resume";
        outputContract: {
            contractId: "umg.runtime.approval_checkpoint.resume.v1";
            contractStatus: "NORMALIZED";
        };
        checkpointPersistence: "not_persisted";
        executionStatus: "not_performed";
    };
    executionResult: RuntimeApprovedAllowlistedExecutionV0 & {
        ok: boolean;
        outputContract: {
            contractId: "umg.runtime.execute_approved.allowlisted.v1";
            contractStatus: "NORMALIZED";
        };
        errors?: Array<{
            code: string;
            message: string;
        }>;
        warnings?: string[];
    };
    audit: {
        runtimeCompiled: boolean;
        classificationPerformed: boolean;
        gatePlanCreated: boolean;
        approvalCheckpointCreated: boolean;
        approvalCheckpointResumed: boolean;
        approvalVerified: boolean;
        allowlistVerified: boolean;
        readOnlyVerified: boolean;
        toolExecution: "not_performed" | "performed";
        triggerEvaluation: "not_performed";
        libraryMutation: "not_performed";
        packageMutation: "not_performed";
        filesystemMutation: "not_performed";
        restart: "not_performed";
        publish: "not_performed";
    };
    trace: string[];
    warnings: never[];
    errors: {
        code: string;
        message: string;
    }[];
};
export declare function inspectRuntimeActiveSleeveIrMatrixEnvelope(version: string, entrypoint?: string, root?: string, input?: {
    sleeveId?: string;
    includeNeoStacks?: boolean;
    includeNeoBlocks?: boolean;
    includeMoltBlocks?: boolean;
    includeRuntimeSpec?: boolean;
    includeIrMatrix?: boolean;
    includeEnvelope?: boolean;
    includeExecutionGateState?: boolean;
    mode?: 'inspect_only' | string;
}): {
    ok: boolean;
    outputContract: {
        contractId: "umg.runtime.active_sleeve_ir_matrix_envelope.inspect.v1";
        contractStatus: "NORMALIZED";
    };
    inspectorRunId: string;
    inspectorStatus: "INSPECTOR_READY" | "INSPECTOR_PARTIAL";
    sourceSleeveId: string;
    activeSleeve: {
        sleeveId: string;
        sleeveName: string;
        sleeveSource: string;
        sleeveStatus: string;
        sourceCatalog: string;
        resolvedFrom: string;
        selectedExplicitly: boolean;
        runtimeEligible: boolean;
        warningList: string[];
        graphStatus: "INDEXED_REFERENCE_ONLY" | null;
        sourcePath: string | null;
        catalogPath: string | null;
    };
    activeNeoStacks: {
        count: number;
        status: string;
        reason: string | null;
        items: {
            neoStackId: any;
            displayName: any;
            declaredRef: any;
            sourcePath: string | null;
            manifestEntry: string | null;
            activeStatus: string;
            reasonActive: string;
            reasonUnavailable: null;
            declaredNeoBlockRefs: string[];
            resolvedNeoBlockCount: number;
            blockedNeoBlockCount: number;
            warnings: never[];
        }[] | {
            neoStackId: null;
            displayName: null;
            declaredRef: null;
            sourcePath: string | null;
            manifestEntry: string | null;
            activeStatus: string;
            reasonActive: null;
            reasonUnavailable: string;
            declaredNeoBlockRefs: string[];
            resolvedNeoBlockCount: number;
            blockedNeoBlockCount: number;
            warnings: string[];
        }[];
    };
    activeNeoBlocks: {
        count: number;
        status: string;
        reason: string | null;
        items: {
            neoBlockId: any;
            parentNeoStackId: null;
            declaredRef: any;
            resolvedPath: string | null;
            manifestSource: string | null;
            loadStatus: any;
            visibleMoltFragmentCount: number;
            extractedMoltTypes: any[];
            contentSummary: any;
            warnings: any;
        }[];
    };
    activeMoltBlocks: {
        source: string;
        sleeveNativeMoltFragmentsAvailable: boolean;
        reason: string | null;
        groups: Record<string, any[]>;
    };
    runtimeSpec: {
        ok: boolean;
        compileStatus: "HELD";
        runtimeSpecVersion: string;
        runtimeSpecId: null;
        sleeveId: string | null;
        activeBlocks: never[];
        moltMap: {};
        promptParts: never[];
        strategy: null;
        constraints: null;
        context: null;
        values: null;
        format: null;
        toolRequests: never[];
        warnings: string[];
        errors: never[] | {
            code: BlockLibraryHoldCode;
            message: string;
        }[] | {
            code: string;
            message: string;
        }[] | {
            code: string;
            message: string;
        }[] | {
            code: string;
            message: string;
        }[] | {
            code: string;
            message: string;
        }[] | {
            code: string;
            message: string;
        }[];
        trace: {
            resolutionStatus: "RESOLVED" | "PARTIAL" | "HELD" | "DENIED";
            strictness?: undefined;
        };
        version: string;
        entrypoint: string;
        mode: "runtime_compile";
        outputContract: {
            contractId: "umg.runtime.compile.v1";
            contractStatus: "NORMALIZED";
        };
        readOnly: true;
        execution: "not_performed";
        directSource: "not_enabled";
    } | {
        ok: boolean;
        compileStatus: string;
        runtimeSpecVersion: "RuntimeSpecV0";
        runtimeSpecId: string;
        sleeveId: string;
        activeBlocks: string[];
        moltMap: Record<string, string>;
        promptParts: {
            field: string;
            text: string;
            sourceBlockId: string | null;
        }[];
        strategy: string | null;
        constraints: string | null;
        context: {
            subject: string | null;
            primary: string | null;
        };
        values: string | null;
        format: string | null;
        toolRequests: {
            kind: string;
            sourceBlockId: string | null;
            declaredAction: string;
        }[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        trace: {
            resolutionStatus: "RESOLVED" | "PARTIAL" | "HELD" | "DENIED";
            strictness: string;
        };
        version: string;
        entrypoint: string;
        mode: "runtime_compile";
        outputContract: {
            contractId: "umg.runtime.compile.v1";
            contractStatus: "NORMALIZED";
        };
        readOnly: true;
        execution: "not_performed";
        directSource: "not_enabled";
    } | null;
    activeStackProjection: BlockLibraryActiveStackProjectionResult;
    moltMapProjection: {};
    irMatrixProjection: {
        matrixId: string;
        nodes: any[];
        edges: any[];
        activeRoute: string[];
        blockedRoute: string[];
        offRoute: never[];
        hierarchyEdges: string[];
        siblingEdges: never[];
        toolRequestEdges: string[];
        checkpointEdges: string[];
        executionEdges: string[];
        symbolsLegend: {
            sleeve: string;
            neoStack: string;
            neoBlock: string;
            moltBlock: string;
            diagnostic: string;
            runtimeSpec: string;
            toolRequest: string;
            gatePlan: string;
            checkpoint: string;
            executionResult: string;
            envelope: string;
        };
    } | null;
    responseEnvelopePreview: {
        envelopeSource: any;
        envelopeStatus: any;
        heldReason: any;
        activeStack: BlockLibraryActiveStackProjectionResult;
        currentContextMoltMap: {};
        formalResponseContentPreview: BlockLibraryResponseEnvelopeFragmentResult | {
            ok: boolean;
            version: string;
            entrypoint: string;
            mode: string;
            outputContract: {
                contractId: string;
                contractStatus: string;
                sourceContractId: string;
                sourceMode: string;
                activeStackSourceContract: string;
                activeStackSourceStatus: string;
                automaticResponseTakeover: boolean;
                recursiveLoad: boolean;
                fullLibraryScan: boolean;
            };
            readOnly: boolean;
            execution: string;
            directSource: string;
            query: {
                neoblockIds: never[];
                project: string;
                currentState: string;
                activeTool: string;
                formalResponseContent: string;
                projectionFormat: string;
                includeMetadata: boolean;
                includeAudit: boolean;
                activeSleeve: string;
                activeStackBoundary: string;
                includeActiveStackProjection: boolean;
            };
            sourceComposition: null;
            sourceActiveStackProjection: BlockLibraryActiveStackProjectionResult;
            responseEnvelopeFragment: {
                fragmentStatus: string;
                fragmentKind: string;
                sections: {
                    activeStack: {};
                    envoyIntuition: {};
                    currentContextMoltMap: {};
                    formalResponseContent: {};
                    metadata: {};
                    audit: {};
                };
                sectionOrder: string[];
                automaticResponseTakeover: boolean;
                limitations: string[];
            };
            envelopeSource: string;
            envelopeStatus: string;
            heldReason: string;
            runtimeFallbackPreview: null;
            nlProjection: null;
            audit: {
                execution: string;
                triggerEvaluation: string;
                libraryMutation: string;
            };
            warnings: never[];
            errors: never[];
        };
        runtimeFallbackPreview: any;
        metadataTagsHelp: {
            runtimeSpecId: string | null;
            executionState: string;
        };
        executionState: string;
    } | null;
    toolRequestClassification: {
        ok: boolean;
        classificationStatus: "CLASSIFICATION_HELD";
        sourceRuntimeSpecId: null;
        sleeveId: string | null;
        requestCount: number;
        classifications: never[];
        blockedCount: number;
        approvalRequiredCount: number;
        readOnlyCount: number;
        unknownCount: number;
        trace: string[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        version: string;
        entrypoint: string;
        mode: "runtime_tool_request_classify";
        outputContract: {
            contractId: "umg.runtime.tool_request.classify.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        audit: {
            execution: "not_performed";
            triggerEvaluation: "not_performed";
            approvalCheckpointCreated: boolean;
            toolExecution: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
    } | {
        ok: boolean;
        classificationStatus: string;
        sourceRuntimeSpecId: string;
        sleeveId: string;
        requestCount: number;
        classifications: RuntimeToolRequestClassificationV0[];
        blockedCount: number;
        approvalRequiredCount: number;
        readOnlyCount: number;
        unknownCount: number;
        trace: string[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        version: string;
        entrypoint: string;
        mode: "runtime_tool_request_classify";
        outputContract: {
            contractId: "umg.runtime.tool_request.classify.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        audit: {
            execution: "not_performed";
            triggerEvaluation: "not_performed";
            approvalCheckpointCreated: boolean;
            toolExecution: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
    };
    executionGatePlan: {
        ok: boolean;
        planStatus: "GATE_PLAN_HELD";
        gatePlanId: string;
        sourceRuntimeSpecId: string | null;
        sourceSleeveId: string | null;
        requestCount: number;
        plannedActions: never[];
        readOnlyCount: number;
        approvalRequiredCount: number;
        blockedCount: number;
        unknownCount: number;
        trace: string[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        version: string;
        entrypoint: string;
        mode: "runtime_execution_gate_plan";
        outputContract: {
            contractId: "umg.runtime.execution_gate.plan.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        checkpointCreated: false;
        audit: {
            execution: "not_performed";
            toolExecution: "not_performed";
            approvalCheckpointCreated: boolean;
            triggerEvaluation: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
    } | {
        ok: boolean;
        planStatus: "GATE_PLAN_READY" | "GATE_PLAN_PARTIAL";
        gatePlanId: string;
        sourceRuntimeSpecId: string | null;
        sourceSleeveId: string | null;
        requestCount: number;
        plannedActions: RuntimeExecutionGatePlannedActionV0[];
        readOnlyCount: number;
        approvalRequiredCount: number;
        blockedCount: number;
        unknownCount: number;
        trace: string[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        version: string;
        entrypoint: string;
        mode: "runtime_execution_gate_plan";
        outputContract: {
            contractId: "umg.runtime.execution_gate.plan.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        checkpointCreated: false;
        audit: {
            execution: "not_performed";
            toolExecution: "not_performed";
            approvalCheckpointCreated: boolean;
            triggerEvaluation: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
    } | null;
    approvalCheckpointState: {
        ok: boolean;
        checkpointCreateStatus: "CHECKPOINT_CREATE_HELD";
        sourceRuntimeSpecId: string | null;
        sourceSleeveId: string | null;
        sourceGatePlanId: null;
        checkpointCount: number;
        checkpoints: never[];
        skippedActionCount: number;
        skippedActions: never[];
        audit: {
            execution: "not_performed";
            toolExecution: "not_performed";
            approvalCheckpointCreated: boolean;
            approvalCheckpointPersistence: "not_persisted";
            triggerEvaluation: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
        trace: string[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        version: string;
        entrypoint: string;
        mode: "runtime_approval_checkpoint_create";
        outputContract: {
            contractId: "umg.runtime.approval_checkpoint.create.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        checkpointPersistence: "not_persisted";
    } | {
        ok: boolean;
        checkpointCreateStatus: "CHECKPOINT_CREATE_READY" | "CHECKPOINT_CREATE_PARTIAL";
        sourceRuntimeSpecId: string | null;
        sourceSleeveId: string | null;
        sourceGatePlanId: string;
        checkpointCount: number;
        checkpoints: RuntimeApprovalCheckpointV0[];
        skippedActionCount: number;
        skippedActions: {
            requestId: string;
            requestedToolName: string | null;
            requestedAction: string;
            skipReason: string;
        }[];
        audit: {
            execution: "not_performed";
            toolExecution: "not_performed";
            approvalCheckpointCreated: boolean;
            approvalCheckpointPersistence: "not_persisted";
            triggerEvaluation: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
        trace: string[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        version: string;
        entrypoint: string;
        mode: "runtime_approval_checkpoint_create";
        outputContract: {
            contractId: "umg.runtime.approval_checkpoint.create.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        checkpointPersistence: "not_persisted";
    } | null;
    approvedExecutionState: (RuntimeApprovedAllowlistedExecutionV0 & {
        ok: boolean;
        outputContract: {
            contractId: "umg.runtime.execute_approved.allowlisted.v1";
            contractStatus: "NORMALIZED";
        };
        errors?: Array<{
            code: string;
            message: string;
        }>;
        warnings?: string[];
    }) | null;
    executionGateState: {
        toolRequestsCount: any;
        classifications: any;
        blockedCount: any;
        approvalRequiredCount: any;
        readOnlyCount: any;
        checkpointStatus: "CHECKPOINT_CREATE_READY" | "CHECKPOINT_CREATE_PARTIAL" | "CHECKPOINT_CREATE_HELD";
        checkpointCount: number;
        executionResultStatus: string;
        blockedReasons: any;
        allowedReadOnlyActions: any;
    } | null;
    inspectorCompleteness: {
        activeSleeve: string;
        neoStacks: string;
        neoBlocks: string;
        moltBlocks: string;
        runtimeSpec: string;
        irMatrix: string;
        envelope: string;
        executionGateState: string;
    };
    overallCompleteness: string;
    executionStatus: "not_performed";
    warnings: string[];
    errors: never[] | {
        code: BlockLibraryHoldCode;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[];
    audit: {
        execution: "not_performed";
        toolExecution: "not_performed";
        triggerEvaluation: "not_performed";
        libraryMutation: "not_performed";
        packageMutation: "not_performed";
        filesystemMutation: "not_performed";
        restart: "not_performed";
        publish: "not_performed";
    };
    trace: string[];
};
export declare function getCurrentRuntimeSleeveSession(version: string, entrypoint?: string, root?: string, input?: {
    includeInspection?: boolean;
    includeRuntimePreview?: boolean;
    includeTrace?: boolean;
}): RuntimeSleeveSessionStateV0;
export declare function selectRuntimeSleeveSession(version: string, entrypoint: string | undefined, root: string | undefined, input: {
    sleeveId: string;
    selectionReason?: string;
    persistenceMode?: RuntimeSleeveSessionPersistenceMode;
    includeInspection?: boolean;
    includeRuntimePreview?: boolean;
    includeTrace?: boolean;
}): RuntimeSleeveSessionStateV0;
export declare function clearRuntimeSleeveSession(input?: {
    clearReason?: string;
    includePreviousState?: boolean;
    includeTrace?: boolean;
}): RuntimeSleeveSessionStateV0;
export declare function inspectRuntimeSleeveSession(version: string, entrypoint?: string, root?: string, input?: {
    includeNeoStacks?: boolean;
    includeNeoBlocks?: boolean;
    includeMoltBlocks?: boolean;
    includeRuntimeSpec?: boolean;
    includeIrMatrix?: boolean;
    includeEnvelope?: boolean;
    includeExecutionGateState?: boolean;
    includeTrace?: boolean;
}): RuntimeSleeveSessionStateV0;
export declare function inspectRuntimeSleeveGraphRichness(version: string, entrypoint?: string, root?: string, input?: {
    sleeveId?: string;
    useActiveSessionSleeve?: boolean;
    includeNeoStacks?: boolean;
    includeNeoBlocks?: boolean;
    includeMoltFragments?: boolean;
    includeToolRequests?: boolean;
    includeRuntimeSpec?: boolean;
    includeIrMatrix?: boolean;
    includeEnvelope?: boolean;
    includeDiagnostics?: boolean;
    includeTrace?: boolean;
}): {
    ok: boolean;
    outputContract: {
        contractId: "umg.runtime.sleeve_graph.richness.v1";
        contractStatus: "NORMALIZED";
    };
    graphStatus: "GRAPH_PARTIAL" | "GRAPH_READY" | "GRAPH_ERROR";
    sourceSleeveId: string;
    activeSessionUsed: boolean;
    sleeveSummary: {
        sleeveId: string;
        sessionState: string;
        graphStatus: string | null;
        declaredNeoStacks: number;
        declaredNeoBlocks: number;
    };
    neoStackSummary: {
        count: any;
        status: string;
        reason: string | null;
        items: any;
        source: string;
    } | null;
    neoBlockSummary: {
        count: any;
        status: string;
        reason: string | null;
        items: any;
        source: string;
    } | null;
    moltFragmentSummary: {
        visibleCount: any;
        source: string;
        groups: {
            Trigger: any;
            Directive: any;
            Instruction: any;
            Subject: any;
            Primary: any;
            Philosophy: any;
            Blueprint: any;
            Off: never[];
            excluded: never[];
        };
    } | {
        visibleCount: number;
        source: string;
        groups: Record<string, any[]>;
    } | null;
    toolRequestSummary: {
        requestCount: any;
        requests: any;
    } | null;
    runtimeSpecSummary: {
        runtimeSpecId: any;
        sourceMode: string;
        activeBlockCount: any;
        usesSleeveNativeBlocks: boolean;
        usesSampleBlocks: boolean;
        previewStatus: string;
        sourceProvenance: {
            nativeGraphAvailable: boolean;
            sampleFallbackUsed: boolean;
            legacyPreviewResidueDetected: boolean;
            legacyPreviewResiduePaths: never[];
            sourceMode: string;
            routePurity: string;
        };
        routeWarnings: never[];
    } | {
        sourceMode: string;
        usesSleeveNativeBlocks: boolean | null;
        usesSampleBlocks: boolean | null;
        sourceProvenance: {
            nativeGraphAvailable: boolean;
            sampleFallbackUsed: boolean;
            legacyPreviewResidueDetected: boolean;
            legacyPreviewResiduePaths: string[];
            sourceMode: string;
            routePurity: string;
        };
        routeWarnings: string[];
        runtimeSpecId: string | null;
        activeBlockCount: number;
        previewStatus: string;
        provenance: import("./native-graph-types.js").NativeGraphProvenance | null;
    } | {
        sourceMode: string;
        usesSleeveNativeBlocks: boolean | null;
        usesSampleBlocks: boolean | null;
        sourceProvenance: {
            nativeGraphAvailable: boolean;
            sampleFallbackUsed: boolean;
            legacyPreviewResidueDetected: boolean;
            legacyPreviewResiduePaths: string[];
            sourceMode: string;
            routePurity: string;
        };
        routeWarnings: string[];
        runtimeSpecId: string | null;
        activeBlockCount: number;
        previewStatus: string;
        provenance?: undefined;
    } | null;
    irMatrixSummary: {
        matrixId: any;
        nodeCount: any;
        edgeCount: any;
        activeRoute: any;
        blockedRoute: never[];
        sourceMode: string;
        sourceProvenance: {
            nativeGraphAvailable: boolean;
            sampleFallbackUsed: boolean;
            legacyPreviewResidueDetected: boolean;
            legacyPreviewResiduePaths: never[];
            sourceMode: string;
            routePurity: string;
        };
        routePurity: string;
    } | {
        sourceMode: string;
        sourceProvenance: {
            nativeGraphAvailable: boolean;
            sampleFallbackUsed: boolean;
            legacyPreviewResidueDetected: boolean;
            legacyPreviewResiduePaths: string[];
            sourceMode: string;
            routePurity: string;
        };
        routePurity: string;
        matrixId: string | null;
        nodeCount: number;
        edgeCount: number;
        activeRoute: any[];
        blockedRoute: never[];
        provenance: import("./native-graph-types.js").NativeGraphProvenance | null;
    } | {
        sourceMode: string;
        sourceProvenance: {
            nativeGraphAvailable: boolean;
            sampleFallbackUsed: boolean;
            legacyPreviewResidueDetected: boolean;
            legacyPreviewResiduePaths: string[];
            sourceMode: string;
            routePurity: string;
        };
        routePurity: string;
        matrixId: string | null;
        nodeCount: number;
        edgeCount: number;
        activeRoute: string[];
        blockedRoute: string[];
        provenance?: undefined;
    } | null;
    envelopeSummary: {
        envelopeStatus: string;
        envelopeSource: any;
        heldReason: null;
        sourceMode: string;
        sourceProvenance: {
            nativeGraphAvailable: boolean;
            sampleFallbackUsed: boolean;
            legacyPreviewResidueDetected: boolean;
            legacyPreviewResiduePaths: never[];
            sourceMode: string;
            routePurity: string;
        };
        routePurity: string;
        routeWarnings: never[];
    } | {
        sourceMode: string;
        sourceProvenance: {
            nativeGraphAvailable: boolean;
            sampleFallbackUsed: boolean;
            legacyPreviewResidueDetected: boolean;
            legacyPreviewResiduePaths: string[];
            sourceMode: string;
            routePurity: string;
        };
        routePurity: string;
        routeWarnings: string[];
        envelopeStatus: string;
        envelopeSource: "sleeve_native_derived" | "sample_fallback" | "legacy_preview_residue" | "sleeve_native_declared";
        heldReason: null;
        provenance: import("./native-graph-types.js").NativeGraphProvenance | null;
    } | {
        sourceMode: string;
        sourceProvenance: {
            nativeGraphAvailable: boolean;
            sampleFallbackUsed: boolean;
            legacyPreviewResidueDetected: boolean;
            legacyPreviewResiduePaths: string[];
            sourceMode: string;
            routePurity: string;
        };
        routePurity: string;
        routeWarnings: string[];
        envelopeStatus: any;
        envelopeSource: any;
        heldReason: any;
        provenance?: undefined;
    } | null;
    graphCompleteness: string;
    diagnostics: {
        graphRunId: string;
        overallCompleteness: string;
        neoStackReason: string | null;
        activeMoltSource: string;
        activeSessionAvailable: boolean;
        activeSessionSleeveId: any;
        sourceMode: string;
        sourceProvenance: {
            nativeGraphAvailable: boolean;
            sampleFallbackUsed: boolean;
            legacyPreviewResidueDetected: boolean;
            legacyPreviewResiduePaths: never[];
            sourceMode: string;
            routePurity: string;
        };
        nativeGraphAvailable: boolean;
        sampleFallbackUsed: boolean;
        legacyPreviewResidueDetected: boolean;
        legacyPreviewResiduePaths: never[];
        routePurity: string;
        routeWarnings: never[];
        nativeFixtureResolution: NativeFixtureResolutionDiagnostics;
        runtimeCodeIdentity: Record<string, unknown>;
        directSourceEnabled: boolean;
        automaticResponseTakeover: boolean;
        sleeveId: string;
    } | {
        graphRunId: string;
        overallCompleteness: string;
        neoStackReason: string | null;
        activeMoltSource: string;
        activeSessionAvailable: boolean;
        activeSessionSleeveId: string | null;
        sourceMode: string;
        sourceProvenance: {
            nativeGraphAvailable: boolean;
            sampleFallbackUsed: boolean;
            legacyPreviewResidueDetected: boolean;
            legacyPreviewResiduePaths: string[];
            sourceMode: string;
            routePurity: string;
        };
        nativeGraphAvailable: boolean;
        sampleFallbackUsed: boolean;
        legacyPreviewResidueDetected: boolean;
        legacyPreviewResiduePaths: string[];
        routePurity: string;
        routeWarnings: string[];
        nativeFixtureResolution: NativeFixtureResolutionDiagnostics;
        runtimeCodeIdentity: {
            moduleUrl: string;
            processCwd: string;
            resolvedPackageRoot: string;
            fixtureCandidateRoots: string[];
            lane: "ALPHA8_NATIVE_GRAPH_LIVE_CODE_IDENTITY_DIAGNOSIS_SOURCE";
            marker: "native-graph-fixture-resolution-parity-v2";
            expectedVersion: "0.3.0-alpha.11";
            buildIdentity: "native-graph-live-code-identity-2026-05-21";
        };
        directSourceEnabled: false;
        automaticResponseTakeover: false;
    } | null;
    warnings: string[];
    errors: never[] | {
        code: BlockLibraryHoldCode;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[];
    audit: {
        execution: "not_performed";
        toolExecution: "not_performed";
        libraryMutation: "not_performed";
        packageMutation: "not_performed";
        filesystemMutation: "not_performed";
        restart: "not_performed";
        publish: "not_performed";
        automaticResponseTakeover: boolean;
        directSource: "disabled";
    };
    trace: string[];
} | {
    ok: boolean;
    outputContract: {
        contractId: "umg.runtime.sleeve_graph.richness.v1";
        contractStatus: "NORMALIZED";
    };
    graphStatus: "GRAPH_BLOCKED";
    sourceSleeveId: null;
    activeSessionUsed: boolean;
    sleeveSummary: null;
    neoStackSummary: null;
    neoBlockSummary: null;
    moltFragmentSummary: null;
    toolRequestSummary: null;
    runtimeSpecSummary: null;
    irMatrixSummary: null;
    envelopeSummary: null;
    graphCompleteness: "blocked";
    diagnostics: {
        blockedReason: string;
        graphRunId: string;
    };
    warnings: never[];
    errors: {
        code: string;
        message: string;
    }[];
    audit: {
        execution: "not_performed";
        toolExecution: "not_performed";
        libraryMutation: "not_performed";
        packageMutation: "not_performed";
        filesystemMutation: "not_performed";
        restart: "not_performed";
        publish: "not_performed";
        automaticResponseTakeover: boolean;
        directSource: "disabled";
    };
    trace: string[];
};
export declare function runBoundedReadOnlyOrchestration(version: string, entrypoint?: string, root?: string, input?: {
    sleeveId?: string;
    useActiveSessionSleeve?: boolean;
    selectSession?: boolean;
    requestedToolName?: string;
    requestedAction?: string;
    approvalDecision?: 'approve' | 'deny' | 'edit' | 'dry_run_only';
    mode?: 'inspect_only' | 'dry_run' | 'approved_read_only' | string;
    includeInspector?: boolean;
    includeRuntimePreview?: boolean;
    includeIrMatrix?: boolean;
    includeEnvelope?: boolean;
    includeExecutionGateState?: boolean;
    includeTrace?: boolean;
}): {
    ok: boolean;
    outputContract: {
        contractId: "umg.runtime.orchestration.bounded_read_only.v1";
        contractStatus: "NORMALIZED";
    };
    orchestrationRunId: string;
    orchestrationStatus: "ORCHESTRATION_BLOCKED";
    sourceSleeveId: null;
    mode: "inspect_only" | "dry_run" | "approved_read_only";
    boundaryPolicy: {
        approvedOnly: boolean;
        allowlistedOnly: boolean;
        readOnlyOnly: boolean;
        broadAutonomousExecution: boolean;
        triggerEvaluationAsExecutionAuthority: boolean;
        externalMoltBlockFileLoading: boolean;
        fullLibraryScan: boolean;
        unboundedRecursiveTraversal: boolean;
        umgBlockLibraryMutation: boolean;
        restartExecution: boolean;
        publishExecution: boolean;
        packageExecution: boolean;
        automaticResponseTakeover: boolean;
        directSourceEnabled: boolean;
    };
    activeSleeveInspection: null;
    runtimePreview: null;
    runtimeSpecSummary: null;
    irMatrixSummary: null;
    envelopeSummary: null;
    toolRequestClassification: null;
    executionGatePlan: null;
    approvalCheckpointCreate: null;
    approvalCheckpointResume: null;
    approvedReadOnlyExecution: null;
    blockedActions: {
        requestedToolName: string;
        requestedAction: string;
        blockedReason: string;
    }[];
    warnings: never[];
    errors: {
        code: string;
        message: string;
    }[];
    audit: {
        inspectorPerformed: boolean;
        runtimePreviewPerformed: boolean;
        classificationPerformed: boolean;
        gatePlanCreated: boolean;
        approvalCheckpointCreated: boolean;
        approvalCheckpointResumed: boolean;
        readOnlyExecutionPerformed: boolean;
        triggerEvaluation: "not_performed";
        externalMoltBlockFileLoading: "not_performed";
        fullLibraryScan: "not_performed";
        unboundedRecursiveTraversal: "not_performed";
        libraryMutation: "not_performed";
        packageMutation: "not_performed";
        restart: "not_performed";
        publish: "not_performed";
        automaticResponseTakeover: boolean;
        directSource: "disabled";
    };
    trace: string[];
} | {
    ok: boolean;
    outputContract: {
        contractId: "umg.runtime.orchestration.bounded_read_only.v1";
        contractStatus: "NORMALIZED";
    };
    orchestrationRunId: string;
    orchestrationStatus: "ORCHESTRATION_BLOCKED" | "ORCHESTRATION_READY" | "ORCHESTRATION_PARTIAL";
    sourceSleeveId: string;
    mode: "dry_run" | "inspect_only" | "approved_read_only";
    boundaryPolicy: {
        approvedOnly: boolean;
        allowlistedOnly: boolean;
        readOnlyOnly: boolean;
        broadAutonomousExecution: boolean;
        triggerEvaluationAsExecutionAuthority: boolean;
        externalMoltBlockFileLoading: boolean;
        fullLibraryScan: boolean;
        unboundedRecursiveTraversal: boolean;
        umgBlockLibraryMutation: boolean;
        restartExecution: boolean;
        publishExecution: boolean;
        packageExecution: boolean;
        automaticResponseTakeover: boolean;
        directSourceEnabled: boolean;
    };
    activeSleeveInspection: {
        sleeveId: string;
        sleeveName: string;
        sleeveSource: string;
        sleeveStatus: string;
        sourceCatalog: string;
        resolvedFrom: string;
        selectedExplicitly: boolean;
        runtimeEligible: boolean;
        warningList: string[];
        graphStatus: "INDEXED_REFERENCE_ONLY" | null;
        sourcePath: string | null;
        catalogPath: string | null;
    } | null;
    runtimePreview: {
        ok: boolean;
        previewStatus: "HELD";
        runtimeSpec: null;
        activeStackProjection: null;
        moltMapProjection: null;
        responseEnvelopePreview: null;
        toolRequestPreview: never[];
        warnings: string[];
        errors: never[] | {
            code: BlockLibraryHoldCode;
            message: string;
        }[] | {
            code: string;
            message: string;
        }[] | {
            code: string;
            message: string;
        }[] | {
            code: string;
            message: string;
        }[] | {
            code: string;
            message: string;
        }[] | {
            code: string;
            message: string;
        }[] | {
            code: string;
            message: string;
        }[];
        nlProjection: string;
        version: string;
        entrypoint: string;
        mode: "runtime_preview";
        outputContract: {
            contractId: "umg.runtime.preview.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        directSource: "not_enabled";
    } | {
        ok: boolean;
        previewStatus: "PARTIAL" | "FAILED" | "RUNTIME_PREVIEW_READY";
        runtimeSpec: {
            runtimeSpecVersion: "RuntimeSpecV0";
            runtimeSpecId: string;
            sleeveId: string;
            activeBlocks: string[];
            toolRequests: {
                kind: string;
                sourceBlockId: string | null;
                declaredAction: string;
            }[];
            moltMap?: undefined;
            promptParts?: undefined;
            strategy?: undefined;
            constraints?: undefined;
            context?: undefined;
            values?: undefined;
            format?: undefined;
        } | {
            runtimeSpecVersion: "RuntimeSpecV0";
            runtimeSpecId: string;
            sleeveId: string;
            activeBlocks: string[];
            moltMap: Record<string, string>;
            promptParts: {
                field: string;
                text: string;
                sourceBlockId: string | null;
            }[];
            strategy: string | null;
            constraints: string | null;
            context: {
                subject: string | null;
                primary: string | null;
            };
            values: string | null;
            format: string | null;
            toolRequests: {
                kind: string;
                sourceBlockId: string | null;
                declaredAction: string;
            }[];
        };
        activeStackProjection: BlockLibraryActiveStackProjectionResult | null;
        moltMapProjection: Record<string, string> | null;
        responseEnvelopePreview: BlockLibraryResponseEnvelopeFragmentResult | null;
        toolRequestPreview: {
            kind: string;
            sourceBlockId: string | null;
            declaredAction: string;
        }[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        nlProjection: string;
        version: string;
        entrypoint: string;
        mode: "runtime_preview";
        outputContract: {
            contractId: "umg.runtime.preview.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        directSource: "not_enabled";
    } | null;
    runtimeSpecSummary: {
        ok: boolean;
        compileStatus: "HELD";
        runtimeSpecVersion: string;
        runtimeSpecId: null;
        sleeveId: string | null;
        activeBlocks: never[];
        moltMap: {};
        promptParts: never[];
        strategy: null;
        constraints: null;
        context: null;
        values: null;
        format: null;
        toolRequests: never[];
        warnings: string[];
        errors: never[] | {
            code: BlockLibraryHoldCode;
            message: string;
        }[] | {
            code: string;
            message: string;
        }[] | {
            code: string;
            message: string;
        }[] | {
            code: string;
            message: string;
        }[] | {
            code: string;
            message: string;
        }[] | {
            code: string;
            message: string;
        }[];
        trace: {
            resolutionStatus: "RESOLVED" | "PARTIAL" | "HELD" | "DENIED";
            strictness?: undefined;
        };
        version: string;
        entrypoint: string;
        mode: "runtime_compile";
        outputContract: {
            contractId: "umg.runtime.compile.v1";
            contractStatus: "NORMALIZED";
        };
        readOnly: true;
        execution: "not_performed";
        directSource: "not_enabled";
    } | {
        runtimeSpecVersion: "RuntimeSpecV0";
        runtimeSpecId: string;
        sleeveId: string;
        activeBlocks: string[];
        toolRequests: {
            kind: string;
            sourceBlockId: string | null;
            declaredAction: string;
        }[];
        moltMap?: undefined;
        promptParts?: undefined;
        strategy?: undefined;
        constraints?: undefined;
        context?: undefined;
        values?: undefined;
        format?: undefined;
    } | {
        runtimeSpecVersion: "RuntimeSpecV0";
        runtimeSpecId: string;
        sleeveId: string;
        activeBlocks: string[];
        moltMap: Record<string, string>;
        promptParts: {
            field: string;
            text: string;
            sourceBlockId: string | null;
        }[];
        strategy: string | null;
        constraints: string | null;
        context: {
            subject: string | null;
            primary: string | null;
        };
        values: string | null;
        format: string | null;
        toolRequests: {
            kind: string;
            sourceBlockId: string | null;
            declaredAction: string;
        }[];
    } | null;
    irMatrixSummary: {
        matrixId: string;
        nodes: any[];
        edges: any[];
        activeRoute: string[];
        blockedRoute: string[];
        offRoute: never[];
        hierarchyEdges: string[];
        siblingEdges: never[];
        toolRequestEdges: string[];
        checkpointEdges: string[];
        executionEdges: string[];
        symbolsLegend: {
            sleeve: string;
            neoStack: string;
            neoBlock: string;
            moltBlock: string;
            diagnostic: string;
            runtimeSpec: string;
            toolRequest: string;
            gatePlan: string;
            checkpoint: string;
            executionResult: string;
            envelope: string;
        };
    } | null;
    envelopeSummary: {
        envelopeSource: any;
        envelopeStatus: any;
        heldReason: any;
        activeStack: BlockLibraryActiveStackProjectionResult;
        currentContextMoltMap: {};
        formalResponseContentPreview: BlockLibraryResponseEnvelopeFragmentResult | {
            ok: boolean;
            version: string;
            entrypoint: string;
            mode: string;
            outputContract: {
                contractId: string;
                contractStatus: string;
                sourceContractId: string;
                sourceMode: string;
                activeStackSourceContract: string;
                activeStackSourceStatus: string;
                automaticResponseTakeover: boolean;
                recursiveLoad: boolean;
                fullLibraryScan: boolean;
            };
            readOnly: boolean;
            execution: string;
            directSource: string;
            query: {
                neoblockIds: never[];
                project: string;
                currentState: string;
                activeTool: string;
                formalResponseContent: string;
                projectionFormat: string;
                includeMetadata: boolean;
                includeAudit: boolean;
                activeSleeve: string;
                activeStackBoundary: string;
                includeActiveStackProjection: boolean;
            };
            sourceComposition: null;
            sourceActiveStackProjection: BlockLibraryActiveStackProjectionResult;
            responseEnvelopeFragment: {
                fragmentStatus: string;
                fragmentKind: string;
                sections: {
                    activeStack: {};
                    envoyIntuition: {};
                    currentContextMoltMap: {};
                    formalResponseContent: {};
                    metadata: {};
                    audit: {};
                };
                sectionOrder: string[];
                automaticResponseTakeover: boolean;
                limitations: string[];
            };
            envelopeSource: string;
            envelopeStatus: string;
            heldReason: string;
            runtimeFallbackPreview: null;
            nlProjection: null;
            audit: {
                execution: string;
                triggerEvaluation: string;
                libraryMutation: string;
            };
            warnings: never[];
            errors: never[];
        };
        runtimeFallbackPreview: any;
        metadataTagsHelp: {
            runtimeSpecId: string | null;
            executionState: string;
        };
        executionState: string;
    } | null;
    toolRequestClassification: {
        ok: boolean;
        classificationStatus: "CLASSIFICATION_HELD";
        sourceRuntimeSpecId: null;
        sleeveId: string | null;
        requestCount: number;
        classifications: never[];
        blockedCount: number;
        approvalRequiredCount: number;
        readOnlyCount: number;
        unknownCount: number;
        trace: string[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        version: string;
        entrypoint: string;
        mode: "runtime_tool_request_classify";
        outputContract: {
            contractId: "umg.runtime.tool_request.classify.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        audit: {
            execution: "not_performed";
            triggerEvaluation: "not_performed";
            approvalCheckpointCreated: boolean;
            toolExecution: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
    } | {
        ok: boolean;
        classificationStatus: string;
        sourceRuntimeSpecId: string;
        sleeveId: string;
        requestCount: number;
        classifications: RuntimeToolRequestClassificationV0[];
        blockedCount: number;
        approvalRequiredCount: number;
        readOnlyCount: number;
        unknownCount: number;
        trace: string[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        version: string;
        entrypoint: string;
        mode: "runtime_tool_request_classify";
        outputContract: {
            contractId: "umg.runtime.tool_request.classify.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        audit: {
            execution: "not_performed";
            triggerEvaluation: "not_performed";
            approvalCheckpointCreated: boolean;
            toolExecution: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
    } | null;
    executionGatePlan: {
        ok: boolean;
        planStatus: "GATE_PLAN_HELD";
        gatePlanId: string;
        sourceRuntimeSpecId: string | null;
        sourceSleeveId: string | null;
        requestCount: number;
        plannedActions: never[];
        readOnlyCount: number;
        approvalRequiredCount: number;
        blockedCount: number;
        unknownCount: number;
        trace: string[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        version: string;
        entrypoint: string;
        mode: "runtime_execution_gate_plan";
        outputContract: {
            contractId: "umg.runtime.execution_gate.plan.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        checkpointCreated: false;
        audit: {
            execution: "not_performed";
            toolExecution: "not_performed";
            approvalCheckpointCreated: boolean;
            triggerEvaluation: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
    } | {
        ok: boolean;
        planStatus: "GATE_PLAN_READY" | "GATE_PLAN_PARTIAL";
        gatePlanId: string;
        sourceRuntimeSpecId: string | null;
        sourceSleeveId: string | null;
        requestCount: number;
        plannedActions: RuntimeExecutionGatePlannedActionV0[];
        readOnlyCount: number;
        approvalRequiredCount: number;
        blockedCount: number;
        unknownCount: number;
        trace: string[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        version: string;
        entrypoint: string;
        mode: "runtime_execution_gate_plan";
        outputContract: {
            contractId: "umg.runtime.execution_gate.plan.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        checkpointCreated: false;
        audit: {
            execution: "not_performed";
            toolExecution: "not_performed";
            approvalCheckpointCreated: boolean;
            triggerEvaluation: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
    } | null;
    approvalCheckpointCreate: {
        ok: boolean;
        checkpointCreateStatus: "CHECKPOINT_CREATE_HELD";
        sourceRuntimeSpecId: string | null;
        sourceSleeveId: string | null;
        sourceGatePlanId: null;
        checkpointCount: number;
        checkpoints: never[];
        skippedActionCount: number;
        skippedActions: never[];
        audit: {
            execution: "not_performed";
            toolExecution: "not_performed";
            approvalCheckpointCreated: boolean;
            approvalCheckpointPersistence: "not_persisted";
            triggerEvaluation: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
        trace: string[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        version: string;
        entrypoint: string;
        mode: "runtime_approval_checkpoint_create";
        outputContract: {
            contractId: "umg.runtime.approval_checkpoint.create.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        checkpointPersistence: "not_persisted";
    } | {
        ok: boolean;
        checkpointCreateStatus: "CHECKPOINT_CREATE_READY" | "CHECKPOINT_CREATE_PARTIAL";
        sourceRuntimeSpecId: string | null;
        sourceSleeveId: string | null;
        sourceGatePlanId: string;
        checkpointCount: number;
        checkpoints: RuntimeApprovalCheckpointV0[];
        skippedActionCount: number;
        skippedActions: {
            requestId: string;
            requestedToolName: string | null;
            requestedAction: string;
            skipReason: string;
        }[];
        audit: {
            execution: "not_performed";
            toolExecution: "not_performed";
            approvalCheckpointCreated: boolean;
            approvalCheckpointPersistence: "not_persisted";
            triggerEvaluation: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
        trace: string[];
        warnings: string[];
        errors: {
            code: string;
            message: string;
        }[];
        version: string;
        entrypoint: string;
        mode: "runtime_approval_checkpoint_create";
        outputContract: {
            contractId: "umg.runtime.approval_checkpoint.create.v1";
            contractStatus: "NORMALIZED";
        };
        executionStatus: "not_performed";
        checkpointPersistence: "not_persisted";
    } | null;
    approvalCheckpointResume: {
        ok: boolean;
        resumeStatus: RuntimeApprovalCheckpointResumeStatus;
        resumeResultId: string;
        sourceCheckpointId: string;
        sourceRuntimeSpecId: string | null;
        sourceSleeveId: string | null;
        sourceGatePlanId: string | null;
        sourceRequestId: string;
        requestedToolName: string | null;
        requestedAction: string;
        decision: "dry_run_only" | "approve" | "deny" | "edit";
        previousApprovalStatus: RuntimeApprovalStatus;
        nextApprovalStatus: RuntimeApprovalStatus;
        allowedDecision: boolean;
        decisionAccepted: boolean;
        editRequested: boolean;
        dryRunOnly: boolean;
        executionEligible: boolean;
        updatedCheckpointProjection: null;
        audit: {
            execution: "not_performed";
            toolExecution: "not_performed";
            approvalCheckpointResumed: boolean;
            approvalCheckpointPersistence: "not_persisted";
            triggerEvaluation: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
        trace: string[];
        errors: {
            code: string;
            message: string;
        }[];
        warnings: never[];
        version: string;
        entrypoint: string;
        mode: "runtime_approval_checkpoint_resume";
        outputContract: {
            contractId: "umg.runtime.approval_checkpoint.resume.v1";
            contractStatus: "NORMALIZED";
        };
        checkpointPersistence: "not_persisted";
        executionStatus: "not_performed";
    } | {
        ok: boolean;
        resumeStatus: "CHECKPOINT_RESUME_READY" | "CHECKPOINT_RESUME_DENIED" | "CHECKPOINT_RESUME_EDIT_REQUESTED" | "CHECKPOINT_RESUME_DRY_RUN_ONLY";
        resumeResultId: string;
        sourceCheckpointId: string;
        sourceRuntimeSpecId: string | null;
        sourceSleeveId: string | null;
        sourceGatePlanId: string | null;
        sourceRequestId: string;
        requestedToolName: string | null;
        requestedAction: string;
        decision: "dry_run_only" | "approve" | "deny" | "edit";
        previousApprovalStatus: "WAITING_FOR_APPROVAL";
        nextApprovalStatus: "DENIED" | "APPROVED" | "EDIT_REQUESTED" | "DRY_RUN_ONLY";
        allowedDecision: boolean;
        decisionAccepted: boolean;
        editRequested: boolean;
        dryRunOnly: boolean;
        executionEligible: boolean;
        updatedCheckpointProjection: RuntimeApprovalCheckpointV0;
        audit: {
            execution: "not_performed";
            toolExecution: "not_performed";
            approvalCheckpointResumed: boolean;
            approvalCheckpointPersistence: "not_persisted";
            triggerEvaluation: "not_performed";
            libraryMutation: "not_performed";
            packageMutation: "not_performed";
            restart: "not_performed";
            publish: "not_performed";
        };
        trace: string[];
        warnings: never[];
        errors: never[];
        version: string;
        entrypoint: string;
        mode: "runtime_approval_checkpoint_resume";
        outputContract: {
            contractId: "umg.runtime.approval_checkpoint.resume.v1";
            contractStatus: "NORMALIZED";
        };
        checkpointPersistence: "not_persisted";
        executionStatus: "not_performed";
    } | null;
    approvedReadOnlyExecution: (RuntimeApprovedAllowlistedExecutionV0 & {
        ok: boolean;
        outputContract: {
            contractId: "umg.runtime.execute_approved.allowlisted.v1";
            contractStatus: "NORMALIZED";
        };
        errors?: Array<{
            code: string;
            message: string;
        }>;
        warnings?: string[];
    }) | null;
    blockedActions: {
        requestedToolName: string;
        requestedAction: string;
        blockedReason: string;
    }[];
    warnings: string[];
    errors: {
        code: string;
        message: string;
    }[];
    audit: {
        inspectorPerformed: boolean;
        runtimePreviewPerformed: boolean;
        classificationPerformed: boolean;
        gatePlanCreated: boolean;
        approvalCheckpointCreated: boolean;
        approvalCheckpointResumed: boolean;
        readOnlyExecutionPerformed: boolean;
        triggerEvaluation: "not_performed";
        externalMoltBlockFileLoading: "not_performed";
        fullLibraryScan: "not_performed";
        unboundedRecursiveTraversal: "not_performed";
        libraryMutation: "not_performed";
        packageMutation: "not_performed";
        restart: "not_performed";
        publish: "not_performed";
        automaticResponseTakeover: boolean;
        directSource: "disabled";
    };
    trace: string[];
};
export declare function previewRuntimeSleeve(version: string, entrypoint?: string, root?: string, input?: {
    sleeveId?: string;
    runtimeSessionId?: string;
    previewFormat?: 'summary' | 'full' | 'nl' | string;
    includeActiveStack?: boolean;
    includeMoltMap?: boolean;
    includeEnvelope?: boolean;
    includeToolRequests?: boolean;
}): {
    ok: boolean;
    previewStatus: "HELD";
    runtimeSpec: null;
    activeStackProjection: null;
    moltMapProjection: null;
    responseEnvelopePreview: null;
    toolRequestPreview: never[];
    warnings: string[];
    errors: never[] | {
        code: BlockLibraryHoldCode;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[] | {
        code: string;
        message: string;
    }[];
    nlProjection: string;
    version: string;
    entrypoint: string;
    mode: "runtime_preview";
    outputContract: {
        contractId: "umg.runtime.preview.v1";
        contractStatus: "NORMALIZED";
    };
    executionStatus: "not_performed";
    directSource: "not_enabled";
} | {
    ok: boolean;
    previewStatus: "PARTIAL" | "FAILED" | "RUNTIME_PREVIEW_READY";
    runtimeSpec: {
        runtimeSpecVersion: "RuntimeSpecV0";
        runtimeSpecId: string;
        sleeveId: string;
        activeBlocks: string[];
        toolRequests: {
            kind: string;
            sourceBlockId: string | null;
            declaredAction: string;
        }[];
        moltMap?: undefined;
        promptParts?: undefined;
        strategy?: undefined;
        constraints?: undefined;
        context?: undefined;
        values?: undefined;
        format?: undefined;
    } | {
        runtimeSpecVersion: "RuntimeSpecV0";
        runtimeSpecId: string;
        sleeveId: string;
        activeBlocks: string[];
        moltMap: Record<string, string>;
        promptParts: {
            field: string;
            text: string;
            sourceBlockId: string | null;
        }[];
        strategy: string | null;
        constraints: string | null;
        context: {
            subject: string | null;
            primary: string | null;
        };
        values: string | null;
        format: string | null;
        toolRequests: {
            kind: string;
            sourceBlockId: string | null;
            declaredAction: string;
        }[];
    };
    activeStackProjection: BlockLibraryActiveStackProjectionResult | null;
    moltMapProjection: Record<string, string> | null;
    responseEnvelopePreview: BlockLibraryResponseEnvelopeFragmentResult | null;
    toolRequestPreview: {
        kind: string;
        sourceBlockId: string | null;
        declaredAction: string;
    }[];
    warnings: string[];
    errors: {
        code: string;
        message: string;
    }[];
    nlProjection: string;
    version: string;
    entrypoint: string;
    mode: "runtime_preview";
    outputContract: {
        contractId: "umg.runtime.preview.v1";
        contractStatus: "NORMALIZED";
    };
    executionStatus: "not_performed";
    directSource: "not_enabled";
};
export declare function getBlockLibraryStatus(version: string, entrypoint?: string, root?: string): BlockLibraryStatusResult;
export {};
