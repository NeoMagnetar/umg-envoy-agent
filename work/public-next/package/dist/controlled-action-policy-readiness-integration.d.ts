export interface ControlledActionPolicyToReadinessIntegrationInput {
    integrationId: string;
    generatedAt?: string;
    routes: ControlledActionPolicyToReadinessRouteInput[];
}
export interface ControlledActionPolicyToReadinessRouteInput {
    routeId: string;
    linkedActionId?: string;
    linkedPolicyId?: string;
    linkedApprovalId?: string;
    linkedCheckpointId?: string;
    linkedDecisionSimulationId?: string;
    linkedDryRunId?: string;
    linkedBlockedRouteSummaryId?: string;
    linkedReadinessMatrixId?: string;
    routeClass: 'metadata_only' | 'read_only' | 'action_capable' | 'bridge_action_candidate';
    riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
    policy: {
        present: boolean;
        approvalRequired: boolean;
        dryRunRequired: boolean;
        allowlistRequired: boolean;
        scopeValidationRequired: boolean;
        backupRequired: boolean;
        rollbackRequired: boolean;
        bridgeImplementationRequired: boolean;
        writeActionsRequired: boolean;
        directSourceRequired: boolean;
        automaticResponseTakeoverRequired: boolean;
    };
    state: {
        approvalPresent: boolean;
        approvalValid: boolean;
        checkpointPresent: boolean;
        checkpointValid: boolean;
        decisionSimulationPresent: boolean;
        dryRunPresent: boolean;
        dryRunValid: boolean;
        allowlistSatisfied: boolean;
        scopeValid: boolean;
        backupSatisfied: boolean;
        rollbackSatisfied: boolean;
        bridgeImplemented: boolean;
        writeActionsEnabled: boolean;
        directSourceEnabled: boolean;
        automaticResponseTakeoverEnabled: boolean;
    };
}
export interface ControlledActionPolicyToReadinessIntegration {
    integrationId: string;
    generatedAt?: string;
    policyToReadinessIntegrationOnly: true;
    executionPerformed: false;
    policyDoesNotEqualExecution: true;
    readinessDoesNotEqualExecution: true;
    rows: ControlledActionPolicyToReadinessIntegrationRow[];
    summary: {
        totalRoutes: number;
        policyPresentRoutes: number;
        policyMissingRoutes: number;
        blockedRoutes: number;
        futureActionCapableRoutes: number;
        executionReadyFutureOnlyRoutes: number;
        executionPerformedCount: 0;
    };
}
export interface ControlledActionPolicyToReadinessIntegrationRow {
    routeId: string;
    linkedActionId?: string;
    linkedPolicyId?: string;
    linkedApprovalId?: string;
    linkedCheckpointId?: string;
    linkedDecisionSimulationId?: string;
    linkedDryRunId?: string;
    linkedBlockedRouteSummaryId?: string;
    linkedReadinessMatrixId?: string;
    routeClass: string;
    riskLevel: string;
    policyPresent: boolean;
    policyRequirements: {
        approvalRequired: boolean;
        dryRunRequired: boolean;
        allowlistRequired: boolean;
        scopeValidationRequired: boolean;
        backupRequired: boolean;
        rollbackRequired: boolean;
        bridgeImplementationRequired: boolean;
        writeActionsRequired: boolean;
        directSourceRequired: boolean;
        automaticResponseTakeoverRequired: boolean;
    };
    readinessGates: {
        policy: 'present' | 'missing';
        approval: 'satisfied' | 'missing' | 'invalid' | 'not_required';
        checkpoint: 'satisfied' | 'missing' | 'invalid' | 'not_required';
        decisionSimulation: 'present' | 'missing' | 'not_required';
        dryRun: 'satisfied' | 'missing' | 'invalid' | 'not_required';
        allowlist: 'satisfied' | 'missing' | 'not_required';
        scope: 'valid' | 'invalid' | 'not_required' | 'unknown';
        backup: 'satisfied' | 'required_missing' | 'not_required';
        rollback: 'satisfied' | 'required_missing' | 'not_required';
        bridgeImplementation: 'available' | 'missing' | 'not_required';
        writeActions: 'enabled' | 'disabled' | 'not_required';
        directSource: 'enabled' | 'disabled' | 'not_required';
        automaticResponseTakeover: 'enabled' | 'disabled' | 'not_required';
    };
    blockedReasons: string[];
    missingRequirements: string[];
    satisfiedRequirements: string[];
    readinessStatus: 'metadata_only' | 'policy_missing' | 'blocked' | 'future_action_capable' | 'execution_ready_future_only';
    executionEligibility: 'ineligible' | 'future_only' | 'eligible_after_future_execution_lane';
    executionPerformed: false;
    policyDoesNotEqualExecution: true;
    approvalDoesNotEqualExecution: true;
    checkpointDoesNotEqualExecution: true;
    dryRunDoesNotEqualExecution: true;
    decisionSimulationOnly: true;
    readinessDoesNotEqualExecution: true;
}
export declare function projectControlledActionPolicyToReadinessIntegration(input: ControlledActionPolicyToReadinessIntegrationInput): ControlledActionPolicyToReadinessIntegration;
