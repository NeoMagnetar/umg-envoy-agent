import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-VERSION-PACKAGE-PUBLICATION-LOCAL-PACKAGE-INSTALL-VERIFY.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'alpha9-version-package-publication-local-package-install-verify-v1.json');

assert.ok(fs.existsSync(docPath), 'docs missing');
assert.ok(fs.existsSync(fixturePath), 'fixture missing');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.ok(['local_package_install_verified', 'local_package_install_verify_blocked'].includes(fixture.status), 'invalid status');
assert.equal(fixture.baselineCommit, 'f6ed2963538fa9db8f82406527d41722c62e1738');
assert.equal(fixture.packageVersion, '0.3.0-alpha.13');
assert.equal(fixture.packagePublished, false);
assert.equal(fixture.clawHubPublished, false);
assert.equal(fixture.releaseTagCreated, false);
assert.equal(fixture.liveToolCalled, false);
assert.equal(fixture.executionPerformed, false);
assert.equal(fixture.approvalGranted, false);
assert.equal(fixture.recordingPerformed, false);
assert.equal(fixture.liveDecisionRecorded, false);
assert.equal(fixture.externalTransmissionPerformed, false);

if (fixture.status === 'local_package_install_verified') {
  assert.equal(fixture.artifactHashVerified, true);
  assert.equal(fixture.backupCreated, true);
  assert.equal(fixture.localInstallPerformed, true);
  assert.equal(fixture.installedPackageJsonVersionConfirmed, true);
  assert.equal(fixture.installedOpenclawPluginVersionConfirmed, true);
  assert.equal(fixture.installedPluginEntryPresent, true);
  assert.equal(fixture.installedPluginOwnedAccessPresent, true);
  assert.equal(fixture.installedUiRenderModelPresent, true);
  assert.equal(fixture.sourceValidationAfterInstallPassed, true);
  assert.equal(fixture.liveCallProof, 'not_available_from_current_cli_surface');
  assert.equal(fixture.recommendedNextLane, 'ALPHA9_VERSION_PACKAGE_PUBLICATION_PUBLISH_READINESS_SOURCE');
} else {
  assert.ok(typeof fixture.blockedReason === 'string' && fixture.blockedReason.trim().length > 0, 'blockedReason missing');
  assert.equal(fixture.recommendedNextLane, 'ALPHA9_VERSION_PACKAGE_PUBLICATION_LOCAL_PACKAGE_INSTALL_FIX_SOURCE');
}

for (const forbidden of ['ready_to_execute', 'can_execute', 'approved_for_execution', 'execution_allowed', 'approval_granted', 'grant_execution', 'authorize_execution']) {
  assert.equal(doc.includes(forbidden), false, `forbidden term in docs: ${forbidden}`);
  assert.equal(JSON.stringify(fixture).includes(forbidden), false, `forbidden term in fixture: ${forbidden}`);
}

assert.ok(doc.includes('Direct live CLI invocation proof remains:'), 'known caveat missing');

console.log('alpha9 version package publication local package install verify smoke: PASS');
