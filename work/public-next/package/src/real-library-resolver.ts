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
  | "HOLD_SOURCE_PATH_OUTSIDE_ALLOWLIST";

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
    sleeves: [],
    warnings: [],
    errors: [{ code, message }],
    trace
  };
}

function normalizeSleeveEntry(entry: unknown): RealLibraryCatalogSleeveEntry {
  const record = (entry && typeof entry === "object" && !Array.isArray(entry)) ? entry as Record<string, unknown> : {};
  return {
    id: typeof record.id === "string" ? record.id : undefined,
    name: typeof record.name === "string" ? record.name : undefined,
    status: typeof record.status === "string" ? record.status : undefined,
    source_path: typeof record.source_path === "string" ? record.source_path : undefined,
    notes: typeof record.notes === "string" ? record.notes : undefined
  };
}

export function resolveRealLibraryPublicCurated(input: RealLibraryResolverInput): RealLibraryResolverResult {
  const trace: RealLibraryResolverTrace = {};
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
    parsed = JSON.parse(fs.readFileSync(entrypointAbsolute, "utf8"));
  } catch (error) {
    trace.parseCheck = "failed";
    const message = error instanceof Error ? error.message : String(error);
    return buildFailure(input, "HOLD_CATALOG_PARSE_FAILED", `Failed to parse catalog JSON: ${message}`, trace, normalizedRoot);
  }
  trace.parseCheck = "passed";

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return buildFailure(input, "HOLD_CATALOG_SHAPE_UNKNOWN", "Catalog root must be an object.", trace, normalizedRoot);
  }

  const catalog = parsed as Record<string, unknown>;
  if (!Array.isArray(catalog.sleeves)) {
    return buildFailure(input, "HOLD_CATALOG_SHAPE_UNKNOWN", "Catalog missing sleeves array.", trace, normalizedRoot);
  }

  const allowlistRoot = path.join(normalizedRoot, PUBLIC_CURATED_ALLOWLIST);
  const warnings: string[] = [];
  const sleeves = catalog.sleeves.map(normalizeSleeveEntry);

  for (const sleeve of sleeves) {
    if (!sleeve.source_path) {
      continue;
    }
    const resolvedSourcePath = path.resolve(path.dirname(entrypointAbsolute), sleeve.source_path);
    const insideAllowlist = resolvedSourcePath.startsWith(allowlistRoot) || resolvedSourcePath === allowlistRoot.slice(0, -1);
    if (!insideAllowlist || hasForbiddenSegment(resolvedSourcePath)) {
      warnings.push(`source path not yet loadable in Step 1: ${sleeve.id ?? sleeve.name ?? sleeve.source_path}`);
    }
  }
  trace.allowlistCheck = "passed";

  return {
    ok: true,
    mode: "public_curated",
    libraryRoot: normalizedRoot,
    entrypoint: PUBLIC_CURATED_ENTRYPOINT.replace(/\\/g, "/"),
    catalogLoaded: true,
    sleeveCount: sleeves.length,
    sleeves,
    warnings,
    errors: [],
    trace
  };
}
