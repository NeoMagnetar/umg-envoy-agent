import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-TOOL-SURFACE-IMPLEMENTATION-PLAN.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'controlled-action-runtime-report-tool-surface-implementation-plan-v1.json');
const pluginPath = path.join(repoRoot, 'openclaw.plugin.json');
const pluginEntryTsPath = path.join(repoRoot, 'src', 'plugin-entry.ts');

const docText = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const pluginText = fs.existsSync(pluginPath) ? fs.readFileSync(pluginPath, 'utf8') : '';
const pluginEntryTsText = fs.existsSync(pluginEntryTsPath) ? fs.readFileSync(pluginEntryTsPath, 'utf8') : '';

assert.equal(fixture.status, 'planning_ready');
assert.equal(fixture.baselineCommit, '68da068e2e5be448c94fd1ea70e646500486dc07');
assert.equal(fixture.futureToolName, 'umg_envoy_controlled_action_runtime_report');
assert.equal(fixture.futureToolType, 'read_only_report_preview');
assert.equal(fixture.implementationStarted, false);
assert.equal(fixture.toolImplemented, false);
assert.equal(fixture.toolRegistered, false);
assert.equal(fixture.pluginEntryModified, false);
assert.equal(fixture.openclawPluginManifestModified, false);
assert.equal(fixture.executionPerformed, false);
assert.equal(fixture.approvalGranted, false);
assert.equal(fixture.recordingPerformed, false);
assert.equal(fixture.liveDecisionRecorded, false);
assert.equal(fixture.fileWritten, false);
assert.equal(fixture.externalTransmissionPerformed, false);
assert.equal(fixture.packagePublished, false);
assert.equal(fixture.openClawRestarted, false);
assert.equal(fixture.directSourceEnabled, false);
assert.equal(fixture.automaticResponseTakeoverEnabled, false);

for (const mode of ['summary', 'full', 'ascii_only', 'structured_only', 'panel', 'navigation_only']) {
  assert.ok(fixture.futureOutputModes.includes(mode), `missing future output mode: ${mode}`);
}

for (const target of [
  'overview',
  'active_route',
  'safety_evidence_chain',
  'blocked_capabilities',
  'readiness',
  'audit_and_review',
  'recording_metadata',
  'hard_boundaries',
  'next_safe_step',
]) {
  assert.ok(fixture.futureNavigationTargets.includes(target), `missing future nav target: ${target}`);
}

for (const op of [
  'execute_action',
  'approve_action',
  'blocked_grant_approval',
  'record_live_decision',
  'perform_write_action',
  'write_report_file',
  'transmit_report',
  'publish_package',
  'restart_openclaw',
  'enable_bridge_action',
  'enable_direct_source',
  'enable_automatic_response_takeover',
  'mutate_block_library',
  'touch_resleever',
]) {
  assert.ok(fixture.futureBlockedOperations.includes(op), `missing future blocked operation: ${op}`);
}

assert.equal(
  fixture.recommendedNextLane,
  'ALPHA9_CONTROLLED_ACTION_EXECUTION_RUNTIME_REPORT_TOOL_SURFACE_IMPLEMENTATION_SOURCE',
);
assert.equal(pluginEntryTsText.includes('umg_envoy_controlled_action_runtime_report'), false);
assert.equal(pluginText.includes('umg_envoy_controlled_action_runtime_report'), false);

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

console.log('alpha9 controlled action runtime report tool surface implementation plan smoke: PASS');
