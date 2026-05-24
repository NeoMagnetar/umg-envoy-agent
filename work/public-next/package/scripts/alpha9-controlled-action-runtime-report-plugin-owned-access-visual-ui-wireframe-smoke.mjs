import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-PLUGIN-OWNED-ACCESS-VISUAL-UI-WIREFRAME.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'controlled-action-runtime-report-plugin-owned-access-visual-ui-wireframe-v1.json');

assert.ok(fs.existsSync(docPath), 'docs missing');
assert.ok(fs.existsSync(fixturePath), 'fixture missing');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.equal(fixture.status, 'wireframe_ready');
assert.equal(fixture.baselineCommit, '566f3533d1519e18a5a1cedd90d17da1b0a2d478');
assert.equal(fixture.targetPluginId, 'umg-envoy-agent');
assert.equal(fixture.wireframePrepared, true);
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

for (const region of ['header', 'active_route', 'safety_evidence_chain', 'blocked_capabilities', 'next_safe_step']) {
  assert.ok(fixture.layoutRegions.includes(region), `missing layout region: ${region}`);
}

for (const target of ['overview', 'active_route', 'safety_evidence_chain', 'blocked_capabilities', 'readiness', 'audit_and_review', 'recording_metadata', 'hard_boundaries', 'next_safe_step']) {
  assert.ok(fixture.navigationTargets.includes(target), `missing navigation target: ${target}`);
}

for (const semantic of ['blocked/red', 'complete/green', 'disabled/gray']) {
  assert.ok(fixture.statusColorSemantics.includes(semantic), `missing status semantic: ${semantic}`);
}

assert.ok(Array.isArray(fixture.asciiToVisualMapping) && fixture.asciiToVisualMapping.length > 0, 'asciiToVisualMapping must be non-empty');
assert.ok(Array.isArray(fixture.compactModeLayout) && fixture.compactModeLayout.length > 0, 'compactModeLayout must be non-empty');
assert.equal(fixture.recommendedNextLane, 'ALPHA9_CONTROLLED_ACTION_RUNTIME_REPORT_PLUGIN_OWNED_ACCESS_UI_COMPONENT_DESIGN_SOURCE');

for (const forbidden of ['ready_to_execute', 'can_execute', 'approved_for_execution', 'execution_allowed', 'approval_granted', 'grant_execution', 'authorize_execution']) {
  assert.equal(doc.includes(forbidden), false, `forbidden term in docs: ${forbidden}`);
  assert.equal(JSON.stringify(fixture).includes(forbidden), false, `forbidden term in fixture: ${forbidden}`);
}

const principle = 'The controlled-action runtime report plugin-owned access visual UI wireframe does not mutate runtime state, call live plugin tools, grant approval, record live decisions, execute actions, write files outside this repo artifact, transmit data externally, publish packages, modify installed plugin files, or restart OpenClaw. It defines a visual design for a read-only runtime report surface only.';
assert.ok(doc.includes(principle), 'missing required principle');

console.log('alpha9 controlled action runtime report plugin-owned access visual ui wireframe smoke: PASS');
