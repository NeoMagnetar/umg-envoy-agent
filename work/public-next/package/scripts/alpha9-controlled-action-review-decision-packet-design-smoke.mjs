import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.resolve(__dirname, '../fixtures/action-gates/controlled-action-review-decision-packet-v1.design.json');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.equal(fixture.designId, 'controlled-action-review-decision-packet-v1');
assert.equal(fixture.status, 'design_only');
assert.equal(fixture.executionPerformed, false);
assert.equal(fixture.approvalGranted, false);
assert.equal(fixture.reviewDecisionRecorded, false);
assert.equal(fixture.reviewDecisionPacketDoesNotEqualApproval, true);
assert.equal(fixture.reviewDecisionPacketDoesNotEqualExecution, true);

for (const allowed of [
  'deny',
  'request_more_evidence',
  'mark_incomplete',
  'approve_for_dry_run_only',
  'approve_for_future_execution_review_only',
  'revoke_prior_review',
  'supersede_prior_review',
  'expire_review',
  'no_decision',
]) {
  assert(fixture.allowedDecisionTypes.includes(allowed), `missing allowed decision ${allowed}`);
}

for (const forbidden of [
  'approve_for_execution',
  'execute',
  'run_action',
  'grant_execution',
  'authorize_execution',
]) {
  assert(!fixture.allowedDecisionTypes.includes(forbidden), `forbidden allowed decision ${forbidden}`);
}

for (const blocked of [
  'execute_action',
  'approve_for_execution',
  'authorize_write_action',
  'authorize_bridge_action',
  'enable_direct_source',
  'enable_automatic_response_takeover',
]) {
  assert(Object.prototype.hasOwnProperty.call(fixture.blockedDecisionCategories, blocked), `missing blocked category ${blocked}`);
}

assert(fixture.hardBoundaries.principles.includes('Review decision packet does not equal approval.'));
assert(fixture.hardBoundaries.principles.includes('Review decision packet does not equal execution.'));
assert.equal(fs.existsSync(path.resolve(__dirname, '../src/controlled-action-review-decision-packet.ts')), false);
assert.equal(fs.existsSync(path.resolve(__dirname, '../dist/controlled-action-review-decision-packet.js')), false);

console.log(JSON.stringify({
  ok: true,
  designId: fixture.designId,
  status: fixture.status,
  allowedDecisionTypes: fixture.allowedDecisionTypes.length,
  blockedDecisionCategories: Object.keys(fixture.blockedDecisionCategories).length,
  executionPerformed: fixture.executionPerformed,
  approvalGranted: fixture.approvalGranted,
  reviewDecisionRecorded: fixture.reviewDecisionRecorded,
}, null, 2));
