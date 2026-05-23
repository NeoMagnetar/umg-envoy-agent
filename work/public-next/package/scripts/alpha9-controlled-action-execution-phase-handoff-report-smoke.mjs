import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const reportPath = path.join(repoRoot, 'docs', 'ALPHA9-CONTROLLED-ACTION-EXECUTION-PHASE-HANDOFF-REPORT.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'controlled-action-execution-phase-handoff-report-v1.json');

const reportText = fs.readFileSync(reportPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.equal(fixture.status, 'handoff_ready');
assert.equal(fixture.packageVersion, '0.3.0-alpha.12');
assert.equal(fixture.currentCommit, '60f9bb37c0a0715785524cf93abbdd8a053fb5a9');
assert.equal(fixture.correctedReviewExportCheckpoint, '096e4c4258bbc8a1293758f0309318d4a12f4a59');
assert.equal(fixture.acceptedHandoffBundleCheckpoint, '9dd37f0474a451d5968ae2c0ea73688f6149f474');
assert.equal(fixture.phaseSummaryCheckpoint, '60f9bb37c0a0715785524cf93abbdd8a053fb5a9');

const requiredLanes = [
  'controlled action gate policy projection',
  'approval-flow runtime projection',
  'approval checkpoint projection',
  'approval decision simulation',
  'dry-run runtime projection',
  'blocked-route runtime summary',
  'execution readiness matrix',
  'policy-to-readiness integration',
  'policy trace/report',
  'audit packet',
  'audit packet export',
  'audit packet review bundle',
  'review decision packet design',
  'review decision packet schema',
  'review decision packet runtime projection',
  'review decision packet recording design',
  'review decision packet recording schema',
  'review decision packet recording runtime projection',
  'review decision packet recording audit summary',
  'review decision packet recording review export',
  'review decision packet recording handoff bundle',
  'review decision packet recording phase summary',
];

assert.equal(fixture.completedLanes.length, 22);
for (const lane of requiredLanes) {
  assert.ok(fixture.completedLanes.includes(lane), `missing lane: ${lane}`);
}

assert.equal(fixture.recordingImplemented, false);
assert.equal(fixture.recordingPerformed, false);
assert.equal(fixture.liveDecisionRecorded, false);
assert.equal(fixture.approvalGranted, false);
assert.equal(fixture.executionPerformed, false);
assert.equal(fixture.directSourceEnabled, false);
assert.equal(fixture.automaticResponseTakeoverEnabled, false);
assert.equal(fixture.packagePublished, false);
assert.equal(fixture.openClawRestarted, false);
assert.ok(fixture.parkedResidue.includes('../../../artifacts/'));
assert.equal(fixture.recommendedNextStep, 'ALPHA9_CONTROLLED_ACTION_EXECUTION_NEXT_PHASE_PLANNING_SOURCE');

for (const phrase of [
  'Policy does not equal execution.',
  'Approval does not equal execution.',
  'Checkpoint does not equal execution.',
  'Dry-run does not equal execution.',
  'Decision simulation does not equal execution.',
  'Readiness does not equal execution.',
  'Trace report does not equal execution.',
  'Audit packet does not equal execution.',
  'Audit packet export does not equal execution.',
  'Review bundle does not equal approval.',
  'Review bundle does not equal execution.',
  'Review decision packet does not equal approval.',
  'Review decision packet does not equal execution.',
  'Review decision packet projection does not equal approval.',
  'Review decision packet projection does not equal execution.',
  'Recording schema does not equal recording.',
  'Recording projection does not equal recording.',
  'Recording audit summary does not equal recording.',
  'Recording review export does not equal recording.',
  'Recording handoff bundle does not equal recording.',
  'Recording phase summary does not equal recording.',
  'Recording does not equal approval.',
  'Recording does not equal execution.',
  'Phase handoff report does not equal execution.',
]) {
  assert.ok(reportText.includes(phrase), `missing report phrase: ${phrase}`);
}

const forbiddenCorpus = `${reportText}\n${JSON.stringify(fixture)}`;
for (const forbidden of [
  'ready_to_execute',
  'can_execute',
  'approved_for_execution',
  'execution_allowed',
  'approval_granted',
  'grant_execution',
  'authorize_execution',
]) {
  assert.equal(forbiddenCorpus.includes(forbidden), false, `forbidden term present: ${forbidden}`);
}

console.log('alpha9 controlled action execution phase handoff report smoke: PASS');
