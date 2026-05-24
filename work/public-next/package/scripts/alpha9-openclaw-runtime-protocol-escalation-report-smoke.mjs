import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-OPENCLAW-RUNTIME-PROTOCOL-ESCALATION-REPORT.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'openclaw-runtime-protocol-escalation-report-v1.json');

const docText = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.equal(fixture.status, 'protocol_escalation_ready');
assert.equal(fixture.sourceToolCommit, '0b4442125ebe3a9d4e818c0bc92ec4d8ca6d0743');
assert.equal(fixture.protocolResearchCommit, '1760d444a12e09393e156a532e4f64043756a7e0');
assert.equal(fixture.targetToolName, 'umg_envoy_controlled_action_runtime_report');
assert.equal(fixture.activeInstalledPluginPath, 'C:\\Users\\Magne\\.openclaw\\extensions\\umg-envoy-agent');
assert.equal(fixture.gatewayRunning, true);
assert.equal(fixture.pluginLoaded, true);
assert.equal(fixture.blockerType, 'protocol');
assert.equal(fixture.toolFoundInLiveRuntime, false);
assert.equal(fixture.toolCallableInLiveRuntime, false);
assert.ok(typeof fixture.blockedReason === 'string' && fixture.blockedReason.length > 0);
assert.equal(fixture.recommendedNextLane, 'ALPHA9_OPENCLAW_PLUGIN_TOOL_CALL_PROTOCOL_DESIGN_SOURCE');
assert.equal(fixture.executionPerformed, false);
assert.equal(fixture.approvalGranted, false);
assert.equal(fixture.recordingPerformed, false);
assert.equal(fixture.liveDecisionRecorded, false);
assert.equal(fixture.fileWritten, false);
assert.equal(fixture.externalTransmissionPerformed, false);
assert.equal(fixture.packagePublished, false);
assert.equal(fixture.directSourceEnabled, false);
assert.equal(fixture.automaticResponseTakeoverEnabled, false);

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

console.log('alpha9 openclaw runtime protocol escalation report smoke: PASS');
