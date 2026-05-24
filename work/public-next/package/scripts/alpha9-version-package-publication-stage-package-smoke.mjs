import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-VERSION-PACKAGE-PUBLICATION-STAGE-PACKAGE.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'alpha9-version-package-publication-stage-package-v1.json');

assert.ok(fs.existsSync(docPath), 'docs missing');
assert.ok(fs.existsSync(fixturePath), 'fixture missing');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.ok(['package_staged', 'package_stage_blocked'].includes(fixture.status), 'invalid status');
assert.equal(fixture.baselineCommit, '731a6f748af75d5532ae0d52789c90d93ad76339');
assert.equal(fixture.packageVersion, '0.3.0-alpha.13');
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

if (fixture.status === 'package_staged') {
  assert.ok(typeof fixture.stageRoot === 'string' && fixture.stageRoot.length > 0, 'stageRoot missing');
  assert.equal(fixture.artifactName, 'umg-envoy-agent-0.3.0-alpha.13.tgz');
  assert.ok(typeof fixture.artifactPath === 'string' && fixture.artifactPath.length > 0, 'artifactPath missing');
  assert.ok(typeof fixture.artifactSha256 === 'string' && fixture.artifactSha256.length > 0 && fixture.artifactSha256 !== 'TO_FILL_FROM_HASH_OUTPUT', 'artifactSha256 missing');
  assert.equal(fixture.npmPackPassed, true);
  assert.equal(fixture.artifactContentAuditPassed, true);
  assert.equal(fixture.extractedPackageMetadataVerified, true);
  assert.equal(fixture.forbiddenFilesExcluded, true);
  assert.equal(fixture.liveCallProof, 'not_available_from_current_cli_surface');
  assert.equal(fixture.recommendedNextLane, 'ALPHA9_VERSION_PACKAGE_PUBLICATION_LOCAL_PACKAGE_INSTALL_VERIFY_SOURCE');
} else {
  assert.ok(typeof fixture.blockedReason === 'string' && fixture.blockedReason.trim().length > 0, 'blockedReason missing');
  assert.equal(fixture.recommendedNextLane, 'ALPHA9_VERSION_PACKAGE_PUBLICATION_STAGE_PACKAGE_FIX_SOURCE');
}

for (const forbidden of ['ready_to_execute', 'can_execute', 'approved_for_execution', 'execution_allowed', 'approval_granted', 'grant_execution', 'authorize_execution']) {
  assert.equal(doc.includes(forbidden), false, `forbidden term in docs: ${forbidden}`);
  assert.equal(JSON.stringify(fixture).includes(forbidden), false, `forbidden term in fixture: ${forbidden}`);
}

assert.ok(doc.includes('Direct live CLI invocation proof remains:'), 'known caveat missing');

console.log('alpha9 version package publication stage package smoke: PASS');
