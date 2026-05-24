import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-VERSION-PACKAGE-PUBLICATION-EXECUTE.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'alpha9-version-package-publication-execute-v1.json');

assert.ok(fs.existsSync(docPath), 'docs missing');
assert.ok(fs.existsSync(fixturePath), 'fixture missing');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.ok(['package_published', 'package_publish_blocked', 'package_already_published'].includes(fixture.status), 'invalid status');
assert.equal(fixture.baselineCommit, '8d2d6d5ea0655cd463830af6f9a7ca6c451f1023');
assert.equal(fixture.packageName, 'umg-envoy-agent');
assert.equal(fixture.packageVersion, '0.3.0-alpha.13');
assert.equal(fixture.releaseTagCreated, false);
assert.equal(fixture.githubReleaseCreated, false);
assert.equal(fixture.runtimeModified, false);
assert.equal(fixture.installedPluginModified, false);
assert.equal(fixture.gatewayRestarted, false);
assert.equal(fixture.liveToolCalled, false);
assert.equal(fixture.executionPerformed, false);
assert.equal(fixture.approvalGranted, false);
assert.equal(fixture.recordingPerformed, false);
assert.equal(fixture.liveDecisionRecorded, false);

if (fixture.status === 'package_published') {
  assert.equal(fixture.artifactHashVerifiedBeforePublish, true);
  assert.equal(fixture.userApprovedPublish, true);
  assert.equal(fixture.npmAuthenticated, true);
  assert.equal(fixture.npmPublishExecuted, true);
  assert.equal(fixture.npmPublishSucceeded, true);
  assert.equal(fixture.npmRegistryVersionVerified, true);
  assert.equal(fixture.packagePublished, true);
  assert.equal(fixture.externalTransmissionPerformed, true);
  assert.equal(fixture.externalTransmissionType, 'npm_publish');
  assert.equal(fixture.recommendedNextLane, 'ALPHA9_VERSION_PACKAGE_PUBLICATION_POST_PUBLISH_VERIFY_SOURCE');
} else if (fixture.status === 'package_publish_blocked') {
  assert.ok(typeof fixture.blockedReason === 'string' && fixture.blockedReason.trim().length > 0, 'blockedReason missing');
  assert.equal(fixture.packagePublished, false);
  assert.equal(fixture.recommendedNextLane, 'ALPHA9_VERSION_PACKAGE_PUBLICATION_EXECUTE_FIX_SOURCE');
} else {
  assert.equal(fixture.npmRegistryVersionVerified, true);
  assert.equal(fixture.packagePublished, true);
  assert.equal(fixture.publishCommandExecuted, false);
}

for (const forbidden of ['ready_to_execute', 'can_execute', 'approved_for_execution', 'execution_allowed', 'approval_granted', 'grant_execution', 'authorize_execution']) {
  assert.equal(doc.includes(forbidden), false, `forbidden term in docs: ${forbidden}`);
  assert.equal(JSON.stringify(fixture).includes(forbidden), false, `forbidden term in fixture: ${forbidden}`);
}

assert.ok(doc.includes('Direct live CLI invocation proof remains:'), 'known caveat missing');

console.log('alpha9 version package publication execute smoke: PASS');
