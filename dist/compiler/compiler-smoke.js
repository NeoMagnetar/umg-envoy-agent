import fs from "node:fs";
import path from "node:path";
import { compileSleeveById } from "./compiler-adapter.js";
import { loadBlocks, loadSleeves, publicContentRoot } from "./content-loader.js";
import { validateRuntimeOutput } from "./runtime-validator.js";
function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
export function runCompilerSmoke(metaUrl = import.meta.url) {
    const root = publicContentRoot(metaUrl);
    const blocksDir = path.join(root, "blocks");
    const sleevesDir = path.join(root, "sleeves");
    const examplesDir = path.join(root, "examples");
    const blocks = loadBlocks(root);
    const sleeves = loadSleeves(root);
    const compile = compileSleeveById("public-basic-envoy", undefined, metaUrl);
    const validExample = validateRuntimeOutput(readJson(path.join(examplesDir, "valid-runtime-output.json")));
    const invalidExample = validateRuntimeOutput(readJson(path.join(examplesDir, "invalid-runtime-output.json")));
    const errors = [];
    if (!fs.existsSync(root))
        errors.push("public-content root missing");
    if (!fs.existsSync(blocksDir))
        errors.push("blocks folder missing");
    if (!fs.existsSync(sleevesDir))
        errors.push("sleeves folder missing");
    if (blocks.length < 7)
        errors.push("expected at least 7 sample blocks");
    if (sleeves.length < 2)
        errors.push("expected at least 2 sample sleeves");
    if (!compile.ok)
        errors.push(...compile.runtimeSpec.errors);
    if (!validExample.valid)
        errors.push(...validExample.errors);
    if (invalidExample.valid)
        errors.push("invalid runtime output unexpectedly validated");
    return {
        ok: errors.length === 0,
        plugin: "umg-envoy-agent",
        version: "0.2.4",
        compilerAdapter: "available",
        contentMode: "bundled-public",
        sampleSleeves: sleeves.length,
        sampleBlocks: blocks.length,
        runtimeValidation: validExample.valid && !invalidExample.valid ? "passed" : "failed",
        errors
    };
}
