import type { NormalizedArtifact } from "./block-library-config.js";
export interface RegistrySearchQuery {
    text?: string;
    kinds?: string[];
    domains?: string[];
    capabilities?: string[];
    tags?: string[];
    status?: string[];
    limit?: number;
}
export declare function searchRegistry(artifacts: NormalizedArtifact[], query: RegistrySearchQuery): {
    artifact: NormalizedArtifact;
    score: number;
    reasons: string[];
}[];
