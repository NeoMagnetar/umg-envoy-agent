import type { ApprovalRequestV0, ExecutionCheckpointRecordV0, ExecutionResumeReferenceV0, PreflightValidationResultV0 } from "./approval-checkpoint-contract-types.js";
import type { GovernedExecutionHandoffV0 } from "./governed-execution-handoff-types.js";
export declare function stableHash(value: unknown): string;
export declare function buildApprovalRequestDryRun(input: {
    handoff: GovernedExecutionHandoffV0;
    expiresAt?: string;
    localReadOnlyScope?: {
        redacted_root: string;
        recursive: boolean;
        max_depth: number;
        max_items: number;
    };
}): ApprovalRequestV0;
export declare function buildExecutionCheckpointRecordDryRun(input: {
    handoff: GovernedExecutionHandoffV0;
    approvalRequest?: ApprovalRequestV0;
    policyVersion?: string;
    localInspectionScopeHash?: string;
}): ExecutionCheckpointRecordV0;
export declare function buildExecutionResumeReferenceDryRun(input: {
    handoff: GovernedExecutionHandoffV0;
    checkpoint?: ExecutionCheckpointRecordV0;
    approvalRequest?: ApprovalRequestV0;
}): ExecutionResumeReferenceV0;
export declare function buildPreflightValidationDryRun(input: {
    handoff: GovernedExecutionHandoffV0;
    approvalRequest?: ApprovalRequestV0;
    checkpoint?: ExecutionCheckpointRecordV0;
    resumeReference?: ExecutionResumeReferenceV0;
    currentPolicyVersion?: string;
}): PreflightValidationResultV0;
