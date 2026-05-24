import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-OPENCLAW-PLUGIN-TOOL-CALL-PROTOCOL-IMPLEMENTATION-ESCALATION.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'openclaw-plugin-tool-call-protocol-implementation-escalation-v1.json');

const docText = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.ok(['implementation_target_isolated', 'implementation_target_still_unclear'].includes(fixture.status));
assert.equal(fixture.implementationPlanCommit, 'ddb5af261c2db6a958489546d38c9cbf87a95f40');
assert.equal(fixture.targetPluginId, 'umg-envoy-agent');
assert.equal(fixture.targetToolName, 'umg_envoy_controlled_action_runtime_report');
assert.ok(typeof fixture.openClawRoot === 'string' && fixture.openClawRoot.length > 0);
assert.equal(fixture.runtimeFilesModified, false);
assert.equal(fixture.protocolImplemented, false);
assert.equal(fixture.liveToolCalled, false);
assert.equal(fixture.executionPerformed, false);
assert.equal(fixture.approvalGranted, false);
assert.equal(fixture.recordingPerformed, false);
assert.equal(fixture.fileWritten, false);
assert.equal(fixture.externalTransmissionPerformed, false);
assert.equal(fixture.packagePublished, false);

if (fixture.status === 'implementation_target_isolated') {
  assert.ok(Array.isArray(fixture.candidateFiles) && fixture.candidateFiles.length > 0);
  const kinds = fixture.patchPointMatrix.map((x) => x.kind);
  assert.ok(kinds.includes('gateway call dispatch'));
  assert.ok(kinds.includes('RPC method registry'));
  assert.ok(kinds.includes('plugin registry access'));
  assert.ok(Array.isArray(fixture.futureBackupList) && fixture.futureBackupList.length > 0);
  assert.equal(fixture.recommendedNextLane, 'ALPHA9_OPENCLAW_PLUGIN_TOOL_CALL_PROTOCOL_IMPLEMENTATION_SOURCE');
} else {
  assert.ok(typeof fixture.blockedReason === 'string' && fixture.blockedReason.length > 0);
  assert.equal(fixture.recommendedNextLane, 'ALPHA9_OPENCLAW_RUNTIME_SOURCE_MAP_EXTRACTION_SOURCE');
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

console.log('alpha9 openclaw plugin tool call protocol implementation escalation smoke: PASS');
