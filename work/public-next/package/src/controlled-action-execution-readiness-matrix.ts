import { projectControlledActionBlockedRouteSummary } from './controlled-action-blocked-route-summary.js';

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
  readinessStatus:
    | 'metadata_only'
    | 'blocked'
    | 'future_action_capable'
    | 'dry_run_ready'
    | 'approval_ready'
    | 'policy_ready'
    | 'execution_ineligible'
    | 'execution_ready_future_only';
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

function deriveBlockedReasons(input: ControlledActionExecutionReadinessRouteInput): string[] {
  const blockedReasons = new Set(input.blockedReasons ?? []);
  const actionLike = input.routeClass === 'action_capable' || input.routeClass === 'bridge_action_candidate';

  if (!input.policyPresent) blockedReasons.add('blocked_policy');
  if (actionLike && (!input.approvalPresent || !input.approvalValid)) blockedReasons.add('blocked_no_approval');
  if (actionLike && (!input.dryRunPresent || !input.dryRunValid)) blockedReasons.add('blocked_dry_run_required');
  if (actionLike && !input.allowlistSatisfied) blockedReasons.add('blocked_no_allowlist');
  if (!input.scopeValid) blockedReasons.add('blocked_scope_invalid');
  if (input.backupRequired && !input.backupSatisfied) blockedReasons.add('blocked_backup_required');
  if (input.rollbackRequired && !input.rollbackSatisfied) blockedReasons.add('blocked_rollback_required');
  if (input.routeClass === 'bridge_action_candidate' && !input.bridgeImplemented) blockedReasons.add('blocked_bridge_not_implemented');
  if (actionLike && !input.writeActionsEnabled) blockedReasons.add('blocked_write_actions_disabled');
  if (!input.directSourceEnabled) blockedReasons.add('blocked_direct_source_disabled');
  if (!input.automaticResponseTakeoverEnabled) blockedReasons.add('blocked_automatic_takeover_disabled');
  return Array.from(blockedReasons);
}

function deriveReadinessRow(input: ControlledActionExecutionReadinessRouteInput): ControlledActionExecutionReadinessRow {
  const blockedReasons = deriveBlockedReasons(input);
  const gates = {
    policy: input.policyPresent ? 'present' : 'missing',
    approval: input.routeClass === 'metadata_only' || input.routeClass === 'read_only'
      ? 'not_required'
      : input.approvalPresent
        ? (input.approvalValid ? 'valid' : 'invalid')
        : 'missing',
    checkpoint: input.routeClass === 'metadata_only' || input.routeClass === 'read_only'
      ? 'not_required'
      : input.checkpointPresent
        ? (input.checkpointValid ? 'valid' : 'invalid')
        : 'missing',
    decisionSimulation: input.routeClass === 'metadata_only' ? 'not_required' : (input.decisionSimulationPresent ? 'present' : 'missing'),
    dryRun: input.routeClass === 'metadata_only'
      ? 'not_required'
      : input.dryRunPresent
        ? (input.dryRunValid ? 'valid' : 'invalid')
        : 'missing',
    allowlist: input.routeClass === 'metadata_only' ? 'not_required' : (input.allowlistSatisfied ? 'satisfied' : 'missing'),
    scope: input.scopeValid ? 'valid' : 'invalid',
    backup: input.backupRequired ? (input.backupSatisfied ? 'satisfied' : 'required_missing') : 'not_required',
    rollback: input.rollbackRequired ? (input.rollbackSatisfied ? 'satisfied' : 'required_missing') : 'not_required',
    bridgeImplementation: input.routeClass === 'bridge_action_candidate' ? (input.bridgeImplemented ? 'available' : 'missing') : 'not_required',
    writeActions: input.writeActionsEnabled ? 'enabled' : 'disabled',
    directSource: input.directSourceEnabled ? 'enabled' : 'disabled',
    automaticResponseTakeover: input.automaticResponseTakeoverEnabled ? 'enabled' : 'disabled',
  } as const;

  const missingRequirements: string[] = [];
  const satisfiedRequirements: string[] = [];
  Object.entries(gates).forEach(([key, value]) => {
    if (['missing', 'invalid', 'required_missing', 'disabled'].includes(value)) missingRequirements.push(key);
    if (['present', 'valid', 'satisfied', 'available'].includes(value)) satisfiedRequirements.push(key);
  });

  let readinessStatus: ControlledActionExecutionReadinessRow['readinessStatus'] = 'blocked';
  let executionEligibility: ControlledActionExecutionReadinessRow['executionEligibility'] = 'ineligible';

  const onlyBoundaryBlocks = blockedReasons.every((reason) => [
    'blocked_write_actions_disabled',
    'blocked_direct_source_disabled',
    'blocked_automatic_takeover_disabled',
  ].includes(reason));

  if (input.routeClass === 'metadata_only') {
    readinessStatus = 'metadata_only';
    executionEligibility = 'ineligible';
  } else if (
    input.policyPresent && input.approvalPresent && input.approvalValid && input.checkpointPresent && input.checkpointValid &&
    input.decisionSimulationPresent && input.dryRunPresent && input.dryRunValid && input.allowlistSatisfied && input.scopeValid &&
    (!input.backupRequired || input.backupSatisfied) && (!input.rollbackRequired || input.rollbackSatisfied) &&
    input.bridgeImplemented && !input.writeActionsEnabled && !input.directSourceEnabled && !input.automaticResponseTakeoverEnabled && onlyBoundaryBlocks
  ) {
    readinessStatus = 'execution_ready_future_only';
    executionEligibility = 'eligible_after_future_execution_lane';
  } else if (blockedReasons.length > 0) {
    readinessStatus = 'blocked';
    executionEligibility = input.policyPresent ? 'future_only' : 'ineligible';
  } else if (input.policyPresent && input.approvalPresent && input.approvalValid && input.checkpointPresent && input.checkpointValid) {
    readinessStatus = 'approval_ready';
    executionEligibility = 'future_only';
  } else if (input.policyPresent) {
    readinessStatus = 'policy_ready';
    executionEligibility = 'future_only';
  }

  return {
    routeId: input.routeId,
    linkedActionId: input.linkedActionId,
    linkedPolicyId: input.linkedPolicyId,
    linkedApprovalId: input.linkedApprovalId,
    linkedCheckpointId: input.linkedCheckpointId,
    linkedDecisionSimulationId: input.linkedDecisionSimulationId,
    linkedDryRunId: input.linkedDryRunId,
    linkedBlockedRouteSummaryId: input.linkedBlockedRouteSummaryId,
    routeClass: input.routeClass,
    riskLevel: input.riskLevel,
    readinessStatus,
    gates,
    blockedReasons,
    missingRequirements,
    satisfiedRequirements,
    executionEligibility,
    executionPerformed: false,
    readinessMatrixOnly: true,
    approvalDoesNotEqualExecution: true,
    checkpointDoesNotEqualExecution: true,
    dryRunDoesNotEqualExecution: true,
    decisionSimulationOnly: true,
    readinessDoesNotEqualExecution: true,
  };
}

