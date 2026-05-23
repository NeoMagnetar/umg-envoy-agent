export type ApprovalDecisionSimulationInput = 'approve' | 'deny' | 'edit' | 'revoke' | 'expire' | 'supersede' | 'dry_run_only';
export interface ApprovalDecisionSimulationResult {
    packageVersion: string;
    checkpointId: string;
    originalCheckpointState: string;
    originalApprovalState: string;
    requestedDecision: ApprovalDecisionSimulationInput;
    decisionAccepted: boolean;
    decisionRejectedReason: string | null;
    resultingCheckpointState: string;
    resultingApprovalState: string;
    executionEligibilityProjection: {
        executionEligible: boolean;
        executionBlocked: boolean;
        reason: string;
    };
    previewStillRequired: boolean;
    dryRunStillRequired: boolean;
    updatedAuditTrailSummary: {
        auditRequired: boolean;
        auditRef: string;
        requestLogged: boolean;
        decisionLogged: boolean;
        previewRefLogged: boolean;
        executionPerformed: boolean;
    };
    executionPerformed: boolean;
    decisionSimulationOnly: boolean;
    checkpointDoesNotEqualExecution: boolean;
    approvalDoesNotEqualExecution: boolean;
}
export declare function simulateApprovalDecision(requestedDecision: ApprovalDecisionSimulationInput): ApprovalDecisionSimulationResult;
