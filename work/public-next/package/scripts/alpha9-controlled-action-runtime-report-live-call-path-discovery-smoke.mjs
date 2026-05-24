import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-LIVE-CALL-PATH-DISCOVERY.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'controlled-action-runtime-report-live-call-path-discovery-v1.json');

const docText = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.ok(['live_call_path_verified', 'live_call_path_blocked'].includes(fixture.status));
assert.equal(fixture.sourceCommit, '0b4442125ebe3a9d4e818c0bc92ec4d8ca6d0743');
assert.equal(fixture.toolName, 'umg_envoy_controlled_action_runtime_report');
assert.equal(fixture.gatewayRunning, true);
assert.equal(fixture.activeInstalledPluginPath, 'C:\\Users\\Magne\\.openclaw\\extensions\\umg-envoy-agent');
assert.equal(fixture.executionPerformed, false);
assert.equal(fixture.approvalGranted, false);
assert.equal(fixture.recordingPerformed, false);
assert.equal(fixture.liveDecisionRecorded, false);
assert.equal(fixture.fileWritten, false);
assert.equal(fixture.externalTransmissionPerformed, false);
assert.equal(fixture.packagePublished, false);

if (fixture.status === 'live_call_path_verified') {
  assert.equal(fixture.toolFoundInLiveRuntime, true);
  assert.equal(fixture.toolCallableInLiveRuntime, true);
} else {
  assert.ok(typeof fixture.blockedReason === 'string' && fixture.blockedReason.length > 0);
  assert.equal(fixture.toolCallableInLiveRuntime, false);
}

const forbiddenCorpus = `${docText}\n${JSON.stringify(fixture)}`;
for (const forbidden of [
  'ready_to_execute',
  'can_execute',
  'approved_for_execution',
  'execution_allowed',
  'approval_granted',
  'grant_execution',
  'authorize_execution',
]) {
  assert.equal(forbiddenCorpus.includes(forbidden), false, `forbidden term present: ${forbidden}`);
}

console.log('alpha9 controlled action runtime report live call path discovery smoke: PASS');
