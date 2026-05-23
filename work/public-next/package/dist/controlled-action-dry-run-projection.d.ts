export interface ControlledActionDryRunProjection {
    packageVersion: string;
    dryRunId: string;
    linkedActionId: string;
    linkedPolicyId: string;
    linkedApprovalId: string;
    linkedCheckpointId: string;
    linkedDecisionSimulationId: string;
    dryRunState: string;
    dryRunRequestSummary: {
        requestedAt: string;
        requestedBy: string;
        requestedScope: {
            scopeKind: string;
            scopeTarget: string;
            scopeBounded: boolean;
            deniedOperationFamilies?: string[];
            blastRadius?: string;
        };
        requestedTargets: {
            targetKind: string;
            targets: string[];
        };
    };
    dryRunResultSummary: {
        resultState: string;
        wouldExecuteLater: boolean;
        currentlyBlocked: boolean;
        actualExecutionUnavailableInThisBuild: boolean;
    };
    requiredPreconditions: string[];
    blockedPreconditions: string[];
    scopePreview: {
        scopeKind: string;
        scopeTarget: string;
        scopeBounded: boolean;
        deniedOperationFamilies?: string[];
        blastRadius?: string;
    };
    targetPreview: {
        targetKind: string;
        targets: string[];
    };
    expectedSideEffects: {
        wouldTouchExternalState: boolean;
        currentlyBlocked: boolean;
        description: string;
    };
    rollbackPreview: {
        rollbackRequired: boolean;
        reversibility: string;
    };
    backupPreview: {
        backupRequired: boolean;
        backupTargetDescription: string;
    };
    auditPreview: {
        auditRequired: boolean;
        wouldRecord: string[];
    };
    riskConfirmation: {
        actionClass: string;
        riskLevel: string;
        approvalRequired: boolean;
        allowlistRequired: boolean;
        routeBlockedNow: boolean;
    };
    executionEligibilityAfterDryRun: {
        executionEligible: boolean;
        executionBlocked: boolean;
        reason: string;
    };
    dryRunOnly: boolean;
    executionPerformed: boolean;
    dryRunDoesNotEqualExecution: boolean;
    approvalDoesNotEqualExecution: boolean;
    checkpointDoesNotEqualExecution: boolean;
}
export declare function projectControlledActionDryRun(): ControlledActionDryRunProjection;
