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
  auditStatus:
    | 'metadata_only'
    | 'audit_ready_blocked'
    | 'audit_ready_future_action_capable'
    | 'audit_ready_execution_future_only'
    | 'audit_incomplete';
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

export function projectControlledActionAuditPacket(input: ControlledActionAuditPacketInput): ControlledActionAuditPacket {
  const routes = input.routes.map((route) => {
    const evidence = {
      policy: route.policySummary.policyPresent ? 'present' : 'missing',
      approval: !route.approvalSummary.approvalPresent
        ? 'missing'
        : route.approvalSummary.approvalValid ? 'present_valid' : 'present_invalid',
      checkpoint: !route.approvalSummary.checkpointPresent
        ? 'missing'
        : route.approvalSummary.checkpointValid ? 'present_valid' : 'present_invalid',
      decisionSimulation: route.approvalSummary.decisionSimulationPresent ? 'present' : 'missing',
      dryRun: !route.dryRunSummary.dryRunPresent
        ? 'missing'
        : route.dryRunSummary.dryRunValid ? 'present_valid' : 'present_invalid',
      blockedRouteSummary: route.linkedBlockedRouteSummaryId ? 'present' : 'missing',
      readinessMatrix: route.linkedReadinessMatrixId ? 'present' : 'missing',
      policyToReadinessIntegration: route.linkedPolicyToReadinessIntegrationId ? 'present' : 'missing',
      policyTraceReport: route.linkedPolicyTraceReportId ? 'present' : 'missing',
    } as const;

    let auditStatus: ControlledActionAuditPacketRoute['auditStatus'] = 'audit_incomplete';
    const coreEvidencePresent = evidence.blockedRouteSummary === 'present' && evidence.readinessMatrix === 'present' && evidence.policyToReadinessIntegration === 'present' && evidence.policyTraceReport === 'present' && evidence.policy === 'present';

    if (route.routeClass === 'metadata_only') {
      auditStatus = 'metadata_only';
    } else if (!coreEvidencePresent) {
      auditStatus = 'audit_incomplete';
    } else if (route.readinessSummary.readinessStatus === 'execution_ready_future_only') {
      auditStatus = 'audit_ready_execution_future_only';
    } else if (route.blockedRouteSummary.blockedReasons.length > 0) {
      auditStatus = 'audit_ready_blocked';
    } else if (route.readinessSummary.readinessStatus === 'future_action_capable') {
      auditStatus = 'audit_ready_future_action_capable';
    }

    return {
      routeId: route.routeId,
      linkedActionId: route.linkedActionId,
      linkedPolicyId: route.linkedPolicyId,
      linkedApprovalId: route.linkedApprovalId,
      linkedCheckpointId: route.linkedCheckpointId,
      linkedDecisionSimulationId: route.linkedDecisionSimulationId,
      linkedDryRunId: route.linkedDryRunId,
      linkedBlockedRouteSummaryId: route.linkedBlockedRouteSummaryId,
      linkedReadinessMatrixId: route.linkedReadinessMatrixId,
      linkedPolicyToReadinessIntegrationId: route.linkedPolicyToReadinessIntegrationId,
      linkedPolicyTraceReportId: route.linkedPolicyTraceReportId,
      routeClass: route.routeClass,
      riskLevel: route.riskLevel,
      auditStatus,
      evidence,
      blockedReasons: route.blockedRouteSummary.blockedReasons,
      missingRequirements: route.blockedRouteSummary.missingRequirements,
      satisfiedRequirements: route.blockedRouteSummary.satisfiedRequirements,
      traceEntryCount: route.traceSummary.traceEntryCount,
      traceStages: route.traceSummary.traceStages,
      hardBoundaryCount: route.traceSummary.hardBoundaryCount,
      executionPerformed: false,
      policyDoesNotEqualExecution: true,
      approvalDoesNotEqualExecution: true,
      checkpointDoesNotEqualExecution: true,
      dryRunDoesNotEqualExecution: true,
      decisionSimulationOnly: true,
      readinessDoesNotEqualExecution: true,
      traceReportDoesNotEqualExecution: true,
      auditPacketDoesNotEqualExecution: true,
    } satisfies ControlledActionAuditPacketRoute;
  });

  return {
    packetId: input.packetId,
    generatedAt: input.generatedAt,
    runtimeVersion: input.runtimeVersion,
    packageVersion: input.packageVersion,
    auditPacketOnly: true,
    executionPerformed: false,
    routes,
    summary: {
      totalRoutes: routes.length,
      metadataOnlyRoutes: routes.filter((route) => route.auditStatus === 'metadata_only').length,
      blockedRoutes: routes.filter((route) => route.auditStatus === 'audit_ready_blocked').length,
      futureActionCapableRoutes: routes.filter((route) => route.auditStatus === 'audit_ready_future_action_capable').length,
      executionFutureOnlyRoutes: routes.filter((route) => route.auditStatus === 'audit_ready_execution_future_only').length,
      auditIncompleteRoutes: routes.filter((route) => route.auditStatus === 'audit_incomplete').length,
      totalBlockedReasons: routes.reduce((sum, route) => sum + route.blockedReasons.length, 0),
      totalMissingRequirements: routes.reduce((sum, route) => sum + route.missingRequirements.length, 0),
      totalSatisfiedRequirements: routes.reduce((sum, route) => sum + route.satisfiedRequirements.length, 0),
      totalTraceEntries: routes.reduce((sum, route) => sum + route.traceEntryCount, 0),
      executionPerformedCount: 0,
    },
    hardBoundaries: {
      policyDoesNotEqualExecution: true,
      approvalDoesNotEqualExecution: true,
      checkpointDoesNotEqualExecution: true,
      dryRunDoesNotEqualExecution: true,
      decisionSimulationOnly: true,
      readinessDoesNotEqualExecution: true,
      traceReportDoesNotEqualExecution: true,
      auditPacketDoesNotEqualExecution: true,
    },
  };
}
