import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-VERSION-PACKAGE-PUBLICATION-PUBLISH-READINESS.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'alpha9-version-package-publication-publish-readiness-v1.json');

assert.ok(fs.existsSync(docPath), 'docs missing');
assert.ok(fs.existsSync(fixturePath), 'fixture missing');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.equal(fixture.status, 'publish_readiness_ready');
assert.equal(fixture.baselineCommit, '7735f947be51225f42a2d7a409595a328f13390a');
assert.equal(fixture.packageVersion, '0.3.0-alpha.13');
assert.equal(fixture.stagedArtifactVerified, true);
assert.equal(fixture.localInstallVerified, true);
assert.equal(fixture.packageMetadataAligned, true);
assert.equal(fixture.readmeAligned, true);
assert.equal(fixture.buildPassed, true);
assert.equal(fixture.validateAlphaCurrentPassed, true);
assert.equal(fixture.liveCallProof, 'not_available_from_current_cli_surface');
assert.equal(fixture.publishReady, true);
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
assert.equal(fixture.externalTransmissionPerformed, false);
assert.equal(fixture.recommendedNextLane, 'ALPHA9_VERSION_PACKAGE_PUBLICATION_EXECUTE_SOURCE');

assert.ok(Array.isArray(fixture.allowedPublicClaims) && fixture.allowedPublicClaims.length > 0, 'allowedPublicClaims missing');
assert.ok(Array.isArray(fixture.disallowedPublicClaims) && fixture.disallowedPublicClaims.length > 0, 'disallowedPublicClaims missing');
assert.ok(Array.isArray(fixture.remainingPublishPrerequisites) && fixture.remainingPublishPrerequisites.length > 0, 'remainingPublishPrerequisites missing');

for (const forbidden of ['ready_to_execute', 'can_execute', 'approved_for_execution', 'execution_allowed', 'approval_granted', 'grant_execution', 'authorize_execution']) {
  assert.equal(doc.includes(forbidden), false, `forbidden term in docs: ${forbidden}`);
  assert.equal(JSON.stringify(fixture).includes(forbidden), false, `forbidden term in fixture: ${forbidden}`);
}

assert.ok(doc.includes('Direct live CLI invocation proof remains:'), 'known caveat missing');

console.log('alpha9 version package publication publish readiness smoke: PASS');
