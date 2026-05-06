import type { SleeveToolBindingV0, ToolExecutionMode, ToolRiskLevel } from "./tool-binding-policy-types.js";
export type GovernedExecutionHandoffStatus = "not_requested" | "draft" | "requires_approval" | "blocked" | "metadata_only" | "mock_only" | "ready_for_approval" | "approved_future_only";
export interface GovernedApprovalItemV0 {
    tool_id: string;
    risk_level: ToolRiskLevel;
    execution_mode: ToolExecutionMode;
    requested_by: {
        artifact_id: string;
        artifact_kind: string;
    };
    reason: string;
    approval_prompt_preview?: string;
    status: "requires_approval" | "blocked" | "future_only";
}
export interface GovernedBlockedItemV0 {
    tool_id: string;
    risk_level: ToolRiskLevel;
    blocked_reason: string;
    governance_policy?: string;
    requested_by?: {
        artifact_id: string;
        artifact_kind: string;
    };
}
export interface GovernedExecutionHandoffV0 {
    handoff_id: string;
    runtime_spec_id: string;
    trace_id: string;
    matrix_id?: string;
    molt_map_id?: string;
    source: "RuntimeSpecV0";
    mode: "dry_run";
    selected_context: {
        runtime_kind: string;
        active_sleeve: string | null;
        active_neostacks: string[];
        active_neoblocks: string[];
        active_molt_blocks: string[];
    };
    tool_plan: {
        requested: string[];
        available: string[];
        requires_approval: string[];
        blocked: string[];
        metadata_only: string[];
        mock_only: string[];
        bindings: SleeveToolBindingV0[];
    };
    approval: {
        approval_required: boolean;
        approval_items: GovernedApprovalItemV0[];
        approval_status: "not_required" | "required" | "blocked" | "future_only";
    };
    checkpoint: {
        checkpoint_required: boolean;
        checkpoint_policy: "not_required" | "required_before_execution" | "future_only";
        resume_policy: "not_applicable" | "resume_requires_checkpoint" | "future_only";
    };
    blocking: {
        blocked: boolean;
        blocked_items: GovernedBlockedItemV0[];
        blocked_reason?: string;
    };
    execution_boundary: {
        execution_performed: false;
        live_activation_performed: false;
        external_calls_performed: false;
        statement: "No tools executed.";
    };
    warnings: string[];
}
