import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-OPENCLAW-PLUGIN-TOOL-CALL-PROTOCOL-DESIGN.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'openclaw-plugin-tool-call-protocol-design-v1.json');

const docText = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.equal(fixture.status, 'design_ready');
assert.equal(fixture.targetPluginId, 'umg-envoy-agent');
assert.equal(fixture.targetToolName, 'umg_envoy_controlled_action_runtime_report');
assert.equal(fixture.protocolImplemented, false);
assert.equal(fixture.liveToolCalled, false);
assert.equal(fixture.executionPerformed, false);
assert.equal(fixture.approvalGranted, false);
assert.equal(fixture.recordingPerformed, false);
assert.equal(fixture.fileWritten, false);
assert.equal(fixture.externalTransmissionPerformed, false);
assert.equal(fixture.packagePublished, false);
assert.ok(fixture.proposedMethods.includes('plugin.tools.list'));
assert.ok(fixture.proposedMethods.includes('plugin.tools.inspect'));
assert.ok(fixture.proposedMethods.includes('plugin.tools.call'));
for (const code of ['plugin_not_found', 'tool_not_found', 'invalid_tool_input', 'invalid_panel', 'tool_not_read_only']) {
  assert.ok(fixture.errorCodes.includes(code), `missing error code: ${code}`);
}
assert.equal(fixture.recommendedNextLane, 'ALPHA9_OPENCLAW_PLUGIN_TOOL_CALL_PROTOCOL_IMPLEMENTATION_PLAN_SOURCE');

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

console.log('alpha9 openclaw plugin tool call protocol design smoke: PASS');
