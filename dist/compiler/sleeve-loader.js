import fs from "node:fs";
import path from "node:path";
function stripBom(raw) {
    return raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
}
export function loadSleeveFile(request) {
    const resolvedPath = path.resolve(request.sleevePath);
    if (!fs.existsSync(resolvedPath)) {
        return {
            ok: false,
            sleevePath: resolvedPath,
            warnings: [],
            errors: [`sleeve file does not exist: ${resolvedPath}`]
        };
    }
    let raw = "";
    try {
        raw = fs.readFileSync(resolvedPath, "utf8");
    }
    catch (error) {
        return {
            ok: false,
            sleevePath: resolvedPath,
            warnings: [],
            errors: [`failed to read sleeve file: ${resolvedPath}`, String(error)]
        };
    }
    let parsed;
    try {
        parsed = JSON.parse(stripBom(raw));
    }
    catch (error) {
        return {
            ok: false,
            sleevePath: resolvedPath,
            warnings: [],
            errors: ["sleeve JSON is malformed", String(error)]
        };
    }
    return {
        ok: true,
        sleevePath: resolvedPath,
        loadedSleeve: parsed,
        warnings: [],
        errors: []
    };
}
