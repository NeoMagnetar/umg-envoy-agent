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
export declare function loadRuntimeLegendAlignment(paths: ResolvedPaths): AlignmentMapSet;
export declare function alignRuntimeId(kind: "stack" | "block" | "molt", emittedId: string, alignment: AlignmentMapSet): RuntimeAlignmentTraceEntry;
