export interface ControlledActionPolicyTraceReportInput {
    reportId: string;
    generatedAt?: string;
    routes: ControlledActionPolicyTraceRouteInput[];
}
export interface ControlledActionPolicyTraceRouteInput {
    routeId: string;
    linkedActionId?: string;
    linkedPolicyId?: string;
    linkedApprovalId?: string;
    linkedCheckpointId?: string;
    linkedDecisionSimulationId?: string;
    linkedDryRunId?: string;
    linkedBlockedRouteSummaryId?: string;
    linkedReadinessMatrixId?: string;
    linkedPolicyToReadinessIntegrationId?: string;
    routeClass: 'metadata_only' | 'read_only' | 'action_capable' | 'bridge_action_candidate';
    riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
    policyRequirements: {
        policyPresent: boolean;
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
    routeState: {
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
    readinessResult: {
        readinessStatus: 'metadata_only' | 'policy_missing' | 'blocked' | 'future_action_capable' | 'execution_ready_future_only';
        executionEligibility: 'ineligible' | 'future_only' | 'eligible_after_future_execution_lane';
        readinessGates: Record<string, string>;
        blockedReasons: string[];
        missingRequirements: string[];
        satisfiedRequirements: string[];
    };
}
export interface ControlledActionPolicyTraceReport {
    reportId: string;
    generatedAt?: string;
    policyTraceReportOnly: true;
    executionPerformed: false;
    rows: ControlledActionPolicyTraceRow[];
    summary: {
        totalRoutes: number;
        policyPresentRoutes: number;
        policyMissingRoutes: number;
        blockedRoutes: number;
        metadataOnlyRoutes: number;
        futureActionCapableRoutes: number;
        executionReadyFutureOnlyRoutes: number;
        totalTraceEntries: number;
        executionPerformedCount: 0;
    };
    hardBoundaries: {
        policyDoesNotEqualExecution: true;
        approvalDoesNotEqualExecution: true;
        checkpointDoesNotEqualExecution: true;
        dryRunDoesNotEqualExecution: true;
        decisionSimulationOnly: true;
        readinessDoesNotEqualExecution: true;
        traceReportDoesNotEqualExecution: true;
    };
}
export interface ControlledActionPolicyTraceRow {
    routeId: string;
    linkedActionId?: string;
    linkedPolicyId?: string;
    linkedApprovalId?: string;
    linkedCheckpointId?: string;
    linkedDecisionSimulationId?: string;
    linkedDryRunId?: string;
    linkedBlockedRouteSummaryId?: string;
    linkedReadinessMatrixId?: string;
    linkedPolicyToReadinessIntegrationId?: string;
    routeClass: string;
    riskLevel: string;
    readinessStatus: string;
    executionEligibility: string;
    traceEntries: ControlledActionPolicyTraceEntry[];
    blockedReasons: string[];
    missingRequirements: string[];
    satisfiedRequirements: string[];
    executionPerformed: false;
    policyDoesNotEqualExecution: true;
    approvalDoesNotEqualExecution: true;
    checkpointDoesNotEqualExecution: true;
    dryRunDoesNotEqualExecution: true;
    decisionSimulationOnly: true;
    readinessDoesNotEqualExecution: true;
    traceReportDoesNotEqualExecution: true;
}
export interface ControlledActionPolicyTraceEntry {
    traceId: string;
    stage: 'policy_requirement' | 'route_state_check' | 'readiness_gate' | 'blocked_reason' | 'missing_requirement' | 'satisfied_requirement' | 'hard_boundary';
    sourceField: string;
    sourceValue: string | boolean | number | null;
    targetField: string;
    targetValue: string | boolean | number | null;
    result: 'satisfied' | 'missing' | 'invalid' | 'blocked' | 'not_required' | 'boundary_disabled' | 'metadata_only' | 'future_only';
    message: string;
}
export declare function projectControlledActionPolicyTraceReport(input: ControlledActionPolicyTraceReportInput): ControlledActionPolicyTraceReport;
