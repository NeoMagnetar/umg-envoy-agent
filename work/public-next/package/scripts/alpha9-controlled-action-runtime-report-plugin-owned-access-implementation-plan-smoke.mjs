import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const docPath = path.join(root, 'docs', 'ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-PLUGIN-OWNED-ACCESS-IMPLEMENTATION-PLAN.md');
const fixturePath = path.join(root, 'fixtures', 'action-gates', 'controlled-action-runtime-report-plugin-owned-access-implementation-plan-v1.json');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(fs.existsSync(docPath), 'missing docs/ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-PLUGIN-OWNED-ACCESS-IMPLEMENTATION-PLAN.md');
assert(fs.existsSync(fixturePath), 'missing fixtures/action-gates/controlled-action-runtime-report-plugin-owned-access-implementation-plan-v1.json');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert(fixture.status === 'planning_ready', 'status mismatch');
assert(fixture.baselineCommit === '1f5968c5382bd8502f331ef501d29ad4f7112108', 'baselineCommit mismatch');
assert(fixture.targetPluginId === 'umg-envoy-agent', 'targetPluginId mismatch');
assert(fixture.targetToolName === 'umg_envoy_controlled_action_runtime_report', 'targetToolName mismatch');
assert(fixture.selectedAccessStrategy === 'plugin_owned_gateway_method_first', 'selectedAccessStrategy mismatch');
assert(fixture.proposedGatewayMethod === 'umg.envoy.controlledActionRuntimeReport', 'proposedGatewayMethod mismatch');
assert(fixture.proposedCliCommand === 'openclaw umg-envoy runtime-report', 'proposedCliCommand mismatch');
assert(fixture.implementationStarted === false, 'implementationStarted must be false');
assert(fixture.gatewayMethodImplemented === false, 'gatewayMethodImplemented must be false');
assert(fixture.cliCommandImplemented === false, 'cliCommandImplemented must be false');
assert(fixture.runtimeModified === false, 'runtimeModified must be false');
assert(fixture.protocolImplemented === false, 'protocolImplemented must be false');
assert(fixture.liveToolCalled === false, 'liveToolCalled must be false');
assert(fixture.executionPerformed === false, 'executionPerformed must be false');
assert(fixture.approvalGranted === false, 'approvalGranted must be false');
assert(fixture.recordingPerformed === false, 'recordingPerformed must be false');
assert(fixture.fileWritten === false, 'fileWritten must be false');
assert(fixture.externalTransmissionPerformed === false, 'externalTransmissionPerformed must be false');
assert(fixture.packagePublished === false, 'packagePublished must be false');
assert(fixture.recommendedNextLane === 'ALPHA9_CONTROLLED_ACTION_RUNTIME_REPORT_PLUGIN_OWNED_ACCESS_IMPLEMENTATION_SOURCE', 'recommendedNextLane mismatch');

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

const principle = 'The controlled-action runtime report plugin-owned access implementation plan does not implement a Gateway method, implement a CLI command, call plugin tools, grant approval, record live decisions, execute actions, write files, transmit data, publish packages, or mutate runtime state. It defines a future local implementation path only.';
assert(doc.includes(principle), 'required documentation principle missing');

console.log('alpha9 controlled action runtime report plugin-owned access implementation plan smoke: PASS');
