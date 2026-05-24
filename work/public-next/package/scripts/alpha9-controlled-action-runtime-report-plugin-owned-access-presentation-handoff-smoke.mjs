import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-PLUGIN-OWNED-ACCESS-PRESENTATION-HANDOFF.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'controlled-action-runtime-report-plugin-owned-access-presentation-handoff-v1.json');

assert.ok(fs.existsSync(docPath), 'docs missing');
assert.ok(fs.existsSync(fixturePath), 'fixture missing');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.equal(fixture.status, 'presentation_handoff_ready');
assert.equal(fixture.baselineCommit, 'db89242894e0baad96d31c82c69ca322bbcfd93a');
assert.equal(fixture.targetPluginId, 'umg-envoy-agent');
assert.equal(fixture.presentationHandoffPrepared, true);
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
assert.equal(fixture.externalTransmissionPerformed, false);

for (const mode of ['full', 'summary', 'ascii_only', 'structured_only', 'navigation_only', 'panel']) {
  assert.ok(fixture.runtimeReportModes.includes(mode), `missing runtime report mode: ${mode}`);
}

for (const panel of ['overview', 'active_route', 'safety_evidence_chain', 'blocked_capabilities', 'readiness', 'audit_and_review', 'recording_metadata', 'hard_boundaries', 'next_safe_step']) {
  assert.ok(fixture.panelTargets.includes(panel), `missing panel target: ${panel}`);
}

assert.ok(typeof fixture.asciiDashboard === 'string' && fixture.asciiDashboard.trim().length > 0, 'asciiDashboard must be non-empty');
assert.ok(typeof fixture.newChatHandoffSummary === 'string' && fixture.newChatHandoffSummary.trim().length > 0, 'newChatHandoffSummary must be non-empty');
assert.equal(fixture.recommendedNextLane, 'ALPHA9_CONTROLLED_ACTION_RUNTIME_REPORT_PLUGIN_OWNED_ACCESS_VISUAL_UI_WIREFRAME_SOURCE');

for (const forbidden of ['ready_to_execute', 'can_execute', 'approved_for_execution', 'execution_allowed', 'approval_granted', 'grant_execution', 'authorize_execution']) {
  assert.equal(doc.includes(forbidden), false, `forbidden term in docs: ${forbidden}`);
  assert.equal(JSON.stringify(fixture).includes(forbidden), false, `forbidden term in fixture: ${forbidden}`);
}

const principle = 'The controlled-action runtime report plugin-owned access presentation handoff does not mutate runtime state, call live plugin tools, grant approval, record live decisions, execute actions, write files outside this repo artifact, transmit data externally, publish packages, modify installed plugin files, or restart OpenClaw. It packages the completed local work into a human/agent handoff only.';
assert.ok(doc.includes(principle), 'missing required principle');

console.log('alpha9 controlled action runtime report plugin-owned access presentation handoff smoke: PASS');
