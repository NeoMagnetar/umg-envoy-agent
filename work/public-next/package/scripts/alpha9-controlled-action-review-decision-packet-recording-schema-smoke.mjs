import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const schema = JSON.parse(fs.readFileSync(path.join(root, 'schemas', 'umg-controlled-action-review-decision-packet-recording.schema.json'), 'utf8'));
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'fixtures', 'action-gates', 'controlled-action-review-decision-packet-recording-example.json'), 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(schema.$id === 'umg.controlled_action_review_decision_packet_recording.v1', 'schema id drift');
assert(fixture.recordingType === 'controlled_action_review_decision_packet_recording', 'recordingType drift');
assert(fixture.schemaVersion === '1.0.0', 'schemaVersion drift');
assert(fixture.recordingImplemented === false, 'recordingImplemented drift');
assert(fixture.recordingPerformed === false, 'recordingPerformed drift');
assert(fixture.reviewDecisionRecorded === false, 'reviewDecisionRecorded drift');
assert(fixture.approvalGranted === false, 'approvalGranted drift');
assert(fixture.executionPerformed === false, 'executionPerformed drift');
assert(fixture.recordingDesignDoesNotEqualRecording === true, 'recordingDesignDoesNotEqualRecording drift');
assert(fixture.recordingDoesNotEqualApproval === true, 'recordingDoesNotEqualApproval drift');
assert(fixture.recordingDoesNotEqualExecution === true, 'recordingDoesNotEqualExecution drift');

const allowedStates = schema.$defs.allowedRecordingState.enum;
for (const state of ['recording_design_only','recording_not_started','recording_requested_metadata_only','recording_validated_metadata_only','recording_rejected_invalid','recording_rejected_missing_evidence','recording_recorded_metadata_only_future_lane','recording_superseded_metadata_only','recording_revoked_metadata_only','recording_expired_metadata_only']) {
  assert(allowedStates.includes(state), `missing allowed recording state ${state}`);
}
for (const forbidden of ['recorded_live','approved','approved_for_execution','execution_authorized','action_allowed']) {
  assert(!allowedStates.includes(forbidden), `forbidden recording state present ${forbidden}`);
}
for (const blocked of ['record_live_decision_now','grant_approval','approve_for_execution','execute_action','authorize_write_action','authorize_bridge_action','enable_direct_source','enable_automatic_response_takeover','write_recording_file','transmit_recording','publish_package','restart_openclaw','mutate_block_library','touch_resleever']) {
  assert(Object.prototype.hasOwnProperty.call(fixture.blockedRecordingActions, blocked), `missing blocked recording action ${blocked}`);
}
assert(fixture.hardBoundaries.recordingImplemented === false, 'hard boundary recordingImplemented drift');
assert(fixture.hardBoundaries.recordingPerformed === false, 'hard boundary recordingPerformed drift');
assert(fixture.hardBoundaries.liveDecisionRecorded === false, 'hard boundary liveDecisionRecorded drift');
assert(fs.existsSync(path.join(root, 'src', 'controlled-action-review-decision-packet-recording.ts')) === false, 'unexpected src implementation added');
assert(fs.existsSync(path.join(root, 'dist', 'controlled-action-review-decision-packet-recording.js')) === false, 'unexpected dist implementation added');

console.log(JSON.stringify({
  ok: true,
  schemaId: schema.$id,
  recordingId: fixture.recordingId,
  allowedRecordingStates: allowedStates.length,
  blockedRecordingActions: Object.keys(fixture.blockedRecordingActions).length,
  recordingImplemented: fixture.recordingImplemented,
  recordingPerformed: fixture.recordingPerformed,
  reviewDecisionRecorded: fixture.reviewDecisionRecorded,
}, null, 2));
