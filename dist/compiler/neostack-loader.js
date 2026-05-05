import fs from "node:fs";
import path from "node:path";
function stripBom(raw) {
    return raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
}
export function neostackPathFromId(libraryRoot, neostackId) {
    return path.join(path.resolve(libraryRoot), "AI", "NEOSTACKS", "categories", "core", `${neostackId}.json`);
}
export function loadNeostackFile(request) {
    const resolvedPath = request.neostackId ? neostackPathFromId(request.libraryRoot, request.neostackId) : path.resolve(request.neostackPath ?? "");
    if (!fs.existsSync(resolvedPath)) {
        return {
            ok: false,
            neostackPath: resolvedPath,
            warnings: [],
            errors: [`neostack file does not exist: ${resolvedPath}`]
        };
    }
    let raw = "";
    try {
        raw = fs.readFileSync(resolvedPath, "utf8");
    }
    catch (error) {
        return {
            ok: false,
            neostackPath: resolvedPath,
            warnings: [],
            errors: [`failed to read neostack file: ${resolvedPath}`, String(error)]
        };
    }
    let parsed;
    try {
        parsed = JSON.parse(stripBom(raw));
    }
    catch (error) {
        return {
            ok: false,
            neostackPath: resolvedPath,
            warnings: [],
            errors: ["neostack JSON is malformed", String(error)]
        };
    }
    return {
        ok: true,
        neostackPath: resolvedPath,
        loadedNeostack: parsed,
        warnings: [],
        errors: []
    };
}
