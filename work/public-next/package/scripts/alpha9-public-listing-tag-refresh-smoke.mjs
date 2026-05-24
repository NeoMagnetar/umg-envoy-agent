import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-PUBLIC-LISTING-TAG-REFRESH.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'alpha9-public-listing-tag-refresh-v1.json');

assert.ok(fs.existsSync(docPath), 'docs missing');
assert.ok(fs.existsSync(fixturePath), 'fixture missing');

const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
assert.equal(fixture.status, 'tag_refresh_not_supported_from_visible_cli_surface');
assert.equal(fixture.packageName, 'umg-envoy-agent');
assert.equal(fixture.packageVersion, '0.3.0-alpha.13');
assert.equal(fixture.clawHubCurrentVersion, '0.3.0-alpha.13');
assert.equal(fixture.clawHubLatestTag, '0.3.0-alpha.13');
assert.equal(fixture.tagVersionDriftVisible, true);
assert.equal(fixture.tagSourceFoundInPackageJson, false);
assert.equal(fixture.tagSourceFoundInPluginManifest, false);
assert.equal(fixture.metadataOnlyTagRefreshSupported, false);
assert.equal(fixture.alpha14Required, false);
assert.equal(fixture.runtimeBehaviorChanged, false);
assert.equal(fixture.sourceBehaviorChanged, false);
assert.equal(fixture.distChanged, false);
assert.equal(fixture.installedPluginModified, false);
assert.equal(fixture.npmRepublishExecuted, false);
assert.equal(fixture.clawHubPublishExecuted, false);
assert.equal(fixture.releaseTagCreated, false);
assert.equal(fixture.githubReleaseCreated, false);
console.log('alpha9 public listing tag refresh smoke: PASS');