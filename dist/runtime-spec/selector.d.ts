import type { NormalizedArtifact } from "../resolver/block-library-config.js";
import type { RuntimeSpecCompileInput, RuntimeKind } from "./types.js";
export declare function selectRuntimeArtifacts(input: RuntimeSpecCompileInput, selectable: NormalizedArtifact[], support: NormalizedArtifact[]): {
    runtime_kind: RuntimeKind;
    active_sleeve: string | null;
    active_neostacks: string[];
    active_neoblocks: string[];
    active_molt_blocks: string[];
    support_artifacts: string[];
    warnings: string[];
    candidates: {
        sleeve: NormalizedArtifact;
        neostack: NormalizedArtifact;
        neoblock: NormalizedArtifact;
        molt: NormalizedArtifact;
    };
};
