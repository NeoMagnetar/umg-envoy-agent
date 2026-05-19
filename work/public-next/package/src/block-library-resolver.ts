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
  | "HOLD_ENTRY_SHAPE_UNKNOWN";

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
  loadStatus: "not_loaded";
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
