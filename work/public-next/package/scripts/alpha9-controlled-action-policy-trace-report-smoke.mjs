import assert from 'node:assert/strict';
import { projectControlledActionPolicyTraceReport } from '../dist/controlled-action-policy-trace-report.js';

const result = projectControlledActionPolicyTraceReport({
  reportId: 'smoke.alpha9.policy.trace.report',
  routes: [
    {
      routeId: 'policy_missing_route',
      routeClass: 'action_capable',
      riskLevel: 'medium',
      policyRequirements: {
        policyPresent: false,
        approvalRequired: false,
        dryRunRequired: false,
        allowlistRequired: false,
        scopeValidationRequired: false,
        backupRequired: false,
        rollbackRequired: false,
        bridgeImplementationRequired: false,
        writeActionsRequired: false,
        directSourceRequired: false,
        automaticResponseTakeoverRequired: false,
      },
      routeState: {
        approvalPresent: false,
        approvalValid: false,
        checkpointPresent: false,
        checkpointValid: false,
        decisionSimulationPresent: false,
        dryRunPresent: false,
        dryRunValid: false,
        allowlistSatisfied: false,
        scopeValid: false,
        backupSatisfied: false,
        rollbackSatisfied: false,
        bridgeImplemented: false,
        writeActionsEnabled: false,
        directSourceEnabled: false,
        automaticResponseTakeoverEnabled: false,
      },
      readinessResult: {
        readinessStatus: 'policy_missing',
        executionEligibility: 'ineligible',
        readinessGates: { policy: 'missing' },
        blockedReasons: ['blocked_policy_missing'],
        missingRequirements: ['policy'],
        satisfiedRequirements: [],
      },
    },
    {
      routeId: 'fully_blocked_route',
      routeClass: 'bridge_action_candidate',
      riskLevel: 'high',
      policyRequirements: {
        policyPresent: true,
        approvalRequired: true,
        dryRunRequired: true,
        allowlistRequired: true,
        scopeValidationRequired: true,
        backupRequired: true,
        rollbackRequired: true,
        bridgeImplementationRequired: true,
        writeActionsRequired: true,
        directSourceRequired: true,
        automaticResponseTakeoverRequired: true,
      },
      routeState: {
        approvalPresent: false,
        approvalValid: false,
        checkpointPresent: false,
        checkpointValid: false,
        decisionSimulationPresent: false,
        dryRunPresent: false,
        dryRunValid: false,
        allowlistSatisfied: false,
        scopeValid: false,
        backupSatisfied: false,
        rollbackSatisfied: false,
        bridgeImplemented: false,
        writeActionsEnabled: false,
        directSourceEnabled: false,
        automaticResponseTakeoverEnabled: false,
      },
      readinessResult: {
        readinessStatus: 'blocked',
        executionEligibility: 'future_only',
        readinessGates: {
          policy: 'present', approval: 'missing', checkpoint: 'missing', decisionSimulation: 'missing', dryRun: 'missing',
          allowlist: 'missing', scope: 'invalid', backup: 'required_missing', rollback: 'required_missing',
          bridgeImplementation: 'missing', writeActions: 'disabled', directSource: 'disabled', automaticResponseTakeover: 'disabled',
        },
        blockedReasons: [
          'blocked_no_approval','blocked_dry_run_required','blocked_no_allowlist','blocked_scope_invalid','blocked_backup_required',
          'blocked_rollback_required','blocked_bridge_not_implemented','blocked_write_actions_disabled','blocked_direct_source_disabled','blocked_automatic_takeover_disabled',
        ],
        missingRequirements: ['approval','checkpoint','decisionSimulation','dryRun','allowlist','scope','backup','rollback','bridgeImplementation','writeActions','directSource','automaticResponseTakeover'],
        satisfiedRequirements: ['policy'],
      },
    },
    {
      routeId: 'future_route',
      routeClass: 'action_capable',
      riskLevel: 'medium',
      policyRequirements: {
        policyPresent: true,
        approvalRequired: true,
        dryRunRequired: true,
        allowlistRequired: true,
        scopeValidationRequired: true,
        backupRequired: false,
        rollbackRequired: false,
        bridgeImplementationRequired: false,
        writeActionsRequired: true,
        directSourceRequired: true,
        automaticResponseTakeoverRequired: true,
      },
      routeState: {
        approvalPresent: true,
        approvalValid: true,
        checkpointPresent: true,
        checkpointValid: true,
        decisionSimulationPresent: true,
        dryRunPresent: true,
        dryRunValid: true,
        allowlistSatisfied: true,
        scopeValid: true,
        backupSatisfied: false,
        rollbackSatisfied: false,
        bridgeImplemented: false,
        writeActionsEnabled: false,
        directSourceEnabled: false,
        automaticResponseTakeoverEnabled: false,
      },
      readinessResult: {
        readinessStatus: 'execution_ready_future_only',
        executionEligibility: 'eligible_after_future_execution_lane',
        readinessGates: {
          policy: 'present', approval: 'satisfied', checkpoint: 'satisfied', decisionSimulation: 'present', dryRun: 'satisfied',
          allowlist: 'satisfied', scope: 'valid', backup: 'not_required', rollback: 'not_required', bridgeImplementation: 'not_required',
          writeActions: 'disabled', directSource: 'disabled', automaticResponseTakeover: 'disabled',
        },
        blockedReasons: ['blocked_write_actions_disabled','blocked_direct_source_disabled','blocked_automatic_takeover_disabled'],
        missingRequirements: ['writeActions','directSource','automaticResponseTakeover'],
        satisfiedRequirements: ['policy','approval','checkpoint','decisionSimulation','dryRun','allowlist','scope'],
      },
    },
    {
      routeId: 'metadata_route',
      routeClass: 'metadata_only',
      riskLevel: 'none',
      policyRequirements: {
        policyPresent: true,
        approvalRequired: false,
        dryRunRequired: false,
        allowlistRequired: false,
        scopeValidationRequired: false,
        backupRequired: false,
        rollbackRequired: false,
        bridgeImplementationRequired: false,
        writeActionsRequired: false,
        directSourceRequired: false,
        automaticResponseTakeoverRequired: false,
      },
      routeState: {
        approvalPresent: false,
        approvalValid: false,
        checkpointPresent: false,
        checkpointValid: false,
        decisionSimulationPresent: false,
        dryRunPresent: false,
        dryRunValid: false,
        allowlistSatisfied: false,
        scopeValid: true,
        backupSatisfied: false,
        rollbackSatisfied: false,
        bridgeImplemented: false,
        writeActionsEnabled: false,
        directSourceEnabled: false,
        automaticResponseTakeoverEnabled: false,
      },
      readinessResult: {
        readinessStatus: 'metadata_only',
        executionEligibility: 'ineligible',
        readinessGates: { policy: 'present' },
        blockedReasons: [],
        missingRequirements: [],
        satisfiedRequirements: ['policy'],
      },
    },
  ],
});

