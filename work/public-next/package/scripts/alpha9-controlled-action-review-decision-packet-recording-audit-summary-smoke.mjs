import assert from 'node:assert/strict';
import { projectControlledActionReviewDecisionPacketRecordingAuditSummary } from '../dist/controlled-action-review-decision-packet-recording-audit-summary.js';

function makeSourceProjection(recordingState, requestedRecordingAction, missingEvidenceItems) {
  return {
    projectionId: 'projection.recording.example',
    recordingPacketId: 'recording-packet-example',
    schemaVersion: '1.0.0',
    reviewDecisionPacketRecordingProjectionOnly: true,
    recordingImplemented: false,
    recordingPerformed: false,
    liveDecisionRecorded: false,
    reviewDecisionRecorded: false,
    approvalGranted: false,
    executionPerformed: false,
    sourceReviewDecisionPacket: {
      reviewDecisionPacketId: 'review-decision-packet-example',
      reviewDecisionPacketSchemaId: 'schema-example',
      reviewDecisionPacketProjectionId: 'projection-example',
    },
    sourceProjection: {
      projectionId: 'projection-example',
      packetId: 'packet-example',
    },
    recordingRequestSummary: {
      recordingRequestId: 'request-example',
      requestedRecordingAction,
      requestedBy: 'reviewer_or_agent',
      requestedAt: '2026-05-23T10:42:00.000Z',
    },
    recordingResultSummary: {
      recordingResultId: 'result-example',
      recordingState,
      recordingAccepted: !recordingState.includes('rejected'),
    },
    recordingVocabularySummary: {
      allowedRecordingStateCount: 10,
      allowedRecordingActionCount: 8,
      blockedRecordingActionCount: 14,
      allowedRecordingStates: [],
      allowedRecordingActions: [],
      blockedRecordingActions: ['record_live_decision_now','grant_approval','approve_for_execution','execute_action','authorize_write_action','authorize_bridge_action','enable_direct_source','enable_automatic_response_takeover','write_recording_file','transmit_recording','publish_package','restart_openclaw','mutate_block_library','touch_resleever'],
    },
    evidenceSummary: {
      totalEvidenceItems: 14,
      requiredEvidenceItems: 14,
      presentEvidenceItems: 14 - missingEvidenceItems,
      missingEvidenceItems,
    },
    policySummary: {
      idempotencyRequired: true,
      sideEffectsAllowed: false,
      supersessionMetadataOnly: true,
      revocationMetadataOnly: true,
      expirationMetadataOnly: true,
      auditTrailRequired: true,
      retentionMetadataOnly: true,
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
      reviewDecisionPacketProjectionDoesNotEqualApproval: true,
      reviewDecisionPacketProjectionDoesNotEqualExecution: true,
      recordingSchemaDoesNotEqualRecording: true,
      recordingDoesNotEqualApproval: true,
      recordingDoesNotEqualExecution: true,
      recordingImplemented: false,
      recordingPerformed: false,
      liveDecisionRecorded: false,
      approvalGranted: false,
      executionPerformed: false,
      writeActionPerformed: false,
      bridgeActionPerformed: false,
      fileWritten: false,
      externalTransmissionPerformed: false,
      packagePublished: false,
      directSourceEnabled: false,
      automaticResponseTakeoverEnabled: false,
    },
    projectionNotes: ['metadata only'],
  };
}

const validated = projectControlledActionReviewDecisionPacketRecordingAuditSummary({
  summaryId: 'summary.validated',
  sourceProjection: makeSourceProjection('recording_validated_metadata_only', 'validate_recording_request', 0),
});
assert.equal(validated.recordingAuditSummaryOnly, true);
assert.equal(validated.recordingResultSummary.recordingStatus, 'validated_metadata_only');
assert.equal(validated.evidenceAudit.evidenceComplete, true);
assert.equal(validated.recordingPerformed, false);
assert.equal(validated.liveDecisionRecorded, false);
assert.equal(validated.approvalGranted, false);
assert.equal(validated.executionPerformed, false);

const missing = projectControlledActionReviewDecisionPacketRecordingAuditSummary({
  summaryId: 'summary.missing',
  sourceProjection: makeSourceProjection('recording_rejected_missing_evidence', 'reject_missing_evidence', 2),
});
assert.equal(missing.recordingResultSummary.recordingStatus, 'rejected_missing_evidence_metadata_only');
assert.equal(missing.evidenceAudit.evidenceComplete, false);
assert(missing.evidenceAudit.missingEvidenceRatio > 0);
assert(missing.auditFindings.some((f) => f.category === 'missing_evidence'));

const future = projectControlledActionReviewDecisionPacketRecordingAuditSummary({
  summaryId: 'summary.future',
  sourceProjection: makeSourceProjection('recording_recorded_metadata_only_future_lane', 'record_metadata_only_future_lane', 0),
});
assert.equal(future.recordingResultSummary.recordingStatus, 'recorded_metadata_only_future_lane');
assert.equal(future.recordingPerformed, false);
assert.equal(future.liveDecisionRecorded, false);
assert.equal(future.approvalGranted, false);
assert.equal(future.executionPerformed, false);

assert.equal(validated.recordingVocabularyAudit.highRiskBlockedActionsPresent, true);
assert(validated.auditFindings.some((f) => f.category === 'blocked_recording_action'));
assert.equal(validated.boundaryAudit.recordingBoundaryIntact, true);
assert.equal(validated.boundaryAudit.approvalBoundaryIntact, true);
assert.equal(validated.boundaryAudit.executionBoundaryIntact, true);
assert.equal(validated.boundaryAudit.transmissionBoundaryIntact, true);
assert.equal(validated.boundaryAudit.bridgeBoundaryIntact, true);
assert.equal(validated.boundaryAudit.directSourceBoundaryIntact, true);
assert.equal(validated.boundaryAudit.automaticTakeoverBoundaryIntact, true);

const serialized = JSON.stringify(validated);
for (const forbidden of ['recorded_live','approved_for_execution','execution_authorized','action_allowed','write_allowed','bridge_allowed','ready_to_execute','can_execute','execution_allowed','approval_granted','grant_execution','authorize_execution']) {
  assert(!serialized.includes(forbidden), `forbidden wording present ${forbidden}`);
}

console.log(JSON.stringify({
  ok: true,
  summaryId: validated.summaryId,
  recordingStatus: validated.recordingResultSummary.recordingStatus,
  evidenceComplete: validated.evidenceAudit.evidenceComplete,
  missingEvidenceRatio: validated.evidenceAudit.missingEvidenceRatio,
  highRiskBlockedActionsPresent: validated.recordingVocabularyAudit.highRiskBlockedActionsPresent,
  recordingBoundaryIntact: validated.boundaryAudit.recordingBoundaryIntact,
}, null, 2));
