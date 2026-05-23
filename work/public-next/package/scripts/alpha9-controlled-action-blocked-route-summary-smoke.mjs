import assert from 'node:assert/strict';
import { projectControlledActionBlockedRouteSummary } from '../dist/controlled-action-blocked-route-summary.js';

const result = projectControlledActionBlockedRouteSummary();

assert.equal(result.blockedRouteSummaryVersion, 'umg.controlled_action_blocked_route_summary.v1');
assert.equal(result.executionEnabled, false);
assert.equal(result.summary.directSourceStatus, 'disabled');
assert.equal(result.summary.automaticResponseTakeoverStatus, 'disabled');
assert.equal(result.routeCount, 3);
assert.equal(result.blockedCount, 3);
assert(result.routes.every((route) => route.executionPerformed === false), 'executionPerformed drift');
assert(result.routes.every((route) => route.blockedRouteSummaryOnly === true), 'blockedRouteSummaryOnly drift');
assert(result.routes.every((route) => route.approvalDoesNotEqualExecution === true), 'approvalDoesNotEqualExecution drift');
assert(result.routes.every((route) => route.checkpointDoesNotEqualExecution === true), 'checkpointDoesNotEqualExecution drift');
assert(result.routes.every((route) => route.dryRunDoesNotEqualExecution === true), 'dryRunDoesNotEqualExecution drift');
assert(result.routes.every((route) => route.decisionSimulationOnly === true), 'decisionSimulationOnly drift');

const previewOnly = result.routes.find((route) => route.linkedActionId === 'desktop.click.preview_only');
assert(previewOnly, 'preview-only route missing');
assert.equal(previewOnly.routeStatus, 'blocked_bridge_not_implemented');
assert(previewOnly.blockedReasons.includes('blocked_preview_required'), 'preview route should remain preview-bound');
assert(previewOnly.blockedReasons.includes('blocked_direct_source_disabled'), 'direct source block missing');
assert.equal(previewOnly.requiredDryRunState, 'execution_blocked_after_dry_run');

const approvalGated = result.routes.find((route) => route.linkedActionId === 'phasebridge.resume.approval_gated');
assert(approvalGated, 'approval-gated route missing');
assert.equal(approvalGated.routeStatus, 'blocked_bridge_not_implemented');
assert.equal(approvalGated.requiredApprovalState, 'execution_blocked');
assert.equal(approvalGated.requiredAllowlistState, 'allowlist_required_not_granted');
assert.equal(approvalGated.requiredBackupState, 'backup_required_not_prepared');
assert(approvalGated.blockedReasons.includes('blocked_no_approval'), 'approval block missing');
assert(approvalGated.blockedReasons.includes('blocked_dry_run_required'), 'dry-run block missing');

const forbidden = result.routes.find((route) => route.linkedActionId === 'direct_source.enable.forbidden');
assert(forbidden, 'forbidden route missing');
assert.equal(forbidden.routeStatus, 'metadata_only');
assert.equal(forbidden.directSourceStatus, 'disabled');
assert(forbidden.blockedReasons.includes('metadata_only'), 'metadata-only block missing');

console.log(JSON.stringify({
  ok: true,
  packageVersion: result.packageVersion,
  blockedRouteSummaryVersion: result.blockedRouteSummaryVersion,
  routeCount: result.routeCount,
  blockedCount: result.blockedCount,
  futureActionCapableCount: result.futureActionCapableCount,
  metadataOnlyCount: result.metadataOnlyCount,
  executionEnabled: result.executionEnabled,
}, null, 2));
