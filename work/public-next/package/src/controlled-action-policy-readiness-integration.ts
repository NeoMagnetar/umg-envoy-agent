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

function requirementGate<T extends string>(required: boolean, ok: boolean, states: { ok: T; missing: T; notRequired: T }): T {
  if (!required) return states.notRequired;
  return ok ? states.ok : states.missing;
}

export function projectControlledActionPolicyToReadinessIntegration(
  input: ControlledActionPolicyToReadinessIntegrationInput,
): ControlledActionPolicyToReadinessIntegration {
  const rows = input.routes.map((route) => {
    const blockedReasons = new Set<string>();
    const actionLike = route.routeClass === 'action_capable' || route.routeClass === 'bridge_action_candidate';

    if (!route.policy.present && actionLike) blockedReasons.add('blocked_policy_missing');
    if (route.policy.approvalRequired && (!route.state.approvalPresent || !route.state.approvalValid)) blockedReasons.add('blocked_no_approval');
    if (route.policy.dryRunRequired && (!route.state.dryRunPresent || !route.state.dryRunValid)) blockedReasons.add('blocked_dry_run_required');
    if (route.policy.allowlistRequired && !route.state.allowlistSatisfied) blockedReasons.add('blocked_no_allowlist');
    if (route.policy.scopeValidationRequired && !route.state.scopeValid) blockedReasons.add('blocked_scope_invalid');
    if (route.policy.backupRequired && !route.state.backupSatisfied) blockedReasons.add('blocked_backup_required');
    if (route.policy.rollbackRequired && !route.state.rollbackSatisfied) blockedReasons.add('blocked_rollback_required');
    if (route.policy.bridgeImplementationRequired && !route.state.bridgeImplemented) blockedReasons.add('blocked_bridge_not_implemented');
    if (route.policy.writeActionsRequired && !route.state.writeActionsEnabled) blockedReasons.add('blocked_write_actions_disabled');
    if (route.policy.directSourceRequired && !route.state.directSourceEnabled) blockedReasons.add('blocked_direct_source_disabled');
    if (route.policy.automaticResponseTakeoverRequired && !route.state.automaticResponseTakeoverEnabled) blockedReasons.add('blocked_automatic_takeover_disabled');

    const readinessGates = {
      policy: route.policy.present ? 'present' : 'missing',
      approval: route.policy.approvalRequired
        ? (!route.state.approvalPresent ? 'missing' : route.state.approvalValid ? 'satisfied' : 'invalid')
        : 'not_required',
      checkpoint: route.policy.approvalRequired
        ? (!route.state.checkpointPresent ? 'missing' : route.state.checkpointValid ? 'satisfied' : 'invalid')
        : 'not_required',
      decisionSimulation: route.policy.approvalRequired ? (route.state.decisionSimulationPresent ? 'present' : 'missing') : 'not_required',
      dryRun: route.policy.dryRunRequired
        ? (!route.state.dryRunPresent ? 'missing' : route.state.dryRunValid ? 'satisfied' : 'invalid')
        : 'not_required',
      allowlist: requirementGate(route.policy.allowlistRequired, route.state.allowlistSatisfied, { ok: 'satisfied', missing: 'missing', notRequired: 'not_required' }),
      scope: route.policy.scopeValidationRequired ? (route.state.scopeValid ? 'valid' : 'invalid') : 'not_required',
      backup: requirementGate(route.policy.backupRequired, route.state.backupSatisfied, { ok: 'satisfied', missing: 'required_missing', notRequired: 'not_required' }),
      rollback: requirementGate(route.policy.rollbackRequired, route.state.rollbackSatisfied, { ok: 'satisfied', missing: 'required_missing', notRequired: 'not_required' }),
      bridgeImplementation: requirementGate(route.policy.bridgeImplementationRequired, route.state.bridgeImplemented, { ok: 'available', missing: 'missing', notRequired: 'not_required' }),
      writeActions: route.policy.writeActionsRequired ? (route.state.writeActionsEnabled ? 'enabled' : 'disabled') : 'not_required',
      directSource: route.policy.directSourceRequired ? (route.state.directSourceEnabled ? 'enabled' : 'disabled') : 'not_required',
      automaticResponseTakeover: route.policy.automaticResponseTakeoverRequired ? (route.state.automaticResponseTakeoverEnabled ? 'enabled' : 'disabled') : 'not_required',
    } as const;

    const missingRequirements: string[] = [];
    const satisfiedRequirements: string[] = [];
    Object.entries(readinessGates).forEach(([key, value]) => {
      if (['missing', 'invalid', 'required_missing', 'disabled'].includes(value)) missingRequirements.push(key);
      if (['present', 'satisfied', 'valid', 'available', 'enabled'].includes(value)) satisfiedRequirements.push(key);
    });

    let readinessStatus: ControlledActionPolicyToReadinessIntegrationRow['readinessStatus'] = 'blocked';
    let executionEligibility: ControlledActionPolicyToReadinessIntegrationRow['executionEligibility'] = 'ineligible';

    const onlyAuthorityBoundaries = Array.from(blockedReasons).every((reason) => [
      'blocked_write_actions_disabled',
      'blocked_direct_source_disabled',
      'blocked_automatic_takeover_disabled',
    ].includes(reason));

    if (route.routeClass === 'metadata_only') {
      readinessStatus = 'metadata_only';
      executionEligibility = 'ineligible';
    } else if (!route.policy.present && actionLike) {
      readinessStatus = 'policy_missing';
      executionEligibility = 'ineligible';
    } else if (blockedReasons.size === 0) {
      readinessStatus = 'future_action_capable';
      executionEligibility = 'future_only';
    } else if (onlyAuthorityBoundaries) {
      readinessStatus = 'execution_ready_future_only';
      executionEligibility = 'eligible_after_future_execution_lane';
    } else {
      readinessStatus = 'blocked';
      executionEligibility = route.policy.present ? 'future_only' : 'ineligible';
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
      routeClass: route.routeClass,
      riskLevel: route.riskLevel,
      policyPresent: route.policy.present,
      policyRequirements: route.policy,
      readinessGates,
      blockedReasons: Array.from(blockedReasons),
      missingRequirements,
      satisfiedRequirements,
      readinessStatus,
      executionEligibility,
      executionPerformed: false,
      policyDoesNotEqualExecution: true,
      approvalDoesNotEqualExecution: true,
      checkpointDoesNotEqualExecution: true,
      dryRunDoesNotEqualExecution: true,
      decisionSimulationOnly: true,
      readinessDoesNotEqualExecution: true,
    } satisfies ControlledActionPolicyToReadinessIntegrationRow;
  });

  return {
    integrationId: input.integrationId,
    generatedAt: input.generatedAt,
    policyToReadinessIntegrationOnly: true,
    executionPerformed: false,
    policyDoesNotEqualExecution: true,
    readinessDoesNotEqualExecution: true,
    rows,
    summary: {
      totalRoutes: rows.length,
      policyPresentRoutes: rows.filter((row) => row.policyPresent).length,
      policyMissingRoutes: rows.filter((row) => !row.policyPresent).length,
      blockedRoutes: rows.filter((row) => row.readinessStatus === 'blocked').length,
      futureActionCapableRoutes: rows.filter((row) => row.readinessStatus === 'future_action_capable').length,
      executionReadyFutureOnlyRoutes: rows.filter((row) => row.readinessStatus === 'execution_ready_future_only').length,
      executionPerformedCount: 0,
    },
  };
}
