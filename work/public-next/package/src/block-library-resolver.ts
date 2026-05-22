import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from 'node:url';
import { projectNativeSleeveGraph } from './native-graph-adapter.js';

export type BlockLibraryLaneClassification =
  | "MACHINE_LOADABLE_CANDIDATE"
  | "PUBLIC_CURATED_CANDIDATE"
  | "REFERENCE_ONLY"
  | "FORBIDDEN";

export type BlockLibraryHoldCode =
  | "HOLD_LIBRARY_ROOT_REQUIRED"
  | "HOLD_LIBRARY_ROOT_MISSING"
  | "HOLD_LIBRARY_ROOT_FORBIDDEN"
  | "HOLD_LIBRARY_PATH_GRAMMAR_INVALID"
  | "HOLD_LIBRARY_LANE_FORBIDDEN"
  | "HOLD_LIBRARY_LANE_REFERENCE_ONLY"
  | "HOLD_LIBRARY_MANIFEST_MISSING"
  | "HOLD_LIBRARY_MANIFEST_PARSE_FAILED"
  | "HOLD_LIBRARY_MANIFEST_SHAPE_UNKNOWN"
  | "HOLD_MANIFEST_ENTRY_QUERY_REQUIRED"
  | "HOLD_MANIFEST_ENTRY_NOT_FOUND"
  | "HOLD_MANIFEST_KIND_UNSUPPORTED"
  | "HOLD_MANIFEST_INDEX_UNAVAILABLE"
  | "HOLD_RAW_ENTRY_DUMP_NOT_SUPPORTED"
  | "HOLD_ENTRY_SOURCE_PATH_FORBIDDEN"
  | "HOLD_ENTRY_SOURCE_PATH_OUTSIDE_ALLOWLIST"
  | "HOLD_ENTRY_SHAPE_UNKNOWN"
  | "HOLD_SHALLOW_LOAD_GATE_QUERY_REQUIRED"
  | "HOLD_SHALLOW_LOAD_MODE_UNSUPPORTED"
  | "HOLD_TARGET_FORBIDDEN"
  | "HOLD_TARGET_OUTSIDE_ALLOWLIST"
  | "HOLD_TARGET_REFERENCE_ONLY"
  | "HOLD_TARGET_MISSING_ON_DISK"
  | "HOLD_TARGET_SHAPE_UNKNOWN"
  | "HOLD_SHALLOW_LOAD_GATE_UNAVAILABLE"
  | "HOLD_SHALLOW_SINGLE_LOAD_QUERY_REQUIRED"
  | "HOLD_SHALLOW_SINGLE_LOAD_MODE_UNSUPPORTED"
  | "HOLD_RAW_TARGET_DUMP_NOT_SUPPORTED"
  | "HOLD_TARGET_PARSE_FAILED"
  | "HOLD_SHALLOW_SINGLE_LOAD_UNAVAILABLE"
  | "HOLD_SHALLOW_SUMMARY_PROFILE_UNSUPPORTED"
  | "HOLD_SHALLOW_SUMMARY_NORMALIZATION_UNAVAILABLE"
  | "HOLD_NEOBLOCK_INSPECT_QUERY_REQUIRED"
  | "HOLD_TARGET_NOT_NEOBLOCK"
  | "HOLD_NEOBLOCK_INSPECT_UNAVAILABLE"
  | "HOLD_VISIBLE_MOLT_EXTRACT_QUERY_REQUIRED"
  | "HOLD_VISIBLE_MOLT_NOT_FOUND"
  | "HOLD_VISIBLE_MOLT_EXTRACT_UNAVAILABLE"
  | "HOLD_MOLT_MAP_FRAGMENT_QUERY_REQUIRED"
  | "HOLD_MOLT_MAP_FRAGMENT_PROJECTION_FORMAT_UNSUPPORTED"
  | "HOLD_MOLT_MAP_FRAGMENT_UNAVAILABLE"
  | "HOLD_MOLT_MAP_COMPOSE_QUERY_REQUIRED"
  | "HOLD_MOLT_MAP_COMPOSE_INPUT_LIMIT_EXCEEDED"
  | "HOLD_MOLT_MAP_COMPOSE_PROJECTION_FORMAT_UNSUPPORTED"
  | "HOLD_MOLT_MAP_COMPOSE_CONFLICT_POLICY_UNSUPPORTED"
  | "HOLD_MOLT_MAP_COMPOSE_UNAVAILABLE"
  | "HOLD_RESPONSE_ENVELOPE_FRAGMENT_QUERY_REQUIRED"
  | "HOLD_RESPONSE_ENVELOPE_FRAGMENT_PROJECTION_FORMAT_UNSUPPORTED"
  | "HOLD_RESPONSE_ENVELOPE_FRAGMENT_COMPOSER_NOT_NORMALIZED"
  | "HOLD_RESPONSE_ENVELOPE_FRAGMENT_COMPOSER_FAILED"
  | "HOLD_RESPONSE_ENVELOPE_FRAGMENT_UNAVAILABLE"
  | "HOLD_ACTIVE_STACK_PROJECTION_FORMAT_UNSUPPORTED"
  | "HOLD_ACTIVE_STACK_SOURCE_NOT_NORMALIZED"
  | "HOLD_ACTIVE_STACK_PROJECTION_UNAVAILABLE"
  | "HOLD_RESPONSE_ENVELOPE_ACTIVE_STACK_PROJECTION_FAILED"
  | "HOLD_RESPONSE_ENVELOPE_ACTIVE_STACK_PROJECTION_NOT_NORMALIZED"
  | "HOLD_SLEEVE_GRAPH_INDEX_PROJECTION_FORMAT_UNSUPPORTED"
  | "HOLD_SLEEVE_GRAPH_INDEX_SOURCE_CATALOG_UNSUPPORTED"
  | "HOLD_SLEEVE_GRAPH_INDEX_SLEEVE_NOT_FOUND"
  | "HOLD_SLEEVE_GRAPH_INDEX_CATALOG_NOT_FOUND"
  | "HOLD_SLEEVE_GRAPH_INDEX_CATALOG_PARSE_FAILED"
  | "HOLD_SLEEVE_GRAPH_INDEX_UNAVAILABLE"
  | "HOLD_ACTIVE_STACK_PROJECTION_RECURSION_GUARD";

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
  errors: Array<{ code: string; message: string }>;
  audit: Record<string, unknown>;
  trace: string[];
  previousSleeveId?: string | null;
};

const runtimeSleeveSessionStore = new Map<string, RuntimeSleeveSessionStateV0>();

const NATIVE_GRAPH_RUNTIME_IDENTITY = {
  lane: 'ALPHA8_NATIVE_GRAPH_LIVE_CODE_IDENTITY_DIAGNOSIS_SOURCE',
  marker: 'native-graph-fixture-resolution-parity-v2',
  expectedVersion: '0.3.0-alpha.11',
  buildIdentity: 'native-graph-live-code-identity-2026-05-21',
} as const;

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
  errors: Array<{ code: BlockLibraryHoldCode; message: string }>;
}

export type BlockLibraryManifestStatus =
  | "PRESENT_PARSED_NORMALIZED"
  | "PRESENT_PARSED_SHAPE_UNKNOWN"
  | "PRESENT_PARSE_FAILED"
  | "MISSING_OPTIONAL"
  | "MISSING_REQUIRED"
  | "FORBIDDEN_PATH"
  | "OUTSIDE_ALLOWLIST";

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
  errors: Array<{ code: BlockLibraryHoldCode; message: string }>;
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
  errors: Array<{ code: BlockLibraryHoldCode; message: string }>;
}

export type BlockLibraryShallowLoadDecision =
  | "ALLOW_SHALLOW_LOAD"
  | "DENY_FORBIDDEN_TARGET"
  | "DENY_OUTSIDE_ALLOWLIST"
  | "DENY_REFERENCE_ONLY_TARGET"
  | "DENY_TARGET_MISSING"
  | "DENY_ENTRY_NOT_FOUND"
  | "DENY_QUERY_REQUIRED"
  | "DENY_UNSUPPORTED_MANIFEST_KIND"
  | "DENY_UNSUPPORTED_LOAD_MODE"
  | "DENY_SHAPE_UNKNOWN";

export type BlockLibraryNextSafeAction =
  | "NEXT_SAFE_ACTION_SHALLOW_LOAD_ALLOWED"
  | "NEXT_SAFE_ACTION_DO_NOT_LOAD"
  | "NEXT_SAFE_ACTION_FIX_INDEX_OR_TARGET"
  | "NEXT_SAFE_ACTION_USE_REFERENCE_ONLY_VIEW"
  | "NEXT_SAFE_ACTION_REVIEW_POLICY";

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
  errors: Array<{ code: BlockLibraryHoldCode; message: string }>;
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
  target: (BlockLibraryManifestEntryLookupMatch & { absolutePath: string | null; loadStatus: "not_loaded" | "shallow_loaded" }) | null;
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
  errors: Array<{ code: BlockLibraryHoldCode; message: string }>;
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
  target: (BlockLibraryManifestEntryLookupMatch & { absolutePath: string | null; loadStatus: "not_loaded" | "shallow_loaded" }) | null;
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
  errors: Array<{ code: BlockLibraryHoldCode; message: string }>;
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
  target: (BlockLibraryManifestEntryLookupMatch & { absolutePath: string | null; loadStatus: "not_loaded" | "shallow_loaded" }) | null;
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
  errors: Array<{ code: BlockLibraryHoldCode; message: string }>;
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
  errors: Array<{ code: BlockLibraryHoldCode; message: string }>;
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
  errors: Array<{ code: BlockLibraryHoldCode; message: string }>;
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
  fragmentResults: Array<{ requestedId: string; ok: boolean; field: string | null; moltType: string | null; fragmentStatus: "MOLT_MAP_FRAGMENT_READY" | "MOLT_MAP_FRAGMENT_DENIED" | null; hold: BlockLibraryHoldCode | null; errorCodes: BlockLibraryHoldCode[]; sourcePath: string | null; manifestPath: string | null; payloadLoaded: boolean; recursiveLoad: false; execution: "not_performed" }>;
  conflicts: Array<{ field: string; chosenNeoblockId: string | null; ignoredNeoblockIds: string[] }>;
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
  errors: Array<{ code: BlockLibraryHoldCode; message: string }>;
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
  errors: Array<{ code: BlockLibraryHoldCode; message: string }>;
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
  errors: Array<{ code: BlockLibraryHoldCode; message: string }>;
}

export type BlockLibrarySleeveGraphDrilldownStatus = "SLEEVE_DRILLDOWN_READY" | "SLEEVE_NOT_FOUND" | "SLEEVE_DRILLDOWN_DENIED" | "SLEEVE_DRILLDOWN_HELD";
export type RuntimeSleeveSelectionStatus = "SLEEVE_SELECTED" | "NO_ACTIVE_SLEEVE" | "SLEEVE_NOT_FOUND" | "SELECTION_CLEARED" | "SELECTION_HELD";
export type RuntimeSleeveResolutionStatus = "RESOLVED" | "PARTIAL" | "HELD" | "DENIED" | "FAILED";
export type RuntimeCompileStatus = "COMPILED" | "PARTIAL" | "HELD" | "FAILED";
export type RuntimePreviewStatus = "RUNTIME_PREVIEW_READY" | "PARTIAL" | "HELD" | "FAILED";

export type BlockLibrarySleeveGraphIndexStatus =
  | "SLEEVE_GRAPH_INDEX_READY"
  | "SLEEVE_GRAPH_INDEX_READY_WITH_WARNINGS"
  | "SLEEVE_GRAPH_INDEX_EMPTY"
  | "SLEEVE_GRAPH_INDEX_DENIED"
  | "SLEEVE_GRAPH_INDEX_UNAVAILABLE";

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
  errors: Array<{ code: BlockLibraryHoldCode; message: string }>;
}

const DEFAULT_LIBRARY_ROOT = "C:\\.openclaw\\workspace\\UMG-Block-Library";
const runtimeSelectionState = new Map<string, { sleeveId: string | null; updatedAt: string }>();

export interface RuntimeSpecV0 {
  runtimeSpecVersion: "RuntimeSpecV0";
  runtimeSpecId: string;
  sleeveId: string;
  activeBlocks: string[];
  moltMap: Record<string, string>;
  promptParts: Array<{ field: string; text: string; sourceBlockId: string | null }>;
  strategy: string | null;
  constraints: string | null;
  context: { subject: string | null; primary: string | null };
  values: string | null;
  format: string | null;
  toolRequests: Array<{ kind: string; sourceBlockId: string | null; declaredAction: string }>;
}

export type RuntimeToolRequestClassificationState =
  | "unavailable"
  | "unknown"
  | "metadata_only"
  | "mock_only"
  | "preview_only"
  | "available_read_only"
  | "available_requires_approval"
  | "available_allowlisted_direct"
  | "blocked_policy"
  | "blocked_missing_approval"
  | "blocked_unsafe"
  | "blocked_unimplemented";

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

export type RuntimeExecutionGateDecision =
  | 'allow_read_only'
  | 'require_approval'
  | 'block_policy'
  | 'block_unknown'
  | 'block_unimplemented'
  | 'preview_only'
  | 'metadata_only'
  | 'dry_run_only';

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

export type RuntimeApprovalCheckpointResumeStatus =
  | 'CHECKPOINT_RESUME_READY'
  | 'CHECKPOINT_RESUME_HELD'
  | 'CHECKPOINT_RESUME_DENIED'
  | 'CHECKPOINT_RESUME_EDIT_REQUESTED'
  | 'CHECKPOINT_RESUME_DRY_RUN_ONLY'
  | 'CHECKPOINT_RESUME_FAILED';

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

const MACHINE_LANES = [
  "AI/MANIFESTS",
  "AI/SLEEVES",
  "AI/MOLT-BLOCKS",
  "AI/NEOBLOCKS",
  "AI/NEOSTACKS",
  "AI/GATES",
  "AI/COMPILER"
] as const;
const PUBLIC_CURATED_LANES = [
  "sleeves",
  "sleeves/manifests"
] as const;
const REFERENCE_ONLY_LANES = [
  "HUMAN",
  "docs",
  "README.md",
  "START-HERE.md"
] as const;
const FORBIDDEN_LANES = [
  "archive",
  "backups",
  "artifacts",
  "release-staging",
  "publish-stage",
  "Resleever",
  "vendor",
  "node_modules"
] as const;
const REQUIRED_MANIFESTS = [
  "AI/MANIFESTS/neoblock-library-index.json",
  "AI/MANIFESTS/molt-block-library-index.json",
  "AI/MANIFESTS/neostack-library-index.json",
  "sleeves/manifests/catalog.json"
] as const;
const OPTIONAL_MANIFESTS = [
  "AI/MANIFESTS/gate-library-index.json",
  "AI/MANIFESTS/sleeve-library-index.json",
  "AI/MANIFESTS/compiler-library-index.json"
] as const;
const ALLOWED_TARGET_PREFIXES = [
  "AI/NEOBLOCKS/",
  "AI/MOLT-BLOCKS/",
  "AI/NEOSTACKS/",
  "AI/GATES/",
  "AI/SLEEVES/",
  "sleeves/",
  "blocks/library/neoblocks/",
  "blocks/library/molt-extracted/",
  "blocks/library/neostacks/",
  "blocks/library/gates/"
] as const;

function safeExists(target: string): boolean {
  return fs.existsSync(target);
}

function classifyLane(root: string, lane: string): BlockLibraryLaneStatus {
  const target = path.join(root, ...lane.split(/[\\/]+/));
  const exists = safeExists(target);

  if ((MACHINE_LANES as readonly string[]).includes(lane)) {
    const notes: string[] = [];
    if (lane === "AI/MANIFESTS") {
      const manifestPath = path.join(target, "sleeve-catalog.json");
      if (!safeExists(manifestPath)) {
        notes.push("manifest check: sleeve-catalog.json missing");
      }
    }
    return {
      lane,
      classification: "MACHINE_LOADABLE_CANDIDATE",
      exists,
      loadPolicy: "readonly_allowed",
      notes
    };
  }

  if ((PUBLIC_CURATED_LANES as readonly string[]).includes(lane)) {
    return {
      lane,
      classification: "PUBLIC_CURATED_CANDIDATE",
      exists,
      loadPolicy: "readonly_allowed",
      notes: []
    };
  }

  if ((REFERENCE_ONLY_LANES as readonly string[]).includes(lane)) {
    return {
      lane,
      classification: "REFERENCE_ONLY",
      exists,
      loadPolicy: "not_machine_loaded",
      notes: []
    };
  }

  return {
    lane,
    classification: "FORBIDDEN",
    exists,
    loadPolicy: "do_not_load",
    notes: []
  };
}

export function defaultBlockLibraryRoot(): string {
  return DEFAULT_LIBRARY_ROOT;
}

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
}

function readJsonFile(filePath: string): unknown {
  return JSON.parse(stripBom(fs.readFileSync(filePath, "utf8")));
}

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

type NativeSleeveFixtureReadResult = {
  fixture: Record<string, unknown> | null;
  diagnostics: NativeFixtureResolutionDiagnostics;
};

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    if (!value) continue;
    const normalized = path.resolve(value);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    output.push(normalized);
  }

  return output;
}

function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function getRuntimePackageRootFromModuleUrl(moduleUrl: string | undefined): string | null {
  if (!moduleUrl) return null;

  try {
    const filePath = fileURLToPath(moduleUrl);
    const lowerPath = filePath.toLowerCase();
    const distNeedle = `${path.sep}dist${path.sep}`;
    const distIndex = lowerPath.lastIndexOf(distNeedle);

    if (distIndex >= 0) {
      return path.resolve(filePath.slice(0, distIndex));
    }

    return path.dirname(filePath);
  } catch {
    return null;
  }
}

function candidateFixtureFileNames(sleeveId: string): string[] {
  const safeId = sleeveId.replace(/[^a-zA-Z0-9._-]/g, '-');

  return [
    `${safeId}.json`,
    `${sleeveId}.json`,
    'neomagnetar-dynamic-persona-native-v1.json'
  ];
}

function buildNativeFixtureCandidateRoots(args: { explicitPackageRoot?: string | null; moduleMetaUrl?: string | null; }): string[] {
  const cwd = process.cwd();
  const modulePackageRoot = getRuntimePackageRootFromModuleUrl(args.moduleMetaUrl ?? undefined);

  return uniqueStrings([
    args.explicitPackageRoot ?? null,
    modulePackageRoot,
    cwd,
    path.join(cwd, 'work', 'public-next', 'package'),
    path.join(cwd, '..'),
    path.join(cwd, '..', '..')
  ]);
}

function readNativeSleeveFixtureFromPackage(args: { sleeveId: string; explicitPackageRoot?: string | null; moduleMetaUrl?: string | null; }): NativeSleeveFixtureReadResult {
  const sleeveId = args.sleeveId;
  const candidateRoots = buildNativeFixtureCandidateRoots({
    explicitPackageRoot: args.explicitPackageRoot ?? null,
    moduleMetaUrl: args.moduleMetaUrl ?? null,
  });

  const candidateFilesChecked: string[] = [];
  const mismatchReasons: string[] = [];
  const attempts: NativeFixtureResolutionAttempt[] = [];
  const fileNames = candidateFixtureFileNames(sleeveId);

  for (const root of candidateRoots) {
    const fixtureDir = path.join(root, 'fixtures', 'native-sleeves');

    for (const fileName of fileNames) {
      const candidateFile = path.join(fixtureDir, fileName);
      candidateFilesChecked.push(candidateFile);

      const exists = safeExists(candidateFile);
      const attempt: NativeFixtureResolutionAttempt = {
        root,
        candidateFile,
        exists,
        matched: false,
      };

      if (!exists) {
        attempt.reason = 'file_not_found';
        attempts.push(attempt);
        continue;
      }

      const parsed = safeJsonParse<Record<string, unknown>>(fs.readFileSync(candidateFile, 'utf8'));

      if (!parsed || typeof parsed !== 'object') {
        attempt.reason = 'invalid_json_or_not_object';
        mismatchReasons.push(`${candidateFile}: invalid_json_or_not_object`);
        attempts.push(attempt);
        continue;
      }

      const parsedSleeveId = asString(parsed.sleeveId) ?? asString(parsed.id);

      if (parsedSleeveId !== sleeveId) {
        attempt.reason = `sleeve_id_mismatch:${parsedSleeveId ?? 'missing'}`;
        mismatchReasons.push(`${candidateFile}: sleeve_id_mismatch:${parsedSleeveId ?? 'missing'}`);
        attempts.push(attempt);
        continue;
      }

      attempt.matched = true;
      attempts.push(attempt);

      return {
        fixture: parsed,
        diagnostics: {
          requestedSleeveId: sleeveId,
          candidateRootsChecked: candidateRoots,
          candidateFilesChecked,
          matchedFile: candidateFile,
          matchedSleeveId: parsedSleeveId,
          mismatchReasons,
          attempts,
        },
      };
    }
  }

  return {
    fixture: null,
    diagnostics: {
      requestedSleeveId: sleeveId,
      candidateRootsChecked: candidateRoots,
      candidateFilesChecked,
      matchedFile: null,
      matchedSleeveId: null,
      mismatchReasons,
      attempts,
    },
  };
}

function buildNativeGraphRichnessSummaries(
  nativeProjection: any,
  graphRunId: string,
  sessionState: any,
  sleeveId: string,
  nativeFixtureResolution: NativeFixtureResolutionDiagnostics,
  runtimeCodeIdentity: Record<string, unknown>,
) {
  const nativeGraph = nativeProjection?.nativeGraph;
  const sourceProvenance = {
    nativeGraphAvailable: true,
    sampleFallbackUsed: false,
    legacyPreviewResidueDetected: false,
    legacyPreviewResiduePaths: [],
    sourceMode: 'sleeve_native',
    routePurity: 'clean_native'
  };

  const neoStackSummary = {
    count: nativeGraph?.neoStacks?.length ?? 0,
    status: (nativeGraph?.neoStacks?.length ?? 0) > 0 ? 'resolved' : 'missing',
    reason: (nativeGraph?.neoStacks?.length ?? 0) > 0 ? null : 'sleeve_declares_no_neostacks',
    items: (nativeGraph?.neoStacks ?? []).map((stack: any) => ({
      neoStackId: stack.stackId,
      displayName: stack.label,
      declaredRef: stack.stackId,
      sourcePath: stack.provenance?.sourcePath ?? null,
      manifestEntry: stack.provenance?.sourceId ?? null,
      activeStatus: 'resolved',
      reasonActive: 'declared in native sleeve graph fixture',
      reasonUnavailable: null,
      declaredNeoBlockRefs: stack.containedNeoBlockIds ?? [],
      resolvedNeoBlockCount: stack.containedNeoBlockIds?.length ?? 0,
      blockedNeoBlockCount: 0,
      warnings: [],
      provenance: stack.provenance ?? null
    })),
    source: 'sleeve_native_graph'
  };

  const neoBlockSummary = {
    count: nativeGraph?.neoBlocks?.length ?? 0,
    status: (nativeGraph?.neoBlocks?.length ?? 0) > 0 ? 'resolved' : 'missing',
    reason: (nativeGraph?.neoBlocks?.length ?? 0) > 0 ? null : 'sleeve_declares_no_neoblocks',
    items: (nativeGraph?.neoBlocks ?? []).map((block: any) => ({
      neoBlockId: block.neoBlockId,
      parentNeoStackId: Array.isArray(block.parentStackIds) ? (block.parentStackIds[0] ?? null) : null,
      parentNeoStackIds: block.parentStackIds ?? [],
      declaredRef: block.neoBlockId,
      resolvedPath: block.provenance?.sourcePath ?? null,
      manifestSource: block.provenance?.sourceId ?? null,
      loadStatus: 'shallow_loaded',
      visibleMoltFragmentCount: (nativeGraph?.moltFragments ?? []).filter((fragment: any) => fragment.sourceNeoBlockId === block.neoBlockId).length,
      extractedMoltTypes: (nativeGraph?.moltFragments ?? []).filter((fragment: any) => fragment.sourceNeoBlockId === block.neoBlockId).map((fragment: any) => fragment.moltType),
      contentSummary: block.role ?? null,
      warnings: [],
      provenance: block.provenance ?? null
    })),
    source: 'sleeve_native_graph'
  };

  const moltFragmentSummary = {
    visibleCount: nativeGraph?.moltFragments?.length ?? 0,
    source: 'sleeve_native',
    groups: {
      Trigger: (nativeGraph?.moltFragments ?? []).filter((fragment: any) => fragment.moltType === 'Trigger'),
      Directive: (nativeGraph?.moltFragments ?? []).filter((fragment: any) => fragment.moltType === 'Directive'),
      Instruction: (nativeGraph?.moltFragments ?? []).filter((fragment: any) => fragment.moltType === 'Instruction'),
      Subject: (nativeGraph?.moltFragments ?? []).filter((fragment: any) => fragment.moltType === 'Subject'),
      Primary: (nativeGraph?.moltFragments ?? []).filter((fragment: any) => fragment.moltType === 'Primary'),
      Philosophy: (nativeGraph?.moltFragments ?? []).filter((fragment: any) => fragment.moltType === 'Philosophy'),
      Blueprint: (nativeGraph?.moltFragments ?? []).filter((fragment: any) => fragment.moltType === 'Blueprint'),
      Off: [],
      excluded: []
    }
  };

  const toolRequestSummary = {
    requestCount: nativeGraph?.toolRequests?.length ?? 0,
    requests: (nativeGraph?.toolRequests ?? []).map((request: any) => ({
      requestId: request.requestId,
      requestedToolName: request.requestedToolName,
      requestedAction: request.requestedAction,
      classification: request.policyClass,
      decisionReason: request.purpose,
      routeReason: request.policyClass,
      provenance: request.provenance ?? null
    }))
  };

  const runtimeSpecSummary = {
    runtimeSpecId: nativeGraph?.runtimeRoutes?.[0]?.routeId ?? null,
    sourceMode: 'sleeve_native',
    activeBlockCount: nativeGraph?.runtimeRoutes?.[0]?.sourceNeoBlockIds?.length ?? nativeGraph?.neoBlocks?.length ?? 0,
    usesSleeveNativeBlocks: true,
    usesSampleBlocks: false,
    previewStatus: 'RUNTIME_PREVIEW_READY',
    sourceProvenance,
    routeWarnings: []
  };

  const irMatrixSummary = {
    matrixId: nativeGraph?.irRoutes?.[0]?.routeId ?? null,
    nodeCount: nativeGraph?.irRoutes?.[0]?.nodes?.length ?? 0,
    edgeCount: nativeGraph?.irRoutes?.[0]?.edges?.length ?? 0,
    activeRoute: nativeGraph?.irRoutes?.[0]?.nodes?.map((node: any) => node.nodeId) ?? [],
    blockedRoute: [],
    sourceMode: 'sleeve_native',
    sourceProvenance,
    routePurity: 'clean_native'
  };

  const envelopeSummary = {
    envelopeStatus: 'READY',
    envelopeSource: nativeGraph?.envelopeSources?.[0]?.envelopeSource ?? 'sleeve_native_derived',
    heldReason: null,
    sourceMode: 'sleeve_native',
    sourceProvenance,
    routePurity: 'clean_native',
    routeWarnings: []
  };

  const diagnostics = {
    graphRunId,
    overallCompleteness: 'rich_sleeve_native',
    neoStackReason: neoStackSummary.reason,
    activeMoltSource: 'sleeve_native',
    activeSessionAvailable: !!sessionState.activeSleeveId,
    activeSessionSleeveId: sessionState.activeSleeveId ?? null,
    sourceMode: 'sleeve_native',
    sourceProvenance,
    nativeGraphAvailable: true,
    sampleFallbackUsed: false,
    legacyPreviewResidueDetected: false,
    legacyPreviewResiduePaths: [],
    routePurity: 'clean_native',
    routeWarnings: [],
    nativeFixtureResolution,
    runtimeCodeIdentity,
    directSourceEnabled: false,
    automaticResponseTakeover: false,
    sleeveId
  };

  return {
    sourceMode: 'sleeve_native' as const,
    routePurity: 'clean_native' as const,
    sampleFallbackUsed: false,
    legacyPreviewResidueDetected: false,
    legacyPreviewResiduePaths: [] as string[],
    sourceProvenance,
    neoStackSummary,
    neoBlockSummary,
    moltFragmentSummary,
    toolRequestSummary,
    runtimeSpecSummary,
    irMatrixSummary,
    envelopeSummary,
    diagnostics,
    graphCompleteness: 'rich_sleeve_native' as const
  };
}

function normalizeRelativePath(rawPath: string): string {
  return rawPath.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\.\.\//, "");
}

function isForbiddenTarget(relativePath: string): boolean {
  const lowered = normalizeRelativePath(relativePath).toLowerCase();
  return (FORBIDDEN_LANES as readonly string[]).some((lane) => lowered === lane.toLowerCase() || lowered.startsWith(`${lane.toLowerCase()}/`));
}

function isAllowedTarget(relativePath: string): boolean {
  const normalized = normalizeRelativePath(relativePath);
  return (ALLOWED_TARGET_PREFIXES as readonly string[]).some((prefix) => normalized.startsWith(prefix));
}

function resolveTargetClassification(root: string, targetPath: string | null): Omit<BlockLibraryManifestEntry, "manifestName" | "entryId"> {
  if (!targetPath) {
    return {
      targetPath: null,
      targetClassification: "NO_TARGET_PATH",
      targetExists: false,
      notes: ["entry has no target path"]
    };
  }
  const normalized = normalizeRelativePath(targetPath);
  if (isForbiddenTarget(normalized)) {
    return {
      targetPath: normalized,
      targetClassification: "FORBIDDEN_TARGET",
      targetExists: false,
      notes: []
    };
  }
  if (!isAllowedTarget(normalized)) {
    return {
      targetPath: normalized,
      targetClassification: "OUTSIDE_ALLOWLIST_TARGET",
      targetExists: false,
      notes: []
    };
  }
  const full = path.join(root, ...normalized.split("/"));
  return {
    targetPath: normalized,
    targetClassification: safeExists(full) ? "ALLOWED_TARGET" : "MISSING_TARGET",
    targetExists: safeExists(full),
    notes: []
  };
}

function rawManifestEntries(manifestName: string, data: unknown): Array<Record<string, unknown>> | null {
  if (Array.isArray(data)) {
    return data.filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null);
  }
  if (!data || typeof data !== "object") {
    return null;
  }
  const obj = data as Record<string, unknown>;
  if (manifestName === "sleeves/manifests/catalog.json") {
    const sleeves = obj.sleeves;
    return Array.isArray(sleeves) ? sleeves.filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null) : null;
  }
  if (Array.isArray(obj.value)) {
    const flattened: Array<Record<string, unknown>> = [];
    for (const item of obj.value) {
      if (Array.isArray(item)) {
        flattened.push(...item.filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null));
      } else if (item && typeof item === "object") {
        flattened.push(item as Record<string, unknown>);
      }
    }
    return flattened;
  }
  return null;
}

function normalizeManifest(root: string, manifestName: string, relativePath: string, required: boolean, data: unknown): BlockLibraryManifestRecord {
  const entries = rawManifestEntries(manifestName, data);
  if (!entries) {
    return {
      manifestName,
      relativePath,
      required,
      status: "PRESENT_PARSED_SHAPE_UNKNOWN",
      exists: true,
      entryCount: 0,
      normalizedEntryCount: 0,
      entries: [],
      notes: ["manifest shape not recognized"]
    };
  }

  const normalizedEntries: BlockLibraryManifestEntry[] = entries.map((entry, index) => {
    const entryId = typeof entry.id === "string" ? entry.id : (typeof entry.name === "string" ? entry.name : `entry_${index}`);
    const candidatePath = typeof entry.path === "string"
      ? entry.path
      : (typeof entry.source_path === "string" ? entry.source_path : null);
    const resolved = resolveTargetClassification(root, candidatePath);
    return {
      manifestName,
      entryId,
      title: typeof entry.title === "string" ? entry.title : (typeof entry.name === "string" ? entry.name : null),
      kind: typeof entry.kind === "string" ? entry.kind : null,
      ...resolved
    };
  });

  return {
    manifestName,
    relativePath,
    required,
    status: "PRESENT_PARSED_NORMALIZED",
    exists: true,
    entryCount: entries.length,
    normalizedEntryCount: normalizedEntries.length,
    entries: normalizedEntries,
    notes: []
  };
}

export function getBlockLibraryManifestIndex(version: string, entrypoint = "dist/plugin-entry.js", root = DEFAULT_LIBRARY_ROOT): BlockLibraryManifestIndexResult {
  const normalizedRoot = path.resolve(root);
  if (!normalizedRoot || normalizedRoot.trim().length === 0) {
    return {
      ok: false,
      version,
      entrypoint,
      surface: "compiler_backed_runtime",
      mode: "real_block_library_manifest_index",
      readOnly: true,
      execution: "not_performed",
      directSource: "not_enabled",
      libraryRoot: root,
      rootExists: false,
      summary: {
        manifestCount: 0,
        parsedManifestCount: 0,
        normalizedManifestCount: 0,
        missingManifestCount: 0,
        parseFailedManifestCount: 0,
        shapeUnknownManifestCount: 0,
        totalEntryCount: 0,
        allowedTargetEntryCount: 0,
        missingTargetEntryCount: 0,
        forbiddenTargetEntryCount: 0,
        outsideAllowlistTargetEntryCount: 0
      },
      manifests: [],
      warnings: [],
      errors: [{ code: "HOLD_LIBRARY_ROOT_REQUIRED", message: "Library root is required." }]
    };
  }
  if (!safeExists(normalizedRoot)) {
    return {
      ok: false,
      version,
      entrypoint,
      surface: "compiler_backed_runtime",
      mode: "real_block_library_manifest_index",
      readOnly: true,
      execution: "not_performed",
      directSource: "not_enabled",
      libraryRoot: normalizedRoot,
      rootExists: false,
      summary: {
        manifestCount: 0,
        parsedManifestCount: 0,
        normalizedManifestCount: 0,
        missingManifestCount: 0,
        parseFailedManifestCount: 0,
        shapeUnknownManifestCount: 0,
        totalEntryCount: 0,
        allowedTargetEntryCount: 0,
        missingTargetEntryCount: 0,
        forbiddenTargetEntryCount: 0,
        outsideAllowlistTargetEntryCount: 0
      },
      manifests: [],
      warnings: [],
      errors: [{ code: "HOLD_LIBRARY_ROOT_MISSING", message: `Library root missing: ${normalizedRoot}` }]
    };
  }

  const manifests: BlockLibraryManifestRecord[] = [];
  for (const relativePath of REQUIRED_MANIFESTS) {
    const full = path.join(normalizedRoot, ...relativePath.split("/"));
    if (!safeExists(full)) {
      manifests.push({ manifestName: relativePath.split("/").slice(-1)[0], relativePath, required: true, status: "MISSING_REQUIRED", exists: false, entryCount: 0, normalizedEntryCount: 0, entries: [], notes: [] });
      continue;
    }
    try {
      const parsed = readJsonFile(full);
      manifests.push(normalizeManifest(normalizedRoot, relativePath, relativePath, true, parsed));
    } catch (error) {
      manifests.push({ manifestName: relativePath.split("/").slice(-1)[0], relativePath, required: true, status: "PRESENT_PARSE_FAILED", exists: true, entryCount: 0, normalizedEntryCount: 0, entries: [], notes: [String(error)] });
    }
  }
  for (const relativePath of OPTIONAL_MANIFESTS) {
    const full = path.join(normalizedRoot, ...relativePath.split("/"));
    if (!safeExists(full)) {
      manifests.push({ manifestName: relativePath.split("/").slice(-1)[0], relativePath, required: false, status: "MISSING_OPTIONAL", exists: false, entryCount: 0, normalizedEntryCount: 0, entries: [], notes: [] });
      continue;
    }
    try {
      const parsed = readJsonFile(full);
      manifests.push(normalizeManifest(normalizedRoot, relativePath, relativePath, false, parsed));
    } catch (error) {
      manifests.push({ manifestName: relativePath.split("/").slice(-1)[0], relativePath, required: false, status: "PRESENT_PARSE_FAILED", exists: true, entryCount: 0, normalizedEntryCount: 0, entries: [], notes: [String(error)] });
    }
  }

  const allEntries = manifests.flatMap((manifest) => manifest.entries);
  return {
    ok: true,
    version,
    entrypoint,
    surface: "compiler_backed_runtime",
    mode: "real_block_library_manifest_index",
    readOnly: true,
    execution: "not_performed",
    directSource: "not_enabled",
    libraryRoot: normalizedRoot,
    rootExists: true,
    summary: {
      manifestCount: manifests.length,
      parsedManifestCount: manifests.filter((manifest) => manifest.status !== "MISSING_REQUIRED" && manifest.status !== "MISSING_OPTIONAL").length,
      normalizedManifestCount: manifests.filter((manifest) => manifest.status === "PRESENT_PARSED_NORMALIZED").length,
      missingManifestCount: manifests.filter((manifest) => manifest.status === "MISSING_REQUIRED" || manifest.status === "MISSING_OPTIONAL").length,
      parseFailedManifestCount: manifests.filter((manifest) => manifest.status === "PRESENT_PARSE_FAILED").length,
      shapeUnknownManifestCount: manifests.filter((manifest) => manifest.status === "PRESENT_PARSED_SHAPE_UNKNOWN").length,
      totalEntryCount: manifests.reduce((sum, manifest) => sum + manifest.entryCount, 0),
      allowedTargetEntryCount: allEntries.filter((entry) => entry.targetClassification === "ALLOWED_TARGET").length,
      missingTargetEntryCount: allEntries.filter((entry) => entry.targetClassification === "MISSING_TARGET").length,
      forbiddenTargetEntryCount: allEntries.filter((entry) => entry.targetClassification === "FORBIDDEN_TARGET").length,
      outsideAllowlistTargetEntryCount: allEntries.filter((entry) => entry.targetClassification === "OUTSIDE_ALLOWLIST_TARGET").length
    },
    manifests,
    warnings: [],
    errors: []
  };
}

function manifestKindForPath(relativePath: string): BlockLibraryManifestKind {
  switch (relativePath) {
    case "AI/MANIFESTS/neoblock-library-index.json": return "neoblock";
    case "AI/MANIFESTS/molt-block-library-index.json": return "moltblock";
    case "AI/MANIFESTS/neostack-library-index.json": return "neostack";
    case "AI/MANIFESTS/gate-library-index.json": return "gate";
    case "AI/MANIFESTS/sleeve-library-index.json": return "sleeve";
    case "AI/MANIFESTS/compiler-library-index.json": return "compiler";
    case "sleeves/manifests/catalog.json": return "public_curated_catalog";
    default: return "all";
  }
}

