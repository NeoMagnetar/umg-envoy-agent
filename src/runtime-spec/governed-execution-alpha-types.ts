import type { ToolBindingStatus, ToolExecutionMode, ToolRiskLevel } from "./tool-binding-policy-types.js";

export type GovernedExecutionAlphaStatus =
  | "not_requested"
  | "eligible"
  | "preflight_required"
  | "preflight_failed"
  | "approval_required"
  | "blocked"
  | "ready_for_alpha_future_only"
  | "executed_future_alpha_only";

export type GovernedExecutionAlphaAllowedTool =
  | "mcp.server_metadata"
  | "tool.capability_summary"
  | "resolver.library_status"
  | "resolver.library_search"
  | "desktop_bridge.file_scan";

export type GovernedExecutionAlphaBlockedTool =
  | "desktop_bridge.file_write"
  | "desktop_bridge.file_delete"
  | "phasebridge.workflow_execute"
  | "mcp.real_remote_execution"
  | "langchain.agent_mode"
  | "repo.write"
  | "repo.publish"
  | "shell.command"
  | "npm.publish";

export interface GovernedExecutionAlphaResultV0 {
  execution_result_id: string;
  handoff_id: string;
  approval_request_id?: string;
  checkpoint_id?: string;
  runtime_spec_id: string;
  trace_id: string;

  mode: "governed_alpha";
  status:
    | "not_executed"
    | "blocked"
    | "preflight_failed"
    | "executed_metadata_only_future"
    | "executed_read_only_future";

  tool_id: string;
  tool_status: ToolBindingStatus;
  risk_level: ToolRiskLevel;
  execution_mode: ToolExecutionMode;

  preflight: {
    required: boolean;
    status: "pass_future_only" | "blocked" | "invalid";
    checks_passed: boolean;
  };

  approval: {
    required: boolean;
    approved: boolean;
    approval_scope?: string;
  };

  checkpoint: {
    required: boolean;
    checkpoint_written: false;
    checkpoint_id?: string;
  };

  result_payload_policy: {
    payload_type: "metadata" | "read_only_summary" | "none";
    contains_file_content: boolean;
    contains_sensitive_data: boolean;
    redaction_required: boolean;
  };

  execution_boundary: {
    tool_execution_performed: boolean;
    external_calls_performed: boolean;
    write_performed: false;
    delete_performed: false;
    statement: string;
  };

  warnings: string[];
}

export interface GovernedExecutionAlphaPreflightRuleV0 {
  check:
    | "tool_in_alpha_allowlist"
    | "tool_not_blocked"
    | "tool_not_unknown"
    | "tool_not_destructive"
    | "tool_not_write_delete_publish"
    | "tool_not_remote_execution"
    | "runtime_spec_hash_match"
    | "tool_plan_hash_match"
    | "selected_context_hash_match"
    | "approval_request_match_if_required"
    | "approval_scope_exact"
    | "policy_version_match"
    | "support_doc_tool_source_absent"
    | "result_payload_policy_defined";
  required: true;
  blocks_execution: true;
  reason: string;
}
