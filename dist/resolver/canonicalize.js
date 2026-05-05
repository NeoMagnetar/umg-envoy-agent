import path from "node:path";
export function classifyRelationship(artifact) {
    const lower = artifact.source.path.replaceAll("\\", "/").toLowerCase();
    if (artifact.source.discovery_method === "manifest")
        return "manifest_entry";
    if (artifact.source.discovery_method === "index")
        return "index_entry";
    if (artifact.source.source_kind === "human_readable")
        return "supporting_human_doc";
    if (artifact.source.source_kind === "package_lane")
        return "package_export";
    if (artifact.kind === "schema")
        return "schema_reference";
    if (lower.endsWith("readme.md"))
        return "readme_reference";
    if (artifact.source.canonical)
        return "canonical_artifact";
    return "fallback_duplicate";
}
export function humanizeId(id) {
    return id
        .replace(/^NB\.|^NS\.|^SLV\./, "")
        .replace(/\.v\d+(?:\.\d+)?$/i, "")
        .replace(/[._-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\bUMG\b/g, "UMG")
        .replace(/\bLC\b/g, "LangChain")
        .replace(/\bMCP\b/g, "MCP")
        .replace(/\bLANGCHAIN\b/gi, "LangChain")
        .replace(/\bBRIDGE\b/gi, "Bridge")
        .replace(/\bRUNTIME\b/gi, "Runtime")
        .replace(/\bFLOW\b/gi, "Flow")
        .replace(/\bCORE\b/gi, "Core")
        .replace(/\b([a-z])/g, (m) => m.toUpperCase());
}
export function pickCanonicalTitle(raw, fallbackPath, fallbackId) {
    const metadata = raw.metadata && typeof raw.metadata === "object" ? raw.metadata : {};
    const manifest = raw.manifest && typeof raw.manifest === "object" ? raw.manifest : {};
    const neostack = raw.neostack && typeof raw.neostack === "object" ? raw.neostack : {};
    const sleeve = raw.sleeve && typeof raw.sleeve === "object" ? raw.sleeve : {};
    const identity = raw.identity && typeof raw.identity === "object" ? raw.identity : {};
    for (const value of [
        raw.title,
        raw.display_name,
        raw.name,
        raw.label,
        metadata.title,
        metadata.name,
        manifest.title,
        neostack.name,
        sleeve.name,
        raw.summary,
        raw.description,
        identity.artifact_id ? humanizeId(String(identity.artifact_id)) : undefined,
        fallbackId ? humanizeId(fallbackId) : undefined,
        path.basename(fallbackPath)
    ]) {
        if (typeof value === "string" && value.trim())
            return value.trim();
    }
    return path.basename(fallbackPath);
}
export function pickCanonicalDescription(raw, markdownSummary) {
    const metadata = raw.metadata && typeof raw.metadata === "object" ? raw.metadata : {};
    const manifest = raw.manifest && typeof raw.manifest === "object" ? raw.manifest : {};
    const neostack = raw.neostack && typeof raw.neostack === "object" ? raw.neostack : {};
    const sleeve = raw.sleeve && typeof raw.sleeve === "object" ? raw.sleeve : {};
    for (const value of [
        raw.description,
        raw.summary,
        metadata.description,
        manifest.description,
        neostack.description,
        sleeve.description,
        markdownSummary
    ]) {
        if (typeof value === "string" && value.trim())
            return value.trim();
    }
    return "";
}