function targetPolicyForEntry(entry: BlockLibraryManifestEntry): BlockLibraryManifestEntryLookupMatch["targetPolicy"] {
  switch (entry.targetClassification) {
    case "ALLOWED_TARGET": return "ALLOWED_NOT_LOADED";
    case "MISSING_TARGET": return "MISSING_ON_DISK";
    case "FORBIDDEN_TARGET": return "FORBIDDEN_TARGET";
    case "OUTSIDE_ALLOWLIST_TARGET": return "OUTSIDE_ALLOWLIST_TARGET";
    case "NO_TARGET_PATH": return "NO_SOURCE_PATH";
    default: return "SHAPE_UNKNOWN";
  }
}

function resolutionStatusForPolicy(policy: BlockLibraryManifestEntryLookupMatch["targetPolicy"]): string {
  switch (policy) {
    case "ALLOWED_NOT_LOADED": return "TARGET_INDEX_ENTRY_FOUND_PATH_ALLOWED_NOT_LOADED";
    case "MISSING_ON_DISK": return "TARGET_INDEX_ENTRY_FOUND_PATH_ALLOWED_MISSING_ON_DISK";
    case "FORBIDDEN_TARGET": return "TARGET_INDEX_ENTRY_FOUND_PATH_FORBIDDEN_NOT_LOADED";
    case "OUTSIDE_ALLOWLIST_TARGET": return "TARGET_INDEX_ENTRY_FOUND_PATH_OUTSIDE_ALLOWLIST_NOT_LOADED";
    case "NO_SOURCE_PATH": return "TARGET_INDEX_ENTRY_FOUND_NO_SOURCE_PATH";
    default: return "TARGET_INDEX_ENTRY_FOUND_SHAPE_UNKNOWN";
  }
}

export function getBlockLibraryManifestEntryLookup(
  version: string,
  entrypoint = "dist/plugin-entry.js",
  root = DEFAULT_LIBRARY_ROOT,
  input: {
    entryId?: string;
    sourcePath?: string;
    manifestKind?: BlockLibraryManifestKind;
    includeManifestSummary?: boolean;
    includeRaw?: boolean;
  } = {}
): BlockLibraryManifestEntryLookupResult {
  const manifestKind = input.manifestKind ?? "all";
  if (input.includeRaw) {
    return {
      ok: false,
      version,
      entrypoint,
      surface: "compiler_backed_runtime",
      mode: "real_block_library_manifest_entry_lookup",
      readOnly: true,
      execution: "not_performed",
      directSource: "not_enabled",
      query: { entryId: input.entryId ?? null, sourcePath: input.sourcePath ?? null, manifestKind },
      matchCount: 0,
      matches: [],
      warnings: [],
      errors: [{ code: "HOLD_RAW_ENTRY_DUMP_NOT_SUPPORTED", message: "includeRaw=true is not supported in this step." }]
    };
  }
  if (!input.entryId && !input.sourcePath) {
    return {
      ok: false,
      version,
      entrypoint,
      surface: "compiler_backed_runtime",
      mode: "real_block_library_manifest_entry_lookup",
      readOnly: true,
      execution: "not_performed",
      directSource: "not_enabled",
      query: { entryId: null, sourcePath: null, manifestKind },
      matchCount: 0,
      matches: [],
      warnings: [],
      errors: [{ code: "HOLD_MANIFEST_ENTRY_QUERY_REQUIRED", message: "Provide entryId or sourcePath." }]
    };
  }
  const supportedKinds: BlockLibraryManifestKind[] = ["all", "neoblock", "moltblock", "neostack", "gate", "sleeve", "compiler", "public_curated_catalog"];
  if (!supportedKinds.includes(manifestKind)) {
    return {
      ok: false,
      version,
      entrypoint,
      surface: "compiler_backed_runtime",
      mode: "real_block_library_manifest_entry_lookup",
      readOnly: true,
      execution: "not_performed",
      directSource: "not_enabled",
      query: { entryId: input.entryId ?? null, sourcePath: input.sourcePath ?? null, manifestKind },
      matchCount: 0,
      matches: [],
      warnings: [],
      errors: [{ code: "HOLD_MANIFEST_KIND_UNSUPPORTED", message: `Unsupported manifestKind: ${manifestKind}` }]
    };
  }
  const index = getBlockLibraryManifestIndex(version, entrypoint, root);
  if (!index.ok) {
    return {
      ok: false,
      version,
      entrypoint,
      surface: "compiler_backed_runtime",
      mode: "real_block_library_manifest_entry_lookup",
      readOnly: true,
      execution: "not_performed",
      directSource: "not_enabled",
      query: { entryId: input.entryId ?? null, sourcePath: input.sourcePath ?? null, manifestKind },
      matchCount: 0,
      matches: [],
      warnings: [],
      errors: [{ code: "HOLD_MANIFEST_INDEX_UNAVAILABLE", message: "Manifest index is unavailable." }, ...index.errors]
    };
  }
  const normalizedSourcePath = input.sourcePath ? normalizeRelativePath(input.sourcePath) : null;
  const matches = index.manifests
    .filter((manifest) => manifestKind === "all" || manifestKindForPath(manifest.relativePath) === manifestKind)
    .flatMap((manifest) => manifest.entries
      .filter((entry) => (input.entryId ? entry.entryId === input.entryId : true) && (normalizedSourcePath ? entry.targetPath === normalizedSourcePath : true))
      .map((entry) => {
        const targetPolicy = targetPolicyForEntry(entry);
        return {
          id: entry.entryId,
          kind: manifestKindForPath(manifest.relativePath),
          title: entry.title ?? null,
          manifestKind: manifestKindForPath(manifest.relativePath),
          manifestPath: manifest.relativePath,
          sourcePath: entry.targetPath,
          targetExists: entry.targetExists,
          targetPolicy,
          resolutionStatus: resolutionStatusForPolicy(targetPolicy),
          loadStatus: "not_loaded" as const,
          warnings: [...entry.notes]
        };
      }));
  if (matches.length === 0) {
    return {
      ok: false,
      version,
      entrypoint,
      surface: "compiler_backed_runtime",
      mode: "real_block_library_manifest_entry_lookup",
      readOnly: true,
      execution: "not_performed",
      directSource: "not_enabled",
      query: { entryId: input.entryId ?? null, sourcePath: normalizedSourcePath, manifestKind },
      matchCount: 0,
      matches: [],
      manifestSummary: input.includeManifestSummary === false ? undefined : {
        manifestCount: index.summary.manifestCount,
        parsedManifestCount: index.summary.parsedManifestCount,
        normalizedManifestCount: index.summary.normalizedManifestCount,
        missingManifestCount: index.summary.missingManifestCount,
        parseFailedManifestCount: index.summary.parseFailedManifestCount,
        shapeUnknownManifestCount: index.summary.shapeUnknownManifestCount,
        totalEntryCount: index.summary.totalEntryCount
      },
      warnings: [],
      errors: [{ code: "HOLD_MANIFEST_ENTRY_NOT_FOUND", message: "Manifest entry not found." }]
    };
  }
  return {
    ok: true,
    version,
    entrypoint,
    surface: "compiler_backed_runtime",
    mode: "real_block_library_manifest_entry_lookup",
    readOnly: true,
    execution: "not_performed",
    directSource: "not_enabled",
    query: { entryId: input.entryId ?? null, sourcePath: normalizedSourcePath, manifestKind },
    matchCount: matches.length,
    matches,
    manifestSummary: input.includeManifestSummary === false ? undefined : {
      manifestCount: index.summary.manifestCount,
      parsedManifestCount: index.summary.parsedManifestCount,
      normalizedManifestCount: index.summary.normalizedManifestCount,
      missingManifestCount: index.summary.missingManifestCount,
      parseFailedManifestCount: index.summary.parseFailedManifestCount,
      shapeUnknownManifestCount: index.summary.shapeUnknownManifestCount,
      totalEntryCount: index.summary.totalEntryCount
    },
    warnings: [],
    errors: []
  };
}

export function getBlockLibraryTargetShallowLoadGate(
  version: string,
  entrypoint = "dist/plugin-entry.js",
  root = DEFAULT_LIBRARY_ROOT,
  input: {
    entryId?: string;
    sourcePath?: string;
    manifestKind?: BlockLibraryManifestKind;
    intendedLoadMode?: string;
    includeEntrySummary?: boolean;
  } = {}
): BlockLibraryTargetShallowLoadGateResult {
  const manifestKind = input.manifestKind ?? "all";
  const intendedLoadMode = input.intendedLoadMode ?? "shallow";
  const base = {
    version,
    entrypoint,
    mode: "real_block_library_target_shallow_load_gate" as const,
    readOnly: true as const,
    execution: "not_performed" as const,
    directSource: "not_enabled" as const,
    query: {
      entryId: input.entryId ?? null,
      sourcePath: input.sourcePath ?? null,
      manifestKind,
      intendedLoadMode
    }
  };
  if (!input.entryId && !input.sourcePath) {
    return {
      ok: false,
      ...base,
      gate: {
        decision: "DENY_QUERY_REQUIRED",
        canShallowLoad: false,
        reasonCodes: ["QUERY_REQUIRED"],
        nextSafeAction: "NEXT_SAFE_ACTION_REVIEW_POLICY",
        payloadLoaded: false,
        recursiveLoad: false
      },
      target: null,
      entry: null,
      warnings: [],
      errors: [{ code: "HOLD_SHALLOW_LOAD_GATE_QUERY_REQUIRED", message: "Provide entryId or sourcePath." }]
    };
  }
  if (intendedLoadMode !== "shallow") {
    return {
      ok: false,
      ...base,
      gate: {
        decision: "DENY_UNSUPPORTED_LOAD_MODE",
        canShallowLoad: false,
        reasonCodes: ["RECURSIVE_LOAD_NOT_ALLOWED"],
        nextSafeAction: "NEXT_SAFE_ACTION_REVIEW_POLICY",
        payloadLoaded: false,
        recursiveLoad: false
      },
      target: null,
      entry: null,
      warnings: [],
      errors: [{ code: "HOLD_SHALLOW_LOAD_MODE_UNSUPPORTED", message: `Unsupported intendedLoadMode: ${intendedLoadMode}` }]
    };
  }
  const lookup = getBlockLibraryManifestEntryLookup(version, entrypoint, root, {
    entryId: input.entryId,
    sourcePath: input.sourcePath,
    manifestKind,
    includeManifestSummary: input.includeEntrySummary !== false,
    includeRaw: false
  });
  if (!lookup.ok) {
    const code = lookup.errors[0]?.code;
    if (code === "HOLD_MANIFEST_ENTRY_NOT_FOUND") {
      return {
        ok: false,
        ...base,
        gate: {
          decision: "DENY_ENTRY_NOT_FOUND",
          canShallowLoad: false,
          reasonCodes: ["TARGET_INDEX_ENTRY_NOT_FOUND"],
          nextSafeAction: "NEXT_SAFE_ACTION_FIX_INDEX_OR_TARGET",
          payloadLoaded: false,
          recursiveLoad: false
        },
        target: null,
        entry: null,
        warnings: [],
        errors: lookup.errors
      };
    }
    if (code === "HOLD_MANIFEST_KIND_UNSUPPORTED") {
      return {
        ok: false,
        ...base,
        gate: {
          decision: "DENY_UNSUPPORTED_MANIFEST_KIND",
          canShallowLoad: false,
          reasonCodes: ["MANIFEST_KIND_UNSUPPORTED"],
          nextSafeAction: "NEXT_SAFE_ACTION_REVIEW_POLICY",
          payloadLoaded: false,
          recursiveLoad: false
        },
        target: null,
        entry: null,
        warnings: [],
        errors: lookup.errors
      };
    }
    return {
      ok: false,
      ...base,
      gate: {
        decision: "DENY_SHAPE_UNKNOWN",
        canShallowLoad: false,
        reasonCodes: ["DIRECT_SOURCE_NOT_ENABLED"],
        nextSafeAction: "NEXT_SAFE_ACTION_REVIEW_POLICY",
        payloadLoaded: false,
        recursiveLoad: false
      },
      target: null,
      entry: null,
      warnings: [],
      errors: [{ code: "HOLD_SHALLOW_LOAD_GATE_UNAVAILABLE", message: "Shallow load gate unavailable." }, ...lookup.errors]
    };
  }
  const match = lookup.matches[0] ?? null;
  if (!match) {
    return {
      ok: false,
      ...base,
      gate: {
        decision: "DENY_SHAPE_UNKNOWN",
        canShallowLoad: false,
        reasonCodes: ["DIRECT_SOURCE_NOT_ENABLED"],
        nextSafeAction: "NEXT_SAFE_ACTION_REVIEW_POLICY",
        payloadLoaded: false,
        recursiveLoad: false
      },
      target: null,
      entry: null,
      warnings: [],
      errors: [{ code: "HOLD_SHALLOW_LOAD_GATE_UNAVAILABLE", message: "Lookup returned no match." }]
    };
  }

  let decision: BlockLibraryShallowLoadDecision;
  let nextSafeAction: BlockLibraryNextSafeAction;
  let reasonCodes: string[];
  switch (match.targetPolicy) {
    case "ALLOWED_NOT_LOADED":
      decision = "ALLOW_SHALLOW_LOAD";
      nextSafeAction = "NEXT_SAFE_ACTION_SHALLOW_LOAD_ALLOWED";
      reasonCodes = ["TARGET_INDEX_ENTRY_FOUND", "TARGET_PATH_ALLOWED", "TARGET_EXISTS", "PAYLOAD_NOT_LOADED"];
      break;
    case "MISSING_ON_DISK":
      decision = "DENY_TARGET_MISSING";
      nextSafeAction = "NEXT_SAFE_ACTION_FIX_INDEX_OR_TARGET";
      reasonCodes = ["TARGET_INDEX_ENTRY_FOUND", "TARGET_PATH_ALLOWED", "TARGET_MISSING_ON_DISK", "PAYLOAD_NOT_LOADED"];
      break;
    case "FORBIDDEN_TARGET":
      decision = "DENY_FORBIDDEN_TARGET";
      nextSafeAction = "NEXT_SAFE_ACTION_DO_NOT_LOAD";
      reasonCodes = ["FORBIDDEN_TARGET", "POLICY_EXCLUDED", "PAYLOAD_NOT_LOADED"];
      break;
    case "OUTSIDE_ALLOWLIST_TARGET":
      decision = "DENY_OUTSIDE_ALLOWLIST";
      nextSafeAction = "NEXT_SAFE_ACTION_REVIEW_POLICY";
      reasonCodes = ["OUTSIDE_ALLOWLIST_TARGET", "POLICY_BLOCKED", "PAYLOAD_NOT_LOADED"];
      break;
    case "REFERENCE_ONLY_TARGET":
      decision = "DENY_REFERENCE_ONLY_TARGET";
      nextSafeAction = "NEXT_SAFE_ACTION_USE_REFERENCE_ONLY_VIEW";
      reasonCodes = ["REFERENCE_ONLY_TARGET", "POLICY_BLOCKED", "PAYLOAD_NOT_LOADED"];
      break;
    default:
      decision = "DENY_SHAPE_UNKNOWN";
      nextSafeAction = "NEXT_SAFE_ACTION_REVIEW_POLICY";
      reasonCodes = ["DIRECT_SOURCE_NOT_ENABLED", "PAYLOAD_NOT_LOADED"];
      break;
  }

  return {
    ok: decision === "ALLOW_SHALLOW_LOAD",
    ...base,
    gate: {
      decision,
      canShallowLoad: decision === "ALLOW_SHALLOW_LOAD",
      reasonCodes,
      nextSafeAction,
      payloadLoaded: false,
      recursiveLoad: false
    },
    target: match,
    entry: match,
    warnings: [],
    errors: []
  };
}

function boundedPreview(value: unknown, maxChars = 500): string | null {
  if (typeof value === 'string') {
    return value.length > maxChars ? `${value.slice(0, maxChars)}…` : value;
  }
  if (value == null) {
    return null;
  }
  const text = JSON.stringify(value);
  return text.length > maxChars ? `${text.slice(0, maxChars)}…` : text;
}

function countRefs(payload: Record<string, unknown>): Record<string, number> {
  const countArray = (key: string) => Array.isArray(payload[key]) ? payload[key].length : 0;
  const refs = typeof payload.neoblock === 'object' && payload.neoblock !== null ? payload.neoblock as Record<string, unknown> : {};
  return {
    block_refs: countArray('block_refs'),
    tool_requests: countArray('tool_requests'),
    gates: countArray('gates'),
    triggers: countArray('triggers'),
    neostack_refs: Array.isArray(refs.refs) ? refs.refs.length : 0,
    neoblock_refs: countArray('neoblock_refs'),
    molt_refs: countArray('molt_refs')
  };
}

export function getBlockLibraryTargetShallowLoadSingle(
  version: string,
  entrypoint = "dist/plugin-entry.js",
  root = DEFAULT_LIBRARY_ROOT,
  input: {
    entryId?: string;
    sourcePath?: string;
    manifestKind?: BlockLibraryManifestKind;
    loadMode?: string;
    includeContentPreview?: boolean;
    includeRaw?: boolean;
  } = {}
): BlockLibraryTargetShallowLoadSingleResult {
  const manifestKind = input.manifestKind ?? 'all';
  const loadMode = input.loadMode ?? 'shallow_single';
  const base = {
    version,
    entrypoint,
    mode: 'real_block_library_target_shallow_load_single' as const,
    readOnly: true as const,
    execution: 'not_performed' as const,
    directSource: 'not_enabled' as const,
    query: {
      entryId: input.entryId ?? null,
      sourcePath: input.sourcePath ?? null,
      manifestKind,
      loadMode
    }
  };
  if (input.includeRaw) {
    return {
      ok: false,
      ...base,
      gate: { decision: 'DENY_SHAPE_UNKNOWN', canShallowLoad: false, reasonCodes: ['PAYLOAD_NOT_LOADED'], nextSafeAction: 'NEXT_SAFE_ACTION_REVIEW_POLICY', payloadLoaded: false, recursiveLoad: false },
      target: null,
      payload: null,
      warnings: [],
      errors: [{ code: 'HOLD_RAW_TARGET_DUMP_NOT_SUPPORTED', message: 'includeRaw=true is not supported.' }]
    };
  }
  if (!input.entryId && !input.sourcePath) {
    return {
      ok: false,
      ...base,
      gate: { decision: 'DENY_QUERY_REQUIRED', canShallowLoad: false, reasonCodes: ['QUERY_REQUIRED'], nextSafeAction: 'NEXT_SAFE_ACTION_REVIEW_POLICY', payloadLoaded: false, recursiveLoad: false },
      target: null,
      payload: null,
      warnings: [],
      errors: [{ code: 'HOLD_SHALLOW_SINGLE_LOAD_QUERY_REQUIRED', message: 'Provide entryId or sourcePath.' }]
    };
  }
  if (loadMode !== 'shallow_single') {
    return {
      ok: false,
      ...base,
      gate: { decision: 'DENY_UNSUPPORTED_LOAD_MODE', canShallowLoad: false, reasonCodes: ['RECURSIVE_LOAD_NOT_ALLOWED'], nextSafeAction: 'NEXT_SAFE_ACTION_REVIEW_POLICY', payloadLoaded: false, recursiveLoad: false },
      target: null,
      payload: null,
      warnings: [],
      errors: [{ code: 'HOLD_SHALLOW_SINGLE_LOAD_MODE_UNSUPPORTED', message: `Unsupported loadMode: ${loadMode}` }]
    };
  }
  const gate = getBlockLibraryTargetShallowLoadGate(version, entrypoint, root, {
    entryId: input.entryId,
    sourcePath: input.sourcePath,
    manifestKind,
    intendedLoadMode: 'shallow'
  });
  if (!gate.gate.canShallowLoad || !gate.target?.sourcePath) {
    const first = gate.errors[0]?.code;
    let code: BlockLibraryHoldCode = 'HOLD_SHALLOW_SINGLE_LOAD_UNAVAILABLE';
    if (first === 'HOLD_MANIFEST_ENTRY_NOT_FOUND') code = 'HOLD_MANIFEST_ENTRY_NOT_FOUND';
    else if (first === 'HOLD_MANIFEST_KIND_UNSUPPORTED') code = 'HOLD_MANIFEST_KIND_UNSUPPORTED';
    else if (first === 'HOLD_SHALLOW_LOAD_GATE_QUERY_REQUIRED') code = 'HOLD_SHALLOW_SINGLE_LOAD_QUERY_REQUIRED';
    else if (gate.gate.decision === 'DENY_FORBIDDEN_TARGET') code = 'HOLD_TARGET_FORBIDDEN';
    else if (gate.gate.decision === 'DENY_OUTSIDE_ALLOWLIST') code = 'HOLD_TARGET_OUTSIDE_ALLOWLIST';
    else if (gate.gate.decision === 'DENY_TARGET_MISSING') code = 'HOLD_TARGET_MISSING_ON_DISK';
    return {
      ok: false,
      ...base,
      gate: { ...gate.gate, payloadLoaded: false, recursiveLoad: false },
      target: gate.target ? { ...gate.target, absolutePath: null, loadStatus: 'not_loaded' } : null,
      payload: null,
      warnings: gate.warnings,
      errors: gate.errors.length ? gate.errors : [{ code, message: 'Shallow single load denied.' }]
    };
  }
  const absolutePath = path.join(path.resolve(root), ...gate.target.sourcePath.split('/'));
  if (!safeExists(absolutePath)) {
    return {
      ok: false,
      ...base,
      gate: { decision: 'DENY_TARGET_MISSING', canShallowLoad: false, reasonCodes: ['TARGET_INDEX_ENTRY_FOUND', 'TARGET_PATH_ALLOWED', 'TARGET_MISSING_ON_DISK', 'PAYLOAD_NOT_LOADED'], nextSafeAction: 'NEXT_SAFE_ACTION_FIX_INDEX_OR_TARGET', payloadLoaded: false, recursiveLoad: false },
      target: { ...gate.target, absolutePath, loadStatus: 'not_loaded' },
      payload: null,
      warnings: [],
      errors: [{ code: 'HOLD_TARGET_MISSING_ON_DISK', message: `Target missing on disk: ${absolutePath}` }]
    };
  }
  try {
    const parsed = readJsonFile(absolutePath);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {
        ok: false,
        ...base,
        gate: { ...gate.gate, payloadLoaded: false, recursiveLoad: false },
        target: { ...gate.target, absolutePath, loadStatus: 'not_loaded' },
        payload: null,
        warnings: [],
        errors: [{ code: 'HOLD_TARGET_SHAPE_UNKNOWN', message: 'Target payload shape is not a JSON object.' }]
      };
    }
    const obj = parsed as Record<string, unknown>;
    return {
      ok: true,
      ...base,
      gate: { ...gate.gate, payloadLoaded: true, recursiveLoad: false },
      target: { ...gate.target, absolutePath, loadStatus: 'shallow_loaded' },
      payload: {
        parseStatus: 'PARSED_JSON',
        shapeStatus: 'SHALLOW_SUMMARY_READY',
        topLevelKeys: Object.keys(obj),
        identity: typeof obj.identity === 'object' && obj.identity ? obj.identity as Record<string, unknown> : {},
        metadata: typeof obj.metadata === 'object' && obj.metadata ? obj.metadata as Record<string, unknown> : {},
        provenance: typeof obj.provenance === 'object' && obj.provenance ? obj.provenance as Record<string, unknown> : {},
        contentPreview: input.includeContentPreview === false ? null : boundedPreview((obj.neoblock as any)?.content ?? obj.content ?? obj),
        referenceSummary: countRefs(obj),
        rawObject: obj
      },
      warnings: [],
      errors: []
    };
  } catch (error) {
    return {
      ok: false,
      ...base,
      gate: { ...gate.gate, payloadLoaded: false, recursiveLoad: false },
      target: { ...gate.target, absolutePath, loadStatus: 'not_loaded' },
      payload: null,
      warnings: [],
      errors: [{ code: 'HOLD_TARGET_PARSE_FAILED', message: String(error) }]
    };
  }
}

function normalizeMoltType(payload: Record<string, unknown>, fallbackId: string | null): string | null {
  const direct = typeof payload.moltType === 'string' ? payload.moltType : null;
  if (direct) return direct;
  const byId = fallbackId?.split('.').slice(0, 1)[0];
  if (!fallbackId) return null;
  const map: Record<string, string> = {
    'primary': 'Primary',
    'directive': 'Directive',
    'instruction': 'Instruction',
    'subject': 'Subject',
    'philosophy': 'Philosophy',
    'blueprint': 'Blueprint',
    'trigger': 'Trigger'
  };
  return map[fallbackId.split('.')[0]] ?? map[byId ?? ''] ?? null;
}

function normalizeArtifactKind(manifestKind: BlockLibraryManifestKind): 'neoblock' | 'moltblock' | 'neostack' | 'sleeve' | 'gate' | 'compiler' | 'unknown' {
  if (manifestKind === 'public_curated_catalog') return 'unknown';
  return manifestKind === 'all' ? 'unknown' : manifestKind;
}

export function getBlockLibraryTargetShallowSummaryNormalize(
  version: string,
  entrypoint = "dist/plugin-entry.js",
  root = DEFAULT_LIBRARY_ROOT,
  input: {
    entryId?: string;
    sourcePath?: string;
    manifestKind?: BlockLibraryManifestKind;
    summaryProfile?: string;
    includeContentPreview?: boolean;
    includeReferenceSummary?: boolean;
    includeRaw?: boolean;
  } = {}
): BlockLibraryTargetShallowSummaryNormalizeResult {
  const summaryProfile = input.summaryProfile ?? 'standard';
  const base = {
    version,
    entrypoint,
    mode: 'real_block_library_target_shallow_summary_normalize' as const,
    readOnly: true as const,
    execution: 'not_performed' as const,
    directSource: 'not_enabled' as const,
    query: {
      entryId: input.entryId ?? null,
      sourcePath: input.sourcePath ?? null,
      manifestKind: input.manifestKind ?? 'all',
      summaryProfile
    }
  };
  if (input.includeRaw) {
    return {
      ok: false,
      ...base,
      gate: { decision: 'DENY_SHAPE_UNKNOWN', canShallowLoad: false, reasonCodes: ['PAYLOAD_NOT_LOADED'], nextSafeAction: 'NEXT_SAFE_ACTION_REVIEW_POLICY', payloadLoaded: false, recursiveLoad: false },
      target: null,
      payload: null,
      normalizedSummary: null,
      warnings: [],
      errors: [{ code: 'HOLD_RAW_TARGET_DUMP_NOT_SUPPORTED', message: 'includeRaw=true is not supported.' }]
    };
  }
  if (!['compact','standard','audit'].includes(summaryProfile)) {
    return {
      ok: false,
      ...base,
      gate: { decision: 'DENY_SHAPE_UNKNOWN', canShallowLoad: false, reasonCodes: ['PAYLOAD_NOT_LOADED'], nextSafeAction: 'NEXT_SAFE_ACTION_REVIEW_POLICY', payloadLoaded: false, recursiveLoad: false },
      target: null,
      payload: null,
      normalizedSummary: null,
      warnings: [],
      errors: [{ code: 'HOLD_SHALLOW_SUMMARY_PROFILE_UNSUPPORTED', message: `Unsupported summaryProfile: ${summaryProfile}` }]
    };
  }
  const single = getBlockLibraryTargetShallowLoadSingle(version, entrypoint, root, {
    entryId: input.entryId,
    sourcePath: input.sourcePath,
    manifestKind: input.manifestKind,
    loadMode: 'shallow_single',
    includeContentPreview: input.includeContentPreview !== false,
    includeRaw: false
  });
  if (!single.ok || !single.payload?.rawObject || !single.target) {
    return {
      ok: false,
      ...base,
      gate: single.gate,
      target: single.target,
      payload: single.payload ? { parseStatus: single.payload.parseStatus, shapeStatus: 'SHALLOW_SUMMARY_UNAVAILABLE', topLevelKeys: single.payload.topLevelKeys } : null,
      normalizedSummary: null,
      warnings: single.warnings,
      errors: single.errors.length ? single.errors : [{ code: 'HOLD_SHALLOW_SUMMARY_NORMALIZATION_UNAVAILABLE', message: 'Shallow summary normalization unavailable.' }]
    };
  }
  const obj = single.payload.rawObject;
  const identity = typeof obj.identity === 'object' && obj.identity ? obj.identity as Record<string, unknown> : {};
  const metadata = typeof obj.metadata === 'object' && obj.metadata ? obj.metadata as Record<string, unknown> : {};
  const provenance = typeof obj.provenance === 'object' && obj.provenance ? obj.provenance as Record<string, unknown> : {};
  const neoblock = typeof obj.neoblock === 'object' && obj.neoblock ? obj.neoblock as Record<string, unknown> : {};
  const artifactId = single.target.id ?? (typeof identity.id === 'string' ? identity.id : null);
  const referenceSummary = single.payload.referenceSummary ?? countRefs(obj);
  const normalizedReferenceSummary = {
    blockRefs: referenceSummary.block_refs ?? 0,
    neoblockRefs: referenceSummary.neoblock_refs ?? 0,
    neostackRefs: referenceSummary.neostack_refs ?? 0,
    moltBlockRefs: referenceSummary.molt_refs ?? 0,
    toolRequests: referenceSummary.tool_requests ?? 0,
    gates: referenceSummary.gates ?? 0,
    triggers: referenceSummary.triggers ?? 0,
    unknownRefs: 0,
    resolvedRefs: 0,
    loadedRefs: 0
  };
  const warnings: string[] = [];
  const moltType = normalizeMoltType(neoblock, artifactId);
  if (!moltType) warnings.push('MOLT_TYPE_NOT_FOUND_IN_SHALLOW_SUMMARY');
  return {
    ok: true,
    ...base,
    gate: { ...single.gate, payloadLoaded: true, recursiveLoad: false },
    target: single.target,
    payload: {
      parseStatus: 'PARSED_JSON',
      shapeStatus: 'SHALLOW_SUMMARY_NORMALIZED',
      topLevelKeys: single.payload.topLevelKeys
    },
    normalizedSummary: {
      summaryStatus: 'NORMALIZED',
      artifactKind: normalizeArtifactKind(single.target.manifestKind),
      artifactId,
      displayName: typeof identity.name === 'string' ? identity.name : (typeof metadata.name === 'string' ? metadata.name : null),
      moltType,
      role: typeof neoblock.role === 'string' ? neoblock.role : null,
      status: typeof metadata.status === 'string' ? metadata.status : null,
      identity,
      metadata,
      content: neoblock,
      moltSummary: neoblock,
      referenceSummary: input.includeReferenceSummary === false ? { blockRefs: 0, neoblockRefs: 0, neostackRefs: 0, moltBlockRefs: 0, toolRequests: 0, gates: 0, triggers: 0, unknownRefs: 0, resolvedRefs: 0, loadedRefs: 0 } : normalizedReferenceSummary,
      provenance,
      contentPreview: input.includeContentPreview === false ? null : single.payload.contentPreview,
      limitations: ['single_target_only', 'no_recursive_loading', 'no_execution']
    },
    warnings,
    errors: []
  };
}

export function getBlockLibraryNeoblockInspect(
  version: string,
  entrypoint = "dist/plugin-entry.js",
  root = DEFAULT_LIBRARY_ROOT,
  input: {
    neoblockId?: string;
    entryId?: string;
    sourcePath?: string;
    manifestKind?: BlockLibraryManifestKind;
    summaryProfile?: string;
    includeContentPreview?: boolean;
    includeReferenceSummary?: boolean;
    includeRaw?: boolean;
  } = {}
): BlockLibraryNeoblockInspectResult {
  const entryId = input.neoblockId ?? input.entryId;
  const manifestKind = input.manifestKind ?? 'neoblock';
  const base = {
    version,
    entrypoint,
    mode: 'real_block_library_neoblock_inspect' as const,
    readOnly: true as const,
    execution: 'not_performed' as const,
    directSource: 'not_enabled' as const,
    query: {
      neoblockId: input.neoblockId ?? null,
      entryId: entryId ?? null,
      sourcePath: input.sourcePath ?? null,
      manifestKind,
      summaryProfile: input.summaryProfile ?? 'standard'
    }
  };
  if (!entryId && !input.sourcePath) {
    return {
      ok: false,
      ...base,
      gate: { decision: 'DENY_QUERY_REQUIRED', canShallowLoad: false, reasonCodes: ['QUERY_REQUIRED'], nextSafeAction: 'NEXT_SAFE_ACTION_REVIEW_POLICY', payloadLoaded: false, recursiveLoad: false },
      target: null,
      neoblockInspection: null,
      warnings: [],
      errors: [{ code: 'HOLD_NEOBLOCK_INSPECT_QUERY_REQUIRED', message: 'Provide neoblockId, entryId, or sourcePath.' }]
    };
  }
  const normalized = getBlockLibraryTargetShallowSummaryNormalize(version, entrypoint, root, {
    entryId,
    sourcePath: input.sourcePath,
    manifestKind,
    summaryProfile: input.summaryProfile ?? 'standard',
    includeContentPreview: input.includeContentPreview !== false,
    includeReferenceSummary: input.includeReferenceSummary !== false,
    includeRaw: Boolean(input.includeRaw)
  });
  if (!normalized.ok || !normalized.normalizedSummary || !normalized.target) {
    const first = normalized.errors[0]?.code;
    let inspectStatus: BlockLibraryNeoblockInspectResult['neoblockInspection'] extends infer T ? any : never = 'NEOBLOCK_DENIED_BY_GATE';
    if (first === 'HOLD_MANIFEST_ENTRY_NOT_FOUND') inspectStatus = 'NEOBLOCK_NOT_FOUND';
    else if (first === 'HOLD_TARGET_FORBIDDEN') inspectStatus = 'NEOBLOCK_TARGET_FORBIDDEN';
    else if (first === 'HOLD_TARGET_OUTSIDE_ALLOWLIST') inspectStatus = 'NEOBLOCK_TARGET_OUTSIDE_ALLOWLIST';
    else if (first === 'HOLD_TARGET_PARSE_FAILED') inspectStatus = 'NEOBLOCK_PARSE_FAILED';
    else if (first === 'HOLD_TARGET_SHAPE_UNKNOWN') inspectStatus = 'NEOBLOCK_SHAPE_UNKNOWN';
    return {
      ok: false,
      ...base,
      gate: normalized.gate,
      target: normalized.target,
      neoblockInspection: {
        inspectStatus,
        neoblockId: entryId ?? null,
        artifactKind: normalized.normalizedSummary?.artifactKind ?? null,
        moltType: normalized.normalizedSummary?.moltType ?? null,
        role: normalized.normalizedSummary?.role ?? null,
        title: normalized.normalizedSummary?.displayName ?? null,
        status: normalized.normalizedSummary?.status ?? null,
        identity: normalized.normalizedSummary?.identity ?? null,
        metadata: normalized.normalizedSummary?.metadata ?? null,
        contentSummary: normalized.normalizedSummary?.content ?? null,
        moltSummary: normalized.normalizedSummary?.moltSummary ?? null,
        referenceSummary: normalized.normalizedSummary?.referenceSummary ?? null,
        provenance: normalized.normalizedSummary?.provenance ?? null,
        contentPreview: normalized.normalizedSummary?.contentPreview ?? null,
        limitations: ['single_neoblock_only', 'no_recursive_loading', 'no_reference_resolution', 'no_execution']
      },
      warnings: normalized.warnings,
      errors: normalized.errors
    };
  }
  if (normalized.normalizedSummary.artifactKind !== 'neoblock') {
    return {
      ok: false,
      ...base,
      gate: normalized.gate,
      target: normalized.target,
      neoblockInspection: {
        inspectStatus: 'NEOBLOCK_TARGET_NOT_NEOBLOCK',
        neoblockId: normalized.normalizedSummary.artifactId,
        artifactKind: normalized.normalizedSummary.artifactKind,
        moltType: normalized.normalizedSummary.moltType,
        role: normalized.normalizedSummary.role,
        title: normalized.normalizedSummary.displayName,
        status: normalized.normalizedSummary.status,
        identity: normalized.normalizedSummary.identity,
        metadata: normalized.normalizedSummary.metadata,
        contentSummary: normalized.normalizedSummary.content,
        moltSummary: normalized.normalizedSummary.moltSummary,
        referenceSummary: normalized.normalizedSummary.referenceSummary,
        provenance: normalized.normalizedSummary.provenance,
        contentPreview: normalized.normalizedSummary.contentPreview,
        limitations: ['single_neoblock_only', 'no_recursive_loading', 'no_reference_resolution', 'no_execution']
      },
      warnings: normalized.warnings,
      errors: [{ code: 'HOLD_TARGET_NOT_NEOBLOCK', message: 'Target artifactKind is not neoblock.' }]
    };
  }
  return {
    ok: true,
    ...base,
    gate: normalized.gate,
    target: normalized.target,
    neoblockInspection: {
      inspectStatus: 'NEOBLOCK_INSPECTED',
      neoblockId: normalized.normalizedSummary.artifactId,
      artifactKind: normalized.normalizedSummary.artifactKind,
      moltType: normalized.normalizedSummary.moltType,
      role: normalized.normalizedSummary.role,
      title: normalized.normalizedSummary.displayName,
      status: normalized.normalizedSummary.status,
      identity: normalized.normalizedSummary.identity,
      metadata: normalized.normalizedSummary.metadata,
      contentSummary: normalized.normalizedSummary.content,
      moltSummary: normalized.normalizedSummary.moltSummary,
      referenceSummary: normalized.normalizedSummary.referenceSummary,
      provenance: normalized.normalizedSummary.provenance,
      contentPreview: normalized.normalizedSummary.contentPreview,
      limitations: ['single_neoblock_only', 'no_recursive_loading', 'no_reference_resolution', 'no_execution']
    },
    warnings: normalized.warnings,
    errors: []
  };
}

function pickVisibleFields(source: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    if (key in source) out[key] = source[key];
  }
  return out;
}

function asBoundedText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > 500 ? `${trimmed.slice(0, 500)}…` : trimmed;
}

function deriveFragmentFieldValue(extracted: NonNullable<BlockLibraryMoltblockVisibleExtractResult['visibleMoltExtraction']>): string | null {
  const summary = extracted.contentSummary ?? {};
  return asBoundedText(summary['content'])
    ?? asBoundedText(summary['summary'])
    ?? asBoundedText(summary['text'])
    ?? asBoundedText(extracted.contentPreview)
    ?? asBoundedText(extracted.title)
    ?? asBoundedText((extracted.moltFields ?? {})['displayName'])
    ?? (extracted.moltType && extracted.sourceNeoblockId ? `${extracted.moltType} (${extracted.sourceNeoblockId})` : null);
}

const MOLT_MAP_FIELD_ORDER = ['Trigger', 'Directive', 'Instruction', 'Subject', 'Primary', 'Philosophy', 'Blueprint'] as const;

type MOLTMapField = typeof MOLT_MAP_FIELD_ORDER[number];

