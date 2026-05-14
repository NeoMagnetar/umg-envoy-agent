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
  | "HOLD_EXISTING_TOOL_SURFACE_REGRESSION";

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
    loadableSleeveCount: 0,
    rejectedSleeveCount: 0,
    unloadableSleeveCount: 0,
    sleeves: [],
    warnings: [],
    errors: [{ code, message }],
    trace
  };
}

function normalizeString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
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
    parsed = JSON.parse(fs.readFileSync(entrypointAbsolute, "utf8"));
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
