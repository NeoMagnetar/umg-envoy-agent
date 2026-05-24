import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-PUBLIC-LISTING-METADATA-ALIGNMENT.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'alpha9-public-listing-metadata-alignment-v1.json');
const readmePath = path.join(repoRoot, 'README.md');

assert.ok(fs.existsSync(docPath), 'docs missing');
assert.ok(fs.existsSync(fixturePath), 'fixture missing');
assert.ok(fs.existsSync(readmePath), 'README missing');

const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const readme = fs.readFileSync(readmePath, 'utf8');

assert.equal(fixture.status, 'metadata_aligned_primary_listing');
assert.equal(fixture.packageName, 'umg-envoy-agent');
assert.equal(fixture.packageVersion, '0.3.0-alpha.13');
assert.equal(fixture.packageJsonVersionAligned, true);
assert.equal(fixture.pluginManifestVersionAligned, true);
assert.equal(fixture.readmeHeaderAligned, true);
assert.equal(fixture.clawHubCurrentVersion, '0.3.0-alpha.13');
assert.equal(fixture.clawHubLatestTag, '0.3.0-alpha.13');
assert.equal(fixture.readmeRemovedNextTargetWording, true);
assert.equal(fixture.readmeReducedExecutionWordingConfusion, true);
assert.equal(fixture.readmeReleaseLedgerPathAdjusted, true);
assert.equal(fixture.runtimeBehaviorChanged, false);
assert.equal(fixture.sourceBehaviorChanged, false);
assert.equal(fixture.distChanged, false);
assert.equal(fixture.installedPluginModified, false);
assert.equal(fixture.npmRepublishExecuted, false);
assert.equal(fixture.clawHubPublishExecuted, false);
assert.equal(fixture.releaseTagCreated, false);
assert.equal(fixture.githubReleaseCreated, false);
assert.ok(readme.includes('current package target: `umg-envoy-agent@0.3.0-alpha.13`'), 'install wording not updated');
assert.equal(readme.includes('next source/package target'), false, 'stale next-target wording still present');
assert.equal(readme.includes('../RELEASE_LEDGER.md'), false, 'stale ledger path still present');
console.log('alpha9 public listing metadata alignment smoke: PASS');