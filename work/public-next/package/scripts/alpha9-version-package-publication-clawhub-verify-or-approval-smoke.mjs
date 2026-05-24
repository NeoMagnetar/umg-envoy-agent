import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-VERSION-PACKAGE-PUBLICATION-CLAWHUB-VERIFY-OR-APPROVAL.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'alpha9-version-package-publication-clawhub-verify-or-approval-v1.json');

assert.ok(fs.existsSync(docPath), 'docs missing');
assert.ok(fs.existsSync(fixturePath), 'fixture missing');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.equal(fixture.verifyId, 'alpha9-version-package-publication-clawhub-verify-or-approval-v1');
assert.equal(fixture.verifyType, 'alpha9_version_package_publication_clawhub_verify_or_approval');
assert.ok(['clawhub_mismatch_detected', 'clawhub_verified', 'clawhub_publish_path_unknown'].includes(fixture.status), 'invalid status');
assert.equal(fixture.baselineCommit, '19b4eb4d0d3c9972efff9563f13ead0f7b96612d');
assert.equal(fixture.packageName, 'umg-envoy-agent');
assert.equal(fixture.npmPackageVersion, '0.3.0-alpha.13');
assert.equal(fixture.npmPackagePublished, true);
assert.equal(fixture.releaseTagCreated, false);
assert.equal(fixture.githubReleaseCreated, false);
assert.equal(fixture.runtimeModified, false);
assert.equal(fixture.installedPluginModified, false);
assert.equal(fixture.gatewayRestarted, false);
assert.equal(fixture.liveToolCalled, false);
assert.equal(fixture.executionPerformed, false);
assert.equal(fixture.approvalGranted, false);
assert.equal(fixture.recordingPerformed, false);
assert.equal(fixture.npmRepublishRequired, false);

if (fixture.status === 'clawhub_mismatch_detected') {
  assert.equal(fixture.clawHubDisplayedVersion, '0.3.0-alpha.12');
  assert.equal(fixture.clawHubReadmeVersion, '0.3.0-alpha.12');
  assert.equal(fixture.clawHubCurrentVersion, '0.3.0-alpha.12');
  assert.equal(fixture.clawHubPublished, false);
  assert.equal(fixture.clawHubStatus, 'stale_or_separate_flow');
  assert.equal(fixture.separateClawHubPublishCommandFound, true);
  assert.equal(fixture.clawHubLikelyCached, false);
  assert.equal(fixture.clawHubPublishRequired, true);
  assert.equal(fixture.clawHubPublishApprovalRequired, true);
  assert.equal(fixture.packagePublished, true);
  assert.equal(fixture.recommendedNextLane, 'ALPHA9_VERSION_PACKAGE_PUBLICATION_CLAWHUB_PUBLISH_APPROVAL_SOURCE');
}

for (const forbidden of ['ready_to_execute', 'can_execute', 'approved_for_execution', 'execution_allowed', 'approval_granted', 'grant_execution', 'authorize_execution']) {
  assert.equal(doc.includes(forbidden), false, `forbidden term in docs: ${forbidden}`);
  assert.equal(JSON.stringify(fixture).includes(forbidden), false, `forbidden term in fixture: ${forbidden}`);
}

assert.ok(doc.includes('ClawHub package publish'), 'publish-flow finding missing');
assert.ok(doc.includes('status=clawhub_mismatch_detected'), 'status marker missing');

console.log('alpha9 version package publication clawhub verify or approval smoke: PASS');