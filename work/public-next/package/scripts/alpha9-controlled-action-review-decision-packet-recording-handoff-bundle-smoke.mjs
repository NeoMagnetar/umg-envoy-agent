import assert from 'node:assert/strict';
import { projectControlledActionReviewDecisionPacketRecordingHandoffBundle } from '../dist/controlled-action-review-decision-packet-recording-handoff-bundle.js';

function makeSourceReviewExport(overrides = {}) {
  return {
    exportId: 'export-1',
    generatedAt: '2026-05-23T08:00:00Z',
    exportFormat: 'handoff_json',
    exportProfile: 'agent_handoff',
    recordingReviewExportOnly: true,
    recordingAuditSummaryExported: true,
    fileWritten: false,
    externalTransmissionPerformed: false,
    packagePublished: false,
    recordingImplemented: false,
    recordingPerformed: false,
    liveDecisionRecorded: false,
    reviewDecisionRecorded: false,
    approvalGranted: false,
    executionPerformed: false,
    sourceSummary: {
      summaryId: 'summary-1',
      generatedAt: '2026-05-23T07:59:00Z',
    },
    sourceProjection: {
      projectionId: 'projection-1',
      recordingPacketId: 'packet-1',
      schemaVersion: 'v1',
    },
    sourceReviewDecisionPacket: {
      reviewDecisionPacketId: 'rdp-1',
      reviewDecisionPacketSchemaId: 'rdp-schema-1',
      reviewDecisionPacketProjectionId: 'rdp-projection-1',
    },
    recordingRequestSummary: {
      recordingRequestId: 'req-1',
      requestedRecordingAction: 'capture_metadata_only',
      requestedBy: 'agent',
      requestedAt: '2026-05-23T07:58:00Z',
    },
    recordingResultSummary: {
      recordingResultId: 'result-1',
      recordingState: 'blocked',
      recordingAccepted: false,
      recordingStatus: 'metadata_only',
    },
    reviewExportSummary: {
      evidenceComplete: true,
      totalEvidenceItems: 5,
      requiredEvidenceItems: 5,
      presentEvidenceItems: 5,
      missingEvidenceItems: 0,
      missingEvidenceRatio: 0,
      auditFindingCount: 1,
      criticalFindingCount: 0,
      warningFindingCount: 0,
      blockedRecordingActionCount: 1,
      highRiskBlockedActionsPresent: false,
    },
    reviewFocus: ['Confirm review posture remains metadata-only.'],
    exportedAuditFindings: [
      {
        findingId: 'finding-1',
        severity: 'notice',
        category: 'metadata_only',
        message: 'Metadata-only posture preserved.',
      },
    ],
    redactionApplied: false,
    blockedRecordingActions: ['live_capture'],
    hardBoundaries: {
      recordingReviewExportDoesNotEqualRecording: true,
      recordingReviewExportDoesNotEqualApproval: true,
      recordingReviewExportDoesNotEqualExecution: true,
      recordingAuditSummaryDoesNotEqualRecording: true,
      recordingDoesNotEqualApproval: true,
      recordingDoesNotEqualExecution: true,
    },
    exportNotes: ['base export note'],
    ...overrides,
  };
}

function makeBundle(sourceReviewExport) {
  return projectControlledActionReviewDecisionPacketRecordingHandoffBundle({
    handoffBundleId: 'handoff-1',
    generatedAt: '2026-05-23T08:01:00Z',
    handoffProfile: 'agent_to_agent',
    sourceReviewExport,
    handoffNotes: ['bundle note'],
  });
}

{
  const bundle = makeBundle(makeSourceReviewExport());
  assert.equal(bundle.recordingHandoffBundleOnly, true);
  assert.equal(bundle.sourceReviewExportBundled, true);
  assert.equal(bundle.fileWritten, false);
  assert.equal(bundle.externalTransmissionPerformed, false);
  assert.equal(bundle.packagePublished, false);
  assert.equal(bundle.bundleSent, false);
  assert.equal(bundle.recordingPerformed, false);
  assert.equal(bundle.approvalGranted, false);
  assert.equal(bundle.executionPerformed, false);
}

