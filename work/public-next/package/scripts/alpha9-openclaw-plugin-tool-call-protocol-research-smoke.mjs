import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-OPENCLAW-PLUGIN-TOOL-CALL-PROTOCOL-RESEARCH.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'openclaw-plugin-tool-call-protocol-research-v1.json');

const docText = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.ok(['protocol_found', 'protocol_blocked'].includes(fixture.status));
assert.equal(fixture.gatewayRunning, true);
assert.equal(fixture.activePluginPathResolved, true);
assert.equal(fixture.activePluginPath, 'C:\\Users\\Magne\\.openclaw\\extensions\\umg-envoy-agent');
assert.equal(fixture.targetToolName, 'umg_envoy_controlled_action_runtime_report');
assert.equal(fixture.executionPerformed, false);
assert.equal(fixture.approvalGranted, false);
assert.equal(fixture.recordingPerformed, false);
assert.equal(fixture.liveDecisionRecorded, false);
assert.equal(fixture.fileWritten, false);
assert.equal(fixture.externalTransmissionPerformed, false);
assert.equal(fixture.packagePublished, false);

if (fixture.status === 'protocol_found') {
  assert.equal(fixture.toolListMethodFound ?? fixture.cliToolListCommandFound, true);
  assert.equal(fixture.toolInvokeMethodFound ?? fixture.rpcToolInvokeMethodFound, true);
} else {
  assert.ok(typeof fixture.blockedReason === 'string' && fixture.blockedReason.length > 0);
  assert.equal(fixture.liveToolCallable, false);
}

const forbiddenCorpus = `${docText}\n${JSON.stringify(fixture)}`;
for (const forbidden of [
  'approval_granted',
  'approved_for_execution',
  'execution_allowed',
  'can_execute',
  'ready_to_execute',
]) {
  assert.equal(forbiddenCorpus.includes(forbidden), false, `forbidden term present: ${forbidden}`);
}

console.log('alpha9 openclaw plugin tool call protocol research smoke: PASS');
