import assert from 'node:assert/strict';
import { projectControlledActionExecutionReadinessMatrix } from '../dist/controlled-action-execution-readiness-matrix.js';

const result = projectControlledActionExecutionReadinessMatrix({
  matrixId: 'smoke.alpha9.readiness.matrix',
  routes: [
    {
      routeId: 'desktop_file_write_candidate',
      routeClass: 'bridge_action_candidate',
      riskLevel: 'high',
      policyPresent: true,
      approvalPresent: false,
      approvalValid: false,
      checkpointPresent: false,
      checkpointValid: false,
      decisionSimulationPresent: true,
      dryRunPresent: false,
      dryRunValid: false,
      allowlistSatisfied: false,
      scopeValid: false,
      backupRequired: true,
      backupSatisfied: false,
      rollbackRequired: true,
      rollbackSatisfied: false,
      bridgeImplemented: false,
      writeActionsEnabled: false,
      directSourceEnabled: false,
      automaticResponseTakeoverEnabled: false,
    },
    {
      routeId: 'metadata_route',
      routeClass: 'metadata_only',
      riskLevel: 'none',
      policyPresent: true,
      approvalPresent: false,
      approvalValid: false,
      checkpointPresent: false,
      checkpointValid: false,
      decisionSimulationPresent: false,
      dryRunPresent: false,
      dryRunValid: false,
      allowlistSatisfied: false,
      scopeValid: true,
      backupRequired: false,
      backupSatisfied: false,
      rollbackRequired: false,
      rollbackSatisfied: false,
      bridgeImplemented: false,
      writeActionsEnabled: false,
      directSourceEnabled: false,
      automaticResponseTakeoverEnabled: false,
    },
    {
      routeId: 'future_route',
      routeClass: 'bridge_action_candidate',
      riskLevel: 'high',
      policyPresent: true,
      approvalPresent: true,
      approvalValid: true,
      checkpointPresent: true,
      checkpointValid: true,
      decisionSimulationPresent: true,
      dryRunPresent: true,
      dryRunValid: true,
      allowlistSatisfied: true,
      scopeValid: true,
      backupRequired: false,
      backupSatisfied: false,
      rollbackRequired: false,
      rollbackSatisfied: false,
      bridgeImplemented: true,
      writeActionsEnabled: false,
      directSourceEnabled: false,
      automaticResponseTakeoverEnabled: false,
    },
  ],
});

const blocked = result.rows.find((row) => row.routeId === 'desktop_file_write_candidate');
assert(blocked, 'blocked route missing');
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
  assert(blocked.blockedReasons.includes(reason), `missing blocked reason: ${reason}`);
}
assert.equal(blocked.executionPerformed, false);

const metadata = result.rows.find((row) => row.routeId === 'metadata_route');
assert(metadata, 'metadata route missing');
assert.equal(metadata.readinessStatus, 'metadata_only');
assert.equal(metadata.executionPerformed, false);
assert.equal(metadata.executionEligibility, 'ineligible');

const future = result.rows.find((row) => row.routeId === 'future_route');
assert(future, 'future route missing');
assert.equal(future.readinessStatus, 'execution_ready_future_only');
assert.equal(future.executionEligibility, 'eligible_after_future_execution_lane');
assert.equal(future.executionPerformed, false);
assert(future.blockedReasons.includes('blocked_write_actions_disabled'));
assert(future.blockedReasons.includes('blocked_direct_source_disabled'));
assert(future.blockedReasons.includes('blocked_automatic_takeover_disabled'));

assert.equal(result.summary.totalRoutes, 3);
assert.equal(result.summary.executionPerformedCount, 0);
assert(result.summary.blockedRoutes >= 1);
assert(result.summary.metadataOnlyRoutes >= 1);

console.log(JSON.stringify({
  ok: true,
  matrixId: result.matrixId,
  totalRoutes: result.summary.totalRoutes,
  blockedRoutes: result.summary.blockedRoutes,
  metadataOnlyRoutes: result.summary.metadataOnlyRoutes,
  executionReadyFutureOnlyRoutes: result.summary.executionReadyFutureOnlyRoutes,
  executionPerformedCount: result.summary.executionPerformedCount,
}, null, 2));
