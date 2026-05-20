import fs from "node:fs";
import path from "node:path";
import type { BlockLibrarySummary, PublicBlock, PublicSleeve } from "../types.js";

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export function packageRootFromModule(metaUrl: string): string {
  const moduleDir = path.dirname(new URL(metaUrl).pathname).replace(/^\/[A-Za-z]:/, (m) => m.slice(1));
  const candidateA = path.resolve(moduleDir, "..");
  const candidateB = path.resolve(moduleDir, "..", "..");
  if (fs.existsSync(path.join(candidateA, "public-content"))) return candidateA;
  return candidateB;
}

export function publicContentRoot(metaUrl: string): string {
  return path.join(packageRootFromModule(metaUrl), "public-content");
}

export function listBlockFiles(root: string): string[] {
  const dir = path.join(root, "blocks");
  return fs.readdirSync(dir).filter((name) => name.endsWith(".json")).sort().map((name) => path.join(dir, name));
}

export function listSleeveFiles(root: string): string[] {
  const dir = path.join(root, "sleeves");
  return fs.readdirSync(dir).filter((name) => name.endsWith(".json")).sort().map((name) => path.join(dir, name));
}

export function loadBlocks(root: string): PublicBlock[] {
  return listBlockFiles(root).map((file) => readJson<PublicBlock>(file));
}

export function loadSleeves(root: string): PublicSleeve[] {
  return listSleeveFiles(root).map((file) => readJson<PublicSleeve>(file));
}

export function loadSleeveById(root: string, sleeveId: string): PublicSleeve | undefined {
  return loadSleeves(root).find((sleeve) => sleeve.sleeve_id === sleeveId);
}

export function loadBlockMap(root: string): Map<string, PublicBlock> {
  return new Map(loadBlocks(root).map((block) => [block.block_id, block]));
}

export function summarizeBlockLibraries(root: string): BlockLibrarySummary {
  const blocks = loadBlocks(root);
  const byKind: Record<string, number> = {};
  for (const block of blocks) {
    byKind[block.kind] = (byKind[block.kind] ?? 0) + 1;
  }
  return {
    totalBlocks: blocks.length,
    byKind,
    blockIds: blocks.map((block) => block.block_id)
  };
}
