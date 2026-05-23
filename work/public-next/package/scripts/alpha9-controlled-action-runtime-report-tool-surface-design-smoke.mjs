import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-TOOL-SURFACE-DESIGN.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'controlled-action-runtime-report-tool-surface-v1.design.json');
const pluginPath = path.join(repoRoot, 'openclaw.plugin.json');
const pluginEntryPath = path.join(repoRoot, 'dist', 'plugin-entry.js');

const docText = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const pluginText = fs.existsSync(pluginPath) ? fs.readFileSync(pluginPath, 'utf8') : '';
const pluginEntryText = fs.existsSync(pluginEntryPath) ? fs.readFileSync(pluginEntryPath, 'utf8') : '';

assert.equal(fixture.status, 'design_only');
assert.equal(fixture.toolName, 'umg_envoy_controlled_action_runtime_report');
assert.equal(fixture.toolImplemented, false);
assert.equal(fixture.toolRegistered, false);
assert.equal(fixture.executionPerformed, false);
assert.equal(fixture.approvalGranted, false);
assert.equal(fixture.recordingPerformed, false);
assert.equal(fixture.liveDecisionRecorded, false);
assert.equal(fixture.fileWritten, false);
assert.equal(fixture.externalTransmissionPerformed, false);
assert.equal(fixture.packagePublished, false);
assert.equal(fixture.openClawRestarted, false);

for (const mode of ['summary', 'full', 'ascii_only', 'structured_only', 'panel', 'navigation_only']) {
  assert.ok(fixture.supportedOutputModes.includes(mode), `missing output mode: ${mode}`);
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
  assert.ok(fixture.supportedNavigationTargets.includes(target), `missing nav target: ${target}`);
}

for (const blockedOp of [
  'execute_action',
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
  assert.ok(fixture.blockedOperations.some((entry) => entry.operation === blockedOp), `missing blocked operation: ${blockedOp}`);
}

assert.ok(docText.includes('read-only'));
assert.ok(docText.includes('does not register a live OpenClaw tool'));
assert.ok(typeof pluginEntryText === 'string');
assert.ok(typeof pluginText === 'string');

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

console.log('alpha9 controlled action runtime report tool surface design smoke: PASS');
