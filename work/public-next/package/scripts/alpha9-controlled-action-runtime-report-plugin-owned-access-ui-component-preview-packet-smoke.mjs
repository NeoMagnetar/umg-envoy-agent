import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-PLUGIN-OWNED-ACCESS-UI-COMPONENT-PREVIEW-PACKET.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'controlled-action-runtime-report-plugin-owned-access-ui-component-preview-packet-v1.json');

assert.ok(fs.existsSync(docPath), 'docs missing');
assert.ok(fs.existsSync(fixturePath), 'fixture missing');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.equal(fixture.status, 'preview_packet_ready');
assert.equal(fixture.baselineCommit, '84f84392c89c555d13e5fc2eb7aa8a9bda4ef873');
assert.equal(fixture.targetPluginId, 'umg-envoy-agent');
assert.equal(fixture.topLevelComponent, 'ControlledActionRuntimeReportDashboard');
assert.equal(fixture.implementationStyle, 'typescript_render_spec');
assert.equal(fixture.previewPacketPrepared, true);
assert.equal(fixture.liveUiMounted, false);
assert.equal(fixture.liveCallProof, 'not_available_from_current_cli_surface');
assert.equal(fixture.runtimeModified, false);
assert.equal(fixture.installedPluginModified, false);
assert.equal(fixture.gatewayRestarted, false);
assert.equal(fixture.liveToolCalled, false);
assert.equal(fixture.packagePublished, false);
assert.equal(fixture.executionPerformed, false);
assert.equal(fixture.approvalGranted, false);
assert.equal(fixture.recordingPerformed, false);
assert.equal(fixture.liveDecisionRecorded, false);

for (const mode of ['full', 'compact', 'ascii_fallback']) {
  assert.ok(fixture.previewModes.includes(mode), `missing preview mode: ${mode}`);
}
for (const panel of ['blocked_capabilities', 'next_safe_step']) {
  assert.ok(fixture.previewPanels.includes(panel), `missing preview panel: ${panel}`);
}
assert.ok(typeof fixture.asciiFallbackPreview === 'string' && fixture.asciiFallbackPreview.trim().length > 0, 'asciiFallbackPreview must be non-empty');
assert.ok(Array.isArray(fixture.releaseReadinessNotes) && fixture.releaseReadinessNotes.length > 0, 'releaseReadinessNotes must not be empty');
assert.equal(fixture.recommendedNextLane, 'ALPHA9_CONTROLLED_ACTION_RUNTIME_REPORT_RELEASE_READINESS_SOURCE');

for (const forbidden of ['ready_to_execute', 'can_execute', 'approved_for_execution', 'execution_allowed', 'approval_granted', 'grant_execution', 'authorize_execution']) {
  assert.equal(doc.includes(forbidden), false, `forbidden term in docs: ${forbidden}`);
  assert.equal(JSON.stringify(fixture).includes(forbidden), false, `forbidden term in fixture: ${forbidden}`);
}

const principle = 'The controlled-action runtime report plugin-owned access UI component preview packet does not mount a live UI, mutate runtime state, call live plugin tools, grant approval, record live decisions, execute actions, write files outside this repo artifact, transmit data externally, publish packages, modify installed plugin files, or restart OpenClaw. It packages source-level preview materials only.';
assert.ok(doc.includes(principle), 'missing required principle');

console.log('alpha9 controlled action runtime report plugin-owned access ui component preview packet smoke: PASS');
