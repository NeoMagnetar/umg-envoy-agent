import type { ApprovalCheckpoint, ApprovalState } from "./types.js";

export interface ApprovalDecisionInput {
  approval_id: string;
  decision: "approve" | "deny" | "edit";
  decided_by: string;
  decided_at?: string;
  edited_input?: Record<string, unknown> | null;
  reason?: string;
  execute_now: false;
}

export interface ApprovalRecord extends ApprovalCheckpoint {
  decision?: ApprovalDecisionInput;
  updated_at: string;
}

const store = new Map<string, ApprovalRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function nextStateFromDecision(decision: ApprovalDecisionInput["decision"]): ApprovalState {
  switch (decision) {
    case "approve": return "approval_granted";
    case "deny": return "approval_denied";
    case "edit": return "approval_edited";
  }
}

export function storeApprovalCheckpoint(checkpoint: ApprovalCheckpoint): ApprovalRecord {
  const record: ApprovalRecord = {
    ...checkpoint,
    updated_at: nowIso()
  };
  store.set(checkpoint.approval_id, record);
  return record;
}

export function getApprovalCheckpoint(approvalId: string): ApprovalRecord | undefined {
  return store.get(approvalId);
}

export function listApprovalCheckpoints(status?: ApprovalState): ApprovalRecord[] {
  const values = [...store.values()];
  return status ? values.filter((item) => item.status === status) : values;
}

export function validateApprovalTransition(record: ApprovalRecord, decision: ApprovalDecisionInput): { ok: boolean; nextState?: ApprovalState; error?: string } {
  if (!record) {
    return { ok: false, error: "approval checkpoint not found" };
  }
  if (record.status !== "approval_pending") {
    return { ok: false, error: `approval checkpoint is not pending: ${record.status}` };
  }
  return { ok: true, nextState: nextStateFromDecision(decision.decision) };
}

export function decideApprovalCheckpoint(decision: ApprovalDecisionInput): { ok: boolean; record?: ApprovalRecord; error?: string } {
  const existing = store.get(decision.approval_id);
  if (!existing) {
    return { ok: false, error: "approval checkpoint not found" };
  }

  const validated = validateApprovalTransition(existing, decision);
  if (!validated.ok || !validated.nextState) {
    return { ok: false, error: validated.error ?? "invalid approval transition" };
  }

  const updated: ApprovalRecord = {
    ...existing,
    status: validated.nextState,
    decision: {
      ...decision,
      decided_at: decision.decided_at ?? nowIso(),
      execute_now: false
    },
    updated_at: nowIso()
  };
  store.set(updated.approval_id, updated);
  return { ok: true, record: updated };
}
