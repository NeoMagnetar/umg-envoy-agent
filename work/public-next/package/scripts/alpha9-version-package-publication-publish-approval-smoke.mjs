import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-VERSION-PACKAGE-PUBLICATION-PUBLISH-APPROVAL.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'alpha9-version-package-publication-publish-approval-v1.json');

assert.ok(fs.existsSync(docPath), 'docs missing');
assert.ok(fs.existsSync(fixturePath), 'fixture missing');

const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.ok(['publish_approval_recorded', 'publish_approval_blocked'].includes(fixture.status), 'invalid status');
assert.equal(fixture.baselineCommit, 'bcf2ff962014822d7f0de498f417e67f5d81b224');
assert.equal(fixture.packageVersion, '0.3.0-alpha.13');
assert.equal(fixture.publishReady, true);
assert.equal(fixture.packagePublished, false);
assert.equal(fixture.clawHubPublished, false);
assert.equal(fixture.releaseTagCreated, false);
assert.equal(fixture.githubReleaseCreated, false);

if (fixture.status === 'publish_approval_recorded') {
  assert.equal(fixture.userApprovedPublish, true);
  assert.equal(fixture.artifactSha256, 'C659660742CB0DB82524C2DCEADE4C759CE2954D992743728474CB873624D502');
  assert.ok(typeof fixture.approvalStatement === 'string' && fixture.approvalStatement.trim().length > 0, 'approvalStatement missing');
  assert.equal(fixture.recommendedNextLane, 'ALPHA9_VERSION_PACKAGE_PUBLICATION_EXECUTE_SOURCE');
} else {
  assert.equal(fixture.userApprovedPublish, false);
  assert.ok(typeof fixture.blockedReason === 'string' && fixture.blockedReason.trim().length > 0, 'blockedReason missing');
}

console.log('alpha9 version package publication publish approval smoke: PASS');
