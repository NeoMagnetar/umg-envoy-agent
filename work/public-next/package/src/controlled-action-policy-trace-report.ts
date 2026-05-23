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
  stage:
    | 'policy_requirement'
    | 'route_state_check'
    | 'readiness_gate'
    | 'blocked_reason'
    | 'missing_requirement'
    | 'satisfied_requirement'
    | 'hard_boundary';
  sourceField: string;
  sourceValue: string | boolean | number | null;
  targetField: string;
  targetValue: string | boolean | number | null;
  result: 'satisfied' | 'missing' | 'invalid' | 'blocked' | 'not_required' | 'boundary_disabled' | 'metadata_only' | 'future_only';
  message: string;
}

function makeTrace(routeId: string, index: number, entry: Omit<ControlledActionPolicyTraceEntry, 'traceId'>): ControlledActionPolicyTraceEntry {
  return { traceId: `${routeId}.trace.${index + 1}`, ...entry };
}

export function projectControlledActionPolicyTraceReport(
  input: ControlledActionPolicyTraceReportInput,
): ControlledActionPolicyTraceReport {
  const rows = input.routes.map((route) => {
    const traceEntries: ControlledActionPolicyTraceEntry[] = [];
    let idx = 0;

    for (const [key, value] of Object.entries(route.policyRequirements)) {
      traceEntries.push(makeTrace(route.routeId, idx++, {
        stage: 'policy_requirement',
        sourceField: `policyRequirements.${key}`,
        sourceValue: value,
        targetField: `readinessResult.readinessGates.${key.replace('Required', '').replace('Present', '').replace('Validation', '')}`,
        targetValue: route.readinessResult.readinessGates[key.replace('Required', '').replace('Validation', '').replace('Present', '').replace(/^policy$/, 'policy')] ?? null,
        result: value ? 'future_only' : 'not_required',
        message: `Policy requirement ${key} evaluated as ${String(value)}.`,
      }));
    }

    for (const [key, value] of Object.entries(route.routeState)) {
      traceEntries.push(makeTrace(route.routeId, idx++, {
        stage: 'route_state_check',
        sourceField: `routeState.${key}`,
        sourceValue: value,
        targetField: `readinessResult.readinessGates.${key}`,
        targetValue: null,
        result: value === false ? 'missing' : 'satisfied',
        message: `Route state ${key} checked as ${String(value)}.`,
      }));
    }

    for (const [key, value] of Object.entries(route.readinessResult.readinessGates)) {
      traceEntries.push(makeTrace(route.routeId, idx++, {
        stage: 'readiness_gate',
        sourceField: `readinessResult.readinessGates.${key}`,
        sourceValue: value,
        targetField: 'readinessResult.readinessStatus',
        targetValue: route.readinessResult.readinessStatus,
        result: route.readinessResult.readinessStatus === 'metadata_only'
          ? 'metadata_only'
          : value === 'missing'
            ? 'missing'
            : value === 'invalid'
              ? 'invalid'
              : value === 'not_required'
                ? 'not_required'
                : route.readinessResult.executionEligibility === 'eligible_after_future_execution_lane'
                  ? 'future_only'
                  : 'satisfied',
        message: route.readinessResult.readinessStatus === 'metadata_only'
          ? `Readiness gate ${key} participates in metadata_only reporting.`
          : `Readiness gate ${key} resolved to ${String(value)}.`,
      }));
    }

    for (const reason of route.readinessResult.blockedReasons) {
      traceEntries.push(makeTrace(route.routeId, idx++, {
        stage: 'blocked_reason',
        sourceField: 'readinessResult.blockedReasons',
        sourceValue: reason,
        targetField: 'readinessResult.readinessStatus',
        targetValue: route.readinessResult.readinessStatus,
        result: route.routeClass === 'metadata_only' ? 'metadata_only' : route.readinessResult.executionEligibility === 'eligible_after_future_execution_lane' ? 'future_only' : 'blocked',
        message: `Blocked reason emitted: ${reason}.`,
      }));
    }

    for (const requirement of route.readinessResult.missingRequirements) {
      traceEntries.push(makeTrace(route.routeId, idx++, {
        stage: 'missing_requirement',
        sourceField: 'readinessResult.missingRequirements',
        sourceValue: requirement,
        targetField: `readinessResult.readinessGates.${requirement}`,
        targetValue: route.readinessResult.readinessGates[requirement] ?? null,
        result: 'missing',
        message: `Missing requirement recorded for ${requirement}.`,
      }));
    }

    for (const requirement of route.readinessResult.satisfiedRequirements) {
      traceEntries.push(makeTrace(route.routeId, idx++, {
        stage: 'satisfied_requirement',
        sourceField: 'readinessResult.satisfiedRequirements',
        sourceValue: requirement,
        targetField: `readinessResult.readinessGates.${requirement}`,
        targetValue: route.readinessResult.readinessGates[requirement] ?? null,
        result: 'satisfied',
        message: `Satisfied requirement recorded for ${requirement}.`,
      }));
    }

    for (const [name, value] of Object.entries({
      policyDoesNotEqualExecution: true,
      approvalDoesNotEqualExecution: true,
      checkpointDoesNotEqualExecution: true,
      dryRunDoesNotEqualExecution: true,
      decisionSimulationOnly: true,
      readinessDoesNotEqualExecution: true,
      traceReportDoesNotEqualExecution: true,
      executionPerformed: false,
    })) {
      traceEntries.push(makeTrace(route.routeId, idx++, {
        stage: 'hard_boundary',
        sourceField: name,
        sourceValue: value,
        targetField: name,
        targetValue: value,
        result: name === 'executionPerformed' ? 'boundary_disabled' : 'boundary_disabled',
        message: `Hard boundary ${name} remains ${String(value)}.`,
      }));
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
      routeClass: route.routeClass,
      riskLevel: route.riskLevel,
      readinessStatus: route.readinessResult.readinessStatus,
      executionEligibility: route.readinessResult.executionEligibility,
      traceEntries,
      blockedReasons: route.readinessResult.blockedReasons,
      missingRequirements: route.readinessResult.missingRequirements,
      satisfiedRequirements: route.readinessResult.satisfiedRequirements,
      executionPerformed: false,
      policyDoesNotEqualExecution: true,
      approvalDoesNotEqualExecution: true,
      checkpointDoesNotEqualExecution: true,
      dryRunDoesNotEqualExecution: true,
      decisionSimulationOnly: true,
      readinessDoesNotEqualExecution: true,
      traceReportDoesNotEqualExecution: true,
    } satisfies ControlledActionPolicyTraceRow;
  });

  return {
    reportId: input.reportId,
    generatedAt: input.generatedAt,
    policyTraceReportOnly: true,
    executionPerformed: false,
    rows,
    summary: {
      totalRoutes: rows.length,
      policyPresentRoutes: input.routes.filter((route) => route.policyRequirements.policyPresent).length,
      policyMissingRoutes: input.routes.filter((route) => !route.policyRequirements.policyPresent).length,
      blockedRoutes: rows.filter((row) => row.readinessStatus === 'blocked').length,
      metadataOnlyRoutes: rows.filter((row) => row.readinessStatus === 'metadata_only').length,
      futureActionCapableRoutes: rows.filter((row) => row.readinessStatus === 'future_action_capable').length,
      executionReadyFutureOnlyRoutes: rows.filter((row) => row.readinessStatus === 'execution_ready_future_only').length,
      totalTraceEntries: rows.reduce((sum, row) => sum + row.traceEntries.length, 0),
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
    },
  };
}
