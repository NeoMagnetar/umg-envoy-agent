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
export declare function storeApprovalCheckpoint(checkpoint: ApprovalCheckpoint): ApprovalRecord;
export declare function getApprovalCheckpoint(approvalId: string): ApprovalRecord | undefined;
export declare function listApprovalCheckpoints(status?: ApprovalState): ApprovalRecord[];
export declare function validateApprovalTransition(record: ApprovalRecord, decision: ApprovalDecisionInput): {
    ok: boolean;
    nextState?: ApprovalState;
    error?: string;
};
export declare function decideApprovalCheckpoint(decision: ApprovalDecisionInput): {
    ok: boolean;
    record?: ApprovalRecord;
    error?: string;
};
