import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-PLUGIN-OWNED-ACCESS-UI-COMPONENT-DEMO-RENDER.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'controlled-action-runtime-report-plugin-owned-access-ui-component-demo-render-v1.json');

assert.ok(fs.existsSync(docPath), 'docs missing');
assert.ok(fs.existsSync(fixturePath), 'fixture missing');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.equal(fixture.status, 'demo_render_ready');
assert.equal(fixture.baselineCommit, 'f5cbabe44dc78c19d7d53d3cf1bfd1b7c15e0e5f');
assert.equal(fixture.targetPluginId, 'umg-envoy-agent');
assert.equal(fixture.topLevelComponent, 'ControlledActionRuntimeReportDashboard');
assert.equal(fixture.implementationStyle, 'typescript_render_spec');
assert.equal(fixture.demoRenderPrepared, true);
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
  assert.ok(fixture.renderModes.includes(mode), `missing render mode: ${mode}`);
}
for (const panel of ['blocked_capabilities', 'next_safe_step']) {
  assert.ok(fixture.selectedPanelDemos.includes(panel), `missing selected panel demo: ${panel}`);
}
for (const region of ['header', 'status_strip', 'navigation', 'active_route', 'safety_evidence_chain', 'blocked_capabilities', 'next_safe_step', 'panel_drawer', 'ascii_fallback', 'boundary_footer']) {
  assert.ok(fixture.requiredRegions.includes(region), `missing required region: ${region}`);
}
for (const descriptor of ['RuntimeReportHeader', 'RuntimeReportNavigation', 'ActiveRouteCard', 'SafetyEvidenceChainCard', 'BlockedCapabilitiesCard', 'NextSafeStepCard']) {
  assert.ok(fixture.requiredComponentDescriptors.includes(descriptor), `missing required component descriptor: ${descriptor}`);
}
assert.equal(fixture.recommendedNextLane, 'ALPHA9_CONTROLLED_ACTION_RUNTIME_REPORT_PLUGIN_OWNED_ACCESS_UI_COMPONENT_PREVIEW_PACKET_SOURCE');

const dashboardModule = await import(pathToFileURL(path.join(repoRoot, 'dist/ui/ControlledActionRuntimeReportDashboard.js')).href);
const demoModule = await import(pathToFileURL(path.join(repoRoot, 'dist/ui/runtime-report-demo-data.js')).href);
const componentsModule = await import(pathToFileURL(path.join(repoRoot, 'dist/ui/runtime-report-components.js')).href);
const statusModule = await import(pathToFileURL(path.join(repoRoot, 'dist/ui/runtime-report-status-model.js')).href);

assert.equal(typeof dashboardModule.buildControlledActionRuntimeReportDashboardRenderModel, 'function');
assert.ok(demoModule.controlledActionRuntimeReportDemoViewModel);
assert.ok(Array.isArray(componentsModule.runtimeReportComponentDescriptors));
assert.equal(typeof statusModule.getRuntimeReportStatusPresentation, 'function');

const demo = demoModule.controlledActionRuntimeReportDemoViewModel;
const build = dashboardModule.buildControlledActionRuntimeReportDashboardRenderModel;

const fullModel = build({ report: demo, displayMode: 'full' });
const compactModel = build({ report: demo, displayMode: 'compact' });
const asciiModel = build({ report: demo, displayMode: 'ascii_fallback' });
const blockedPanelModel = build({ report: demo, selectedPanel: 'blocked_capabilities' });
const nextSafeStepModel = build({ report: demo, selectedPanel: 'next_safe_step' });
const invalidPanelModel = build({ report: demo, selectedPanel: 'invalid_panel_name' });

for (const model of [fullModel, compactModel, asciiModel, blockedPanelModel, nextSafeStepModel, invalidPanelModel]) {
  assert.equal(model.topLevelComponent, 'ControlledActionRuntimeReportDashboard');
  assert.equal(model.report.activeRoute.routeId, 'desktop_write_candidate');
  assert.equal(model.report.activeRoute.riskLevel, 'high');
  assert.equal(model.report.activeRoute.status, 'blocked');
  assert.equal(model.report.liveCallProof, 'not_available_from_current_cli_surface');
  assert.equal(model.report.executionPerformed, false);
  assert.equal(model.report.approvalGranted, false);
  assert.equal(model.report.recordingPerformed, false);
  assert.equal(model.report.liveDecisionRecorded, false);
}

assert.equal(fullModel.displayMode, 'full');
assert.equal(compactModel.displayMode, 'compact');
assert.equal(asciiModel.displayMode, 'ascii_fallback');
assert.equal(fullModel.selectedPanel, 'overview');
assert.equal(blockedPanelModel.selectedPanel, 'blocked_capabilities');
assert.equal(nextSafeStepModel.selectedPanel, 'next_safe_step');
assert.equal(invalidPanelModel.selectedPanel, 'overview');
assert.ok(invalidPanelModel.invalidPanelNotice);

const regionSet = new Set(fullModel.regions.map((r) => r.region));
for (const region of fixture.requiredRegions) {
  assert.ok(regionSet.has(region), `render model missing region: ${region}`);
}
const descriptorSet = new Set(fullModel.regions.map((r) => r.componentName));
for (const descriptor of fixture.requiredComponentDescriptors) {
  assert.ok(descriptorSet.has(descriptor), `render model missing descriptor: ${descriptor}`);
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
  for (const forbidden of ['ready_to_execute', 'can_execute', 'approved_for_execution', 'execution_allowed', 'approval_granted', 'grant_execution', 'authorize_execution']) {
    assert.equal(text.includes(forbidden), false, `forbidden wording in ${rel}: ${forbidden}`);
  }
}

for (const rel of [
  'docs/ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-PLUGIN-OWNED-ACCESS-UI-COMPONENT-DEMO-RENDER.md',
  'fixtures/action-gates/controlled-action-runtime-report-plugin-owned-access-ui-component-demo-render-v1.json',
]) {
  const text = fs.readFileSync(path.join(repoRoot, rel), 'utf8');
  for (const forbidden of ['ready_to_execute', 'can_execute', 'approved_for_execution', 'execution_allowed', 'approval_granted', 'grant_execution', 'authorize_execution']) {
    assert.equal(text.includes(forbidden), false, `forbidden wording in ${rel}: ${forbidden}`);
  }
}

const principle = 'The controlled-action runtime report plugin-owned access UI component demo render does not mount a live UI, mutate runtime state, call live plugin tools, grant approval, record live decisions, execute actions, write files outside this repo artifact, transmit data externally, publish packages, modify installed plugin files, or restart OpenClaw. It validates deterministic render-model output only.';
assert.ok(doc.includes(principle), 'missing required principle');

console.log('alpha9 controlled action runtime report plugin-owned access ui component demo render smoke: PASS');
