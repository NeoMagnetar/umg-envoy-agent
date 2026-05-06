import type { ApprovalRequestV0, ExecutionCheckpointRecordV0, PreflightValidationResultV0 } from "./approval-checkpoint-contract-types.js";
import type { GovernedExecutionAlphaResultV0 } from "./governed-execution-alpha-types.js";
import type { GovernedExecutionHandoffV0 } from "./governed-execution-handoff-types.js";
import type { RuntimeSpecV0 } from "./types.js";
export declare function executeGovernedAlpha(input: {
    tool_id: string;
    runtimeSpec: RuntimeSpecV0;
    handoff: GovernedExecutionHandoffV0;
    approvalRequest?: ApprovalRequestV0;
    checkpoint?: ExecutionCheckpointRecordV0;
    preflight: PreflightValidationResultV0;
    query?: string;
    kind?: string;
    limit?: number;
}): GovernedExecutionAlphaResultV0;
export declare function executeGovernedAlphaMetadataOnly(input: {
    tool_id: "resolver.library_status" | "resolver.library_search" | "tool.capability_summary";
    runtimeSpec: RuntimeSpecV0;
    handoff: GovernedExecutionHandoffV0;
    approvalRequest?: ApprovalRequestV0;
    checkpoint?: ExecutionCheckpointRecordV0;
    preflight: PreflightValidationResultV0;
    query?: string;
    kind?: string;
    limit?: number;
}): GovernedExecutionAlphaResultV0;
