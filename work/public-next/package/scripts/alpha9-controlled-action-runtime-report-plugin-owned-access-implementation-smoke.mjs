import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { executeControlledActionRuntimeReportPluginOwnedAccess } from '../dist/controlled-action-runtime-report-plugin-owned-access.js';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-PLUGIN-OWNED-ACCESS-IMPLEMENTATION.md');
const pluginEntryPath = path.join(repoRoot, 'src', 'plugin-entry.ts');
const wrapperPath = path.join(repoRoot, 'src', 'controlled-action-runtime-report-plugin-owned-access.ts');
const toolSurfacePath = path.join(repoRoot, 'src', 'controlled-action-runtime-report-tool-surface.ts');
const pluginJsonPath = path.join(repoRoot, 'openclaw.plugin.json');

const docText = fs.readFileSync(docPath, 'utf8');
const pluginEntryText = fs.readFileSync(pluginEntryPath, 'utf8');
const wrapperText = fs.readFileSync(wrapperPath, 'utf8');
const toolSurfaceText = fs.readFileSync(toolSurfacePath, 'utf8');
const pluginJsonText = fs.readFileSync(pluginJsonPath, 'utf8');

assert.ok(pluginEntryText.includes('umg_envoy_controlled_action_runtime_report_access'));
assert.ok(pluginEntryText.includes('runtime-report'));
assert.ok(pluginJsonText.includes('umg_envoy_controlled_action_runtime_report_access'));

function assertReadOnly(result) {
  assert.equal(result.runtimeReportOnly, true);
  assert.equal(result.toolSurfaceReadOnly, true);
  assert.equal(result.executionPerformed, false);
  assert.equal(result.approvalGranted, false);
  assert.equal(result.recordingPerformed, false);
  assert.equal(result.liveDecisionRecorded, false);
  assert.equal(result.fileWritten, false);
  assert.equal(result.externalTransmissionPerformed, false);
  assert.equal(result.packagePublished, false);
  assert.equal(result.directSourceEnabled, false);
  assert.equal(result.automaticResponseTakeoverEnabled, false);
}

const full = executeControlledActionRuntimeReportPluginOwnedAccess({ reportMode: 'full', routeId: 'desktop_write_candidate' });
assertReadOnly(full);
assert.ok(full.result.structuredReport);
assert.ok(full.result.asciiReport);
assert.ok(full.result.navigation);

const summary = executeControlledActionRuntimeReportPluginOwnedAccess({ reportMode: 'summary' });
assertReadOnly(summary);
assert.ok(summary.result.structuredReport);

const asciiOnly = executeControlledActionRuntimeReportPluginOwnedAccess({ reportMode: 'ascii_only' });
assertReadOnly(asciiOnly);
assert.ok(asciiOnly.result.asciiReport);

const structuredOnly = executeControlledActionRuntimeReportPluginOwnedAccess({ reportMode: 'structured_only' });
assertReadOnly(structuredOnly);
assert.ok(structuredOnly.result.structuredReport);

const navigationOnly = executeControlledActionRuntimeReportPluginOwnedAccess({ reportMode: 'navigation_only' });
assertReadOnly(navigationOnly);
assert.ok(navigationOnly.result.navigation);

for (const panel of [
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
  const panelResult = executeControlledActionRuntimeReportPluginOwnedAccess({ reportMode: 'panel', panel });
  assertReadOnly(panelResult);
  assert.equal(panelResult.result.selectedPanel, panel);
  assert.ok(panelResult.result.selectedPanelReport, `missing selectedPanelReport for ${panel}`);
}

const invalidPanel = executeControlledActionRuntimeReportPluginOwnedAccess({ reportMode: 'panel' });
assertReadOnly(invalidPanel);
assert.ok(invalidPanel.result.validationError);

const missingInput = executeControlledActionRuntimeReportPluginOwnedAccess({});
assertReadOnly(missingInput);
assert.ok(missingInput.result.structuredReport.overview.overallStatus === 'incomplete' || missingInput.result.structuredReport.overview.routeStatus === 'incomplete');

const forbiddenCorpus = `${JSON.stringify(full)}\n${docText}`;
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

for (const forbiddenApi of [
  'fs.writeFile',
  'fs.writeFileSync',
  'child_process',
  'fetch(',
  'axios',
  'http.request',
  'https.request',
  'openclaw gateway restart',
  'publish',
]) {
  assert.equal(wrapperText.includes(forbiddenApi), false, `forbidden API in wrapper: ${forbiddenApi}`);
  assert.equal(toolSurfaceText.includes(forbiddenApi), false, `forbidden API in tool surface: ${forbiddenApi}`);
}

console.log('alpha9 controlled action runtime report plugin-owned access implementation smoke: PASS');
