import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const docPath = path.join(root, 'docs', 'ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-PLUGIN-OWNED-ACCESS-DESIGN.md');
const fixturePath = path.join(root, 'fixtures', 'action-gates', 'controlled-action-runtime-report-plugin-owned-access-design-v1.json');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(fs.existsSync(docPath), 'missing docs/ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-PLUGIN-OWNED-ACCESS-DESIGN.md');
assert(fs.existsSync(fixturePath), 'missing fixtures/action-gates/controlled-action-runtime-report-plugin-owned-access-design-v1.json');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert(fixture.status === 'design_ready', 'status mismatch');
assert(fixture.genericPluginToolProtocolBlocked === true, 'genericPluginToolProtocolBlocked must be true');
assert(fixture.selectedAccessStrategy === 'plugin_owned_gateway_method_first', 'selectedAccessStrategy mismatch');
assert(fixture.proposedGatewayMethod === 'umg.envoy.controlledActionRuntimeReport', 'proposedGatewayMethod mismatch');
assert(fixture.proposedCliCommand === 'openclaw umg-envoy runtime-report', 'proposedCliCommand mismatch');
assert(fixture.designOnly === true, 'designOnly must be true');
assert(fixture.implementationStarted === false, 'implementationStarted must be false');
assert(fixture.runtimeModified === false, 'runtimeModified must be false');
assert(fixture.protocolImplemented === false, 'protocolImplemented must be false');
assert(fixture.externalContactPerformed === false, 'externalContactPerformed must be false');
assert(fixture.issueCreated === false, 'issueCreated must be false');
assert(fixture.executionPerformed === false, 'executionPerformed must be false');
assert(fixture.approvalGranted === false, 'approvalGranted must be false');
assert(fixture.recordingPerformed === false, 'recordingPerformed must be false');
assert(fixture.fileWritten === false, 'fileWritten must be false');
assert(fixture.externalTransmissionPerformed === false, 'externalTransmissionPerformed must be false');
assert(fixture.packagePublished === false, 'packagePublished must be false');
assert(fixture.recommendedNextLane === 'ALPHA9_CONTROLLED_ACTION_RUNTIME_REPORT_PLUGIN_OWNED_ACCESS_IMPLEMENTATION_PLAN_SOURCE', 'recommendedNextLane mismatch');

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

console.log('alpha9 controlled action runtime report plugin-owned access design smoke: PASS');
