export interface ApprovalFlowProjection {
    packageVersion: string;
    approvalId: string;
    approvalFlowVersion: string;
    linkedActionId: string;
    linkedActionGatePolicyId: string;
    approvalState: string;
    allowedDecisions: string[];
    approvalRequestSummary: {
        approvalRequestId: string;
        requestedAt: string;
        requestedBy: string;
        previewRef: string;
        requestedScope: {
            scopeKind: string;
            scopeTarget: string;
            scopeBounded: boolean;
            nonTransferable: boolean;
        };
    };
    approvalDecisionSummary: {
        decision: string;
        decidedAt: string;
        decidedBy: string;
        reason: string;
    };
    previewRequirement: {
        required: boolean;
        reason: string;
    };
    dryRunRequirement: {
        required: boolean;
        reason: string;
    };
    approvalScope: {
        scopeKind: string;
        scopeTarget: string;
        scopeBounded: boolean;
        nonTransferable: boolean;
    };
    expirationState: {
        expires: boolean;
        expiresAt: string;
    };
    revocationState: {
        revocable: boolean;
        revokedNow: boolean;
    };
    supersessionState: {
        supersededNow: boolean;
        supersededByNewApproval: boolean;
    };
    auditTrailSummary: {
        auditRequired: boolean;
        auditRef: string;
        requestLogged: boolean;
        decisionLogged: boolean;
        previewRefLogged: boolean;
        executionPerformed: boolean;
    };
    executionEligibilityProjection: {
        executionEligible: boolean;
        executionBlocked: boolean;
        policyAllowsExecutionClass: boolean;
        bridgeImplementationPresent: boolean;
        reason: string;
    };
    approvalDoesNotEqualExecution: boolean;
}
export declare function projectApprovalFlowState(): ApprovalFlowProjection;
