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
    id: string;
    kind: import("./block-library-config.js").ArtifactKind;
    title: string | undefined;
    score: number;
    canonical: boolean;
    source_kind: import("./block-library-config.js").SourceKind;
    discovery_method: import("./block-library-config.js").DiscoveryMethod;
    status: string;
    path: string;
    reasons: string[];
    warnings: string[];
}[];
