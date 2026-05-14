import fs from "node:fs";
import path from "node:path";

export type RealLibraryResolverMode = "public_curated";

export type RealLibraryResolverErrorCode =
  | "HOLD_LIBRARY_ROOT_MISSING"
  | "HOLD_FORBIDDEN_ROOT_PATH"
  | "HOLD_RESLEEVER_CONTAMINATION_RISK"
  | "HOLD_UNSUPPORTED_MODE"
  | "HOLD_ENTRYPOINT_MISSING"
  | "HOLD_CATALOG_PARSE_FAILED"
  | "HOLD_CATALOG_SHAPE_UNKNOWN"
  | "HOLD_SOURCE_PATH_OUTSIDE_ALLOWLIST"
  | "HOLD_SOURCE_PATH_POLICY_REGRESSION"
  | "HOLD_EXISTING_TOOL_SURFACE_REGRESSION"
  | "HOLD_SLEEVE_ID_REQUIRED"
  | "HOLD_SLEEVE_NOT_FOUND"
  | "HOLD_SLEEVE_NOT_LOADABLE_PUBLIC_CURATED"
  | "HOLD_SLEEVE_SOURCE_PATH_FORBIDDEN"
  | "HOLD_SLEEVE_SOURCE_PATH_OUTSIDE_ALLOWLIST"
  | "HOLD_SLEEVE_FILE_MISSING"
  | "HOLD_SLEEVE_PARSE_FAILED"
  | "HOLD_SLEEVE_SHAPE_UNKNOWN"
  | "HOLD_SHALLOW_LOAD_TARGET_REF_REQUIRED_STEP8B"
  | "HOLD_SHALLOW_LOAD_TARGET_NOT_CLASSIFIED_STEP8B"
  | "HOLD_SHALLOW_LOAD_TARGET_NOT_AVAILABLE_STEP8B"
  | "HOLD_SHALLOW_LOAD_TARGET_PATH_FORBIDDEN_STEP8B"
  | "HOLD_SHALLOW_LOAD_TARGET_PATH_OUTSIDE_ALLOWLIST_STEP8B"
  | "HOLD_SHALLOW_LOAD_TARGET_FILE_MISSING_STEP8B"
  | "HOLD_SHALLOW_LOAD_TARGET_PARSE_FAILED_STEP8B"
  | "HOLD_SHALLOW_LOAD_TARGET_KIND_UNSUPPORTED_STEP8B"
  | "HOLD_SHALLOW_LOAD_RECURSION_ATTEMPTED_STEP8B"
  | "HOLD_SHALLOW_LOAD_EXECUTION_ATTEMPTED_STEP8B";

export type RealLibrarySleeveResolutionStatus =
  | "LOADABLE_PUBLIC_CURATED"
  | "NOT_LOADABLE_OUTSIDE_PUBLIC_CURATED_ALLOWLIST"
  | "REJECTED_FORBIDDEN_SOURCE_PATH"
  | "NO_SOURCE_PATH"
  | "SOURCE_PATH_MISSING_ON_DISK"
  | "SOURCE_PATH_SHAPE_UNKNOWN";

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

export type RealLibraryTargetAvailabilityStatus =
  | "TARGET_INDEX_ENTRY_FOUND_NOT_LOADED_STEP7"
  | "TARGET_INDEX_ENTRY_FOUND_PATH_ALLOWED_NOT_LOADED_STEP7"
  | "TARGET_INDEX_ENTRY_FOUND_PATH_FORBIDDEN_NOT_LOADED_STEP7"
  | "TARGET_INDEX_ENTRY_FOUND_PATH_MISSING_NOT_LOADED_STEP7"
  | "TARGET_INDEX_ENTRY_NOT_FOUND_STEP7"
  | "TARGET_LOOKUP_INDEX_MISSING_STEP7"
  | "TARGET_LOOKUP_INDEX_READ_FAILED_STEP7"
  | "TARGET_LOOKUP_INDEX_PARSE_FAILED_STEP7"
  | "TARGET_LOOKUP_INDEX_SHAPE_UNKNOWN_STEP7"
  | "TARGET_KIND_UNSUPPORTED_STEP7"
  | "TARGET_AVAILABILITY_UNKNOWN_STEP7";

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

export type RealLibraryReferenceClassificationStatus =
  | "CLASSIFIED_NOT_RESOLVED_STEP6"
  | "CLASSIFIED_UNKNOWN_NOT_RESOLVED_STEP6"
  | "MALFORMED_REFERENCE_NOT_RESOLVED_STEP6"
  | "DUPLICATE_REFERENCE_NOT_RESOLVED_STEP6";

export type RealLibraryReferenceInferredKind =
  | "neoblock"
  | "neostack"
  | "moltBlock"
  | "tool"
  | "gate"
  | "trigger"
  | "unknown"
  | "malformed";

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
  runtimeSummary?: RealLibraryRuntimeSummary | { performed: false; reason: "targetShallowLoad_not_successful" };
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

const FORBIDDEN_SEGMENTS = [
  "backup",
  "backups",
  "plugin-backups",
  "archive",
  "legacy",
  "scratch",
  "worklogs",
  "publish-stage",
  "release-clean",
  "staging",
  "inspect",
  "old-alpha",
  "previous-alpha",
  "resleever",
  "umg_envoy_resleever"
] as const;

const PUBLIC_CURATED_ENTRYPOINT = path.join("sleeves", "manifests", "catalog.json");
const PUBLIC_CURATED_ALLOWLIST = path.join("sleeves") + path.sep;
const DEFAULT_LIBRARY_ROOT = "C:\\.openclaw\\workspace\\UMG-Block-Library";

function normalizeInputRoot(libraryRoot: string): string {
  return path.resolve(libraryRoot);
}

function hasForbiddenSegment(targetPath: string): boolean {
  const parts = targetPath
    .split(/[\\/]+/)
    .map((segment) => segment.trim().toLowerCase())
    .filter(Boolean);
  return parts.some((segment) => FORBIDDEN_SEGMENTS.includes(segment as (typeof FORBIDDEN_SEGMENTS)[number]));
}

function buildFailure(
  input: RealLibraryResolverInput,
  code: RealLibraryResolverErrorCode,
  message: string,
  trace: RealLibraryResolverTrace,
  normalizedRoot?: string
): RealLibraryResolverResult {
  return {
    ok: false,
    mode: input.mode,
    libraryRoot: normalizedRoot ?? input.libraryRoot,
    entrypoint: PUBLIC_CURATED_ENTRYPOINT.replace(/\\/g, "/"),
    catalogLoaded: false,
    sleeveCount: 0,
    loadableSleeveCount: 0,
    rejectedSleeveCount: 0,
    unloadableSleeveCount: 0,
    sleeves: [],
    warnings: [],
    errors: [{ code, message }],
    trace
  };
}

