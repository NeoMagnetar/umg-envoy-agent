import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const docPath = path.join(repoRoot, 'docs', 'ALPHA9-OPENCLAW-RUNTIME-SOURCE-MAP-EXTRACTION.md');
const fixturePath = path.join(repoRoot, 'fixtures', 'action-gates', 'openclaw-runtime-source-map-extraction-v1.json');

const docText = fs.readFileSync(docPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.ok(['source_map_sufficient_for_patch_design', 'source_map_insufficient_for_runtime_mutation'].includes(fixture.status));
assert.ok(typeof fixture.openClawRoot === 'string' && fixture.openClawRoot.length > 0);
assert.equal(fixture.runtimeFilesModified, false);
assert.equal(fixture.protocolImplemented, false);
assert.equal(fixture.liveToolCalled, false);
assert.equal(fixture.executionPerformed, false);
assert.equal(fixture.approvalGranted, false);
assert.equal(fixture.recordingPerformed, false);
assert.equal(fixture.fileWritten, false);
assert.equal(fixture.externalTransmissionPerformed, false);
assert.equal(fixture.packagePublished, false);
assert.ok(Array.isArray(fixture.runtimeSourceMapTable) && fixture.runtimeSourceMapTable.length > 0);
assert.ok(fixture.goNoGoDecision);

if (fixture.status === 'source_map_sufficient_for_patch_design') {
  assert.equal(fixture.recommendedNextLane, 'ALPHA9_OPENCLAW_PLUGIN_TOOL_CALL_PROTOCOL_PATCH_DESIGN_SOURCE');
} else {
  assert.ok(typeof fixture.blockedReason === 'string' && fixture.blockedReason.length > 0);
  assert.equal(fixture.recommendedNextLane, 'ALPHA9_OPENCLAW_RUNTIME_EXTERNAL_SOURCE_REQUEST_SOURCE');
}

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

console.log('alpha9 openclaw runtime source map extraction smoke: PASS');
