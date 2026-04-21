import fs from "node:fs";
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function normalizeStatus(value) {
    return value === "authoritative" || value === "discovered" || value === "unresolved"
        ? value
        : "unresolved";
}
function normalizeIntent(value) {
    return value === "bridge_only" || value === "canon_candidate" ? value : "unknown";
}
function normalizeTargetKind(value) {
    return value === "catalog_backed" || value === "discovered_fallback" ? value : "unknown";
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
            source,
            intent: normalizeIntent(raw.intent),
            targetKind: normalizeTargetKind(raw.targetKind)
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
function mapForKind(kind, alignment) {
    return kind === "stack"
        ? alignment.stackIdMap
        : kind === "block"
            ? alignment.blockIdMap
            : alignment.moltIdMap;
}
function reverseCounts(map) {
    const counts = new Map();
    for (const entry of Object.values(map)) {
        counts.set(entry.resolvedId, (counts.get(entry.resolvedId) ?? 0) + 1);
    }
    return counts;
}
export function alignRuntimeId(kind, emittedId, alignment) {
    const map = mapForKind(kind, alignment);
    const reverse = reverseCounts(map);
    const entry = map[emittedId];
    if (!entry) {
        return {
            kind,
            emittedId,
            resolvedId: emittedId,
            status: "unresolved",
            source: "no-alignment-entry",
            mode: "unresolved",
            targetKind: "unknown",
            intent: "unknown",
            cardinality: {
                resolvedTargetCount: 0,
                emittedSourceCount: 1
            }
        };
    }
    const emittedSourceCount = reverse.get(entry.resolvedId) ?? 1;
    const mode = emittedSourceCount > 1 ? "bridge_only_many_to_one" : "exact";
    return {
        kind,
        emittedId,
        resolvedId: entry.resolvedId,
        status: entry.status,
        source: entry.source,
        mode,
        targetKind: entry.targetKind ?? "unknown",
        intent: entry.intent ?? "unknown",
        cardinality: {
            resolvedTargetCount: 1,
            emittedSourceCount
        }
    };
}
export function collectManyToOneMappings(entries) {
    return entries.filter((entry) => entry.mode === "bridge_only_many_to_one");
}
