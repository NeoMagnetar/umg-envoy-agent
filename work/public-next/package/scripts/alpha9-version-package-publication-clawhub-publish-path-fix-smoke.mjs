import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-VERSION-PACKAGE-PUBLICATION-CLAWHUB-PUBLISH-PATH-FIX.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'alpha9-version-package-publication-clawhub-publish-path-fix-v1.json');

assert.ok(fs.existsSync(docPath), 'docs missing');
assert.ok(fs.existsSync(fixturePath), 'fixture missing');

const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
assert.equal(fixture.status, 'clawhub_publish_path_fixed');
assert.equal(fixture.packageName, 'umg-envoy-agent');
assert.equal(fixture.packageVersion, '0.3.0-alpha.13');
assert.equal(fixture.failedPublishError, 'package.json required');
assert.equal(fixture.artifactHashVerified, true);
assert.equal(fixture.correctPublishPathHasPackageJson, true);
assert.equal(fixture.correctPublishPathHasPluginManifest, true);
assert.equal(fixture.correctPublishPathHasReadme, true);
assert.ok(typeof fixture.proposedFixedClawHubPublishCommand === 'string' && fixture.proposedFixedClawHubPublishCommand.length > 0, 'fixed command missing');
assert.equal(fixture.clawHubPublishExecuted, false);
assert.equal(fixture.clawHubPublished, false);
console.log('alpha9 clawhub publish path fix smoke: PASS');