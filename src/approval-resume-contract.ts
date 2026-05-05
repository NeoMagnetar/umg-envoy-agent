import crypto from "node:crypto";
import type { TraceEvent } from "./langchain-bridge-adapter.js";
import type { ApprovalRecord } from "./approval-store.js";

export interface ApprovalResumeContract {
  resume_id: string;
  approval_id: string;
  status: "resume_prepared";
  may_execute: false;
  requires_next_phase_executor: true;
  approved_tool: {
    tool_id: string;
    tool_name: string;
    risk_class: string;
    permission_level: string;
  };
  approved_input: Record<string, unknown>;
  trace: TraceEvent[];
}

function traceFromRecord(record: ApprovalRecord, event_type: string, message: string, data: Record<string, unknown> = {}): TraceEvent {
  return {
    event_type,
    timestamp_utc: new Date().toISOString(),
    sleeve_id: record.sleeve_id,
    neostack_id: record.neostack_id,
    tool_id: record.tool.tool_id,
    message,
    data
  };
}

export function createApprovalResumeContract(record: ApprovalRecord): ApprovalResumeContract {
  const resume_id = `res_${crypto.randomUUID().replace(/-/g, "")}`;
  const approved_input = record.decision?.decision === "edit"
    ? record.decision.edited_input ?? {}
    : record.requested_action.input_preview ?? {};

  const trace: TraceEvent[] = [
    traceFromRecord(record, "APPROVAL_RESUME_PREPARE_REQUESTED", "Approval resume prepare requested.", { approval_id: record.approval_id, resume_id }),
    traceFromRecord(record, "APPROVAL_RESUME_CONTRACT_CREATED", "Approval resume contract created.", { approval_id: record.approval_id, resume_id }),
    traceFromRecord(record, "APPROVAL_RESUME_EXECUTION_WITHHELD", "Approval resume execution withheld until a later execution phase.", { approval_id: record.approval_id, resume_id })
  ];

  return {
    resume_id,
    approval_id: record.approval_id,
    status: "resume_prepared",
    may_execute: false,
    requires_next_phase_executor: true,
    approved_tool: {
      tool_id: record.tool.tool_id,
      tool_name: record.tool.tool_name,
      risk_class: record.tool.risk_class,
      permission_level: record.tool.permission_level
    },
    approved_input,
    trace
  };
}
