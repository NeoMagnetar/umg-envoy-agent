import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-PLUGIN-OWNED-ACCESS-UI-COMPONENT-DESIGN.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'controlled-action-runtime-report-plugin-owned-access-ui-component-design-v1.json');

assert.ok(fs.existsSync(docPath), 'docs missing');
assert.ok(fs.existsSync(fixturePath), 'fixture missing');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.equal(fixture.status, 'component_design_ready');
assert.equal(fixture.baselineCommit, '4684a5e5558bd5cd9b2cabd2b030809cb9b706f7');
assert.equal(fixture.targetPluginId, 'umg-envoy-agent');
assert.equal(fixture.topLevelComponent, 'ControlledActionRuntimeReportDashboard');
assert.equal(fixture.componentDesignPrepared, true);
assert.equal(fixture.componentImplemented, false);
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

for (const component of ['RuntimeReportHeader', 'RuntimeReportNavigation', 'ActiveRouteCard', 'SafetyEvidenceChainCard', 'BlockedCapabilitiesCard', 'NextSafeStepCard']) {
  assert.ok(fixture.componentHierarchy.includes(component), `missing component: ${component}`);
}

for (const region of ['header', 'status_strip', 'navigation', 'active_route', 'safety_evidence_chain', 'blocked_capabilities', 'next_safe_step', 'panel_drawer', 'ascii_fallback', 'boundary_footer']) {
  assert.ok(fixture.layoutRegions.includes(region), `missing layout region: ${region}`);
}

for (const panel of ['OverviewPanel', 'ActiveRoutePanel', 'SafetyEvidenceChainPanel', 'BlockedCapabilitiesPanel', 'ReadinessPanel', 'AuditAndReviewPanel', 'RecordingMetadataPanel', 'HardBoundariesPanel', 'NextSafeStepPanel']) {
  assert.ok(fixture.panelComponents.includes(panel), `missing panel component: ${panel}`);
}

assert.ok(Array.isArray(fixture.futureImplementationFiles) && fixture.futureImplementationFiles.length > 0, 'futureImplementationFiles must not be empty');
assert.equal(fixture.recommendedNextLane, 'ALPHA9_CONTROLLED_ACTION_RUNTIME_REPORT_PLUGIN_OWNED_ACCESS_UI_COMPONENT_IMPLEMENTATION_PLAN_SOURCE');

for (const forbidden of ['ready_to_execute', 'can_execute', 'approved_for_execution', 'execution_allowed', 'approval_granted', 'grant_execution', 'authorize_execution']) {
  assert.equal(doc.includes(forbidden), false, `forbidden term in docs: ${forbidden}`);
  assert.equal(JSON.stringify(fixture).includes(forbidden), false, `forbidden term in fixture: ${forbidden}`);
}

const principle = 'The controlled-action runtime report plugin-owned access UI component design does not implement UI components, mutate runtime state, call live plugin tools, grant approval, record live decisions, execute actions, write files outside this repo artifact, transmit data externally, publish packages, modify installed plugin files, or restart OpenClaw. It defines a future component architecture for a read-only runtime report surface only.';
assert.ok(doc.includes(principle), 'missing required principle');

console.log('alpha9 controlled action runtime report plugin-owned access ui component design smoke: PASS');
