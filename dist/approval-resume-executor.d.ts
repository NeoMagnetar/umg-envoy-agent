import type { ApprovalRecord } from "./approval-store.js";
import type { TraceEvent } from "./langchain-bridge-adapter.js";
export interface ApprovalResumeExecutionBinding {
    execute(toolName: string, payload: Record<string, unknown>): Promise<unknown>;
}
export interface ResumeExecutionRecord {
    idempotency_key: string;
    execution_status: "not_started" | "running" | "completed" | "failed";
    executed_at: string | null;
}
export declare function executeApprovalResume(record: ApprovalRecord, binding: ApprovalResumeExecutionBinding): Promise<{
    ok: boolean;
    status: string;
    executed: boolean;
    error: string;
    trace: TraceEvent[];
    resumeContract?: undefined;
    idempotency?: undefined;
    output?: undefined;
} | {
    ok: boolean;
    status: string;
    executed: boolean;
    error: string;
    trace: TraceEvent[];
    resumeContract: import("./approval-resume-contract.js").ApprovalResumeContract;
    idempotency?: undefined;
    output?: undefined;
} | {
    ok: boolean;
    status: string;
    executed: boolean;
    error: string;
    trace: TraceEvent[];
    resumeContract: import("./approval-resume-contract.js").ApprovalResumeContract;
    idempotency: ResumeExecutionRecord;
    output?: undefined;
} | {
    ok: boolean;
    status: string;
    executed: boolean;
    output: unknown;
    trace: TraceEvent[];
    resumeContract: import("./approval-resume-contract.js").ApprovalResumeContract;
    idempotency: ResumeExecutionRecord;
    error?: undefined;
}>;