{
  const bundle = makeBundle(
    makeSourceReviewExport({
      reviewExportSummary: {
        evidenceComplete: false,
        totalEvidenceItems: 5,
        requiredEvidenceItems: 5,
        presentEvidenceItems: 3,
        missingEvidenceItems: 2,
        missingEvidenceRatio: 0.4,
        auditFindingCount: 1,
        criticalFindingCount: 0,
        warningFindingCount: 0,
        blockedRecordingActionCount: 1,
        highRiskBlockedActionsPresent: false,
      },
    }),
  );
  assert.ok(bundle.continuationFocus.includes('Resolve missing evidence before future metadata recording implementation.'));
}

{
  const bundle = makeBundle(
    makeSourceReviewExport({
      reviewExportSummary: {
        evidenceComplete: true,
        totalEvidenceItems: 5,
        requiredEvidenceItems: 5,
        presentEvidenceItems: 5,
        missingEvidenceItems: 0,
        missingEvidenceRatio: 0,
        auditFindingCount: 3,
        criticalFindingCount: 1,
        warningFindingCount: 1,
        blockedRecordingActionCount: 1,
        highRiskBlockedActionsPresent: false,
      },
    }),
  );
  assert.ok(bundle.continuationFocus.includes('Review critical audit findings before continuing.'));
  assert.ok(bundle.continuationFocus.includes('Review warning audit findings before continuing.'));
}

{
  const bundle = makeBundle(
    makeSourceReviewExport({
      reviewExportSummary: {
        evidenceComplete: true,
        totalEvidenceItems: 5,
        requiredEvidenceItems: 5,
        presentEvidenceItems: 5,
        missingEvidenceItems: 0,
        missingEvidenceRatio: 0,
        auditFindingCount: 1,
        criticalFindingCount: 0,
        warningFindingCount: 0,
        blockedRecordingActionCount: 2,
        highRiskBlockedActionsPresent: true,
      },
    }),
  );
  assert.ok(bundle.continuationFocus.includes('Confirm high-risk blocked recording actions remain blocked.'));
}

{
  const bundle = makeBundle(makeSourceReviewExport());
  assert.ok(bundle.mustPreserveBoundaries.includes('recordingImplemented=false'));
  assert.ok(bundle.mustPreserveBoundaries.includes('approvalGranted=false'));
  assert.ok(bundle.mustPreserveBoundaries.includes('executionPerformed=false'));
  assert.ok(bundle.mustNotDoNext.includes('do not implement live recording'));
  assert.ok(bundle.mustNotDoNext.includes('do not grant approval'));
  assert.ok(bundle.mustNotDoNext.includes('do not execute actions'));
}

{
  const bundle = makeBundle(makeSourceReviewExport());
  assert.equal(bundle.fileWritten, false);
  assert.equal(bundle.externalTransmissionPerformed, false);
  assert.equal(bundle.packagePublished, false);
  assert.equal(bundle.bundleSent, false);
  assert.equal(bundle.recordingImplemented, false);
  assert.equal(bundle.recordingPerformed, false);
  assert.equal(bundle.liveDecisionRecorded, false);
  assert.equal(bundle.reviewDecisionRecorded, false);
  assert.equal(bundle.approvalGranted, false);
  assert.equal(bundle.executionPerformed, false);
}

{
  const bundle = makeBundle(makeSourceReviewExport());
  assert.equal(bundle.hardBoundaries.recordingHandoffBundleDoesNotEqualRecording, true);
  assert.equal(bundle.hardBoundaries.recordingHandoffBundleDoesNotEqualApproval, true);
  assert.equal(bundle.hardBoundaries.recordingHandoffBundleDoesNotEqualExecution, true);
}

{
  const bundle = makeBundle(makeSourceReviewExport());
  const text = JSON.stringify(bundle);
  for (const forbidden of [
    'recorded_live',
    'approved_for_execution',
    'execution_authorized',
    'action_allowed',
    'write_allowed',
    'bridge_allowed',
    'ready_to_execute',
    'can_execute',
    'execution_allowed',
    'approval_granted',
    'grant_execution',
    'authorize_execution',
  ]) {
    assert.equal(text.includes(forbidden), false, `forbidden term present: ${forbidden}`);
  }
}

console.log('alpha9 controlled action review decision packet recording handoff bundle smoke: PASS');
