import fs from "node:fs";
import path from "node:path";

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
  | "HOLD_MOLT_MAP_COMPOSE_UNAVAILABLE";

export interface BlockLibraryLaneStatus {
  lane: string;
  classification: BlockLibraryLaneClassification;
  exists: boolean;
  loadPolicy: "readonly_allowed" | "not_machine_loaded" | "do_not_load";
  notes: string[];
}

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
  };
  moltMap: Record<"Trigger" | "Directive" | "Instruction" | "Subject" | "Primary" | "Philosophy" | "Blueprint", {
    value: string;
    sourceNeoblockId: string | null;
    moltType: string | null;
    fragmentStatus: string | null;
    provenance: Record<string, unknown> | null;
  }>;
  fragmentResults: Array<{ neoblockId: string; ok: boolean; field: string | null; fragmentStatus: string | null; errors: Array<{ code: BlockLibraryHoldCode; message: string }> }>;
  conflicts: Array<{ field: string; chosenNeoblockId: string | null; ignoredNeoblockIds: string[] }>;
  nlProjection: string | null;
  warnings: string[];
  errors: Array<{ code: BlockLibraryHoldCode; message: string }>;
}

const DEFAULT_LIBRARY_ROOT = "C:\\.openclaw\\workspace\\UMG-Block-Library";
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
  const baseMoltMap = Object.fromEntries(MOLT_MAP_FIELD_ORDER.map((field) => [field, { value: 'n/a', sourceNeoblockId: null, moltType: null, fragmentStatus: null, provenance: input.includeFieldProvenance === false ? null : null }])) as BlockLibraryMoltMapComposeResult['moltMap'];
  const base = {
    version,
    entrypoint,
    mode: 'real_block_library_molt_map_compose' as const,
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
      fullLibraryScan: false as const
    },
    moltMap: baseMoltMap,
    fragmentResults: [] as BlockLibraryMoltMapComposeResult['fragmentResults'],
    conflicts: [] as BlockLibraryMoltMapComposeResult['conflicts'],
    nlProjection: null as string | null,
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
    const fragmentStatus = fragment.moltMapFragment?.fragmentStatus ?? null;
    fragmentResults.push({ neoblockId, ok: fragment.ok, field, fragmentStatus, errors: fragment.errors });
    if (!fragment.ok || !field || !fragment.moltMapFragment) {
      deniedFragmentCount += 1;
      continue;
    }
    if (moltMap[field].sourceNeoblockId) {
      duplicateFieldCount += 1;
      conflicts.push({ field, chosenNeoblockId: moltMap[field].sourceNeoblockId, ignoredNeoblockIds: [neoblockId] });
      if (normalizedConflictPolicy === 'first_wins') {
        continue;
      }
      continue;
    }
    moltMap[field] = {
      value: fragment.moltMapFragment.fieldValue ?? 'n/a',
      sourceNeoblockId: fragment.moltMapFragment.sourceNeoblockId,
      moltType: fragment.moltMapFragment.moltType,
      fragmentStatus: fragment.moltMapFragment.fragmentStatus,
      provenance: input.includeFieldProvenance === false ? null : fragment.moltMapFragment.provenance
    };
    composedFieldCount += 1;
  }
  const missingFieldCount = MOLT_MAP_FIELD_ORDER.filter((field) => moltMap[field].sourceNeoblockId === null).length;
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
