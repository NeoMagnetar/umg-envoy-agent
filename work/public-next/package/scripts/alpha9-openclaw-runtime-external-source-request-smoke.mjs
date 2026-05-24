import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const docPath = path.join(root, 'docs', 'ALPHA9-OPENCLAW-RUNTIME-EXTERNAL-SOURCE-REQUEST.md');
const fixturePath = path.join(root, 'fixtures', 'action-gates', 'openclaw-runtime-external-source-request-v1.json');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(fs.existsSync(docPath), 'missing docs/ALPHA9-OPENCLAW-RUNTIME-EXTERNAL-SOURCE-REQUEST.md');
assert(fs.existsSync(fixturePath), 'missing fixtures/action-gates/openclaw-runtime-external-source-request-v1.json');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert(fixture.status === 'request_ready', 'fixture status must be request_ready');
assert(fixture.baselineCommit === '94711a3660bf89bf4850bea4ce6da0dd2c7eb4cb', 'baselineCommit mismatch');
assert(fixture.targetPluginId === 'umg-envoy-agent', 'targetPluginId mismatch');
assert(fixture.targetToolName === 'umg_envoy_controlled_action_runtime_report', 'targetToolName mismatch');
assert(fixture.requestPreparedOnly === true, 'requestPreparedOnly must be true');
assert(fixture.externalContactPerformed === false, 'externalContactPerformed must be false');
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
assert(Array.isArray(fixture.requestedSourceModules) && fixture.requestedSourceModules.length > 0, 'requestedSourceModules must not be empty');
assert(Array.isArray(fixture.safeAcceptanceCriteria) && fixture.safeAcceptanceCriteria.length > 0, 'safeAcceptanceCriteria must not be empty');

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

const principle = 'The OpenClaw runtime external source request does not contact maintainers, implement protocol methods, call plugin tools, grant approval, record live decisions, execute actions, write files, transmit data, publish packages, or mutate runtime state. It prepares a clarification package for the missing supported plugin-tool discovery/invocation path only.';
assert(doc.includes(principle), 'required documentation principle missing');

console.log('alpha9 openclaw runtime external source request smoke: PASS');
