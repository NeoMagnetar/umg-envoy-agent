import type { ApprovalRequestV0, ExecutionCheckpointRecordV0 } from "./approval-checkpoint-contract-types.js";
import type { GovernedExecutionHandoffV0 } from "./governed-execution-handoff-types.js";
import type { LocalReadOnlyInspectionScopeV0 } from "./local-readonly-inspection-types.js";
import type { RuntimeSpecV0 } from "./types.js";
export interface LocalReadOnlyInspectionPreflightResultV0 {
    preflight_id: string;
    runtime_spec_id: string;
    handoff_id: string;
    tool_id: "desktop_bridge.file_scan";
    status: "pass_future_only" | "approval_required" | "checkpoint_required" | "blocked" | "invalid";
    scope_hash: string;
    checks: {
        check: string;
        passed: boolean;
        reason: string;
    }[];
    execution_boundary: {
        local_inspection_performed: false;
        file_contents_read: false;
        write_performed: false;
        delete_performed: false;
        shell_command_executed: false;
        external_calls_performed: false;
        statement: "No local inspection performed.";
    };
    warnings: string[];
}
export interface LocalReadOnlyInspectionMockResultV0 {
    result_id: string;
    runtime_spec_id: string;
    handoff_id: string;
    approval_request_id?: string;
    checkpoint_id?: string;
    tool_id: "desktop_bridge.file_scan";
    status: "approval_required" | "checkpoint_required" | "preflight_pass_future_only" | "blocked" | "invalid";
    scope: LocalReadOnlyInspectionScopeV0;
    scope_hash: string;
    redacted_root: string;
    preflight: LocalReadOnlyInspectionPreflightResultV0;
    payload_policy: {
        payload_type: "read_only_file_metadata";
        contains_file_contents: false;
        contains_sensitive_data: false;
        redaction_required: boolean;
        max_items: number;
        max_depth: number;
    };
    execution_boundary: {
        local_inspection_performed: false;
        file_contents_read: false;
        write_performed: false;
        delete_performed: false;
        external_calls_performed: false;
        shell_command_executed: false;
        statement: "No local inspection performed.";
    };
    warnings: string[];
}
export declare function buildLocalReadOnlyInspectionScope(input: {
    root_path: string;
    recursive?: boolean;
    max_depth?: number;
    max_items?: number;
    include_hidden?: boolean;
    include_system_paths?: boolean;
    include_file_contents?: boolean;
    allowed_extensions?: string[];
    blocked_extensions?: string[];
    reason?: string;
}): LocalReadOnlyInspectionScopeV0;
export declare function hashLocalReadOnlyInspectionScope(scope: LocalReadOnlyInspectionScopeV0): string;
export declare function validateLocalReadOnlyInspectionScopeDryRun(input: {
    scope: LocalReadOnlyInspectionScopeV0;
}): {
    allowed: boolean;
    blocked_reasons: string[];
    warnings: string[];
};
export declare function buildLocalReadOnlyInspectionPreflightDryRun(input: {
    runtimeSpec: RuntimeSpecV0;
    handoff: GovernedExecutionHandoffV0;
    approvalRequest?: ApprovalRequestV0;
    checkpoint?: ExecutionCheckpointRecordV0;
    scope: LocalReadOnlyInspectionScopeV0;
}): LocalReadOnlyInspectionPreflightResultV0;
export declare function buildLocalReadOnlyInspectionMockResultDryRun(input: {
    runtimeSpec: RuntimeSpecV0;
    handoff: GovernedExecutionHandoffV0;
    approvalRequest?: ApprovalRequestV0;
    checkpoint?: ExecutionCheckpointRecordV0;
    scope: LocalReadOnlyInspectionScopeV0;
}): LocalReadOnlyInspectionMockResultV0;
export declare function redactScopePath(root_path: string): string;
export declare function normalizeScopePath(root_path: string): string;