function buildInspectFailure(
  input: RealLibrarySleeveInspectInput,
  code: RealLibraryResolverErrorCode,
  message: string,
  trace: RealLibrarySleeveInspectTrace,
  normalizedRoot: string,
  sleeveEntry?: RealLibraryCatalogSleeveEntry
): RealLibrarySleeveInspectResult {
  return {
    ok: false,
    mode: input.mode ?? "public_curated",
    libraryRoot: normalizedRoot,
    sleeveId: input.sleeveId ?? input.id,
    sourcePath: sleeveEntry?.sourcePath,
    resolvedSourcePath: sleeveEntry?.resolvedSourcePath,
    resolutionStatus: sleeveEntry?.resolutionStatus,
    loaded: false,
    summary: null,
    warnings: sleeveEntry?.warnings ?? [],
    errors: [{ code, message }],
    trace
  };
}

function normalizeString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function readJsonFileSafe(filePath: string): unknown {
  const raw = fs.readFileSync(filePath, "utf8");
  const sanitized = raw.replace(/^\uFEFF/, "").replace(/^ï»¿/, "");
  return JSON.parse(sanitized);
}

function classifySleeveEntry(
  entry: unknown,
  entrypointAbsolute: string,
  allowlistRoot: string
): RealLibraryCatalogSleeveEntry {
  const record = (entry && typeof entry === "object" && !Array.isArray(entry)) ? entry as Record<string, unknown> : {};
  const id = normalizeString(record.id);
  const name = normalizeString(record.name);
  const title = normalizeString(record.title) ?? name;
  const status = normalizeString(record.status);
  const sourcePath = normalizeString(record.source_path);
  const warnings: string[] = [];
  const errors: RealLibraryResolverError[] = [];

  if (!sourcePath) {
    return {
      id,
      name,
      title,
      status,
      sourcePath,
      resolvedSourcePath: undefined,
      resolutionStatus: "NO_SOURCE_PATH",
      warnings,
      errors
    };
  }

  const resolvedSourcePath = path.resolve(path.dirname(entrypointAbsolute), sourcePath);
  const insideAllowlist = resolvedSourcePath.startsWith(allowlistRoot) || resolvedSourcePath === allowlistRoot.slice(0, -1);
  const forbidden = hasForbiddenSegment(resolvedSourcePath);

  if (forbidden) {
    warnings.push(`forbidden source path rejected: ${sourcePath}`);
    return {
      id,
      name,
      title,
      status,
      sourcePath,
      resolvedSourcePath,
      resolutionStatus: "REJECTED_FORBIDDEN_SOURCE_PATH",
      warnings,
      errors
    };
  }

  if (!insideAllowlist) {
    warnings.push(`source path outside public_curated allowlist: ${sourcePath}`);
    return {
      id,
      name,
      title,
      status,
      sourcePath,
      resolvedSourcePath,
      resolutionStatus: "NOT_LOADABLE_OUTSIDE_PUBLIC_CURATED_ALLOWLIST",
      warnings,
      errors
    };
  }

  if (!fs.existsSync(resolvedSourcePath)) {
    warnings.push(`source path missing on disk: ${sourcePath}`);
    return {
      id,
      name,
      title,
      status,
      sourcePath,
      resolvedSourcePath,
      resolutionStatus: "SOURCE_PATH_MISSING_ON_DISK",
      warnings,
      errors
    };
  }

  const stat = fs.statSync(resolvedSourcePath);
  if (!stat.isFile() && !stat.isDirectory()) {
    warnings.push(`source path shape unknown: ${sourcePath}`);
    return {
      id,
      name,
      title,
      status,
      sourcePath,
      resolvedSourcePath,
      resolutionStatus: "SOURCE_PATH_SHAPE_UNKNOWN",
      warnings,
      errors
    };
  }

  return {
    id,
    name,
    title,
    status,
    sourcePath,
    resolvedSourcePath,
    resolutionStatus: "LOADABLE_PUBLIC_CURATED",
    warnings,
    errors
  };
}

export function resolveRealLibraryPublicCurated(input: RealLibraryResolverInput): RealLibraryResolverResult {
  const trace: RealLibraryResolverTrace = {
    sourcePathPolicy: "public_curated_allowlist_only"
  };
  const normalizedRoot = normalizeInputRoot(input.libraryRoot);

  if (!fs.existsSync(normalizedRoot)) {
    return buildFailure(input, "HOLD_LIBRARY_ROOT_MISSING", `Library root not found: ${normalizedRoot}`, trace, normalizedRoot);
  }

  if (hasForbiddenSegment(normalizedRoot)) {
    trace.forbiddenPathCheck = "failed";
    return buildFailure(input, "HOLD_FORBIDDEN_ROOT_PATH", `Library root contains forbidden path class: ${normalizedRoot}`, trace, normalizedRoot);
  }
  trace.forbiddenPathCheck = "passed";

  if (/resleever|umg_envoy_resleever/i.test(normalizedRoot)) {
    trace.resleeverCheck = "failed";
    return buildFailure(input, "HOLD_RESLEEVER_CONTAMINATION_RISK", `Library root falls under Resleever classification: ${normalizedRoot}`, trace, normalizedRoot);
  }
  trace.resleeverCheck = "passed";

  if (input.mode !== "public_curated") {
    return buildFailure(input, "HOLD_UNSUPPORTED_MODE", `Unsupported mode: ${input.mode}`, trace, normalizedRoot);
  }

  const entrypointAbsolute = path.join(normalizedRoot, PUBLIC_CURATED_ENTRYPOINT);
  if (!fs.existsSync(entrypointAbsolute)) {
    trace.entrypointCheck = "failed";
    return buildFailure(input, "HOLD_ENTRYPOINT_MISSING", `Entrypoint missing: ${entrypointAbsolute}`, trace, normalizedRoot);
  }
  trace.entrypointCheck = "passed";

  let parsed: unknown;
  try {
    parsed = readJsonFileSafe(entrypointAbsolute);
  } catch (error) {
    trace.parseCheck = "failed";
    const message = error instanceof Error ? error.message : String(error);
    return buildFailure(input, "HOLD_CATALOG_PARSE_FAILED", `Failed to parse catalog JSON: ${message}`, trace, normalizedRoot);
  }
  trace.parseCheck = "passed";

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    trace.catalogShapeCheck = "failed";
    return buildFailure(input, "HOLD_CATALOG_SHAPE_UNKNOWN", "Catalog root must be an object.", trace, normalizedRoot);
  }

  const catalog = parsed as Record<string, unknown>;
  if (!Array.isArray(catalog.sleeves)) {
    trace.catalogShapeCheck = "failed";
    return buildFailure(input, "HOLD_CATALOG_SHAPE_UNKNOWN", "Catalog missing sleeves array.", trace, normalizedRoot);
  }
  trace.catalogShapeCheck = "passed";

  const allowlistRoot = path.join(normalizedRoot, PUBLIC_CURATED_ALLOWLIST);
  const sleeves = catalog.sleeves.map((entry) => classifySleeveEntry(entry, entrypointAbsolute, allowlistRoot));
  trace.allowlistCheck = "passed";

  const warnings = sleeves.flatMap((sleeve) => sleeve.warnings.map((warning) => `${sleeve.id ?? sleeve.name ?? "unknown-sleeve"}: ${warning}`));
  const errors = sleeves.flatMap((sleeve) => sleeve.errors);
  const loadableSleeveCount = sleeves.filter((sleeve) => sleeve.resolutionStatus === "LOADABLE_PUBLIC_CURATED").length;
  const rejectedSleeveCount = sleeves.filter((sleeve) => sleeve.resolutionStatus === "REJECTED_FORBIDDEN_SOURCE_PATH").length;
  const unloadableSleeveCount = sleeves.filter((sleeve) => sleeve.resolutionStatus !== "LOADABLE_PUBLIC_CURATED" && sleeve.resolutionStatus !== "REJECTED_FORBIDDEN_SOURCE_PATH").length;

  return {
    ok: true,
    mode: "public_curated",
    libraryRoot: normalizedRoot,
    entrypoint: PUBLIC_CURATED_ENTRYPOINT.replace(/\\/g, "/"),
    catalogLoaded: true,
    sleeveCount: sleeves.length,
    loadableSleeveCount,
    rejectedSleeveCount,
    unloadableSleeveCount,
    sleeves,
    warnings,
    errors,
    trace
  };
}

