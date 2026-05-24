import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const docPath = path.join(root, 'docs', 'ALPHA9-OPENCLAW-RUNTIME-MAINTAINER-QUESTION-DRAFT.md');
const fixturePath = path.join(root, 'fixtures', 'action-gates', 'openclaw-runtime-maintainer-question-draft-v1.json');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(fs.existsSync(docPath), 'missing docs/ALPHA9-OPENCLAW-RUNTIME-MAINTAINER-QUESTION-DRAFT.md');
assert(fs.existsSync(fixturePath), 'missing fixtures/action-gates/openclaw-runtime-maintainer-question-draft-v1.json');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert(fixture.status === 'draft_ready', 'fixture status must be draft_ready');
assert(fixture.baselineCommit === '7e092ae2ae0a2e31d3ec4e7a03494458f845d32', 'baselineCommit mismatch');
assert(fixture.targetPluginId === 'umg-envoy-agent', 'targetPluginId mismatch');
assert(fixture.targetToolName === 'umg_envoy_controlled_action_runtime_report', 'targetToolName mismatch');
assert(fixture.sourceToolCommit === '0b4442125ebe3a9d4e818c0bc92ec4d8ca6d0743', 'sourceToolCommit mismatch');
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
assert(Array.isArray(fixture.maintainerQuestions) && fixture.maintainerQuestions.length > 0, 'maintainerQuestions must not be empty');
assert(Array.isArray(fixture.desiredResponseFields) && fixture.desiredResponseFields.length > 0, 'desiredResponseFields must not be empty');
assert(fixture.recommendedNextLane === 'ALPHA9_OPENCLAW_RUNTIME_MAINTAINER_QUESTION_SEND_APPROVAL_SOURCE', 'recommendedNextLane mismatch');

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

const principle = 'The OpenClaw runtime maintainer question draft does not contact maintainers, open issues, implement protocol methods, call plugin tools, grant approval, record live decisions, execute actions, write files, transmit data, publish packages, or mutate runtime state. It prepares a copy-ready clarification question only.';
assert(doc.includes(principle), 'required documentation principle missing');

console.log('alpha9 openclaw runtime maintainer question draft smoke: PASS');
