import type { NormalizedArtifact } from "../resolver/block-library-config.js";
import type { ActiveSleeveSelectionV0 } from "./sleeve-selection-types.js";
import type { RuntimeSpecGovernance } from "./types.js";
export declare function selectActiveSleeveDryRun(input: {
    user_task: string;
    registry_artifacts: NormalizedArtifact[];
    selected_neostacks: string[];
    selected_neoblocks: string[];
    selected_molt_blocks: string[];
    requested_tools: string[];
    requested_capabilities: string[];
    governance: RuntimeSpecGovernance;
}): ActiveSleeveSelectionV0;
