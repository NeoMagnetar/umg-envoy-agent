import assert from 'node:assert/strict';
import { projectControlledActionAuditPacketReviewBundle } from '../dist/controlled-action-audit-packet-review-bundle.js';

const result = projectControlledActionAuditPacketReviewBundle({
  reviewBundleId: 'review.bundle.alpha9',
  reviewProfile: 'internal_reviewer',
  sourceExport: {
    exportId: 'export.alpha9',
    exportFormat: 'review_json',
    exportProfile: 'internal_review',
    auditPacketExportOnly: true,
    executionPerformed: false,
    fileWritten: false,
    packagePublished: false,
    externalTransmissionPerformed: false,
    sourcePacket: { packetId: 'packet.alpha9', generatedAt: '2026-05-23T06:53:00Z', runtimeVersion: 'alpha9', packageVersion: '0.3.0-alpha.12' },
    exportSummary: { totalRoutes: 4, exportedRoutes: 4, redactedRoutes: 1, metadataOnlyRoutes: 1, blockedRoutes: 1, futureActionCapableRoutes: 0, executionFutureOnlyRoutes: 1, auditIncompleteRoutes: 1, totalBlockedReasons: 5, totalMissingRequirements: 5, totalSatisfiedRequirements: 6, totalTraceEntries: 30, executionPerformedCount: 0 },
    redactionApplied: true,
    routes: [
      {
        routeId: 'route.blocked', linkedActionId: 'action.blocked', linkedPolicyId: 'policy.blocked', routeClass: 'bridge_action_candidate', riskLevel: 'high', auditStatus: 'audit_ready_blocked',
        evidence: { policy: 'present', approval: 'missing', checkpoint: 'missing', decisionSimulation: 'present', dryRun: 'missing', blockedRouteSummary: 'present', readinessMatrix: 'present', policyToReadinessIntegration: 'present', policyTraceReport: 'present' },
        blockedReasons: ['blocked_no_approval', 'blocked_dry_run_required'], missingRequirements: ['approval', 'dryRun'], satisfiedRequirements: ['policy'], traceEntryCount: 10, traceStages: ['policy_requirement','blocked_reason'], hardBoundaryCount: 8, executionPerformed: false,
      },
      {
        routeId: 'route.meta', linkedActionId: 'action.meta', linkedPolicyId: 'policy.meta', routeClass: 'metadata_only', riskLevel: 'none', auditStatus: 'metadata_only',
        evidence: { policy: 'present', approval: 'missing', checkpoint: 'missing', decisionSimulation: 'missing', dryRun: 'missing', blockedRouteSummary: 'present', readinessMatrix: 'present', policyToReadinessIntegration: 'present', policyTraceReport: 'present' },
        blockedReasons: [], missingRequirements: [], satisfiedRequirements: ['policy'], traceEntryCount: 4, traceStages: ['policy_requirement'], hardBoundaryCount: 8, executionPerformed: false,
      },
      {
        routeId: 'route.future', linkedActionId: 'action.future', linkedPolicyId: 'policy.future', routeClass: 'action_capable', riskLevel: 'medium', auditStatus: 'audit_ready_execution_future_only',
        evidence: { policy: 'present', approval: 'present_valid', checkpoint: 'present_valid', decisionSimulation: 'present', dryRun: 'present_valid', blockedRouteSummary: 'present', readinessMatrix: 'present', policyToReadinessIntegration: 'present', policyTraceReport: 'present' },
        blockedReasons: ['blocked_write_actions_disabled'], missingRequirements: ['writeActions'], satisfiedRequirements: ['policy','approval'], traceEntryCount: 9, traceStages: ['policy_requirement','readiness_gate'], hardBoundaryCount: 8, executionPerformed: false,
      },
      {
        routeId: 'route.incomplete', linkedActionId: 'action.incomplete', linkedPolicyId: 'policy.incomplete', routeClass: 'action_capable', riskLevel: 'low', auditStatus: 'audit_incomplete',
        evidence: { policy: 'missing', approval: 'missing', checkpoint: 'missing', decisionSimulation: 'missing', dryRun: 'missing', blockedRouteSummary: 'missing', readinessMatrix: 'missing', policyToReadinessIntegration: 'missing', policyTraceReport: 'missing' },
        blockedReasons: [], missingRequirements: [], satisfiedRequirements: [], traceEntryCount: 0, traceStages: [], hardBoundaryCount: 0, executionPerformed: false,
      },
    ],
    hardBoundaries: {
      policyDoesNotEqualExecution: true,
      approvalDoesNotEqualExecution: true,
      checkpointDoesNotEqualExecution: true,
      dryRunDoesNotEqualExecution: true,
      decisionSimulationOnly: true,
      readinessDoesNotEqualExecution: true,
      traceReportDoesNotEqualExecution: true,
      auditPacketDoesNotEqualExecution: true,
      auditPacketExportDoesNotEqualExecution: true,
    },
    exportNotes: [],
  },
});

