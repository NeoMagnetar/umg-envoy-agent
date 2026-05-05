import fs from "node:fs";
import path from "node:path";
function addEntry(entries, entry) {
    const key = `${entry.artifactType}::${entry.artifactId}::${entry.sourceReason ?? ""}`;
    if (entries.some((existing) => `${existing.artifactType}::${existing.artifactId}::${existing.sourceReason ?? ""}` === key))
        return;
    entries.push(entry);
}
function resolveNeoblockPath(libraryRoot, artifactId) {
    return path.join(path.resolve(libraryRoot), "AI", "NEOBLOCKS", "categories", "core", `${artifactId}.json`);
}
export function validateNeostackStructure(neostackFile) {
    const errors = [];
    const warnings = [];
    if (neostackFile.identity?.artifact_type !== "neostack") {
        errors.push("identity.artifact_type must be 'neostack'");
    }
    if (!neostackFile.identity?.artifact_id) {
        errors.push("identity.artifact_id is required");
    }
    if (!neostackFile.neostack) {
        errors.push("neostack section is required");
    }
    if (!Array.isArray(neostackFile.neostack?.composition?.neoblock_ids)) {
        errors.push("neostack.composition.neoblock_ids must be an array");
    }
    if (!Array.isArray(neostackFile.neostack?.routes)) {
        warnings.push("neostack.routes is missing or not an array");
    }
    return {
        ok: errors.length === 0,
        valid: errors.length === 0,
        mode: "structural",
        errors,
        warnings
    };
}
export function resolveNeostackArtifacts(libraryRoot, neostackFile) {
    const entries = [];
    const warnings = [];
    const errors = [];
    const root = path.resolve(libraryRoot);
    if (!fs.existsSync(root)) {
        return {
            ok: false,
            libraryRoot: root,
            entries: [],
            missing: [],
            warnings: [],
            errors: [`library root does not exist: ${root}`]
        };
    }
    const neoblockIds = Array.isArray(neostackFile.neostack?.composition?.neoblock_ids)
        ? neostackFile.neostack.composition.neoblock_ids
        : [];
    for (const artifactId of neoblockIds) {
        const expectedPath = resolveNeoblockPath(root, artifactId);
        const exists = fs.existsSync(expectedPath);
        addEntry(entries, {
            artifactType: "neoblock",
            artifactId,
            expectedPath,
            sourceRef: `neostack:${neostackFile.identity?.artifact_id ?? "UNKNOWN.NEOSTACK"}`,
            sourceReason: "neostack composition",
            exists,
            status: exists ? "resolved" : "missing"
        });
    }
    const missing = entries.filter((entry) => entry.status === "missing");
    if (missing.length > 0)
        warnings.push(`${missing.length} referenced neoblocks were not found under the provided library root`);
    return {
        ok: errors.length === 0,
        libraryRoot: root,
        entries,
        missing,
        warnings,
        errors
    };
}
