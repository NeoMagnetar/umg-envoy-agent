import type { NormalizedArtifact } from "./block-library-config.js";
import type { UMGResolver } from "./resolver.js";
import { type DuplicateRelationshipGroup } from "./canonicalize.js";
export interface BuildRegistryResult {
    artifacts: NormalizedArtifact[];
    support_artifacts: NormalizedArtifact[];
    counts: {
        by_kind: Record<string, number>;
        by_source_kind: Record<string, number>;
        by_status: Record<string, number>;
        by_discovery_method: Record<string, number>;
        canonical_count: number;
        non_canonical_count: number;
        sample_count: number;
        human_support_count: number;
        duplicate_count: number;
        warning_count: number;
    };
    duplicate_report: DuplicateRelationshipGroup[];
    warnings_summary: {
        duplicate_id_groups: number;
        malformed_manifest_entries: number;
        fallback_only_core_artifacts: number;
        human_support_docs: number;
    };
    warnings: string[];
}
export declare function buildRegistry(resolver: UMGResolver): BuildRegistryResult;
