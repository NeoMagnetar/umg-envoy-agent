export type ToolBindingStatus = "requested" | "available" | "blocked" | "requires_approval" | "metadata_only" | "mock_only" | "unavailable" | "unknown";
export type ToolRiskLevel = "none" | "low" | "medium" | "high" | "destructive";
export type ToolExecutionMode = "dry_run" | "metadata_only" | "mock_only" | "approval_required" | "blocked" | "approved_execution";
export interface SleeveToolBindingV0 {
    tool_id: string;
    label?: string;
    requested_by: {
        artifact_id: string;
        artifact_kind: "sleeve" | "neostack" | "neoblock" | "molt_block";
    };
    status: ToolBindingStatus;
    risk_level: ToolRiskLevel;
    execution_mode: ToolExecutionMode;
    approval_required: boolean;
    blocked_reason?: string;
    governance_policy?: string;
    provenance?: {
        source_kind?: string;
        discovery_method?: string;
        generated_from_lane?: string;
        path?: string;
    };
    warnings: string[];
}
