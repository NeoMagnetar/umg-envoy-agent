import crypto from "node:crypto";
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

function event(payload: Partial<LangChainBridgePayload>, event_type: string, message: string, data: Record<string, unknown> = {}, tool_id: string | null = null): TraceEvent {
  return {
    event_type,
    timestamp_utc: new Date().toISOString(),
    sleeve_id: payload.sleeve_id ?? "UNKNOWN",
    neostack_id: payload.neostack_id ?? "NS.UMG.LANGCHAIN_BRIDGE.v0.1",
    tool_id,
    message,
    data
  };
}

function previewInput(payload: LangChainBridgePayload): Record<string, unknown> {
  const input = payload.task?.input;
  if (input && typeof input === "object" && !Array.isArray(input)) {
    return input as Record<string, unknown>;
  }
  return {};
}

export function createApprovalCheckpoint(payload: LangChainBridgePayload, tool: ToolDefinition, reason = "Tool requires human approval before execution."): ApprovalCheckpoint {
  const approval_id = `apr_${crypto.randomUUID().replace(/-/g, "")}`;
  const trace: TraceEvent[] = [];

  trace.push(event(payload, "APPROVAL_CHECKPOINT_REQUIRED", "Approval checkpoint required for tool.", { tool_name: tool.tool_name }, tool.tool_id));
  trace.push(event(payload, "APPROVAL_REQUEST_ID_ASSIGNED", "Approval request id assigned.", { approval_id, tool_name: tool.tool_name }, tool.tool_id));
  trace.push(event(payload, "APPROVAL_CHECKPOINT_CREATED", "Approval checkpoint created.", { approval_id, tool_name: tool.tool_name }, tool.tool_id));
  trace.push(event(payload, "APPROVAL_TOOL_EXECUTION_WITHHELD", "Approval-required tool execution withheld pending decision.", { approval_id, tool_name: tool.tool_name }, tool.tool_id));
  trace.push(event(payload, "APPROVAL_DECISION_PENDING", "Approval decision is pending.", { approval_id, tool_name: tool.tool_name }, tool.tool_id));
  trace.push(event(payload, "APPROVAL_CHECKPOINT_RETURNED", "Approval checkpoint returned to caller.", { approval_id, tool_name: tool.tool_name }, tool.tool_id));

  return {
    approval_id,
    status: "approval_pending",
    neostack_id: payload.neostack_id,
    sleeve_id: payload.sleeve_id,
    tool: {
      tool_id: tool.tool_id,
      tool_name: tool.tool_name,
      permission_level: tool.permission_level,
      risk_class: tool.risk_class
    },
    requested_action: {
      summary: payload.task?.user_intent || `Execute ${tool.tool_name}`,
      input_preview: previewInput(payload)
    },
    policy: {
      reason,
      may_execute_without_approval: false,
      allowed_decisions: ["approve", "deny", "edit"]
    },
    trace
  };
}