assert.equal(result.auditPacketReviewBundleOnly, true);
assert.equal(result.executionPerformed, false);
assert.equal(result.approvalGranted, false);
assert.equal(result.reviewDecisionRecorded, false);

const blocked = result.routeReviewCards.find((card) => card.routeId === 'route.blocked');
assert(blocked);
assert.equal(blocked.reviewStatus, 'review_ready_blocked');
assert(result.attentionItems.some((item) => item.category === 'blocked_reason'));
assert(result.attentionItems.some((item) => item.category === 'missing_requirement'));
assert(result.attentionItems.some((item) => item.category === 'risk_level'));

const metadata = result.routeReviewCards.find((card) => card.routeId === 'route.meta');
assert(metadata);
assert.equal(metadata.reviewStatus, 'metadata_only');
assert.equal(metadata.executionPerformed, false);
assert.equal(metadata.approvalGranted, false);

const future = result.routeReviewCards.find((card) => card.routeId === 'route.future');
assert(future);
assert.equal(future.reviewStatus, 'review_ready_execution_future_only');
assert.equal(future.executionPerformed, false);
assert.equal(future.approvalGranted, false);
assert(!JSON.stringify(future).includes('ready_to_execute'));
assert(!JSON.stringify(future).includes('can_execute'));
assert(!JSON.stringify(future).includes('approved_for_execution'));

const incomplete = result.routeReviewCards.find((card) => card.routeId === 'route.incomplete');
assert(incomplete);
assert.equal(incomplete.reviewStatus, 'review_incomplete');
assert(result.attentionItems.some((item) => item.category === 'incomplete_evidence'));
assert(result.attentionItems.some((item) => item.category === 'redaction'));

assert.equal(result.reviewSummary.totalRoutes, 4);
assert.equal(result.reviewSummary.approvalGrantedCount, 0);
assert.equal(result.reviewSummary.reviewDecisionRecordedCount, 0);
assert.equal(result.reviewSummary.executionPerformedCount, 0);
assert.equal(result.hardBoundaries.reviewBundleDoesNotEqualApproval, true);
assert.equal(result.hardBoundaries.reviewBundleDoesNotEqualExecution, true);
assert.equal(result.hardBoundaries.auditPacketExportDoesNotEqualExecution, true);
assert.equal(result.hardBoundaries.auditPacketDoesNotEqualExecution, true);

console.log(JSON.stringify({
  ok: true,
  reviewBundleId: result.reviewBundleId,
  totalRoutes: result.reviewSummary.totalRoutes,
  blockedRoutes: result.reviewSummary.blockedRoutes,
  metadataOnlyRoutes: result.reviewSummary.metadataOnlyRoutes,
  auditIncompleteRoutes: result.reviewSummary.auditIncompleteRoutes,
  approvalGrantedCount: result.reviewSummary.approvalGrantedCount,
  reviewDecisionRecordedCount: result.reviewSummary.reviewDecisionRecordedCount,
}, null, 2));
