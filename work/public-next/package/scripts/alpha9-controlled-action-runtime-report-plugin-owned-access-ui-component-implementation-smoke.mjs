import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

const requiredSourceFiles = [
  'src/ui/runtime-report-status-model.ts',
  'src/ui/runtime-report-view-model.ts',
  'src/ui/runtime-report-demo-data.ts',
  'src/ui/runtime-report-components.ts',
  'src/ui/ControlledActionRuntimeReportDashboard.ts',
  'docs/ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-PLUGIN-OWNED-ACCESS-UI-COMPONENT-IMPLEMENTATION.md',
];

for (const rel of requiredSourceFiles) {
  assert.ok(fs.existsSync(path.join(repoRoot, rel)), `missing required file: ${rel}`);
}

const distFiles = [
  'dist/ui/runtime-report-status-model.js',
  'dist/ui/runtime-report-view-model.js',
  'dist/ui/runtime-report-demo-data.js',
  'dist/ui/runtime-report-components.js',
  'dist/ui/ControlledActionRuntimeReportDashboard.js',
];
for (const rel of distFiles) {
  assert.ok(fs.existsSync(path.join(repoRoot, rel)), `missing build output: ${rel}`);
}

const dashboardModule = await import(pathToFileURL(path.join(repoRoot, 'dist/ui/ControlledActionRuntimeReportDashboard.js')).href);
const demoModule = await import(pathToFileURL(path.join(repoRoot, 'dist/ui/runtime-report-demo-data.js')).href);
const statusModule = await import(pathToFileURL(path.join(repoRoot, 'dist/ui/runtime-report-status-model.js')).href);
const componentsModule = await import(pathToFileURL(path.join(repoRoot, 'dist/ui/runtime-report-components.js')).href);

assert.equal(typeof dashboardModule.buildControlledActionRuntimeReportDashboardRenderModel, 'function');
assert.ok(demoModule.controlledActionRuntimeReportDemoViewModel);
assert.equal(typeof statusModule.getRuntimeReportStatusPresentation, 'function');
assert.ok(Array.isArray(componentsModule.runtimeReportComponentDescriptors));

const demo = demoModule.controlledActionRuntimeReportDemoViewModel;
assert.equal(demo.liveCallProof, 'not_available_from_current_cli_surface');
assert.equal(demo.executionPerformed, false);
assert.equal(demo.approvalGranted, false);
assert.equal(demo.recordingPerformed, false);
assert.equal(demo.liveDecisionRecorded, false);

const expectedPanels = [
  'overview',
  'active_route',
  'safety_evidence_chain',
  'blocked_capabilities',
  'readiness',
  'audit_and_review',
  'recording_metadata',
  'hard_boundaries',
  'next_safe_step',
];
for (const panel of expectedPanels) {
  assert.ok(demo.panels[panel], `missing panel: ${panel}`);
}

for (const capability of ['execute_action', 'write_files', 'bridge_actions', 'direct_source', 'automatic_takeover', 'package_publish']) {
  assert.ok(demo.blockedCapabilities.find((c) => c.id === capability), `missing blocked capability: ${capability}`);
}

const renderModel = dashboardModule.buildControlledActionRuntimeReportDashboardRenderModel({ report: demo, selectedPanel: 'blocked_capabilities' });
assert.equal(renderModel.topLevelComponent, 'ControlledActionRuntimeReportDashboard');
assert.equal(renderModel.selectedPanel, 'blocked_capabilities');
assert.equal(renderModel.report.executionPerformed, false);
assert.equal(renderModel.report.approvalGranted, false);
assert.equal(renderModel.report.recordingPerformed, false);
assert.equal(renderModel.report.liveDecisionRecorded, false);

const invalidPanelModel = dashboardModule.buildControlledActionRuntimeReportDashboardRenderModel({ report: demo, selectedPanel: 'invalid_panel_name' });
assert.equal(invalidPanelModel.selectedPanel, 'overview');
assert.ok(invalidPanelModel.invalidPanelNotice);

const forbiddenTerms = [
  'ready_to_execute',
  'can_execute',
  'approved_for_execution',
  'execution_allowed',
  'approval_granted',
  'grant_execution',
  'authorize_execution',
];

for (const rel of [
  'src/ui/runtime-report-status-model.ts',
  'src/ui/runtime-report-view-model.ts',
  'src/ui/runtime-report-demo-data.ts',
  'src/ui/runtime-report-components.ts',
  'src/ui/ControlledActionRuntimeReportDashboard.ts',
  'docs/ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-PLUGIN-OWNED-ACCESS-UI-COMPONENT-IMPLEMENTATION.md',
]) {
  const text = fs.readFileSync(path.join(repoRoot, rel), 'utf8');
  for (const forbidden of forbiddenTerms) {
    assert.equal(text.includes(forbidden), false, `forbidden wording in ${rel}: ${forbidden}`);
  }
}

for (const rel of [
  'src/ui/runtime-report-status-model.ts',
  'src/ui/runtime-report-view-model.ts',
  'src/ui/runtime-report-demo-data.ts',
  'src/ui/runtime-report-components.ts',
  'src/ui/ControlledActionRuntimeReportDashboard.ts',
]) {
  const text = fs.readFileSync(path.join(repoRoot, rel), 'utf8');
  for (const forbiddenApi of ['fs.writeFile', 'fs.writeFileSync', 'child_process', 'fetch(', 'axios', 'http.request', 'https.request', 'openclaw gateway restart', 'npm publish', 'clawhub publish', 'package publish']) {
    assert.equal(text.includes(forbiddenApi), false, `forbidden API in ${rel}: ${forbiddenApi}`);
  }
}

console.log('alpha9 controlled action runtime report plugin-owned access ui component implementation smoke: PASS');
