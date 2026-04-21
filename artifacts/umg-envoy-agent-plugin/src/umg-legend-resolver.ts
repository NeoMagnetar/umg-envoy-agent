import fs from "node:fs";
import path from "node:path";
import { readJsonFile } from "./fs-utils.js";
import type { ResolvedPaths } from "./types.js";
import type { SleeveCatalog } from "./models.js";
import type { UMGPathDocument, ValidationIssue } from "./umg-path-types.js";

export type LegendSourceClass = "catalog_backed" | "generated_recovery" | "discovered_fallback";

export interface LegendResolverIndex {
  sleeveIds: Set<string>;
  stackIds: Set<string>;
  blockIds: Set<string>;
  moltIds: Set<string>;
  libraryEntryIds: Set<string>;
  triggerIds: Set<string>;
  sourceClassById: Record<string, LegendSourceClass>;
  sourcePathById: Record<string, string>;
}

export interface LegendResolutionSummary {
  sleevesCataloged: number;
  stackCount: number;
  blockCount: number;
  moltCount: number;
  libraryEntryCount: number;
  triggerCount: number;
}

export interface LegendResolutionResult {
  ok: boolean;
  issues: ValidationIssue[];
  summary: LegendResolutionSummary;
}

function push(issues: ValidationIssue[], severity: ValidationIssue["severity"], code: string, message: string, path?: string): void {
  issues.push({ severity, code, message, path });
}

function readJsonIfExists<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  return readJsonFile<T>(filePath);
}

function walkJsonFiles(root: string): string[] {
  if (!fs.existsSync(root)) return [];
  const out: string[] = [];
  const stack = [root];

  while (stack.length) {
    const current = stack.pop()!;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
        out.push(full);
      }
    }
  }

  return out;
}

function collectStringIds(value: unknown, sink: Set<string>): void {
  if (Array.isArray(value)) {
    for (const item of value) collectStringIds(item, sink);
    return;
  }

  if (!value || typeof value !== "object") return;

  const record = value as Record<string, unknown>;
  for (const [key, child] of Object.entries(record)) {
    if (["id", "block_id", "trigger_id", "stack_id", "molt_id", "value", "key"].includes(key) && typeof child === "string" && child.trim()) {
      sink.add(child.trim());
    }
    collectStringIds(child, sink);
  }
}

function registerId(
  ids: Set<string>,
  sourceClassById: Record<string, LegendSourceClass>,
  sourcePathById: Record<string, string>,
  id: string,
  sourceClass: LegendSourceClass,
  sourcePath: string
): void {
  ids.add(id);
  const existing = sourceClassById[id];
  const precedence: Record<LegendSourceClass, number> = {
    catalog_backed: 3,
    generated_recovery: 2,
    discovered_fallback: 1
  };

  if (!existing || precedence[sourceClass] >= precedence[existing]) {
    sourceClassById[id] = sourceClass;
    sourcePathById[id] = sourcePath;
  }
}

function loadSleeveIds(paths: ResolvedPaths): { ids: Set<string>; sourceClassById: Record<string, LegendSourceClass>; sourcePathById: Record<string, string> } {
  const ids = new Set<string>();
  const sourceClassById: Record<string, LegendSourceClass> = {};
  const sourcePathById: Record<string, string> = {};
  const catalog = readJsonIfExists<SleeveCatalog>(paths.sleeveCatalogPath);
  for (const sleeve of catalog?.sleeves ?? []) {
    if (sleeve.id) registerId(ids, sourceClassById, sourcePathById, sleeve.id, "catalog_backed", paths.sleeveCatalogPath);
  }

  for (const filePath of walkJsonFiles(paths.resleeverSleevesDir)) {
    const json = readJsonIfExists<any>(filePath);
    const directId = json?.sleeve?.id ?? json?.id ?? json?.sleeve_id;
    if (typeof directId === "string" && directId.trim()) {
      registerId(ids, sourceClassById, sourcePathById, directId.trim(), "discovered_fallback", filePath);
    }
  }

  return { ids, sourceClassById, sourcePathById };
}

