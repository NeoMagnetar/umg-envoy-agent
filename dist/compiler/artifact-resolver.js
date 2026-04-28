import fs from "node:fs";
import path from "node:path";
function addEntry(entries, entry) {
    entries.push(entry);
}
function artifactPathFromId(libraryRoot, artifactType, artifactId) {
    switch (artifactType) {
        case "sleeve":
            return path.join(libraryRoot, "AI", "SLEEVES", "categories", "core", artifactId, "sleeve.json");
        case "neostack":
            return path.join(libraryRoot, "AI", "NEOSTACKS", "categories", "core", `${artifactId}.json`);
        case "overlay":
            return path.join(libraryRoot, "AI", "OVERLAYS", "categories", "governance", `${artifactId}.json`);
        case "schema":
            return path.join(libraryRoot, artifactId.replaceAll("/", path.sep));
        case "neoblock":
            return path.join(libraryRoot, "AI", "NEOBLOCKS", "categories", "core", `${artifactId}.json`);
        case "bundle":
            return path.join(libraryRoot, "AI", "BUNDLES", "categories", "core", `${artifactId}.json`);
        default:
            return null;
    }
}
function resolveList(entries, libraryRoot, artifactType, values) {
    if (!Array.isArray(values)) {
        return;
    }
    for (const raw of values) {
        const artifactId = typeof raw === "string" ? raw : null;
        if (!artifactId) {
            addEntry(entries, {
                artifactType,
                artifactId: String(raw),
                expectedPath: null,
                exists: false,
                status: "invalid"
            });
            continue;
        }
        const expectedPath = artifactPathFromId(libraryRoot, artifactType, artifactId);
        const exists = expectedPath ? fs.existsSync(expectedPath) : false;
        addEntry(entries, {
            artifactType,
            artifactId,
            expectedPath,
            exists,
            status: exists ? "resolved" : "missing"
        });
    }
}
export function resolveSleeveArtifacts(libraryRootInput, sleeve) {
    const libraryRoot = path.resolve(libraryRootInput);
    const entries = [];
    const errors = [];
    const warnings = [];
    if (!fs.existsSync(libraryRoot)) {
        return {
            ok: false,
            libraryRoot,
            entries: [],
            missing: [],
            warnings: [],
            errors: [`library root does not exist: ${libraryRoot}`]
        };
    }
    resolveList(entries, libraryRoot, "sleeve", sleeve.sleeve?.dependencies?.sleeve_ids);
    resolveList(entries, libraryRoot, "neostack", sleeve.sleeve?.dependencies?.neostack_ids);
    resolveList(entries, libraryRoot, "overlay", sleeve.sleeve?.dependencies?.overlay_ids);
    resolveList(entries, libraryRoot, "schema", sleeve.sleeve?.dependencies?.schema_ids);
    resolveList(entries, libraryRoot, "neostack", sleeve.sleeve?.composition?.neostack_ids);
    resolveList(entries, libraryRoot, "overlay", sleeve.sleeve?.composition?.overlay_ids);
    resolveList(entries, libraryRoot, "bundle", sleeve.sleeve?.dependencies?.bundle_ids);
    resolveList(entries, libraryRoot, "bundle", sleeve.sleeve?.composition?.bundle_ids);
    const missing = entries.filter((entry) => entry.status === "missing");
    const invalid = entries.filter((entry) => entry.status === "invalid");
    if (missing.length > 0) {
        warnings.push(`${missing.length} referenced artifacts were not found under the provided library root`);
    }
    if (invalid.length > 0) {
        errors.push(`${invalid.length} artifact references were invalid`);
    }
    return {
        ok: errors.length === 0,
        libraryRoot,
        entries,
        missing,
        warnings,
        errors
    };
}