function countCandidateList(record: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value.length;
    }
  }
  return 0;
}

function firstCandidateArray(record: Record<string, unknown>, keys: string[]): unknown[] {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value;
    }
  }
  return [];
}

function extractStringRefs(items: unknown[], preferredKeys: string[]): string[] {
  const refs: string[] = [];
  for (const item of items) {
    if (typeof item === "string" && item.trim().length > 0) {
      refs.push(item.trim());
      continue;
    }
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }
    const record = item as Record<string, unknown>;
    for (const key of preferredKeys) {
      const value = record[key];
      if (typeof value === "string" && value.trim().length > 0) {
        refs.push(value.trim());
        break;
      }
    }
  }
  return refs;
}

function mergeRefLists(...lists: string[][]): string[] {
  return Array.from(new Set(lists.flat().filter((value) => value.trim().length > 0)));
}

const STEP7_ALLOWED_INDEXES = {
  neoblock: "AI/MANIFESTS/neoblock-library-index.json",
  moltBlock: "AI/MANIFESTS/molt-block-library-index.json",
  neostack: "AI/MANIFESTS/neostack-library-index.json",
  gate: "AI/MANIFESTS/gate-library-index.json"
} as const;

function isPathUnderRoot(candidatePath: string, root: string): boolean {
  const normalizedCandidate = path.resolve(candidatePath);
  const normalizedRoot = path.resolve(root);
  return normalizedCandidate.startsWith(normalizedRoot + path.sep) || normalizedCandidate === normalizedRoot;
}

function normalizeRelativeDisplayPath(absolutePath: string, libraryRoot: string): string {
  return path.relative(libraryRoot, absolutePath).replace(/\\/g, "/");
}

function collectIndexEntries(parsed: unknown): Record<string, unknown>[] | null {
  if (Array.isArray(parsed)) {
    const entries = parsed.filter((entry) => entry && typeof entry === "object" && !Array.isArray(entry)) as Record<string, unknown>[];
    return entries.length === parsed.length ? entries : null;
  }
  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const record = parsed as Record<string, unknown>;
  for (const key of ["items", "neoblocks", "blocks", "entries", "catalog"]) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value.filter((entry) => entry && typeof entry === "object" && !Array.isArray(entry)) as Record<string, unknown>[];
    }
  }

  const values = Object.values(record);
  if (values.length > 0 && values.every((value) => value && typeof value === "object" && !Array.isArray(value))) {
    return values as Record<string, unknown>[];
  }

  return null;
}

function matchIndexEntry(entry: Record<string, unknown>, rawRef: string): { matched: boolean; aliasMatch: boolean; candidateId?: string; candidatePath?: string } {
  const candidateId = normalizeString(entry.id) ?? normalizeString(entry.block_id) ?? normalizeString(entry.neoblock_id) ?? normalizeString(entry.ref) ?? normalizeString(entry.name);
  const candidatePath = normalizeString(entry.path) ?? normalizeString(entry.source_path) ?? normalizeString(entry.file) ?? normalizeString(entry.file_path);
  const exactFields = [entry.id, entry.block_id, entry.neoblock_id, entry.ref, entry.name].map((value) => normalizeString(value)).filter(Boolean) as string[];
  if (exactFields.includes(rawRef)) {
    return { matched: true, aliasMatch: false, candidateId, candidatePath };
  }
  const lower = rawRef.toLowerCase();
  if (exactFields.some((value) => value.toLowerCase() === lower)) {
    return { matched: true, aliasMatch: true, candidateId, candidatePath };
  }
  return { matched: false, aliasMatch: false, candidateId, candidatePath };
}

const STEP8B_ALLOWED_TARGET_ROOT = path.join("AI", "NEOBLOCKS");
const STEP8B_FORBIDDEN_TARGET_SEGMENTS = [
  "archive",
  "backup",
  "backups",
  "plugin-backups",
  "artifacts",
  "artifact",
  "staging",
  "publish-stage",
  "release-clean",
  "resleever",
  "umg_envoy_resleever",
  "vendor",
  "human",
  "blocks"
] as const;

function validateStep8BTargetPath(libraryRoot: string, candidatePath: string): string {
  const allowedRoot = path.join(libraryRoot, STEP8B_ALLOWED_TARGET_ROOT);
  const resolvedPath = path.resolve(libraryRoot, candidatePath);
  const parts = resolvedPath.split(/[\\/]+/).map((segment) => segment.trim().toLowerCase()).filter(Boolean);
  if (parts.some((segment) => STEP8B_FORBIDDEN_TARGET_SEGMENTS.includes(segment as (typeof STEP8B_FORBIDDEN_TARGET_SEGMENTS)[number]))) {
    throw new Error("HOLD_SHALLOW_LOAD_TARGET_PATH_FORBIDDEN_STEP8B");
  }
  if (!(resolvedPath.startsWith(allowedRoot + path.sep) || resolvedPath === allowedRoot)) {
    throw new Error("HOLD_SHALLOW_LOAD_TARGET_PATH_OUTSIDE_ALLOWLIST_STEP8B");
  }
  return resolvedPath;
}

function loadTargetJsonShallow(resolvedPath: string): Record<string, unknown> {
  return readJsonFileSafe(resolvedPath) as Record<string, unknown>;
}

