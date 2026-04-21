import fs from "node:fs";
import type { ResolvedPaths } from "./types.js";

export type AlignmentStatus = "authoritative" | "discovered" | "unresolved";

export interface AlignmentEntry {
  resolvedId: string;
  status: AlignmentStatus;
  source: string;
}

export interface AlignmentMapSet {
  stackIdMap: Record<string, AlignmentEntry>;
  blockIdMap: Record<string, AlignmentEntry>;
  moltIdMap: Record<string, AlignmentEntry>;
}

export interface RuntimeAlignmentTraceEntry {
  kind: "stack" | "block" | "molt";
  emittedId: string;
  resolvedId: string;
  status: AlignmentStatus;
  source: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeStatus(value: unknown): AlignmentStatus {
  return value === "authoritative" || value === "discovered" || value === "unresolved"
    ? value
    : "unresolved";
}

function parseMap(value: unknown): Record<string, AlignmentEntry> {
  if (!isRecord(value)) return {};
  const out: Record<string, AlignmentEntry> = {};

  for (const [key, raw] of Object.entries(value)) {
    if (!isRecord(raw)) continue;
    const resolvedId = typeof raw.resolvedId === "string" ? raw.resolvedId.trim() : "";
    const status = normalizeStatus(raw.status);
    const source = typeof raw.source === "string" ? raw.source : "unknown";
    out[key] = {
      resolvedId: resolvedId || key,
      status,
      source
    };
  }

  return out;
}

export function loadRuntimeLegendAlignment(paths: ResolvedPaths): AlignmentMapSet {
  const raw = fs.readFileSync(paths.runtimeLegendAlignmentPath, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  if (!isRecord(parsed)) {
    throw new Error(`Runtime legend alignment file is not an object: ${paths.runtimeLegendAlignmentPath}`);
  }

  return {
    stackIdMap: parseMap(parsed.stackIdMap),
    blockIdMap: parseMap(parsed.blockIdMap),
    moltIdMap: parseMap(parsed.moltIdMap)
  };
}

export function alignRuntimeId(
  kind: "stack" | "block" | "molt",
  emittedId: string,
  alignment: AlignmentMapSet
): RuntimeAlignmentTraceEntry {
  const map = kind === "stack"
    ? alignment.stackIdMap
    : kind === "block"
      ? alignment.blockIdMap
      : alignment.moltIdMap;

  const entry = map[emittedId];
  if (!entry) {
    return {
      kind,
      emittedId,
      resolvedId: emittedId,
      status: "unresolved",
      source: "no-alignment-entry"
    };
  }

  return {
    kind,
    emittedId,
    resolvedId: entry.resolvedId,
    status: entry.status,
    source: entry.source
  };
}
