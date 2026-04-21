import fs from "node:fs";
import path from "node:path";
import { readJsonFile } from "./fs-utils.js";
import type { ResolvedPaths } from "./types.js";
import type { SleeveCatalog } from "./models.js";
import type { UMGPathDocument, ValidationIssue } from "./umg-path-types.js";

export interface LegendResolverIndex {
  sleeveIds: Set<string>;
  stackIds: Set<string>;
  blockIds: Set<string>;
  moltIds: Set<string>;
  libraryEntryIds: Set<string>;
  triggerIds: Set<string>;
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

function loadSleeveIds(paths: ResolvedPaths): Set<string> {
  const ids = new Set<string>();
  const catalog = readJsonIfExists<SleeveCatalog>(paths.sleeveCatalogPath);
  for (const sleeve of catalog?.sleeves ?? []) {
    if (sleeve.id) ids.add(sleeve.id);
  }

  for (const filePath of walkJsonFiles(paths.resleeverSleevesDir)) {
    const json = readJsonIfExists<any>(filePath);
    const directId = json?.sleeve?.id ?? json?.id ?? json?.sleeve_id;
    if (typeof directId === "string" && directId.trim()) {
      ids.add(directId.trim());
    }

    const folderName = path.basename(path.dirname(filePath));
    if (folderName && folderName !== "." && folderName !== "..") {
      ids.add(folderName);
    }
  }

  return ids;
}

function loadStackIds(paths: ResolvedPaths): Set<string> {
  const ids = new Set<string>();
  for (const filePath of [
    ...walkJsonFiles(path.join(paths.resleeverBlocksDir, "neostacks")),
    ...walkJsonFiles(path.join(paths.resleeverBlocksDir, "library", "neostacks"))
  ]) {
    const json = readJsonIfExists<any>(filePath);
    const stacks = Array.isArray(json?.stacks) ? json.stacks : [];
    for (const stack of stacks) {
      if (typeof stack?.id === "string" && stack.id.trim()) ids.add(stack.id.trim());
    }
  }
  return ids;
}

function loadBlockIds(paths: ResolvedPaths): Set<string> {
  const ids = new Set<string>();
  for (const filePath of [
    ...walkJsonFiles(path.join(paths.resleeverBlocksDir, "neoblocks")),
    ...walkJsonFiles(path.join(paths.resleeverBlocksDir, "library", "neoblocks"))
  ]) {
    const json = readJsonIfExists<any>(filePath);
    const neoblocks = Array.isArray(json?.neoblocks) ? json.neoblocks : [];
    for (const block of neoblocks) {
      if (typeof block?.id === "string" && block.id.trim()) ids.add(block.id.trim());
    }
  }
  return ids;
}

function loadMoltAndLibraryIds(paths: ResolvedPaths): { moltIds: Set<string>; libraryEntryIds: Set<string>; triggerIds: Set<string> } {
  const moltIds = new Set<string>();
  const libraryEntryIds = new Set<string>();
  const triggerIds = new Set<string>();

  for (const filePath of walkJsonFiles(path.join(paths.resleeverBlocksDir, "molt"))) {
    const json = readJsonIfExists<any>(filePath);
    const collected = new Set<string>();
    collectStringIds(json, collected);

    for (const id of collected) {
      libraryEntryIds.add(id);
      if (/^(TRG|trigger)/i.test(id)) triggerIds.add(id);
      if (/^(DIR|INST|PRIM|PHI|BP|SUB|USE|AIM|NEED|block\.)/i.test(id)) moltIds.add(id);
    }
  }

  return { moltIds, libraryEntryIds, triggerIds };
}

export function buildLegendResolverIndex(paths: ResolvedPaths): LegendResolverIndex {
  const sleeveIds = loadSleeveIds(paths);
  const stackIds = loadStackIds(paths);
  const blockIds = loadBlockIds(paths);
  const { moltIds, libraryEntryIds, triggerIds } = loadMoltAndLibraryIds(paths);

  return {
    sleeveIds,
    stackIds,
    blockIds,
    moltIds,
    libraryEntryIds,
    triggerIds
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
