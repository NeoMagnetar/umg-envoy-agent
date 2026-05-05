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
export declare function createApprovalResumeContract(record: ApprovalRecord): ApprovalResumeContract;
