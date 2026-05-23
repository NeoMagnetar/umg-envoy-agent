import assert from 'node:assert/strict';
import { projectControlledActionAuditPacketExport } from '../dist/controlled-action-audit-packet-export.js';

const basePacket = {
  packetId: 'packet.alpha9.audit',
  generatedAt: '2026-05-23T06:42:00Z',
  runtimeVersion: 'alpha9',
  packageVersion: '0.3.0-alpha.12',
  auditPacketOnly: true,
  executionPerformed: false,
  summary: {
    totalRoutes: 3,
    metadataOnlyRoutes: 1,
    blockedRoutes: 1,
    futureActionCapableRoutes: 0,
    executionFutureOnlyRoutes: 1,
    auditIncompleteRoutes: 0,
    totalBlockedReasons: 4,
    totalMissingRequirements: 4,
    totalSatisfiedRequirements: 5,
    totalTraceEntries: 12,
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
  routes: [
    {
      routeId: 'route.one', linkedActionId: 'action.one', linkedPolicyId: 'policy.one', routeClass: 'bridge_action_candidate', riskLevel: 'high', auditStatus: 'audit_ready_blocked', evidence: { policy: 'present' }, blockedReasons: ['blocked_no_approval'], missingRequirements: ['approval'], satisfiedRequirements: ['policy'], traceEntryCount: 4, traceStages: ['policy_requirement','blocked_reason'], hardBoundaryCount: 8, executionPerformed: false,
    },
    {
      routeId: 'route.two', linkedActionId: 'action.two', linkedPolicyId: 'policy.two', routeClass: 'metadata_only', riskLevel: 'none', auditStatus: 'metadata_only', evidence: { policy: 'present' }, blockedReasons: [], missingRequirements: [], satisfiedRequirements: ['policy'], traceEntryCount: 3, traceStages: ['policy_requirement'], hardBoundaryCount: 8, executionPerformed: false,
    },
    {
      routeId: 'route.three', linkedActionId: 'action.three', linkedPolicyId: 'policy.three', routeClass: 'action_capable', riskLevel: 'medium', auditStatus: 'audit_ready_execution_future_only', evidence: { policy: 'present' }, blockedReasons: ['blocked_write_actions_disabled'], missingRequirements: ['writeActions'], satisfiedRequirements: ['policy','approval'], traceEntryCount: 5, traceStages: ['policy_requirement','readiness_gate'], hardBoundaryCount: 8, executionPerformed: false,
    },
  ],
};

const basic = projectControlledActionAuditPacketExport({
  exportId: 'export.basic',
  exportFormat: 'review_json',
  exportProfile: 'internal_review',
  packet: basePacket,
});
assert.equal(basic.auditPacketExportOnly, true);
assert.equal(basic.executionPerformed, false);
assert.equal(basic.fileWritten, false);
assert.equal(basic.packagePublished, false);
assert.equal(basic.externalTransmissionPerformed, false);
assert.equal(basic.exportSummary.totalRoutes, 3);
assert.equal(basic.exportSummary.exportedRoutes, 3);

const redacted = projectControlledActionAuditPacketExport({
  exportId: 'export.redacted',
  generatedAt: '2026-05-23T06:42:00Z',
  exportFormat: 'compliance_json',
  exportProfile: 'compliance_review',
  packet: basePacket,
  redactionPolicy: {
    redactRouteIds: true,
    redactActionIds: true,
    redactPolicyIds: true,
    redactTimestamps: true,
  },
});
assert.equal(redacted.redactionApplied, true);
assert.equal(redacted.routes[0].routeId, 'REDACTED_ROUTE');
assert.equal(redacted.routes[0].linkedActionId, 'REDACTED_ACTION');
assert.equal(redacted.routes[0].linkedPolicyId, 'REDACTED_POLICY');
assert.equal(redacted.sourcePacket.generatedAt, 'REDACTED_TIMESTAMP');
assert.equal(redacted.executionPerformed, false);

const noTraceStages = projectControlledActionAuditPacketExport({
  exportId: 'export.noTrace',
  exportFormat: 'debug_json',
  exportProfile: 'debug_trace',
  packet: basePacket,
  redactionPolicy: { includeTraceStages: false },
});
assert.deepEqual(noTraceStages.routes[0].traceStages, []);
assert.equal(noTraceStages.routes[0].traceEntryCount, 4);
assert.equal(noTraceStages.executionPerformed, false);

const noLists = projectControlledActionAuditPacketExport({
  exportId: 'export.noLists',
  exportFormat: 'handoff_json',
  exportProfile: 'agent_handoff',
  packet: basePacket,
  redactionPolicy: {
    includeBlockedReasons: false,
    includeMissingRequirements: false,
    includeSatisfiedRequirements: false,
  },
});
assert.deepEqual(noLists.routes[0].blockedReasons, []);
assert.deepEqual(noLists.routes[0].missingRequirements, []);
assert.deepEqual(noLists.routes[0].satisfiedRequirements, []);
assert.equal(noLists.exportSummary.totalRoutes, 3);
assert.equal(noLists.executionPerformed, false);

const serialized = JSON.stringify(basic);
assert(!serialized.includes('ready_to_execute'));
assert(!serialized.includes('can_execute'));
assert(!serialized.includes('approved_for_execution'));
assert(!serialized.includes('execution_allowed'));
assert.equal(basic.hardBoundaries.auditPacketExportDoesNotEqualExecution, true);
assert.equal(basic.hardBoundaries.auditPacketDoesNotEqualExecution, true);
assert.equal(basic.hardBoundaries.traceReportDoesNotEqualExecution, true);
assert.equal(basic.hardBoundaries.readinessDoesNotEqualExecution, true);
assert.equal(basic.exportSummary.executionPerformedCount, 0);

console.log(JSON.stringify({
  ok: true,
  exportId: basic.exportId,
  totalRoutes: basic.exportSummary.totalRoutes,
  exportedRoutes: basic.exportSummary.exportedRoutes,
  redactedRoutes: redacted.exportSummary.redactedRoutes,
  executionPerformedCount: basic.exportSummary.executionPerformedCount,
}, null, 2));
