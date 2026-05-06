import type { NormalizedArtifact } from "../resolver/block-library-config.js";
import type { RuntimeSpecToolBindings, RuntimeSpecV0 } from "./types.js";
import type { SleeveToolBindingV0, ToolExecutionMode, ToolRiskLevel } from "./tool-binding-policy-types.js";
export interface KnownToolSurfaceV0 {
    tool_id: string;
    aliases?: string[];
    status?: "available" | "metadata_only" | "mock_only" | "blocked";
    default_risk_level?: ToolRiskLevel;
    default_execution_mode?: ToolExecutionMode;
    approval_required?: boolean;
    governance_policy?: string;
}
export declare const DEFAULT_KNOWN_TOOL_SURFACES: KnownToolSurfaceV0[];
export declare function classifySleeveToolBindingsDryRun(input: {
    runtimeSpec: RuntimeSpecV0;
    registryArtifacts: NormalizedArtifact[];
    selectedArtifacts?: NormalizedArtifact[];
    knownTools?: KnownToolSurfaceV0[];
}): RuntimeSpecToolBindings & {
    metadata_only: string[];
    mock_only: string[];
    unavailable: string[];
    unknown: string[];
    bindings: SleeveToolBindingV0[];
    warnings: string[];
};
