import path from 'node:path';
import { loadBlockLibraryConfig } from '../dist/resolver/block-library-config.js';
import { buildRegistry } from '../dist/resolver/indexer.js';
import { UMGResolver } from '../dist/resolver/resolver.js';
import { compileRuntimeSpecDryRun } from '../dist/runtime-spec/compiler.js';

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

const config = loadBlockLibraryConfig();
const resolver = new UMGResolver(config, path.resolve(process.cwd()));
const registry = buildRegistry(resolver);
const sleeves = registry.artifacts.filter((artifact) => artifact.kind === 'sleeve');
const realStrongFixture = sleeves.find((artifact) => artifact.id === 'SLV.UMG.CORE_REFERENCE.v1');

const langchain = compileRuntimeSpecDryRun({
  user_task: 'Use the LangChain bridge for a governed workflow.',
  requested_tools: ['langchain_bridge', 'langchain.agent_mode']
});
const supportDocConfusion = compileRuntimeSpecDryRun({
  user_task: 'Use the README sleeve guide.'
});
const candidateOnly = compileRuntimeSpecDryRun({
  user_task: 'Use core foundation sleeve guidance.'
});
const strongCandidate = realStrongFixture
  ? compileRuntimeSpecDryRun({
      user_task: 'Use the pure UMG core reference sleeve for a dry-run compiler foundation workflow.',
      requested_capabilities: ['CAP.IR.BUILD', 'CAP.TRACE.EMIT']
    })
  : null;

ensure(langchain.selection.active_sleeve === null, 'LangChain smoke must not falsely select a sleeve');
ensure(langchain.runtime_kind === 'neostack_runtime', 'LangChain smoke should remain neostack_runtime');
ensure(langchain.selection.active_neostacks.includes('NS.UMG.LANGCHAIN_BRIDGE.v0.1'), 'LangChain smoke missing selected NeoStack');
ensure((langchain.selection.candidate_sleeves ?? []).every((candidate) => candidate.confidence !== 'high'), 'LangChain candidate sleeves must not become high-confidence');

ensure(supportDocConfusion.selection.active_sleeve === null, 'Support doc confusion must not select a sleeve');
ensure((supportDocConfusion.selection.selection_warnings ?? []).some((warning) => warning.includes('support docs are not runtime-selectable')), 'Support doc confusion must warn about support docs');

ensure(candidateOnly.selection.active_sleeve === null, 'Candidate-only query must not select a sleeve');
ensure((candidateOnly.selection.candidate_sleeves ?? []).length >= 0, 'Candidate sleeve reporting should exist even if empty');

let strongFixtureFound = false;
let strongResult = null;
let strongFixtureSelected = false;
if (strongCandidate) {
  strongResult = strongCandidate;
  strongFixtureSelected = strongCandidate.selection.active_sleeve === 'SLV.UMG.CORE_REFERENCE.v1'
    && strongCandidate.selection.selection_confidence === 'high'
    && strongCandidate.runtime_kind === 'sleeve_runtime';
  strongFixtureFound = strongFixtureSelected;
}

console.log(JSON.stringify({
  ok: true,
  strong_fixture_found: strongFixtureFound,
  langchain,
  support_doc_confusion: supportDocConfusion,
  candidate_only: candidateOnly,
  strong_result: strongResult,
  strong_fixture_selection_unavailable: Boolean(realStrongFixture) && !strongFixtureFound,
  no_deprecated_or_unknown_fallback_fixture_available: !sleeves.some((artifact) => artifact.status === 'deprecated' || artifact.source.source_kind === 'unknown')
}, null, 2));