function mapMoltTypeToFragmentField(moltType: string | null): MOLTMapField | null {
  switch (moltType) {
    case 'Trigger':
    case 'Directive':
    case 'Instruction':
    case 'Subject':
    case 'Primary':
    case 'Philosophy':
    case 'Blueprint':
      return moltType;
    default:
      return null;
  }
}

export function getBlockLibraryMoltMapCompose(
  version: string,
  entrypoint = 'dist/plugin-entry.js',
  root = DEFAULT_LIBRARY_ROOT,
  input: {
    neoblockIds?: string[];
    manifestKind?: BlockLibraryManifestKind;
    summaryProfile?: string;
    projectionFormat?: 'nl' | 'json' | 'both' | string;
    conflictPolicy?: 'first_wins' | 'report_only' | string;
    includeFieldProvenance?: boolean;
    includeContentPreview?: boolean;
    includeRaw?: boolean;
  } = {}
): BlockLibraryMoltMapComposeResult {
  const neoblockIds = input.neoblockIds ?? [];
  const manifestKind = input.manifestKind ?? 'neoblock';
  const summaryProfile = input.summaryProfile ?? 'standard';
  const projectionFormat = input.projectionFormat ?? 'both';
  const conflictPolicy = input.conflictPolicy ?? 'report_only';
  const normalizedProjectionFormat: 'nl' | 'json' | 'both' = projectionFormat === 'nl' || projectionFormat === 'json' || projectionFormat === 'both' ? projectionFormat : 'both';
  const normalizedConflictPolicy: 'first_wins' | 'report_only' = conflictPolicy === 'first_wins' || conflictPolicy === 'report_only' ? conflictPolicy : 'report_only';
  const baseMoltMap = Object.fromEntries(MOLT_MAP_FIELD_ORDER.map((field) => [field, { value: 'n/a', fieldStatus: 'FIELD_MISSING' as const, sourceNeoblockId: null, moltType: null, fragmentStatus: null, provenance: null, contentPreview: null, limitations: ['field_missing', 'not_in_explicit_input'] }])) as BlockLibraryMoltMapComposeResult['moltMap'];
  const base = {
    version,
    entrypoint,
    mode: 'real_block_library_molt_map_compose' as const,
    outputContract: {
      contractId: 'umg.molt_map.compose.v1' as const,
      contractStatus: 'NORMALIZED' as const,
      fieldOrder: [...MOLT_MAP_FIELD_ORDER],
      missingFieldValue: 'n/a' as const,
      sourceMode: 'explicit_neoblock_ids' as const,
      recursiveLoad: false as const,
      fullLibraryScan: false as const
    },
    readOnly: true as const,
    execution: 'not_performed' as const,
    directSource: 'not_enabled' as const,
    query: {
      neoblockIds,
      manifestKind,
      summaryProfile,
      projectionFormat: normalizedProjectionFormat,
      conflictPolicy: normalizedConflictPolicy
    },
    composition: {
      compositionStatus: 'MOLT_MAP_COMPOSE_DENIED' as const,
      compositionKind: 'explicit_fragment_list' as const,
      fieldOrder: [...MOLT_MAP_FIELD_ORDER],
      requestedCount: neoblockIds.length,
      fragmentCount: 0,
      composedFieldCount: 0,
      missingFieldCount: MOLT_MAP_FIELD_ORDER.length,
      duplicateFieldCount: 0,
      deniedFragmentCount: 0,
      recursiveLoad: false as const,
      fullLibraryScan: false as const,
      activeSleeveInspection: false as const,
      neostackInspection: false as const,
      triggerEvaluation: 'not_performed' as const,
      execution: 'not_performed' as const
    },
    moltMap: baseMoltMap,
    fragmentResults: [] as BlockLibraryMoltMapComposeResult['fragmentResults'],
    conflicts: [] as BlockLibraryMoltMapComposeResult['conflicts'],
    nlProjection: null as string | null,
    audit: {
      normalizationStatus: 'COMPOSER_OUTPUT_NORMALIZED' as const,
      contractId: 'umg.molt_map.compose.v1' as const,
      inputMode: 'explicit_neoblock_ids' as const,
      fullLibraryScan: 'not_performed' as const,
      recursiveLoad: 'not_performed' as const,
      referencedTargetLoading: 'not_performed' as const,
      externalMoltBlockFileLoading: 'not_performed' as const,
      activeSleeveInspection: 'not_performed' as const,
      neostackInspection: 'not_performed' as const,
      triggerEvaluation: 'not_performed' as const,
      execution: 'not_performed' as const,
      directSource: 'not_enabled' as const,
      libraryMutation: 'not_performed' as const
    },
    warnings: [] as string[],
    errors: [] as Array<{ code: BlockLibraryHoldCode; message: string }>
  };
  if (!neoblockIds.length) {
    return { ...base, ok: false, errors: [{ code: 'HOLD_MOLT_MAP_COMPOSE_QUERY_REQUIRED', message: 'Provide at least one neoblockId.' }] };
  }
  if (neoblockIds.length > 20) {
    return { ...base, ok: false, errors: [{ code: 'HOLD_MOLT_MAP_COMPOSE_INPUT_LIMIT_EXCEEDED', message: 'At most 20 neoblockIds are allowed.' }] };
  }
  if (!['nl', 'json', 'both'].includes(projectionFormat)) {
    return { ...base, ok: false, errors: [{ code: 'HOLD_MOLT_MAP_COMPOSE_PROJECTION_FORMAT_UNSUPPORTED', message: `Unsupported projectionFormat: ${projectionFormat}` }] };
  }
  if (!['first_wins', 'report_only'].includes(conflictPolicy)) {
    return { ...base, ok: false, errors: [{ code: 'HOLD_MOLT_MAP_COMPOSE_CONFLICT_POLICY_UNSUPPORTED', message: `Unsupported conflictPolicy: ${conflictPolicy}` }] };
  }
  if (input.includeRaw) {
    return { ...base, ok: false, errors: [{ code: 'HOLD_RAW_TARGET_DUMP_NOT_SUPPORTED', message: 'Raw target dump is not supported.' }] };
  }
  const fragmentResults: BlockLibraryMoltMapComposeResult['fragmentResults'] = [];
  const conflicts: BlockLibraryMoltMapComposeResult['conflicts'] = [];
  const deniedFields = new Set<MOLTMapField>();
  const moltMap = { ...baseMoltMap };
  let composedFieldCount = 0;
  let duplicateFieldCount = 0;
  let deniedFragmentCount = 0;
  for (const neoblockId of neoblockIds) {
    const fragment = getBlockLibraryMoltMapFragment(version, entrypoint, root, {
      neoblockId,
      manifestKind,
      summaryProfile,
      projectionFormat: 'json',
      includeContentPreview: input.includeContentPreview !== false,
      includeReferenceSummary: true,
      includeRaw: false
    });
    const field = fragment.moltMapFragment?.moltMapField ?? null;
    const hold = fragment.errors[0]?.code ?? null;
    const errorCodes = fragment.errors.map((error) => error.code);
    fragmentResults.push({
      requestedId: neoblockId,
      ok: fragment.ok,
      field,
      moltType: fragment.moltMapFragment?.moltType ?? null,
      fragmentStatus: fragment.ok ? 'MOLT_MAP_FRAGMENT_READY' : 'MOLT_MAP_FRAGMENT_DENIED',
      hold,
      errorCodes,
      sourcePath: fragment.moltMapFragment?.provenance?.sourcePath ?? null,
      manifestPath: fragment.moltMapFragment?.provenance?.manifestPath ?? null,
      payloadLoaded: fragment.sourceNeoblock?.payloadLoaded ?? false,
      recursiveLoad: false,
      execution: 'not_performed'
    });
    if (!fragment.ok || !field || !fragment.moltMapFragment) {
      deniedFragmentCount += 1;
      continue;
    }
    if (moltMap[field].sourceNeoblockId) {
      duplicateFieldCount += 1;
      conflicts.push({ field, chosenNeoblockId: moltMap[field].sourceNeoblockId, ignoredNeoblockIds: [neoblockId] });
      moltMap[field] = {
        ...moltMap[field],
        fieldStatus: 'FIELD_CONFLICT_REPORTED',
        limitations: [...moltMap[field].limitations.filter((v) => v !== 'field_missing' && v !== 'not_in_explicit_input'), 'duplicate_field_reported']
      };
      if (normalizedConflictPolicy === 'first_wins') {
        continue;
      }
      continue;
    }
    moltMap[field] = {
      value: fragment.moltMapFragment.fieldValue ?? 'n/a',
      fieldStatus: 'FIELD_COMPOSED',
      sourceNeoblockId: fragment.moltMapFragment.sourceNeoblockId,
      moltType: fragment.moltMapFragment.moltType,
      fragmentStatus: fragment.moltMapFragment.fragmentStatus,
      provenance: input.includeFieldProvenance === false ? null : fragment.moltMapFragment.provenance,
      contentPreview: input.includeContentPreview === false ? null : fragment.moltMapFragment.contentPreview,
      limitations: fragment.moltMapFragment.limitations
    };
    composedFieldCount += 1;
  }
  const missingFieldCount = MOLT_MAP_FIELD_ORDER.filter((field) => moltMap[field].fieldStatus === 'FIELD_MISSING').length;
  let compositionStatus: BlockLibraryMoltMapComposeResult['composition']['compositionStatus'] = 'MOLT_MAP_COMPOSED';
  if (duplicateFieldCount > 0) compositionStatus = 'MOLT_MAP_COMPOSED_WITH_CONFLICTS';
  else if (deniedFragmentCount > 0) compositionStatus = 'MOLT_MAP_COMPOSED_WITH_DENIED_FRAGMENTS';
  else if (missingFieldCount > 0) compositionStatus = 'MOLT_MAP_COMPOSED_WITH_MISSING_FIELDS';
  const nlProjection = normalizedProjectionFormat === 'nl' || normalizedProjectionFormat === 'both'
    ? `Current Context — MOLT Map:\n${MOLT_MAP_FIELD_ORDER.map((field) => `${field}: ${moltMap[field].value ?? 'n/a'}`).join('\n')}`
    : null;
  return {
    ok: true,
    ...base,
    composition: {
      ...base.composition,
      compositionStatus,
      fragmentCount: fragmentResults.length,
      composedFieldCount,
      missingFieldCount,
      duplicateFieldCount,
      deniedFragmentCount
    },
    moltMap,
    fragmentResults,
    conflicts,
    nlProjection,
    errors: []
  };
}

function asBoundedParagraph(value: string | undefined, max = 300): string {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return '(Self-evaluation: The composed MOLT Map is normalized and ready for envelope rendering. This fragment does not modify runtime response behavior.)';
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
}

function asBoundedDisplayText(value: string | undefined, max = 1500): string {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return 'n/a';
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
}

function currentUtcDateParts(): { date: string; time: string } {
  const now = new Date();
  return {
    date: now.toISOString().slice(0, 10),
    time: now.toISOString().slice(11, 19)
  };
}

export function getBlockLibraryActiveStackProjection(
  version: string,
  entrypoint = 'dist/plugin-entry.js',
  root = DEFAULT_LIBRARY_ROOT,
  input: {
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
  } = {}
): BlockLibraryActiveStackProjectionResult {
  const neoblockIds = input.neoblockIds ?? [];
  const projectionFormat = input.projectionFormat ?? 'both';
  const normalizedProjectionFormat: 'nl' | 'json' | 'both' = projectionFormat === 'nl' || projectionFormat === 'json' || projectionFormat === 'both' ? projectionFormat : 'both';
  const internal: InternalCallContext = {
    caller: input._internal?.caller,
    depth: input._internal?.depth ?? 0,
    disableEnvelopeSourceContext: input._internal?.disableEnvelopeSourceContext ?? false
  };
  const base = {
    version,
    entrypoint,
    mode: 'real_block_library_active_stack_projection' as const,
    outputContract: {
      contractId: 'umg.active_stack.projection.v1' as const,
      contractStatus: 'NORMALIZED' as const,
      sourceMode: 'explicit_runtime_state' as const,
      automaticResponseTakeover: false as const,
      activeSleeveDiscovery: false as const,
      neostackInspection: false as const,
      recursiveLoad: false as const,
      fullLibraryScan: false as const
    },
    readOnly: true as const,
    execution: 'not_performed' as const,
    directSource: 'not_enabled' as const,
    query: {
      project: input.project ?? 'UMG Envoy Agent / OpenClaw',
      currentState: input.currentState ?? 'ACTIVE_STACK_PROJECTION_DRAFT',
      activeTool: input.activeTool ?? 'umg_envoy_block_library_active_stack_projection',
      sourceTool: input.sourceTool ?? 'umg_envoy_block_library_response_envelope_fragment',
      neoblockIds,
      activeSleeve: input.activeSleeve ?? 'n/a',
      boundary: input.boundary ?? 'explicit projection only; no sleeve graph discovery',
      projectionFormat: normalizedProjectionFormat,
      includeAudit: input.includeAudit !== false
    },
    audit: {
      normalizationStatus: 'ACTIVE_STACK_PROJECTION_NORMALIZED' as const,
      contractId: 'umg.active_stack.projection.v1' as const,
      inputMode: 'explicit_runtime_state' as const,
      automaticResponseTakeover: 'false' as const,
      activeSleeveDiscovery: 'not_performed' as const,
      neostackInspection: 'not_performed' as const,
      graphTraversal: 'not_performed' as const,
      recursiveLoad: 'not_performed' as const,
      fullLibraryScan: 'not_performed' as const,
      referencedTargetLoading: 'not_performed' as const,
      externalMoltBlockFileLoading: 'not_performed' as const,
      triggerEvaluation: 'not_performed' as const,
      execution: 'not_performed' as const,
      directSource: 'not_enabled' as const,
      libraryMutation: 'not_performed' as const
    }
  };
  const deniedProjection = {
    project: base.query.project,
    currentState: base.query.currentState,
    runtimeVersion: version,
    officialEntrypoint: entrypoint,
    activeTool: base.query.activeTool,
    sourceTool: base.query.sourceTool,
    sourceContract: 'umg.molt_map.compose.v1',
    moltMapSourceContract: 'umg.molt_map.compose.v1',
    activeSleeve: base.query.activeSleeve,
    neoStackState: 'not_inspected' as const,
    graphState: 'not_inspected' as const,
    boundary: base.query.boundary,
    automaticResponseTakeover: false as const,
    limitations: ['projection_only', 'no_active_sleeve_discovery', 'no_neostack_inspection', 'no_graph_traversal', 'no_recursive_loading', 'no_execution']
  };
  if ((internal.depth ?? 0) > 3) {
    return {
      ok: false,
      ...base,
      activeStackProjection: { ...deniedProjection, projectionStatus: 'ACTIVE_STACK_PROJECTION_DENIED', sourceContextStatus: 'SOURCE_CONTEXT_NOT_EVALUATED_TO_AVOID_RECURSION' },
      sourceEnvelope: null,
      sourceComposition: null,
      nlProjection: null,
      warnings: [],
      errors: [{ code: 'HOLD_ACTIVE_STACK_PROJECTION_RECURSION_GUARD', message: 'Active Stack projection recursion guard triggered.' }]
    };
  }
  if (!['nl', 'json', 'both'].includes(projectionFormat)) {
    return {
      ok: false,
      ...base,
      activeStackProjection: { ...deniedProjection, projectionStatus: 'ACTIVE_STACK_PROJECTION_DENIED' },
      sourceEnvelope: null,
      sourceComposition: null,
      nlProjection: null,
      warnings: [],
      errors: [{ code: 'HOLD_ACTIVE_STACK_PROJECTION_FORMAT_UNSUPPORTED', message: `Unsupported projectionFormat: ${projectionFormat}` }]
    };
  }
  if (input.includeRaw) {
    return {
      ok: false,
      ...base,
      activeStackProjection: { ...deniedProjection, projectionStatus: 'ACTIVE_STACK_PROJECTION_DENIED' },
      sourceEnvelope: null,
      sourceComposition: null,
      nlProjection: null,
      warnings: [],
      errors: [{ code: 'HOLD_RAW_TARGET_DUMP_NOT_SUPPORTED', message: 'Raw target dump is not supported.' }]
    };
  }

  let sourceEnvelope: BlockLibraryResponseEnvelopeFragmentResult | null = null;
  let sourceComposition: BlockLibraryMoltMapComposeResult | null = null;
  let projectionStatus: NonNullable<BlockLibraryActiveStackProjectionResult['activeStackProjection']>['projectionStatus'] = 'ACTIVE_STACK_PROJECTION_READY';
  let sourceContextStatus: 'SOURCE_CONTEXT_NORMALIZED' | 'SOURCE_CONTEXT_NOT_REQUESTED' | 'SOURCE_CONTEXT_NOT_EVALUATED_TO_AVOID_RECURSION' = 'SOURCE_CONTEXT_NOT_REQUESTED';

  if (neoblockIds.length) {
    sourceComposition = getBlockLibraryMoltMapCompose(version, entrypoint, root, {
      neoblockIds,
      manifestKind: 'neoblock',
      summaryProfile: 'standard',
      projectionFormat: 'both',
      conflictPolicy: 'report_only',
      includeFieldProvenance: true,
      includeContentPreview: true,
      includeRaw: false
    });
    if (!sourceComposition.ok || !sourceComposition.outputContract || sourceComposition.outputContract.contractStatus !== 'NORMALIZED' || sourceComposition.outputContract.contractId !== 'umg.molt_map.compose.v1') {
      return {
        ok: false,
        ...base,
        activeStackProjection: { ...deniedProjection, projectionStatus: 'ACTIVE_STACK_PROJECTION_SOURCE_NOT_NORMALIZED', sourceContextStatus: 'SOURCE_CONTEXT_NOT_EVALUATED_TO_AVOID_RECURSION' },
        sourceEnvelope: null,
        sourceComposition,
        nlProjection: null,
        warnings: [],
        errors: [{ code: 'HOLD_ACTIVE_STACK_SOURCE_NOT_NORMALIZED', message: 'Source composer context is not normalized.' }]
      };
    }
    projectionStatus = 'ACTIVE_STACK_PROJECTION_READY_WITH_SOURCE_CONTEXT';
    sourceContextStatus = 'SOURCE_CONTEXT_NORMALIZED';
  }

  const lines = [
    'Active Stack:',
    `- Project: ${base.query.project}`,
    `- Current State: ${base.query.currentState}`,
    `- Runtime Version: ${version}`,
    `- Official Entrypoint: ${entrypoint}`,
    `- Active Tool: ${base.query.activeTool}`,
    `- Source Tool: ${base.query.sourceTool}`,
    '- Source Contract: umg.molt_map.compose.v1',
    '- MOLT Map Source Contract: umg.molt_map.compose.v1',
    `- Active Sleeve: ${base.query.activeSleeve}`,
    '- NeoStack State: not_inspected',
    '- Graph State: not_inspected',
    `- Boundary: ${base.query.boundary}`
  ];
  return {
    ok: true,
    ...base,
    activeStackProjection: {
      projectionStatus,
      project: base.query.project,
      currentState: base.query.currentState,
      runtimeVersion: version,
      officialEntrypoint: entrypoint,
      activeTool: base.query.activeTool,
      sourceTool: base.query.sourceTool,
      sourceContract: 'umg.molt_map.compose.v1',
      moltMapSourceContract: 'umg.molt_map.compose.v1',
      activeSleeve: base.query.activeSleeve,
      neoStackState: 'not_inspected',
      graphState: 'not_inspected',
      boundary: base.query.boundary,
      automaticResponseTakeover: false,
      sourceContextStatus,
      limitations: ['projection_only', 'no_active_sleeve_discovery', 'no_neostack_inspection', 'no_graph_traversal', 'no_recursive_loading', 'no_execution']
    },
    sourceEnvelope,
    sourceComposition,
    nlProjection: normalizedProjectionFormat === 'nl' || normalizedProjectionFormat === 'both' ? lines.join('\n') : null,
    warnings: [],
    errors: []
  };
}

export function getBlockLibraryResponseEnvelopeFragment(
  version: string,
  entrypoint = 'dist/plugin-entry.js',
  root = DEFAULT_LIBRARY_ROOT,
  input: {
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
  } = {}
): BlockLibraryResponseEnvelopeFragmentResult {
  const neoblockIds = input.neoblockIds ?? [];
  const projectionFormat = input.projectionFormat ?? 'both';
  const normalizedProjectionFormat: 'nl' | 'json' | 'both' = projectionFormat === 'nl' || projectionFormat === 'json' || projectionFormat === 'both' ? projectionFormat : 'both';
  const utc = currentUtcDateParts();
  const base = {
    version,
    entrypoint,
    mode: 'real_block_library_response_envelope_fragment' as const,
    outputContract: {
      contractId: 'umg.response_envelope.fragment.v1' as const,
      contractStatus: 'NORMALIZED' as const,
      sourceContractId: 'umg.molt_map.compose.v1' as const,
      sourceMode: 'explicit_neoblock_ids' as const,
      activeStackSourceContract: 'umg.active_stack.projection.v1' as const,
      activeStackSourceStatus: (input.includeActiveStackProjection === false ? 'BYPASSED_BY_QUERY' : 'NORMALIZED') as 'NORMALIZED' | 'BYPASSED_BY_QUERY',
      automaticResponseTakeover: false as const,
      recursiveLoad: false as const,
      fullLibraryScan: false as const
    },
    readOnly: true as const,
    execution: 'not_performed' as const,
    directSource: 'not_enabled' as const,
    query: {
      neoblockIds,
      project: input.project ?? 'UMG Envoy Agent / OpenClaw',
      currentState: input.currentState ?? 'RESPONSE_ENVELOPE_FRAGMENT_DRAFT',
      activeTool: input.activeTool ?? 'umg_envoy_block_library_response_envelope_fragment',
      formalResponseContent: asBoundedDisplayText(input.formalResponseContent),
      projectionFormat: normalizedProjectionFormat,
      includeMetadata: input.includeMetadata !== false,
      includeAudit: input.includeAudit !== false,
      activeSleeve: input.activeSleeve ?? 'n/a',
      activeStackBoundary: input.activeStackBoundary ?? 'explicit envelope fragment only; no automatic response takeover',
      includeActiveStackProjection: input.includeActiveStackProjection !== false
    }
  };
  if (!neoblockIds.length) {
    return {
      ok: false,
      ...base,
      sourceComposition: null,
      sourceActiveStackProjection: null,
      responseEnvelopeFragment: {
        fragmentStatus: 'RESPONSE_ENVELOPE_FRAGMENT_DENIED',
        fragmentKind: 'explicit_molt_map_envelope',
        sections: { activeStack: {}, envoyIntuition: {}, currentContextMoltMap: {}, formalResponseContent: {}, metadata: {}, audit: {} },
        sectionOrder: ['Active Stack', 'Envoy Intuition', 'Current Context — MOLT Map', 'Formal Response Content', 'Metadata'],
        automaticResponseTakeover: false,
        limitations: ['explicit_fragment_only', 'not_global_response_format', 'no_active_sleeve_discovery', 'no_neostack_inspection', 'no_recursive_loading', 'no_execution']
      },
      nlProjection: null,
      audit: {},
      warnings: [],
      errors: [{ code: 'HOLD_RESPONSE_ENVELOPE_FRAGMENT_QUERY_REQUIRED', message: 'Provide at least one neoblockId.' }]
    };
  }
  if (!['nl', 'json', 'both'].includes(projectionFormat)) {
    return {
      ok: false,
      ...base,
      sourceComposition: null,
      sourceActiveStackProjection: null,
      responseEnvelopeFragment: {
        fragmentStatus: 'RESPONSE_ENVELOPE_FRAGMENT_DENIED',
        fragmentKind: 'explicit_molt_map_envelope',
        sections: { activeStack: {}, envoyIntuition: {}, currentContextMoltMap: {}, formalResponseContent: {}, metadata: {}, audit: {} },
        sectionOrder: ['Active Stack', 'Envoy Intuition', 'Current Context — MOLT Map', 'Formal Response Content', 'Metadata'],
        automaticResponseTakeover: false,
        limitations: ['explicit_fragment_only', 'not_global_response_format', 'no_active_sleeve_discovery', 'no_neostack_inspection', 'no_recursive_loading', 'no_execution']
      },
      nlProjection: null,
      audit: {},
      warnings: [],
      errors: [{ code: 'HOLD_RESPONSE_ENVELOPE_FRAGMENT_PROJECTION_FORMAT_UNSUPPORTED', message: `Unsupported projectionFormat: ${projectionFormat}` }]
    };
  }
  if (input.includeRaw) {
    return {
      ok: false,
      ...base,
      sourceComposition: null,
      sourceActiveStackProjection: null,
      responseEnvelopeFragment: {
        fragmentStatus: 'RESPONSE_ENVELOPE_FRAGMENT_DENIED',
        fragmentKind: 'explicit_molt_map_envelope',
        sections: { activeStack: {}, envoyIntuition: {}, currentContextMoltMap: {}, formalResponseContent: {}, metadata: {}, audit: {} },
        sectionOrder: ['Active Stack', 'Envoy Intuition', 'Current Context — MOLT Map', 'Formal Response Content', 'Metadata'],
        automaticResponseTakeover: false,
        limitations: ['explicit_fragment_only', 'not_global_response_format', 'no_active_sleeve_discovery', 'no_neostack_inspection', 'no_recursive_loading', 'no_execution']
      },
      nlProjection: null,
      audit: {},
      warnings: [],
      errors: [{ code: 'HOLD_RAW_TARGET_DUMP_NOT_SUPPORTED', message: 'Raw target dump is not supported.' }]
    };
  }
  const sourceComposition = getBlockLibraryMoltMapCompose(version, entrypoint, root, {
    neoblockIds,
    projectionFormat: 'both',
    includeFieldProvenance: true,
    includeContentPreview: true,
    includeRaw: false
  });
  if (!sourceComposition.outputContract || sourceComposition.outputContract.contractStatus !== 'NORMALIZED' || sourceComposition.outputContract.contractId !== 'umg.molt_map.compose.v1') {
    return {
      ok: false,
      ...base,
      sourceComposition,
      sourceActiveStackProjection: null,
      responseEnvelopeFragment: {
        fragmentStatus: 'RESPONSE_ENVELOPE_FRAGMENT_COMPOSER_FAILED',
        fragmentKind: 'explicit_molt_map_envelope',
        sections: { activeStack: {}, envoyIntuition: {}, currentContextMoltMap: {}, formalResponseContent: {}, metadata: {}, audit: {} },
        sectionOrder: ['Active Stack', 'Envoy Intuition', 'Current Context — MOLT Map', 'Formal Response Content', 'Metadata'],
        automaticResponseTakeover: false,
        limitations: ['explicit_fragment_only', 'not_global_response_format', 'no_active_sleeve_discovery', 'no_neostack_inspection', 'no_recursive_loading', 'no_execution']
      },
      nlProjection: null,
      audit: sourceComposition.audit,
      warnings: [],
      errors: [{ code: 'HOLD_RESPONSE_ENVELOPE_FRAGMENT_COMPOSER_NOT_NORMALIZED', message: 'Composer output contract is not normalized.' }]
    };
  }
  if (!sourceComposition.ok) {
    return {
      ok: false,
      ...base,
      sourceComposition,
      sourceActiveStackProjection: null,
      responseEnvelopeFragment: {
        fragmentStatus: 'RESPONSE_ENVELOPE_FRAGMENT_COMPOSER_FAILED',
        fragmentKind: 'explicit_molt_map_envelope',
        sections: { activeStack: {}, envoyIntuition: {}, currentContextMoltMap: {}, formalResponseContent: {}, metadata: {}, audit: {} },
        sectionOrder: ['Active Stack', 'Envoy Intuition', 'Current Context — MOLT Map', 'Formal Response Content', 'Metadata'],
        automaticResponseTakeover: false,
        limitations: ['explicit_fragment_only', 'not_global_response_format', 'no_active_sleeve_discovery', 'no_neostack_inspection', 'no_recursive_loading', 'no_execution']
      },
      nlProjection: null,
      audit: sourceComposition.audit,
      warnings: [],
      errors: [{ code: 'HOLD_RESPONSE_ENVELOPE_FRAGMENT_COMPOSER_FAILED', message: 'Composer failed.' }, ...sourceComposition.errors]
    };
  }
  const sourceActiveStackProjection = base.query.includeActiveStackProjection
    ? getBlockLibraryActiveStackProjection(version, entrypoint, root, {
        project: base.query.project,
        currentState: base.query.currentState,
        activeTool: base.query.activeTool,
        sourceTool: 'umg_envoy_block_library_active_stack_projection',
        neoblockIds,
        activeSleeve: base.query.activeSleeve,
        boundary: base.query.activeStackBoundary,
        projectionFormat: 'both',
        includeAudit: true,
        includeRaw: false,
        _internal: { caller: 'response_envelope_fragment', depth: 1, disableEnvelopeSourceContext: true }
      })
    : null;
  if (base.query.includeActiveStackProjection && (!sourceActiveStackProjection || !sourceActiveStackProjection.ok || sourceActiveStackProjection.outputContract.contractStatus !== 'NORMALIZED')) {
    return {
      ok: false,
      ...base,
      sourceComposition,
      sourceActiveStackProjection,
      responseEnvelopeFragment: {
        fragmentStatus: 'RESPONSE_ENVELOPE_FRAGMENT_COMPOSER_FAILED',
        fragmentKind: 'explicit_molt_map_envelope',
        sections: { activeStack: {}, envoyIntuition: {}, currentContextMoltMap: {}, formalResponseContent: {}, metadata: {}, audit: {} },
        sectionOrder: ['Active Stack', 'Envoy Intuition', 'Current Context — MOLT Map', 'Formal Response Content', 'Metadata'],
        automaticResponseTakeover: false,
        limitations: ['explicit_fragment_only', 'not_global_response_format', 'no_active_sleeve_discovery', 'no_neostack_inspection', 'no_recursive_loading', 'no_execution']
      },
      nlProjection: null,
      audit: sourceComposition.audit,
      warnings: [],
      errors: [{ code: 'HOLD_RESPONSE_ENVELOPE_ACTIVE_STACK_PROJECTION_NOT_NORMALIZED', message: 'Active Stack projection is not normalized.' }]
    };
  }
  const deniedWarnings = sourceComposition.fragmentResults.filter((result) => !result.ok && result.hold).map((result) => `${result.requestedId}: ${result.hold}`);
  const fragmentStatus = sourceComposition.composition.deniedFragmentCount > 0 ? 'RESPONSE_ENVELOPE_FRAGMENT_READY_WITH_SOURCE_WARNINGS' as const : 'RESPONSE_ENVELOPE_FRAGMENT_READY' as const;
  const activeStackSection = sourceActiveStackProjection?.nlProjection ?? [
    'Active Stack:',
    `- Project: ${base.query.project}`,
    `- Current State: ${base.query.currentState}`,
    `- Runtime Version: ${version}`,
    `- Official Entrypoint: ${entrypoint}`,
    `- Active Tool: ${base.query.activeTool}`,
    '- Source Tool: umg_envoy_block_library_active_stack_projection',
    '- Source Contract: umg.active_stack.projection.v1',
    '- MOLT Map Source Contract: umg.molt_map.compose.v1',
    `- Active Sleeve: ${base.query.activeSleeve}`,
    '- NeoStack State: not_inspected',
    '- Graph State: not_inspected',
    `- Boundary: ${base.query.activeStackBoundary}`
  ].join('\n');
  const envoyIntuitionLine = `Envoy Intuition:\n${asBoundedParagraph(input.envoyIntuition)}`;
  const currentContext = sourceComposition.nlProjection ?? 'Current Context — MOLT Map:\nTrigger: n/a\nDirective: n/a\nInstruction: n/a\nSubject: n/a\nPrimary: n/a\nPhilosophy: n/a\nBlueprint: n/a';
  const formalResponse = `Formal Response Content:\n${base.query.formalResponseContent}`;
  const metadataLines = [
    'Metadata:',
    '- ActiveSleeve: UMG.Envoy.Agent.Alpha6.ResponseEnvelopeFragment',
    '- Mode: Response envelope fragment',
    '- Scope: Render explicit normalized MOLT Map into envelope fragment',
    '- Domain: OPENCLAW / UMG',
    '- Project: UMG Envoy Agent',
    `- State: ${base.query.currentState}`,
    '- Output: NL envelope fragment plus JSON contract',
    '- Meta: No automatic response takeover',
    '- Surface: OpenClaw tool output',
    '- Session: n/a',
    '- ChatCount: n/a',
    `- Date: ${utc.date}`,
    `- Time: ${utc.time}`,
    '- SpecVersion: UMG_OUTPUT_STYLE.v1.1'
  ];
  const nlProjection = normalizedProjectionFormat === 'nl' || normalizedProjectionFormat === 'both'
    ? [activeStackSection, envoyIntuitionLine, currentContext, formalResponse, base.query.includeMetadata ? metadataLines.join('\n') : null].filter(Boolean).join('\n\n')
    : null;
  return {
    ok: true,
    ...base,
    sourceComposition,
    sourceActiveStackProjection,
    responseEnvelopeFragment: {
      fragmentStatus,
      fragmentKind: 'explicit_molt_map_envelope',
      sections: {
        activeStack: sourceActiveStackProjection?.activeStackProjection ?? { project: base.query.project, currentState: base.query.currentState, activeTool: base.query.activeTool, sourceTool: 'umg_envoy_block_library_active_stack_projection', sourceContract: 'umg.active_stack.projection.v1', moltMapSourceContract: 'umg.molt_map.compose.v1', activeSleeve: base.query.activeSleeve, neoStackState: 'not_inspected', graphState: 'not_inspected', boundary: base.query.activeStackBoundary },
        envoyIntuition: { text: asBoundedParagraph(input.envoyIntuition) },
        currentContextMoltMap: { nlProjection: currentContext, fieldOrder: [...MOLT_MAP_FIELD_ORDER] },
        formalResponseContent: { text: base.query.formalResponseContent },
        metadata: base.query.includeMetadata ? { activeSleeve: 'UMG.Envoy.Agent.Alpha6.ResponseEnvelopeFragment', mode: 'Response envelope fragment', scope: 'Render explicit normalized MOLT Map into envelope fragment', domain: 'OPENCLAW / UMG', project: 'UMG Envoy Agent', state: base.query.currentState, output: 'NL envelope fragment plus JSON contract', meta: 'No automatic response takeover', surface: 'OpenClaw tool output', session: 'n/a', chatCount: 'n/a', date: utc.date, time: utc.time, specVersion: 'UMG_OUTPUT_STYLE.v1.1' } : {},
        audit: base.query.includeAudit ? sourceComposition.audit : {}
      },
      sectionOrder: ['Active Stack', 'Envoy Intuition', 'Current Context — MOLT Map', 'Formal Response Content', 'Metadata'],
      automaticResponseTakeover: false,
      limitations: ['explicit_fragment_only', 'not_global_response_format', 'no_active_sleeve_discovery', 'no_neostack_inspection', 'no_recursive_loading', 'no_execution']
    },
    nlProjection,
    audit: sourceComposition.audit,
    warnings: deniedWarnings.length ? [`Denied source fragments: ${deniedWarnings.join('; ')}`] : [],
    errors: []
  };
}

