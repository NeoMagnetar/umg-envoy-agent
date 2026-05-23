import assert from 'node:assert/strict';
import { projectControlledActionReviewDecisionPacketRecordingReviewExport } from '../dist/controlled-action-review-decision-packet-recording-review-export.js';

function makeSummary(overrides = {}) {
  return {
    summaryId: 'summary.example',
    generatedAt: '2026-05-23T10:54:00.000Z',
    recordingAuditSummaryOnly: true,
    sourceProjection: {
      projectionId: 'projection.recording.example',
      recordingPacketId: 'recording-packet-example',
      schemaVersion: '1.0.0',
    },
    sourceReviewDecisionPacket: {
      reviewDecisionPacketId: 'review-decision-packet-example',
      reviewDecisionPacketSchemaId: 'schema-example',
      reviewDecisionPacketProjectionId: 'projection-example',
    },
    recordingRequestSummary: {
      recordingRequestId: 'request-example',
      requestedRecordingAction: 'record_metadata_only_future_lane',
      requestedBy: 'reviewer_or_agent',
      requestedAt: '2026-05-23T10:54:00.000Z',
    },
    recordingResultSummary: {
      recordingResultId: 'result-example',
      recordingState: 'recording_recorded_metadata_only_future_lane',
      recordingAccepted: true,
      recordingStatus: 'recorded_metadata_only_future_lane',
    },
    evidenceAudit: {
      totalEvidenceItems: 14,
      requiredEvidenceItems: 14,
      presentEvidenceItems: 12,
      missingEvidenceItems: 2,
      evidenceComplete: false,
      missingEvidenceRatio: 2 / 14,
    },
    recordingVocabularyAudit: {
      allowedRecordingStateCount: 10,
      allowedRecordingActionCount: 8,
      blockedRecordingActionCount: 14,
      blockedRecordingActions: ['execute_action','grant_approval','authorize_write_action','authorize_bridge_action','enable_direct_source','enable_automatic_response_takeover'],
      highRiskBlockedActionsPresent: true,
    },
    policyAudit: {
      idempotencyRequired: true,
      sideEffectsAllowed: false,
      lifecycleMetadataOnly: true,
      auditTrailRequired: true,
      retentionMetadataOnly: true,
    },
    boundaryAudit: {
      hardBoundaryCount: 12,
      recordingBoundaryIntact: true,
      approvalBoundaryIntact: true,
      executionBoundaryIntact: true,
      transmissionBoundaryIntact: true,
      bridgeBoundaryIntact: true,
      directSourceBoundaryIntact: true,
      automaticTakeoverBoundaryIntact: true,
    },
    auditFindings: [
      { findingId: 'f1', severity: 'critical', category: 'hard_boundary', message: 'critical example' },
      { findingId: 'f2', severity: 'warning', category: 'missing_evidence', message: 'warning example' },
    ],
    recordingImplemented: false,
    recordingPerformed: false,
    liveDecisionRecorded: false,
    reviewDecisionRecorded: false,
    approvalGranted: false,
    executionPerformed: false,
    ...overrides,
  };
}

const basic = projectControlledActionReviewDecisionPacketRecordingReviewExport({
  exportId: 'export.basic',
  exportFormat: 'review_json',
  exportProfile: 'internal_review',
  sourceSummary: makeSummary({ evidenceAudit: { totalEvidenceItems: 10, requiredEvidenceItems: 10, presentEvidenceItems: 10, missingEvidenceItems: 0, evidenceComplete: true, missingEvidenceRatio: 0 } }),
});
assert.equal(basic.recordingReviewExportOnly, true);
assert.equal(basic.recordingAuditSummaryExported, true);
assert.equal(basic.fileWritten, false);
assert.equal(basic.externalTransmissionPerformed, false);
assert.equal(basic.packagePublished, false);
assert.equal(basic.recordingPerformed, false);
assert.equal(basic.approvalGranted, false);
assert.equal(basic.executionPerformed, false);

