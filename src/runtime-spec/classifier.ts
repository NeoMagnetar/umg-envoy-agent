import type { NormalizedArtifact } from "../resolver/block-library-config.js";
import type { RuntimeSpecCompileInput } from "./types.js";

export interface RuntimeSpecCandidateSet {
  selectable: NormalizedArtifact[];
  support: NormalizedArtifact[];
}

export function classifyRuntimeSpecCandidates(input: RuntimeSpecCompileInput, runtimeArtifacts: NormalizedArtifact[], supportArtifacts: NormalizedArtifact[]): RuntimeSpecCandidateSet {
  const selectable = runtimeArtifacts.filter((artifact) => {
    if (!artifact.source.canonical) return false;
    if (artifact.runtime_selectable === false) return false;
    if (artifact.support_only) return false;
    if (!["ai_machine", "package_lane"].includes(artifact.source.source_kind)) return false;
    if (!["manifest", "index", "generated_index"].includes(artifact.source.discovery_method)) return false;
    if (!["active", "promoted_reference", "curated_first_population_pass", "placeholder_curated_surface_not_populated_yet"].includes(artifact.status)) return false;
    return true;
  });

  const support = supportArtifacts.filter((artifact) => artifact.support_only === true);
  return { selectable, support };
}