function summarizeLoadedNeoBlockTarget(payload: Record<string, unknown>): RealLibraryShallowLoadedTargetSummary {
  const identity = (payload.identity && typeof payload.identity === "object" && !Array.isArray(payload.identity)) ? payload.identity as Record<string, unknown> : {};
  const metadata = (payload.metadata && typeof payload.metadata === "object" && !Array.isArray(payload.metadata)) ? payload.metadata as Record<string, unknown> : {};
  const provenance = (payload.provenance && typeof payload.provenance === "object" && !Array.isArray(payload.provenance)) ? payload.provenance as Record<string, unknown> : {};
  const neoblockList = Array.isArray(payload.neoblocks) ? payload.neoblocks : [];
  const firstNeoBlock = neoblockList.find((entry) => entry && typeof entry === "object" && !Array.isArray(entry)) as Record<string, unknown> | undefined;
  const neoblock = (payload.neoblock && typeof payload.neoblock === "object" && !Array.isArray(payload.neoblock)) ? payload.neoblock as Record<string, unknown> : (firstNeoBlock ?? {});
  const content = normalizeString(neoblock.content);
  return {
    topLevelKeys: Object.keys(payload).sort(),
    identityKeys: Object.keys(identity).sort(),
    metadataKeys: Object.keys(metadata).sort(),
    neoblockKeys: Object.keys(neoblock).sort(),
    provenanceKeys: Object.keys(provenance).sort(),
    id: normalizeString(identity.id) ?? normalizeString(neoblock.id),
    kind: normalizeString(identity.kind) ?? normalizeString(neoblock.kind),
    moltType: normalizeString(identity.molt_type) ?? normalizeString(neoblock.molt_type),
    status: normalizeString(metadata.status) ?? normalizeString(neoblock.status),
    contentPreview: content ? content.slice(0, 160) : undefined
  };
}

function resolveApprovedTargetForShallowLoad(
  summary: RealLibrarySleeveInspectSummary,
  shallowLoadTargetRef: string
): RealLibraryTargetAvailabilityRecord {
  if (!shallowLoadTargetRef || shallowLoadTargetRef.trim().length === 0) {
    throw new Error("HOLD_SHALLOW_LOAD_TARGET_REF_REQUIRED_STEP8B");
  }
  const classified = summary.referenceClassification.references.find((ref) => ref.rawRef === shallowLoadTargetRef);
  if (!classified) {
    throw new Error("HOLD_SHALLOW_LOAD_TARGET_NOT_CLASSIFIED_STEP8B");
  }
  if (classified.inferredKind !== "neoblock") {
    throw new Error("HOLD_SHALLOW_LOAD_TARGET_KIND_UNSUPPORTED_STEP8B");
  }
  const availability = summary.targetAvailability.references.find((ref) => ref.rawRef === shallowLoadTargetRef);
  if (!availability) {
    throw new Error("HOLD_SHALLOW_LOAD_TARGET_NOT_AVAILABLE_STEP8B");
  }
  if (availability.resolutionStatus !== "TARGET_INDEX_ENTRY_FOUND_PATH_ALLOWED_NOT_LOADED_STEP7" || !availability.candidatePath || availability.candidatePathAllowed !== true) {
    throw new Error("HOLD_SHALLOW_LOAD_TARGET_NOT_AVAILABLE_STEP8B");
  }
  return availability;
}

function buildStep8CRuntimeSummary(
  summary: RealLibrarySleeveInspectSummary,
  libraryRoot: string,
  sleeveId: string
): RealLibraryRuntimeSummary | { performed: false; reason: "targetShallowLoad_not_successful" } {
  if (!summary.targetShallowLoad || summary.targetShallowLoad.performed !== true || summary.targetShallowLoad.loadedRef !== "primary.sample") {
    return {
      performed: false,
      reason: "targetShallowLoad_not_successful"
    };
  }

  const explicitReferenceCount = summary.explicitReferences.neoblocks.length + summary.explicitReferences.neostacks.length + summary.explicitReferences.moltBlocks.length + summary.explicitReferences.tools.length + summary.explicitReferences.gates.length + summary.explicitReferences.triggers.length;
  const classifiedReferenceCount = summary.referenceClassification.references.length;
  const targetAvailabilityCount = summary.targetAvailability.references.length;
  const targetAvailabilityFound = summary.targetAvailability.counts.found;
  const targetAvailabilityAllowed = summary.targetAvailability.counts.allowedPath;
  const shallowLoadedTargets = [{
    ref: summary.targetShallowLoad.loadedRef,
    kind: summary.targetShallowLoad.summary.kind ?? summary.targetShallowLoad.inferredKind,
    moltType: summary.targetShallowLoad.summary.moltType,
    status: summary.targetShallowLoad.summary.status,
    loadStatus: summary.targetShallowLoad.status
  }];
  const loadedRefSet = new Set(shallowLoadedTargets.map((entry) => entry.ref));
  const notLoadedTargets = summary.referenceClassification.references
    .filter((entry) => entry.inferredKind === "neoblock" && !loadedRefSet.has(entry.rawRef))
    .map((entry) => entry.rawRef);

  return {
    performed: true,
    mode: "public_curated",
    libraryRoot,
    sleeveId,
    sleeveLoaded: true,
    explicitReferenceCount,
    classifiedReferenceCount,
    targetAvailabilityCount,
    targetAvailabilityFound,
    targetAvailabilityAllowed,
    shallowLoadedTargetCount: shallowLoadedTargets.length,
    shallowLoadedTargets,
    notLoadedTargetCount: notLoadedTargets.length,
    notLoadedTargets,
    runtimeBoundary: {
      recursiveResolution: "not_performed_step8c",
      execution: "not_performed",
      directSourceMode: "not_enabled",
      archiveFallback: "not_allowed",
      humanLaneMachineLoading: "not_allowed",
      resleeverLoading: "not_allowed"
    },
    nextCapability: "single_target_expansion_or_runtime_dashboard_projection"
  };
}

