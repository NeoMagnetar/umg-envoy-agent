export interface ControlledActionAuditPacketInput {
    packetId: string;
    generatedAt?: string;
    runtimeVersion?: string;
    packageVersion?: string;
    routes: ControlledActionAuditPacketRouteInput[];
}
export interface ControlledActionAuditPacketRouteInput {
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
    linkedPolicyTraceReportId?: string;
    routeClass: 'metadata_only' | 'read_only' | 'action_capable' | 'bridge_action_candidate';
    riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
    policySummary: {
        policyPresent: boolean;
        requiredGates: string[];
    };
    approvalSummary: {
        approvalPresent: boolean;
        approvalValid: boolean;
        checkpointPresent: boolean;
        checkpointValid: boolean;
        decisionSimulationPresent: boolean;
    };
    dryRunSummary: {
        dryRunPresent: boolean;
        dryRunValid: boolean;
        dryRunOnly: boolean;
    };
    blockedRouteSummary: {
        routeStatus: string;
        blockedReasons: string[];
        missingRequirements: string[];
        satisfiedRequirements: string[];
    };
    readinessSummary: {
        readinessStatus: string;
        executionEligibility: string;
        readinessGates: Record<string, string>;
    };
    traceSummary: {
        traceEntryCount: number;
        traceStages: string[];
        hardBoundaryCount: number;
    };
}
export interface ControlledActionAuditPacket {
    packetId: string;
    generatedAt?: string;
    runtimeVersion?: string;
    packageVersion?: string;
    auditPacketOnly: true;
    executionPerformed: false;
    routes: ControlledActionAuditPacketRoute[];
    summary: ControlledActionAuditPacketSummary;
    hardBoundaries: {
        policyDoesNotEqualExecution: true;
        approvalDoesNotEqualExecution: true;
        checkpointDoesNotEqualExecution: true;
        dryRunDoesNotEqualExecution: true;
        decisionSimulationOnly: true;
        readinessDoesNotEqualExecution: true;
        traceReportDoesNotEqualExecution: true;
        auditPacketDoesNotEqualExecution: true;
    };
}
export interface ControlledActionAuditPacketRoute {
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
    linkedPolicyTraceReportId?: string;
    routeClass: string;
    riskLevel: string;
    auditStatus: 'metadata_only' | 'audit_ready_blocked' | 'audit_ready_future_action_capable' | 'audit_ready_execution_future_only' | 'audit_incomplete';
    evidence: {
        policy: 'present' | 'missing';
        approval: 'present_valid' | 'present_invalid' | 'missing';
        checkpoint: 'present_valid' | 'present_invalid' | 'missing';
        decisionSimulation: 'present' | 'missing';
        dryRun: 'present_valid' | 'present_invalid' | 'missing';
        blockedRouteSummary: 'present' | 'missing';
        readinessMatrix: 'present' | 'missing';
        policyToReadinessIntegration: 'present' | 'missing';
        policyTraceReport: 'present' | 'missing';
    };
    blockedReasons: string[];
    missingRequirements: string[];
    satisfiedRequirements: string[];
    traceEntryCount: number;
    traceStages: string[];
    hardBoundaryCount: number;
    executionPerformed: false;
    policyDoesNotEqualExecution: true;
    approvalDoesNotEqualExecution: true;
    checkpointDoesNotEqualExecution: true;
    dryRunDoesNotEqualExecution: true;
    decisionSimulationOnly: true;
    readinessDoesNotEqualExecution: true;
    traceReportDoesNotEqualExecution: true;
    auditPacketDoesNotEqualExecution: true;
}
export interface ControlledActionAuditPacketSummary {
    totalRoutes: number;
    metadataOnlyRoutes: number;
    blockedRoutes: number;
    futureActionCapableRoutes: number;
    executionFutureOnlyRoutes: number;
    auditIncompleteRoutes: number;
    totalBlockedReasons: number;
    totalMissingRequirements: number;
    totalSatisfiedRequirements: number;
    totalTraceEntries: number;
    executionPerformedCount: 0;
}
export declare function projectControlledActionAuditPacket(input: ControlledActionAuditPacketInput): ControlledActionAuditPacket;
