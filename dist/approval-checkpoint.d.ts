import type { TraceEvent } from "./langchain-bridge-adapter.js";
import type { LangChainBridgePayload, ToolDefinition } from "./types.js";
export type ApprovalState = "approval_required" | "approval_pending" | "approval_granted" | "approval_denied" | "approval_expired" | "approval_cancelled" | "approval_edited";
export interface ApprovalCheckpoint {
    approval_id: string;
    status: ApprovalState;
    neostack_id: string;
    sleeve_id: string;
    tool: {
        tool_id: string;
        tool_name: string;
        permission_level: string;
        risk_class: string;
    };
    requested_action: {
        summary: string;
        input_preview: Record<string, unknown>;
    };
    policy: {
        reason: string;
        may_execute_without_approval: false;
        allowed_decisions: Array<"approve" | "deny" | "edit">;
    };
    trace: TraceEvent[];
}
export declare function createApprovalCheckpoint(payload: LangChainBridgePayload, tool: ToolDefinition, reason?: string): ApprovalCheckpoint;
