import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-VERSION-PACKAGE-PUBLICATION-ALIGNMENT.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'alpha9-version-package-publication-alignment-v1.json');

assert.ok(fs.existsSync(docPath), 'docs missing');
assert.ok(fs.existsSync(fixturePath), 'fixture missing');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.equal(fixture.status, 'alignment_audit_ready');
assert.equal(fixture.baselineCommit, '474c11a219dd65b4cdc5bc1d95d0fd3d57e4e5f1');
assert.equal(fixture.currentPackageVersion, '0.3.0-alpha.12');
assert.equal(fixture.recommendedNextVersion, '0.3.0-alpha.13');
assert.equal(fixture.releaseAlignmentRequired, true);
assert.equal(fixture.versionBumped, false);
assert.equal(fixture.packageJsonModified, false);
assert.equal(fixture.openclawPluginManifestModified, false);
assert.equal(fixture.readmeModified, false);
assert.equal(fixture.distModified, false);
assert.equal(fixture.packagePublished, false);
assert.equal(fixture.clawHubPublished, false);
assert.equal(fixture.runtimeModified, false);
assert.equal(fixture.installedPluginModified, false);
assert.equal(fixture.gatewayRestarted, false);
assert.equal(fixture.liveToolCalled, false);
assert.equal(fixture.executionPerformed, false);
assert.equal(fixture.approvalGranted, false);
assert.equal(fixture.recordingPerformed, false);
assert.equal(fixture.liveDecisionRecorded, false);
assert.ok(Array.isArray(fixture.versionSurfaces) && fixture.versionSurfaces.length > 0, 'versionSurfaces must not be empty');
assert.ok(Array.isArray(fixture.allowedPublicClaims) && fixture.allowedPublicClaims.length > 0, 'allowedPublicClaims must not be empty');
assert.ok(Array.isArray(fixture.disallowedPublicClaims) && fixture.disallowedPublicClaims.length > 0, 'disallowedPublicClaims must not be empty');
assert.ok(Array.isArray(fixture.alignmentRequirements) && fixture.alignmentRequirements.length > 0, 'alignmentRequirements must not be empty');
assert.equal(fixture.recommendedNextLane, 'ALPHA9_VERSION_PACKAGE_PUBLICATION_ALIGNMENT_APPLY_SOURCE');

for (const forbidden of ['ready_to_execute', 'can_execute', 'approved_for_execution', 'execution_allowed', 'approval_granted', 'grant_execution', 'authorize_execution']) {
  assert.equal(doc.includes(forbidden), false, `forbidden term in docs: ${forbidden}`);
  assert.equal(JSON.stringify(fixture).includes(forbidden), false, `forbidden term in fixture: ${forbidden}`);
}

const principle = 'The Alpha9 version/package/publication alignment audit does not bump versions, publish packages, mutate runtime state, call live plugin tools, grant approval, record live decisions, execute actions, write files outside this repo artifact, transmit data externally, modify installed plugin files, or restart OpenClaw. It inventories alignment requirements for the next apply lane only.';
assert.ok(doc.includes(principle), 'missing required principle');

console.log('alpha9 version package publication alignment smoke: PASS');