export function getBlockLibraryMoltMapFragment(
  version: string,
  entrypoint = 'dist/plugin-entry.js',
  root = DEFAULT_LIBRARY_ROOT,
  input: {
    neoblockId?: string;
    entryId?: string;
    sourcePath?: string;
    manifestKind?: BlockLibraryManifestKind;
    summaryProfile?: string;
    projectionFormat?: 'nl' | 'json' | 'both' | string;
    includeContentPreview?: boolean;
    includeReferenceSummary?: boolean;
    includeRaw?: boolean;
  } = {}
): BlockLibraryMoltMapFragmentResult {
  const entryId = input.neoblockId ?? input.entryId;
  const manifestKind = input.manifestKind ?? 'neoblock';
  const summaryProfile = input.summaryProfile ?? 'standard';
  const projectionFormat = (input.projectionFormat ?? 'both') as 'nl' | 'json' | 'both' | string;
  const normalizedProjectionFormat: 'nl' | 'json' | 'both' = (projectionFormat === 'nl' || projectionFormat === 'json' || projectionFormat === 'both') ? projectionFormat : 'both';
  const base = {
    version,
    entrypoint,
    mode: 'real_block_library_molt_map_fragment' as const,
    readOnly: true as const,
    execution: 'not_performed' as const,
    directSource: 'not_enabled' as const,
    query: {
      neoblockId: input.neoblockId ?? null,
      entryId: entryId ?? null,
      sourcePath: input.sourcePath ?? null,
      manifestKind,
      summaryProfile,
      projectionFormat: normalizedProjectionFormat
    }
  };
  if (!entryId && !input.sourcePath) {
    return {
      ok: false,
      ...base,
      sourceNeoblock: null,
      visibleMoltExtraction: null,
      moltMapFragment: null,
      nlProjection: null,
      warnings: [],
      errors: [{ code: 'HOLD_MOLT_MAP_FRAGMENT_QUERY_REQUIRED', message: 'Provide neoblockId, entryId, or sourcePath.' }]
    };
  }
  if (!['nl', 'json', 'both'].includes(projectionFormat)) {
    return {
      ok: false,
      ...base,
      sourceNeoblock: null,
      visibleMoltExtraction: null,
      moltMapFragment: null,
      nlProjection: null,
      warnings: [],
      errors: [{ code: 'HOLD_MOLT_MAP_FRAGMENT_PROJECTION_FORMAT_UNSUPPORTED', message: `Unsupported projectionFormat: ${projectionFormat}` }]
    };
  }
  const entryLookup = getBlockLibraryManifestEntryLookup(version, entrypoint, root, {
    entryId,
    sourcePath: input.sourcePath,
    manifestKind,
    includeManifestSummary: true,
    includeRaw: false
  });
  const extracted = getBlockLibraryMoltblockVisibleExtract(version, entrypoint, root, {
    neoblockId: input.neoblockId,
    entryId: input.entryId,
    sourcePath: input.sourcePath,
    manifestKind,
    summaryProfile,
    includeContentPreview: input.includeContentPreview !== false,
    includeReferenceSummary: input.includeReferenceSummary !== false,
    includeRaw: Boolean(input.includeRaw)
  });
  const visible = extracted.visibleMoltExtraction;
  const sourceNeoblock = extracted.sourceNeoblock;
  const visibleSummary = visible ? {
    extractStatus: visible.extractStatus,
    sourceNeoblockId: visible.sourceNeoblockId,
    moltBlockId: visible.moltBlockId,
    moltType: visible.moltType,
    moltTypeSource: visible.moltTypeSource,
    triggerEvaluation: 'not_performed' as const
  } : null;
  if (!extracted.ok || !visible || !sourceNeoblock) {
    let fragmentStatus: BlockLibraryMoltMapFragmentResult['moltMapFragment'] extends infer T ? any : never = 'MOLT_MAP_FRAGMENT_DENIED_BY_GATE';
    const first = extracted.errors[0]?.code;
    if (first === 'HOLD_TARGET_FORBIDDEN') fragmentStatus = 'MOLT_MAP_FRAGMENT_SOURCE_FORBIDDEN';
    else if (first === 'HOLD_TARGET_OUTSIDE_ALLOWLIST') fragmentStatus = 'MOLT_MAP_FRAGMENT_SOURCE_OUTSIDE_ALLOWLIST';
    else if (first === 'HOLD_VISIBLE_MOLT_NOT_FOUND') fragmentStatus = 'MOLT_MAP_FRAGMENT_VISIBLE_MOLT_NOT_FOUND';
    else if (first === 'HOLD_TARGET_NOT_NEOBLOCK') fragmentStatus = 'MOLT_MAP_FRAGMENT_SOURCE_NOT_NEOBLOCK';
    else if (first === 'HOLD_TARGET_PARSE_FAILED') fragmentStatus = 'MOLT_MAP_FRAGMENT_PARSE_FAILED';
    else if (first === 'HOLD_TARGET_SHAPE_UNKNOWN') fragmentStatus = 'MOLT_MAP_FRAGMENT_SHAPE_UNKNOWN';
    return {
      ok: false,
      ...base,
      sourceNeoblock,
      visibleMoltExtraction: visibleSummary,
      moltMapFragment: {
        fragmentStatus,
        fragmentKind: 'single_visible_molt',
        sourceNeoblockId: visible?.sourceNeoblockId ?? entryId ?? null,
        moltBlockId: visible?.moltBlockId ?? entryId ?? null,
        moltType: visible?.moltType ?? null,
        moltMapField: mapMoltTypeToFragmentField(visible?.moltType ?? null),
        fieldValue: null,
        fieldSource: visible ? 'visible_molt_extraction' : null,
        contentPreview: visible?.contentPreview ?? null,
        referenceSummary: visible?.referenceSummary ?? null,
        provenance: {
          manifestPath: entryLookup.matches[0]?.manifestPath ?? 'AI/MANIFESTS/neoblock-library-index.json',
          sourcePath: null,
          loadedFrom: 'single_shallow_target',
          backfillStatus: (first === 'HOLD_TARGET_FORBIDDEN' || first === 'HOLD_TARGET_OUTSIDE_ALLOWLIST') ? 'SOURCE_PATH_BLOCKED_BY_POLICY' : 'SOURCE_PATH_NOT_AVAILABLE'
        },
        limitations: ['single_fragment_only', 'not_full_molt_map', 'no_recursive_loading', 'no_reference_resolution', 'no_trigger_evaluation', 'no_execution']
      },
      nlProjection: null,
      warnings: extracted.warnings,
      errors: extracted.errors
    };
  }
  const moltMapField = mapMoltTypeToFragmentField(visible.moltType);
  const fieldValue = deriveFragmentFieldValue(visible);
  const resolvedMatch = entryLookup.matches[0] ?? null;
  const resolvedSourcePath = resolvedMatch?.sourcePath ?? null;
  const queryProvidedSourcePath = base.query.sourcePath;
  const provenance = {
    manifestPath: resolvedMatch?.manifestPath ?? 'AI/MANIFESTS/neoblock-library-index.json',
    sourcePath: queryProvidedSourcePath ?? resolvedSourcePath,
    loadedFrom: 'single_shallow_target' as const,
    backfillStatus: queryProvidedSourcePath
      ? 'SOURCE_PATH_PROVIDED_BY_QUERY' as const
      : resolvedSourcePath
        ? 'SOURCE_PATH_BACKFILLED_FROM_MANIFEST_ENTRY' as const
        : 'SOURCE_PATH_NOT_AVAILABLE' as const
  };
  const nlProjection = (projectionFormat === 'nl' || projectionFormat === 'both') && moltMapField
    ? `Current Context — MOLT Map Fragment:\n${moltMapField}: ${fieldValue ?? 'n/a'}`
    : null;
  return {
    ok: true,
    ...base,
    sourceNeoblock,
    visibleMoltExtraction: visibleSummary,
    moltMapFragment: {
      fragmentStatus: 'MOLT_MAP_FRAGMENT_READY',
      fragmentKind: 'single_visible_molt',
      sourceNeoblockId: visible.sourceNeoblockId,
      moltBlockId: visible.moltBlockId,
      moltType: visible.moltType,
      moltMapField,
      fieldValue,
      fieldSource: 'visible_molt_extraction',
      contentPreview: visible.contentPreview,
      referenceSummary: visible.referenceSummary,
      provenance,
      limitations: ['single_fragment_only', 'not_full_molt_map', 'no_recursive_loading', 'no_reference_resolution', 'no_trigger_evaluation', 'no_execution']
    },
    nlProjection,
    warnings: extracted.warnings,
    errors: []
  };
}

export function getBlockLibraryMoltblockVisibleExtract(
  version: string,
  entrypoint = "dist/plugin-entry.js",
  root = DEFAULT_LIBRARY_ROOT,
  input: {
    neoblockId?: string;
    entryId?: string;
    sourcePath?: string;
    manifestKind?: BlockLibraryManifestKind;
    summaryProfile?: string;
    includeContentPreview?: boolean;
    includeReferenceSummary?: boolean;
    includeRaw?: boolean;
  } = {}
): BlockLibraryMoltblockVisibleExtractResult {
  const entryId = input.neoblockId ?? input.entryId;
  const manifestKind = input.manifestKind ?? 'neoblock';
  const summaryProfile = input.summaryProfile ?? 'standard';
  const base = {
    version,
    entrypoint,
    mode: 'real_block_library_moltblock_visible_extract' as const,
    readOnly: true as const,
    execution: 'not_performed' as const,
    directSource: 'not_enabled' as const,
    query: {
      neoblockId: input.neoblockId ?? null,
      entryId: entryId ?? null,
      sourcePath: input.sourcePath ?? null,
      manifestKind,
      summaryProfile
    }
  };
  if (!entryId && !input.sourcePath) {
    return {
      ok: false,
      ...base,
      sourceNeoblock: null,
      visibleMoltExtraction: null,
      warnings: [],
      errors: [{ code: 'HOLD_VISIBLE_MOLT_EXTRACT_QUERY_REQUIRED', message: 'Provide neoblockId, entryId, or sourcePath.' }]
    };
  }
  const inspected = getBlockLibraryNeoblockInspect(version, entrypoint, root, {
    neoblockId: input.neoblockId,
    entryId: input.entryId,
    sourcePath: input.sourcePath,
    manifestKind,
    summaryProfile,
    includeContentPreview: input.includeContentPreview !== false,
    includeReferenceSummary: input.includeReferenceSummary !== false,
    includeRaw: Boolean(input.includeRaw)
  });
  const sourceNeoblock = {
    inspectStatus: inspected.neoblockInspection?.inspectStatus ?? 'NEOBLOCK_DENIED_BY_GATE',
    neoblockId: inspected.neoblockInspection?.neoblockId ?? entryId ?? null,
    artifactKind: inspected.neoblockInspection?.artifactKind ?? null,
    moltType: inspected.neoblockInspection?.moltType ?? null,
    payloadLoaded: inspected.gate.payloadLoaded,
    recursiveLoad: false as const
  };
  if (!inspected.ok || !inspected.neoblockInspection) {
    const first = inspected.errors[0]?.code;
    let extractStatus: BlockLibraryMoltblockVisibleExtractResult['visibleMoltExtraction'] extends infer T ? any : never = 'VISIBLE_MOLT_DENIED_BY_GATE';
    if (first === 'HOLD_TARGET_FORBIDDEN') extractStatus = 'VISIBLE_MOLT_SOURCE_FORBIDDEN';
    else if (first === 'HOLD_TARGET_OUTSIDE_ALLOWLIST') extractStatus = 'VISIBLE_MOLT_SOURCE_OUTSIDE_ALLOWLIST';
    else if (first === 'HOLD_TARGET_PARSE_FAILED') extractStatus = 'VISIBLE_MOLT_PARSE_FAILED';
    else if (first === 'HOLD_TARGET_SHAPE_UNKNOWN') extractStatus = 'VISIBLE_MOLT_SHAPE_UNKNOWN';
    return {
      ok: false,
      ...base,
      sourceNeoblock,
      visibleMoltExtraction: {
        extractStatus,
        moltBlockId: inspected.neoblockInspection?.neoblockId ?? entryId ?? null,
        sourceNeoblockId: inspected.neoblockInspection?.neoblockId ?? entryId ?? null,
        moltType: inspected.neoblockInspection?.moltType ?? null,
        moltTypeSource: inspected.neoblockInspection?.moltType ? 'neoblock_inspection' : null,
        role: inspected.neoblockInspection?.role ?? null,
        title: inspected.neoblockInspection?.title ?? null,
        status: inspected.neoblockInspection?.status ?? null,
        contentSummary: inspected.neoblockInspection?.contentSummary ?? null,
        moltFields: {},
        instructionLikeFields: {},
        triggerLikeFields: {},
        blueprintLikeFields: {},
        philosophyLikeFields: {},
        subjectLikeFields: {},
        primaryLikeFields: {},
        referenceSummary: inspected.neoblockInspection?.referenceSummary ?? null,
        contentPreview: inspected.neoblockInspection?.contentPreview ?? null,
        limitations: ['visible_molt_only', 'single_neoblock_source', 'no_external_moltblock_loading', 'no_recursive_loading', 'no_trigger_evaluation', 'no_execution']
      },
      warnings: inspected.warnings,
      errors: inspected.errors
    };
  }
  if (inspected.neoblockInspection.artifactKind !== 'neoblock') {
    return {
      ok: false,
      ...base,
      sourceNeoblock,
      visibleMoltExtraction: {
        extractStatus: 'VISIBLE_MOLT_SOURCE_NOT_NEOBLOCK',
        moltBlockId: inspected.neoblockInspection.neoblockId,
        sourceNeoblockId: inspected.neoblockInspection.neoblockId,
        moltType: inspected.neoblockInspection.moltType,
        moltTypeSource: inspected.neoblockInspection.moltType ? 'neoblock_inspection' : null,
        role: inspected.neoblockInspection.role,
        title: inspected.neoblockInspection.title,
        status: inspected.neoblockInspection.status,
        contentSummary: inspected.neoblockInspection.contentSummary,
        moltFields: {},
        instructionLikeFields: {},
        triggerLikeFields: {},
        blueprintLikeFields: {},
        philosophyLikeFields: {},
        subjectLikeFields: {},
        primaryLikeFields: {},
        referenceSummary: inspected.neoblockInspection.referenceSummary,
        contentPreview: inspected.neoblockInspection.contentPreview,
        limitations: ['visible_molt_only', 'single_neoblock_source', 'no_external_moltblock_loading', 'no_recursive_loading', 'no_trigger_evaluation', 'no_execution']
      },
      warnings: inspected.warnings,
      errors: [{ code: 'HOLD_TARGET_NOT_NEOBLOCK', message: 'Target artifactKind is not neoblock.' }]
    };
  }
  const contentSummary = inspected.neoblockInspection.contentSummary ?? null;
  const visibleMolt = contentSummary && typeof contentSummary === 'object' ? contentSummary : null;
  if (!visibleMolt || !inspected.neoblockInspection.moltType) {
    return {
      ok: false,
      ...base,
      sourceNeoblock,
      visibleMoltExtraction: {
        extractStatus: 'VISIBLE_MOLT_NOT_FOUND',
        moltBlockId: inspected.neoblockInspection.neoblockId,
        sourceNeoblockId: inspected.neoblockInspection.neoblockId,
        moltType: inspected.neoblockInspection.moltType,
        moltTypeSource: inspected.neoblockInspection.moltType ? 'neoblock_inspection' : null,
        role: inspected.neoblockInspection.role,
        title: inspected.neoblockInspection.title,
        status: inspected.neoblockInspection.status,
        contentSummary,
        moltFields: {},
        instructionLikeFields: {},
        triggerLikeFields: {},
        blueprintLikeFields: {},
        philosophyLikeFields: {},
        subjectLikeFields: {},
        primaryLikeFields: {},
        referenceSummary: inspected.neoblockInspection.referenceSummary,
        contentPreview: inspected.neoblockInspection.contentPreview,
        limitations: ['visible_molt_only', 'single_neoblock_source', 'no_external_moltblock_loading', 'no_recursive_loading', 'no_trigger_evaluation', 'no_execution']
      },
      warnings: inspected.warnings,
      errors: [{ code: 'HOLD_VISIBLE_MOLT_NOT_FOUND', message: 'Visible MOLT data not found in shallow-loaded NeoBlock.' }]
    };
  }
  return {
    ok: true,
    ...base,
    sourceNeoblock,
    visibleMoltExtraction: {
      extractStatus: 'VISIBLE_MOLT_EXTRACTED',
      moltBlockId: inspected.neoblockInspection.neoblockId,
      sourceNeoblockId: inspected.neoblockInspection.neoblockId,
      moltType: inspected.neoblockInspection.moltType,
      moltTypeSource: 'neoblock_inspection',
      role: inspected.neoblockInspection.role,
      title: inspected.neoblockInspection.title,
      status: inspected.neoblockInspection.status,
      contentSummary,
      moltFields: visibleMolt,
      instructionLikeFields: pickVisibleFields(visibleMolt, ['instruction', 'instructions', 'steps', 'actions', 'directive']),
      triggerLikeFields: pickVisibleFields(visibleMolt, ['trigger', 'triggers', 'conditions', 'condition']),
      blueprintLikeFields: pickVisibleFields(visibleMolt, ['blueprint', 'plan', 'schema', 'structure']),
      philosophyLikeFields: pickVisibleFields(visibleMolt, ['philosophy', 'principles', 'beliefs', 'values']),
      subjectLikeFields: pickVisibleFields(visibleMolt, ['subject', 'subjects', 'topic', 'topics']),
      primaryLikeFields: pickVisibleFields(visibleMolt, ['primary', 'goal', 'objective', 'content', 'value']),
      referenceSummary: input.includeReferenceSummary === false ? { blockRefs: 0, neoblockRefs: 0, neostackRefs: 0, moltBlockRefs: 0, toolRequests: 0, gates: 0, triggers: 0, unknownRefs: 0, resolvedRefs: 0, loadedRefs: 0 } : inspected.neoblockInspection.referenceSummary,
      contentPreview: input.includeContentPreview === false ? null : inspected.neoblockInspection.contentPreview,
      limitations: ['visible_molt_only', 'single_neoblock_source', 'no_external_moltblock_loading', 'no_recursive_loading', 'no_trigger_evaluation', 'no_execution']
    },
    warnings: inspected.warnings,
    errors: []
  };
}

function normalizeSleevePolicy(sourcePath: string | null, sourceCatalog: "auto" | "sleeves_catalog" | "ai_manifest"): "MACHINE_LOADABLE_CANDIDATE" | "PUBLIC_CURATED" | "REFERENCE_ONLY" | "FORBIDDEN" | "OUTSIDE_ALLOWLIST" | "UNKNOWN" {
  if (!sourcePath) return "UNKNOWN";
  const normalized = normalizeRelativePath(sourcePath);
  if (isForbiddenTarget(normalized)) return "FORBIDDEN";
  if (normalized.startsWith('AI/SLEEVES/')) return "MACHINE_LOADABLE_CANDIDATE";
  if (normalized.startsWith('sleeves/')) return sourceCatalog === 'ai_manifest' ? "REFERENCE_ONLY" : "PUBLIC_CURATED";
  if (isAllowedTarget(normalized)) return "MACHINE_LOADABLE_CANDIDATE";
  return "OUTSIDE_ALLOWLIST";
}

function normalizeSleeveCatalogEntries(root: string, sourceCatalog: "auto" | "sleeves_catalog" | "ai_manifest") {
  const catalogPath = sourceCatalog === 'ai_manifest'
    ? path.join(root, 'AI', 'MANIFESTS', 'sleeve-catalog.json')
    : path.join(root, 'sleeves', 'manifests', 'catalog.json');
  if (!safeExists(catalogPath)) {
    return { ok: false as const, code: 'HOLD_SLEEVE_GRAPH_INDEX_CATALOG_NOT_FOUND' as const, message: `Catalog missing: ${catalogPath}`, entries: [] as any[], catalogPath: normalizeRelativePath(path.relative(root, catalogPath)) };
  }
  try {
    const parsed = readJsonFile(catalogPath);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as any).sleeves)) {
      return { ok: false as const, code: 'HOLD_SLEEVE_GRAPH_INDEX_CATALOG_PARSE_FAILED' as const, message: `Catalog shape unsupported: ${catalogPath}`, entries: [] as any[], catalogPath: normalizeRelativePath(path.relative(root, catalogPath)) };
    }
    const catalogRel = normalizeRelativePath(path.relative(root, catalogPath));
    const entries = ((parsed as any).sleeves as Array<Record<string, unknown>>).map((entry) => {
      const sleeveId = typeof entry.id === 'string' ? entry.id : null;
      const title = typeof entry.name === 'string' ? entry.name : (typeof entry.title === 'string' ? entry.title : null);
      const rawSource = typeof entry.source_path === 'string' ? entry.source_path : (typeof entry.path === 'string' ? entry.path : null);
      const sourcePath = rawSource ? normalizeRelativePath(path.join(path.dirname(catalogRel), rawSource)) : null;
      return { sleeveId, title, sourcePath, catalogPath: catalogRel, raw: entry };
    }).filter((entry) => Boolean(entry.sleeveId));
    return { ok: true as const, entries, catalogPath: catalogRel };
  } catch (error) {
    return { ok: false as const, code: 'HOLD_SLEEVE_GRAPH_INDEX_CATALOG_PARSE_FAILED' as const, message: String(error), entries: [] as any[], catalogPath: normalizeRelativePath(path.relative(root, catalogPath)) };
  }
}

function collectSleeveRefs(root: string, sourcePath: string | null) {
  const empty = { neoStackRefs: [] as string[], neoBlockRefs: [] as string[], moltBlockRefs: [] as string[], unresolvedRefs: 0, forbiddenRefs: 0, outsideAllowlistRefs: 0, warnings: [] as string[] };
  if (!sourcePath) return empty;
  const normalized = normalizeRelativePath(sourcePath);
  if (isForbiddenTarget(normalized)) return { ...empty, forbiddenRefs: 1, warnings: ['forbidden_source_path'] };
  if (!isAllowedTarget(normalized)) return { ...empty, outsideAllowlistRefs: 1, warnings: ['outside_allowlist_source_path'] };
  const full = path.join(root, ...normalized.split('/'));
  if (!safeExists(full)) return { ...empty, unresolvedRefs: 1, warnings: ['source_path_missing_on_disk'] };
  try {
    const parsed = readJsonFile(full);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { ...empty, unresolvedRefs: 1, warnings: ['source_payload_shape_unknown'] };
    const obj = parsed as Record<string, unknown>;
    const blockRefs = Array.isArray(obj.block_refs) ? obj.block_refs : [];
    const neoBlockRefs = blockRefs.map((item) => typeof item === 'string' ? item : (item && typeof item === 'object' && typeof (item as any).block_id === 'string' ? (item as any).block_id : null)).filter((v): v is string => Boolean(v));
    const neoStackRefs = Array.isArray(obj.neostack_refs) ? obj.neostack_refs.map((item) => typeof item === 'string' ? item : (item && typeof item === 'object' && typeof (item as any).stack_id === 'string' ? (item as any).stack_id : null)).filter((v): v is string => Boolean(v)) : [];
    const moltBlockRefs = Array.isArray(obj.molt_refs) ? obj.molt_refs.map((item) => typeof item === 'string' ? item : (item && typeof item === 'object' && typeof (item as any).molt_id === 'string' ? (item as any).molt_id : null)).filter((v): v is string => Boolean(v)) : [];
    return { neoStackRefs, neoBlockRefs, moltBlockRefs, unresolvedRefs: 0, forbiddenRefs: 0, outsideAllowlistRefs: 0, warnings: [] as string[] };
  } catch {
    return { ...empty, unresolvedRefs: 1, warnings: ['source_payload_parse_failed'] };
  }
}

export function getBlockLibrarySleeveGraphIndex(
  version: string,
  entrypoint = 'dist/plugin-entry.js',
  root = DEFAULT_LIBRARY_ROOT,
  input: {
    sleeveId?: string;
    sourceCatalog?: 'auto' | 'sleeves_catalog' | 'ai_manifest' | string;
    projectionFormat?: 'nl' | 'json' | 'both' | string;
    includeReferenceSummary?: boolean;
    includePolicySummary?: boolean;
    includeRaw?: boolean;
  } = {}
): BlockLibrarySleeveGraphIndexResult {
  const requestedSourceCatalog = input.sourceCatalog ?? 'auto';
  const projectionFormat = input.projectionFormat ?? 'both';
  const includeReferenceSummary = input.includeReferenceSummary !== false;
  const includePolicySummary = input.includePolicySummary !== false;
  const base = {
    version,
    entrypoint,
    mode: 'real_block_library_sleeve_graph_index' as const,
    outputContract: {
      contractId: 'umg.sleeve_graph.index.v1' as const,
      contractStatus: 'NORMALIZED' as const,
      sourceMode: 'read_only_reference_index' as const,
      activation: false as const,
      recursiveLoad: false as const,
      fullLibraryScan: false as const,
      payloadLoading: 'catalog_or_manifest_only' as const
    },
    readOnly: true as const,
    execution: 'not_performed' as const,
    directSource: 'not_enabled' as const,
    query: {
      sleeveId: input.sleeveId ?? null,
      sourceCatalog: (requestedSourceCatalog === 'auto' || requestedSourceCatalog === 'sleeves_catalog' || requestedSourceCatalog === 'ai_manifest' ? requestedSourceCatalog : 'auto') as 'auto' | 'sleeves_catalog' | 'ai_manifest',
      projectionFormat: (projectionFormat === 'nl' || projectionFormat === 'json' || projectionFormat === 'both' ? projectionFormat : 'both') as 'nl' | 'json' | 'both',
      includeReferenceSummary,
      includePolicySummary,
      includeRaw: Boolean(input.includeRaw)
    },
    sleeveGraphIndex: {
      indexStatus: 'SLEEVE_GRAPH_INDEX_DENIED' as BlockLibrarySleeveGraphIndexStatus,
      indexKind: 'read_only_sleeve_reference_index' as const,
      sourceCatalog: (requestedSourceCatalog === 'auto' || requestedSourceCatalog === 'sleeves_catalog' || requestedSourceCatalog === 'ai_manifest' ? requestedSourceCatalog : 'auto') as 'auto' | 'sleeves_catalog' | 'ai_manifest',
      sleeveCount: 0,
      focusedSleeveId: input.sleeveId ?? null,
      sleeves: [],
      referenceSummary: {
        declaredSleeves: 0,
        declaredNeoStacks: 0,
        declaredNeoBlocks: 0,
        declaredMoltBlocks: 0,
        resolvedRefs: 0,
        loadedRefs: 0,
        unresolvedRefs: 0,
        forbiddenRefs: 0,
        outsideAllowlistRefs: 0
      },
      policySummary: {
        machineLoadableLanes: ['AI/SLEEVES'],
        publicCuratedLanes: ['sleeves', 'sleeves/manifests'],
        referenceOnlyLanes: ['AI/MANIFESTS/sleeve-catalog.json'],
        forbiddenLanes: ['archive', 'Resleever', 'HUMAN']
      },
      limitations: [
        'index_only',
        'no_sleeve_activation',
        'no_graph_traversal',
        'no_neostack_payload_loading',
        'no_neoblock_recursive_loading',
        'no_external_molt_block_loading',
        'no_execution'
      ]
    },
    nlProjection: '',
    audit: {
      sleeveActivation: 'not_performed',
      activeSleeveMutation: 'not_performed',
      neoStackPayloadLoading: 'not_performed',
      neoBlockRecursiveLoading: 'not_performed',
      externalMoltBlockFileLoading: 'not_performed',
      graphTraversal: 'not_performed',
      recursiveFullLibraryLoad: 'not_performed',
      fullLibraryScan: 'not_performed',
      triggerEvaluation: 'not_performed',
      libraryMutation: 'not_performed',
      publish: 'not_performed',
      package: 'not_performed'
    } as Record<string, unknown>,
    warnings: [] as string[],
    errors: [] as Array<{ code: BlockLibraryHoldCode; message: string }>
  };

  if (input.includeRaw) {
    return { ...base, ok: false, errors: [{ code: 'HOLD_RAW_TARGET_DUMP_NOT_SUPPORTED', message: 'includeRaw=true is not supported.' }] };
  }
  if (!['auto', 'sleeves_catalog', 'ai_manifest'].includes(requestedSourceCatalog)) {
    return { ...base, ok: false, errors: [{ code: 'HOLD_SLEEVE_GRAPH_INDEX_SOURCE_CATALOG_UNSUPPORTED', message: `Unsupported sourceCatalog: ${requestedSourceCatalog}` }] };
  }
  if (!['nl', 'json', 'both'].includes(projectionFormat)) {
    return { ...base, ok: false, errors: [{ code: 'HOLD_SLEEVE_GRAPH_INDEX_PROJECTION_FORMAT_UNSUPPORTED', message: `Unsupported projectionFormat: ${projectionFormat}` }] };
  }

  const resolvedCatalog: 'sleeves_catalog' | 'ai_manifest' = requestedSourceCatalog === 'ai_manifest' ? 'ai_manifest' : 'sleeves_catalog';
  const catalog = normalizeSleeveCatalogEntries(path.resolve(root), resolvedCatalog);
  if (!catalog.ok) {
    return { ...base, ok: false, sleeveGraphIndex: { ...base.sleeveGraphIndex, sourceCatalog: resolvedCatalog, indexStatus: 'SLEEVE_GRAPH_INDEX_UNAVAILABLE' }, errors: [{ code: catalog.code, message: catalog.message }] };
  }

  let visibleEntries = catalog.entries.filter((entry) => normalizeSleevePolicy(entry.sourcePath, resolvedCatalog) !== 'FORBIDDEN');
  if (input.sleeveId) {
    visibleEntries = visibleEntries.filter((entry) => entry.sleeveId === input.sleeveId);
    if (!visibleEntries.length) {
      return { ...base, ok: false, sleeveGraphIndex: { ...base.sleeveGraphIndex, sourceCatalog: resolvedCatalog, indexStatus: 'SLEEVE_GRAPH_INDEX_DENIED' }, errors: [{ code: 'HOLD_SLEEVE_GRAPH_INDEX_SLEEVE_NOT_FOUND', message: `Sleeve not found: ${input.sleeveId}` }] };
    }
  }

  const sleeves = visibleEntries.map((entry) => {
    const refs = collectSleeveRefs(path.resolve(root), entry.sourcePath);
    const policy = normalizeSleevePolicy(entry.sourcePath, resolvedCatalog);
    return {
      sleeveId: entry.sleeveId as string,
      title: entry.title,
      sourcePath: entry.sourcePath,
      catalogPath: entry.catalogPath,
      policy,
      activationState: 'not_active' as const,
      graphStatus: 'INDEXED_REFERENCE_ONLY' as const,
      neoStackRefs: refs.neoStackRefs,
      neoBlockRefs: refs.neoBlockRefs,
      moltBlockRefs: refs.moltBlockRefs,
      referenceSummary: {
        neoStackRefCount: refs.neoStackRefs.length,
        neoBlockRefCount: refs.neoBlockRefs.length,
        moltBlockRefCount: refs.moltBlockRefs.length,
        resolvedRefs: 0,
        loadedRefs: 0,
        unresolvedRefs: refs.unresolvedRefs,
        forbiddenRefs: refs.forbiddenRefs,
        outsideAllowlistRefs: refs.outsideAllowlistRefs
      },
      limitations: ['not_activated', 'payload_not_recursively_loaded', 'references_counted_only']
    };
  });

  const declaredNeoStacks = sleeves.reduce((sum, sleeve) => sum + sleeve.referenceSummary.neoStackRefCount, 0);
  const declaredNeoBlocks = sleeves.reduce((sum, sleeve) => sum + sleeve.referenceSummary.neoBlockRefCount, 0);
  const declaredMoltBlocks = sleeves.reduce((sum, sleeve) => sum + sleeve.referenceSummary.moltBlockRefCount, 0);
  const unresolvedRefs = sleeves.reduce((sum, sleeve) => sum + sleeve.referenceSummary.unresolvedRefs, 0);
  const forbiddenRefs = sleeves.reduce((sum, sleeve) => sum + sleeve.referenceSummary.forbiddenRefs, 0);
  const outsideAllowlistRefs = sleeves.reduce((sum, sleeve) => sum + sleeve.referenceSummary.outsideAllowlistRefs, 0);
  const warnings: string[] = [];
  if (unresolvedRefs > 0 || forbiddenRefs > 0 || outsideAllowlistRefs > 0) warnings.push('indexed sleeves contain unresolved or blocked references');
  const indexStatus: BlockLibrarySleeveGraphIndexStatus = sleeves.length === 0
    ? 'SLEEVE_GRAPH_INDEX_EMPTY'
    : (warnings.length ? 'SLEEVE_GRAPH_INDEX_READY_WITH_WARNINGS' : 'SLEEVE_GRAPH_INDEX_READY');

  const nlLines = [
    'Sleeve Graph Index:',
    `- Index Status: ${indexStatus}`,
    `- Source Catalog: ${resolvedCatalog}`,
    `- Sleeve Count: ${sleeves.length}`,
    `- Focused Sleeve: ${input.sleeveId ?? 'n/a'}`,
    '- Activation: false',
    '- Recursive Load: false',
    '- Full Library Scan: false',
    `- NeoStack References: ${declaredNeoStacks}`,
    `- NeoBlock References: ${declaredNeoBlocks}`,
    `- MOLT Block References: ${declaredMoltBlocks}`,
    '- Resolved Refs: 0',
    '- Loaded Refs: 0',
    `- Unresolved Refs: ${unresolvedRefs}`,
    `- Forbidden Refs: ${forbiddenRefs}`,
    `- Outside-Allowlist Refs: ${outsideAllowlistRefs}`,
    '- Boundary: index_only; no_sleeve_activation; no_graph_traversal; no_neostack_payload_loading; no_neoblock_recursive_loading; no_external_molt_block_loading; no_execution',
    '',
    'Sleeves:'
  ];
  const visibleForNl = sleeves.slice(0, 20);
  for (const sleeve of visibleForNl) {
    nlLines.push(`- ${sleeve.sleeveId} | policy=${sleeve.policy} | graphStatus=${sleeve.graphStatus} | neostacks=${sleeve.referenceSummary.neoStackRefCount} | neoblocks=${sleeve.referenceSummary.neoBlockRefCount} | moltblocks=${sleeve.referenceSummary.moltBlockRefCount}`);
  }
  if (sleeves.length > 20) nlLines.push('- ... truncated; additional sleeves omitted from NL projection');

  return {
    ...base,
    ok: true,
    sleeveGraphIndex: {
      indexStatus,
      indexKind: 'read_only_sleeve_reference_index',
      sourceCatalog: resolvedCatalog,
      sleeveCount: sleeves.length,
      focusedSleeveId: input.sleeveId ?? null,
      sleeves,
      referenceSummary: {
        declaredSleeves: sleeves.length,
        declaredNeoStacks: declaredNeoStacks,
        declaredNeoBlocks: declaredNeoBlocks,
        declaredMoltBlocks: declaredMoltBlocks,
        resolvedRefs: 0,
        loadedRefs: 0,
        unresolvedRefs,
        forbiddenRefs,
        outsideAllowlistRefs
      },
      policySummary: includePolicySummary ? {
        machineLoadableLanes: ['AI/SLEEVES'],
        publicCuratedLanes: ['sleeves', 'sleeves/manifests'],
        referenceOnlyLanes: ['AI/MANIFESTS/sleeve-catalog.json'],
        forbiddenLanes: ['archive', 'Resleever', 'HUMAN']
      } : { machineLoadableLanes: [], publicCuratedLanes: [], referenceOnlyLanes: [], forbiddenLanes: [] },
      limitations: [
        'index_only',
        'no_sleeve_activation',
        'no_graph_traversal',
        'no_neostack_payload_loading',
        'no_neoblock_recursive_loading',
        'no_external_molt_block_loading',
        'no_execution'
      ]
    },
    nlProjection: (projectionFormat === 'nl' || projectionFormat === 'both') ? nlLines.join('\n') : '',
    warnings,
    errors: []
  };
}

function stableRuntimeSessionId(input?: string | null): string {
  return input && input.trim().length > 0 ? input.trim() : '__default__';
}

function stableJsonHash(input: unknown): string {
  const source = JSON.stringify(input);
  return createHash('sha256').update(source).digest('hex').slice(0, 16);
}

function summarizeVisibleMoltFromBlocks(blocks: Array<{ neoblockId: string; visible: ReturnType<typeof getBlockLibraryMoltblockVisibleExtract> }>) {
  const fragments: Array<{ neoblockId: string; sourceField: string; sourceBlockId: string | null; text: string }> = [];
  for (const block of blocks) {
    const visible = block.visible.visibleMoltExtraction;
    if (!visible) {
      continue;
    }
    const content = typeof visible.contentPreview === 'string' && visible.contentPreview.trim().length > 0
      ? visible.contentPreview.trim()
      : (visible.contentSummary && typeof visible.contentSummary['content'] === 'string' ? String(visible.contentSummary['content']).trim() : '');
    const field = typeof visible.moltType === 'string' && ['Trigger','Directive','Instruction','Subject','Primary','Philosophy','Blueprint'].includes(visible.moltType)
      ? visible.moltType
      : null;
    if (field && content) {
      fragments.push({ neoblockId: block.neoblockId, sourceField: field, sourceBlockId: block.neoblockId, text: content });
    }
  }
  return fragments;
}

export function getBlockLibrarySleeveGraphDrilldown(
  version: string,
  entrypoint = 'dist/plugin-entry.js',
  root = DEFAULT_LIBRARY_ROOT,
  input: {
    sleeveId?: string;
    sourceCatalog?: 'auto' | 'sleeves_catalog' | 'ai_manifest' | string;
    projectionFormat?: 'summary' | 'nl' | 'json' | 'both' | string;
    includePolicySummary?: boolean;
    includeReferenceSummary?: boolean;
    includeRaw?: boolean;
  } = {}
) {
  const requestedProjection = input.projectionFormat ?? 'summary';
  const base = {
    version,
    entrypoint,
    mode: 'real_block_library_sleeve_graph_drilldown' as const,
    outputContract: {
      contractId: 'umg.sleeve_graph.drilldown.v1' as const,
      contractStatus: 'NORMALIZED' as const
    },
    readOnly: true as const,
    execution: 'not_performed' as const,
    directSource: 'not_enabled' as const,
    audit: {
      sleeveActivation: 'not_performed',
      activeSleeveMutation: 'not_performed',
      graphTraversal: 'not_performed',
      neoStackPayloadLoading: 'not_performed',
      neoBlockRecursiveLoading: 'not_performed',
      externalMoltBlockFileLoading: 'not_performed',
      triggerEvaluation: 'not_performed',
      libraryMutation: 'not_performed'
    },
    warnings: [] as string[],
    errors: [] as Array<{ code: BlockLibraryHoldCode; message: string }>
  };
  if (!input.sleeveId || input.sleeveId.trim().length === 0) {
    return { ...base, ok: false, drilldownStatus: 'SLEEVE_DRILLDOWN_HELD' as const, sleeveId: null, sourceIndexContract: 'umg.sleeve_graph.index.v1', sleeveEntry: null, declaredNeoStackRefs: [], declaredNeoBlockRefs: [], visibleMoltRefs: [], referenceSummary: null, policySummary: null, loadPlan: [], nlProjection: '', errors: [{ code: 'HOLD_SLEEVE_GRAPH_INDEX_SLEEVE_NOT_FOUND', message: 'sleeveId is required.' }] };
  }
  if (input.includeRaw) {
    return { ...base, ok: false, drilldownStatus: 'SLEEVE_DRILLDOWN_DENIED' as const, sleeveId: input.sleeveId, sourceIndexContract: 'umg.sleeve_graph.index.v1', sleeveEntry: null, declaredNeoStackRefs: [], declaredNeoBlockRefs: [], visibleMoltRefs: [], referenceSummary: null, policySummary: null, loadPlan: [], nlProjection: '', errors: [{ code: 'HOLD_RAW_TARGET_DUMP_NOT_SUPPORTED', message: 'includeRaw=true is not supported.' }] };
  }
  if (!['summary', 'nl', 'json', 'both'].includes(requestedProjection)) {
    return { ...base, ok: false, drilldownStatus: 'SLEEVE_DRILLDOWN_DENIED' as const, sleeveId: input.sleeveId, sourceIndexContract: 'umg.sleeve_graph.index.v1', sleeveEntry: null, declaredNeoStackRefs: [], declaredNeoBlockRefs: [], visibleMoltRefs: [], referenceSummary: null, policySummary: null, loadPlan: [], nlProjection: '', errors: [{ code: 'HOLD_SLEEVE_GRAPH_INDEX_PROJECTION_FORMAT_UNSUPPORTED', message: `Unsupported projectionFormat: ${requestedProjection}` }] };
  }
  const index = getBlockLibrarySleeveGraphIndex(version, entrypoint, root, {
    sleeveId: input.sleeveId,
    sourceCatalog: input.sourceCatalog ?? 'auto',
    projectionFormat: 'both',
    includeReferenceSummary: input.includeReferenceSummary !== false,
    includePolicySummary: input.includePolicySummary !== false,
    includeRaw: false
  });
  if (!index.ok) {
    const hold = index.errors[0]?.code === 'HOLD_SLEEVE_GRAPH_INDEX_SLEEVE_NOT_FOUND' ? 'SLEEVE_NOT_FOUND' : 'SLEEVE_DRILLDOWN_HELD';
    return { ...base, ok: false, drilldownStatus: hold, sleeveId: input.sleeveId, sourceIndexContract: 'umg.sleeve_graph.index.v1', sleeveEntry: null, declaredNeoStackRefs: [], declaredNeoBlockRefs: [], visibleMoltRefs: [], referenceSummary: null, policySummary: null, loadPlan: [], nlProjection: '', warnings: index.warnings, errors: index.errors };
  }
  const sleeve = index.sleeveGraphIndex.sleeves[0] ?? null;
  if (!sleeve) {
    return { ...base, ok: false, drilldownStatus: 'SLEEVE_NOT_FOUND' as const, sleeveId: input.sleeveId, sourceIndexContract: 'umg.sleeve_graph.index.v1', sleeveEntry: null, declaredNeoStackRefs: [], declaredNeoBlockRefs: [], visibleMoltRefs: [], referenceSummary: null, policySummary: null, loadPlan: [], nlProjection: '', errors: [{ code: 'HOLD_SLEEVE_GRAPH_INDEX_SLEEVE_NOT_FOUND', message: `Sleeve not found: ${input.sleeveId}` }] };
  }
  const loadPlan = sleeve.neoBlockRefs.slice(0, 32).map((ref) => ({ kind: 'neoblock_shallow_candidate', ref, nextTool: 'umg_envoy_block_library_neoblock_inspect' }));
  const nlProjection = [
    'Sleeve Graph Drilldown:',
    `- Sleeve Id: ${sleeve.sleeveId}`,
    `- Policy: ${sleeve.policy}`,
    `- Graph Status: ${sleeve.graphStatus}`,
    `- NeoStack Refs: ${sleeve.referenceSummary.neoStackRefCount}`,
    `- NeoBlock Refs: ${sleeve.referenceSummary.neoBlockRefCount}`,
    `- Visible MOLT Refs: ${sleeve.referenceSummary.moltBlockRefCount}`,
    `- Load Plan Steps: ${loadPlan.length}`
  ].join('\n');
  return {
    ...base,
    ok: true,
    drilldownStatus: 'SLEEVE_DRILLDOWN_READY' as const,
    sleeveId: sleeve.sleeveId,
    sourceIndexContract: 'umg.sleeve_graph.index.v1',
    sleeveEntry: sleeve,
    declaredNeoStackRefs: sleeve.neoStackRefs.slice(0, 32),
    declaredNeoBlockRefs: sleeve.neoBlockRefs.slice(0, 64),
    visibleMoltRefs: sleeve.moltBlockRefs.slice(0, 64),
    referenceSummary: sleeve.referenceSummary,
    policySummary: {
      policy: sleeve.policy,
      status: sleeve.policy === 'FORBIDDEN' || sleeve.policy === 'OUTSIDE_ALLOWLIST' ? 'deny' : 'allow'
    },
    loadPlan,
    nlProjection: requestedProjection === 'json' ? '' : nlProjection,
    warnings: index.warnings,
    errors: []
  };
}