assert.equal(result.policyTraceReportOnly, true);
assert.equal(result.executionPerformed, false);
assert(result.summary.policyMissingRoutes >= 1);
assert(result.summary.totalTraceEntries > 0);

const policyMissing = result.rows.find((row) => row.routeId === 'policy_missing_route');
assert(policyMissing);
assert(policyMissing.traceEntries.some((entry) => entry.stage === 'policy_requirement'));
assert(policyMissing.traceEntries.some((entry) => entry.sourceValue === 'blocked_policy_missing' || entry.message.includes('blocked_policy_missing')));
assert.equal(policyMissing.traceReportDoesNotEqualExecution, true);

const blocked = result.rows.find((row) => row.routeId === 'fully_blocked_route');
assert(blocked);
for (const reason of [
  'blocked_no_approval','blocked_dry_run_required','blocked_no_allowlist','blocked_scope_invalid','blocked_backup_required',
  'blocked_rollback_required','blocked_bridge_not_implemented','blocked_write_actions_disabled','blocked_direct_source_disabled','blocked_automatic_takeover_disabled',
]) {
  assert(blocked.traceEntries.some((entry) => entry.sourceValue === reason || entry.message.includes(reason)), `missing trace reason ${reason}`);
}
assert(blocked.traceEntries.some((entry) => entry.stage === 'hard_boundary'));
assert.equal(blocked.executionPerformed, false);

const future = result.rows.find((row) => row.routeId === 'future_route');
assert(future);
assert.equal(future.readinessStatus, 'execution_ready_future_only');
assert.equal(future.executionEligibility, 'eligible_after_future_execution_lane');
assert.equal(future.executionPerformed, false);
assert.equal(future.traceReportDoesNotEqualExecution, true);
assert(!JSON.stringify(future).includes('can_execute'));
assert(!JSON.stringify(future).includes('approved_for_execution'));

const metadata = result.rows.find((row) => row.routeId === 'metadata_route');
assert(metadata);
assert.equal(metadata.readinessStatus, 'metadata_only');
assert.equal(metadata.executionEligibility, 'ineligible');
assert.equal(metadata.executionPerformed, false);
assert(metadata.traceEntries.some((entry) => entry.result === 'metadata_only' || entry.message.includes('metadata_only')));

console.log(JSON.stringify({
  ok: true,
  reportId: result.reportId,
  totalRoutes: result.summary.totalRoutes,
  policyMissingRoutes: result.summary.policyMissingRoutes,
  blockedRoutes: result.summary.blockedRoutes,
  metadataOnlyRoutes: result.summary.metadataOnlyRoutes,
  executionReadyFutureOnlyRoutes: result.summary.executionReadyFutureOnlyRoutes,
  totalTraceEntries: result.summary.totalTraceEntries,
  executionPerformedCount: result.summary.executionPerformedCount,
}, null, 2));