const redacted = projectControlledActionReviewDecisionPacketRecordingReviewExport({
  exportId: 'export.redacted',
  generatedAt: '2026-05-23T10:54:00.000Z',
  exportFormat: 'compliance_json',
  exportProfile: 'compliance_review',
  sourceSummary: makeSummary(),
  redactionPolicy: {
    redactSummaryId: true,
    redactRecordingPacketId: true,
    redactReviewDecisionPacketId: true,
    redactRequestedBy: true,
    redactTimestamps: true,
  },
});
assert.equal(redacted.redactionApplied, true);
assert.equal(redacted.sourceSummary.summaryId, 'REDACTED_SUMMARY');
assert.equal(redacted.sourceProjection.recordingPacketId, 'REDACTED_RECORDING_PACKET');
assert.equal(redacted.sourceReviewDecisionPacket.reviewDecisionPacketId, 'REDACTED_REVIEW_DECISION_PACKET');
assert.equal(redacted.recordingRequestSummary.requestedBy, 'REDACTED_REQUESTER');
assert.equal(redacted.generatedAt, 'REDACTED_TIMESTAMP');

const excluded = projectControlledActionReviewDecisionPacketRecordingReviewExport({
  exportId: 'export.excluded',
  exportFormat: 'debug_json',
  exportProfile: 'debug_review',
  sourceSummary: makeSummary(),
  redactionPolicy: {
    includeAuditFindings: false,
    includeBlockedRecordingActions: false,
    includePolicyAudit: false,
    includeBoundaryAudit: false,
  },
});
assert.equal(excluded.exportedAuditFindings.length, 0);
assert.equal(excluded.blockedRecordingActions.length, 0);
assert.equal(excluded.policyAudit, undefined);
assert.equal(excluded.boundaryAudit, undefined);

const focus = projectControlledActionReviewDecisionPacketRecordingReviewExport({
  exportId: 'export.focus',
  exportFormat: 'handoff_json',
  exportProfile: 'agent_handoff',
  sourceSummary: makeSummary(),
});
for (const item of [
  'Review missing evidence before any future metadata recording lane.',
  'Confirm high-risk blocked recording actions remain blocked.',
  'Review critical audit findings.',
  'Review warning audit findings.',
  'Confirm recording/approval/execution boundaries remain intact.',
]) {
  assert(focus.reviewFocus.includes(item), `missing review focus ${item}`);
}
assert.equal(focus.fileWritten, false);
assert.equal(focus.externalTransmissionPerformed, false);
assert.equal(focus.packagePublished, false);
assert.equal(focus.recordingImplemented, false);
assert.equal(focus.recordingPerformed, false);
assert.equal(focus.liveDecisionRecorded, false);
assert.equal(focus.reviewDecisionRecorded, false);
assert.equal(focus.approvalGranted, false);
assert.equal(focus.executionPerformed, false);
assert.equal(focus.hardBoundaries.recordingReviewExportDoesNotEqualRecording, true);
assert.equal(focus.hardBoundaries.recordingReviewExportDoesNotEqualApproval, true);
assert.equal(focus.hardBoundaries.recordingReviewExportDoesNotEqualExecution, true);
assert.equal(focus.hardBoundaries.recordingAuditSummaryDoesNotEqualRecording, true);
assert.equal(focus.hardBoundaries.recordingDoesNotEqualApproval, true);
assert.equal(focus.hardBoundaries.recordingDoesNotEqualExecution, true);

const serialized = JSON.stringify(focus);
for (const forbidden of ['recorded_live','approved_for_execution','execution_authorized','action_allowed','write_allowed','bridge_allowed','ready_to_execute','can_execute','execution_allowed','approval_granted','grant_execution','authorize_execution']) {
  assert(!serialized.includes(forbidden), `forbidden wording present ${forbidden}`);
}

console.log(JSON.stringify({
  ok: true,
  exportId: focus.exportId,
  evidenceComplete: focus.reviewExportSummary.evidenceComplete,
  missingEvidenceItems: focus.reviewExportSummary.missingEvidenceItems,
  blockedRecordingActionCount: focus.reviewExportSummary.blockedRecordingActionCount,
  redactionApplied: redacted.redactionApplied,
  reviewFocusCount: focus.reviewFocus.length,
}, null, 2));
