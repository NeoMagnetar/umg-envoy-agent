import assert from 'node:assert/strict';
import { projectControlledActionReviewDecisionPacket } from '../dist/controlled-action-review-decision-packet-projection.js';

const result = projectControlledActionReviewDecisionPacket({
  packetId: 'review-decision-packet-example',
  packetType: 'controlled_action_review_decision_packet',
  schemaVersion: '1.0.0',
  status: 'schema_validated',
  createdAt: '2026-05-23T08:18:00.000Z',
  sourceReviewBundle: {
    reviewBundleId: 'review-bundle-example',
    sourceExportId: 'audit-packet-export-example',
    sourcePacketId: 'audit-packet-example',
    reviewBundleDoesNotEqualApproval: true,
    reviewBundleDoesNotEqualExecution: true,
  },
  decisionRequest: {
    decisionRequestId: 'review-decision-request-example',
    reviewBundleId: 'review-bundle-example',
    requestedBy: 'reviewer_or_agent',
    requestedAt: '2026-05-23T08:18:00.000Z',
    targetRoutes: [
      { routeId: 'route-1', requestedDecision: 'request_more_evidence', reviewReason: 'Need more evidence.', evidencePresent: ['audit_packet'], evidenceMissing: ['dry_run_projection'], blockedReasonsReviewed: ['blocked_dry_run_required'], missingRequirementsReviewed: ['dryRun'], hardBoundariesReviewed: ['reviewDecisionPacketDoesNotEqualExecution'] },
      { routeId: 'route-2', requestedDecision: 'approve_for_dry_run_only', reviewReason: 'Dry-run only metadata.', evidencePresent: ['audit_packet'], evidenceMissing: [], blockedReasonsReviewed: [], missingRequirementsReviewed: [], hardBoundariesReviewed: ['reviewDecisionPacketDoesNotEqualApproval'] },
      { routeId: 'route-3', requestedDecision: 'approve_for_future_execution_review_only', reviewReason: 'Future review only.', evidencePresent: ['audit_packet'], evidenceMissing: [], blockedReasonsReviewed: [], missingRequirementsReviewed: [], hardBoundariesReviewed: ['reviewDecisionPacketDoesNotEqualApproval'] },
      { routeId: 'route-4', requestedDecision: 'deny', reviewReason: 'Denied.', evidencePresent: ['audit_packet'], evidenceMissing: [], blockedReasonsReviewed: ['blocked_write_actions_disabled'], missingRequirementsReviewed: ['writeActions'], hardBoundariesReviewed: ['reviewDecisionPacketDoesNotEqualExecution'] },
      { routeId: 'route-5', requestedDecision: 'no_decision', reviewReason: 'No decision.', evidencePresent: ['audit_packet'], evidenceMissing: [], blockedReasonsReviewed: [], missingRequirementsReviewed: [], hardBoundariesReviewed: ['reviewDecisionPacketDoesNotEqualExecution'] }
    ],
    executionPerformed: false,
    approvalGranted: false,
  },
  decisionResult: {
    decisionResultId: 'review-decision-result-example',
    decisionRequestId: 'review-decision-request-example',
    resultState: 'review_decision_recorded_metadata_only',
    routeDecisionResults: [
      { routeId: 'route-1', decision: 'request_more_evidence', decisionAccepted: true, decisionDoesNotGrantApproval: true, decisionDoesNotGrantExecution: true, executionPerformed: false },
      { routeId: 'route-2', decision: 'approve_for_dry_run_only', decisionAccepted: true, decisionDoesNotGrantApproval: true, decisionDoesNotGrantExecution: true, executionPerformed: false },
      { routeId: 'route-3', decision: 'approve_for_future_execution_review_only', decisionAccepted: true, decisionDoesNotGrantApproval: true, decisionDoesNotGrantExecution: true, executionPerformed: false },
      { routeId: 'route-4', decision: 'deny', decisionAccepted: true, decisionDoesNotGrantApproval: true, decisionDoesNotGrantExecution: true, executionPerformed: false },
      { routeId: 'route-5', decision: 'no_decision', decisionAccepted: false, decisionDoesNotGrantApproval: true, decisionDoesNotGrantExecution: true, executionPerformed: false }
    ],
    approvalGranted: false,
    executionPerformed: false,
  },
  evidenceRequirements: {
    auditPacketReviewBundle: { required: true, present: true, referenceId: 'bundle', notes: ['ok'] },
    auditPacketExport: { required: true, present: true, referenceId: 'export', notes: ['ok'] },
    auditPacket: { required: true, present: true, referenceId: 'packet', notes: ['ok'] },
    policyTraceReport: { required: true, present: true, referenceId: 'trace', notes: ['ok'] },
    policyToReadinessIntegration: { required: true, present: true, referenceId: 'integration', notes: ['ok'] },
    readinessMatrix: { required: true, present: true, referenceId: 'matrix', notes: ['ok'] },
    blockedRouteSummary: { required: true, present: true, referenceId: 'blocked', notes: ['ok'] },
    dryRunProjection: { required: true, present: false, referenceId: 'dryrun', notes: ['missing'] },
    decisionSimulation: { required: true, present: true, referenceId: 'simulation', notes: ['ok'] },
    approvalCheckpoint: { required: true, present: false, referenceId: 'checkpoint', notes: ['missing'] },
    approvalFlowProjection: { required: true, present: true, referenceId: 'approval-flow', notes: ['ok'] },
    policyProjection: { required: true, present: true, referenceId: 'policy', notes: ['ok'] }
  },
  hardBoundaries: {
    policyDoesNotEqualExecution: true,
    approvalDoesNotEqualExecution: true,
    checkpointDoesNotEqualExecution: true,
    dryRunDoesNotEqualExecution: true,
    decisionSimulationDoesNotEqualExecution: true,
    decisionSimulationOnly: true,
    readinessDoesNotEqualExecution: true,
    traceReportDoesNotEqualExecution: true,
    auditPacketDoesNotEqualExecution: true,
    auditPacketExportDoesNotEqualExecution: true,
    reviewBundleDoesNotEqualApproval: true,
    reviewBundleDoesNotEqualExecution: true,
    reviewDecisionPacketDoesNotEqualApproval: true,
    reviewDecisionPacketDoesNotEqualExecution: true,
    executionPerformed: false,
    approvalGranted: false,
    writeActionPerformed: false,
    bridgeActionPerformed: false,
    fileWritten: false,
    externalTransmissionPerformed: false,
    packagePublished: false,
    directSourceEnabled: false,
    automaticResponseTakeoverEnabled: false,
  },
  blockedDecisionCategories: [
    { category: 'execute_action', reason: 'blocked', requiresFutureLane: true, requiresExplicitApproval: true },
    { category: 'approve_for_execution', reason: 'blocked', requiresFutureLane: true, requiresExplicitApproval: true },
    { category: 'authorize_write_action', reason: 'blocked', requiresFutureLane: true, requiresExplicitApproval: true },
    { category: 'authorize_bridge_action', reason: 'blocked', requiresFutureLane: true, requiresExplicitApproval: true },
    { category: 'enable_direct_source', reason: 'blocked', requiresFutureLane: true, requiresExplicitApproval: true },
    { category: 'enable_automatic_response_takeover', reason: 'blocked', requiresFutureLane: true, requiresExplicitApproval: true },
    { category: 'publish_package', reason: 'blocked', requiresFutureLane: true, requiresExplicitApproval: true },
    { category: 'restart_openclaw', reason: 'blocked', requiresFutureLane: true, requiresExplicitApproval: true },
    { category: 'mutate_block_library', reason: 'blocked', requiresFutureLane: true, requiresExplicitApproval: true },
    { category: 'touch_resleever', reason: 'blocked', requiresFutureLane: true, requiresExplicitApproval: true }
  ],
  executionPerformed: false,
  approvalGranted: false,
  reviewDecisionRecorded: true,
  reviewDecisionPacketDoesNotEqualApproval: true,
  reviewDecisionPacketDoesNotEqualExecution: true,
});

