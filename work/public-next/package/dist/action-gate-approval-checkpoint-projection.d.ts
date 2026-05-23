export interface ApprovalCheckpointProjection {
    packageVersion: string;
    checkpointId: string;
    linkedApprovalId: string;
    linkedActionId: string;
    linkedPolicyId: string;
    checkpointState: string;
    approvalState: string;
    allowedDecisions: string[];
    requestedDecision: string | null;
    decisionResult: string | null;
    scopeBoundaries: {
        scopeKind: string;
        scopeTarget: string;
        scopeBounded: boolean;
        nonTransferable: boolean;
    };
    previewRequirement: {
        required: boolean;
        reason: string;
    };
    dryRunRequirement: {
        required: boolean;
        reason: string;
    };
    expiration: {
        expires: boolean;
        expiresAt: string;
    };
    auditTrailSummary: {
        auditRequired: boolean;
        auditRef: string;
        requestLogged: boolean;
        decisionLogged: boolean;
        previewRefLogged: boolean;
        executionPerformed: boolean;
    };
    executionEligibility: {
        executionEligible: boolean;
        executionBlocked: boolean;
        reason: string;
    };
    checkpointDoesNotEqualExecution: boolean;
    approvalDoesNotEqualExecution: boolean;
    executionPerformed: boolean;
}
export declare function projectApprovalCheckpointState(): ApprovalCheckpointProjection;
