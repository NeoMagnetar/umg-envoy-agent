import type { NormalizedArtifact } from "./block-library-config.js";
import type { UMGResolver } from "./resolver.js";
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
    duplicate_report: Array<{
        duplicate_id: string;
        kept_path: string;
        dropped_path: string;
        kept_reason: string;
        dropped_reason: string;
    }>;
    warnings: string[];
}
export declare function buildRegistry(resolver: UMGResolver): BuildRegistryResult;