export function selectRuntimeSleeve(
  version: string,
  entrypoint = 'dist/plugin-entry.js',
  root = DEFAULT_LIBRARY_ROOT,
  input: {
    sleeveId?: string;
    selectionMode?: 'explicit' | 'default_config' | 'current' | 'clear' | string;
    persistSelection?: boolean;
    runtimeSessionId?: string;
  } = {}
) {
  const mode = input.selectionMode ?? (input.sleeveId ? 'explicit' : 'current');
  const sessionId = stableRuntimeSessionId(input.runtimeSessionId);
  const current = runtimeSelectionState.get(sessionId)?.sleeveId ?? null;
  const base = {
    ok: true,
    version,
    entrypoint,
    mode: 'runtime_sleeve_select' as const,
    outputContract: { contractId: 'umg.sleeve.select.v1' as const, contractStatus: 'NORMALIZED' as const },
    readOnly: false,
    execution: 'not_performed' as const,
    directSource: 'not_enabled' as const,
    libraryMutation: 'not_performed' as const,
    warnings: [] as string[],
    errors: [] as Array<{ code: BlockLibraryHoldCode; message: string }>
  };
  if (!['explicit', 'default_config', 'current', 'clear'].includes(mode)) {
    return { ...base, ok: false, selectionStatus: 'SELECTION_HELD' as const, activeSleeveId: current, selectionMode: mode, selectionSource: 'current', stateMutation: 'none' as const, audit: { sessionId }, errors: [{ code: 'HOLD_SLEEVE_GRAPH_INDEX_SOURCE_CATALOG_UNSUPPORTED', message: `Unsupported selectionMode: ${mode}` }] };
  }
  if (mode === 'clear') {
    runtimeSelectionState.set(sessionId, { sleeveId: null, updatedAt: new Date().toISOString() });
    return { ...base, selectionStatus: 'SELECTION_CLEARED' as const, activeSleeveId: null, selectionMode: 'clear' as const, selectionSource: 'current' as const, stateMutation: 'cleared_session_state' as const, audit: { sessionId } };
  }
  if (mode === 'current') {
    return { ...base, selectionStatus: current ? 'SLEEVE_SELECTED' as const : 'NO_ACTIVE_SLEEVE' as const, activeSleeveId: current, selectionMode: 'current' as const, selectionSource: 'current' as const, stateMutation: 'none' as const, audit: { sessionId } };
  }
  const requestedSleeveId = mode === 'default_config' ? 'neomagnetar-dynamic-persona-v1' : input.sleeveId;
  if (!requestedSleeveId) {
    return { ...base, ok: false, selectionStatus: 'SELECTION_HELD' as const, activeSleeveId: current, selectionMode: mode as any, selectionSource: mode === 'default_config' ? 'default' : 'explicit', stateMutation: 'none' as const, audit: { sessionId }, errors: [{ code: 'HOLD_SLEEVE_GRAPH_INDEX_SLEEVE_NOT_FOUND', message: 'No sleeveId provided.' }] };
  }
  const drilldown = getBlockLibrarySleeveGraphDrilldown(version, entrypoint, root, { sleeveId: requestedSleeveId, projectionFormat: 'summary' });
  if (!drilldown.ok) {
    return { ...base, ok: false, selectionStatus: 'SLEEVE_NOT_FOUND' as const, activeSleeveId: null, selectionMode: mode as any, selectionSource: mode === 'default_config' ? 'default' : 'explicit', stateMutation: 'none' as const, audit: { sessionId }, warnings: drilldown.warnings ?? [], errors: drilldown.errors ?? [] };
  }
  runtimeSelectionState.set(sessionId, { sleeveId: requestedSleeveId, updatedAt: new Date().toISOString() });
  return { ...base, selectionStatus: 'SLEEVE_SELECTED' as const, activeSleeveId: requestedSleeveId, selectionMode: mode as any, selectionSource: mode === 'default_config' ? 'default' as const : 'explicit' as const, stateMutation: 'session_state_only' as const, audit: { sessionId, persistSelection: Boolean(input.persistSelection) } };
}

export function resolveRuntimeSleeveGraph(
  version: string,
  entrypoint = 'dist/plugin-entry.js',
  root = DEFAULT_LIBRARY_ROOT,
  input: {
    sleeveId?: string;
    runtimeSessionId?: string;
    resolveDepth?: 'reference_only' | 'neostack_refs' | 'neoblock_shallow' | 'molt_visible' | string;
    maxNeoStacks?: number;
    maxNeoBlocks?: number;
    maxVisibleMoltFragments?: number;
    allowRecursive?: boolean;
    mode?: string;
  } = {}
) {
  const depth = input.resolveDepth ?? 'molt_visible';
  const sessionId = stableRuntimeSessionId(input.runtimeSessionId);
  const selected = input.sleeveId ?? runtimeSelectionState.get(sessionId)?.sleeveId ?? null;
  const maxNeoStacks = Math.max(1, Math.min(input.maxNeoStacks ?? 8, 8));
  const maxNeoBlocks = Math.max(1, Math.min(input.maxNeoBlocks ?? 64, 64));
  const maxVisibleMoltFragments = Math.max(1, Math.min(input.maxVisibleMoltFragments ?? 128, 128));
  const base = {
    version,
    entrypoint,
    mode: 'runtime_sleeve_resolve' as const,
    outputContract: { contractId: 'umg.sleeve.resolve.v1' as const, contractStatus: 'NORMALIZED' as const },
    readOnly: true as const,
    execution: 'not_performed' as const,
    directSource: 'not_enabled' as const,
    warnings: [] as string[],
    errors: [] as Array<{ code: BlockLibraryHoldCode; message: string }>,
    blockedRefs: [] as Array<{ ref: string; reason: string }>
  };
  if (!['reference_only', 'neostack_refs', 'neoblock_shallow', 'molt_visible'].includes(depth)) {
    return { ...base, ok: false, resolutionStatus: 'DENIED' as const, sleeveId: selected, selectedSleeveSource: input.sleeveId ? 'explicit' : 'current', resolvedSleeve: null, resolvedNeoStacks: [], resolvedNeoBlocks: [], visibleMoltFragments: [], composeReadyFragments: [], limits: { maxNeoStacks, maxNeoBlocks, maxVisibleMoltFragments, allowRecursive: false }, audit: { graphTraversal: 'not_performed', triggerEvaluation: 'not_performed', libraryMutation: 'not_performed' }, errors: [{ code: 'HOLD_SLEEVE_GRAPH_INDEX_PROJECTION_FORMAT_UNSUPPORTED', message: `Unsupported resolveDepth: ${depth}` }] };
  }
  if (input.allowRecursive) {
    return { ...base, ok: false, resolutionStatus: 'DENIED' as const, sleeveId: selected, selectedSleeveSource: input.sleeveId ? 'explicit' : 'current', resolvedSleeve: null, resolvedNeoStacks: [], resolvedNeoBlocks: [], visibleMoltFragments: [], composeReadyFragments: [], limits: { maxNeoStacks, maxNeoBlocks, maxVisibleMoltFragments, allowRecursive: false }, audit: { graphTraversal: 'not_performed', triggerEvaluation: 'not_performed', libraryMutation: 'not_performed' }, errors: [{ code: 'HOLD_ACTIVE_STACK_PROJECTION_RECURSION_GUARD', message: 'Recursive resolution is not enabled in Alpha6.' }] };
  }
  if (!selected) {
    return { ...base, ok: false, resolutionStatus: 'HELD' as const, sleeveId: null, selectedSleeveSource: 'current', resolvedSleeve: null, resolvedNeoStacks: [], resolvedNeoBlocks: [], visibleMoltFragments: [], composeReadyFragments: [], limits: { maxNeoStacks, maxNeoBlocks, maxVisibleMoltFragments, allowRecursive: false }, audit: { graphTraversal: 'not_performed', triggerEvaluation: 'not_performed', libraryMutation: 'not_performed' }, errors: [{ code: 'HOLD_SLEEVE_GRAPH_INDEX_SLEEVE_NOT_FOUND', message: 'No selected sleeve available.' }] };
  }
  const drilldown = getBlockLibrarySleeveGraphDrilldown(version, entrypoint, root, { sleeveId: selected, projectionFormat: 'summary' });
  if (!drilldown.ok || !drilldown.sleeveEntry) {
    return { ...base, ok: false, resolutionStatus: 'HELD' as const, sleeveId: selected, selectedSleeveSource: input.sleeveId ? 'explicit' : 'current', resolvedSleeve: null, resolvedNeoStacks: [], resolvedNeoBlocks: [], visibleMoltFragments: [], composeReadyFragments: [], limits: { maxNeoStacks, maxNeoBlocks, maxVisibleMoltFragments, allowRecursive: false }, audit: { graphTraversal: 'not_performed', triggerEvaluation: 'not_performed', libraryMutation: 'not_performed' }, warnings: drilldown.warnings ?? [], errors: drilldown.errors ?? [] };
  }
  const neoStacks = drilldown.declaredNeoStackRefs.slice(0, maxNeoStacks).map((ref) => ({ ref, status: 'declared_only' }));
  const neoBlockRefs = drilldown.declaredNeoBlockRefs.slice(0, maxNeoBlocks);
  const resolvedNeoBlocks = [] as Array<{ neoblockId: string; status: string; summary?: unknown }>;
  const visibleBlocks = [] as Array<{ neoblockId: string; visible: ReturnType<typeof getBlockLibraryMoltblockVisibleExtract> }>;
  for (const neoblockId of neoBlockRefs) {
    const inspected = getBlockLibraryNeoblockInspect(version, entrypoint, root, { neoblockId, manifestKind: 'neoblock', summaryProfile: 'standard', includeContentPreview: true, includeReferenceSummary: true, includeRaw: false });
    if (!inspected.ok) {
      base.blockedRefs.push({ ref: neoblockId, reason: inspected.errors[0]?.code ?? 'inspect_failed' });
      resolvedNeoBlocks.push({ neoblockId, status: 'blocked' });
      continue
    }
    resolvedNeoBlocks.push({ neoblockId, status: 'shallow_loaded', summary: inspected.neoblockInspection });
    if (depth === 'molt_visible') {
      const visible = getBlockLibraryMoltblockVisibleExtract(version, entrypoint, root, { neoblockId, manifestKind: 'neoblock', summaryProfile: 'standard', includeContentPreview: true, includeReferenceSummary: true, includeRaw: false });
      if (visible.ok) {
        visibleBlocks.push({ neoblockId, visible });
      }
    }
  }
  const allVisible = summarizeVisibleMoltFromBlocks(visibleBlocks).slice(0, maxVisibleMoltFragments);
  const composeReady = allVisible.filter((fragment) => ['Trigger','Directive','Instruction','Subject','Primary','Philosophy','Blueprint'].includes(fragment.sourceField));
  const partial = base.blockedRefs.length > 0 || drilldown.declaredNeoBlockRefs.length > maxNeoBlocks || drilldown.declaredNeoStackRefs.length > maxNeoStacks || summarizeVisibleMoltFromBlocks(visibleBlocks).length > maxVisibleMoltFragments;
  if (drilldown.declaredNeoBlockRefs.length > maxNeoBlocks) base.warnings.push('neoBlock refs truncated by limit');
  if (drilldown.declaredNeoStackRefs.length > maxNeoStacks) base.warnings.push('neoStack refs truncated by limit');
  if (summarizeVisibleMoltFromBlocks(visibleBlocks).length > maxVisibleMoltFragments) base.warnings.push('visible MOLT fragments truncated by limit');
  return {
    ...base,
    ok: true,
    resolutionStatus: partial ? 'PARTIAL' as const : 'RESOLVED' as const,
    sleeveId: selected,
    selectedSleeveSource: input.sleeveId ? 'explicit' as const : 'current' as const,
    resolvedSleeve: drilldown.sleeveEntry,
    resolvedNeoStacks: depth === 'reference_only' ? [] : neoStacks,
    resolvedNeoBlocks: (depth === 'reference_only' || depth === 'neostack_refs') ? [] : resolvedNeoBlocks,
    visibleMoltFragments: depth === 'molt_visible' ? allVisible : [],
    composeReadyFragments: depth === 'molt_visible' ? composeReady : [],
    limits: { maxNeoStacks, maxNeoBlocks, maxVisibleMoltFragments, allowRecursive: false },
    audit: { graphTraversal: 'not_performed', triggerEvaluation: 'not_performed', execution: 'not_performed', libraryMutation: 'not_performed', externalMoltBlockFileLoading: 'not_performed' },
    errors: []
  };
}

function buildRuntimeSpecFromResolution(sleeveId: string, resolution: ReturnType<typeof resolveRuntimeSleeveGraph>, strictness: 'dev' | 'prod') {
  const grouped = new Map<string, Array<{ text: string; sourceBlockId: string | null }>>();
  for (const fragment of resolution.composeReadyFragments) {
    const list = grouped.get(fragment.sourceField) ?? [];
    list.push({ text: fragment.text, sourceBlockId: fragment.sourceBlockId });
    grouped.set(fragment.sourceField, list);
  }
  const fieldOrder = ['Trigger', 'Directive', 'Instruction', 'Subject', 'Primary', 'Philosophy', 'Blueprint'];
  const activeBlocks: string[] = [];
  const promptParts: RuntimeSpecV0['promptParts'] = [];
  const warnings: string[] = [...resolution.warnings];
  const errors: Array<{ code: string; message: string }> = [];
  const moltMap: Record<string, string> = {};
  for (const field of fieldOrder) {
    const values = grouped.get(field) ?? [];
    if (values.length > 1) {
      const msg = `Duplicate ${field} fragments detected.`;
      if (strictness === 'prod') {
        errors.push({ code: 'DUPLICATE_MOLT_FIELD', message: msg });
      } else {
        warnings.push(msg);
      }
    }
    const chosen = values[0] ?? null;
    if (chosen) {
      moltMap[field] = chosen.text;
      promptParts.push({ field, text: chosen.text, sourceBlockId: chosen.sourceBlockId });
      if (chosen.sourceBlockId) activeBlocks.push(chosen.sourceBlockId);
    } else {
      moltMap[field] = 'n/a';
    }
  }
  const toolRequests = (grouped.get('Trigger') ?? []).map((item) => ({ kind: 'declared_trigger', sourceBlockId: item.sourceBlockId, declaredAction: item.text }));
  const runtimeSpec: RuntimeSpecV0 = {
    runtimeSpecVersion: 'RuntimeSpecV0',
    runtimeSpecId: `rtv0-${stableJsonHash({ sleeveId, activeBlocks, promptParts })}`,
    sleeveId,
    activeBlocks: Array.from(new Set(activeBlocks.filter(Boolean))),
    moltMap,
    promptParts,
    strategy: moltMap['Directive'] === 'n/a' ? null : moltMap['Directive'],
    constraints: moltMap['Instruction'] === 'n/a' ? null : moltMap['Instruction'],
    context: { subject: moltMap['Subject'] === 'n/a' ? null : moltMap['Subject'], primary: moltMap['Primary'] === 'n/a' ? null : moltMap['Primary'] },
    values: moltMap['Philosophy'] === 'n/a' ? null : moltMap['Philosophy'],
    format: moltMap['Blueprint'] === 'n/a' ? null : moltMap['Blueprint'],
    toolRequests
  };
  return { runtimeSpec, warnings, errors };
}

export function compileRuntimeSleeve(
  version: string,
  entrypoint = 'dist/plugin-entry.js',
  root = DEFAULT_LIBRARY_ROOT,
  input: {
    sleeveId?: string;
    runtimeSessionId?: string;
    useSelectedSleeve?: boolean;
    compileMode?: string;
    resolveDepth?: 'reference_only' | 'neostack_refs' | 'neoblock_shallow' | 'molt_visible' | string;
    strictness?: 'dev' | 'prod' | string;
  } = {}
) {
  const strictness = input.strictness === 'prod' ? 'prod' : 'dev';
  const resolution = resolveRuntimeSleeveGraph(version, entrypoint, root, {
    sleeveId: input.sleeveId,
    runtimeSessionId: input.runtimeSessionId,
    resolveDepth: input.resolveDepth ?? 'molt_visible',
    allowRecursive: false,
    mode: input.compileMode ?? 'dry_run'
  });
  const base = {
    version,
    entrypoint,
    mode: 'runtime_compile' as const,
    outputContract: { contractId: 'umg.runtime.compile.v1' as const, contractStatus: 'NORMALIZED' as const },
    readOnly: true as const,
    execution: 'not_performed' as const,
    directSource: 'not_enabled' as const
  };
  if (!resolution.ok || !resolution.sleeveId) {
    return { ...base, ok: false, compileStatus: 'HELD' as const, runtimeSpecVersion: 'RuntimeSpecV0', runtimeSpecId: null, sleeveId: resolution.sleeveId ?? null, activeBlocks: [], moltMap: {}, promptParts: [], strategy: null, constraints: null, context: null, values: null, format: null, toolRequests: [], warnings: resolution.warnings ?? [], errors: resolution.errors ?? [], trace: { resolutionStatus: resolution.resolutionStatus ?? 'HELD' } };
  }
  const built = buildRuntimeSpecFromResolution(resolution.sleeveId, resolution, strictness);
  const compileStatus = built.errors.length > 0 ? 'FAILED' : (resolution.resolutionStatus === 'PARTIAL' || Object.values(built.runtimeSpec.moltMap).some((v) => v === 'n/a') ? 'PARTIAL' : 'COMPILED');
  return {
    ...base,
    ok: built.errors.length === 0,
    compileStatus,
    runtimeSpecVersion: 'RuntimeSpecV0' as const,
    runtimeSpecId: built.runtimeSpec.runtimeSpecId,
    sleeveId: built.runtimeSpec.sleeveId,
    activeBlocks: built.runtimeSpec.activeBlocks,
    moltMap: built.runtimeSpec.moltMap,
    promptParts: built.runtimeSpec.promptParts,
    strategy: built.runtimeSpec.strategy,
    constraints: built.runtimeSpec.constraints,
    context: built.runtimeSpec.context,
    values: built.runtimeSpec.values,
    format: built.runtimeSpec.format,
    toolRequests: built.runtimeSpec.toolRequests,
    warnings: built.warnings,
    errors: built.errors,
    trace: { resolutionStatus: resolution.resolutionStatus, strictness }
  };
}

const READ_ONLY_RUNTIME_TOOL_ALLOWLIST = new Set([
  'umg_envoy_block_library_status',
  'umg_envoy_block_library_manifest_index',
  'umg_envoy_block_library_manifest_entry_lookup',
  'umg_envoy_block_library_sleeve_graph_index',
  'umg_envoy_runtime_preview',
  'umg_envoy_runtime_compile',
  'umg_envoy_sleeve_resolve'
]);

function normalizeDeclaredRuntimeToolRequest(declaredAction: string) {
  const raw = String(declaredAction ?? '').trim();
  const normalized = raw.toLowerCase();
  const toolMatch = raw.match(/(umg_envoy_[a-z0-9_]+)/i);
  const requestedToolName = toolMatch?.[1]?.toLowerCase() ?? null;
  const blockedHints = [
    'publish',
    'restart',
    'install',
    'delete',
    'remove',
    'write',
    'shell',
    'exec',
    'git ',
    'git_',
    'filesystem',
    'network',
    'http',
    'curl',
    'trigger'
  ];
  const matchesBlockedHint = blockedHints.some((hint) => normalized.includes(hint));
  return { raw, requestedToolName, matchesBlockedHint };
}

function classifySingleRuntimeToolRequest(runtimeSpec: RuntimeSpecV0, request: RuntimeSpecV0['toolRequests'][number], index: number): RuntimeToolRequestClassificationV0 {
  const normalized = normalizeDeclaredRuntimeToolRequest(request.declaredAction);
  const trace = [
    `request.kind=${request.kind}`,
    `declaredAction=${normalized.raw || 'empty'}`
  ];
  if (!normalized.raw) {
    return {
      requestId: `${runtimeSpec.runtimeSpecId}:req:${index + 1}`,
      sourceRuntimeSpecId: runtimeSpec.runtimeSpecId,
      sourceSleeveId: runtimeSpec.sleeveId,
      requestedToolName: null,
      requestedAction: '',
      requestedArgsSummary: 'none',
      classification: 'unknown',
      riskLevel: 'low',
      approvalRequired: false,
      allowlisted: false,
      executionMode: 'blocked',
      decisionReason: 'Declared action was empty.',
      trace: [...trace, 'classification=unknown', 'mode=blocked']
    };
  }
  if (normalized.requestedToolName && READ_ONLY_RUNTIME_TOOL_ALLOWLIST.has(normalized.requestedToolName)) {
    return {
      requestId: `${runtimeSpec.runtimeSpecId}:req:${index + 1}`,
      sourceRuntimeSpecId: runtimeSpec.runtimeSpecId,
      sourceSleeveId: runtimeSpec.sleeveId,
      requestedToolName: normalized.requestedToolName,
      requestedAction: normalized.raw,
      requestedArgsSummary: 'declared trigger text only',
      classification: 'available_read_only',
      riskLevel: 'low',
      approvalRequired: false,
      allowlisted: true,
      executionMode: 'classify_only',
      decisionReason: 'Known read-only runtime surface; classification only in Alpha7.',
      trace: [...trace, `tool=${normalized.requestedToolName}`, 'allowlist=read_only', 'classification=available_read_only', 'mode=classify_only']
    };
  }
  if (normalized.matchesBlockedHint) {
    return {
      requestId: `${runtimeSpec.runtimeSpecId}:req:${index + 1}`,
      sourceRuntimeSpecId: runtimeSpec.runtimeSpecId,
      sourceSleeveId: runtimeSpec.sleeveId,
      requestedToolName: normalized.requestedToolName,
      requestedAction: normalized.raw,
      requestedArgsSummary: 'declared trigger text only',
      classification: 'blocked_policy',
      riskLevel: 'high',
      approvalRequired: false,
      allowlisted: false,
      executionMode: 'blocked',
      decisionReason: 'Declared action falls into a blocked policy class for Alpha7 classifier mode.',
      trace: [...trace, `tool=${normalized.requestedToolName ?? 'unknown'}`, 'policy=blocked_side_effectful', 'classification=blocked_policy', 'mode=blocked']
    };
  }
  return {
    requestId: `${runtimeSpec.runtimeSpecId}:req:${index + 1}`,
    sourceRuntimeSpecId: runtimeSpec.runtimeSpecId,
    sourceSleeveId: runtimeSpec.sleeveId,
    requestedToolName: normalized.requestedToolName,
    requestedAction: normalized.raw,
    requestedArgsSummary: 'declared trigger text only',
    classification: 'blocked_unimplemented',
    riskLevel: 'medium',
    approvalRequired: false,
    allowlisted: false,
    executionMode: 'blocked',
    decisionReason: 'No Alpha7 classifier policy mapping exists yet for this request.',
    trace: [...trace, `tool=${normalized.requestedToolName ?? 'unknown'}`, 'classification=blocked_unimplemented', 'mode=blocked']
  };
}

export function classifyRuntimeToolRequests(
  version: string,
  entrypoint = 'dist/plugin-entry.js',
  root = DEFAULT_LIBRARY_ROOT,
  input: {
    sleeveId?: string;
    runtimeSpec?: RuntimeSpecV0;
    compileIfMissing?: boolean;
    requestedToolName?: string;
    mode?: 'classify_only' | 'dry_run' | string;
    includeTrace?: boolean;
  } = {}
) {
  let compiled = null as ReturnType<typeof compileRuntimeSleeve> | null;
  let runtimeSpec = input.runtimeSpec ?? null;
  if (!runtimeSpec && input.sleeveId && input.compileIfMissing !== false) {
    compiled = compileRuntimeSleeve(version, entrypoint, root, {
      sleeveId: input.sleeveId,
      compileMode: 'dry_run',
      resolveDepth: 'molt_visible',
      strictness: 'dev'
    });
    if (compiled.ok && compiled.runtimeSpecId && compiled.sleeveId) {
      runtimeSpec = {
        runtimeSpecVersion: 'RuntimeSpecV0',
        runtimeSpecId: compiled.runtimeSpecId,
        sleeveId: compiled.sleeveId,
        activeBlocks: compiled.activeBlocks,
        moltMap: compiled.moltMap,
        promptParts: compiled.promptParts,
        strategy: compiled.strategy,
        constraints: compiled.constraints,
        context: compiled.context ?? { subject: null, primary: null },
        values: compiled.values,
        format: compiled.format,
        toolRequests: compiled.toolRequests
      };
    }
  }
  const baseAudit = {
    execution: 'not_performed' as const,
    triggerEvaluation: 'not_performed' as const,
    approvalCheckpointCreated: false,
    toolExecution: 'not_performed' as const,
    libraryMutation: 'not_performed' as const,
    packageMutation: 'not_performed' as const,
    restart: 'not_performed' as const,
    publish: 'not_performed' as const
  };
  const base = {
    version,
    entrypoint,
    mode: 'runtime_tool_request_classify' as const,
    outputContract: { contractId: 'umg.runtime.tool_request.classify.v1' as const, contractStatus: 'NORMALIZED' as const },
    executionStatus: 'not_performed' as const,
    audit: baseAudit
  };
  if (!runtimeSpec) {
    return {
      ...base,
      ok: false,
      classificationStatus: 'CLASSIFICATION_HELD' as const,
      sourceRuntimeSpecId: null,
      sleeveId: input.sleeveId ?? null,
      requestCount: 0,
      classifications: [],
      blockedCount: 0,
      approvalRequiredCount: 0,
      readOnlyCount: 0,
      unknownCount: 0,
      trace: ['runtimeSpec_missing', 'no_execution_performed'],
      warnings: compiled?.warnings ?? [],
      errors: compiled?.errors ?? [{ code: 'RUNTIME_SPEC_REQUIRED', message: 'RuntimeSpecV0 or sleeveId compile path is required for classification.' }]
    };
  }
  const filterTool = input.requestedToolName?.toLowerCase() ?? null;
  const classifications = runtimeSpec.toolRequests
    .map((request, index) => classifySingleRuntimeToolRequest(runtimeSpec as RuntimeSpecV0, request, index))
    .filter((item) => !filterTool || item.requestedToolName === filterTool);
  const blockedCount = classifications.filter((item) => item.executionMode === 'blocked').length;
  const approvalRequiredCount = classifications.filter((item) => item.approvalRequired).length;
  const readOnlyCount = classifications.filter((item) => item.classification === 'available_read_only' || item.classification === 'metadata_only').length;
  const unknownCount = classifications.filter((item) => item.classification === 'unknown' || item.classification === 'blocked_unimplemented').length;
  const classificationStatus = classifications.length === 0
    ? 'CLASSIFICATION_READY'
    : classifications.some((item) => item.classification === 'unknown')
      ? 'CLASSIFICATION_PARTIAL'
      : 'CLASSIFICATION_READY';
  return {
    ...base,
    ok: true,
    classificationStatus,
    sourceRuntimeSpecId: runtimeSpec.runtimeSpecId,
    sleeveId: runtimeSpec.sleeveId,
    requestCount: classifications.length,
    classifications: input.includeTrace === false ? classifications.map(({ trace, ...rest }) => ({ ...rest, trace: [] })) : classifications,
    blockedCount,
    approvalRequiredCount,
    readOnlyCount,
    unknownCount,
    trace: [
      `mode=${input.mode ?? 'classify_only'}`,
      `compiledDuringClassification=${compiled ? 'yes' : 'no'}`,
      `requestCount=${classifications.length}`,
      'execution=not_performed'
    ],
    warnings: compiled?.warnings ?? [],
    errors: compiled?.errors ?? []
  };
}

function mapClassificationToGateAction(classification: RuntimeToolRequestClassificationV0): RuntimeExecutionGatePlannedActionV0 {
  let gateDecision: RuntimeExecutionGateDecision = 'block_unimplemented';
  let plannedMode: RuntimeToolRequestExecutionMode = 'blocked';
  let checkpointPreview: RuntimeExecutionGatePlannedActionV0['checkpointPreview'] = null;

  switch (classification.classification) {
    case 'metadata_only':
      gateDecision = 'metadata_only';
      plannedMode = 'preview';
      break;
    case 'mock_only':
    case 'preview_only':
      gateDecision = 'preview_only';
      plannedMode = 'preview';
      break;
    case 'available_read_only':
      gateDecision = 'allow_read_only';
      plannedMode = 'classify_only';
      break;
    case 'available_requires_approval':
      gateDecision = 'require_approval';
      plannedMode = 'approval_required';
      checkpointPreview = {
        checkpointWouldBeRequired: true,
        allowedDecisions: ['approve', 'deny', 'edit', 'dry_run_only'],
        checkpointCreated: false
      };
      break;
    case 'available_allowlisted_direct':
      gateDecision = 'dry_run_only';
      plannedMode = classification.allowlisted ? 'dry_run' : 'blocked';
      break;
    case 'unknown':
      gateDecision = 'block_unknown';
      plannedMode = 'blocked';
      break;
    case 'blocked_policy':
    case 'blocked_unsafe':
    case 'blocked_missing_approval':
      gateDecision = 'block_policy';
      plannedMode = 'blocked';
      break;
    case 'blocked_unimplemented':
    case 'unavailable':
    default:
      gateDecision = 'block_unimplemented';
      plannedMode = 'blocked';
      break;
  }

  return {
    requestId: classification.requestId,
    requestedToolName: classification.requestedToolName,
    requestedAction: classification.requestedAction,
    classification: classification.classification,
    riskLevel: classification.riskLevel,
    approvalRequired: classification.approvalRequired,
    allowlisted: classification.allowlisted,
    plannedMode,
    gateDecision,
    decisionReason: classification.decisionReason,
    checkpointPreview,
    executionStatus: 'not_performed',
    trace: [...classification.trace, `gateDecision=${gateDecision}`, `plannedMode=${plannedMode}`, 'checkpointCreated=false']
  };
}

export function createRuntimeExecutionGatePlan(
  version: string,
  entrypoint = 'dist/plugin-entry.js',
  root = DEFAULT_LIBRARY_ROOT,
  input: {
    sleeveId?: string;
    runtimeSpec?: RuntimeSpecV0;
    classifications?: RuntimeToolRequestClassificationV0[];
    compileIfMissing?: boolean;
    classifyIfMissing?: boolean;
    mode?: 'plan_only' | 'dry_run' | string;
    includeTrace?: boolean;
    includeCheckpointPreview?: boolean;
  } = {}
) {
  let classificationResult = null as ReturnType<typeof classifyRuntimeToolRequests> | null;
  let runtimeSpec = input.runtimeSpec ?? null;
  let classifications = input.classifications ?? null;

  if (!classifications && (runtimeSpec || input.sleeveId) && input.classifyIfMissing !== false) {
    classificationResult = classifyRuntimeToolRequests(version, entrypoint, root, {
      sleeveId: input.sleeveId,
      runtimeSpec: runtimeSpec ?? undefined,
      compileIfMissing: input.compileIfMissing !== false,
      includeTrace: input.includeTrace !== false,
      mode: 'classify_only'
    });
    if (classificationResult.ok) {
      classifications = classificationResult.classifications;
      if (!runtimeSpec && classificationResult.sourceRuntimeSpecId && classificationResult.sleeveId) {
        runtimeSpec = {
          runtimeSpecVersion: 'RuntimeSpecV0',
          runtimeSpecId: classificationResult.sourceRuntimeSpecId,
          sleeveId: classificationResult.sleeveId,
          activeBlocks: [],
          moltMap: {},
          promptParts: [],
          strategy: null,
          constraints: null,
          context: { subject: null, primary: null },
          values: null,
          format: null,
          toolRequests: []
        };
      }
    }
  }

  const baseAudit = {
    execution: 'not_performed' as const,
    toolExecution: 'not_performed' as const,
    approvalCheckpointCreated: false,
    triggerEvaluation: 'not_performed' as const,
    libraryMutation: 'not_performed' as const,
    packageMutation: 'not_performed' as const,
    restart: 'not_performed' as const,
    publish: 'not_performed' as const
  };

  const base = {
    version,
    entrypoint,
    mode: 'runtime_execution_gate_plan' as const,
    outputContract: { contractId: 'umg.runtime.execution_gate.plan.v1' as const, contractStatus: 'NORMALIZED' as const },
    executionStatus: 'not_performed' as const,
    checkpointCreated: false as const,
    audit: baseAudit
  };

  if (!classifications) {
    return {
      ...base,
      ok: false,
      planStatus: 'GATE_PLAN_HELD' as const,
      gatePlanId: `gateplan:${runtimeSpec?.runtimeSpecId ?? input.sleeveId ?? 'unknown'}:held`,
      sourceRuntimeSpecId: runtimeSpec?.runtimeSpecId ?? null,
      sourceSleeveId: runtimeSpec?.sleeveId ?? input.sleeveId ?? null,
      requestCount: 0,
      plannedActions: [],
      readOnlyCount: 0,
      approvalRequiredCount: 0,
      blockedCount: 0,
      unknownCount: 0,
      trace: ['classifications_missing', 'execution=not_performed'],
      warnings: classificationResult?.warnings ?? [],
      errors: classificationResult?.errors ?? [{ code: 'CLASSIFICATIONS_REQUIRED', message: 'Runtime classifications are required to create a gate plan.' }]
    };
  }

  const plannedActions = classifications.map((classification) => {
    const planned = mapClassificationToGateAction(classification);
    if (input.includeCheckpointPreview === false) {
      return { ...planned, checkpointPreview: null };
    }
    return planned;
  });

  const readOnlyCount = plannedActions.filter((item) => item.gateDecision === 'allow_read_only' || item.gateDecision === 'metadata_only' || item.gateDecision === 'preview_only').length;
  const approvalRequiredCount = plannedActions.filter((item) => item.gateDecision === 'require_approval').length;
  const blockedCount = plannedActions.filter((item) => item.plannedMode === 'blocked').length;
  const unknownCount = plannedActions.filter((item) => item.gateDecision === 'block_unknown' || item.gateDecision === 'block_unimplemented').length;
  const planStatus: RuntimeExecutionGatePlanStatus = plannedActions.length === 0
    ? 'GATE_PLAN_READY'
    : unknownCount > 0
      ? 'GATE_PLAN_PARTIAL'
      : 'GATE_PLAN_READY';

  return {
    ...base,
    ok: true,
    planStatus,
    gatePlanId: `gateplan:${runtimeSpec?.runtimeSpecId ?? classificationResult?.sourceRuntimeSpecId ?? input.sleeveId ?? 'unknown'}`,
    sourceRuntimeSpecId: runtimeSpec?.runtimeSpecId ?? classificationResult?.sourceRuntimeSpecId ?? null,
    sourceSleeveId: runtimeSpec?.sleeveId ?? classificationResult?.sleeveId ?? input.sleeveId ?? null,
    requestCount: plannedActions.length,
    plannedActions: input.includeTrace === false ? plannedActions.map(({ trace, ...rest }) => ({ ...rest, trace: [] })) : plannedActions,
    readOnlyCount,
    approvalRequiredCount,
    blockedCount,
    unknownCount,
    trace: [
      `mode=${input.mode ?? 'plan_only'}`,
      `classificationSource=${classificationResult ? 'classifier' : 'provided'}`,
      `requestCount=${plannedActions.length}`,
      'execution=not_performed',
      'checkpointCreated=false'
    ],
    warnings: classificationResult?.warnings ?? [],
    errors: classificationResult?.errors ?? []
  };
}

