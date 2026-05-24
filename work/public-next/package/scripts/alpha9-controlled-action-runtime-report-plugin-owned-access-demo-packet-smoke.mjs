import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-PLUGIN-OWNED-ACCESS-DEMO-PACKET.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'controlled-action-runtime-report-plugin-owned-access-demo-packet-v1.json');

assert.ok(fs.existsSync(docPath), 'docs missing');
assert.ok(fs.existsSync(fixturePath), 'fixture missing');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.equal(fixture.status, 'demo_packet_ready');
assert.equal(fixture.baselineCommit, '4e2625551cb59045e17c62427bb06c8778f9cbc3');
assert.equal(fixture.targetPluginId, 'umg-envoy-agent');
assert.equal(fixture.demoPacketPrepared, true);
assert.equal(fixture.liveCallProof, 'not_available_from_current_cli_surface');
assert.equal(fixture.demoScenario, 'desktop_write_candidate_blocked_route');
assert.equal(fixture.runtimeModified, false);
assert.equal(fixture.installedPluginModified, false);
assert.equal(fixture.gatewayRestarted, false);
assert.equal(fixture.liveToolCalled, false);
assert.equal(fixture.packagePublished, false);
assert.equal(fixture.executionPerformed, false);
assert.equal(fixture.approvalGranted, false);
assert.equal(fixture.recordingPerformed, false);
assert.equal(fixture.liveDecisionRecorded, false);
assert.equal(fixture.externalTransmissionPerformed, false);
assert.ok(Array.isArray(fixture.demoFlow) && fixture.demoFlow.length > 0, 'demoFlow must not be empty');

for (const mode of ['full', 'summary', 'ascii_only', 'structured_only', 'navigation_only', 'panel']) {
  assert.ok(fixture.demoModes.includes(mode), `missing demo mode: ${mode}`);
}

assert.ok(fixture.demoPanels.includes('blocked_capabilities'), 'demoPanels must include blocked_capabilities');
assert.ok(typeof fixture.asciiDashboard === 'string' && fixture.asciiDashboard.trim().length > 0, 'asciiDashboard must be non-empty');
for (const capability of ['execute_action', 'write_files', 'bridge_actions', 'direct_source', 'automatic_takeover', 'package_publish']) {
  assert.ok(fixture.blockedCapabilities.includes(capability), `missing blocked capability: ${capability}`);
}
assert.equal(fixture.recommendedNextLane, 'ALPHA9_CONTROLLED_ACTION_RUNTIME_REPORT_PLUGIN_OWNED_ACCESS_PRESENTATION_HANDOFF_SOURCE');

for (const forbidden of ['ready_to_execute', 'can_execute', 'approved_for_execution', 'execution_allowed', 'approval_granted', 'grant_execution', 'authorize_execution']) {
  assert.equal(doc.includes(forbidden), false, `forbidden term in docs: ${forbidden}`);
  assert.equal(JSON.stringify(fixture).includes(forbidden), false, `forbidden term in fixture: ${forbidden}`);
}

const principle = 'The controlled-action runtime report plugin-owned access demo packet does not mutate runtime state, call live plugin tools, grant approval, record live decisions, execute actions, write files outside this repo artifact, transmit data externally, publish packages, modify installed plugin files, or restart OpenClaw. It packages read-only demonstration materials only.';
assert.ok(doc.includes(principle), 'missing required principle');

console.log('alpha9 controlled action runtime report plugin-owned access demo packet smoke: PASS');
