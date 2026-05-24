import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const docPath = path.join(root, 'docs', 'ALPHA9-OPENCLAW-RUNTIME-MAINTAINER-QUESTION-SEND-APPROVAL.md');
const fixturePath = path.join(root, 'fixtures', 'action-gates', 'openclaw-runtime-maintainer-question-send-approval-v1.json');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(fs.existsSync(docPath), 'missing docs/ALPHA9-OPENCLAW-RUNTIME-MAINTAINER-QUESTION-SEND-APPROVAL.md');
assert(fs.existsSync(fixturePath), 'missing fixtures/action-gates/openclaw-runtime-maintainer-question-send-approval-v1.json');

const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert(fixture.status === 'send_approval_recorded', 'status mismatch');
assert(fixture.baselineCommit === '714c1c803f5bbd31b0f9769e44cf521421cb238c', 'baselineCommit mismatch');
assert(fixture.reviewOutcome === 'approve_with_edits', 'reviewOutcome mismatch');
assert(fixture.questionApprovedForFutureSend === true, 'questionApprovedForFutureSend must be true');
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
assert(typeof fixture.approvedQuestionText === 'string' && fixture.approvedQuestionText.trim().length > 0, 'approvedQuestionText must be non-empty');
assert(fixture.deliveryMethodNotSelected === true, 'deliveryMethodNotSelected must be true');
assert(fixture.recommendedNextLane === 'ALPHA9_OPENCLAW_RUNTIME_MAINTAINER_QUESTION_DELIVERY_METHOD_SOURCE', 'recommendedNextLane mismatch');

console.log('alpha9 openclaw runtime maintainer question send approval smoke: PASS');