function loadStackIds(paths: ResolvedPaths, sourceClassById: Record<string, LegendSourceClass>, sourcePathById: Record<string, string>): Set<string> {
  const ids = new Set<string>();
  const catalogFiles = [
    ...walkJsonFiles(path.join(paths.resleeverBlocksDir, "neostacks")),
    ...walkJsonFiles(path.join(paths.resleeverBlocksDir, "library", "neostacks"))
  ];
  const generatedFiles = walkJsonFiles(path.join(paths.resleeverBlocksDir, "generated", "neostacks"));

  for (const filePath of catalogFiles) {
    const json = readJsonIfExists<any>(filePath);
    const stacks = Array.isArray(json?.stacks) ? json.stacks : [];
    for (const stack of stacks) {
      if (typeof stack?.id === "string" && stack.id.trim()) registerId(ids, sourceClassById, sourcePathById, stack.id.trim(), "catalog_backed", filePath);
    }
  }

  for (const filePath of generatedFiles) {
    const json = readJsonIfExists<any>(filePath);
    const directId = json?.id;
    if (typeof directId === "string" && directId.trim()) registerId(ids, sourceClassById, sourcePathById, directId.trim(), "generated_recovery", filePath);
  }

  return ids;
}

function loadBlockIds(paths: ResolvedPaths, sourceClassById: Record<string, LegendSourceClass>, sourcePathById: Record<string, string>): Set<string> {
  const ids = new Set<string>();
  const catalogFiles = [
    ...walkJsonFiles(path.join(paths.resleeverBlocksDir, "neoblocks")),
    ...walkJsonFiles(path.join(paths.resleeverBlocksDir, "library", "neoblocks"))
  ];
  const generatedFiles = walkJsonFiles(path.join(paths.resleeverBlocksDir, "generated", "neoblocks"));

  for (const filePath of catalogFiles) {
    const json = readJsonIfExists<any>(filePath);
    const neoblocks = Array.isArray(json?.neoblocks) ? json.neoblocks : [];
    for (const block of neoblocks) {
      if (typeof block?.id === "string" && block.id.trim()) registerId(ids, sourceClassById, sourcePathById, block.id.trim(), "catalog_backed", filePath);
    }
  }

  for (const filePath of generatedFiles) {
    const json = readJsonIfExists<any>(filePath);
    const directId = json?.id;
    if (typeof directId === "string" && directId.trim()) registerId(ids, sourceClassById, sourcePathById, directId.trim(), "generated_recovery", filePath);
  }

  return ids;
}

function loadMoltAndLibraryIds(paths: ResolvedPaths, sourceClassById: Record<string, LegendSourceClass>, sourcePathById: Record<string, string>): { moltIds: Set<string>; libraryEntryIds: Set<string>; triggerIds: Set<string> } {
  const moltIds = new Set<string>();
  const libraryEntryIds = new Set<string>();
  const triggerIds = new Set<string>();

  for (const filePath of walkJsonFiles(path.join(paths.resleeverBlocksDir, "molt"))) {
    const json = readJsonIfExists<any>(filePath);
    const collected = new Set<string>();
    collectStringIds(json, collected);

    for (const id of collected) {
      registerId(libraryEntryIds, sourceClassById, sourcePathById, id, "discovered_fallback", filePath);
      if (/^(TRG|trigger)/i.test(id)) registerId(triggerIds, sourceClassById, sourcePathById, id, "discovered_fallback", filePath);
      if (/^(DIR|INST|PRIM|PHI|BP|SUB|USE|AIM|NEED|block\.)/i.test(id)) registerId(moltIds, sourceClassById, sourcePathById, id, "discovered_fallback", filePath);
    }
  }

  for (const filePath of walkJsonFiles(path.join(paths.resleeverBlocksDir, "generated", "molt"))) {
    const json = readJsonIfExists<any>(filePath);
    const directId = json?.id;
    if (typeof directId === "string" && directId.trim()) {
      registerId(moltIds, sourceClassById, sourcePathById, directId.trim(), "generated_recovery", filePath);
      registerId(libraryEntryIds, sourceClassById, sourcePathById, directId.trim(), "generated_recovery", filePath);
    }
  }

  return { moltIds, libraryEntryIds, triggerIds };
}

