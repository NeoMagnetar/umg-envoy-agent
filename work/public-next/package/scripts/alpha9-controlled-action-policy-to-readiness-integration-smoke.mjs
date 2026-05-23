import assert from 'node:assert/strict';
import { projectControlledActionPolicyToReadinessIntegration } from '../dist/controlled-action-policy-readiness-integration.js';

const result = projectControlledActionPolicyToReadinessIntegration({
  integrationId: 'smoke.alpha9.policy.readiness.integration',
  routes: [
    {
      routeId: 'policy_missing_route',
      routeClass: 'action_capable',
      riskLevel: 'medium',
      policy: {
        present: false,
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
      state: {
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
    },
    {
      routeId: 'everything_missing_route',
      routeClass: 'bridge_action_candidate',
      riskLevel: 'high',
      policy: {
        present: true,
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
      state: {
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
    },
    {
      routeId: 'future_only_route',
      routeClass: 'action_capable',
      riskLevel: 'medium',
      policy: {
        present: true,
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
      state: {
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
    },
    {
      routeId: 'metadata_policy_route',
      routeClass: 'metadata_only',
      riskLevel: 'none',
      policy: {
        present: true,
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
      state: {
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
    },
  ],
});

const policyMissing = result.rows.find((row) => row.routeId === 'policy_missing_route');
assert(policyMissing);
assert.equal(policyMissing.readinessStatus, 'policy_missing');
assert(policyMissing.blockedReasons.includes('blocked_policy_missing'));
assert.equal(policyMissing.executionPerformed, false);

const everythingMissing = result.rows.find((row) => row.routeId === 'everything_missing_route');
assert(everythingMissing);
for (const reason of [
  'blocked_no_approval',
  'blocked_dry_run_required',
  'blocked_no_allowlist',
  'blocked_scope_invalid',
  'blocked_backup_required',
  'blocked_rollback_required',
  'blocked_bridge_not_implemented',
  'blocked_write_actions_disabled',
  'blocked_direct_source_disabled',
  'blocked_automatic_takeover_disabled',
]) {
  assert(everythingMissing.blockedReasons.includes(reason), `missing blocked reason ${reason}`);
}

const future = result.rows.find((row) => row.routeId === 'future_only_route');
assert(future);
assert.equal(future.readinessStatus, 'execution_ready_future_only');
assert.equal(future.executionEligibility, 'eligible_after_future_execution_lane');
assert.equal(future.executionPerformed, false);
assert(future.blockedReasons.includes('blocked_write_actions_disabled'));
assert(future.blockedReasons.includes('blocked_direct_source_disabled'));
assert(future.blockedReasons.includes('blocked_automatic_takeover_disabled'));

const metadata = result.rows.find((row) => row.routeId === 'metadata_policy_route');
assert(metadata);
assert.equal(metadata.readinessStatus, 'metadata_only');
assert.equal(metadata.executionEligibility, 'ineligible');
assert.equal(metadata.executionPerformed, false);

assert.equal(result.summary.totalRoutes, 4);
assert.equal(result.summary.executionPerformedCount, 0);
assert(result.summary.policyMissingRoutes >= 1);
assert(result.summary.blockedRoutes >= 1);

console.log(JSON.stringify({
  ok: true,
  integrationId: result.integrationId,
  totalRoutes: result.summary.totalRoutes,
  policyMissingRoutes: result.summary.policyMissingRoutes,
  blockedRoutes: result.summary.blockedRoutes,
  executionReadyFutureOnlyRoutes: result.summary.executionReadyFutureOnlyRoutes,
  executionPerformedCount: result.summary.executionPerformedCount,
}, null, 2));
