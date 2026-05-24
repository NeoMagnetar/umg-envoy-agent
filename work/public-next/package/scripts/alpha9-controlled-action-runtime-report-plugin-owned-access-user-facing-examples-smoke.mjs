import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-PLUGIN-OWNED-ACCESS-USER-FACING-EXAMPLES.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'controlled-action-runtime-report-plugin-owned-access-user-facing-examples-v1.json');

assert.ok(fs.existsSync(docPath), 'docs missing');
assert.ok(fs.existsSync(fixturePath), 'fixture missing');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.equal(fixture.status, 'examples_ready');
assert.equal(fixture.baselineCommit, '86a20131a7dad242b1f752a93202a28682145ef4');
assert.equal(fixture.sourceCommit, 'd08ea3bc42c5b3e46f97c62ea880acf03ddb0e1f');
assert.equal(fixture.targetPluginId, 'umg-envoy-agent');
assert.equal(fixture.examplesPrepared, true);
assert.equal(fixture.liveCallProof, 'not_available_from_current_cli_surface');
assert.equal(fixture.runtimeModified, false);
assert.equal(fixture.installedPluginModified, false);
assert.equal(fixture.gatewayRestarted, false);
assert.equal(fixture.packagePublished, false);
assert.equal(fixture.executionPerformed, false);
assert.equal(fixture.approvalGranted, false);
assert.equal(fixture.recordingPerformed, false);
assert.equal(fixture.liveDecisionRecorded, false);
assert.equal(fixture.externalTransmissionPerformed, false);

for (const mode of ['full', 'summary', 'ascii_only', 'structured_only', 'navigation_only', 'panel']) {
  assert.ok(fixture.exampleModes.includes(mode), `missing example mode: ${mode}`);
}

for (const panel of ['overview', 'active_route', 'safety_evidence_chain', 'blocked_capabilities', 'readiness', 'audit_and_review', 'recording_metadata', 'hard_boundaries', 'next_safe_step']) {
  assert.ok(fixture.examplePanels.includes(panel), `missing example panel: ${panel}`);
}

assert.ok(typeof fixture.asciiExample === 'string' && fixture.asciiExample.trim().length > 0, 'asciiExample must be non-empty');
assert.ok(fixture.invalidPanelExample, 'invalidPanelExample missing');
assert.equal(fixture.recommendedNextLane, 'ALPHA9_CONTROLLED_ACTION_RUNTIME_REPORT_PLUGIN_OWNED_ACCESS_DEMO_PACKET_SOURCE');

for (const forbidden of ['ready_to_execute', 'can_execute', 'approved_for_execution', 'execution_allowed', 'approval_granted', 'grant_execution', 'authorize_execution']) {
  assert.equal(doc.includes(forbidden), false, `forbidden term in docs: ${forbidden}`);
  assert.equal(JSON.stringify(fixture).includes(forbidden), false, `forbidden term in fixture: ${forbidden}`);
}

const principle = 'The controlled-action runtime report plugin-owned access user-facing examples do not mutate runtime state, call live plugin tools, grant approval, record live decisions, execute actions, write files outside this repo artifact, transmit data externally, publish packages, or modify installed plugin files. They provide examples for a read-only runtime report access surface only.';
assert.ok(doc.includes(principle), 'missing required principle');

console.log('alpha9 controlled action runtime report plugin-owned access user-facing examples smoke: PASS');