function buildTargetAvailability(
  classification: RealLibraryReferenceClassificationMap,
  libraryRoot: string
): RealLibraryTargetAvailabilityMap {
  const indexesLoaded: RealLibraryTargetAvailabilityIndexDiagnostic[] = [];
  const indexesMissing: RealLibraryTargetAvailabilityIndexDiagnostic[] = [];
  const indexesFailed: RealLibraryTargetAvailabilityIndexDiagnostic[] = [];
  const parsedIndexes = new Map<string, Record<string, unknown>[] | null>();
  const indexFailureKind = new Map<string, "missing" | "read_failed" | "parse_failed" | "shape_unknown">();

  for (const relativeIndexPath of Object.values(STEP7_ALLOWED_INDEXES)) {
    const absoluteIndexPath = path.join(libraryRoot, ...relativeIndexPath.split("/"));
    if (!fs.existsSync(absoluteIndexPath)) {
      indexesMissing.push({
        path: relativeIndexPath,
        exists: false,
        parseStatus: "MISSING",
        shapeStatus: "NOT_APPLICABLE",
        entryCount: 0,
      });
      indexFailureKind.set(relativeIndexPath, "missing");
      continue;
    }

    let parsed: unknown;
    try {
      parsed = readJsonFileSafe(absoluteIndexPath);
    } catch (error) {
      indexesFailed.push({
        path: relativeIndexPath,
        exists: true,
        parseStatus: "PARSE_FAILED",
        shapeStatus: "NOT_APPLICABLE",
        entryCount: 0,
        notes: [error instanceof Error ? error.message : String(error)]
      });
      parsedIndexes.set(relativeIndexPath, null);
      indexFailureKind.set(relativeIndexPath, "parse_failed");
      continue;
    }

    const entries = collectIndexEntries(parsed);
    if (!entries) {
      indexesFailed.push({
        path: relativeIndexPath,
        exists: true,
        parseStatus: "PARSED_JSON",
        shapeStatus: "SHAPE_UNKNOWN",
        entryCount: 0,
      });
      parsedIndexes.set(relativeIndexPath, null);
      indexFailureKind.set(relativeIndexPath, "shape_unknown");
      continue;
    }

    indexesLoaded.push({
      path: relativeIndexPath,
      exists: true,
      parseStatus: "PARSED_JSON",
      shapeStatus: "NORMALIZED",
      entryCount: entries.length,
    });
    parsedIndexes.set(relativeIndexPath, entries);
  }

  const references: RealLibraryTargetAvailabilityRecord[] = classification.references.map((ref) => {
    const warnings = [...ref.warnings];
    const errors = [...ref.errors];
    const lookupIndexes: string[] = [];

    if (ref.inferredKind === "unknown" || ref.inferredKind === "malformed") {
      return {
        rawRef: ref.rawRef,
        inferredKind: ref.inferredKind,
        moltHint: ref.moltHint,
        lookupIndexes,
        indexEntryFound: false,
        targetFileLoaded: false,
        resolutionStatus: "TARGET_AVAILABILITY_UNKNOWN_STEP7",
        warnings,
        errors
      };
    }

    const indexPath = ref.inferredKind === "neoblock"
      ? STEP7_ALLOWED_INDEXES.neoblock
      : ref.inferredKind === "moltBlock"
        ? STEP7_ALLOWED_INDEXES.moltBlock
        : ref.inferredKind === "neostack"
          ? STEP7_ALLOWED_INDEXES.neostack
          : ref.inferredKind === "gate"
            ? STEP7_ALLOWED_INDEXES.gate
            : undefined;

    if (!indexPath) {
      return {
        rawRef: ref.rawRef,
        inferredKind: ref.inferredKind,
        moltHint: ref.moltHint,
        lookupIndexes,
        indexEntryFound: false,
        targetFileLoaded: false,
        resolutionStatus: "TARGET_KIND_UNSUPPORTED_STEP7",
        warnings,
        errors
      };
    }

    lookupIndexes.push(indexPath);

    const failureKind = indexFailureKind.get(indexPath);
    if (failureKind === "missing") {
      return {
        rawRef: ref.rawRef,
        inferredKind: ref.inferredKind,
        moltHint: ref.moltHint,
        lookupIndexes,
        indexEntryFound: false,
        targetFileLoaded: false,
        resolutionStatus: "TARGET_LOOKUP_INDEX_MISSING_STEP7",
        warnings,
        errors
      };
    }

    if (failureKind === "parse_failed") {
      return {
        rawRef: ref.rawRef,
        inferredKind: ref.inferredKind,
        moltHint: ref.moltHint,
        lookupIndexes,
        indexEntryFound: false,
        targetFileLoaded: false,
        resolutionStatus: "TARGET_LOOKUP_INDEX_PARSE_FAILED_STEP7",
        warnings,
        errors
      };
    }

    if (failureKind === "shape_unknown") {
      return {
        rawRef: ref.rawRef,
        inferredKind: ref.inferredKind,
        moltHint: ref.moltHint,
        lookupIndexes,
        indexEntryFound: false,
        targetFileLoaded: false,
        resolutionStatus: "TARGET_LOOKUP_INDEX_SHAPE_UNKNOWN_STEP7",
        warnings,
        errors
      };
    }

    const entries = parsedIndexes.get(indexPath) ?? [];
    let matchedEntry: { candidateId?: string; candidatePath?: string; aliasMatch: boolean } | undefined;
    for (const entry of entries) {
      const match = matchIndexEntry(entry, ref.rawRef);
      if (match.matched) {
        matchedEntry = match;
        break;
      }
    }

    if (!matchedEntry) {
      return {
        rawRef: ref.rawRef,
        inferredKind: ref.inferredKind,
        moltHint: ref.moltHint,
        lookupIndexes,
        indexEntryFound: false,
        targetFileLoaded: false,
        resolutionStatus: "TARGET_INDEX_ENTRY_NOT_FOUND_STEP7",
        warnings,
        errors
      };
    }

    if (matchedEntry.aliasMatch) {
      warnings.push("ALIAS_MATCH_USED_STEP7");
    }

    const candidatePath = matchedEntry.candidatePath;
    if (!candidatePath) {
      return {
        rawRef: ref.rawRef,
        inferredKind: ref.inferredKind,
        moltHint: ref.moltHint,
        lookupIndexes,
        indexEntryFound: true,
        candidateId: matchedEntry.candidateId,
        targetFileLoaded: false,
        resolutionStatus: "TARGET_INDEX_ENTRY_FOUND_NOT_LOADED_STEP7",
        warnings,
        errors
      };
    }

    const absoluteCandidatePath = path.resolve(libraryRoot, candidatePath);
    const candidatePathAllowed = isPathUnderRoot(absoluteCandidatePath, libraryRoot) && !hasForbiddenSegment(absoluteCandidatePath) && !/artifacts|vendor/i.test(absoluteCandidatePath);

    if (!candidatePathAllowed) {
      return {
        rawRef: ref.rawRef,
        inferredKind: ref.inferredKind,
        moltHint: ref.moltHint,
        lookupIndexes,
        indexEntryFound: true,
        candidateId: matchedEntry.candidateId,
        candidatePath: normalizeRelativeDisplayPath(absoluteCandidatePath, libraryRoot),
        candidatePathAllowed: false,
        targetFileLoaded: false,
        resolutionStatus: "TARGET_INDEX_ENTRY_FOUND_PATH_FORBIDDEN_NOT_LOADED_STEP7",
        warnings,
        errors
      };
    }

    return {
      rawRef: ref.rawRef,
      inferredKind: ref.inferredKind,
      moltHint: ref.moltHint,
      lookupIndexes,
      indexEntryFound: true,
      candidateId: matchedEntry.candidateId,
      candidatePath: normalizeRelativeDisplayPath(absoluteCandidatePath, libraryRoot),
      candidatePathAllowed: true,
      targetFileLoaded: false,
      resolutionStatus: "TARGET_INDEX_ENTRY_FOUND_PATH_ALLOWED_NOT_LOADED_STEP7",
      warnings,
      errors
    };
  });

  return {
    performed: true,
    mode: "public_curated",
    targetFileLoads: "not_performed_step7",
    recursiveResolution: "not_performed_step7",
    execution: "not_performed",
    indexesLoaded,
    indexesMissing,
    indexesFailed,
    counts: {
      total: references.length,
      found: references.filter((ref) => ref.indexEntryFound).length,
      notFound: references.filter((ref) => ref.resolutionStatus === "TARGET_INDEX_ENTRY_NOT_FOUND_STEP7").length,
      allowedPath: references.filter((ref) => ref.resolutionStatus === "TARGET_INDEX_ENTRY_FOUND_PATH_ALLOWED_NOT_LOADED_STEP7").length,
      forbiddenPath: references.filter((ref) => ref.resolutionStatus === "TARGET_INDEX_ENTRY_FOUND_PATH_FORBIDDEN_NOT_LOADED_STEP7").length,
      missing: references.filter((ref) => ref.resolutionStatus === "TARGET_LOOKUP_INDEX_MISSING_STEP7").length,
      unsupported: references.filter((ref) => ref.resolutionStatus === "TARGET_KIND_UNSUPPORTED_STEP7").length,
      unknown: references.filter((ref) => ref.resolutionStatus === "TARGET_AVAILABILITY_UNKNOWN_STEP7").length,
      parseFailed: references.filter((ref) => ref.resolutionStatus === "TARGET_LOOKUP_INDEX_PARSE_FAILED_STEP7").length,
      shapeUnknown: references.filter((ref) => ref.resolutionStatus === "TARGET_LOOKUP_INDEX_SHAPE_UNKNOWN_STEP7").length,
    },
    references
  };
}

