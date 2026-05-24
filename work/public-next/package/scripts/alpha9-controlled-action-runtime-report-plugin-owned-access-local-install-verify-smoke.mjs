import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-PLUGIN-OWNED-ACCESS-LOCAL-INSTALL-VERIFY.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'controlled-action-runtime-report-plugin-owned-access-local-install-verify-v1.json');

assert.ok(fs.existsSync(docPath), 'docs missing');
assert.ok(fs.existsSync(fixturePath), 'fixture missing');

const doc = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.ok(['local_install_verified', 'local_install_verify_blocked'].includes(fixture.status), 'invalid status');
assert.equal(fixture.sourceCommit, 'd08ea3bc42c5b3e46f97c62ea880acf03ddb0e1f');
assert.equal(fixture.installedPluginPath, 'C:\\Users\\Magne\\.openclaw\\extensions\\umg-envoy-agent');
assert.equal(fixture.executionPerformed, false);
assert.equal(fixture.approvalGranted, false);
assert.equal(fixture.recordingPerformed, false);
assert.equal(fixture.externalTransmissionPerformed, false);
assert.equal(fixture.packagePublished, false);

if (fixture.status === 'local_install_verified') {
  assert.equal(fixture.backupCreated, true);
  assert.equal(fixture.localPromotionPerformed, true);
  assert.equal(fixture.pluginLoaded, true);
  assert.equal(fixture.installedAccessFilePresent, true);
  assert.equal(fixture.installedPluginEntryReferencesAccess, true);
}

for (const forbidden of [
  'ready_to_execute',
  'can_execute',
  'approved_for_execution',
  'execution_allowed',
  'approval_granted',
  'grant_execution',
  'authorize_execution',
]) {
  assert.equal(doc.includes(forbidden), false, `forbidden term in docs: ${forbidden}`);
  assert.equal(JSON.stringify(fixture).includes(forbidden), false, `forbidden term in fixture: ${forbidden}`);
}

const principle = 'The controlled-action runtime report plugin-owned access local install verification does not publish packages, patch OpenClaw core, grant approval, record live decisions, execute actions, enable writes, enable bridge actions, or mutate runtime outside the local installed Envoy plugin promotion needed for verification.';
assert.ok(doc.includes(principle), 'missing required principle');

console.log('alpha9 controlled action runtime report plugin-owned access local install verify smoke: PASS');
