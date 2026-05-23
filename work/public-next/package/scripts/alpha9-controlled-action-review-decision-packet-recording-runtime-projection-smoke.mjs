import assert from 'node:assert/strict';
import { projectControlledActionReviewDecisionPacketRecording } from '../dist/controlled-action-review-decision-packet-recording-projection.js';

function makeInput(requestedRecordingAction, recordingState, recordingAccepted, overrides = {}) {
  return {
    recordingPacketId: 'recording-packet-example',
    packetType: 'controlled_action_review_decision_packet_recording',
    schemaVersion: '1.0.0',
    status: 'schema_validated',
    createdAt: '2026-05-23T09:35:00.000Z',
    sourceReviewDecisionPacket: {
      reviewDecisionPacketId: 'review-decision-packet-example',
      reviewDecisionPacketSchemaId: 'schema-example',
      reviewDecisionPacketProjectionId: 'projection-example',
      reviewDecisionPacketDoesNotEqualApproval: true,
      reviewDecisionPacketDoesNotEqualExecution: true,
    },
    sourceProjection: {
      projectionId: 'projection-example',
      packetId: 'review-decision-packet-example',
      reviewDecisionPacketProjectionOnly: true,
      approvalGranted: false,
      executionPerformed: false,
      liveDecisionRecorded: false,
    },
    recordingRequest: {
      recordingRequestId: 'recording-request-example',
      reviewDecisionPacketId: 'review-decision-packet-example',
      reviewDecisionPacketProjectionId: 'projection-example',
      requestedRecordingAction,
      requestedBy: 'reviewer_or_agent',
      requestedAt: '2026-05-23T09:35:00.000Z',
      recordingReason: 'metadata only',
      executionPerformed: false,
      approvalGranted: false,
      recordingPerformed: false,
    },
    recordingResult: {
      recordingResultId: 'recording-result-example',
      recordingRequestId: 'recording-request-example',
      recordingState,
      recordingAccepted,
      recordingPerformed: false,
      liveDecisionRecorded: false,
      approvalGranted: false,
      executionPerformed: false,
      recordingDoesNotEqualApproval: true,
      recordingDoesNotEqualExecution: true,
    },
    allowedRecordingStates: [
      'recording_design_only','recording_not_started','recording_requested_metadata_only','recording_validated_metadata_only','recording_rejected_invalid','recording_rejected_missing_evidence','recording_recorded_metadata_only_future_lane','recording_superseded_metadata_only','recording_revoked_metadata_only','recording_expired_metadata_only'
    ],
    allowedRecordingActions: [
      'validate_recording_request','reject_invalid_recording_request','reject_missing_evidence','record_metadata_only_future_lane','supersede_recorded_metadata','revoke_recorded_metadata','expire_recorded_metadata','no_recording_action'
    ],
    blockedRecordingActions: [
      'record_live_decision_now','grant_approval','approve_for_execution','execute_action','authorize_write_action','authorize_bridge_action','enable_direct_source','enable_automatic_response_takeover','write_recording_file','transmit_recording','publish_package','restart_openclaw','mutate_block_library','touch_resleever'
    ].map((action) => ({ action, reason: 'blocked', requiresFutureLane: true, requiresExplicitApproval: true, requiresImplementation: true })),
    evidenceRequirements: {
      reviewDecisionPacketDesign: { required: true, present: true, referenceId: 'design', notes: ['ok'] },
      reviewDecisionPacketSchema: { required: true, present: true, referenceId: 'schema', notes: ['ok'] },
      reviewDecisionPacketRuntimeProjection: { required: true, present: true, referenceId: 'projection', notes: ['ok'] },
      auditPacketReviewBundle: { required: true, present: true, referenceId: 'bundle', notes: ['ok'] },
      auditPacketExport: { required: true, present: true, referenceId: 'export', notes: ['ok'] },
      auditPacket: { required: true, present: true, referenceId: 'packet', notes: ['ok'] },
      policyTraceReport: { required: true, present: true, referenceId: 'trace', notes: ['ok'] },
      policyToReadinessIntegration: { required: true, present: true, referenceId: 'integration', notes: ['ok'] },
      readinessMatrix: { required: true, present: true, referenceId: 'readiness', notes: ['ok'] },
      blockedRouteSummary: { required: true, present: true, referenceId: 'blocked', notes: ['ok'] },
      dryRunProjection: { required: true, present: false, referenceId: 'dryrun', notes: ['missing'] },
      approvalCheckpoint: { required: true, present: false, referenceId: 'checkpoint', notes: ['missing'] },
      approvalFlowProjection: { required: true, present: true, referenceId: 'approvalflow', notes: ['ok'] },
      policyProjection: { required: true, present: true, referenceId: 'policy', notes: ['ok'] }
    },
    idempotencyPolicy: {
      idempotencyRequired: true,
      idempotencyKeyFields: ['recordingRequestId', 'reviewDecisionPacketId'],
      duplicateRequestBehavior: 'return_existing_metadata',
      duplicateRecordingBehavior: 'supersede_explicitly',
      sideEffectsAllowed: false,
    },
    supersessionPolicy: { enabled: true, metadataOnly: true, deletesHistory: false, grantsApproval: false, grantsExecution: false, notes: ['ok'] },
    revocationPolicy: { enabled: true, metadataOnly: true, deletesHistory: false, grantsApproval: false, grantsExecution: false, notes: ['ok'] },
    expirationPolicy: { enabled: true, metadataOnly: true, deletesHistory: false, grantsApproval: false, grantsExecution: false, notes: ['ok'] },
    auditTrail: { auditTrailRequired: true, recordsRequest: true, recordsResult: true, recordsEvidence: true, recordsHardBoundaries: true, recordsSupersession: true, recordsRevocation: true, recordsExpiration: true, externalTransmissionPerformed: false, fileWritten: false },
    retentionPolicy: { retentionPolicyDefined: true, metadataOnly: true, deletesHistory: false, allowsExternalTransmission: false, notes: ['ok'] },
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
    recordingImplemented: false,
    recordingPerformed: false,
    liveDecisionRecorded: false,
    reviewDecisionRecorded: false,
    approvalGranted: false,
    executionPerformed: false,
    recordingSchemaDoesNotEqualRecording: true,
    recordingDoesNotEqualApproval: true,
    recordingDoesNotEqualExecution: true,
    ...overrides,
  };
}

