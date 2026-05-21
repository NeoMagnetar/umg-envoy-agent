import {
  clearRuntimeSleeveSession,
  inspectRuntimeSleeveGraphRichness,
  runBoundedReadOnlyOrchestration,
  selectRuntimeSleeveSession
} from '../dist/block-library-resolver.js';

const version = '0.3.0-alpha.10';
const entrypoint = 'dist/plugin-entry.js';
const sleeveId = 'neomagnetar-dynamic-persona-v1';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

clearRuntimeSleeveSession({ clearReason: 'pre-smoke reset', includePreviousState: false, includeTrace: false });

const blocked = inspectRuntimeSleeveGraphRichness(version, entrypoint, undefined, {
  useActiveSessionSleeve: true,
  includeNeoStacks: true,
  includeNeoBlocks: true,
  includeMoltFragments: true,
  includeToolRequests: true,
  includeRuntimeSpec: true,
  includeIrMatrix: true,
  includeEnvelope: true,
  includeDiagnostics: true,
  includeTrace: true
});
assert(blocked.outputContract.contractId === 'umg.runtime.sleeve_graph.richness.v1', 'contract mismatch');
assert(blocked.graphStatus === 'GRAPH_BLOCKED', 'no-active-sleeve should block');

const explicit = inspectRuntimeSleeveGraphRichness(version, entrypoint, undefined, {
  sleeveId,
  includeNeoStacks: true,
  includeNeoBlocks: true,
  includeMoltFragments: true,
  includeToolRequests: true,
  includeRuntimeSpec: true,
  includeIrMatrix: true,
  includeEnvelope: true,
  includeDiagnostics: true,
  includeTrace: true
});
assert(explicit.outputContract.contractId === 'umg.runtime.sleeve_graph.richness.v1', 'explicit contract mismatch');
assert(explicit.sourceSleeveId === sleeveId, 'explicit sleeve inspect failed');
assert(explicit.neoStackSummary?.reason === 'sleeve_declares_no_neostacks', 'neoStack empty reason must be explicit');
assert((explicit.neoBlockSummary?.count ?? 0) > 0, 'neoBlocks should resolve');
assert((explicit.moltFragmentSummary?.visibleCount ?? 0) >= 0, 'molt fragment summary should exist');
assert(explicit.runtimeSpecSummary?.runtimeSpecId, 'runtimeSpec summary missing');
assert(explicit.irMatrixSummary?.matrixId, 'irMatrix summary missing');
assert(explicit.envelopeSummary?.envelopeStatus, 'envelope summary missing');
assert(typeof explicit.toolRequestSummary?.requestCount === 'number', 'tool request summary missing');
assert(explicit.graphCompleteness, 'graphCompleteness missing');
assert(explicit.audit?.libraryMutation === 'not_performed', 'library mutation drift');
assert(explicit.audit?.toolExecution === 'not_performed', 'tool execution drift');
assert(explicit.audit?.directSource === 'disabled', 'direct_source drift');
assert(explicit.audit?.automaticResponseTakeover === false, 'automatic response takeover drift');

const selected = selectRuntimeSleeveSession(version, entrypoint, undefined, {
  sleeveId,
  selectionReason: 'graph richness smoke',
  persistenceMode: 'memory_only',
  includeInspection: true,
  includeRuntimePreview: true,
  includeTrace: true
});
assert(selected.activeSleeveId === sleeveId, 'session select failed');

const activeSession = inspectRuntimeSleeveGraphRichness(version, entrypoint, undefined, {
  useActiveSessionSleeve: true,
  includeNeoStacks: true,
  includeNeoBlocks: true,
  includeMoltFragments: true,
  includeToolRequests: true,
  includeRuntimeSpec: true,
  includeIrMatrix: true,
  includeEnvelope: true,
  includeDiagnostics: true,
  includeTrace: true
});
assert(activeSession.sourceSleeveId === sleeveId, 'active session sleeve inspect failed');
assert(activeSession.activeSessionUsed === true, 'activeSessionUsed should be true when sleeveId omitted');

const orchestration = runBoundedReadOnlyOrchestration(version, entrypoint, undefined, {
  requestedToolName: 'umg_envoy_block_library_status',
  requestedAction: 'status_read',
  approvalDecision: 'approve',
  mode: 'approved_read_only',
  useActiveSessionSleeve: true,
  includeTrace: true
});
assert(orchestration.sourceSleeveId === sleeveId, 'bounded orchestration should still use active session sleeve');
assert(orchestration.approvedReadOnlyExecution?.sideEffectStatus === 'read_only_no_mutation', 'bounded orchestration read-only drift');

clearRuntimeSleeveSession({ clearReason: 'post-smoke cleanup', includePreviousState: false, includeTrace: false });

console.log(JSON.stringify({
  ok: true,
  smoke: 'alpha8-sleeve-graph-richness',
  checks: 20,
  graphCompleteness: explicit.graphCompleteness,
  neoStackReason: explicit.neoStackSummary?.reason ?? null,
  neoBlockCount: explicit.neoBlockSummary?.count ?? 0,
  audit: explicit.audit
}, null, 2));
