import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-VERSION-PACKAGE-PUBLICATION-ALIGNMENT-APPLY.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'alpha9-version-package-publication-alignment-apply-v1.json');
const packageJsonPath = path.join(repoRoot, 'package.json');
const pluginManifestPath = path.join(repoRoot, 'openclaw.plugin.json');

assert.ok(fs.existsSync(docPath), 'docs missing');
assert.ok(fs.existsSync(fixturePath), 'fixture missing');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const pluginManifest = JSON.parse(fs.readFileSync(pluginManifestPath, 'utf8'));

assert.equal(fixture.status, 'alignment_applied');
assert.equal(fixture.baselineCommit, '1a0367bf2cad52f73dc8f8bb5fb2c8d5368d8c27');
assert.equal(fixture.previousVersion, '0.3.0-alpha.12');
assert.equal(fixture.appliedVersion, '0.3.0-alpha.13');
assert.equal(packageJson.version, '0.3.0-alpha.13');
assert.equal(pluginManifest.version, '0.3.0-alpha.13');
assert.equal(fixture.versionBumped, true);
assert.equal(fixture.packagePublished, false);
assert.equal(fixture.clawHubPublished, false);
assert.equal(fixture.releaseTagCreated, false);
assert.equal(fixture.runtimeModified, false);
assert.equal(fixture.installedPluginModified, false);
assert.equal(fixture.gatewayRestarted, false);
assert.equal(fixture.liveToolCalled, false);
assert.equal(fixture.executionPerformed, false);
assert.equal(fixture.approvalGranted, false);
assert.equal(fixture.recordingPerformed, false);
assert.equal(fixture.liveDecisionRecorded, false);
assert.ok(Array.isArray(fixture.updatedFiles) && fixture.updatedFiles.length > 0, 'updatedFiles must not be empty');
assert.ok(Array.isArray(fixture.versionSurfacesAligned) && fixture.versionSurfacesAligned.length > 0, 'versionSurfacesAligned must not be empty');
assert.ok(Array.isArray(fixture.allowedPublicClaims) && fixture.allowedPublicClaims.length > 0, 'allowedPublicClaims must not be empty');
assert.ok(Array.isArray(fixture.disallowedPublicClaims) && fixture.disallowedPublicClaims.length > 0, 'disallowedPublicClaims must not be empty');
assert.equal(fixture.recommendedNextLane, 'ALPHA9_VERSION_PACKAGE_PUBLICATION_PREPUBLISH_VALIDATION_SOURCE');

assert.equal(JSON.stringify(packageJson).includes('0.3.0-alpha.12'), false, 'package.json must not contain alpha.12');
assert.equal(JSON.stringify(pluginManifest).includes('0.3.0-alpha.12'), false, 'openclaw.plugin.json must not contain alpha.12');

for (const forbidden of ['ready_to_execute', 'can_execute', 'approved_for_execution', 'execution_allowed', 'approval_granted', 'grant_execution', 'authorize_execution']) {
  assert.equal(doc.includes(forbidden), false, `forbidden term in docs: ${forbidden}`);
  assert.equal(JSON.stringify(fixture).includes(forbidden), false, `forbidden term in fixture: ${forbidden}`);
}

console.log('alpha9 version package publication alignment apply smoke: PASS');
