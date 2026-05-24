import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const docPath = path.join(root, 'docs', 'ALPHA9-OPENCLAW-RUNTIME-MAINTAINER-QUESTION-DELIVERY-METHOD.md');
const fixturePath = path.join(root, 'fixtures', 'action-gates', 'openclaw-runtime-maintainer-question-delivery-method-v1.json');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(fs.existsSync(docPath), 'missing docs/ALPHA9-OPENCLAW-RUNTIME-MAINTAINER-QUESTION-DELIVERY-METHOD.md');
assert(fs.existsSync(fixturePath), 'missing fixtures/action-gates/openclaw-runtime-maintainer-question-delivery-method-v1.json');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert(fixture.status === 'delivery_method_selected', 'status mismatch');
assert(fixture.baselineCommit === '045e81b0f535f97818d614f470373efc2af27378', 'baselineCommit mismatch');
assert(fixture.reviewOutcome === 'approve_with_edits', 'reviewOutcome mismatch');
assert(fixture.questionApprovedForFutureSend === true, 'questionApprovedForFutureSend must be true');
assert(fixture.selectedDeliveryMethod === 'manual_github_issue_draft', 'selectedDeliveryMethod mismatch');
assert(fixture.deliveryMethodSelected === true, 'deliveryMethodSelected must be true');
assert(fixture.externalContactPerformed === false, 'externalContactPerformed must be false');
assert(fixture.issueCreated === false, 'issueCreated must be false');
assert(fixture.messageSent === false, 'messageSent must be false');
assert(fixture.automatedSendApproved === false, 'automatedSendApproved must be false');
assert(fixture.runtimeModified === false, 'runtimeModified must be false');
assert(fixture.protocolImplemented === false, 'protocolImplemented must be false');
assert(fixture.liveToolCalled === false, 'liveToolCalled must be false');
assert(fixture.executionPerformed === false, 'executionPerformed must be false');
assert(fixture.approvalGranted === false, 'approvalGranted must be false');
assert(fixture.recordingPerformed === false, 'recordingPerformed must be false');
assert(fixture.externalTransmissionPerformed === false, 'externalTransmissionPerformed must be false');
assert(fixture.packagePublished === false, 'packagePublished must be false');
assert(Array.isArray(fixture.deliveryOptions) && fixture.deliveryOptions.includes('manual_github_issue_draft'), 'deliveryOptions must include manual_github_issue_draft');
assert(fixture.deliveryOptions.includes('manual_github_discussion_draft'), 'deliveryOptions must include manual_github_discussion_draft');
assert(fixture.deliveryOptions.includes('manual_email_or_message_draft'), 'deliveryOptions must include manual_email_or_message_draft');
assert(fixture.deliveryOptions.includes('automated_send'), 'deliveryOptions must include automated_send');
assert(fixture.recommendedNextLane === 'ALPHA9_OPENCLAW_RUNTIME_MAINTAINER_QUESTION_MANUAL_GITHUB_ISSUE_DRAFT_SOURCE', 'recommendedNextLane mismatch');

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

const principle = 'The OpenClaw runtime maintainer question delivery-method lane does not contact maintainers, open issues, send messages, transmit data externally, mutate runtime state, implement protocol methods, call plugin tools, grant approval, record live decisions, execute actions, write outside repo artifacts, or publish packages. It selects a future delivery method only.';
assert(doc.includes(principle), 'required documentation principle missing');

console.log('alpha9 openclaw runtime maintainer question delivery method smoke: PASS');
