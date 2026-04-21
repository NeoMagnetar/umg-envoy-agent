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
export declare function loadRuntimeLegendAlignment(paths: ResolvedPaths): AlignmentMapSet;
export declare function alignRuntimeId(kind: "stack" | "block" | "molt", emittedId: string, alignment: AlignmentMapSet): RuntimeAlignmentTraceEntry;
export declare function collectManyToOneMappings(entries: RuntimeAlignmentTraceEntry[]): RuntimeAlignmentTraceEntry[];
