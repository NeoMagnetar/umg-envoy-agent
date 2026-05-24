import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-RELEASE-READINESS.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'controlled-action-runtime-report-release-readiness-v1.json');

assert.ok(fs.existsSync(docPath), 'docs missing');
assert.ok(fs.existsSync(fixturePath), 'fixture missing');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.ok(['release_alignment_ready', 'release_alignment_blocked'].includes(fixture.status), 'invalid readiness status');
assert.equal(fixture.baselineCommit, '27b60077a0fd66b81484401b7591bc5fdd4527d6');
assert.equal(fixture.targetPluginId, 'umg-envoy-agent');
assert.equal(fixture.currentPackageVersion, '0.3.0-alpha.12');
assert.equal(fixture.recommendedNextVersion, '0.3.0-alpha.13');
assert.equal(fixture.sourceImplementationReady, true);
assert.equal(fixture.pluginOwnedAccessReady, true);
assert.equal(fixture.uiRenderModelReady, true);
assert.equal(fixture.demoPacketReady, true);
assert.equal(fixture.previewPacketReady, true);
assert.equal(fixture.liveCallProof, 'not_available_from_current_cli_surface');
assert.equal(fixture.releaseAlignmentRequired, true);
assert.equal(fixture.versionBumped, false);
assert.equal(fixture.packagePublished, false);
assert.equal(fixture.runtimeModified, false);
assert.equal(fixture.installedPluginModified, false);
assert.equal(fixture.gatewayRestarted, false);
assert.equal(fixture.liveToolCalled, false);
assert.equal(fixture.executionPerformed, false);
assert.equal(fixture.approvalGranted, false);
assert.equal(fixture.recordingPerformed, false);
assert.equal(fixture.liveDecisionRecorded, false);
assert.equal(fixture.externalTransmissionPerformed, false);
assert.ok(Array.isArray(fixture.completedFeatureChain) && fixture.completedFeatureChain.length > 0, 'completedFeatureChain must not be empty');
assert.ok(Array.isArray(fixture.allowedPublicClaims) && fixture.allowedPublicClaims.length > 0, 'allowedPublicClaims must not be empty');
assert.ok(Array.isArray(fixture.disallowedPublicClaims) && fixture.disallowedPublicClaims.length > 0, 'disallowedPublicClaims must not be empty');
assert.ok(Array.isArray(fixture.versionAlignmentRequirements) && fixture.versionAlignmentRequirements.length > 0, 'versionAlignmentRequirements must not be empty');
assert.equal(fixture.recommendedNextLane, 'ALPHA9_VERSION_PACKAGE_PUBLICATION_ALIGNMENT_SOURCE');

for (const forbidden of ['ready_to_execute', 'can_execute', 'approved_for_execution', 'execution_allowed', 'approval_granted', 'grant_execution', 'authorize_execution']) {
  assert.equal(doc.includes(forbidden), false, `forbidden term in docs: ${forbidden}`);
  assert.equal(JSON.stringify(fixture).includes(forbidden), false, `forbidden term in fixture: ${forbidden}`);
}

const principle = 'The controlled-action runtime report release-readiness audit does not bump versions, publish packages, mutate runtime state, call live plugin tools, grant approval, record live decisions, execute actions, write files outside this repo artifact, transmit data externally, modify installed plugin files, or restart OpenClaw. It audits readiness for the next version/package alignment lane only.';
assert.ok(doc.includes(principle), 'missing required principle');

console.log('alpha9 controlled action runtime report release readiness smoke: PASS');