function simpleStableKey(parts: Array<string | null | undefined>): string {
  const text = parts.map((part) => part ?? '').join('|');
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

export function createRuntimeApprovalCheckpoints(
  version: string,
  entrypoint = 'dist/plugin-entry.js',
  root = DEFAULT_LIBRARY_ROOT,
  input: {
    sleeveId?: string;
    runtimeSpec?: RuntimeSpecV0;
    classifications?: RuntimeToolRequestClassificationV0[];
    gatePlan?: RuntimeExecutionGatePlanV0;
    createForRequestIds?: string[];
    mode?: 'checkpoint_create' | 'dry_run' | string;
    includeTrace?: boolean;
    storageMode?: 'returned_only' | string;
  } = {}
) {
  let gatePlan = input.gatePlan ?? null;
  let gatePlanResult = null as ReturnType<typeof createRuntimeExecutionGatePlan> | null;
  if (!gatePlan) {
    gatePlanResult = createRuntimeExecutionGatePlan(version, entrypoint, root, {
      sleeveId: input.sleeveId,
      runtimeSpec: input.runtimeSpec,
      classifications: input.classifications,
      compileIfMissing: true,
      classifyIfMissing: true,
      mode: 'plan_only',
      includeTrace: input.includeTrace !== false,
      includeCheckpointPreview: true
    });
    if (gatePlanResult.ok) {
      gatePlan = gatePlanResult as RuntimeExecutionGatePlanV0 & { [key: string]: unknown };
    }
  }

  const base = {
    version,
    entrypoint,
    mode: 'runtime_approval_checkpoint_create' as const,
    outputContract: { contractId: 'umg.runtime.approval_checkpoint.create.v1' as const, contractStatus: 'NORMALIZED' as const },
    executionStatus: 'not_performed' as const,
    checkpointPersistence: 'not_persisted' as const
  };

  if (!gatePlan) {
    return {
      ...base,
      ok: false,
      checkpointCreateStatus: 'CHECKPOINT_CREATE_HELD' as const,
      sourceRuntimeSpecId: input.runtimeSpec?.runtimeSpecId ?? null,
      sourceSleeveId: input.runtimeSpec?.sleeveId ?? input.sleeveId ?? null,
      sourceGatePlanId: null,
      checkpointCount: 0,
      checkpoints: [],
      skippedActionCount: 0,
      skippedActions: [],
      audit: {
        execution: 'not_performed' as const,
        toolExecution: 'not_performed' as const,
        approvalCheckpointCreated: false,
        approvalCheckpointPersistence: 'not_persisted' as const,
        triggerEvaluation: 'not_performed' as const,
        libraryMutation: 'not_performed' as const,
        packageMutation: 'not_performed' as const,
        restart: 'not_performed' as const,
        publish: 'not_performed' as const
      },
      trace: ['gatePlan_missing', 'execution=not_performed'],
      warnings: gatePlanResult?.warnings ?? [],
      errors: gatePlanResult?.errors ?? [{ code: 'GATE_PLAN_REQUIRED', message: 'Gate plan is required to create approval checkpoints.' }]
    };
  }

  const requestFilter = input.createForRequestIds ? new Set(input.createForRequestIds) : null;
  const selectedActions = gatePlan.plannedActions.filter((action) => !requestFilter || requestFilter.has(action.requestId));
  const checkpoints: RuntimeApprovalCheckpointV0[] = [];
  const skippedActions: Array<{ requestId: string; requestedToolName: string | null; requestedAction: string; skipReason: string }> = [];
  const seen = new Set<string>();
  const createdAt = new Date().toISOString();

  for (const action of selectedActions) {
    if (action.gateDecision !== 'require_approval') {
      skippedActions.push({
        requestId: action.requestId,
        requestedToolName: action.requestedToolName,
        requestedAction: action.requestedAction,
        skipReason: action.gateDecision === 'allow_read_only' || action.gateDecision === 'metadata_only' || action.gateDecision === 'preview_only' || action.gateDecision === 'dry_run_only'
          ? 'no_checkpoint_required'
          : 'not_applicable'
      });
      continue;
    }

    const idempotencyKey = simpleStableKey([
      gatePlan.sourceRuntimeSpecId,
      gatePlan.sourceSleeveId,
      gatePlan.gatePlanId,
      action.requestId,
      action.requestedToolName,
      action.requestedAction,
      action.decisionReason
    ]);
    if (seen.has(idempotencyKey)) {
      continue;
    }
    seen.add(idempotencyKey);

    checkpoints.push({
      checkpointId: `ckpt_${idempotencyKey}`,
      checkpointStatus: 'CHECKPOINT_CREATED',
      sourceRuntimeSpecId: gatePlan.sourceRuntimeSpecId,
      sourceSleeveId: gatePlan.sourceSleeveId,
      sourceGatePlanId: gatePlan.gatePlanId,
      sourceRequestId: action.requestId,
      requestedToolName: action.requestedToolName,
      requestedAction: action.requestedAction,
      argsPreview: action.decisionReason,
      riskLevel: action.riskLevel,
      approvalRequired: true,
      approvalStatus: 'WAITING_FOR_APPROVAL',
      allowedDecisions: ['approve', 'deny', 'edit', 'dry_run_only'],
      idempotencyKey,
      resumeToken: `resume_${idempotencyKey}`,
      createdAt,
      expiresAt: null,
      executionStatus: 'not_performed',
      audit: {
        execution: 'not_performed',
        toolExecution: 'not_performed',
        approvalCheckpointCreated: true,
        approvalCheckpointPersistence: 'not_persisted',
        triggerEvaluation: 'not_performed',
        libraryMutation: 'not_performed',
        packageMutation: 'not_performed',
        restart: 'not_performed',
        publish: 'not_performed'
      },
      trace: [...action.trace, `idempotencyKey=${idempotencyKey}`, 'approvalStatus=WAITING_FOR_APPROVAL', 'checkpointPersistence=not_persisted']
    });
  }

  const checkpointCreateStatus: RuntimeCheckpointCreateStatus = checkpoints.length === 0
    ? 'CHECKPOINT_CREATE_READY'
    : skippedActions.length > 0
      ? 'CHECKPOINT_CREATE_PARTIAL'
      : 'CHECKPOINT_CREATE_READY';

  return {
    ...base,
    ok: true,
    checkpointCreateStatus,
    sourceRuntimeSpecId: gatePlan.sourceRuntimeSpecId,
    sourceSleeveId: gatePlan.sourceSleeveId,
    sourceGatePlanId: gatePlan.gatePlanId,
    checkpointCount: checkpoints.length,
    checkpoints: input.includeTrace === false ? checkpoints.map(({ trace, ...rest }) => ({ ...rest, trace: [] })) : checkpoints,
    skippedActionCount: skippedActions.length,
    skippedActions,
    audit: {
      execution: 'not_performed' as const,
      toolExecution: 'not_performed' as const,
      approvalCheckpointCreated: checkpoints.length > 0,
      approvalCheckpointPersistence: 'not_persisted' as const,
      triggerEvaluation: 'not_performed' as const,
      libraryMutation: 'not_performed' as const,
      packageMutation: 'not_performed' as const,
      restart: 'not_performed' as const,
      publish: 'not_performed' as const
    },
    trace: [
      `mode=${input.mode ?? 'checkpoint_create'}`,
      `storageMode=${input.storageMode ?? 'returned_only'}`,
      `checkpointCount=${checkpoints.length}`,
      `skippedActionCount=${skippedActions.length}`,
      'execution=not_performed'
    ],
    warnings: gatePlanResult?.warnings ?? [],
    errors: gatePlanResult?.errors ?? []
  };
}

export function resumeRuntimeApprovalCheckpoint(
  version: string,
  entrypoint = 'dist/plugin-entry.js',
  input: {
    checkpoint?: RuntimeApprovalCheckpointV0;
    resumeToken?: string;
    decision: 'approve' | 'deny' | 'edit' | 'dry_run_only';
    editedArgsPreview?: unknown;
    decisionReason?: string;
    mode?: 'resume_only' | 'dry_run' | string;
    includeTrace?: boolean;
  }
) {
  const checkpoint = input.checkpoint;
  const base = {
    version,
    entrypoint,
    mode: 'runtime_approval_checkpoint_resume' as const,
    outputContract: { contractId: 'umg.runtime.approval_checkpoint.resume.v1' as const, contractStatus: 'NORMALIZED' as const },
    checkpointPersistence: 'not_persisted' as const,
    executionStatus: 'not_performed' as const
  };

  if (!checkpoint) {
    return {
      ...base,
      ok: false,
      resumeStatus: 'CHECKPOINT_RESUME_FAILED' as const,
      resumeResultId: 'resume_missing_checkpoint',
      sourceCheckpointId: '',
      sourceRuntimeSpecId: null,
      sourceSleeveId: null,
      sourceGatePlanId: null,
      sourceRequestId: '',
      requestedToolName: null,
      requestedAction: '',
      decision: input.decision,
      previousApprovalStatus: 'WAITING_FOR_APPROVAL' as const,
      nextApprovalStatus: 'WAITING_FOR_APPROVAL' as const,
      allowedDecision: false,
      decisionAccepted: false,
      editRequested: false,
      dryRunOnly: false,
      executionEligible: false,
      updatedCheckpointProjection: null,
      audit: {
        execution: 'not_performed' as const,
        toolExecution: 'not_performed' as const,
        approvalCheckpointResumed: false,
        approvalCheckpointPersistence: 'not_persisted' as const,
        triggerEvaluation: 'not_performed' as const,
        libraryMutation: 'not_performed' as const,
        packageMutation: 'not_performed' as const,
        restart: 'not_performed' as const,
        publish: 'not_performed' as const
      },
      trace: ['checkpoint_missing', 'execution=not_performed'],
      errors: [{ code: 'CHECKPOINT_REQUIRED', message: 'Checkpoint is required for resume.' }],
      warnings: []
    };
  }

  const trace = [
    `checkpointStatus=${checkpoint.checkpointStatus}`,
    `previousApprovalStatus=${checkpoint.approvalStatus}`,
    `decision=${input.decision}`
  ];

  const fail = (resumeStatus: RuntimeApprovalCheckpointResumeStatus, message: string) => ({
    ...base,
    ok: false,
    resumeStatus,
    resumeResultId: `resume_${checkpoint.checkpointId}_${resumeStatus.toLowerCase()}`,
    sourceCheckpointId: checkpoint.checkpointId,
    sourceRuntimeSpecId: checkpoint.sourceRuntimeSpecId,
    sourceSleeveId: checkpoint.sourceSleeveId,
    sourceGatePlanId: checkpoint.sourceGatePlanId,
    sourceRequestId: checkpoint.sourceRequestId,
    requestedToolName: checkpoint.requestedToolName,
    requestedAction: checkpoint.requestedAction,
    decision: input.decision,
    previousApprovalStatus: checkpoint.approvalStatus,
    nextApprovalStatus: checkpoint.approvalStatus,
    allowedDecision: checkpoint.allowedDecisions.includes(input.decision),
    decisionAccepted: false,
    editRequested: false,
    dryRunOnly: false,
    executionEligible: false,
    updatedCheckpointProjection: null,
    audit: {
      execution: 'not_performed' as const,
      toolExecution: 'not_performed' as const,
      approvalCheckpointResumed: false,
      approvalCheckpointPersistence: 'not_persisted' as const,
      triggerEvaluation: 'not_performed' as const,
      libraryMutation: 'not_performed' as const,
      packageMutation: 'not_performed' as const,
      restart: 'not_performed' as const,
      publish: 'not_performed' as const
    },
    trace: [...trace, message, 'execution=not_performed'],
    errors: [{ code: 'CHECKPOINT_RESUME_INVALID', message }],
    warnings: []
  });

  if (!checkpoint.resumeToken) {
    return fail('CHECKPOINT_RESUME_FAILED', 'resume_token_missing');
  }
  if (input.resumeToken && input.resumeToken !== checkpoint.resumeToken) {
    return fail('CHECKPOINT_RESUME_HELD', 'resume_token_mismatch');
  }
  if (checkpoint.checkpointStatus !== 'CHECKPOINT_CREATED') {
    return fail('CHECKPOINT_RESUME_HELD', 'checkpoint_not_created');
  }
  if (checkpoint.approvalStatus !== 'WAITING_FOR_APPROVAL') {
    return fail('CHECKPOINT_RESUME_HELD', 'checkpoint_not_waiting_for_approval');
  }
  if (!checkpoint.allowedDecisions.includes(input.decision)) {
    return fail('CHECKPOINT_RESUME_HELD', 'decision_not_allowed');
  }
  if (checkpoint.expiresAt && Date.parse(checkpoint.expiresAt) < Date.now()) {
    return fail('CHECKPOINT_RESUME_HELD', 'checkpoint_expired');
  }

  const nextApprovalStatus: RuntimeApprovalStatus =
    input.decision === 'approve' ? 'APPROVED'
      : input.decision === 'deny' ? 'DENIED'
      : input.decision === 'edit' ? 'EDIT_REQUESTED'
      : 'DRY_RUN_ONLY';

  const resumeStatus: RuntimeApprovalCheckpointResumeStatus =
    input.decision === 'approve' ? 'CHECKPOINT_RESUME_READY'
      : input.decision === 'deny' ? 'CHECKPOINT_RESUME_DENIED'
      : input.decision === 'edit' ? 'CHECKPOINT_RESUME_EDIT_REQUESTED'
      : 'CHECKPOINT_RESUME_DRY_RUN_ONLY';

  const updatedCheckpointProjection: RuntimeApprovalCheckpointV0 = {
    ...checkpoint,
    approvalStatus: nextApprovalStatus,
    executionStatus: 'not_performed',
    trace: [
      ...checkpoint.trace,
      `resumeDecision=${input.decision}`,
      `nextApprovalStatus=${nextApprovalStatus}`,
      'execution=not_performed'
    ]
  };

  const result = {
    ...base,
    ok: true,
    resumeStatus,
    resumeResultId: `resume_${checkpoint.checkpointId}_${simpleStableKey([input.decision, input.decisionReason ? String(input.decisionReason) : '', input.editedArgsPreview ? JSON.stringify(input.editedArgsPreview) : ''])}`,
    sourceCheckpointId: checkpoint.checkpointId,
    sourceRuntimeSpecId: checkpoint.sourceRuntimeSpecId,
    sourceSleeveId: checkpoint.sourceSleeveId,
    sourceGatePlanId: checkpoint.sourceGatePlanId,
    sourceRequestId: checkpoint.sourceRequestId,
    requestedToolName: checkpoint.requestedToolName,
    requestedAction: checkpoint.requestedAction,
    decision: input.decision,
    previousApprovalStatus: checkpoint.approvalStatus,
    nextApprovalStatus,
    allowedDecision: true,
    decisionAccepted: true,
    editRequested: input.decision === 'edit',
    dryRunOnly: input.decision === 'dry_run_only',
    executionEligible: input.decision === 'approve',
    updatedCheckpointProjection,
    audit: {
      execution: 'not_performed' as const,
      toolExecution: 'not_performed' as const,
      approvalCheckpointResumed: true,
      approvalCheckpointPersistence: 'not_persisted' as const,
      triggerEvaluation: 'not_performed' as const,
      libraryMutation: 'not_performed' as const,
      packageMutation: 'not_performed' as const,
      restart: 'not_performed' as const,
      publish: 'not_performed' as const
    },
    trace: input.includeTrace === false ? [] : [...trace, `nextApprovalStatus=${nextApprovalStatus}`, `executionEligible=${input.decision === 'approve'}`, 'execution=not_performed'],
    warnings: [],
    errors: []
  };

  return result;
}

const APPROVED_ALLOWLISTED_RUNTIME_TOOLS = new Set([
  'umg_envoy_block_library_status',
  'umg_envoy_block_library_sleeve_graph_index',
  'umg_envoy_runtime_preview',
  'umg_envoy_runtime_compile',
  'umg_envoy_block_library_manifest_index'
]);

export function executeApprovedAllowlistedRuntimeAction(
  version: string,
  entrypoint = 'dist/plugin-entry.js',
  root = DEFAULT_LIBRARY_ROOT,
  input: {
    checkpoint?: RuntimeApprovalCheckpointV0;
    resumeResult?: RuntimeApprovalCheckpointResumeV0;
    runtimeSpec?: RuntimeSpecV0;
    gatePlan?: RuntimeExecutionGatePlanV0;
    actionArgs?: unknown;
    mode?: 'approved_execute' | 'dry_run' | string;
    includeTrace?: boolean;
  }
): RuntimeApprovedAllowlistedExecutionV0 & { ok: boolean; outputContract: { contractId: 'umg.runtime.execute_approved.allowlisted.v1'; contractStatus: 'NORMALIZED' }; errors?: Array<{ code: string; message: string }>; warnings?: string[] } {
  const checkpoint = input.checkpoint;
  const resumeResult = input.resumeResult;
  const base = {
    version,
    entrypoint,
    outputContract: { contractId: 'umg.runtime.execute_approved.allowlisted.v1' as const, contractStatus: 'NORMALIZED' as const }
  };

  const fail = (reason: string, resultSummary: string): RuntimeApprovedAllowlistedExecutionV0 & { ok: boolean; outputContract: { contractId: 'umg.runtime.execute_approved.allowlisted.v1'; contractStatus: 'NORMALIZED' }; errors: Array<{ code: string; message: string }>; warnings: string[] } => ({
    ...base,
    ok: false,
    executionResultId: `exec_${simpleStableKey([checkpoint?.checkpointId ?? 'missing', reason])}`,
    executionStatus: 'EXECUTION_BLOCKED',
    sourceCheckpointId: checkpoint?.checkpointId ?? null,
    sourceRuntimeSpecId: checkpoint?.sourceRuntimeSpecId ?? null,
    sourceSleeveId: checkpoint?.sourceSleeveId ?? null,
    sourceGatePlanId: checkpoint?.sourceGatePlanId ?? null,
    sourceRequestId: checkpoint?.sourceRequestId ?? null,
    requestedToolName: checkpoint?.requestedToolName ?? null,
    requestedAction: checkpoint?.requestedAction ?? null,
    approvalStatus: checkpoint?.approvalStatus ?? null,
    executionEligible: false,
    allowlisted: false,
    readOnly: false,
    executedAction: null,
    resultSummary,
    resultPayload: { blockedReason: reason },
    sideEffectStatus: 'not_performed',
    audit: {
      approvalVerified: false,
      allowlistVerified: false,
      readOnlyVerified: false,
      toolExecution: 'not_performed',
      triggerEvaluation: 'not_performed',
      libraryMutation: 'not_performed',
      packageMutation: 'not_performed',
      filesystemMutation: 'not_performed',
      restart: 'not_performed',
      publish: 'not_performed'
    },
    trace: [reason, 'execution=not_performed'],
    errors: [{ code: reason, message: resultSummary }],
    warnings: []
  });

  if (!checkpoint) {
    return fail('BLOCKED_MISSING_CHECKPOINT', 'Checkpoint is required for approved allowlisted execution.');
  }
  if (!resumeResult) {
    return fail('BLOCKED_INVALID_RESUME_STATE', 'Resume result is required for approved allowlisted execution.');
  }
  if (resumeResult.sourceCheckpointId !== checkpoint.checkpointId || resumeResult.sourceRequestId !== checkpoint.sourceRequestId) {
    return fail('BLOCKED_INVALID_RESUME_STATE', 'Resume result does not match checkpoint identity.');
  }
  if (resumeResult.nextApprovalStatus !== 'APPROVED' || !resumeResult.executionEligible) {
    return fail('BLOCKED_NOT_APPROVED', 'Checkpoint is not approved for execution.');
  }
  if (input.mode !== 'approved_execute') {
    return fail('BLOCKED_POLICY', 'approved_execute mode is required for allowlisted execution.');
  }

  const requestedToolName = checkpoint.requestedToolName;
  if (!requestedToolName || !APPROVED_ALLOWLISTED_RUNTIME_TOOLS.has(requestedToolName)) {
    return fail('BLOCKED_NOT_ALLOWLISTED', 'Requested tool is not on the approved allowlisted read-only set.');
  }

  let resultPayload: unknown = null;
  let executedAction: string | null = null;
  if (requestedToolName === 'umg_envoy_block_library_status') {
    resultPayload = getBlockLibraryStatus(version, entrypoint, root);
    executedAction = 'block_library_status_read';
  } else if (requestedToolName === 'umg_envoy_block_library_sleeve_graph_index') {
    resultPayload = getBlockLibrarySleeveGraphIndex(version, entrypoint, root, {
      sleeveId: checkpoint.sourceSleeveId ?? input.runtimeSpec?.sleeveId ?? 'neomagnetar-dynamic-persona-v1'
    });
    executedAction = 'sleeve_graph_index_read';
  } else if (requestedToolName === 'umg_envoy_runtime_preview') {
    resultPayload = previewRuntimeSleeve(version, entrypoint, root, {
      sleeveId: checkpoint.sourceSleeveId ?? input.runtimeSpec?.sleeveId,
      previewFormat: 'summary',
      includeActiveStack: true,
      includeMoltMap: true,
      includeEnvelope: true,
      includeToolRequests: true
    });
    executedAction = 'runtime_preview_regeneration';
  } else if (requestedToolName === 'umg_envoy_runtime_compile') {
    resultPayload = compileRuntimeSleeve(version, entrypoint, root, {
      sleeveId: checkpoint.sourceSleeveId ?? input.runtimeSpec?.sleeveId,
      compileMode: 'dry_run',
      resolveDepth: 'molt_visible',
      strictness: 'dev'
    });
    executedAction = 'runtime_compile_dry_run';
  } else if (requestedToolName === 'umg_envoy_block_library_manifest_index') {
    resultPayload = getBlockLibraryManifestIndex(version, entrypoint, root);
    executedAction = 'manifest_index_read';
  } else {
    return fail('BLOCKED_UNSUPPORTED_ACTION', 'Requested tool is allowlisted in name only but has no safe direct internal executor.');
  }

  return {
    ...base,
    ok: true,
    executionResultId: `exec_${simpleStableKey([checkpoint.checkpointId, resumeResult.resumeResultId, requestedToolName])}`,
    executionStatus: 'EXECUTION_READY',
    sourceCheckpointId: checkpoint.checkpointId,
    sourceRuntimeSpecId: checkpoint.sourceRuntimeSpecId,
    sourceSleeveId: checkpoint.sourceSleeveId,
    sourceGatePlanId: checkpoint.sourceGatePlanId,
    sourceRequestId: checkpoint.sourceRequestId,
    requestedToolName,
    requestedAction: checkpoint.requestedAction,
    approvalStatus: checkpoint.approvalStatus,
    executionEligible: true,
    allowlisted: true,
    readOnly: true,
    executedAction,
    resultSummary: `Executed approved allowlisted read-only action: ${executedAction}`,
    resultPayload,
    sideEffectStatus: 'read_only_no_mutation',
    audit: {
      approvalVerified: true,
      allowlistVerified: true,
      readOnlyVerified: true,
      toolExecution: 'performed',
      triggerEvaluation: 'not_performed',
      libraryMutation: 'not_performed',
      packageMutation: 'not_performed',
      filesystemMutation: 'not_performed',
      restart: 'not_performed',
      publish: 'not_performed'
    },
    trace: [
      `requestedToolName=${requestedToolName}`,
      `executedAction=${executedAction}`,
      'approvalVerified=true',
      'allowlistVerified=true',
      'readOnlyVerified=true'
    ],
    warnings: [],
    errors: []
  };
}

export function runRuntimeExecutionChainE2EApprovedReadOnly(
  version: string,
  entrypoint = 'dist/plugin-entry.js',
  root = DEFAULT_LIBRARY_ROOT,
  input: {
    sleeveId?: string;
    requestedToolName?: string;
    requestedAction?: string;
    approvalDecision?: 'approve' | 'deny' | 'dry_run_only';
    mode?: 'e2e_approved_read_only' | 'dry_run' | string;
    includeTrace?: boolean;
  } = {}
) {
  const sleeveId = input.sleeveId ?? 'neomagnetar-dynamic-persona-v1';
  const requestedToolName = input.requestedToolName ?? 'umg_envoy_block_library_status';
  const requestedAction = input.requestedAction ?? 'status_read';
  const approvalDecision = input.approvalDecision ?? 'approve';
  const chainRunId = `chain_${simpleStableKey([sleeveId, requestedToolName, requestedAction, approvalDecision])}`;

  const compiled = compileRuntimeSleeve(version, entrypoint, root, {
    sleeveId,
    compileMode: 'dry_run',
    resolveDepth: 'molt_visible',
    strictness: 'dev'
  });

  if (!compiled.ok || !compiled.runtimeSpecId || !compiled.sleeveId) {
    return {
      ok: false,
      outputContract: { contractId: 'umg.runtime.execution_chain.e2e_approved_read_only.v1' as const, contractStatus: 'NORMALIZED' as const },
      chainRunId,
      chainStatus: 'CHAIN_E2E_FAILED' as const,
      sourceSleeveId: sleeveId,
      runtimeSpecId: null,
      classifierResultId: null,
      gatePlanId: null,
      checkpointId: null,
      resumeResultId: null,
      executionResultId: null,
      requestedToolName,
      requestedAction,
      approvalDecision,
      executionStatus: 'not_performed' as const,
      sideEffectStatus: 'not_performed' as const,
      resultSummary: 'Runtime compile failed before E2E chain could proceed.',
      resultPayload: null,
      classifierResult: null,
      gatePlanResult: null,
      checkpointCreateResult: null,
      checkpointResumeResult: null,
      executionResult: null,
      audit: {
        runtimeCompiled: false,
        classificationPerformed: false,
        gatePlanCreated: false,
        approvalCheckpointCreated: false,
        approvalCheckpointResumed: false,
        approvalVerified: false,
        allowlistVerified: false,
        readOnlyVerified: false,
        toolExecution: 'not_performed' as const,
        triggerEvaluation: 'not_performed' as const,
        libraryMutation: 'not_performed' as const,
        packageMutation: 'not_performed' as const,
        filesystemMutation: 'not_performed' as const,
        restart: 'not_performed' as const,
        publish: 'not_performed' as const
      },
      trace: ['compile_failed', 'execution=not_performed'],
      warnings: compiled.warnings,
      errors: compiled.errors
    };
  }

  const runtimeSpec: RuntimeSpecV0 = {
    runtimeSpecVersion: 'RuntimeSpecV0',
    runtimeSpecId: compiled.runtimeSpecId,
    sleeveId: compiled.sleeveId,
    activeBlocks: compiled.activeBlocks,
    moltMap: compiled.moltMap,
    promptParts: compiled.promptParts,
    strategy: compiled.strategy,
    constraints: compiled.constraints,
    context: compiled.context,
    values: compiled.values,
    format: compiled.format,
    toolRequests: [
      {
        kind: 'synthetic_e2e_request',
        sourceBlockId: 'alpha7-e2e-chain',
        declaredAction: requestedToolName
      }
    ]
  };

  const classifierResult = classifyRuntimeToolRequests(version, entrypoint, root, {
    runtimeSpec,
    compileIfMissing: false,
    requestedToolName,
    mode: 'classify_only',
    includeTrace: input.includeTrace !== false
  });

  const syntheticClassification = {
    requestId: `${runtimeSpec.runtimeSpecId}:req:e2e`,
    sourceRuntimeSpecId: runtimeSpec.runtimeSpecId,
    sourceSleeveId: runtimeSpec.sleeveId,
    requestedToolName,
    requestedAction,
    requestedArgsSummary: 'syntheticForE2E=true',
    classification: 'available_requires_approval' as const,
    riskLevel: 'low' as const,
    approvalRequired: true,
    allowlisted: APPROVED_ALLOWLISTED_RUNTIME_TOOLS.has(requestedToolName),
    executionMode: 'approval_required' as const,
    decisionReason: 'Synthetic approval-required projection for E2E approved read-only proof.',
    trace: ['syntheticForE2E=true']
  };

  const gatePlanResult = createRuntimeExecutionGatePlan(version, entrypoint, root, {
    runtimeSpec,
    classifications: [syntheticClassification],
    compileIfMissing: false,
    classifyIfMissing: false,
    mode: 'plan_only',
    includeTrace: input.includeTrace !== false,
    includeCheckpointPreview: true
  });

  const checkpointCreateResult = createRuntimeApprovalCheckpoints(version, entrypoint, root, {
    runtimeSpec,
    gatePlan: gatePlanResult as any,
    mode: 'checkpoint_create',
    includeTrace: input.includeTrace !== false,
    storageMode: 'returned_only'
  });

  const checkpoint = checkpointCreateResult.checkpoints?.[0] ?? null;
  if (!checkpoint) {
    return {
      ok: false,
      outputContract: { contractId: 'umg.runtime.execution_chain.e2e_approved_read_only.v1' as const, contractStatus: 'NORMALIZED' as const },
      chainRunId,
      chainStatus: 'CHAIN_E2E_BLOCKED' as const,
      sourceSleeveId: runtimeSpec.sleeveId,
      runtimeSpecId: runtimeSpec.runtimeSpecId,
      classifierResultId: runtimeSpec.runtimeSpecId,
      gatePlanId: gatePlanResult.gatePlanId ?? null,
      checkpointId: null,
      resumeResultId: null,
      executionResultId: null,
      requestedToolName,
      requestedAction,
      approvalDecision,
      executionStatus: 'not_performed' as const,
      sideEffectStatus: 'not_performed' as const,
      resultSummary: 'Checkpoint creation did not return a checkpoint.',
      resultPayload: null,
      classifierResult,
      gatePlanResult,
      checkpointCreateResult,
      checkpointResumeResult: null,
      executionResult: null,
      audit: {
        runtimeCompiled: true,
        classificationPerformed: true,
        gatePlanCreated: true,
        approvalCheckpointCreated: false,
        approvalCheckpointResumed: false,
        approvalVerified: false,
        allowlistVerified: false,
        readOnlyVerified: false,
        toolExecution: 'not_performed' as const,
        triggerEvaluation: 'not_performed' as const,
        libraryMutation: 'not_performed' as const,
        packageMutation: 'not_performed' as const,
        filesystemMutation: 'not_performed' as const,
        restart: 'not_performed' as const,
        publish: 'not_performed' as const
      },
      trace: ['checkpoint_missing', 'execution=not_performed'],
      warnings: checkpointCreateResult.warnings ?? [],
      errors: checkpointCreateResult.errors ?? []
    };
  }

  const checkpointResumeResult = resumeRuntimeApprovalCheckpoint(version, entrypoint, {
    checkpoint,
    resumeToken: checkpoint.resumeToken,
    decision: approvalDecision,
    mode: 'resume_only',
    includeTrace: input.includeTrace !== false
  });

  const executionResult = executeApprovedAllowlistedRuntimeAction(version, entrypoint, root, {
    checkpoint,
    resumeResult: checkpointResumeResult as any,
    runtimeSpec,
    gatePlan: gatePlanResult as any,
    actionArgs: { syntheticForE2E: true },
    mode: 'approved_execute',
    includeTrace: input.includeTrace !== false
  });

  const success = executionResult.ok && executionResult.executionStatus === 'EXECUTION_READY';
  const blocked = executionResult.executionStatus === 'EXECUTION_BLOCKED';

  return {
    ok: success,
    outputContract: { contractId: 'umg.runtime.execution_chain.e2e_approved_read_only.v1' as const, contractStatus: 'NORMALIZED' as const },
    chainRunId,
    chainStatus: success ? 'CHAIN_E2E_READY' as const : blocked ? 'CHAIN_E2E_BLOCKED' as const : 'CHAIN_E2E_FAILED' as const,
    sourceSleeveId: runtimeSpec.sleeveId,
    runtimeSpecId: runtimeSpec.runtimeSpecId,
    classifierResultId: runtimeSpec.runtimeSpecId,
    gatePlanId: gatePlanResult.gatePlanId ?? null,
    checkpointId: checkpoint.checkpointId,
    resumeResultId: checkpointResumeResult.resumeResultId ?? null,
    executionResultId: executionResult.executionResultId ?? null,
    requestedToolName,
    requestedAction,
    approvalDecision,
    executionStatus: executionResult.executionStatus,
    sideEffectStatus: executionResult.sideEffectStatus,
    resultSummary: executionResult.resultSummary,
    resultPayload: executionResult.resultPayload,
    classifierResult,
    gatePlanResult,
    checkpointCreateResult,
    checkpointResumeResult,
    executionResult,
    audit: {
      runtimeCompiled: true,
      classificationPerformed: true,
      gatePlanCreated: true,
      approvalCheckpointCreated: checkpointCreateResult.checkpointCount > 0,
      approvalCheckpointResumed: checkpointResumeResult.decisionAccepted === true,
      approvalVerified: executionResult.audit.approvalVerified,
      allowlistVerified: executionResult.audit.allowlistVerified,
      readOnlyVerified: executionResult.audit.readOnlyVerified,
      toolExecution: executionResult.audit.toolExecution,
      triggerEvaluation: 'not_performed' as const,
      libraryMutation: 'not_performed' as const,
      packageMutation: 'not_performed' as const,
      filesystemMutation: 'not_performed' as const,
      restart: 'not_performed' as const,
      publish: 'not_performed' as const
    },
    trace: [
      `syntheticForE2E=true`,
      `approvalDecision=${approvalDecision}`,
      `requestedToolName=${requestedToolName}`,
      `executionStatus=${executionResult.executionStatus}`
    ],
    warnings: [],
    errors: executionResult.errors ?? []
  };
}

export function inspectRuntimeActiveSleeveIrMatrixEnvelope(
  version: string,
  entrypoint = 'dist/plugin-entry.js',
  root = DEFAULT_LIBRARY_ROOT,
  input: {
    sleeveId?: string;
    includeNeoStacks?: boolean;
    includeNeoBlocks?: boolean;
    includeMoltBlocks?: boolean;
    includeRuntimeSpec?: boolean;
    includeIrMatrix?: boolean;
    includeEnvelope?: boolean;
    includeExecutionGateState?: boolean;
    mode?: 'inspect_only' | string;
  } = {}
) {
  const sleeveId = input.sleeveId ?? 'neomagnetar-dynamic-persona-v1';
  const inspectorRunId = `inspect_${simpleStableKey([sleeveId, 'ir_matrix_envelope'])}`;

  const selected = selectRuntimeSleeve(version, entrypoint, root, { sleeveId, selectionMode: 'explicit' });
  const resolved = resolveRuntimeSleeveGraph(version, entrypoint, root, { sleeveId, resolveDepth: 'molt_visible' });
  const graph = getBlockLibrarySleeveGraphDrilldown(version, entrypoint, root, { sleeveId, projectionFormat: 'summary' });
  const resolvedNeoBlockIds = resolved.ok ? resolved.resolvedNeoBlocks.map((block) => block.neoblockId).filter(Boolean) : [];
  const activeStackBoundary = resolved.ok
    ? (resolved.resolvedSleeve?.neoStackRefs?.length ? 'runtime sleeve graph inspection with declared neostack references' : 'runtime sleeve graph inspection without declared neostacks; direct neoblock sleeve')
    : 'runtime sleeve graph unavailable';
  const activeStackProjection = getBlockLibraryActiveStackProjection(version, entrypoint, root, {
    neoblockIds: resolvedNeoBlockIds,
    currentState: resolved.ok ? resolved.resolutionStatus : 'RESOLUTION_UNAVAILABLE',
    activeSleeve: sleeveId,
    boundary: activeStackBoundary
  });
  const responseEnvelopePreview = resolvedNeoBlockIds.length > 0
    ? getBlockLibraryResponseEnvelopeFragment(version, entrypoint, root, {
        neoblockIds: resolvedNeoBlockIds,
        currentState: resolved.ok ? resolved.resolutionStatus : 'RESOLUTION_UNAVAILABLE',
        activeSleeve: sleeveId,
        activeStackBoundary
      })
    : {
        ok: true,
        version,
        entrypoint,
        mode: 'runtime_level_envelope_preview',
        outputContract: {
          contractId: 'umg.runtime.envelope.preview.v1',
          contractStatus: 'NORMALIZED',
          sourceContractId: 'umg.runtime.compile.v1',
          sourceMode: 'runtime_spec_fallback',
          activeStackSourceContract: 'umg.active_stack.projection.v1',
          activeStackSourceStatus: 'NORMALIZED',
          automaticResponseTakeover: false,
          recursiveLoad: false,
          fullLibraryScan: false
        },
        readOnly: true,
        execution: 'not_performed',
        directSource: 'not_enabled',
        query: {
          neoblockIds: [],
          project: 'UMG Envoy Agent / OpenClaw',
          currentState: resolved.ok ? resolved.resolutionStatus : 'RESOLUTION_UNAVAILABLE',
          activeTool: 'umg_envoy_runtime_active_sleeve_ir_matrix_envelope_inspect',
          formalResponseContent: 'n/a',
          projectionFormat: 'both',
          includeMetadata: true,
          includeAudit: true,
          activeSleeve: sleeveId,
          activeStackBoundary,
          includeActiveStackProjection: true
        },
        sourceComposition: null,
        sourceActiveStackProjection: activeStackProjection,
        responseEnvelopeFragment: {
          fragmentStatus: 'RESPONSE_ENVELOPE_FRAGMENT_UNAVAILABLE',
          fragmentKind: 'explicit_molt_map_envelope',
          sections: {
            activeStack: {},
            envoyIntuition: {},
            currentContextMoltMap: {},
            formalResponseContent: {},
            metadata: {},
            audit: {}
          },
          sectionOrder: ['Active Stack', 'Envoy Intuition', 'Current Context — MOLT Map', 'Formal Response Content', 'Metadata'],
          automaticResponseTakeover: false,
          limitations: ['runtime_level_fallback', 'no_explicit_neoblock_ids', 'no_execution']
        },
        envelopeSource: 'runtime_spec',
        envelopeStatus: 'HELD',
        heldReason: 'No resolved NeoBlock ids available for explicit envelope fragment composition.',
        runtimeFallbackPreview: null,
        nlProjection: null,
        audit: {
          execution: 'not_performed',
          triggerEvaluation: 'not_performed',
          libraryMutation: 'not_performed'
        },
        warnings: [],
        errors: []
      };
  const runtimeSpec = compileRuntimeSleeve(version, entrypoint, root, {
    sleeveId,
    compileMode: 'dry_run',
    resolveDepth: 'molt_visible',
    strictness: 'dev'
  });
  const classifier = classifyRuntimeToolRequests(version, entrypoint, root, {
    sleeveId,
    compileIfMissing: true,
    mode: 'classify_only',
    includeTrace: true
  });
  const gatePlan = createRuntimeExecutionGatePlan(version, entrypoint, root, {
    sleeveId,
    compileIfMissing: true,
    classifyIfMissing: true,
    mode: 'plan_only',
    includeTrace: true,
    includeCheckpointPreview: true
  });
  const checkpointCreate = createRuntimeApprovalCheckpoints(version, entrypoint, root, {
    sleeveId,
    mode: 'checkpoint_create',
    includeTrace: true,
    storageMode: 'returned_only'
  });
  const checkpoint = checkpointCreate.checkpoints?.[0] ?? null;
  const checkpointResume = checkpoint
    ? resumeRuntimeApprovalCheckpoint(version, entrypoint, {
        checkpoint,
        resumeToken: checkpoint.resumeToken,
        decision: 'approve',
        mode: 'resume_only',
        includeTrace: true
      })
    : null;
  const approvedExecution = checkpoint && checkpointResume
    ? executeApprovedAllowlistedRuntimeAction(version, entrypoint, root, {
        checkpoint,
        resumeResult: checkpointResume as any,
        mode: 'approved_execute',
        includeTrace: true
      })
    : null;

  const declaredNeoStackRefs = graph.ok ? graph.declaredNeoStackRefs ?? [] : [];
  const declaredNeoBlockRefs = graph.ok ? graph.declaredNeoBlockRefs ?? [] : [];
  const sleeveNativeMoltAvailable = resolved.ok ? resolved.visibleMoltFragments.length > 0 : false;

  const activeNeoStacks = resolved.ok
    ? (resolved.resolvedNeoStacks.length > 0
        ? resolved.resolvedNeoStacks.map((stack: any, index: number) => ({
            neoStackId: stack.ref ?? `declared-stack-${index + 1}`,
            displayName: stack.ref ?? null,
            declaredRef: stack.ref ?? null,
            sourcePath: resolved.resolvedSleeve?.sourcePath ?? null,
            manifestEntry: resolved.resolvedSleeve?.catalogPath ?? null,
            activeStatus: stack.status === 'declared_only' ? 'declared_only' : 'resolved',
            reasonActive: stack.status === 'declared_only' ? 'declared in sleeve graph; bounded resolver does not load neostack payloads in Alpha7' : 'resolved from sleeve graph',
            reasonUnavailable: null,
            declaredNeoBlockRefs,
            resolvedNeoBlockCount: resolved.resolvedNeoBlocks.length,
            blockedNeoBlockCount: resolved.blockedRefs.length,
            warnings: []
          }))
        : [{
            neoStackId: null,
            displayName: null,
            declaredRef: null,
            sourcePath: resolved.resolvedSleeve?.sourcePath ?? null,
            manifestEntry: resolved.resolvedSleeve?.catalogPath ?? null,
            activeStatus: 'unavailable',
            reasonActive: null,
            reasonUnavailable: declaredNeoStackRefs.length === 0 ? 'sleeve_declares_no_neostacks' : 'declared_but_not_loaded',
            declaredNeoBlockRefs,
            resolvedNeoBlockCount: resolved.resolvedNeoBlocks.length,
            blockedNeoBlockCount: resolved.blockedRefs.length,
            warnings: resolved.resolvedSleeve?.limitations ?? []
          }])
    : [{
        neoStackId: null,
        displayName: null,
        declaredRef: null,
        sourcePath: null,
        manifestEntry: null,
        activeStatus: 'unavailable',
        reasonActive: null,
        reasonUnavailable: resolved.errors?.[0]?.code ?? 'sleeve_resolution_unavailable',
        declaredNeoBlockRefs: [],
        resolvedNeoBlockCount: 0,
        blockedNeoBlockCount: 0,
        warnings: resolved.warnings ?? []
      }];

  const activeNeoBlocks = resolved.ok
    ? (resolved.resolvedNeoBlocks.length > 0
        ? resolved.resolvedNeoBlocks.map((block: any) => {
            const summary = block.summary ?? {};
            const contentSummary = typeof summary.contentPreview === 'string' && summary.contentPreview.length > 0
              ? summary.contentPreview
              : summary.contentSummary?.content ?? null;
            const extractedMoltTypes = summary.moltType ? [summary.moltType] : [];
            return {
              neoBlockId: block.neoblockId,
              parentNeoStackId: null,
              declaredRef: block.neoblockId,
              resolvedPath: resolved.resolvedSleeve?.sourcePath ?? null,
              manifestSource: resolved.resolvedSleeve?.catalogPath ?? null,
              loadStatus: block.status,
              visibleMoltFragmentCount: resolved.visibleMoltFragments.filter((fragment) => fragment.neoblockId === block.neoblockId).length,
              extractedMoltTypes,
              contentSummary,
              warnings: summary.limitations ?? []
            };
          })
        : [{
            neoBlockId: null,
            parentNeoStackId: null,
            declaredRef: null,
            resolvedPath: null,
            manifestSource: null,
            loadStatus: 'unavailable',
            visibleMoltFragmentCount: 0,
            extractedMoltTypes: [],
            contentSummary: null,
            warnings: [declaredNeoBlockRefs.length === 0 ? 'sleeve_declares_no_neoblocks' : 'declared_but_not_loaded']
          }])
    : [{
        neoBlockId: null,
        parentNeoStackId: null,
        declaredRef: null,
        resolvedPath: null,
        manifestSource: null,
        loadStatus: 'unavailable',
        visibleMoltFragmentCount: 0,
        extractedMoltTypes: [],
        contentSummary: null,
        warnings: [resolved.errors?.[0]?.code ?? 'sleeve_resolution_unavailable']
      }];

  const activeMoltBlocks = {
    Trigger: [],
    Directive: [],
    Instruction: [],
    Subject: [],
    Primary: [],
    Philosophy: [],
    Blueprint: [],
    Off: [],
    excluded: []
  } as Record<string, any[]>;
  if (resolved.ok) {
    for (const fragment of resolved.visibleMoltFragments) {
      const block = resolved.resolvedNeoBlocks.find((item) => item.neoblockId === fragment.neoblockId);
      const blockSummary = block?.summary;
      const blockSummaryStatus = typeof blockSummary === 'object' && blockSummary !== null && 'status' in blockSummary
        ? (blockSummary as { status?: unknown }).status
        : undefined;
      const item = {
        sourceNeoBlockId: fragment.neoblockId,
        sourceNeoStackId: null,
        moltType: fragment.sourceField,
        contentSummary: fragment.text,
        activeStatus: 'active',
        exclusionReason: null,
        mergeKey: fragment.sourceField,
        stackKey: null,
        trace: [`sourceBlockId=${fragment.sourceBlockId ?? 'none'}`, `sourceField=${fragment.sourceField}`],
        sourceMode: blockSummaryStatus === 'alpha6_sample_target' ? 'runtimeSpec_sample_blocks' : 'sleeve_native'
      };
      if (Array.isArray(activeMoltBlocks[fragment.sourceField])) {
        activeMoltBlocks[fragment.sourceField].push(item);
      } else {
        activeMoltBlocks.excluded.push({ ...item, activeStatus: 'excluded', exclusionReason: 'unsupported_molt_type' });
      }
    }
  }

  const activeNeoStacksSection = {
    count: resolved.ok ? resolved.resolvedNeoStacks.length : 0,
    status: resolved.ok ? (resolved.resolvedNeoStacks.length > 0 ? 'resolved' : (declaredNeoStackRefs.length === 0 ? 'empty_with_reason' : 'declared_but_not_loaded')) : 'missing',
    reason: resolved.ok ? (resolved.resolvedNeoStacks.length > 0 ? null : (declaredNeoStackRefs.length === 0 ? 'sleeve_declares_no_neostacks' : 'declared_but_not_loaded')) : (resolved.errors?.[0]?.code ?? 'sleeve_resolution_unavailable'),
    items: activeNeoStacks
  };
  const activeNeoBlocksSection = {
    count: resolved.ok ? resolved.resolvedNeoBlocks.length : 0,
    status: resolved.ok ? (resolved.resolvedNeoBlocks.length > 0 ? 'resolved' : (declaredNeoBlockRefs.length === 0 ? 'empty_with_reason' : 'declared_but_not_loaded')) : 'missing',
    reason: resolved.ok ? (resolved.resolvedNeoBlocks.length > 0 ? null : (declaredNeoBlockRefs.length === 0 ? 'sleeve_declares_no_neoblocks' : 'declared_but_not_loaded')) : (resolved.errors?.[0]?.code ?? 'sleeve_resolution_unavailable'),
    items: activeNeoBlocks
  };
  const activeMoltBlocksSection = {
    source: sleeveNativeMoltAvailable ? 'sleeve_native' : (runtimeSpec.ok ? 'runtimeSpec_sample_blocks' : 'unavailable'),
    sleeveNativeMoltFragmentsAvailable: sleeveNativeMoltAvailable,
    reason: sleeveNativeMoltAvailable ? null : (resolved.ok ? 'no_real_molt_fragments_resolved; using sample/runtime fallback when available' : (resolved.errors?.[0]?.code ?? 'sleeve_resolution_unavailable')),
    groups: activeMoltBlocks
  };

  const runtimeSpecDetail = runtimeSpec.ok ? {
    ...runtimeSpec,
    sourceMode: sleeveNativeMoltAvailable ? 'sleeve_native_graph' : 'sample_fallback',
    usesSampleBlocks: runtimeSpec.activeBlocks.some((id: string) => id.endsWith('.sample')),
    usesSleeveNativeBlocks: runtimeSpec.activeBlocks.some((id: string) => !id.endsWith('.sample')),
    sleeveNativeBlockCount: runtimeSpec.activeBlocks.filter((id: string) => !id.endsWith('.sample')).length,
    sampleBlockCount: runtimeSpec.activeBlocks.filter((id: string) => id.endsWith('.sample')).length
  } : runtimeSpec;

  const irMatrixProjection = {
    matrixId: `irmatrix_${simpleStableKey([sleeveId, runtimeSpec.runtimeSpecId ?? 'none'])}`,
    nodes: [
      { id: `sleeve:${sleeveId}`, type: 'sleeve', label: sleeveId },
      ...(activeNeoStacksSection.items.map((stack: any, index: number) => ({ id: `stack:${stack.neoStackId ?? `diagnostic-${index}`}`, type: stack.neoStackId ? 'neoStack' : 'diagnostic', label: stack.neoStackId ?? stack.reasonUnavailable ?? `stack-${index}` }))),
      ...(activeNeoBlocksSection.items.map((block: any, index: number) => ({ id: `block:${block.neoBlockId ?? `diagnostic-${index}`}`, type: block.neoBlockId ? 'neoBlock' : 'diagnostic', label: block.neoBlockId ?? block.warnings?.[0] ?? `block-${index}` }))),
      ...(['Trigger','Directive','Instruction','Subject','Primary','Philosophy','Blueprint','Off'].flatMap((field) => (activeMoltBlocksSection.groups[field] ?? []).map((molt: any, index: number) => ({ id: `molt:${field}:${molt.sourceNeoBlockId ?? index}`, type: 'moltBlock', label: `${field}:${molt.sourceNeoBlockId ?? index}` })))),
      ...(runtimeSpec.ok ? [{ id: `runtimeSpec:${runtimeSpec.runtimeSpecId}`, type: 'runtimeSpec', label: runtimeSpec.runtimeSpecId }] : [{ id: `runtimeSpec:missing`, type: 'diagnostic', label: 'runtimeSpec_missing' }]),
      ...(Array.isArray((classifier as any).classifications) ? (classifier as any).classifications.map((c: any) => ({ id: `toolRequest:${c.requestId}`, type: 'toolRequest', label: c.requestedToolName ?? c.requestId })) : []),
      ...(gatePlan.ok ? [{ id: `gatePlan:${gatePlan.gatePlanId}`, type: 'gatePlan', label: gatePlan.gatePlanId }] : []),
      ...(checkpoint ? [{ id: `checkpoint:${checkpoint.checkpointId}`, type: 'checkpoint', label: checkpoint.checkpointId }] : []),
      ...(approvedExecution?.ok ? [{ id: `execution:${approvedExecution.executionResultId}`, type: 'executionResult', label: approvedExecution.executionResultId }] : []),
      { id: `envelope:${sleeveId}`, type: 'envelope', label: 'response-envelope-preview' }
    ],
    edges: [
      ...(activeNeoStacksSection.items.map((stack: any, index: number) => ({ from: `sleeve:${sleeveId}`, to: `stack:${stack.neoStackId ?? `diagnostic-${index}`}`, type: stack.neoStackId ? 'contains' : 'declared_but_unresolved' }))),
      ...(activeNeoBlocksSection.items.map((block: any, index: number) => ({ from: block.parentNeoStackId ? `stack:${block.parentNeoStackId}` : `sleeve:${sleeveId}`, to: `block:${block.neoBlockId ?? `diagnostic-${index}`}`, type: block.neoBlockId ? 'resolves_to' : 'not_loaded' }))),
      ...(['Trigger','Directive','Instruction','Subject','Primary','Philosophy','Blueprint','Off'].flatMap((field) => (activeMoltBlocksSection.groups[field] ?? []).map((molt: any, index: number) => ({ from: `block:${molt.sourceNeoBlockId ?? `diagnostic-${index}`}`, to: `molt:${field}:${molt.sourceNeoBlockId ?? index}`, type: 'extracts_molt' })))),
      ...(runtimeSpec.ok ? [{ from: `sleeve:${sleeveId}`, to: `runtimeSpec:${runtimeSpec.runtimeSpecId}`, type: 'compiles_to' }] : []),
      ...(Array.isArray((classifier as any).classifications) ? (classifier as any).classifications.map((c: any) => ({ from: `runtimeSpec:${(classifier as any).sourceRuntimeSpecId ?? runtimeSpec.runtimeSpecId}`, to: `toolRequest:${c.requestId}`, type: 'classifies' })) : []),
      ...(gatePlan.ok && Array.isArray((gatePlan as any).plannedActions) ? (gatePlan as any).plannedActions.map((p: any) => ({ from: `toolRequest:${p.requestId}`, to: `gatePlan:${gatePlan.gatePlanId}`, type: 'gates' })) : []),
      ...(checkpoint ? [{ from: `gatePlan:${checkpoint.sourceGatePlanId}`, to: `checkpoint:${checkpoint.checkpointId}`, type: 'checkpoints' }] : []),
      ...(approvedExecution?.ok ? [{ from: `checkpoint:${checkpoint?.checkpointId}`, to: `execution:${approvedExecution.executionResultId}`, type: 'executes' }] : []),
      { from: `runtimeSpec:${runtimeSpec.runtimeSpecId ?? 'none'}`, to: `envelope:${sleeveId}`, type: 'previews' }
    ],
    activeRoute: [
      `sleeve:${sleeveId}`,
      ...(runtimeSpec.ok ? [`runtimeSpec:${runtimeSpec.runtimeSpecId}`] : []),
      ...(gatePlan.ok ? [`gatePlan:${gatePlan.gatePlanId}`] : []),
      ...(checkpoint ? [`checkpoint:${checkpoint.checkpointId}`] : []),
      ...(approvedExecution?.ok ? [`execution:${approvedExecution.executionResultId}`] : [])
    ],
    blockedRoute: approvedExecution && !approvedExecution.ok ? [`execution_blocked:${approvedExecution.executionResultId}`] : [],
    offRoute: [],
    hierarchyEdges: ['contains', 'resolves_to', 'declared_but_unresolved', 'not_loaded'],
    siblingEdges: [],
    toolRequestEdges: ['classifies', 'gates'],
    checkpointEdges: ['checkpoints', 'resumes'],
    executionEdges: ['executes', 'previews', 'extracts_molt'],
    symbolsLegend: {
      sleeve: 'runtime sleeve root',
      neoStack: 'stack layer',
      neoBlock: 'resolved block',
      moltBlock: 'visible MOLT fragment',
      diagnostic: 'missing/unresolved diagnostic node',
      runtimeSpec: 'compiled RuntimeSpecV0',
      toolRequest: 'declared/synthetic request',
      gatePlan: 'gate planning node',
      checkpoint: 'approval checkpoint node',
      executionResult: 'approved allowlisted execution result',
      envelope: 'response envelope preview'
    }
  };

  return {
    ok: true,
    outputContract: { contractId: 'umg.runtime.active_sleeve_ir_matrix_envelope.inspect.v1' as const, contractStatus: 'NORMALIZED' as const },
    inspectorRunId,
    inspectorStatus: runtimeSpec.ok ? 'INSPECTOR_READY' as const : 'INSPECTOR_PARTIAL' as const,
    sourceSleeveId: sleeveId,
    activeSleeve: {
      sleeveId,
      sleeveName: resolved.ok ? (resolved.resolvedSleeve?.title ?? sleeveId) : sleeveId,
      sleeveSource: 'runtime_selection',
      sleeveStatus: resolved.ok ? (resolved.resolutionStatus === 'RESOLVED' ? 'resolved' : 'held') : 'held',
      sourceCatalog: 'preferred',
      resolvedFrom: 'selectRuntimeSleeve+resolveRuntimeSleeveGraph',
      selectedExplicitly: !!input.sleeveId,
      runtimeEligible: runtimeSpec.ok,
      warningList: [...(selected.warnings ?? []), ...(resolved.warnings ?? [])],
      graphStatus: resolved.ok ? resolved.resolvedSleeve?.graphStatus ?? null : null,
      sourcePath: resolved.ok ? resolved.resolvedSleeve?.sourcePath ?? null : null,
      catalogPath: resolved.ok ? resolved.resolvedSleeve?.catalogPath ?? null : null
    },
    activeNeoStacks: input.includeNeoStacks === false ? { count: 0, status: 'missing', reason: 'disabled_by_query', items: [] } : activeNeoStacksSection,
    activeNeoBlocks: input.includeNeoBlocks === false ? { count: 0, status: 'missing', reason: 'disabled_by_query', items: [] } : activeNeoBlocksSection,
    activeMoltBlocks: input.includeMoltBlocks === false ? { source: 'disabled_by_query', sleeveNativeMoltFragmentsAvailable: false, reason: 'disabled_by_query', groups: {} } : activeMoltBlocksSection,
    runtimeSpec: input.includeRuntimeSpec === false ? null : runtimeSpecDetail,
    activeStackProjection,
    moltMapProjection: runtimeSpec.ok ? runtimeSpec.moltMap : {},
    irMatrixProjection: input.includeIrMatrix === false ? null : irMatrixProjection,
    responseEnvelopePreview: input.includeEnvelope === false ? null : {
      envelopeSource: (responseEnvelopePreview as any).envelopeSource ?? (resolvedNeoBlockIds.length > 0 ? 'neoblock_fragment' : (runtimeSpec.ok ? 'runtime_spec' : 'partial')),
      envelopeStatus: (responseEnvelopePreview as any).envelopeStatus ?? (((responseEnvelopePreview as any).ok === false || (responseEnvelopePreview as any).responseEnvelopeFragment?.fragmentStatus === 'RESPONSE_ENVELOPE_FRAGMENT_DENIED') ? 'PARTIAL' : 'READY'),
      heldReason: (responseEnvelopePreview as any).heldReason ?? (((responseEnvelopePreview as any).errors?.[0]?.message) ?? null),
      activeStack: activeStackProjection,
      currentContextMoltMap: runtimeSpec.ok ? runtimeSpec.moltMap : {},
      formalResponseContentPreview: responseEnvelopePreview,
      runtimeFallbackPreview: (responseEnvelopePreview as any).runtimeFallbackPreview ?? {
        runtimeSpecId: runtimeSpec.runtimeSpecId ?? null,
        promptParts: runtimeSpec.ok ? runtimeSpec.promptParts : [],
        strategy: runtimeSpec.ok ? runtimeSpec.strategy : null,
        constraints: runtimeSpec.ok ? runtimeSpec.constraints : null
      },
      metadataTagsHelp: {
        runtimeSpecId: runtimeSpec.runtimeSpecId ?? null,
        executionState: 'not_performed'
      },
      executionState: 'not_performed'
    },
    toolRequestClassification: classifier,
    executionGatePlan: input.includeExecutionGateState === false ? null : gatePlan,
    approvalCheckpointState: input.includeExecutionGateState === false ? null : checkpointCreate,
    approvedExecutionState: input.includeExecutionGateState === false ? null : approvedExecution,
    executionGateState: input.includeExecutionGateState === false ? null : {
      toolRequestsCount: Array.isArray((classifier as any).classifications) ? (classifier as any).classifications.length : 0,
      classifications: (classifier as any).classifications ?? [],
      blockedCount: (classifier as any).blockedCount ?? 0,
      approvalRequiredCount: (classifier as any).approvalRequiredCount ?? 0,
      readOnlyCount: (classifier as any).readOnlyCount ?? 0,
      checkpointStatus: checkpointCreate.checkpointCreateStatus ?? null,
      checkpointCount: checkpointCreate.checkpointCount ?? 0,
      executionResultStatus: approvedExecution?.executionStatus ?? 'not_performed',
      blockedReasons: Array.isArray((classifier as any).classifications) ? (classifier as any).classifications.filter((c: any) => c.classification === 'blocked_policy').map((c: any) => c.decisionReason) : [],
      allowedReadOnlyActions: Array.isArray((classifier as any).classifications) ? (classifier as any).classifications.filter((c: any) => c.classification === 'available_read_only').map((c: any) => c.requestedToolName ?? c.requestId) : []
    },
    inspectorCompleteness: {
      activeSleeve: resolved.ok ? 'full' : 'partial',
      neoStacks: resolved.ok ? (resolved.resolvedNeoStacks.length > 0 ? 'full' : 'empty_with_reason') : 'missing',
      neoBlocks: resolved.ok ? (resolved.resolvedNeoBlocks.length > 0 ? 'full' : 'empty_with_reason') : 'missing',
      moltBlocks: sleeveNativeMoltAvailable ? 'full' : (runtimeSpec.ok ? 'sample_fallback' : 'missing'),
      runtimeSpec: runtimeSpec.ok ? 'full' : 'partial',
      irMatrix: input.includeIrMatrix === false ? 'missing' : 'full',
      envelope: input.includeEnvelope === false ? 'missing' : (((responseEnvelopePreview as any).envelopeStatus ?? 'PARTIAL') === 'READY' ? 'full' : (((responseEnvelopePreview as any).envelopeStatus ?? 'PARTIAL') === 'HELD' ? 'held' : 'partial')),
      executionGateState: input.includeExecutionGateState === false ? 'missing' : 'full'
    },
    overallCompleteness: sleeveNativeMoltAvailable ? 'rich_sleeve_native' : (resolved.ok ? 'partial_sleeve_native' : (runtimeSpec.ok ? 'runtime_scaffold_only' : 'failed')),
    executionStatus: 'not_performed' as const,
    warnings: [...(selected.warnings ?? []), ...(resolved.warnings ?? []), ...(runtimeSpec.warnings ?? [])],
    errors: runtimeSpec.errors ?? [],
    audit: {
      execution: 'not_performed' as const,
      toolExecution: 'not_performed' as const,
      triggerEvaluation: 'not_performed' as const,
      libraryMutation: 'not_performed' as const,
      packageMutation: 'not_performed' as const,
      filesystemMutation: 'not_performed' as const,
      restart: 'not_performed' as const,
      publish: 'not_performed' as const
    },
    trace: [
      `sleeveId=${sleeveId}`,
      `runtimeSpecId=${runtimeSpec.runtimeSpecId ?? 'none'}`,
      `classifier=${classifier.ok ? 'available' : 'held'}`,
      `gatePlan=${gatePlan.ok ? 'available' : 'held'}`,
      `checkpointState=${checkpointCreate.ok ? 'available' : 'held'}`,
      `approvedExecutionState=${approvedExecution ? 'available' : 'unavailable'}`,
      'execution=not_performed'
    ]
  };
}

function runtimeSleeveSessionId() {
  return 'umg.runtime.session.main';
}

function buildRuntimeSleeveSessionState(overrides: Partial<RuntimeSleeveSessionStateV0> = {}): RuntimeSleeveSessionStateV0 {
  return {
    outputContract: { contractId: 'umg.runtime.sleeve_session.v1', contractStatus: 'NORMALIZED' },
    sessionId: runtimeSleeveSessionId(),
    sessionStatus: 'NO_ACTIVE_SLEEVE',
    selectedSleeveId: null,
    activeSleeveId: null,
    selectionSource: 'unknown',
    selectionReason: null,
    runtimeEligible: false,
    selectionTimestamp: null,
    expiresAt: null,
    persistenceMode: 'memory_only',
    automaticResponseTakeover: false,
    directSourceEnabled: false,
    lastInspectionSummary: null,
    lastRuntimePreviewSummary: null,
    warnings: [],
    errors: [],
    audit: {
      execution: 'not_performed',
      toolExecution: 'not_performed',
      libraryMutation: 'not_performed',
      packageMutation: 'not_performed',
      filesystemMutation: 'not_performed',
      restart: 'not_performed',
      publish: 'not_performed',
      automaticResponseTakeover: false,
      directSource: 'disabled'
    },
    trace: [],
    ...overrides
  };
}

function getRuntimeSleeveSessionState(): RuntimeSleeveSessionStateV0 {
  return runtimeSleeveSessionStore.get(runtimeSleeveSessionId()) ?? buildRuntimeSleeveSessionState();
}

function setRuntimeSleeveSessionState(state: RuntimeSleeveSessionStateV0) {
  runtimeSleeveSessionStore.set(runtimeSleeveSessionId(), state);
  return state;
}

export function getCurrentRuntimeSleeveSession(
  version: string,
  entrypoint = 'dist/plugin-entry.js',
  root = DEFAULT_LIBRARY_ROOT,
  input: {
    includeInspection?: boolean;
    includeRuntimePreview?: boolean;
    includeTrace?: boolean;
  } = {}
) {
  const state = getRuntimeSleeveSessionState();
  if (!state.activeSleeveId) {
    return buildRuntimeSleeveSessionState({
      ...state,
      sessionStatus: 'NO_ACTIVE_SLEEVE',
      trace: input.includeTrace === false ? [] : ['sessionStatus=NO_ACTIVE_SLEEVE', 'execution=not_performed']
    });
  }
  const inspection = input.includeInspection === false ? null : inspectRuntimeActiveSleeveIrMatrixEnvelope(version, entrypoint, root, {
    sleeveId: state.activeSleeveId,
    includeNeoStacks: true,
    includeNeoBlocks: true,
    includeMoltBlocks: true,
    includeRuntimeSpec: true,
    includeIrMatrix: true,
    includeEnvelope: true,
    includeExecutionGateState: true,
    mode: 'inspect_only'
  });
  const runtimePreview = input.includeRuntimePreview === false ? null : previewRuntimeSleeve(version, entrypoint, root, {
    sleeveId: state.activeSleeveId,
    previewFormat: 'summary',
    includeActiveStack: true,
    includeMoltMap: true,
    includeEnvelope: true,
    includeToolRequests: true
  });
  return buildRuntimeSleeveSessionState({
    ...state,
    sessionStatus: state.runtimeEligible ? 'SLEEVE_ACTIVE' : 'SLEEVE_HELD',
    lastInspectionSummary: inspection ? {
      sleeveId: inspection.sourceSleeveId,
      overallCompleteness: inspection.overallCompleteness,
      neoBlockCount: inspection.activeNeoBlocks?.count ?? 0,
      neoStackCount: inspection.activeNeoStacks?.count ?? 0,
      envelopeStatus: inspection.responseEnvelopePreview?.envelopeStatus ?? null
    } : state.lastInspectionSummary,
    lastRuntimePreviewSummary: runtimePreview ? {
      sleeveId: runtimePreview.runtimeSpec?.sleeveId ?? state.activeSleeveId,
      runtimeSpecId: runtimePreview.runtimeSpec?.runtimeSpecId ?? null,
      previewStatus: runtimePreview.previewStatus,
      activeBlockCount: runtimePreview.runtimeSpec?.activeBlocks?.length ?? 0
    } : state.lastRuntimePreviewSummary,
    trace: input.includeTrace === false ? [] : [`activeSleeveId=${state.activeSleeveId}`, `runtimeEligible=${state.runtimeEligible}`, 'execution=not_performed']
  });
}

export function selectRuntimeSleeveSession(
  version: string,
  entrypoint = 'dist/plugin-entry.js',
  root = DEFAULT_LIBRARY_ROOT,
  input: {
    sleeveId: string;
    selectionReason?: string;
    persistenceMode?: RuntimeSleeveSessionPersistenceMode;
    includeInspection?: boolean;
    includeRuntimePreview?: boolean;
    includeTrace?: boolean;
  }
) {
  const persistenceMode = input.persistenceMode ?? 'memory_only';
  if (persistenceMode === 'disabled') {
    return buildRuntimeSleeveSessionState({
      sessionStatus: 'SESSION_ERROR',
      selectionSource: 'explicit_agent_request',
      selectionReason: input.selectionReason ?? null,
      persistenceMode,
      warnings: [],
      errors: [{ code: 'SESSION_PERSISTENCE_DISABLED', message: 'Session selection is disabled for this request.' }],
      trace: input.includeTrace === false ? [] : ['selection=blocked', 'persistenceMode=disabled', 'execution=not_performed']
    });
  }
  const selected = selectRuntimeSleeve(version, entrypoint, root, { sleeveId: input.sleeveId, selectionMode: 'explicit' });
  const runtimePreview = input.includeRuntimePreview === false ? null : previewRuntimeSleeve(version, entrypoint, root, {
    sleeveId: input.sleeveId,
    previewFormat: 'summary',
    includeActiveStack: true,
    includeMoltMap: true,
    includeEnvelope: true,
    includeToolRequests: true
  });
  const inspection = input.includeInspection === false ? null : inspectRuntimeActiveSleeveIrMatrixEnvelope(version, entrypoint, root, {
    sleeveId: input.sleeveId,
    includeNeoStacks: true,
    includeNeoBlocks: true,
    includeMoltBlocks: true,
    includeRuntimeSpec: true,
    includeIrMatrix: true,
    includeEnvelope: true,
    includeExecutionGateState: true,
    mode: 'inspect_only'
  });
  const runtimeEligible = selected.ok && runtimePreview?.ok === true;
  const state = buildRuntimeSleeveSessionState({
    sessionStatus: runtimeEligible ? 'SLEEVE_ACTIVE' : 'SLEEVE_HELD',
    selectedSleeveId: input.sleeveId,
    activeSleeveId: input.sleeveId,
    selectionSource: 'explicit_agent_request',
    selectionReason: input.selectionReason ?? null,
    runtimeEligible,
    selectionTimestamp: new Date().toISOString(),
    expiresAt: null,
    persistenceMode,
    lastInspectionSummary: inspection ? {
      sleeveId: inspection.sourceSleeveId,
      overallCompleteness: inspection.overallCompleteness,
      neoBlockCount: inspection.activeNeoBlocks?.count ?? 0,
      neoStackCount: inspection.activeNeoStacks?.count ?? 0,
      envelopeStatus: inspection.responseEnvelopePreview?.envelopeStatus ?? null
    } : null,
    lastRuntimePreviewSummary: runtimePreview ? {
      sleeveId: runtimePreview.runtimeSpec?.sleeveId ?? input.sleeveId,
      runtimeSpecId: runtimePreview.runtimeSpec?.runtimeSpecId ?? null,
      previewStatus: runtimePreview.previewStatus,
      activeBlockCount: runtimePreview.runtimeSpec?.activeBlocks?.length ?? 0
    } : null,
    warnings: [...(selected.warnings ?? []), ...(runtimePreview?.warnings ?? []), ...(inspection?.warnings ?? [])],
    errors: [...(selected.errors ?? []), ...(runtimePreview?.errors ?? []), ...(inspection?.errors ?? [])],
    trace: input.includeTrace === false ? [] : [`selectedSleeveId=${input.sleeveId}`, `runtimeEligible=${runtimeEligible}`, `persistenceMode=${persistenceMode}`, 'execution=not_performed']
  });
  return setRuntimeSleeveSessionState(state);
}

export function clearRuntimeSleeveSession(input: {
  clearReason?: string;
  includePreviousState?: boolean;
  includeTrace?: boolean;
} = {}) {
  const previous = getRuntimeSleeveSessionState();
  runtimeSleeveSessionStore.delete(runtimeSleeveSessionId());
  return buildRuntimeSleeveSessionState({
    sessionStatus: 'SLEEVE_CLEARED',
    selectedSleeveId: null,
    activeSleeveId: null,
    selectionSource: previous.selectionSource ?? 'unknown',
    selectionReason: input.clearReason ?? null,
    runtimeEligible: false,
    selectionTimestamp: new Date().toISOString(),
    expiresAt: null,
    persistenceMode: previous.persistenceMode ?? 'memory_only',
    previousSleeveId: input.includePreviousState === false ? null : previous.activeSleeveId,
    lastInspectionSummary: input.includePreviousState === false ? null : previous.lastInspectionSummary,
    lastRuntimePreviewSummary: input.includePreviousState === false ? null : previous.lastRuntimePreviewSummary,
    trace: input.includeTrace === false ? [] : [`previousSleeveId=${previous.activeSleeveId ?? 'none'}`, 'sessionStatus=SLEEVE_CLEARED', 'execution=not_performed']
  });
}

export function inspectRuntimeSleeveSession(
  version: string,
  entrypoint = 'dist/plugin-entry.js',
  root = DEFAULT_LIBRARY_ROOT,
  input: {
    includeNeoStacks?: boolean;
    includeNeoBlocks?: boolean;
    includeMoltBlocks?: boolean;
    includeRuntimeSpec?: boolean;
    includeIrMatrix?: boolean;
    includeEnvelope?: boolean;
    includeExecutionGateState?: boolean;
    includeTrace?: boolean;
  } = {}
) {
  const state = getRuntimeSleeveSessionState();
  if (!state.activeSleeveId) {
    return buildRuntimeSleeveSessionState({
      ...state,
      sessionStatus: 'NO_ACTIVE_SLEEVE',
      trace: input.includeTrace === false ? [] : ['sessionStatus=NO_ACTIVE_SLEEVE', 'execution=not_performed']
    });
  }
  const inspection = inspectRuntimeActiveSleeveIrMatrixEnvelope(version, entrypoint, root, {
    sleeveId: state.activeSleeveId,
    includeNeoStacks: input.includeNeoStacks !== false,
    includeNeoBlocks: input.includeNeoBlocks !== false,
    includeMoltBlocks: input.includeMoltBlocks !== false,
    includeRuntimeSpec: input.includeRuntimeSpec !== false,
    includeIrMatrix: input.includeIrMatrix !== false,
    includeEnvelope: input.includeEnvelope !== false,
    includeExecutionGateState: input.includeExecutionGateState !== false,
    mode: 'inspect_only'
  });
  return buildRuntimeSleeveSessionState({
    ...state,
    sessionStatus: state.runtimeEligible ? 'SLEEVE_ACTIVE' : 'SLEEVE_HELD',
    lastInspectionSummary: inspection,
    trace: input.includeTrace === false ? [] : [`activeSleeveId=${state.activeSleeveId}`, 'inspection=performed', 'execution=not_performed']
  });
}

export function inspectRuntimeSleeveGraphRichness(
  version: string,
  entrypoint = 'dist/plugin-entry.js',
  root = DEFAULT_LIBRARY_ROOT,
  input: {
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
  } = {}
) {
  const useActiveSessionSleeve = input.useActiveSessionSleeve !== false;
  const sessionState = getRuntimeSleeveSessionState();
  const sleeveId = input.sleeveId ?? (useActiveSessionSleeve ? sessionState.activeSleeveId ?? undefined : undefined);
  const graphRunId = `graph_${simpleStableKey([sleeveId ?? 'no_active_sleeve', 'richness'])}`;
  if (!sleeveId) {
    return {
      ok: true,
      outputContract: { contractId: 'umg.runtime.sleeve_graph.richness.v1' as const, contractStatus: 'NORMALIZED' as const },
      graphStatus: 'GRAPH_BLOCKED' as const,
      sourceSleeveId: null,
      activeSessionUsed: useActiveSessionSleeve,
      sleeveSummary: null,
      neoStackSummary: null,
      neoBlockSummary: null,
      moltFragmentSummary: null,
      toolRequestSummary: null,
      runtimeSpecSummary: null,
      irMatrixSummary: null,
      envelopeSummary: null,
      graphCompleteness: 'blocked' as const,
      diagnostics: { blockedReason: 'no_active_sleeve', graphRunId },
      warnings: [],
      errors: [{ code: 'NO_ACTIVE_SLEEVE', message: 'No active sleeve session exists and no sleeveId was provided.' }],
      audit: {
        execution: 'not_performed' as const,
        toolExecution: 'not_performed' as const,
        libraryMutation: 'not_performed' as const,
        packageMutation: 'not_performed' as const,
        filesystemMutation: 'not_performed' as const,
        restart: 'not_performed' as const,
        publish: 'not_performed' as const,
        automaticResponseTakeover: false,
        directSource: 'disabled' as const
      },
      trace: input.includeTrace === false ? [] : ['graphStatus=GRAPH_BLOCKED', 'blockedReason=no_active_sleeve', 'execution=not_performed']
    };
  }
  const inspection = inspectRuntimeActiveSleeveIrMatrixEnvelope(version, entrypoint, root, {
    sleeveId,
    includeNeoStacks: input.includeNeoStacks !== false,
    includeNeoBlocks: input.includeNeoBlocks !== false,
    includeMoltBlocks: input.includeMoltFragments !== false,
    includeRuntimeSpec: input.includeRuntimeSpec !== false,
    includeIrMatrix: input.includeIrMatrix !== false,
    includeEnvelope: input.includeEnvelope !== false,
    includeExecutionGateState: true,
    mode: 'inspect_only'
  });
  const resolvedPackageRoot = getRuntimePackageRootFromModuleUrl(import.meta.url) ?? path.resolve(root);
  const nativeFixtureRead = readNativeSleeveFixtureFromPackage({
    sleeveId,
    explicitPackageRoot: path.resolve(root),
    moduleMetaUrl: import.meta.url,
  });
  const nativeFixtureCandidate = nativeFixtureRead.fixture;
  const nativeProjection = nativeFixtureCandidate ? projectNativeSleeveGraph(nativeFixtureCandidate) : null;
  const drilldown = getBlockLibrarySleeveGraphDrilldown(version, entrypoint, root, { sleeveId, projectionFormat: 'summary' });
  const runtimePreview = previewRuntimeSleeve(version, entrypoint, root, {
    sleeveId,
    previewFormat: 'summary',
    includeActiveStack: true,
    includeMoltMap: true,
    includeEnvelope: true,
    includeToolRequests: true
  });
  const classifier = classifyRuntimeToolRequests(version, entrypoint, root, {
    sleeveId,
    compileIfMissing: true,
    mode: 'classify_only',
    includeTrace: true
  });
  const nativeGraph = nativeProjection?.nativeGraphAvailable ? nativeProjection.nativeGraph : null;
  const runtimeCodeIdentity = {
    ...NATIVE_GRAPH_RUNTIME_IDENTITY,
    moduleUrl: import.meta.url,
    processCwd: process.cwd(),
    resolvedPackageRoot,
    fixtureCandidateRoots: nativeFixtureRead.diagnostics.candidateRootsChecked,
  };
  const useNativeProjection = Boolean(nativeGraph && nativeProjection?.nativeGraphAvailable && nativeProjection?.sourceMode === 'sleeve_native' && nativeProjection?.routePurity === 'clean_native');
  const nativeSummaries = useNativeProjection
    ? buildNativeGraphRichnessSummaries(nativeProjection, graphRunId, sessionState, sleeveId, nativeFixtureRead.diagnostics, runtimeCodeIdentity)
    : null;
  const neoStackItems = useNativeProjection
    ? (nativeGraph?.neoStacks ?? []).map((stack: any) => ({
        neoStackId: stack.stackId,
        displayName: stack.label,
        declaredRef: stack.stackId,
        sourcePath: stack.provenance?.sourcePath ?? null,
        manifestEntry: stack.provenance?.sourceId ?? null,
        activeStatus: 'resolved',
        reasonActive: 'declared in native sleeve graph fixture',
        reasonUnavailable: null,
        declaredNeoBlockRefs: stack.containedNeoBlockIds ?? [],
        resolvedNeoBlockCount: Array.isArray(stack.containedNeoBlockIds) ? stack.containedNeoBlockIds.length : 0,
        blockedNeoBlockCount: 0,
        warnings: [],
        provenance: stack.provenance ?? null
      }))
    : (inspection.activeNeoStacks?.items ?? []);
  const neoBlockItems = useNativeProjection
    ? (nativeGraph?.neoBlocks ?? []).map((block: any) => ({
        neoBlockId: block.neoBlockId,
        parentNeoStackId: Array.isArray(block.parentStackIds) ? (block.parentStackIds[0] ?? null) : null,
        parentNeoStackIds: block.parentStackIds ?? [],
        declaredRef: block.neoBlockId,
        resolvedPath: block.provenance?.sourcePath ?? null,
        manifestSource: block.provenance?.sourceId ?? null,
        loadStatus: 'shallow_loaded',
        visibleMoltFragmentCount: (nativeGraph?.moltFragments ?? []).filter((fragment: any) => fragment.sourceNeoBlockId === block.neoBlockId).length,
        extractedMoltTypes: (nativeGraph?.moltFragments ?? []).filter((fragment: any) => fragment.sourceNeoBlockId === block.neoBlockId).map((fragment: any) => fragment.moltType),
        contentSummary: block.role ?? null,
        warnings: [],
        provenance: block.provenance ?? null
      }))
    : (inspection.activeNeoBlocks?.items ?? []);
  const moltGroups = useNativeProjection
    ? {
        Trigger: (nativeGraph?.moltFragments ?? []).filter((fragment: any) => fragment.moltType === 'Trigger').map((fragment: any) => ({ sourceNeoBlockId: fragment.sourceNeoBlockId, sourceNeoStackId: null, moltType: fragment.moltType, contentSummary: fragment.content, activeStatus: 'active', exclusionReason: null, mergeKey: fragment.fragmentId, stackKey: null, trace: [`sourceNeoBlockId=${fragment.sourceNeoBlockId}`], sourceMode: 'sleeve_native', provenance: fragment.provenance ?? null })),
        Directive: (nativeGraph?.moltFragments ?? []).filter((fragment: any) => fragment.moltType === 'Directive').map((fragment: any) => ({ sourceNeoBlockId: fragment.sourceNeoBlockId, sourceNeoStackId: null, moltType: fragment.moltType, contentSummary: fragment.content, activeStatus: 'active', exclusionReason: null, mergeKey: fragment.fragmentId, stackKey: null, trace: [`sourceNeoBlockId=${fragment.sourceNeoBlockId}`], sourceMode: 'sleeve_native', provenance: fragment.provenance ?? null })),
        Instruction: (nativeGraph?.moltFragments ?? []).filter((fragment: any) => fragment.moltType === 'Instruction').map((fragment: any) => ({ sourceNeoBlockId: fragment.sourceNeoBlockId, sourceNeoStackId: null, moltType: fragment.moltType, contentSummary: fragment.content, activeStatus: 'active', exclusionReason: null, mergeKey: fragment.fragmentId, stackKey: null, trace: [`sourceNeoBlockId=${fragment.sourceNeoBlockId}`], sourceMode: 'sleeve_native', provenance: fragment.provenance ?? null })),
        Subject: (nativeGraph?.moltFragments ?? []).filter((fragment: any) => fragment.moltType === 'Subject').map((fragment: any) => ({ sourceNeoBlockId: fragment.sourceNeoBlockId, sourceNeoStackId: null, moltType: fragment.moltType, contentSummary: fragment.content, activeStatus: 'active', exclusionReason: null, mergeKey: fragment.fragmentId, stackKey: null, trace: [`sourceNeoBlockId=${fragment.sourceNeoBlockId}`], sourceMode: 'sleeve_native', provenance: fragment.provenance ?? null })),
        Primary: (nativeGraph?.moltFragments ?? []).filter((fragment: any) => fragment.moltType === 'Primary').map((fragment: any) => ({ sourceNeoBlockId: fragment.sourceNeoBlockId, sourceNeoStackId: null, moltType: fragment.moltType, contentSummary: fragment.content, activeStatus: 'active', exclusionReason: null, mergeKey: fragment.fragmentId, stackKey: null, trace: [`sourceNeoBlockId=${fragment.sourceNeoBlockId}`], sourceMode: 'sleeve_native', provenance: fragment.provenance ?? null })),
        Philosophy: (nativeGraph?.moltFragments ?? []).filter((fragment: any) => fragment.moltType === 'Philosophy').map((fragment: any) => ({ sourceNeoBlockId: fragment.sourceNeoBlockId, sourceNeoStackId: null, moltType: fragment.moltType, contentSummary: fragment.content, activeStatus: 'active', exclusionReason: null, mergeKey: fragment.fragmentId, stackKey: null, trace: [`sourceNeoBlockId=${fragment.sourceNeoBlockId}`], sourceMode: 'sleeve_native', provenance: fragment.provenance ?? null })),
        Blueprint: (nativeGraph?.moltFragments ?? []).filter((fragment: any) => fragment.moltType === 'Blueprint').map((fragment: any) => ({ sourceNeoBlockId: fragment.sourceNeoBlockId, sourceNeoStackId: null, moltType: fragment.moltType, contentSummary: fragment.content, activeStatus: 'active', exclusionReason: null, mergeKey: fragment.fragmentId, stackKey: null, trace: [`sourceNeoBlockId=${fragment.sourceNeoBlockId}`], sourceMode: 'sleeve_native', provenance: fragment.provenance ?? null })),
        Off: [],
        excluded: []
      }
    : (inspection.activeMoltBlocks?.groups ?? {});
  const moltVisibleCount = useNativeProjection
    ? (nativeGraph?.moltFragments?.length ?? 0)
    : Object.values(moltGroups).reduce((sum, group) => sum + (Array.isArray(group) ? group.length : 0), 0);
  const toolRequests = useNativeProjection
    ? (nativeGraph?.toolRequests ?? []).map((request: any) => ({
        requestId: request.requestId,
        requestedToolName: request.requestedToolName,
        requestedAction: request.requestedAction,
        classification: 'available_read_only',
        decisionReason: request.purpose,
        requestSummary: request.policyClass,
        provenance: request.provenance ?? null
      }))
    : (Array.isArray((classifier as any).classifications) ? (classifier as any).classifications : []);
  const runtimeSpecValue = inspection.runtimeSpec as Record<string, unknown> | null | undefined;
  const runtimePreviewSpecValue = runtimePreview.runtimeSpec as Record<string, unknown> | null | undefined;
  const runtimeSpecSummary = input.includeRuntimeSpec === false ? null : (useNativeProjection
    ? {
        runtimeSpecId: nativeGraph?.runtimeRoutes?.[0]?.routeId ?? inspection.runtimeSpec?.runtimeSpecId ?? null,
        sourceMode: nativeProjection?.sourceMode ?? 'sleeve_native',
        activeBlockCount: nativeGraph?.runtimeRoutes?.[0]?.sourceNeoBlockIds?.length ?? nativeGraph?.neoBlocks?.length ?? 0,
        usesSleeveNativeBlocks: true,
        usesSampleBlocks: false,
        previewStatus: 'RUNTIME_PREVIEW_READY',
        provenance: nativeGraph?.runtimeRoutes?.[0]?.provenance ?? null
      }
    : {
        runtimeSpecId: inspection.runtimeSpec?.runtimeSpecId ?? runtimePreview.runtimeSpec?.runtimeSpecId ?? null,
        sourceMode: typeof runtimeSpecValue?.sourceMode === 'string' ? runtimeSpecValue.sourceMode : null,
        activeBlockCount: inspection.runtimeSpec?.activeBlocks?.length ?? runtimePreview.runtimeSpec?.activeBlocks?.length ?? 0,
        usesSleeveNativeBlocks: typeof runtimeSpecValue?.usesSleeveNativeBlocks === 'boolean' ? runtimeSpecValue.usesSleeveNativeBlocks : null,
        usesSampleBlocks: typeof runtimeSpecValue?.usesSampleBlocks === 'boolean' ? runtimeSpecValue.usesSampleBlocks : null,
        previewStatus: typeof runtimePreviewSpecValue?.previewStatus === 'string' ? runtimePreviewSpecValue.previewStatus : runtimePreview.previewStatus ?? null
      });
  const irMatrixSummary = input.includeIrMatrix === false ? null : (useNativeProjection
    ? {
        matrixId: nativeGraph?.irRoutes?.[0]?.routeId ?? null,
        nodeCount: nativeGraph?.irRoutes?.[0]?.nodes?.length ?? 0,
        edgeCount: nativeGraph?.irRoutes?.[0]?.edges?.length ?? 0,
        activeRoute: nativeGraph?.irRoutes?.[0]?.nodes?.map((node: any) => node.nodeId) ?? [],
        blockedRoute: [],
        provenance: nativeGraph?.irRoutes?.[0]?.provenance ?? null
      }
    : {
        matrixId: inspection.irMatrixProjection?.matrixId ?? null,
        nodeCount: inspection.irMatrixProjection?.nodes?.length ?? 0,
        edgeCount: inspection.irMatrixProjection?.edges?.length ?? 0,
        activeRoute: inspection.irMatrixProjection?.activeRoute ?? [],
        blockedRoute: inspection.irMatrixProjection?.blockedRoute ?? []
      });
  const envelopeSummary = input.includeEnvelope === false ? null : (useNativeProjection
    ? {
        envelopeStatus: 'READY',
        envelopeSource: nativeGraph?.envelopeSources?.[0]?.envelopeSource ?? 'sleeve_native_derived',
        heldReason: null,
        provenance: nativeGraph?.envelopeSources?.[0]?.provenance ?? null
      }
    : {
        envelopeStatus: inspection.responseEnvelopePreview?.envelopeStatus ?? null,
        envelopeSource: inspection.responseEnvelopePreview?.envelopeSource ?? null,
        heldReason: inspection.responseEnvelopePreview?.heldReason ?? null
      });
  const neoStackReason = useNativeProjection
    ? (neoStackItems.length === 0 ? 'sleeve_declares_no_neostacks' : null)
    : (inspection.activeNeoStacks?.reason ?? (neoStackItems.length === 0 ? 'sleeve_declares_no_neostacks' : null));
  const previewUsesSampleBlocks = useNativeProjection ? false : (runtimeSpecSummary?.usesSampleBlocks === true);
  const previewUsesNativeBlocks = useNativeProjection ? true : (runtimeSpecSummary?.usesSleeveNativeBlocks === true);
  const envelopeSource = envelopeSummary?.envelopeSource ?? null;
  const legacyPreviewResidueDetected = useNativeProjection
    ? false
    : (previewUsesSampleBlocks || envelopeSource === 'sample_preview' || envelopeSource === 'legacy_preview');
  const sourceMode = useNativeProjection
    ? 'sleeve_native'
    : (previewUsesNativeBlocks
      ? (previewUsesSampleBlocks ? 'sleeve_native_with_sample_fallback' : 'sleeve_native')
      : (previewUsesSampleBlocks ? 'sample_only' : (legacyPreviewResidueDetected ? 'legacy_preview' : 'unavailable')));
  const sourceProvenance = useNativeProjection
    ? {
        nativeGraphAvailable: true,
        sampleFallbackUsed: false,
        legacyPreviewResidueDetected: false,
        legacyPreviewResiduePaths: [],
        sourceMode,
        routePurity: 'clean_native'
      }
    : {
        nativeGraphAvailable: neoBlockItems.length > 0,
        sampleFallbackUsed: previewUsesSampleBlocks,
        legacyPreviewResidueDetected,
        legacyPreviewResiduePaths: legacyPreviewResidueDetected
          ? [
              ...(previewUsesSampleBlocks ? ['runtimeSpecSummary.usesSampleBlocks'] : []),
              ...((envelopeSource === 'sample_preview' || envelopeSource === 'legacy_preview') ? ['envelopeSummary.envelopeSource'] : [])
            ]
          : [],
        sourceMode,
        routePurity: legacyPreviewResidueDetected
          ? (previewUsesNativeBlocks ? 'native_with_marked_fallback' : 'contaminated')
          : (previewUsesNativeBlocks ? 'clean_native' : 'unknown')
      };
  const graphCompleteness = useNativeProjection
    ? 'rich_sleeve_native'
    : (inspection.overallCompleteness === 'rich_sleeve_native'
      ? 'rich_sleeve_native'
      : ((neoBlockItems.length > 0 && (neoStackItems.length === 0 || neoStackReason === 'sleeve_declares_no_neostacks'))
        ? 'neoblock_only'
        : (neoBlockItems.length > 0 ? 'partial' : 'empty')));
  const baseRichnessResult = {
    ok: true,
    outputContract: { contractId: 'umg.runtime.sleeve_graph.richness.v1' as const, contractStatus: 'NORMALIZED' as const },
    graphStatus: inspection.ok ? (graphCompleteness === 'partial' || graphCompleteness === 'neoblock_only' ? 'GRAPH_PARTIAL' as const : 'GRAPH_READY' as const) : 'GRAPH_ERROR' as const,
    sourceSleeveId: sleeveId,
    activeSessionUsed: !input.sleeveId,
    sleeveSummary: {
      sleeveId,
      sessionState: sessionState.activeSleeveId === sleeveId ? sessionState.sessionStatus : 'explicit_request',
      graphStatus: drilldown.ok ? drilldown.drilldownStatus ?? null : null,
      declaredNeoStacks: drilldown.ok ? drilldown.declaredNeoStackRefs?.length ?? 0 : 0,
      declaredNeoBlocks: drilldown.ok ? drilldown.declaredNeoBlockRefs?.length ?? 0 : 0
    },
    neoStackSummary: input.includeNeoStacks === false ? null : (nativeSummaries?.neoStackSummary ?? {
      count: inspection.activeNeoStacks?.count ?? 0,
      status: inspection.activeNeoStacks?.status ?? 'missing',
      reason: neoStackReason,
      items: neoStackItems,
      source: 'sleeve_native_graph'
    }),
    neoBlockSummary: input.includeNeoBlocks === false ? null : (nativeSummaries?.neoBlockSummary ?? {
      count: inspection.activeNeoBlocks?.count ?? 0,
      status: inspection.activeNeoBlocks?.status ?? 'missing',
      reason: inspection.activeNeoBlocks?.reason ?? null,
      items: neoBlockItems,
      source: 'sleeve_native_graph'
    }),
    moltFragmentSummary: input.includeMoltFragments === false ? null : (nativeSummaries?.moltFragmentSummary ?? {
      visibleCount: moltVisibleCount,
      source: inspection.activeMoltBlocks?.source ?? null,
      groups: moltGroups
    }),
    toolRequestSummary: input.includeToolRequests === false ? null : (nativeSummaries?.toolRequestSummary ?? {
      requestCount: toolRequests.length,
      requests: toolRequests.map((req: any) => ({
        requestId: req.requestId,
        requestedToolName: req.requestedToolName,
        requestedAction: req.requestedAction,
        classification: req.classification,
        decisionReason: req.decisionReason,
        routeReason: req.requestSummary ?? null
      }))
    }),
    runtimeSpecSummary: nativeSummaries?.runtimeSpecSummary ?? (runtimeSpecSummary ? {
      ...runtimeSpecSummary,
      sourceMode,
      usesSleeveNativeBlocks: useNativeProjection ? true : runtimeSpecSummary.usesSleeveNativeBlocks,
      usesSampleBlocks: useNativeProjection ? false : runtimeSpecSummary.usesSampleBlocks,
      sourceProvenance,
      routeWarnings: sourceProvenance.legacyPreviewResidueDetected ? ['runtime_spec_contains_marked_sample_or_legacy_preview_residue'] : []
    } : null),
    irMatrixSummary: nativeSummaries?.irMatrixSummary ?? (irMatrixSummary ? {
      ...irMatrixSummary,
      sourceMode,
      sourceProvenance,
      routePurity: sourceProvenance.routePurity
    } : null),
    envelopeSummary: nativeSummaries?.envelopeSummary ?? (envelopeSummary ? {
      ...envelopeSummary,
      sourceMode,
      sourceProvenance,
      routePurity: sourceProvenance.routePurity,
      routeWarnings: sourceProvenance.legacyPreviewResidueDetected ? ['envelope_contains_marked_sample_or_legacy_preview_residue'] : []
    } : null),
    graphCompleteness: nativeSummaries?.graphCompleteness ?? graphCompleteness,
    diagnostics: input.includeDiagnostics === false ? null : (nativeSummaries?.diagnostics ?? {
      graphRunId,
      overallCompleteness: inspection.overallCompleteness,
      neoStackReason,
      activeMoltSource: inspection.activeMoltBlocks?.source ?? null,
      activeSessionAvailable: !!sessionState.activeSleeveId,
      activeSessionSleeveId: sessionState.activeSleeveId ?? null,
      sourceMode,
      sourceProvenance,
      nativeGraphAvailable: sourceProvenance.nativeGraphAvailable,
      sampleFallbackUsed: sourceProvenance.sampleFallbackUsed,
      legacyPreviewResidueDetected: sourceProvenance.legacyPreviewResidueDetected,
      legacyPreviewResiduePaths: sourceProvenance.legacyPreviewResiduePaths,
      routePurity: sourceProvenance.routePurity,
      routeWarnings: sourceProvenance.legacyPreviewResidueDetected ? ['sample_or_legacy_preview_residue_marked'] : [],
      nativeFixtureResolution: nativeFixtureRead.diagnostics,
      runtimeCodeIdentity,
      directSourceEnabled: false,
      automaticResponseTakeover: false
    }),
    warnings: inspection.warnings ?? [],
    errors: inspection.errors ?? [],
    audit: {
      execution: 'not_performed' as const,
      toolExecution: 'not_performed' as const,
      libraryMutation: 'not_performed' as const,
      packageMutation: 'not_performed' as const,
      filesystemMutation: 'not_performed' as const,
      restart: 'not_performed' as const,
      publish: 'not_performed' as const,
      automaticResponseTakeover: false,
      directSource: 'disabled' as const
    },
    trace: input.includeTrace === false ? [] : [
      `graphRunId=${graphRunId}`,
      `sourceSleeveId=${sleeveId}`,
      `graphCompleteness=${graphCompleteness}`,
      `neoStackReason=${neoStackReason ?? 'none'}`,
      'execution=not_performed'
    ]
  };

  return baseRichnessResult;
}

export function runBoundedReadOnlyOrchestration(
  version: string,
  entrypoint = 'dist/plugin-entry.js',
  root = DEFAULT_LIBRARY_ROOT,
  input: {
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
  } = {}
) {
  const useActiveSessionSleeve = input.useActiveSessionSleeve !== false;
  const sessionState = getRuntimeSleeveSessionState();
  const resolvedSleeveId = input.sleeveId ?? (useActiveSessionSleeve ? sessionState.activeSleeveId ?? undefined : undefined);
  const orchestrationRunId = `orch_${simpleStableKey([resolvedSleeveId ?? 'no_active_sleeve', input.requestedToolName ?? 'status', input.requestedAction ?? 'status_read', input.mode ?? 'dry_run', input.approvalDecision ?? 'dry_run_only'])}`;
  const sleeveId = resolvedSleeveId;
  const requestedToolName = input.requestedToolName ?? 'umg_envoy_block_library_status';
  if (!sleeveId) {
    return {
      ok: true,
      outputContract: { contractId: 'umg.runtime.orchestration.bounded_read_only.v1' as const, contractStatus: 'NORMALIZED' as const },
      orchestrationRunId,
      orchestrationStatus: 'ORCHESTRATION_BLOCKED' as const,
      sourceSleeveId: null,
      mode: (input.mode ?? 'dry_run') as 'inspect_only' | 'dry_run' | 'approved_read_only',
      boundaryPolicy: {
        approvedOnly: true,
        allowlistedOnly: true,
        readOnlyOnly: true,
        broadAutonomousExecution: false,
        triggerEvaluationAsExecutionAuthority: false,
        externalMoltBlockFileLoading: false,
        fullLibraryScan: false,
        unboundedRecursiveTraversal: false,
        umgBlockLibraryMutation: false,
        restartExecution: false,
        publishExecution: false,
        packageExecution: false,
        automaticResponseTakeover: false,
        directSourceEnabled: false
      },
      activeSleeveInspection: null,
      runtimePreview: null,
      runtimeSpecSummary: null,
      irMatrixSummary: null,
      envelopeSummary: null,
      toolRequestClassification: null,
      executionGatePlan: null,
      approvalCheckpointCreate: null,
      approvalCheckpointResume: null,
      approvedReadOnlyExecution: null,
      blockedActions: [{ requestedToolName, requestedAction: input.requestedAction ?? 'status_read', blockedReason: 'no_active_sleeve' }],
      warnings: [],
      errors: [{ code: 'NO_ACTIVE_SLEEVE', message: 'No active sleeve session exists and no sleeveId was provided.' }],
      audit: {
        inspectorPerformed: false,
        runtimePreviewPerformed: false,
        classificationPerformed: false,
        gatePlanCreated: false,
        approvalCheckpointCreated: false,
        approvalCheckpointResumed: false,
        readOnlyExecutionPerformed: false,
        triggerEvaluation: 'not_performed' as const,
        externalMoltBlockFileLoading: 'not_performed' as const,
        fullLibraryScan: 'not_performed' as const,
        unboundedRecursiveTraversal: 'not_performed' as const,
        libraryMutation: 'not_performed' as const,
        packageMutation: 'not_performed' as const,
        restart: 'not_performed' as const,
        publish: 'not_performed' as const,
        automaticResponseTakeover: false,
        directSource: 'disabled' as const
      },
      trace: input.includeTrace === false ? [] : ['blockedReason=no_active_sleeve', 'execution=not_performed']
    };
  }
  const requestedAction = input.requestedAction ?? 'status_read';
  const mode = (input.mode ?? 'dry_run') as 'inspect_only' | 'dry_run' | 'approved_read_only';
  const approvalDecision = input.approvalDecision ?? (mode === 'approved_read_only' ? 'approve' : 'dry_run_only');
  const includeTrace = input.includeTrace !== false;
  const boundaryPolicy = {
    approvedOnly: true,
    allowlistedOnly: true,
    readOnlyOnly: true,
    broadAutonomousExecution: false,
    triggerEvaluationAsExecutionAuthority: false,
    externalMoltBlockFileLoading: false,
    fullLibraryScan: false,
    unboundedRecursiveTraversal: false,
    umgBlockLibraryMutation: false,
    restartExecution: false,
    publishExecution: false,
    packageExecution: false,
    automaticResponseTakeover: false,
    directSourceEnabled: false
  };

  const inspector = input.includeInspector === false ? null : inspectRuntimeActiveSleeveIrMatrixEnvelope(version, entrypoint, root, {
    sleeveId,
    includeNeoStacks: true,
    includeNeoBlocks: true,
    includeMoltBlocks: true,
    includeRuntimeSpec: true,
    includeIrMatrix: input.includeIrMatrix !== false,
    includeEnvelope: input.includeEnvelope !== false,
    includeExecutionGateState: input.includeExecutionGateState !== false,
    mode: 'inspect_only'
  });
  const runtimePreview = input.includeRuntimePreview === false ? null : previewRuntimeSleeve(version, entrypoint, root, {
    sleeveId,
    previewFormat: 'summary',
    includeActiveStack: true,
    includeMoltMap: true,
    includeEnvelope: input.includeEnvelope !== false,
    includeToolRequests: true
  });

  const isChainDecision = approvalDecision === 'approve' || approvalDecision === 'deny' || approvalDecision === 'dry_run_only';
  const chain = isChainDecision
    ? runRuntimeExecutionChainE2EApprovedReadOnly(version, entrypoint, root, {
        sleeveId,
        requestedToolName,
        requestedAction,
        approvalDecision,
        mode: mode === 'approved_read_only' ? 'e2e_approved_read_only' : 'dry_run_only',
        includeTrace
      })
    : {
        ok: false,
        outputContract: { contractId: 'umg.runtime.execution_chain.e2e_approved_read_only.v1' as const, contractStatus: 'NORMALIZED' as const },
        chainRunId: `chain_edit_${simpleStableKey([sleeveId, requestedToolName, requestedAction])}`,
        chainStatus: 'CHAIN_E2E_BLOCKED' as const,
        sourceSleeveId: sleeveId,
        runtimeSpecId: null,
        classifierResultId: null,
        gatePlanId: null,
        checkpointId: null,
        resumeResultId: null,
        executionResultId: null,
        requestedToolName,
        requestedAction,
        approvalDecision,
        executionStatus: 'EXECUTION_BLOCKED' as const,
        sideEffectStatus: 'not_performed' as const,
        resultSummary: 'Edit requested; approved read-only execution not performed.',
        resultPayload: { blockedReason: 'edit_requested' },
        classifierResult: null,
        gatePlanResult: null,
        checkpointCreateResult: null,
        checkpointResumeResult: {
          ok: true,
          version,
          entrypoint,
          mode: 'runtime_approval_checkpoint_resume' as const,
          outputContract: { contractId: 'umg.runtime.approval_checkpoint.resume.v1' as const, contractStatus: 'NORMALIZED' as const },
          checkpointPersistence: 'not_persisted' as const,
          executionStatus: 'not_performed' as const,
          resumeStatus: 'CHECKPOINT_RESUME_EDIT_REQUESTED' as const,
          resumeResultId: `resume_edit_${simpleStableKey([sleeveId, requestedToolName, requestedAction])}`,
          sourceCheckpointId: '',
          sourceRuntimeSpecId: null,
          sourceSleeveId: sleeveId,
          sourceGatePlanId: null,
          sourceRequestId: '',
          requestedToolName,
          requestedAction,
          decision: 'edit' as const,
          previousApprovalStatus: 'WAITING_FOR_APPROVAL' as const,
          nextApprovalStatus: 'EDIT_REQUESTED' as const,
          allowedDecision: true,
          decisionAccepted: true,
          editRequested: true,
          dryRunOnly: false,
          executionEligible: false,
          updatedCheckpointProjection: null,
          audit: {
            execution: 'not_performed' as const,
            toolExecution: 'not_performed' as const,
            approvalCheckpointResumed: true,
            approvalCheckpointPersistence: 'not_persisted' as const,
            triggerEvaluation: 'not_performed' as const,
            libraryMutation: 'not_performed' as const,
            packageMutation: 'not_performed' as const,
            restart: 'not_performed' as const,
            publish: 'not_performed' as const
          },
          trace: includeTrace ? ['decision=edit', 'nextApprovalStatus=EDIT_REQUESTED', 'executionEligible=false', 'execution=not_performed'] : [],
          warnings: [],
          errors: []
        },
        executionResult: null,
        audit: {
          runtimeCompiled: false,
          classificationPerformed: false,
          gatePlanCreated: false,
          approvalCheckpointCreated: false,
          approvalCheckpointResumed: true,
          approvalVerified: false,
          allowlistVerified: false,
          readOnlyVerified: false,
          toolExecution: 'not_performed' as const,
          triggerEvaluation: 'not_performed' as const,
          libraryMutation: 'not_performed' as const,
          packageMutation: 'not_performed' as const,
          filesystemMutation: 'not_performed' as const,
          restart: 'not_performed' as const,
          publish: 'not_performed' as const
        },
        trace: includeTrace ? ['approvalDecision=edit', 'execution=not_performed', 'execution_blocked=edit_requested'] : [],
        warnings: [],
        errors: []
      };
  const executionAllowed = mode === 'approved_read_only' && approvalDecision === 'approve' && chain.executionStatus === 'EXECUTION_READY';
  const chainBlockedReason = typeof chain.executionResult?.resultPayload === 'object'
    && chain.executionResult?.resultPayload !== null
    && 'blockedReason' in chain.executionResult.resultPayload
    && typeof (chain.executionResult.resultPayload as { blockedReason?: unknown }).blockedReason === 'string'
      ? (chain.executionResult.resultPayload as { blockedReason?: string }).blockedReason
      : undefined;
  const blockedActions = chain.executionStatus === 'EXECUTION_BLOCKED' ? [{
    requestedToolName,
    requestedAction,
    blockedReason: chainBlockedReason ?? chain.resultSummary ?? 'execution_blocked'
  }] : [];

  return {
    ok: true,
    outputContract: { contractId: 'umg.runtime.orchestration.bounded_read_only.v1' as const, contractStatus: 'NORMALIZED' as const },
    orchestrationRunId,
    orchestrationStatus: chain.executionStatus === 'EXECUTION_BLOCKED'
      ? 'ORCHESTRATION_BLOCKED' as const
      : (chain.ok ? 'ORCHESTRATION_READY' as const : 'ORCHESTRATION_PARTIAL' as const),
    sourceSleeveId: sleeveId,
    mode,
    boundaryPolicy,
    activeSleeveInspection: inspector?.activeSleeve ?? null,
    runtimePreview,
    runtimeSpecSummary: inspector?.runtimeSpec ?? runtimePreview?.runtimeSpec ?? null,
    irMatrixSummary: inspector?.irMatrixProjection ?? null,
    envelopeSummary: inspector?.responseEnvelopePreview ?? null,
    toolRequestClassification: chain.classifierResult ?? null,
    executionGatePlan: chain.gatePlanResult ?? null,
    approvalCheckpointCreate: chain.checkpointCreateResult ?? null,
    approvalCheckpointResume: approvalDecision === 'dry_run_only' && mode !== 'approved_read_only' ? null : (chain.checkpointResumeResult ?? null),
    approvedReadOnlyExecution: executionAllowed ? (chain.executionResult ?? null) : null,
    blockedActions,
    warnings: [...(runtimePreview?.warnings ?? []), ...(inspector?.warnings ?? []), ...(chain.warnings ?? [])],
    errors: [...(runtimePreview?.errors ?? []), ...(inspector?.errors ?? []), ...(chain.errors ?? [])],
    audit: {
      inspectorPerformed: inspector !== null,
      runtimePreviewPerformed: runtimePreview !== null,
      classificationPerformed: true,
      gatePlanCreated: true,
      approvalCheckpointCreated: (chain.checkpointCreateResult?.checkpointCount ?? 0) > 0,
      approvalCheckpointResumed: !!chain.checkpointResumeResult,
      readOnlyExecutionPerformed: executionAllowed,
      triggerEvaluation: 'not_performed' as const,
      externalMoltBlockFileLoading: 'not_performed' as const,
      fullLibraryScan: 'not_performed' as const,
      unboundedRecursiveTraversal: 'not_performed' as const,
      libraryMutation: 'not_performed' as const,
      packageMutation: 'not_performed' as const,
      restart: 'not_performed' as const,
      publish: 'not_performed' as const,
      automaticResponseTakeover: false,
      directSource: 'disabled' as const
    },
    trace: includeTrace ? [
      `orchestrationRunId=${orchestrationRunId}`,
      `mode=${mode}`,
      `requestedToolName=${requestedToolName}`,
      `requestedAction=${requestedAction}`,
      `approvalDecision=${approvalDecision}`,
      `executionStatus=${chain.executionStatus}`
    ] : []
  };
}

export function previewRuntimeSleeve(
  version: string,
  entrypoint = 'dist/plugin-entry.js',
  root = DEFAULT_LIBRARY_ROOT,
  input: {
    sleeveId?: string;
    runtimeSessionId?: string;
    previewFormat?: 'summary' | 'full' | 'nl' | string;
    includeActiveStack?: boolean;
    includeMoltMap?: boolean;
    includeEnvelope?: boolean;
    includeToolRequests?: boolean;
  } = {}
) {
  const previewFormat = input.previewFormat ?? 'summary';
  const compiled = compileRuntimeSleeve(version, entrypoint, root, {
    sleeveId: input.sleeveId,
    runtimeSessionId: input.runtimeSessionId,
    resolveDepth: 'molt_visible',
    strictness: 'dev',
    compileMode: 'dry_run'
  });
  const base = {
    version,
    entrypoint,
    mode: 'runtime_preview' as const,
    outputContract: { contractId: 'umg.runtime.preview.v1' as const, contractStatus: 'NORMALIZED' as const },
    executionStatus: 'not_performed' as const,
    directSource: 'not_enabled' as const
  };
  if (!compiled.runtimeSpecId || !compiled.sleeveId) {
    return { ...base, ok: false, previewStatus: 'HELD' as const, runtimeSpec: null, activeStackProjection: null, moltMapProjection: null, responseEnvelopePreview: null, toolRequestPreview: [], warnings: compiled.warnings ?? [], errors: compiled.errors ?? [], nlProjection: 'Runtime Preview unavailable: no selected or resolvable sleeve.' };
  }
  const ids = compiled.activeBlocks.length > 0 ? compiled.activeBlocks : (compiled.promptParts.map((part) => part.sourceBlockId).filter(Boolean) as string[]);
  const activeStackProjection = input.includeActiveStack === false ? null : getBlockLibraryActiveStackProjection(version, entrypoint, root, { currentState: 'RUNTIME_PREVIEW_READY', activeTool: 'umg_envoy_runtime_preview', sourceTool: 'umg_envoy_runtime_compile', neoblockIds: ids, activeSleeve: compiled.sleeveId, boundary: 'preview only; execution not performed', projectionFormat: 'both', includeAudit: true, includeRaw: false });
  const responseEnvelopePreview = input.includeEnvelope === false ? null : getBlockLibraryResponseEnvelopeFragment(version, entrypoint, root, { neoblockIds: ids, project: 'UMG Envoy Agent / OpenClaw', currentState: 'RUNTIME_PREVIEW_READY', activeTool: 'umg_envoy_runtime_preview', formalResponseContent: compiled.promptParts.map((part) => `${part.field}: ${part.text}`).join('\n\n'), envoyIntuition: compiled.strategy ?? 'n/a', projectionFormat: 'both', includeMetadata: true, includeAudit: true, activeSleeve: compiled.sleeveId, activeStackBoundary: 'preview only; execution not performed', includeActiveStackProjection: true, includeRaw: false });
  const summaryRuntimeSpec = previewFormat === 'summary' ? { runtimeSpecVersion: compiled.runtimeSpecVersion, runtimeSpecId: compiled.runtimeSpecId, sleeveId: compiled.sleeveId, activeBlocks: compiled.activeBlocks, toolRequests: compiled.toolRequests } : { runtimeSpecVersion: compiled.runtimeSpecVersion, runtimeSpecId: compiled.runtimeSpecId, sleeveId: compiled.sleeveId, activeBlocks: compiled.activeBlocks, moltMap: compiled.moltMap, promptParts: compiled.promptParts, strategy: compiled.strategy, constraints: compiled.constraints, context: compiled.context, values: compiled.values, format: compiled.format, toolRequests: compiled.toolRequests };
  const nlProjection = [
    'Runtime Preview:',
    `- Selected Sleeve: ${compiled.sleeveId}`,
    `- Compile Status: ${compiled.compileStatus}`,
    `- Runtime Spec Id: ${compiled.runtimeSpecId}`,
    `- Active Blocks: ${compiled.activeBlocks.length}`,
    `- Execution: not_performed`,
    `- Tool Requests: ${compiled.toolRequests.length}`,
    `- Active Stack: ${activeStackProjection?.activeStackProjection?.projectionStatus ?? 'n/a'}`,
    `- Envelope Preview: ${responseEnvelopePreview?.responseEnvelopeFragment?.fragmentStatus ?? 'n/a'}`
  ].join('\n');
  return {
    ...base,
    ok: compiled.ok,
    previewStatus: compiled.compileStatus === 'COMPILED' ? 'RUNTIME_PREVIEW_READY' as const : (compiled.compileStatus === 'PARTIAL' ? 'PARTIAL' as const : 'FAILED' as const),
    runtimeSpec: summaryRuntimeSpec,
    activeStackProjection,
    moltMapProjection: input.includeMoltMap === false ? null : compiled.moltMap,
    responseEnvelopePreview,
    toolRequestPreview: input.includeToolRequests === false ? [] : compiled.toolRequests,
    warnings: compiled.warnings,
    errors: compiled.errors,
    nlProjection
  };
}

export function getBlockLibraryStatus(version: string, entrypoint = "dist/plugin-entry.js", root = DEFAULT_LIBRARY_ROOT): BlockLibraryStatusResult {
  const normalizedRoot = path.resolve(root);
  if (!normalizedRoot || normalizedRoot.trim().length === 0) {
    return {
      ok: false,
      version,
      entrypoint,
      surface: "compiler_backed_12_tool_runtime",
      readOnly: true,
      execution: "not_performed",
      directSource: "not_enabled",
      libraryRoot: root,
      rootExists: false,
      laneSummary: {
        machineLoadableCandidateCount: 0,
        publicCuratedCandidateCount: 0,
        referenceOnlyCount: 0,
        forbiddenCount: 0
      },
      lanes: [],
      warnings: [],
      errors: [{ code: "HOLD_LIBRARY_ROOT_REQUIRED", message: "Library root is required." }]
    };
  }

  const lowered = normalizedRoot.toLowerCase();
  if (["archive", "backups", "artifacts", "release-staging", "publish-stage", "resleever", "vendor", "node_modules"].some((segment) => lowered.includes(`\\${segment.toLowerCase()}`) || lowered.endsWith(`\\${segment.toLowerCase()}`))) {
    return {
      ok: false,
      version,
      entrypoint,
      surface: "compiler_backed_12_tool_runtime",
      readOnly: true,
      execution: "not_performed",
      directSource: "not_enabled",
      libraryRoot: normalizedRoot,
      rootExists: safeExists(normalizedRoot),
      laneSummary: {
        machineLoadableCandidateCount: 0,
        publicCuratedCandidateCount: 0,
        referenceOnlyCount: 0,
        forbiddenCount: 0
      },
      lanes: [],
      warnings: [],
      errors: [{ code: "HOLD_LIBRARY_ROOT_FORBIDDEN", message: `Library root is forbidden: ${normalizedRoot}` }]
    };
  }

  if (!safeExists(normalizedRoot)) {
    return {
      ok: false,
      version,
      entrypoint,
      surface: "compiler_backed_12_tool_runtime",
      readOnly: true,
      execution: "not_performed",
      directSource: "not_enabled",
      libraryRoot: normalizedRoot,
      rootExists: false,
      laneSummary: {
        machineLoadableCandidateCount: 0,
        publicCuratedCandidateCount: 0,
        referenceOnlyCount: 0,
        forbiddenCount: 0
      },
      lanes: [],
      warnings: [],
      errors: [{ code: "HOLD_LIBRARY_ROOT_MISSING", message: `Library root missing: ${normalizedRoot}` }]
    };
  }

  const lanes = [
    ...MACHINE_LANES,
    ...PUBLIC_CURATED_LANES,
    ...REFERENCE_ONLY_LANES,
    ...FORBIDDEN_LANES
  ].map((lane) => classifyLane(normalizedRoot, lane));

  return {
    ok: true,
    version,
    entrypoint,
    surface: "compiler_backed_12_tool_runtime",
    readOnly: true,
    execution: "not_performed",
    directSource: "not_enabled",
    libraryRoot: normalizedRoot,
    rootExists: true,
    laneSummary: {
      machineLoadableCandidateCount: lanes.filter((lane) => lane.classification === "MACHINE_LOADABLE_CANDIDATE").length,
      publicCuratedCandidateCount: lanes.filter((lane) => lane.classification === "PUBLIC_CURATED_CANDIDATE").length,
      referenceOnlyCount: lanes.filter((lane) => lane.classification === "REFERENCE_ONLY").length,
      forbiddenCount: lanes.filter((lane) => lane.classification === "FORBIDDEN").length
    },
    lanes,
    warnings: [],
    errors: []
  };
}

