import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function pluginRootFromDist() {
    return path.resolve(__dirname, "..");
}
function firstExisting(candidates) {
    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            return candidate;
        }
    }
    return null;
}
function requirePath(label, candidates) {
    const found = firstExisting(candidates);
    if (!found) {
        throw new Error(`${label} could not be resolved. Tried: ${candidates.join(" | ")}`);
    }
    return found;
}
export function resolvePaths(config = {}) {
    const pluginRoot = pluginRootFromDist();
    const workspaceRoot = config.workspaceRoot || pluginRoot;
    const doctrineAnchor = requirePath("Doctrine anchor", [
        path.join(pluginRoot, "spec", "ANALYTICAL_REPORT_ON_UMG_REVAMP_WORKSPACE.md")
    ]);
    const compilerRoot = requirePath("Compiler root", [
        ...(config.compilerRoot ? [config.compilerRoot] : []),
        path.join(pluginRoot, "vendor", "umg-compiler")
    ]);
    const compilerV0Root = requirePath("Compiler v0 root", [
        path.join(compilerRoot, "compiler-v0"),
        compilerRoot
    ]);
    const compilerCli = requirePath("Compiler CLI", [
        path.join(compilerV0Root, "dist", "cli.js"),
        path.join(compilerV0Root, "src", "cli.ts")
    ]);
    const compilerPackageJson = requirePath("Compiler package.json", [
        path.join(compilerV0Root, "package.json")
    ]);
    const resleeverRoot = requirePath("Resleever root", [
        ...(config.resleeverRoot ? [config.resleeverRoot] : []),
        path.join(pluginRoot, "vendor", "UMG-Block-Library"),
        path.join(pluginRoot, "vendor", "UMG_Envoy_Resleever")
    ]);
    const resleeverSleevesDir = requirePath("Resleever sleeves directory", [
        path.join(resleeverRoot, "sleeves")
    ]);
    const resleeverBlocksDir = requirePath("Resleever blocks directory", [
        path.join(resleeverRoot, "blocks")
    ]);
    const resleeverRuntimeDir = requirePath("Resleever runtime directory", [
        path.join(resleeverRoot, "runtime")
    ]);
    const resleeverCompilerDir = requirePath("Resleever compiler directory", [
        path.join(resleeverRoot, "compiler")
    ]);
    const activeSleevePath = requirePath("Active sleeve path", [
        path.join(resleeverRuntimeDir, "active-sleeve.json")
    ]);
    const activeStackPath = requirePath("Active stack path", [
        path.join(resleeverRuntimeDir, "active-stack.json")
    ]);
    const sleeveCatalogPath = requirePath("Sleeve catalog path", [
        path.join(resleeverSleevesDir, "manifests", "catalog.json")
    ]);
    const blockCategoryIndexPath = requirePath("Block category index path", [
        path.join(resleeverBlocksDir, "manifests", "category-index.json")
    ]);
    const blockLibraryIndexPath = requirePath("Block library index path", [
        path.join(resleeverBlocksDir, "manifests", "molt-library-index.json")
    ]);
    return {
        pluginRoot,
        workspaceRoot,
        doctrineAnchor,
        compilerRoot,
        compilerV0Root,
        compilerCli,
        compilerPackageJson,
        resleeverRoot,
        resleeverSleevesDir,
        resleeverBlocksDir,
        resleeverRuntimeDir,
        resleeverCompilerDir,
        activeSleevePath,
        activeStackPath,
        sleeveCatalogPath,
        blockCategoryIndexPath,
        blockLibraryIndexPath
    };
}