function classifyExplicitReferences(explicitReferences: RealLibrarySleeveInspectSummary["explicitReferences"]): RealLibraryReferenceClassificationMap {
  const references: RealLibraryReferenceClassificationRecord[] = [];
  const seen = new Map<string, string>();

  const knownNeoblockHints = new Set(["primary", "directive", "instruction", "subject", "philosophy", "blueprint", "trigger"]);

  const pushBucket = (
    refs: string[],
    sourceField: string,
    declaredBucket: RealLibraryReferenceClassificationRecord["declaredBucket"]
  ) => {
    for (const raw of refs) {
      const rawRef = typeof raw === "string" ? raw.trim() : "";
      const warnings: string[] = [];
      const errors: string[] = [];

      if (rawRef.length === 0) {
        references.push({
          rawRef,
          sourceField,
          declaredBucket,
          inferredKind: "malformed",
          normalizedRef: rawRef,
          resolutionStatus: "MALFORMED_REFERENCE_NOT_RESOLVED_STEP6",
          targetLookupMode: "not_performed",
          warnings,
          errors: ["empty reference string"],
        });
        continue;
      }

      const normalizedRef = rawRef;
      const parts = normalizedRef.split(".");
      const namespace = parts.length === 2 && parts[0] && parts[1] ? parts[0] : undefined;
      const name = parts.length === 2 && parts[0] && parts[1] ? parts[1] : undefined;
      const duplicateOf = seen.get(normalizedRef);

      let inferredKind: RealLibraryReferenceInferredKind = declaredBucket;
      let resolutionStatus: RealLibraryReferenceClassificationStatus = "CLASSIFIED_NOT_RESOLVED_STEP6";
      let moltHint: string | undefined;

      if (duplicateOf) {
        inferredKind = declaredBucket;
        resolutionStatus = "DUPLICATE_REFERENCE_NOT_RESOLVED_STEP6";
        warnings.push(`duplicate reference of ${duplicateOf}`);
      } else if (!namespace || !name) {
        inferredKind = "malformed";
        resolutionStatus = "MALFORMED_REFERENCE_NOT_RESOLVED_STEP6";
        errors.push("reference must use namespace.name shape");
      } else if (declaredBucket === "neoblock") {
        if (knownNeoblockHints.has(namespace)) {
          inferredKind = "neoblock";
          moltHint = namespace;
        } else {
          inferredKind = "unknown";
          resolutionStatus = "CLASSIFIED_UNKNOWN_NOT_RESOLVED_STEP6";
          warnings.push(`unrecognized neoblock namespace: ${namespace}`);
        }
      } else {
        inferredKind = declaredBucket;
      }

      const record: RealLibraryReferenceClassificationRecord = {
        rawRef,
        sourceField,
        declaredBucket,
        inferredKind,
        moltHint,
        normalizedRef,
        namespace,
        name,
        resolutionStatus,
        targetLookupMode: "not_performed",
        duplicateOf,
        warnings,
        errors,
      };

      references.push(record);
      if (!duplicateOf) {
        seen.set(normalizedRef, normalizedRef);
      }
    }
  };

  pushBucket(explicitReferences.neoblocks, "block_refs", "neoblock");
  pushBucket(explicitReferences.neostacks, "neostacks", "neostack");
  pushBucket(explicitReferences.moltBlocks, "moltBlocks", "moltBlock");
  pushBucket(explicitReferences.tools, "tool_requests", "tool");
  pushBucket(explicitReferences.gates, "gate_refs", "gate");
  pushBucket(explicitReferences.triggers, "trigger_refs", "trigger");

  const counts = {
    total: references.length,
    neoblock: references.filter((ref) => ref.inferredKind === "neoblock" && ref.resolutionStatus !== "DUPLICATE_REFERENCE_NOT_RESOLVED_STEP6").length,
    neostack: references.filter((ref) => ref.inferredKind === "neostack" && ref.resolutionStatus !== "DUPLICATE_REFERENCE_NOT_RESOLVED_STEP6").length,
    moltBlock: references.filter((ref) => ref.inferredKind === "moltBlock" && ref.resolutionStatus !== "DUPLICATE_REFERENCE_NOT_RESOLVED_STEP6").length,
    tool: references.filter((ref) => ref.inferredKind === "tool" && ref.resolutionStatus !== "DUPLICATE_REFERENCE_NOT_RESOLVED_STEP6").length,
    gate: references.filter((ref) => ref.inferredKind === "gate" && ref.resolutionStatus !== "DUPLICATE_REFERENCE_NOT_RESOLVED_STEP6").length,
    trigger: references.filter((ref) => ref.inferredKind === "trigger" && ref.resolutionStatus !== "DUPLICATE_REFERENCE_NOT_RESOLVED_STEP6").length,
    unknown: references.filter((ref) => ref.inferredKind === "unknown").length,
    malformed: references.filter((ref) => ref.inferredKind === "malformed").length,
    duplicate: references.filter((ref) => ref.resolutionStatus === "DUPLICATE_REFERENCE_NOT_RESOLVED_STEP6").length,
  };

  return {
    performed: true,
    recursiveResolution: "not_performed_step6",
    targetFileLoads: "not_performed",
    execution: "not_performed",
    directSourceMode: "not_implemented",
    publicCuratedPolicy: "strict",
    counts,
    references,
  };
}

