import type { ApprovalRequestV0, ExecutionCheckpointRecordV0, ExecutionResumeReferenceV0, PreflightValidationResultV0 } from "./approval-checkpoint-contract-types.js";
import type { GovernedExecutionAlphaResultV0 } from "./governed-execution-alpha-types.js";
import type { GovernedExecutionHandoffV0 } from "./governed-execution-handoff-types.js";
import type { RuntimeIRMatrixV0 } from "./ir-matrix-types.js";
import type { RuntimeMOLTMapV0 } from "./molt-map-types.js";
import type { RuntimeSpecV0, RuntimeVisibilityMode } from "./types.js";
import type { RuntimeVisibilityHeader } from "./visibility.js";
export interface RuntimeDashboardOptions {
    include_molt_map?: boolean;
    include_ir_matrix?: boolean;
    include_governed_handoff?: boolean;
    include_approval_checkpoint?: boolean;
    include_governed_alpha?: boolean;
    governed_alpha_tool_id?: string;
    governed_alpha_query?: string;
    governed_alpha_kind?: string;
    governed_alpha_limit?: number;
    mode?: RuntimeVisibilityMode;
}
export interface RuntimeDashboardV0 {
    header: RuntimeVisibilityHeader;
    molt_map?: RuntimeMOLTMapV0;
    ir_matrix?: RuntimeIRMatrixV0;
    governed_handoff?: GovernedExecutionHandoffV0;
    approval_request?: ApprovalRequestV0;
    checkpoint_record?: ExecutionCheckpointRecordV0;
    resume_reference?: ExecutionResumeReferenceV0;
    preflight?: PreflightValidationResultV0;
    governed_alpha?: GovernedExecutionAlphaResultV0;
    execution_statement: string;
    matrix_available: boolean;
}
export declare function buildRuntimeDashboard(spec: RuntimeSpecV0, options?: RuntimeDashboardOptions): RuntimeDashboardV0;
export declare function renderRuntimeDashboard(dashboard: RuntimeDashboardV0): string;
