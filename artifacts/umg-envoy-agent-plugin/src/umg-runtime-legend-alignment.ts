import fs from "node:fs";
import type { ResolvedPaths } from "./types.js";

export type AlignmentStatus = "authoritative" | "discovered" | "unresolved";
export type AlignmentMode = "exact" | "bridge_only_many_to_one" | "unresolved";

export interface AlignmentEntry {
  resolvedId: string;
  status: AlignmentStatus;
  source: string;
  intent?: "bridge_only" | "canon_candidate" | "unknown";
  targetKind?: "catalog_backed" | "discovered_fallback" | "unknown";
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
  mode: AlignmentMode;
  targetKind: "catalog_backed" | "discovered_fallback" | "unknown";
  intent: "bridge_only" | "canon_candidate" | "unknown";
  cardinality: {
    resolvedTargetCount: number;
    emittedSourceCount: number;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeStatus(value: unknown): AlignmentStatus {
  return value === "authoritative" || value === "discovered" || value === "unresolved"
    ? value
    : "unresolved";
}

function normalizeIntent(value: unknown): AlignmentEntry["intent"] {
  return value === "bridge_only" || value === "canon_candidate" ? value : "unknown";
}

function normalizeTargetKind(value: unknown): AlignmentEntry["targetKind"] {
  return value === "catalog_backed" || value === "discovered_fallback" ? value : "unknown";
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
      source,
      intent: normalizeIntent(raw.intent),
      targetKind: normalizeTargetKind(raw.targetKind)
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

function mapForKind(kind: "stack" | "block" | "molt", alignment: AlignmentMapSet): Record<string, AlignmentEntry> {
  return kind === "stack"
    ? alignment.stackIdMap
    : kind === "block"
      ? alignment.blockIdMap
      : alignment.moltIdMap;
}

function reverseCounts(map: Record<string, AlignmentEntry>): Map<string, number> {
  const counts = new Map<string, number>();
  for (const entry of Object.values(map)) {
    counts.set(entry.resolvedId, (counts.get(entry.resolvedId) ?? 0) + 1);
  }
  return counts;
}

export function alignRuntimeId(
  kind: "stack" | "block" | "molt",
  emittedId: string,
  alignment: AlignmentMapSet
): RuntimeAlignmentTraceEntry {
  const map = mapForKind(kind, alignment);
  const reverse = reverseCounts(map);
  const entry = map[emittedId];

  if (!entry) {
    return {
      kind,
      emittedId,
      resolvedId: emittedId,
      status: "unresolved",
      source: "no-alignment-entry",
      mode: "unresolved",
      targetKind: "unknown",
      intent: "unknown",
      cardinality: {
        resolvedTargetCount: 0,
        emittedSourceCount: 1
      }
    };
  }

  const emittedSourceCount = reverse.get(entry.resolvedId) ?? 1;
  const mode: AlignmentMode = emittedSourceCount > 1 ? "bridge_only_many_to_one" : "exact";

  return {
    kind,
    emittedId,
    resolvedId: entry.resolvedId,
    status: entry.status,
    source: entry.source,
    mode,
    targetKind: entry.targetKind ?? "unknown",
    intent: entry.intent ?? "unknown",
    cardinality: {
      resolvedTargetCount: 1,
      emittedSourceCount
    }
  };
}

export function collectManyToOneMappings(entries: RuntimeAlignmentTraceEntry[]): RuntimeAlignmentTraceEntry[] {
  return entries.filter((entry) => entry.mode === "bridge_only_many_to_one");
}