const route1 = result.routeDecisionProjections.find((r) => r.routeId === 'route-1');
assert.equal(route1.decisionProjectionStatus, 'needs_more_evidence_metadata_only');
assert.equal(route1.approvalGranted, false);
assert.equal(route1.executionPerformed, false);
assert.equal(route1.decisionDoesNotGrantApproval, true);
assert.equal(route1.decisionDoesNotGrantExecution, true);

const route2 = result.routeDecisionProjections.find((r) => r.routeId === 'route-2');
assert.equal(route2.decisionProjectionStatus, 'dry_run_only_metadata');
assert.equal(route2.approvalGranted, false);
assert.equal(route2.executionPerformed, false);

const route3 = result.routeDecisionProjections.find((r) => r.routeId === 'route-3');
assert.equal(route3.decisionProjectionStatus, 'future_execution_review_only_metadata');
assert.equal(route3.approvalGranted, false);
assert.equal(route3.executionPerformed, false);

const route4 = result.routeDecisionProjections.find((r) => r.routeId === 'route-4');
assert.equal(route4.decisionProjectionStatus, 'denied_metadata_only');
assert.equal(route4.approvalGranted, false);
assert.equal(route4.executionPerformed, false);

const route5 = result.routeDecisionProjections.find((r) => r.routeId === 'route-5');
assert.equal(route5.decisionProjectionStatus, 'invalid_or_rejected_metadata_only');
assert.equal(route5.approvalGranted, false);
assert.equal(route5.executionPerformed, false);

assert(result.evidenceSummary.totalEvidenceItems > 0);
assert(result.evidenceSummary.requiredEvidenceItems > 0);
assert(result.evidenceSummary.presentEvidenceItems >= 0);
assert(result.evidenceSummary.missingEvidenceItems >= 0);
for (const cat of ['execute_action','approve_for_execution','authorize_write_action','authorize_bridge_action','enable_direct_source','enable_automatic_response_takeover']) {
  assert(result.blockedDecisionCategorySummary.categories.includes(cat), `missing blocked category ${cat}`);
}
assert.equal(result.reviewDecisionPacketProjectionOnly, true);
assert.equal(result.executionPerformed, false);
assert.equal(result.approvalGranted, false);
assert.equal(result.liveDecisionRecorded, false);
assert.equal(result.hardBoundaries.reviewDecisionPacketDoesNotEqualApproval, true);
assert.equal(result.hardBoundaries.reviewDecisionPacketDoesNotEqualExecution, true);
const serialized = JSON.stringify(result);
for (const forbidden of ['ready_to_execute','can_execute','approved_for_execution','execution_allowed','approval_granted','grant_execution','authorize_execution']) {
  assert(!serialized.includes(forbidden), `forbidden wording present ${forbidden}`);
}

console.log(JSON.stringify({
  ok: true,
  projectionId: result.projectionId,
  packetId: result.packetId,
  routeDecisionCount: result.routeDecisionProjections.length,
  requiredEvidenceItems: result.evidenceSummary.requiredEvidenceItems,
  presentEvidenceItems: result.evidenceSummary.presentEvidenceItems,
  missingEvidenceItems: result.evidenceSummary.missingEvidenceItems,
  blockedDecisionCategories: result.blockedDecisionCategorySummary.totalBlockedCategories,
  liveDecisionRecorded: result.liveDecisionRecorded,
}, null, 2));
