import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const docPath = path.join(root, 'docs', 'ALPHA9-OPENCLAW-RUNTIME-MAINTAINER-QUESTION-USER-REVIEW.md');
const fixturePath = path.join(root, 'fixtures', 'action-gates', 'openclaw-runtime-maintainer-question-user-review-v1.json');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(fs.existsSync(docPath), 'missing docs/ALPHA9-OPENCLAW-RUNTIME-MAINTAINER-QUESTION-USER-REVIEW.md');
assert(fs.existsSync(fixturePath), 'missing fixtures/action-gates/openclaw-runtime-maintainer-question-user-review-v1.json');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert(fixture.status === 'awaiting_user_review', 'fixture status must be awaiting_user_review');
assert(fixture.baselineCommit === '67b8e608588ec2e6d067cb8f72f6903b5eb5fb66', 'baselineCommit mismatch');
assert(fixture.targetPluginId === 'umg-envoy-agent', 'targetPluginId mismatch');
assert(fixture.targetToolName === 'umg_envoy_controlled_action_runtime_report', 'targetToolName mismatch');
assert(fixture.draftReady === true, 'draftReady must be true');
assert(fixture.userReviewed === false, 'userReviewed must be false');
assert(fixture.userApproved === false, 'userApproved must be false');
assert(fixture.externalContactPerformed === false, 'externalContactPerformed must be false');
assert(fixture.issueCreated === false, 'issueCreated must be false');
assert(fixture.runtimeModified === false, 'runtimeModified must be false');
assert(fixture.protocolImplemented === false, 'protocolImplemented must be false');
assert(fixture.liveToolCalled === false, 'liveToolCalled must be false');
assert(fixture.executionPerformed === false, 'executionPerformed must be false');
assert(fixture.approvalGranted === false, 'approvalGranted must be false');
assert(fixture.recordingPerformed === false, 'recordingPerformed must be false');
assert(fixture.fileWritten === false, 'fileWritten must be false');
assert(fixture.externalTransmissionPerformed === false, 'externalTransmissionPerformed must be false');
assert(fixture.packagePublished === false, 'packagePublished must be false');
assert(Array.isArray(fixture.reviewChoices) && fixture.reviewChoices.includes('approve_as_written'), 'reviewChoices must include approve_as_written');
assert(fixture.reviewChoices.includes('approve_with_edits'), 'reviewChoices must include approve_with_edits');
assert(fixture.reviewChoices.includes('needs_more_context'), 'reviewChoices must include needs_more_context');
assert(fixture.reviewChoices.includes('defer_external_contact'), 'reviewChoices must include defer_external_contact');
assert(fixture.reviewChoices.includes('reject_question'), 'reviewChoices must include reject_question');
assert(typeof fixture.copyReadyQuestion === 'string' && fixture.copyReadyQuestion.trim().length > 0, 'copyReadyQuestion must be non-empty');

const forbidden = [
  'ready_to_execute',
  'can_execute',
  'approved_for_execution',
  'execution_allowed',
  'approval_granted',
  'grant_execution',
  'authorize_execution'
];

for (const token of forbidden) {
  assert(!doc.includes(token), `forbidden wording in docs: ${token}`);
  assert(!JSON.stringify(fixture).includes(token), `forbidden wording in fixture: ${token}`);
}

const principle = 'The OpenClaw runtime maintainer question user-review packet does not contact maintainers, open issues, implement protocol methods, call plugin tools, grant approval, record live decisions, execute actions, write files outside this repo artifact, transmit data externally, publish packages, or mutate runtime state. It prepares the question for user review only.';
assert(doc.includes(principle), 'required documentation principle missing');

console.log('alpha9 openclaw runtime maintainer question user review smoke: PASS');
