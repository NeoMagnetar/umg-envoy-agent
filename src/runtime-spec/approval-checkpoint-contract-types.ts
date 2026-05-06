import type { ToolExecutionMode, ToolRiskLevel } from "./tool-binding-policy-types.js";

export type ApprovalContractStatus =
  | "not_required"
  | "required"
  | "pending"
  | "approved_future_only"
  | "denied"
  | "blocked"
  | "expired"
  | "invalid";

export type CheckpointContractStatus =
  | "not_required"
  | "required"
  | "draft"
  | "ready_to_write_future_only"
  | "written_future_only"
  | "invalid"
  | "expired";

export type ResumeContractStatus =
  | "not_applicable"
  | "requires_checkpoint"
  | "resume_ready_future_only"
  | "invalid"
  | "expired";

export interface ApprovalRequestItemV0 {
  item_id: string;
  tool_id: string;
  requested_by: {
    artifact_id: string;
    artifact_kind: string;
  };
  risk_level: ToolRiskLevel;
  execution_mode: ToolExecutionMode;
  reason: string;
  user_visible_risk: string;
  approval_scope: "single_tool" | "single_handoff" | "single_runtime_spec";
  status: "requires_approval" | "blocked" | "future_only";
}

export interface ApprovalRequestV0 {
  approval_request_id: string;
  handoff_id: string;
  runtime_spec_id: string;
  trace_id: string;
  matrix_id?: string;
  molt_map_id?: string;

  status: ApprovalContractStatus;
  mode: "dry_run";

  requested_action_summary: string;

  selected_context: {
    runtime_kind: string;
    active_sleeve: string | null;
    active_neostacks: string[];
    active_neoblocks: string[];
    active_molt_blocks: string[];
  };

  approval_items: ApprovalRequestItemV0[];

  blocked_items: {
    tool_id: string;
    risk_level: ToolRiskLevel;
    reason: string;
    requested_by?: {
      artifact_id: string;
      artifact_kind: string;
    };
  }[];

  user_visible_summary: {
    title: string;
    plain_language_summary: string;
    tools_requested: string[];
    risks: string[];
    blocked_items: string[];
    checkpoint_required: boolean;
    execution_statement: "No tools executed.";
  };

  constraints: {
    expires_at?: string;
    single_use: boolean;
    exact_match_required: boolean;
    blocked_items_cannot_be_approved: boolean;
  };

  warnings: string[];
}

export interface ApprovalDecisionV0 {
  approval_decision_id: string;
  approval_request_id: string;
  decision: "approved" | "denied" | "expired" | "invalid";
  approved_item_ids: string[];
  denied_item_ids: string[];
  decided_at: string;
  decided_by: "user" | "governance" | "system";
  notes?: string;
  execution_authorized_future_only: false | "future_only";
}

export interface ExecutionCheckpointRecordV0 {
  checkpoint_id: string;
  handoff_id: string;
  approval_request_id?: string;
  runtime_spec_id: string;
  trace_id: string;

  status: CheckpointContractStatus;

  snapshot: {
    runtime_spec_hash: string;
    tool_plan_hash: string;
    selected_context_hash: string;
    approval_request_hash?: string;
    policy_version: string;
    extra_hashes?: {
      local_inspection_scope_hash?: string;
    };
  };

  replay_guard: {
    exact_match_required: true;
    expires_at?: string;
    blocked_if_policy_changed: true;
    blocked_if_runtime_spec_changed: true;
    blocked_if_tool_plan_changed: true;
  };

  execution_boundary: {
    execution_performed: false;
    checkpoint_written: false;
    statement: "No tools executed.";
  };

  warnings: string[];
}

export interface ExecutionResumeReferenceV0 {
  resume_reference_id: string;
  checkpoint_id: string;
  handoff_id: string;
  runtime_spec_id: string;

  status: ResumeContractStatus;

  resume_guard: {
    checkpoint_required: true;
    approval_required: boolean;
    exact_match_required: true;
    policy_revalidation_required: true;
  };

  execution_boundary: {
    resume_performed: false;
    execution_performed: false;
    statement: "No tools executed.";
  };
}

export interface ApprovalCheckpointPreflightCheckV0 {
  code:
    | "runtime_spec_match"
    | "tool_plan_match"
    | "selected_context_match"
    | "approval_request_match"
    | "approval_valid"
    | "approval_scope_match"
    | "blocked_tools_absent"
    | "unknown_tools_absent"
    | "policy_version_match"
    | "checkpoint_exists"
    | "resume_reference_valid"
    | "execution_mode_allowed"
    | "support_doc_source_rejected"
    | "user_visible_summary_match";
  required: true;
  passes_future_only: boolean;
  failure_blocks_execution: true;
  reason: string;
}

export interface PreflightValidationCheckV0 {
  check:
    | "runtime_spec_match"
    | "tool_plan_match"
    | "selected_context_match"
    | "approval_request_match"
    | "approval_scope_match"
    | "blocked_tools_absent"
    | "unknown_tools_absent"
    | "policy_version_match"
    | "checkpoint_required"
    | "resume_reference_valid"
    | "support_doc_tool_source_absent"
    | "execution_mode_not_blocked";
  passed: boolean;
  reason: string;
}

export interface PreflightValidationResultV0 {
  preflight_id: string;
  handoff_id: string;
  runtime_spec_id: string;
  status: "pass_future_only" | "blocked" | "invalid";
  checks: PreflightValidationCheckV0[];
  execution_boundary: {
    execution_performed: false;
    statement: "No tools executed.";
  };
  warnings: string[];
}
