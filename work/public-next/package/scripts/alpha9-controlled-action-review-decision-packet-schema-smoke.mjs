import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const schemaPath = path.join(packageRoot, 'schemas', 'umg-controlled-action-review-decision-packet.schema.json');
const fixturePath = path.join(packageRoot, 'fixtures', 'action-gates', 'controlled-action-review-decision-packet-example.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(schema.$id === 'umg.controlled_action_review_decision_packet.v1', 'schema $id drift');
assert(fixture.packetType === 'controlled_action_review_decision_packet', 'fixture packetType drift');
assert(fixture.schemaVersion === '1.0.0', 'fixture schemaVersion drift');
assert(fixture.executionPerformed === false, 'executionPerformed drift');
assert(fixture.approvalGranted === false, 'approvalGranted drift');
assert(fixture.reviewDecisionPacketDoesNotEqualApproval === true, 'reviewDecisionPacketDoesNotEqualApproval drift');
assert(fixture.reviewDecisionPacketDoesNotEqualExecution === true, 'reviewDecisionPacketDoesNotEqualExecution drift');

const allowedDecisionEnum = schema.$defs.allowedDecisionType.enum;
for (const allowed of ['deny','request_more_evidence','mark_incomplete','approve_for_dry_run_only','approve_for_future_execution_review_only','revoke_prior_review','supersede_prior_review','expire_review','no_decision']) {
  assert(allowedDecisionEnum.includes(allowed), `allowed decision missing ${allowed}`);
}
for (const forbidden of ['approve_for_execution','execute','run_action','grant_execution','authorize_execution']) {
  assert(!allowedDecisionEnum.includes(forbidden), `forbidden decision allowed ${forbidden}`);
}

const resultStateEnum = schema.$defs.allowedResultState.enum;
for (const forbidden of ['execution_approved','execution_allowed','ready_to_execute','approved_for_execution','can_execute']) {
  assert(!resultStateEnum.includes(forbidden), `forbidden result state allowed ${forbidden}`);
}

const blockedCats = fixture.blockedDecisionCategories.map((item) => item.category);
for (const blocked of ['execute_action','authorize_write_action','authorize_bridge_action','enable_direct_source','enable_automatic_response_takeover']) {
  assert(blockedCats.includes(blocked), `blocked category missing ${blocked}`);
}

assert(fixture.decisionRequest.executionPerformed === false, 'request executionPerformed drift');
assert(fixture.decisionRequest.approvalGranted === false, 'request approvalGranted drift');
assert(fixture.decisionResult.executionPerformed === false, 'result executionPerformed drift');
assert(fixture.decisionResult.approvalGranted === false, 'result approvalGranted drift');

const requestedDecisions = fixture.decisionRequest.targetRoutes.map((route) => route.requestedDecision);
const resultDecisions = fixture.decisionResult.routeDecisionResults.map((route) => route.decision);
for (const forbidden of ['approve_for_execution','execute','run_action','grant_execution','authorize_execution']) {
  assert(!requestedDecisions.includes(forbidden), `forbidden request decision present in fixture ${forbidden}`);
  assert(!resultDecisions.includes(forbidden), `forbidden result decision present in fixture ${forbidden}`);
}

assert(fs.existsSync(path.join(packageRoot, 'src', 'controlled-action-review-decision-packet.ts')) === false, 'unexpected src runtime implementation added');
assert(fs.existsSync(path.join(packageRoot, 'dist', 'controlled-action-review-decision-packet.js')) === false, 'unexpected dist runtime implementation added');

console.log(JSON.stringify({
  ok: true,
  schemaId: schema.$id,
  packetId: fixture.packetId,
  allowedDecisionTypes: allowedDecisionEnum.length,
  allowedResultStates: resultStateEnum.length,
  blockedDecisionCategories: blockedCats.length,
  executionPerformed: fixture.executionPerformed,
  approvalGranted: fixture.approvalGranted,
  reviewDecisionRecorded: fixture.reviewDecisionRecorded,
}, null, 2));