export function buildLegendResolverIndex(paths: ResolvedPaths): LegendResolverIndex {
  const sleeve = loadSleeveIds(paths);
  const sourceClassById = { ...sleeve.sourceClassById };
  const sourcePathById = { ...sleeve.sourcePathById };
  const stackIds = loadStackIds(paths, sourceClassById, sourcePathById);
  const blockIds = loadBlockIds(paths, sourceClassById, sourcePathById);
  const { moltIds, libraryEntryIds, triggerIds } = loadMoltAndLibraryIds(paths, sourceClassById, sourcePathById);

  return {
    sleeveIds: sleeve.ids,
    stackIds,
    blockIds,
    moltIds,
    libraryEntryIds,
    triggerIds,
    sourceClassById,
    sourcePathById
  };
}

export function summarizeLegendResolverIndex(index: LegendResolverIndex): LegendResolutionSummary {
  return {
    sleevesCataloged: index.sleeveIds.size,
    stackCount: index.stackIds.size,
    blockCount: index.blockIds.size,
    moltCount: index.moltIds.size,
    libraryEntryCount: index.libraryEntryIds.size,
    triggerCount: index.triggerIds.size
  };
}

export function validateUMGPathAgainstLegend(doc: UMGPathDocument, index: LegendResolverIndex): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!index.sleeveIds.has(doc.sleeveId)) {
    push(issues, "error", "LEGEND_UNKNOWN_SLEEVE", `Sleeve id does not resolve in legend: ${doc.sleeveId}`, "sleeveId");
  }

  for (const [indexPos, stackId] of doc.loadedStacks.entries()) {
    if (!index.stackIds.has(stackId)) {
      push(issues, "error", "LEGEND_UNKNOWN_STACK", `Loaded stack id does not resolve in legend: ${stackId}`, `loadedStacks[${indexPos}]`);
    }
  }

  for (const [stackIndex, stack] of doc.stacks.entries()) {
    if (!index.stackIds.has(stack.id)) {
      push(issues, "error", "LEGEND_UNKNOWN_STACK", `Declared stack id does not resolve in legend: ${stack.id}`, `stacks[${stackIndex}]`);
    }

    for (const [blockIndex, block] of stack.blocks.entries()) {
      if (!index.blockIds.has(block.id)) {
        push(issues, "error", "LEGEND_UNKNOWN_BLOCK", `Declared block id does not resolve in legend: ${block.id}`, `stacks[${stackIndex}].blocks[${blockIndex}]`);
      }

      for (const [moltIndex, molt] of block.molts.entries()) {
        if (!index.moltIds.has(molt.id) && !index.libraryEntryIds.has(molt.id)) {
          push(issues, "error", "LEGEND_UNKNOWN_MOLT", `Declared MOLT id does not resolve in legend/library: ${molt.id}`, `stacks[${stackIndex}].blocks[${blockIndex}].molts[${moltIndex}]`);
        }
      }
    }
  }

  for (const [triggerIndex, triggerId] of doc.triggers.entries()) {
    if (!index.triggerIds.has(triggerId) && !index.libraryEntryIds.has(triggerId)) {
      push(issues, "error", "LEGEND_UNKNOWN_TRIGGER", `Trigger id does not resolve in legend/library: ${triggerId}`, `triggers[${triggerIndex}]`);
    }
  }

  return issues;
}

export function resolveUMGPathAgainstLegend(paths: ResolvedPaths, doc: UMGPathDocument): LegendResolutionResult {
  const index = buildLegendResolverIndex(paths);
  const issues = validateUMGPathAgainstLegend(doc, index);
  const summary = summarizeLegendResolverIndex(index);
  return {
    ok: !issues.some((issue) => issue.severity === "error"),
    issues,
    summary
  };
}
