import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { executeControlledActionRuntimeReportTool } from '../dist/controlled-action-runtime-report-tool-surface.js';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-TOOL-SURFACE-IMPLEMENTATION.md');
const pluginPath = path.join(repoRoot, 'openclaw.plugin.json');
const pluginEntryPath = path.join(repoRoot, 'src', 'plugin-entry.ts');
const toolSurfacePath = path.join(repoRoot, 'src', 'controlled-action-runtime-report-tool-surface.ts');

const docText = fs.readFileSync(docPath, 'utf8');
const pluginText = fs.existsSync(pluginPath) ? fs.readFileSync(pluginPath, 'utf8') : '';
const pluginEntryText = fs.readFileSync(pluginEntryPath, 'utf8');
const toolSurfaceText = fs.readFileSync(toolSurfacePath, 'utf8');

assert.ok(pluginEntryText.includes('umg_envoy_controlled_action_runtime_report'));

const full = executeControlledActionRuntimeReportTool({ reportMode: 'full', routeId: 'desktop_write_candidate' });
assert.equal(full.runtimeReportOnly, true);
assert.equal(full.toolSurfaceReadOnly, true);
assert.equal(full.executionPerformed, false);
assert.equal(full.approvalGranted, false);
assert.equal(full.recordingPerformed, false);
assert.equal(full.liveDecisionRecorded, false);
assert.ok(full.asciiReport);
assert.ok(full.structuredReport);
assert.ok(full.navigation);

const asciiOnly = executeControlledActionRuntimeReportTool({ reportMode: 'ascii_only' });
assert.ok(asciiOnly.asciiReport);
assert.equal(asciiOnly.executionPerformed, false);

const structuredOnly = executeControlledActionRuntimeReportTool({ reportMode: 'structured_only' });
assert.ok(structuredOnly.structuredReport);
assert.equal(structuredOnly.executionPerformed, false);

const navigationOnly = executeControlledActionRuntimeReportTool({ reportMode: 'navigation_only' });
assert.ok(navigationOnly.navigation);
assert.equal(navigationOnly.executionPerformed, false);

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
  const panelResult = executeControlledActionRuntimeReportTool({ reportMode: 'panel', panel });
  assert.ok(panelResult.selectedPanelReport, `panel mode failed for ${panel}`);
}

const invalidPanel = executeControlledActionRuntimeReportTool({ reportMode: 'panel' });
assert.ok(invalidPanel.validationError);
assert.equal(invalidPanel.executionPerformed, false);

const missingInput = executeControlledActionRuntimeReportTool({ reportMode: 'full' });
assert.equal(missingInput.executionPerformed, false);
assert.ok(missingInput.structuredReport.overview.overallStatus === 'incomplete' || missingInput.structuredReport.overview.routeStatus === 'incomplete');

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
]) {
  assert.equal(toolSurfaceText.includes(forbiddenApi), false, `forbidden API present: ${forbiddenApi}`);
}

assert.ok(docText.includes('read-only report preview'));
assert.equal(pluginText.includes('ready_to_execute'), false);

console.log('alpha9 controlled action runtime report tool surface implementation smoke: PASS');
