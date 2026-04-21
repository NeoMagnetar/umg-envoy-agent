import fs from "node:fs";
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function normalizeStatus(value) {
    return value === "authoritative" || value === "discovered" || value === "unresolved"
        ? value
        : "unresolved";
}
function parseMap(value) {
    if (!isRecord(value))
        return {};
    const out = {};
    for (const [key, raw] of Object.entries(value)) {
        if (!isRecord(raw))
            continue;
        const resolvedId = typeof raw.resolvedId === "string" ? raw.resolvedId.trim() : "";
        const status = normalizeStatus(raw.status);
        const source = typeof raw.source === "string" ? raw.source : "unknown";
        out[key] = {
            resolvedId: resolvedId || key,
            status,
            source
        };
    }
    return out;
}
export function loadRuntimeLegendAlignment(paths) {
    const raw = fs.readFileSync(paths.runtimeLegendAlignmentPath, "utf8");
    const parsed = JSON.parse(raw);
    if (!isRecord(parsed)) {
        throw new Error(`Runtime legend alignment file is not an object: ${paths.runtimeLegendAlignmentPath}`);
    }
    return {
        stackIdMap: parseMap(parsed.stackIdMap),
        blockIdMap: parseMap(parsed.blockIdMap),
        moltIdMap: parseMap(parsed.moltIdMap)
    };
}
export function alignRuntimeId(kind, emittedId, alignment) {
    const map = kind === "stack"
        ? alignment.stackIdMap
        : kind === "block"
            ? alignment.blockIdMap
            : alignment.moltIdMap;
    const entry = map[emittedId];
    if (!entry) {
        return {
            kind,
            emittedId,
            resolvedId: emittedId,
            status: "unresolved",
            source: "no-alignment-entry"
        };
    }
    return {
        kind,
        emittedId,
        resolvedId: entry.resolvedId,
        status: entry.status,
        source: entry.source
    };
}
