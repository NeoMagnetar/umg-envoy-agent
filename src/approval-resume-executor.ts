import crypto from "node:crypto";
import type { ApprovalRecord } from "./approval-store.js";
import type { TraceEvent } from "./langchain-bridge-adapter.js";
import { createApprovalResumeContract } from "./approval-resume-contract.js";

export interface ApprovalResumeExecutionBinding {
  execute(toolName: string, payload: Record<string, unknown>): Promise<unknown>;
}

export interface ResumeExecutionRecord {
  idempotency_key: string;
  execution_status: "not_started" | "running" | "completed" | "failed";
  executed_at: string | null;
}

const resumeExecutionStore = new Map<string, ResumeExecutionRecord>();
const PHASE42_ALLOWLIST = new Set(["umg_envoy_matrix_status"]);

function trace(record: ApprovalRecord, event_type: string, message: string, data: Record<string, unknown> = {}): TraceEvent {
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

function stableInputHash(input: Record<string, unknown>): string {
  return crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

export async function executeApprovalResume(record: ApprovalRecord, binding: ApprovalResumeExecutionBinding) {
  const traceEvents: TraceEvent[] = [trace(record, "APPROVAL_RESUME_EXECUTION_REQUESTED", "Approval resume execution requested.", { approval_id: record.approval_id })];

  if (!["approval_granted", "approval_edited"].includes(record.status)) {
    traceEvents.push(trace(record, "APPROVAL_RESUME_EXECUTION_BLOCKED", "Approval resume execution blocked because approval is not granted or edited.", { approval_id: record.approval_id, status: record.status }));
    return { ok: false, status: "resume_execution_blocked", executed: false, error: `approval checkpoint is not executable: ${record.status}`, trace: traceEvents };
  }

  const resumeContract = createApprovalResumeContract(record);
  traceEvents.push(trace(record, "APPROVAL_RESUME_CONTRACT_VALIDATED", "Approval resume contract validated.", { approval_id: record.approval_id, resume_id: resumeContract.resume_id }));

  if (!PHASE42_ALLOWLIST.has(record.tool.tool_name)) {
    traceEvents.push(trace(record, "APPROVAL_RESUME_EXECUTION_BLOCKED", "Approval resume execution blocked because tool is not allowlisted for Phase 4.2.", { approval_id: record.approval_id, tool_name: record.tool.tool_name }));
    return { ok: false, status: "resume_execution_blocked", executed: false, error: `tool is not allowlisted for Phase 4.2: ${record.tool.tool_name}`, trace: traceEvents, resumeContract };
  }

  const approvedInput = resumeContract.approved_input ?? {};
  const idempotency_key = `${record.approval_id}:${record.tool.tool_id}:${stableInputHash(approvedInput)}`;
  traceEvents.push(trace(record, "APPROVAL_RESUME_IDEMPOTENCY_CHECKED", "Approval resume idempotency checked.", { approval_id: record.approval_id, idempotency_key }));

  const existing = resumeExecutionStore.get(idempotency_key);
  if (existing?.execution_status === "completed") {
    traceEvents.push(trace(record, "APPROVAL_RESUME_IDEMPOTENCY_BLOCKED", "Approval resume execution blocked by idempotency guard.", { approval_id: record.approval_id, idempotency_key }));
    return { ok: false, status: "resume_execution_blocked", executed: false, error: "resume execution already completed for this approval/input combination", trace: traceEvents, resumeContract, idempotency: existing };
  }

  resumeExecutionStore.set(idempotency_key, { idempotency_key, execution_status: "running", executed_at: null });
  traceEvents.push(trace(record, "APPROVAL_RESUME_EXECUTION_ALLOWED", "Approval resume execution allowed.", { approval_id: record.approval_id, tool_name: record.tool.tool_name }));
  traceEvents.push(trace(record, "APPROVAL_RESUME_EXECUTION_STARTED", "Approval resume execution started.", { approval_id: record.approval_id, tool_name: record.tool.tool_name }));

  try {
    const output = await binding.execute(record.tool.tool_name, approvedInput);
    const executionRecord: ResumeExecutionRecord = {
      idempotency_key,
      execution_status: "completed",
      executed_at: new Date().toISOString()
    };
    resumeExecutionStore.set(idempotency_key, executionRecord);
    traceEvents.push(trace(record, "APPROVAL_RESUME_EXECUTION_SUCCEEDED", "Approval resume execution succeeded.", { approval_id: record.approval_id, tool_name: record.tool.tool_name, idempotency_key }));
    return { ok: true, status: "resume_execution_complete", executed: true, output, trace: traceEvents, resumeContract, idempotency: executionRecord };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const executionRecord: ResumeExecutionRecord = {
      idempotency_key,
      execution_status: "failed",
      executed_at: null
    };
    resumeExecutionStore.set(idempotency_key, executionRecord);
    traceEvents.push(trace(record, "APPROVAL_RESUME_EXECUTION_FAILED", "Approval resume execution failed.", { approval_id: record.approval_id, tool_name: record.tool.tool_name, error: message, idempotency_key }));
    return { ok: false, status: "resume_execution_failed", executed: false, error: message, trace: traceEvents, resumeContract, idempotency: executionRecord };
  }
}
