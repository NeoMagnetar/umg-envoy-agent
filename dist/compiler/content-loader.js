import fs from "node:fs";
import path from "node:path";
function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
export function packageRootFromModule(metaUrl) {
    const moduleDir = path.dirname(new URL(metaUrl).pathname).replace(/^\/[A-Za-z]:/, (m) => m.slice(1));
    const candidateA = path.resolve(moduleDir, "..");
    const candidateB = path.resolve(moduleDir, "..", "..");
    if (fs.existsSync(path.join(candidateA, "public-content")))
        return candidateA;
    return candidateB;
}
export function publicContentRoot(metaUrl) {
    return path.join(packageRootFromModule(metaUrl), "public-content");
}
export function listBlockFiles(root) {
    const dir = path.join(root, "blocks");
    return fs.readdirSync(dir).filter((name) => name.endsWith(".json")).sort().map((name) => path.join(dir, name));
}
export function listSleeveFiles(root) {
    const dir = path.join(root, "sleeves");
    return fs.readdirSync(dir).filter((name) => name.endsWith(".json")).sort().map((name) => path.join(dir, name));
}
export function loadBlocks(root) {
    return listBlockFiles(root).map((file) => readJson(file));
}
export function loadSleeves(root) {
    return listSleeveFiles(root).map((file) => readJson(file));
}
export function loadSleeveById(root, sleeveId) {
    return loadSleeves(root).find((sleeve) => sleeve.sleeve_id === sleeveId);
}
export function loadBlockMap(root) {
    return new Map(loadBlocks(root).map((block) => [block.block_id, block]));
}
export function summarizeBlockLibraries(root) {
    const blocks = loadBlocks(root);
    const byKind = {};
    for (const block of blocks) {
        byKind[block.kind] = (byKind[block.kind] ?? 0) + 1;
    }
    return {
        totalBlocks: blocks.length,
        byKind,
        blockIds: blocks.map((block) => block.block_id)
    };
}
