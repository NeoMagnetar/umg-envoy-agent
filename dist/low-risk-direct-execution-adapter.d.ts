import { type ToolResult, type RuntimeSpecBoundaryStatus, type TraceBoundaryStatus } from "./action-gate-types.js";
export declare const LOW_RISK_DIRECT_TOOL_IDS: readonly ["umg_envoy_status", "umg_envoy_validate_runtime_output", "umg_envoy_parse_path", "umg_envoy_validate_path", "umg_envoy_render_path", "umg_envoy_action_gate_runtime_report_view"];
export type LowRiskDirectToolId = (typeof LOW_RISK_DIRECT_TOOL_IDS)[number];
export type LowRiskDirectExecutionStatus = "executed_success" | "executed_failure" | "execution_blocked" | "execution_denied";
export interface LowRiskDirectExecutionRequest {
    toolId: string;
    input?: Record<string, unknown>;
    actionId?: string;
    toolName?: string;
    sourceRuntimeSpecBoundaryStatus?: RuntimeSpecBoundaryStatus | null;
    sourceRuntimeSpecNonExecuting?: boolean | null;
    sourceTraceBoundaryStatus?: TraceBoundaryStatus | null;
    sourceTraceAuditOnly?: boolean | null;
}
export interface LowRiskDirectExecutionResponse {
    ok: boolean;
    status: LowRiskDirectExecutionStatus;
    blocked: boolean;
    toolResult: ToolResult;
    output: unknown;
}
export declare function executeLowRiskDirectTool(request: LowRiskDirectExecutionRequest): LowRiskDirectExecutionResponse;
