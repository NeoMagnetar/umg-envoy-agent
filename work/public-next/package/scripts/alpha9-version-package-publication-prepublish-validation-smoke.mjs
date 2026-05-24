import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-VERSION-PACKAGE-PUBLICATION-PREPUBLISH-VALIDATION.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'alpha9-version-package-publication-prepublish-validation-v1.json');

assert.ok(fs.existsSync(docPath), 'docs missing');
assert.ok(fs.existsSync(fixturePath), 'fixture missing');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.ok(['prepublish_validation_passed', 'prepublish_validation_blocked'].includes(fixture.status), 'invalid status');
assert.equal(fixture.baselineCommit, 'ca46f5b178fbbd856e9f0d44f4ff5d62dc78e01d');
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

if (fixture.status === 'prepublish_validation_passed') {
  assert.equal(fixture.packageJsonVersionConfirmed, true);
  assert.equal(fixture.openclawPluginVersionConfirmed, true);
  assert.equal(fixture.readmePublicSummaryAligned, true);
  assert.equal(fixture.buildPassed, true);
  assert.equal(fixture.validateAlphaCurrentPassed, true);
  assert.equal(fixture.dryPackPassed, true);
  assert.equal(fixture.packageContentAuditPassed, true);
  assert.equal(fixture.forbiddenFilesExcluded, true);
  assert.equal(fixture.publicClaimsAudited, true);
  assert.equal(fixture.liveCallProof, 'not_available_from_current_cli_surface');
  assert.equal(fixture.recommendedNextLane, 'ALPHA9_VERSION_PACKAGE_PUBLICATION_STAGE_PACKAGE_SOURCE');
} else {
  assert.ok(typeof fixture.blockedReason === 'string' && fixture.blockedReason.trim().length > 0, 'blockedReason missing');
  assert.equal(fixture.recommendedNextLane, 'ALPHA9_VERSION_PACKAGE_PUBLICATION_PREPUBLISH_FIX_SOURCE');
}

for (const forbidden of ['ready_to_execute', 'can_execute', 'approved_for_execution', 'execution_allowed', 'approval_granted', 'grant_execution', 'authorize_execution']) {
  assert.equal(doc.includes(forbidden), false, `forbidden term in docs: ${forbidden}`);
  assert.equal(JSON.stringify(fixture).includes(forbidden), false, `forbidden term in fixture: ${forbidden}`);
}

const principle = 'This lane validates the aligned `0.3.0-alpha.13` package before any staging, npm publish, ClawHub publish, release tag, or GitHub release.';
assert.ok(doc.includes(principle), 'purpose statement missing');
assert.ok(doc.includes('Direct live CLI invocation proof remains:'), 'known caveat missing');

console.log('alpha9 version package publication prepublish validation smoke: PASS');
