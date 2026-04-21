import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { PluginConfig, ResolvedPaths } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function pluginRootFromDist(): string {
  return path.resolve(__dirname, "..");
}

function firstExisting(candidates: string[]): string | null {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function requirePath(label: string, candidates: string[]): string {
  const found = firstExisting(candidates);
  if (!found) {
    throw new Error(
      `${label} could not be resolved. Tried: ${candidates.join(" | ")}`
    );
  }
  return found;
}

function candidateContentRoots(pluginRoot: string, workspaceRoot?: string, explicitContentRoot?: string): string[] {
  const candidates: string[] = [];

  if (explicitContentRoot) {
    candidates.push(explicitContentRoot);
  }

  if (workspaceRoot && workspaceRoot !== pluginRoot) {
    candidates.push(workspaceRoot);
    candidates.push(path.join(workspaceRoot, "content"));
    candidates.push(path.join(workspaceRoot, "UMG_Envoy_Resleever"));
  }

  candidates.push(path.join(pluginRoot, "vendor", "UMG_Envoy_Resleever"));

  return Array.from(new Set(candidates));
}

export function resolvePaths(config: PluginConfig = {}): ResolvedPaths {
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

  const contentRoot = requirePath("Content root", candidateContentRoots(pluginRoot, workspaceRoot, config.resleeverRoot));

  const resleeverRoot = contentRoot;

  const resleeverSleevesDir = requirePath("Sleeves directory", [
    path.join(contentRoot, "sleeves")
  ]);

  const resleeverBlocksDir = requirePath("Blocks directory", [
    path.join(contentRoot, "blocks")
  ]);

  const resleeverRuntimeDir = requirePath("Runtime directory", [
    path.join(contentRoot, "runtime")
  ]);

  const resleeverCompilerDir = firstExisting([
    path.join(contentRoot, "compiler"),
    path.join(pluginRoot, "vendor", "UMG_Envoy_Resleever", "compiler")
  ]) ?? path.join(contentRoot, "compiler");

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

  const resolverRulesPath = requirePath("Resolver rules path", [
    path.join(pluginRoot, "config", "resolver-rules.default.json")
  ]);

  const runtimeLegendAlignmentPath = requirePath("Runtime legend alignment path", [
    ...(config.runtimeLegendAlignmentPath ? [config.runtimeLegendAlignmentPath] : []),
    path.join(pluginRoot, "config", "runtime-legend-alignment.default.json")
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
    blockLibraryIndexPath,
    resolverRulesPath,
    runtimeLegendAlignmentPath
  };
}