function summarizeSleevePayload(
  payload: Record<string, unknown>,
  sleeve: RealLibraryCatalogSleeveEntry
): RealLibrarySleeveInspectSummary {
  const metadata = (payload.metadata && typeof payload.metadata === "object" && !Array.isArray(payload.metadata)) ? payload.metadata as Record<string, unknown> : {};
  const sleeveObject = (payload.sleeve && typeof payload.sleeve === "object" && !Array.isArray(payload.sleeve)) ? payload.sleeve as Record<string, unknown> : {};

  const neostacks = mergeRefLists(
    extractStringRefs(firstCandidateArray(payload, ["neostacks", "neoStacks", "stacks", "stack_refs", "stackRefs"]), ["stack_id", "id", "ref", "name"]),
    extractStringRefs(firstCandidateArray(sleeveObject, ["neostacks", "neoStacks", "stacks", "stack_refs", "stackRefs"]), ["stack_id", "id", "ref", "name"])
  );
  const neoblocks = mergeRefLists(
    extractStringRefs(firstCandidateArray(payload, ["neoblocks", "neoBlocks", "blocks", "block_refs", "blockRefs"]), ["block_id", "id", "ref", "name"]),
    extractStringRefs(firstCandidateArray(sleeveObject, ["neoblocks", "neoBlocks", "blocks", "block_refs", "blockRefs"]), ["block_id", "id", "ref", "name"])
  );
  const moltBlocks = mergeRefLists(
    extractStringRefs(firstCandidateArray(payload, ["moltBlocks", "molt_blocks", "molt", "molt_refs", "moltRefs"]), ["molt_block_id", "block_id", "id", "ref", "name"]),
    extractStringRefs(firstCandidateArray(sleeveObject, ["moltBlocks", "molt_blocks", "molt", "molt_refs", "moltRefs"]), ["molt_block_id", "block_id", "id", "ref", "name"])
  );
  const tools = mergeRefLists(
    extractStringRefs(firstCandidateArray(payload, ["tools", "tool_requests", "toolRequests"]), ["name", "tool", "tool_id", "id", "ref"]),
    extractStringRefs(firstCandidateArray(sleeveObject, ["tools", "tool_requests", "toolRequests"]), ["name", "tool", "tool_id", "id", "ref"])
  );
  const gates = mergeRefLists(
    extractStringRefs(firstCandidateArray(payload, ["gates", "gate_refs", "gateRefs"]), ["gate_id", "id", "ref", "name", "state"]),
    extractStringRefs(firstCandidateArray(sleeveObject, ["gates", "gate_refs", "gateRefs"]), ["gate_id", "id", "ref", "name", "state"])
  );
  const triggers = mergeRefLists(
    extractStringRefs(firstCandidateArray(payload, ["triggers", "trigger_refs", "triggerRefs"]), ["trigger_id", "id", "ref", "name"]),
    extractStringRefs(firstCandidateArray(sleeveObject, ["triggers", "trigger_refs", "triggerRefs"]), ["trigger_id", "id", "ref", "name"])
  );

  const explicitReferences = {
    neostacks,
    neoblocks,
    moltBlocks,
    tools,
    gates,
    triggers
  };

  const referenceClassification = classifyExplicitReferences(explicitReferences);

  return {
    id: normalizeString(payload.id) ?? normalizeString(payload.sleeve_id) ?? normalizeString((payload.identity as Record<string, unknown> | undefined)?.id) ?? sleeve.id,
    name: normalizeString(payload.name) ?? normalizeString((payload.identity as Record<string, unknown> | undefined)?.name) ?? sleeve.name,
    title: normalizeString(payload.title) ?? normalizeString(metadata.title) ?? sleeve.title,
    version: normalizeString(payload.version) ?? normalizeString(metadata.version) ?? normalizeString((payload.identity as Record<string, unknown> | undefined)?.version),
    status: normalizeString(payload.status) ?? sleeve.status,
    topLevelKeys: Object.keys(payload).sort(),
    metadataKeys: Object.keys(metadata).sort(),
    sleeveKeys: Object.keys(sleeveObject).sort(),
    explicitReferences,
    referenceClassification,
    targetAvailability: {
      performed: true,
      mode: "public_curated",
      targetFileLoads: "not_performed_step7",
      recursiveResolution: "not_performed_step7",
      execution: "not_performed",
      indexesLoaded: [],
      indexesMissing: [],
      indexesFailed: [],
      counts: {
        total: 0,
        found: 0,
        notFound: 0,
        allowedPath: 0,
        forbiddenPath: 0,
        missing: 0,
        unsupported: 0,
        unknown: 0,
        parseFailed: 0,
        shapeUnknown: 0
      },
      references: []
    },
    referenceCounts: {
      neostacks: neostacks.length,
      neoblocks: neoblocks.length,
      moltBlocks: moltBlocks.length,
      tools: tools.length,
      gates: gates.length,
      triggers: triggers.length
    }
  };
}

