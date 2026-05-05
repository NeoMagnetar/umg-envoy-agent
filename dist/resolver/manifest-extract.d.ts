export interface ManifestArtifactReference {
    id?: string;
    kind?: string;
    path?: string;
    title?: string;
    description?: string;
    sourceManifestPath: string;
    manifestKeyPath: string;
    raw: unknown;
}
export declare function extractManifestArtifactReferences(payload: unknown, sourceManifestPath: string): ManifestArtifactReference[];