export function projectControlledActionExecutionReadinessMatrix(
  input?: ControlledActionExecutionReadinessMatrixInput,
): ControlledActionExecutionReadinessMatrix {
  const defaultInput = input ?? buildDefaultInputFromBlockedSummary();
  const rows = defaultInput.routes.map(deriveReadinessRow);

  return {
    matrixId: defaultInput.matrixId,
    generatedAt: defaultInput.generatedAt,
    readinessMatrixOnly: true,
    readinessDoesNotEqualExecution: true,
    executionPerformed: false,
    rows,
    summary: {
      totalRoutes: rows.length,
      blockedRoutes: rows.filter((row) => row.readinessStatus === 'blocked').length,
      metadataOnlyRoutes: rows.filter((row) => row.readinessStatus === 'metadata_only').length,
      futureActionCapableRoutes: rows.filter((row) => row.readinessStatus === 'future_action_capable').length,
      dryRunReadyRoutes: rows.filter((row) => row.readinessStatus === 'dry_run_ready').length,
      approvalReadyRoutes: rows.filter((row) => row.readinessStatus === 'approval_ready').length,
      executionReadyFutureOnlyRoutes: rows.filter((row) => row.readinessStatus === 'execution_ready_future_only').length,
      executionPerformedCount: 0,
    },
  };
}

function buildDefaultInputFromBlockedSummary(): ControlledActionExecutionReadinessMatrixInput {
  const blockedSummary = projectControlledActionBlockedRouteSummary();

  return {
    matrixId: 'controlled-action-execution-readiness-matrix.v1',
    generatedAt: '2026-05-23T06:06:00Z',
    routes: blockedSummary.routes.map((route) => ({
      routeId: route.routeId,
      linkedActionId: route.linkedActionId,
      linkedPolicyId: route.linkedPolicyId,
      linkedApprovalId: route.linkedApprovalId ?? undefined,
      linkedCheckpointId: route.linkedCheckpointId ?? undefined,
      linkedDecisionSimulationId: route.linkedDecisionSimulationId ?? undefined,
      linkedDryRunId: route.linkedDryRunId ?? undefined,
      linkedBlockedRouteSummaryId: route.blockedRouteSummaryId,
      routeClass: route.routeClass === 'forbidden_action'
        ? 'metadata_only'
        : route.routeClass === 'bounded_mutation_action'
          ? 'bridge_action_candidate'
          : 'action_capable',
      riskLevel: route.riskLevel === 'forbidden'
        ? 'none'
        : route.riskLevel === 'high_mutation'
          ? 'high'
          : 'low',
      policyPresent: true,
      approvalPresent: Boolean(route.linkedApprovalId),
      approvalValid: route.requiredApprovalState === 'approved',
      checkpointPresent: Boolean(route.linkedCheckpointId),
      checkpointValid: route.requiredApprovalState === 'approved',
      decisionSimulationPresent: Boolean(route.linkedDecisionSimulationId),
      dryRunPresent: Boolean(route.linkedDryRunId),
      dryRunValid: route.requiredDryRunState !== 'not_required',
      allowlistSatisfied: route.requiredAllowlistState === 'not_required',
      scopeValid: route.requiredScopeValidation.validNow,
      backupRequired: route.requiredBackupState !== 'not_required',
      backupSatisfied: false,
      rollbackRequired: route.requiredRollbackState !== 'not_required',
      rollbackSatisfied: false,
      bridgeImplemented: route.bridgeImplementationStatus === 'available',
      writeActionsEnabled: false,
      directSourceEnabled: false,
      automaticResponseTakeoverEnabled: false,
      blockedReasons: route.blockedReasons,
    })),
  };
}
