import assert from 'node:assert/strict';
import { projectControlledActionAuditPacket } from '../dist/controlled-action-audit-packet.js';

const result = projectControlledActionAuditPacket({
  packetId: 'smoke.alpha9.audit.packet',
  packageVersion: '0.3.0-alpha.12',
  routes: [
    {
      routeId: 'blocked_route',
      linkedBlockedRouteSummaryId: 'blocked-route-summary.blocked_route',
      linkedReadinessMatrixId: 'matrix.blocked_route',
      linkedPolicyToReadinessIntegrationId: 'integration.blocked_route',
      linkedPolicyTraceReportId: 'trace.blocked_route',
      routeClass: 'bridge_action_candidate',
      riskLevel: 'high',
      policySummary: { policyPresent: true, requiredGates: ['approval','dryRun','allowlist','scope','backup','rollback','bridgeImplementation','writeActions','directSource','automaticResponseTakeover'] },
      approvalSummary: { approvalPresent: false, approvalValid: false, checkpointPresent: false, checkpointValid: false, decisionSimulationPresent: true },
      dryRunSummary: { dryRunPresent: false, dryRunValid: false, dryRunOnly: true },
      blockedRouteSummary: {
        routeStatus: 'blocked_bridge_not_implemented',
        blockedReasons: ['blocked_no_approval','blocked_dry_run_required','blocked_no_allowlist'],
        missingRequirements: ['approval','dryRun','allowlist'],
        satisfiedRequirements: ['policy'],
      },
      readinessSummary: {
        readinessStatus: 'blocked',
        executionEligibility: 'future_only',
        readinessGates: { approval: 'missing', dryRun: 'missing', allowlist: 'missing' },
      },
      traceSummary: { traceEntryCount: 12, traceStages: ['policy_requirement','route_state_check','readiness_gate','blocked_reason','hard_boundary'], hardBoundaryCount: 8 },
    },
    {
      routeId: 'metadata_route',
      routeClass: 'metadata_only',
      riskLevel: 'none',
      policySummary: { policyPresent: true, requiredGates: [] },
      approvalSummary: { approvalPresent: false, approvalValid: false, checkpointPresent: false, checkpointValid: false, decisionSimulationPresent: false },
      dryRunSummary: { dryRunPresent: false, dryRunValid: false, dryRunOnly: true },
      blockedRouteSummary: { routeStatus: 'metadata_only', blockedReasons: [], missingRequirements: [], satisfiedRequirements: ['policy'] },
      readinessSummary: { readinessStatus: 'metadata_only', executionEligibility: 'ineligible', readinessGates: { policy: 'present' } },
      traceSummary: { traceEntryCount: 3, traceStages: ['policy_requirement','readiness_gate','hard_boundary'], hardBoundaryCount: 8 },
    },
    {
      routeId: 'future_route',
      linkedBlockedRouteSummaryId: 'blocked-route-summary.future_route',
      linkedReadinessMatrixId: 'matrix.future_route',
      linkedPolicyToReadinessIntegrationId: 'integration.future_route',
      linkedPolicyTraceReportId: 'trace.future_route',
      routeClass: 'action_capable',
      riskLevel: 'medium',
      policySummary: { policyPresent: true, requiredGates: ['approval','dryRun','allowlist','scope','writeActions','directSource','automaticResponseTakeover'] },
      approvalSummary: { approvalPresent: true, approvalValid: true, checkpointPresent: true, checkpointValid: true, decisionSimulationPresent: true },
      dryRunSummary: { dryRunPresent: true, dryRunValid: true, dryRunOnly: true },
      blockedRouteSummary: { routeStatus: 'execution_ready_future_only', blockedReasons: ['blocked_write_actions_disabled','blocked_direct_source_disabled','blocked_automatic_takeover_disabled'], missingRequirements: ['writeActions','directSource','automaticResponseTakeover'], satisfiedRequirements: ['policy','approval','checkpoint','dryRun','allowlist','scope'] },
      readinessSummary: { readinessStatus: 'execution_ready_future_only', executionEligibility: 'eligible_after_future_execution_lane', readinessGates: { approval: 'satisfied', dryRun: 'satisfied', allowlist: 'satisfied', scope: 'valid', writeActions: 'disabled', directSource: 'disabled', automaticResponseTakeover: 'disabled' } },
      traceSummary: { traceEntryCount: 18, traceStages: ['policy_requirement','route_state_check','readiness_gate','blocked_reason','satisfied_requirement','hard_boundary'], hardBoundaryCount: 8 },
    },
    {
      routeId: 'incomplete_route',
      routeClass: 'action_capable',
      riskLevel: 'low',
      policySummary: { policyPresent: false, requiredGates: [] },
      approvalSummary: { approvalPresent: false, approvalValid: false, checkpointPresent: false, checkpointValid: false, decisionSimulationPresent: false },
      dryRunSummary: { dryRunPresent: false, dryRunValid: false, dryRunOnly: true },
      blockedRouteSummary: { routeStatus: 'audit_incomplete', blockedReasons: [], missingRequirements: [], satisfiedRequirements: [] },
      readinessSummary: { readinessStatus: 'policy_missing', executionEligibility: 'ineligible', readinessGates: {} },
      traceSummary: { traceEntryCount: 0, traceStages: [], hardBoundaryCount: 0 },
    },
  ],
});

const blocked = result.routes.find((route) => route.routeId === 'blocked_route');
assert(blocked);
assert.equal(blocked.auditStatus, 'audit_ready_blocked');
assert.equal(blocked.executionPerformed, false);
assert.equal(result.auditPacketOnly, true);
assert.equal(blocked.auditPacketDoesNotEqualExecution, true);
assert.deepEqual(blocked.blockedReasons, ['blocked_no_approval','blocked_dry_run_required','blocked_no_allowlist']);

const metadata = result.routes.find((route) => route.routeId === 'metadata_route');
assert(metadata);
assert.equal(metadata.auditStatus, 'metadata_only');
assert.equal(metadata.executionPerformed, false);

const future = result.routes.find((route) => route.routeId === 'future_route');
assert(future);
assert.equal(future.auditStatus, 'audit_ready_execution_future_only');
assert.equal(future.executionPerformed, false);
assert(!JSON.stringify(future).includes('ready_to_execute'));
assert(!JSON.stringify(future).includes('can_execute'));
assert(!JSON.stringify(future).includes('approved_for_execution'));

const incomplete = result.routes.find((route) => route.routeId === 'incomplete_route');
assert(incomplete);
assert.equal(incomplete.auditStatus, 'audit_incomplete');
assert.equal(incomplete.executionPerformed, false);

assert.equal(result.summary.totalRoutes, 4);
assert.equal(result.summary.executionPerformedCount, 0);
assert(result.summary.auditIncompleteRoutes >= 1);
assert(result.summary.totalTraceEntries > 0);

console.log(JSON.stringify({
  ok: true,
  packetId: result.packetId,
  totalRoutes: result.summary.totalRoutes,
  blockedRoutes: result.summary.blockedRoutes,
  metadataOnlyRoutes: result.summary.metadataOnlyRoutes,
  executionFutureOnlyRoutes: result.summary.executionFutureOnlyRoutes,
  auditIncompleteRoutes: result.summary.auditIncompleteRoutes,
  totalTraceEntries: result.summary.totalTraceEntries,
  executionPerformedCount: result.summary.executionPerformedCount,
}, null, 2));
