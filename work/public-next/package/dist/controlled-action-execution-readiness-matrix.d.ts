export interface ControlledActionExecutionReadinessMatrixInput {
    matrixId: string;
    generatedAt?: string;
    routes: ControlledActionExecutionReadinessRouteInput[];
}
export interface ControlledActionExecutionReadinessRouteInput {
    routeId: string;
    linkedActionId?: string;
    linkedPolicyId?: string;
    linkedApprovalId?: string;
    linkedCheckpointId?: string;
    linkedDecisionSimulationId?: string;
    linkedDryRunId?: string;
    linkedBlockedRouteSummaryId?: string;
    routeClass: 'metadata_only' | 'read_only' | 'action_capable' | 'bridge_action_candidate';
    riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
    policyPresent: boolean;
    approvalPresent: boolean;
    approvalValid: boolean;
    checkpointPresent: boolean;
    checkpointValid: boolean;
    decisionSimulationPresent: boolean;
    dryRunPresent: boolean;
    dryRunValid: boolean;
    allowlistSatisfied: boolean;
    scopeValid: boolean;
    backupRequired: boolean;
    backupSatisfied: boolean;
    rollbackRequired: boolean;
    rollbackSatisfied: boolean;
    bridgeImplemented: boolean;
    writeActionsEnabled: boolean;
    directSourceEnabled: boolean;
    automaticResponseTakeoverEnabled: boolean;
    blockedReasons?: string[];
}
export interface ControlledActionExecutionReadinessMatrix {
    matrixId: string;
    generatedAt?: string;
    readinessMatrixOnly: true;
    readinessDoesNotEqualExecution: true;
    executionPerformed: false;
    rows: ControlledActionExecutionReadinessRow[];
    summary: ControlledActionExecutionReadinessSummary;
}
export interface ControlledActionExecutionReadinessRow {
    routeId: string;
    linkedActionId?: string;
    linkedPolicyId?: string;
    linkedApprovalId?: string;
    linkedCheckpointId?: string;
    linkedDecisionSimulationId?: string;
    linkedDryRunId?: string;
    linkedBlockedRouteSummaryId?: string;
    routeClass: string;
    riskLevel: string;
    readinessStatus: 'metadata_only' | 'blocked' | 'future_action_capable' | 'dry_run_ready' | 'approval_ready' | 'policy_ready' | 'execution_ineligible' | 'execution_ready_future_only';
    gates: {
        policy: 'present' | 'missing';
        approval: 'valid' | 'missing' | 'invalid' | 'not_required';
        checkpoint: 'valid' | 'missing' | 'invalid' | 'not_required';
        decisionSimulation: 'present' | 'missing' | 'not_required';
        dryRun: 'valid' | 'missing' | 'invalid' | 'not_required';
        allowlist: 'satisfied' | 'missing' | 'not_required';
        scope: 'valid' | 'invalid' | 'unknown';
        backup: 'satisfied' | 'required_missing' | 'not_required';
        rollback: 'satisfied' | 'required_missing' | 'not_required';
        bridgeImplementation: 'available' | 'missing' | 'not_required';
        writeActions: 'enabled' | 'disabled';
        directSource: 'enabled' | 'disabled';
        automaticResponseTakeover: 'enabled' | 'disabled';
    };
    blockedReasons: string[];
    missingRequirements: string[];
    satisfiedRequirements: string[];
    executionEligibility: 'ineligible' | 'future_only' | 'eligible_after_future_execution_lane';
    executionPerformed: false;
    readinessMatrixOnly: true;
    approvalDoesNotEqualExecution: true;
    checkpointDoesNotEqualExecution: true;
    dryRunDoesNotEqualExecution: true;
    decisionSimulationOnly: true;
    readinessDoesNotEqualExecution: true;
}
export interface ControlledActionExecutionReadinessSummary {
    totalRoutes: number;
    blockedRoutes: number;
    metadataOnlyRoutes: number;
    futureActionCapableRoutes: number;
    dryRunReadyRoutes: number;
    approvalReadyRoutes: number;
    executionReadyFutureOnlyRoutes: number;
    executionPerformedCount: 0;
}
export declare function projectControlledActionExecutionReadinessMatrix(input?: ControlledActionExecutionReadinessMatrixInput): ControlledActionExecutionReadinessMatrix;
