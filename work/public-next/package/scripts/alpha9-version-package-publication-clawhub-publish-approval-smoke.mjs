import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-VERSION-PACKAGE-PUBLICATION-CLAWHUB-PUBLISH-APPROVAL.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'alpha9-version-package-publication-clawhub-publish-approval-v1.json');

assert.ok(fs.existsSync(docPath), 'docs missing');
assert.ok(fs.existsSync(fixturePath), 'fixture missing');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.ok(['clawhub_publish_approval_pending', 'clawhub_publish_approval_recorded'].includes(fixture.status), 'invalid status');
assert.equal(fixture.packageName, 'umg-envoy-agent');
assert.equal(fixture.packageVersion, '0.3.0-alpha.13');
assert.equal(fixture.artifactSha256, 'C659660742CB0DB82524C2DCEADE4C759CE2954D992743728474CB873624D502');
assert.equal(fixture.artifactHashVerified, true);
assert.equal(fixture.clawHubMismatchDetected, true);
assert.equal(fixture.clawHubPublishCommandFound, true);
assert.ok(typeof fixture.proposedClawHubPublishCommand === 'string' && fixture.proposedClawHubPublishCommand.trim().length > 0, 'publish command missing');
assert.equal(fixture.clawHubPublishExecuted, false);
assert.equal(fixture.clawHubPublished, false);
assert.equal(fixture.npmRepublishExecuted, false);
assert.equal(fixture.packagePublished, true);
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

if (fixture.status === 'clawhub_publish_approval_pending') {
  assert.equal(fixture.userApprovedClawHubPublish, false);
  assert.equal(fixture.recommendedNextLane, 'ALPHA9_VERSION_PACKAGE_PUBLICATION_CLAWHUB_PUBLISH_APPROVAL_SOURCE');
} else {
  assert.equal(fixture.userApprovedClawHubPublish, true);
  assert.equal(fixture.recommendedNextLane, 'ALPHA9_VERSION_PACKAGE_PUBLICATION_CLAWHUB_EXECUTE_SOURCE');
}

for (const forbidden of ['ready_to_execute', 'can_execute', 'approved_for_execution', 'execution_allowed', 'approval_granted', 'grant_execution', 'authorize_execution']) {
  assert.equal(doc.includes(forbidden), false, `forbidden term in docs: ${forbidden}`);
  assert.equal(JSON.stringify(fixture).includes(forbidden), false, `forbidden term in fixture: ${forbidden}`);
}

console.log('alpha9 version package publication clawhub publish approval smoke: PASS');