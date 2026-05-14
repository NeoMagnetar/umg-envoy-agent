import fs from "node:fs";
import path from "node:path";
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
];
const PUBLIC_CURATED_ENTRYPOINT = path.join("sleeves", "manifests", "catalog.json");
const PUBLIC_CURATED_ALLOWLIST = path.join("sleeves") + path.sep;
const DEFAULT_LIBRARY_ROOT = "C:\\.openclaw\\workspace\\UMG-Block-Library";
function normalizeInputRoot(libraryRoot) {
    return path.resolve(libraryRoot);
}
function hasForbiddenSegment(targetPath) {
    const parts = targetPath
        .split(/[\\/]+/)
        .map((segment) => segment.trim().toLowerCase())
        .filter(Boolean);
    return parts.some((segment) => FORBIDDEN_SEGMENTS.includes(segment));
}
function buildFailure(input, code, message, trace, normalizedRoot) {
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
function buildInspectFailure(input, code, message, trace, normalizedRoot, sleeveEntry) {
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
function normalizeString(value) {
    return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}
function classifySleeveEntry(entry, entrypointAbsolute, allowlistRoot) {
    const record = (entry && typeof entry === "object" && !Array.isArray(entry)) ? entry : {};
    const id = normalizeString(record.id);
    const name = normalizeString(record.name);
    const title = normalizeString(record.title) ?? name;
    const status = normalizeString(record.status);
    const sourcePath = normalizeString(record.source_path);
    const warnings = [];
    const errors = [];
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
export function resolveRealLibraryPublicCurated(input) {
    const trace = {
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
    let parsed;
    try {
        parsed = JSON.parse(fs.readFileSync(entrypointAbsolute, "utf8"));
    }
    catch (error) {
        trace.parseCheck = "failed";
        const message = error instanceof Error ? error.message : String(error);
        return buildFailure(input, "HOLD_CATALOG_PARSE_FAILED", `Failed to parse catalog JSON: ${message}`, trace, normalizedRoot);
    }
    trace.parseCheck = "passed";
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        trace.catalogShapeCheck = "failed";
        return buildFailure(input, "HOLD_CATALOG_SHAPE_UNKNOWN", "Catalog root must be an object.", trace, normalizedRoot);
    }
    const catalog = parsed;
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
function countCandidateList(record, keys) {
    for (const key of keys) {
        const value = record[key];
        if (Array.isArray(value)) {
            return value.length;
        }
    }
    return 0;
}
function summarizeSleevePayload(payload, sleeve) {
    const metadata = (payload.metadata && typeof payload.metadata === "object" && !Array.isArray(payload.metadata)) ? payload.metadata : {};
    const sleeveObject = (payload.sleeve && typeof payload.sleeve === "object" && !Array.isArray(payload.sleeve)) ? payload.sleeve : {};
    return {
        id: normalizeString(payload.id) ?? normalizeString(payload.sleeve_id) ?? normalizeString(payload.identity?.id) ?? sleeve.id,
        name: normalizeString(payload.name) ?? normalizeString(payload.identity?.name) ?? sleeve.name,
        title: normalizeString(payload.title) ?? normalizeString(metadata.title) ?? sleeve.title,
        version: normalizeString(payload.version) ?? normalizeString(metadata.version) ?? normalizeString(payload.identity?.version),
        status: normalizeString(payload.status) ?? sleeve.status,
        topLevelKeys: Object.keys(payload).sort(),
        metadataKeys: Object.keys(metadata).sort(),
        sleeveKeys: Object.keys(sleeveObject).sort(),
        referenceCounts: {
            neostacks: countCandidateList(sleeveObject, ["neostacks", "neoStacks", "stacks", "stack_refs", "stackRefs"]),
            neoblocks: countCandidateList(sleeveObject, ["neoblocks", "neoBlocks", "blocks", "block_refs", "blockRefs"]),
            moltBlocks: countCandidateList(sleeveObject, ["moltBlocks", "molt_blocks", "molt", "molt_refs", "moltRefs"]),
            tools: countCandidateList(sleeveObject, ["tools", "tool_requests", "toolRequests"]),
            gates: countCandidateList(sleeveObject, ["gates", "gate_refs", "gateRefs"]),
            triggers: countCandidateList(sleeveObject, ["triggers", "trigger_refs", "triggerRefs"])
        }
    };
}
export function inspectRealLibraryPublicCuratedSleeve(input) {
    const trace = {
        sourcePathPolicy: "public_curated_allowlist_only",
        recursiveResolution: "not_performed_step3"
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
    let parsed;
    try {
        parsed = JSON.parse(fs.readFileSync(match.resolvedSourcePath, "utf8"));
    }
    catch (error) {
        trace.parseCheck = "failed";
        const message = error instanceof Error ? error.message : String(error);
        return buildInspectFailure(input, "HOLD_SLEEVE_PARSE_FAILED", `Failed to parse sleeve JSON: ${message}`, trace, catalogResult.libraryRoot, match);
    }
    trace.parseCheck = "passed";
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return buildInspectFailure(input, "HOLD_SLEEVE_SHAPE_UNKNOWN", `Sleeve JSON shape unknown for: ${sleeveId}`, trace, catalogResult.libraryRoot, match);
    }
    const payload = parsed;
    const summary = summarizeSleevePayload(payload, match);
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
