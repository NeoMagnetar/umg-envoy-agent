import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-OPENCLAW-PLUGIN-TOOL-CALL-PROTOCOL-IMPLEMENTATION-PLAN.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'openclaw-plugin-tool-call-protocol-implementation-plan-v1.json');

const docText = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.equal(fixture.status, 'planning_ready');
assert.equal(fixture.protocolDesignCommit, 'cd667c924b1f8c6f6140bd12cb76c39a2d4c9bd9');
assert.equal(fixture.correctedEscalationCommit, '5414646c67b5a85a0befbe25c4fda888ccb1947e');
assert.equal(fixture.sourceToolCommit, '0b4442125ebe3a9d4e818c0bc92ec4d8ca6d0743');
assert.equal(fixture.targetPluginId, 'umg-envoy-agent');
assert.equal(fixture.targetToolName, 'umg_envoy_controlled_action_runtime_report');
assert.equal(fixture.protocolImplemented, false);
assert.equal(fixture.runtimeModified, false);
assert.equal(fixture.liveToolCalled, false);
assert.equal(fixture.executionPerformed, false);
assert.equal(fixture.approvalGranted, false);
assert.equal(fixture.recordingPerformed, false);
assert.equal(fixture.fileWritten, false);
assert.equal(fixture.externalTransmissionPerformed, false);
assert.equal(fixture.packagePublished, false);
assert.ok(fixture.methodsToImplement.includes('plugin.tools.list'));
assert.ok(fixture.methodsToImplement.includes('plugin.tools.inspect'));
assert.ok(fixture.methodsToImplement.includes('plugin.tools.call'));
assert.equal(fixture.recommendedNextLane, 'ALPHA9_OPENCLAW_PLUGIN_TOOL_CALL_PROTOCOL_IMPLEMENTATION_SOURCE');

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

console.log('alpha9 openclaw plugin tool call protocol implementation plan smoke: PASS');