const validateProjection = projectControlledActionReviewDecisionPacketRecording(makeInput('validate_recording_request', 'recording_validated_metadata_only', true));
assert.equal(validateProjection.reviewDecisionPacketRecordingProjectionOnly, true);
assert.equal(validateProjection.recordingImplemented, false);
assert.equal(validateProjection.recordingPerformed, false);
assert.equal(validateProjection.liveDecisionRecorded, false);
assert.equal(validateProjection.approvalGranted, false);
assert.equal(validateProjection.executionPerformed, false);

const futureProjection = projectControlledActionReviewDecisionPacketRecording(makeInput('record_metadata_only_future_lane', 'recording_recorded_metadata_only_future_lane', true));
assert.equal(futureProjection.recordingPerformed, false);
assert.equal(futureProjection.liveDecisionRecorded, false);
assert.equal(futureProjection.approvalGranted, false);
assert.equal(futureProjection.executionPerformed, false);
assert(futureProjection.projectionNotes.some((note) => note.includes('metadata only')));

const rejectProjection = projectControlledActionReviewDecisionPacketRecording(makeInput('reject_missing_evidence', 'recording_rejected_missing_evidence', false));
assert.equal(rejectProjection.recordingPerformed, false);
assert.equal(rejectProjection.liveDecisionRecorded, false);
assert(rejectProjection.evidenceSummary.missingEvidenceItems > 0);

for (const state of ['recording_superseded_metadata_only', 'recording_revoked_metadata_only', 'recording_expired_metadata_only']) {
  const p = projectControlledActionReviewDecisionPacketRecording(makeInput('no_recording_action', state, true));
  assert.equal(p.recordingPerformed, false);
  assert.equal(p.approvalGranted, false);
  assert.equal(p.executionPerformed, false);
}

assert(validateProjection.evidenceSummary.totalEvidenceItems > 0);
assert(validateProjection.evidenceSummary.requiredEvidenceItems > 0);
assert(validateProjection.evidenceSummary.presentEvidenceItems >= 0);
assert(validateProjection.evidenceSummary.missingEvidenceItems >= 0);
for (const blocked of ['record_live_decision_now','grant_approval','approve_for_execution','execute_action','authorize_write_action','authorize_bridge_action','enable_direct_source','enable_automatic_response_takeover','write_recording_file','transmit_recording','publish_package','restart_openclaw','mutate_block_library','touch_resleever']) {
  assert(validateProjection.recordingVocabularySummary.blockedRecordingActions.includes(blocked), `missing blocked recording action ${blocked}`);
}
assert.equal(validateProjection.hardBoundaries.recordingSchemaDoesNotEqualRecording, true);
assert.equal(validateProjection.hardBoundaries.recordingDoesNotEqualApproval, true);
assert.equal(validateProjection.hardBoundaries.recordingDoesNotEqualExecution, true);
assert.equal(validateProjection.recordingImplemented, false);
assert.equal(validateProjection.recordingPerformed, false);
assert.equal(validateProjection.liveDecisionRecorded, false);
assert.equal(validateProjection.approvalGranted, false);
assert.equal(validateProjection.executionPerformed, false);
const serialized = JSON.stringify(validateProjection);
for (const forbidden of ['recorded_live','approved_for_execution','execution_authorized','action_allowed','write_allowed','bridge_allowed','ready_to_execute','can_execute','execution_allowed','approval_granted','grant_execution','authorize_execution']) {
  assert(!serialized.includes(forbidden), `forbidden wording present ${forbidden}`);
}

console.log(JSON.stringify({
  ok: true,
  projectionId: validateProjection.projectionId,
  recordingPacketId: validateProjection.recordingPacketId,
  requiredEvidenceItems: validateProjection.evidenceSummary.requiredEvidenceItems,
  presentEvidenceItems: validateProjection.evidenceSummary.presentEvidenceItems,
  missingEvidenceItems: validateProjection.evidenceSummary.missingEvidenceItems,
  blockedRecordingActions: validateProjection.recordingVocabularySummary.blockedRecordingActionCount,
  recordingPerformed: validateProjection.recordingPerformed,
  liveDecisionRecorded: validateProjection.liveDecisionRecorded,
}, null, 2));
