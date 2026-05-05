export type GeneratedLane = "ai_molt_blocks" | "ai_neoblocks" | "ai_neostacks" | "ai_sleeves" | "ai_capabilities" | "ai_schemas" | "ai_manifests" | "package_sleeves" | "package_sleeve_manifests";
export interface GeneratedIndexEntry {
    id: string;
    kind: string;
    path: string;
    source_kind: "ai_machine" | "package_lane" | "schema_or_manifest";
    discovery_method: "generated_index";
    canonical_status: "canonical" | "sample" | "unknown";
    generated_from_lane: GeneratedLane;
}
export declare function classifyApprovedGeneratedIndexLane(filePath: string): GeneratedLane | null;
export declare function generatedSourceKind(lane: GeneratedLane): GeneratedIndexEntry["source_kind"];
export declare function generatedCanonicalStatus(lane: GeneratedLane): GeneratedIndexEntry["canonical_status"];
export declare function normalizeGeneratedPath(filePath: string): string;
