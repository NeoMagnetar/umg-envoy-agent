import type { NormalizedArtifact } from "./block-library-config.js";
import type { UMGResolver } from "./resolver.js";
export interface BuildRegistryResult {
    artifacts: NormalizedArtifact[];
    counts: {
        by_kind: Record<string, number>;
        by_source_kind: Record<string, number>;
        by_status: Record<string, number>;
        by_discovery_method: Record<string, number>;
    };
    warnings: string[];
}
export declare function buildRegistry(resolver: UMGResolver): BuildRegistryResult;
