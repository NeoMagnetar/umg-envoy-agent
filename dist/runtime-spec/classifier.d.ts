import type { NormalizedArtifact } from "../resolver/block-library-config.js";
import type { RuntimeSpecCompileInput } from "./types.js";
export interface RuntimeSpecCandidateSet {
    selectable: NormalizedArtifact[];
    support: NormalizedArtifact[];
}
export declare function classifyRuntimeSpecCandidates(input: RuntimeSpecCompileInput, runtimeArtifacts: NormalizedArtifact[], supportArtifacts: NormalizedArtifact[]): RuntimeSpecCandidateSet;