export function inspectRealLibraryPublicCuratedSleeve(input: RealLibrarySleeveInspectInput): RealLibrarySleeveInspectResult {
  const trace: RealLibrarySleeveInspectTrace = {
    sourcePathPolicy: "public_curated_allowlist_only",
    recursiveResolution: "not_performed_step7",
    targetFileLoads: "not_performed_step7",
    execution: "not_performed",
    directSourceMode: "not_implemented",
    publicCuratedPolicy: "strict"
  };
  const sleeveId = input.sleeveId ?? input.id;
  const libraryRoot = input.libraryRoot ?? DEFAULT_LIBRARY_ROOT;
  const mode = input.mode ?? "public_curated";
  const normalizedRoot = normalizeInputRoot(libraryRoot);

  if (!sleeveId || sleeveId.trim().length === 0) {
    return buildInspectFailure(input, "HOLD_SLEEVE_ID_REQUIRED", "sleeveId is required for curated sleeve inspection.", trace, normalizedRoot);
  }

  const catalogResult = resolveRealLibraryPublicCurated({ libraryRoot, mode });
  trace.catalogLoaded = catalogResult.catalogLoaded;
  trace.parseCheck = catalogResult.trace.parseCheck;

  if (!catalogResult.ok) {
    return {
      ok: false,
      mode,
      libraryRoot: catalogResult.libraryRoot,
      sleeveId,
      loaded: false,
      summary: null,
      warnings: catalogResult.warnings,
      errors: catalogResult.errors,
      trace
    };
  }

  const match = catalogResult.sleeves.find((sleeve) => sleeve.id === sleeveId || sleeve.name === sleeveId || sleeve.title === sleeveId);
  if (!match) {
    trace.sleeveMatched = false;
    return buildInspectFailure(input, "HOLD_SLEEVE_NOT_FOUND", `Curated sleeve not found: ${sleeveId}`, trace, catalogResult.libraryRoot);
  }
  trace.sleeveMatched = true;

  if (match.resolutionStatus !== "LOADABLE_PUBLIC_CURATED") {
    const code = match.resolutionStatus === "REJECTED_FORBIDDEN_SOURCE_PATH"
      ? "HOLD_SLEEVE_SOURCE_PATH_FORBIDDEN"
      : match.resolutionStatus === "NOT_LOADABLE_OUTSIDE_PUBLIC_CURATED_ALLOWLIST"
        ? "HOLD_SLEEVE_SOURCE_PATH_OUTSIDE_ALLOWLIST"
        : "HOLD_SLEEVE_NOT_LOADABLE_PUBLIC_CURATED";
    return buildInspectFailure(input, code, `Sleeve is not safely loadable for public_curated inspection: ${sleeveId}`, trace, catalogResult.libraryRoot, match);
  }

  if (!match.resolvedSourcePath) {
    return buildInspectFailure(input, "HOLD_SLEEVE_NOT_LOADABLE_PUBLIC_CURATED", `Sleeve resolved path missing for: ${sleeveId}`, trace, catalogResult.libraryRoot, match);
  }

  const allowlistRoot = path.join(catalogResult.libraryRoot, PUBLIC_CURATED_ALLOWLIST);
  if (!(match.resolvedSourcePath.startsWith(allowlistRoot) || match.resolvedSourcePath === allowlistRoot.slice(0, -1))) {
    return buildInspectFailure(input, "HOLD_SLEEVE_SOURCE_PATH_OUTSIDE_ALLOWLIST", `Sleeve path outside allowlist: ${match.resolvedSourcePath}`, trace, catalogResult.libraryRoot, match);
  }

  if (hasForbiddenSegment(match.resolvedSourcePath)) {
    return buildInspectFailure(input, "HOLD_SLEEVE_SOURCE_PATH_FORBIDDEN", `Sleeve path forbidden: ${match.resolvedSourcePath}`, trace, catalogResult.libraryRoot, match);
  }

  if (!fs.existsSync(match.resolvedSourcePath)) {
    return buildInspectFailure(input, "HOLD_SLEEVE_FILE_MISSING", `Sleeve file missing: ${match.resolvedSourcePath}`, trace, catalogResult.libraryRoot, match);
  }

  trace.fileLoaded = true;

  let parsed: unknown;
  try {
    parsed = readJsonFileSafe(match.resolvedSourcePath);
  } catch (error) {
    trace.parseCheck = "failed";
    const message = error instanceof Error ? error.message : String(error);
    return buildInspectFailure(input, "HOLD_SLEEVE_PARSE_FAILED", `Failed to parse sleeve JSON: ${message}`, trace, catalogResult.libraryRoot, match);
  }
  trace.parseCheck = "passed";

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return buildInspectFailure(input, "HOLD_SLEEVE_SHAPE_UNKNOWN", `Sleeve JSON shape unknown for: ${sleeveId}`, trace, catalogResult.libraryRoot, match);
  }

  const payload = parsed as Record<string, unknown>;
  const summaryBase = summarizeSleevePayload(payload, match);
  const summary: RealLibrarySleeveInspectSummary = {
    ...summaryBase,
    targetAvailability: buildTargetAvailability(summaryBase.referenceClassification, catalogResult.libraryRoot)
  };

  if (input.shallowLoadTargetRef) {
    try {
      const availability = resolveApprovedTargetForShallowLoad(summary, input.shallowLoadTargetRef);
      const resolvedPath = validateStep8BTargetPath(catalogResult.libraryRoot, availability.candidatePath!);
      if (!fs.existsSync(resolvedPath)) {
        return buildInspectFailure(input, "HOLD_SHALLOW_LOAD_TARGET_FILE_MISSING_STEP8B", `Shallow-load target file missing: ${availability.candidatePath}`, trace, catalogResult.libraryRoot, match);
      }
      const parsedTarget = loadTargetJsonShallow(resolvedPath);
      if (!parsedTarget || typeof parsedTarget !== "object" || Array.isArray(parsedTarget)) {
        return buildInspectFailure(input, "HOLD_SHALLOW_LOAD_TARGET_PARSE_FAILED_STEP8B", `Shallow-load target shape invalid: ${availability.candidatePath}`, trace, catalogResult.libraryRoot, match);
      }
      summary.targetShallowLoad = {
        performed: true,
        requestedRef: input.shallowLoadTargetRef,
        loadedRef: availability.rawRef,
        inferredKind: "neoblock",
        candidatePath: availability.candidatePath!,
        resolvedPathAllowed: true,
        targetFileLoaded: true,
        targetParseStatus: "PARSED_JSON",
        status: "SHALLOW_TARGET_LOADED_STEP8B",
        recursiveResolution: "RECURSIVE_RESOLUTION_NOT_PERFORMED_STEP8B",
        execution: "EXECUTION_NOT_PERFORMED_STEP8B",
        summary: summarizeLoadedNeoBlockTarget(parsedTarget as Record<string, unknown>),
        warnings: [],
        errors: []
      };
      summary.runtimeSummary = buildStep8CRuntimeSummary(summary, catalogResult.libraryRoot, match.id);
    } catch (error) {
      const code = error instanceof Error ? error.message : String(error);
      if (code === "HOLD_SHALLOW_LOAD_TARGET_PATH_FORBIDDEN_STEP8B") {
        return buildInspectFailure(input, "HOLD_SHALLOW_LOAD_TARGET_PATH_FORBIDDEN_STEP8B", `Shallow-load target path forbidden: ${input.shallowLoadTargetRef}`, trace, catalogResult.libraryRoot, match);
      }
      if (code === "HOLD_SHALLOW_LOAD_TARGET_PATH_OUTSIDE_ALLOWLIST_STEP8B") {
        return buildInspectFailure(input, "HOLD_SHALLOW_LOAD_TARGET_PATH_OUTSIDE_ALLOWLIST_STEP8B", `Shallow-load target path outside allowlist: ${input.shallowLoadTargetRef}`, trace, catalogResult.libraryRoot, match);
      }
      if (code === "HOLD_SHALLOW_LOAD_TARGET_KIND_UNSUPPORTED_STEP8B") {
        return buildInspectFailure(input, "HOLD_SHALLOW_LOAD_TARGET_KIND_UNSUPPORTED_STEP8B", `Unsupported shallow-load target kind: ${input.shallowLoadTargetRef}`, trace, catalogResult.libraryRoot, match);
      }
      if (code === "HOLD_SHALLOW_LOAD_TARGET_REF_REQUIRED_STEP8B") {
        return buildInspectFailure(input, "HOLD_SHALLOW_LOAD_TARGET_REF_REQUIRED_STEP8B", "shallowLoadTargetRef is required for Step 8B shallow load.", trace, catalogResult.libraryRoot, match);
      }
      if (code === "HOLD_SHALLOW_LOAD_TARGET_NOT_CLASSIFIED_STEP8B") {
        return buildInspectFailure(input, "HOLD_SHALLOW_LOAD_TARGET_NOT_CLASSIFIED_STEP8B", `Requested shallow-load target not classified: ${input.shallowLoadTargetRef}`, trace, catalogResult.libraryRoot, match);
      }
      if (code === "HOLD_SHALLOW_LOAD_TARGET_NOT_AVAILABLE_STEP8B") {
        return buildInspectFailure(input, "HOLD_SHALLOW_LOAD_TARGET_NOT_AVAILABLE_STEP8B", `Requested shallow-load target not available: ${input.shallowLoadTargetRef}`, trace, catalogResult.libraryRoot, match);
      }
      return buildInspectFailure(input, "HOLD_SHALLOW_LOAD_TARGET_PARSE_FAILED_STEP8B", `Failed to shallow-load target: ${input.shallowLoadTargetRef}`, trace, catalogResult.libraryRoot, match);
    }
  }

  return {
    ok: true,
    mode,
    libraryRoot: catalogResult.libraryRoot,
    sleeveId,
    sourcePath: match.sourcePath,
    resolvedSourcePath: match.resolvedSourcePath,
    resolutionStatus: match.resolutionStatus,
    loaded: true,
    summary,
    warnings: [...catalogResult.warnings, ...match.warnings],
    errors: [],
    trace
  };
}
