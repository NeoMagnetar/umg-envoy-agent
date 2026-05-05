const ARRAY_KEYS = ["artifacts", "items", "entries", "blocks", "molt_blocks", "neoblocks", "neostacks", "sleeves", "tools", "resources", "prompts", "capabilities", "domains", "schemas", "manifests", "files"];
export function extractManifestArtifactReferences(payload, sourceManifestPath) {
    const results = [];
    visit(payload, "$", sourceManifestPath, results);
    return results;
}
function visit(value, keyPath, sourceManifestPath, results) {
    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            visit(value[i], `${keyPath}[${i}]`, sourceManifestPath, results);
        }
        return;
    }
    if (!value || typeof value !== "object")
        return;
    const record = value;
    const candidate = toReference(record, sourceManifestPath, keyPath);
    if (candidate)
        results.push(candidate);
    for (const [key, child] of Object.entries(record)) {
        if (ARRAY_KEYS.includes(key)) {
            visit(child, `${keyPath}.${key}`, sourceManifestPath, results);
            continue;
        }
        if (child && typeof child === "object" && !Array.isArray(child)) {
            const maybeMap = child;
            const childKeys = Object.keys(maybeMap);
            const looksLikeArtifactMap = childKeys.some((entryKey) => {
                const entryValue = maybeMap[entryKey];
                return entryValue && typeof entryValue === "object" && !Array.isArray(entryValue);
            });
            if (looksLikeArtifactMap) {
                for (const [mapKey, mapValue] of Object.entries(maybeMap)) {
                    if (!mapValue || typeof mapValue !== "object")
                        continue;
                    const mapRecord = { id: mapKey, ...mapValue };
                    const fromMap = toReference(mapRecord, sourceManifestPath, `${keyPath}.${key}.${mapKey}`);
                    if (fromMap)
                        results.push(fromMap);
                }
            }
        }
    }
}
function toReference(record, sourceManifestPath, manifestKeyPath) {
    const pathValue = firstString(record.path, record.artifact_path, record.source_path, typeof record.file === "string" ? record.file : undefined);
    const idValue = firstString(record.id, record.artifact_id, record.block_id, record.neoblock_id, record.neostack_id, record.sleeve_id);
    const kindValue = firstString(record.kind, record.type, record.store);
    const titleValue = firstString(record.title, record.name, record.label);
    const descriptionValue = firstString(record.description, record.summary, record.notes);
    if (!pathValue && !idValue)
        return null;
    return {
        id: idValue || undefined,
        kind: kindValue || undefined,
        path: pathValue || undefined,
        title: titleValue || undefined,
        description: descriptionValue || undefined,
        sourceManifestPath,
        manifestKeyPath,
        raw: record
    };
}
function firstString(...values) {
    for (const value of values) {
        if (typeof value === "string" && value.trim())
            return value.trim();
    }
    return "";
}
