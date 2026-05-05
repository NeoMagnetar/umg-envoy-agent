import type { NormalizedArtifact } from "./block-library-config.js";
export interface DuplicateRelationshipEntry {
    relationship: "canonical_artifact" | "supporting_human_doc" | "package_export" | "manifest_entry" | "index_entry" | "fallback_duplicate" | "schema_reference" | "readme_reference";
    reason: string;
    path: string;
    source_kind: string;
    discovery_method: string;
}
export interface DuplicateRelationshipGroup {
    duplicate_id: string;
    canonical_kept: DuplicateRelationshipEntry;
    related_entries: DuplicateRelationshipEntry[];
}
export declare function classifyRelationship(artifact: NormalizedArtifact): DuplicateRelationshipEntry["relationship"];
export declare function humanizeId(id: string): string;
export declare function pickCanonicalTitle(raw: Record<string, unknown>, fallbackPath: string, fallbackId: string): string;
export declare function pickCanonicalDescription(raw: Record<string, unknown>, markdownSummary?: string): string;
