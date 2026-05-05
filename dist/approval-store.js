const store = new Map();
function nowIso() {
    return new Date().toISOString();
}
function nextStateFromDecision(decision) {
    switch (decision) {
        case "approve": return "approval_granted";
        case "deny": return "approval_denied";
        case "edit": return "approval_edited";
    }
}
export function storeApprovalCheckpoint(checkpoint) {
    const record = {
        ...checkpoint,
        updated_at: nowIso()
    };
    store.set(checkpoint.approval_id, record);
    return record;
}
export function getApprovalCheckpoint(approvalId) {
    return store.get(approvalId);
}
export function listApprovalCheckpoints(status) {
    const values = [...store.values()];
    return status ? values.filter((item) => item.status === status) : values;
}
export function validateApprovalTransition(record, decision) {
    if (!record) {
        return { ok: false, error: "approval checkpoint not found" };
    }
    if (record.status !== "approval_pending") {
        return { ok: false, error: `approval checkpoint is not pending: ${record.status}` };
    }
    return { ok: true, nextState: nextStateFromDecision(decision.decision) };
}
export function decideApprovalCheckpoint(decision) {
    const existing = store.get(decision.approval_id);
    if (!existing) {
        return { ok: false, error: "approval checkpoint not found" };
    }
    const validated = validateApprovalTransition(existing, decision);
    if (!validated.ok || !validated.nextState) {
        return { ok: false, error: validated.error ?? "invalid approval transition" };
    }
    const updated = {
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
