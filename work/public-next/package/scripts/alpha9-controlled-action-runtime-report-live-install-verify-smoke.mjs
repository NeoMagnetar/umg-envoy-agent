import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-LIVE-INSTALL-VERIFY.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'controlled-action-runtime-report-live-install-verify-v1.json');

const docText = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.ok(['live_verified', 'live_verify_blocked'].includes(fixture.status));
assert.equal(fixture.sourceCommit, '0b4442125ebe3a9d4e818c0bc92ec4d8ca6d0743');
assert.equal(fixture.toolName, 'umg_envoy_controlled_action_runtime_report');
assert.equal(fixture.executionPerformed, false);
assert.equal(fixture.approvalGranted, false);
assert.equal(fixture.recordingPerformed, false);
assert.equal(fixture.liveDecisionRecorded, false);
assert.equal(fixture.fileWritten, false);
assert.equal(fixture.externalTransmissionPerformed, false);
assert.equal(fixture.packagePublished, false);
assert.equal(fixture.directSourceEnabled, false);
assert.equal(fixture.automaticResponseTakeoverEnabled, false);
assert.ok(docText.includes('Gateway process'));
assert.ok(docText.includes('Active installed plugin path'));
assert.ok(docText.includes('Remaining blocker'));

const forbiddenCorpus = `${docText}\n${JSON.stringify(fixture)}`;
for (const forbidden of [
  'ready_to_execute',
  'can_execute',
  'approved_for_execution',
  'execution_allowed',
  'approval_granted',
  'grant_execution',
  'authorize_execution',
]) {
  assert.equal(forbiddenCorpus.includes(forbidden), false, `forbidden term present: ${forbidden}`);
}

console.log('alpha9 controlled action runtime report live install verify smoke: PASS');
