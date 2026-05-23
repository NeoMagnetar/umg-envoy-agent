import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.resolve(__dirname, '../fixtures/action-gates/controlled-action-review-decision-packet-recording-v1.design.json');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.equal(fixture.designId, 'controlled-action-review-decision-packet-recording-v1');
assert.equal(fixture.status, 'design_only');
assert.equal(fixture.recordingImplemented, false);
assert.equal(fixture.recordingPerformed, false);
assert.equal(fixture.reviewDecisionRecorded, false);
assert.equal(fixture.approvalGranted, false);
assert.equal(fixture.executionPerformed, false);
assert.equal(fixture.recordingDesignDoesNotEqualRecording, true);
assert.equal(fixture.recordingDoesNotEqualApproval, true);
assert.equal(fixture.recordingDoesNotEqualExecution, true);

for (const allowed of [
  'recording_design_only',
  'recording_not_started',
  'recording_requested_metadata_only',
  'recording_validated_metadata_only',
  'recording_rejected_invalid',
  'recording_rejected_missing_evidence',
  'recording_recorded_metadata_only_future_lane',
  'recording_superseded_metadata_only',
  'recording_revoked_metadata_only',
  'recording_expired_metadata_only',
]) {
  assert(fixture.allowedRecordingStates.includes(allowed), `missing allowed recording state ${allowed}`);
}
for (const forbidden of ['recorded_live', 'approved', 'approved_for_execution', 'execution_authorized', 'action_allowed']) {
  assert(!fixture.allowedRecordingStates.includes(forbidden), `forbidden recording state present ${forbidden}`);
}
for (const blocked of [
  'record_live_decision_now',
  'grant_approval',
  'approve_for_execution',
  'execute_action',
  'authorize_write_action',
  'authorize_bridge_action',
  'enable_direct_source',
  'enable_automatic_response_takeover',
  'write_recording_file',
  'transmit_recording',
  'publish_package',
  'restart_openclaw',
  'mutate_block_library',
  'touch_resleever',
]) {
  assert(Object.prototype.hasOwnProperty.call(fixture.blockedRecordingActions, blocked), `missing blocked recording action ${blocked}`);
}
assert(fixture.hardBoundaries.principles.includes('Recording design does not equal recording.'));
assert(fixture.hardBoundaries.principles.includes('Recording does not equal approval.'));
assert(fixture.hardBoundaries.principles.includes('Recording does not equal execution.'));
assert.equal(fs.existsSync(path.resolve(__dirname, '../src/controlled-action-review-decision-packet-recording.ts')), false);
assert.equal(fs.existsSync(path.resolve(__dirname, '../dist/controlled-action-review-decision-packet-recording.js')), false);

console.log(JSON.stringify({
  ok: true,
  designId: fixture.designId,
  status: fixture.status,
  allowedRecordingStates: fixture.allowedRecordingStates.length,
  blockedRecordingActions: Object.keys(fixture.blockedRecordingActions).length,
  recordingImplemented: fixture.recordingImplemented,
  recordingPerformed: fixture.recordingPerformed,
  reviewDecisionRecorded: fixture.reviewDecisionRecorded,
}, null, 2));
