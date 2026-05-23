import assert from 'node:assert/strict';
import { projectControlledActionReviewDecisionPacketRecordingPhaseSummary } from '../dist/controlled-action-review-decision-packet-recording-phase-summary.js';

const validationCommands = [
  'npm run build',
  'node scripts/alpha9-controlled-action-review-decision-packet-recording-phase-summary-smoke.mjs',
  'node scripts/alpha9-controlled-action-review-decision-packet-recording-handoff-bundle-smoke.mjs',
  'npm run validate:alpha-current',
];

const mustPreserveBoundaries = [
  'recordingImplemented=false',
  'recordingPerformed=false',
  'liveDecisionRecorded=false',
  'reviewDecisionRecorded=false',
  'approvalGranted=false',
  'executionPerformed=false',
  'fileWritten=false',
  'externalTransmissionPerformed=false',
  'packagePublished=false',
  'direct_source remains disabled',
  'automatic response takeover remains disabled',
];

const mustNotDoNext = [
  'do not implement live recording',
  'do not record a live review decision',
  'do not grant approval',
  'do not execute actions',
  'do not implement write actions',
  'do not enable bridge actions',
  'do not mutate UMG-Block-Library',
  'do not touch Resleever',
  'do not publish package',
  'do not restart OpenClaw',
];

const completedLanes = [
  'review decision packet recording design',
  'review decision packet recording schema',
  'review decision packet recording runtime projection',
  'review decision packet recording audit summary',
  'review decision packet recording review export',
  'review decision packet recording handoff bundle',
].map((laneName, index) => ({
  laneName,
  commit: `commit-${index + 1}`,
  status: 'validated',
  validationPassed: true,
  boundaryFlagsConfirmed: ['recordingPerformed=false', 'approvalGranted=false', 'executionPerformed=false'],
}));

const summary = projectControlledActionReviewDecisionPacketRecordingPhaseSummary({
  phaseSummaryId: 'phase-summary-1',
  generatedAt: '2026-05-23T15:00:00Z',
  phaseName: 'review_decision_packet_recording_phase',
  phaseStatus: 'handoff_ready',
  baseline: {
    branch: 'alpha7/from-public-synced-alpha6',
    packageVersion: '0.3.0-alpha.12',
    currentCommit: '9dd37f0474a451d5968ae2c0ea73688f6149f474',
    correctedPriorCheckpoint: '096e4c4258bbc8a1293758f0309318d4a12f4a59',
    parkedResidue: ['../../../artifacts/'],
  },
  completedLanes,
  validation: {
    buildPassed: true,
    validateAlphaCurrentPassed: true,
    validationCommands,
    failedCommands: [],
  },
  hardBoundaries: {
    phaseSummaryOnly: true,
    recordingImplemented: false,
    recordingPerformed: false,
    liveDecisionRecorded: false,
    reviewDecisionRecorded: false,
    approvalGranted: false,
    executionPerformed: false,
    fileWritten: false,
    externalTransmissionPerformed: false,
    packagePublished: false,
    directSourceEnabled: false,
    automaticResponseTakeoverEnabled: false,
    phaseSummaryDoesNotEqualRecording: true,
    phaseSummaryDoesNotEqualApproval: true,
    phaseSummaryDoesNotEqualExecution: true,
  },
  recommendedNextLane: 'ALPHA9_CONTROLLED_ACTION_EXECUTION_PHASE_HANDOFF_REPORT_SOURCE',
  mustPreserveBoundaries,
  mustNotDoNext,
  phaseNotes: ['correctedPriorCheckpoint=096e4c4258bbc8a1293758f0309318d4a12f4a59'],
});

assert.equal(summary.phaseSummaryOnly, true);
assert.equal(summary.phaseStatus, 'handoff_ready');
assert.equal(summary.recordingImplemented, false);
assert.equal(summary.recordingPerformed, false);
assert.equal(summary.liveDecisionRecorded, false);
assert.equal(summary.reviewDecisionRecorded, false);
assert.equal(summary.approvalGranted, false);
assert.equal(summary.executionPerformed, false);

for (const laneName of [
  'review decision packet recording design',
  'review decision packet recording schema',
  'review decision packet recording runtime projection',
  'review decision packet recording audit summary',
  'review decision packet recording review export',
  'review decision packet recording handoff bundle',
]) {
  assert.ok(summary.completedLanes.some((lane) => lane.laneName === laneName));
}

assert.equal(summary.boundarySummary.recordingBoundaryIntact, true);
assert.equal(summary.boundarySummary.approvalBoundaryIntact, true);
assert.equal(summary.boundarySummary.executionBoundaryIntact, true);
assert.equal(summary.boundarySummary.transmissionBoundaryIntact, true);
assert.equal(summary.boundarySummary.directSourceBoundaryIntact, true);
assert.equal(summary.boundarySummary.automaticTakeoverBoundaryIntact, true);

assert.equal(summary.validationSummary.buildPassed, true);
assert.equal(summary.validationSummary.validateAlphaCurrentPassed, true);
assert.equal(summary.validationSummary.failedValidationCommands, 0);
assert.ok(summary.validationSummary.totalValidationCommands > 0);

assert.ok(summary.mustPreserveBoundaries.includes('recordingImplemented=false'));
assert.ok(summary.mustPreserveBoundaries.includes('approvalGranted=false'));
assert.ok(summary.mustPreserveBoundaries.includes('executionPerformed=false'));
assert.ok(summary.mustNotDoNext.includes('do not implement live recording'));
assert.ok(summary.mustNotDoNext.includes('do not grant approval'));
assert.ok(summary.mustNotDoNext.includes('do not execute actions'));

assert.equal(summary.baseline.correctedPriorCheckpoint, '096e4c4258bbc8a1293758f0309318d4a12f4a59');
assert.ok(summary.phaseNotes.includes('correctedPriorCheckpoint=096e4c4258bbc8a1293758f0309318d4a12f4a59'));

const text = JSON.stringify(summary);
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

console.log('alpha9 controlled action review decision packet recording phase summary smoke: PASS');
