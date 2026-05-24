import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-PLUGIN-OWNED-ACCESS-UI-COMPONENT-IMPLEMENTATION-PLAN.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'controlled-action-runtime-report-plugin-owned-access-ui-component-implementation-plan-v1.json');

assert.ok(fs.existsSync(docPath), 'docs missing');
assert.ok(fs.existsSync(fixturePath), 'fixture missing');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.equal(fixture.status, 'planning_ready');
assert.equal(fixture.baselineCommit, '8a41df62d18d7f6477d0e848938e6b26b0326940');
assert.equal(fixture.targetPluginId, 'umg-envoy-agent');
assert.equal(fixture.topLevelComponent, 'ControlledActionRuntimeReportDashboard');
assert.equal(fixture.implementationStarted, false);
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

assert.ok(fixture.futureFilesToCreate.includes('src/ui/ControlledActionRuntimeReportDashboard.tsx'));
assert.ok(Array.isArray(fixture.componentResponsibilities) && fixture.componentResponsibilities.length > 0, 'componentResponsibilities must not be empty');
assert.ok(Array.isArray(fixture.viewModelAdapterPlan) && fixture.viewModelAdapterPlan.length > 0, 'viewModelAdapterPlan must not be empty');
assert.ok(Array.isArray(fixture.implementationOrder) && fixture.implementationOrder.length > 0, 'implementationOrder must not be empty');
assert.ok(Array.isArray(fixture.futureTestRequirements) && fixture.futureTestRequirements.length > 0, 'futureTestRequirements must not be empty');
assert.equal(fixture.recommendedNextLane, 'ALPHA9_CONTROLLED_ACTION_RUNTIME_REPORT_PLUGIN_OWNED_ACCESS_UI_COMPONENT_IMPLEMENTATION_SOURCE');

for (const forbidden of ['ready_to_execute', 'can_execute', 'approved_for_execution', 'execution_allowed', 'approval_granted', 'grant_execution', 'authorize_execution']) {
  assert.equal(doc.includes(forbidden), false, `forbidden term in docs: ${forbidden}`);
  assert.equal(JSON.stringify(fixture).includes(forbidden), false, `forbidden term in fixture: ${forbidden}`);
}

const principle = 'The controlled-action runtime report plugin-owned access UI component implementation plan does not implement UI components, mutate runtime state, call live plugin tools, grant approval, record live decisions, execute actions, write files outside this repo artifact, transmit data externally, publish packages, modify installed plugin files, or restart OpenClaw. It defines a future UI component implementation path only.';
assert.ok(doc.includes(principle), 'missing required principle');

console.log('alpha9 controlled action runtime report plugin-owned access ui component implementation plan smoke: PASS');
