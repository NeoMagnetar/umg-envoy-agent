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

clearRuntimeSleeveSession({ clearReason: 'cleanup prelude', includePreviousState: false, includeTrace: false });

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
assert(explicit.outputContract.contractId === 'umg.runtime.sleeve_graph.richness.v1', 'contract mismatch');
assert(explicit.neoStackSummary?.reason === 'sleeve_declares_no_neostacks', 'neoStack empty reason must be explicit');
assert((explicit.neoBlockSummary?.count ?? 0) === 7, 'expected 7 NeoBlocks for known sleeve');
assert(explicit.moltFragmentSummary, 'molt fragments should be visible');
assert(explicit.runtimeSpecSummary, 'runtimeSpec summary should exist');
assert(explicit.irMatrixSummary, 'irMatrix summary should exist');
assert(explicit.envelopeSummary, 'envelope summary should exist');
assert(explicit.toolRequestSummary, 'tool request summary should exist');
assert(explicit.diagnostics?.sourceMode, 'sourceMode should exist');
assert(explicit.diagnostics?.sourceProvenance, 'sourceProvenance should exist');
assert(typeof explicit.diagnostics?.nativeGraphAvailable === 'boolean', 'nativeGraphAvailable should exist');
assert(typeof explicit.diagnostics?.sampleFallbackUsed === 'boolean', 'sampleFallbackUsed should exist');
assert(typeof explicit.diagnostics?.legacyPreviewResidueDetected === 'boolean', 'legacyPreviewResidueDetected should exist');
assert(Array.isArray(explicit.diagnostics?.legacyPreviewResiduePaths), 'legacyPreviewResiduePaths should exist');
assert(typeof explicit.diagnostics?.routePurity === 'string', 'routePurity should exist');
assert(explicit.audit?.directSource === 'disabled', 'direct_source drift');
assert(explicit.audit?.automaticResponseTakeover === false, 'automatic response takeover drift');
assert(explicit.audit?.libraryMutation === 'not_performed', 'library mutation drift');
assert(explicit.audit?.toolExecution === 'not_performed', 'tool execution drift');

const selected = selectRuntimeSleeveSession(version, entrypoint, undefined, {
  sleeveId,
  selectionReason: 'native route cleanup smoke',
  persistenceMode: 'memory_only',
  includeInspection: true,
  includeRuntimePreview: true,
  includeTrace: true
});
assert(selected.activeSleeveId === sleeveId, 'session select failed');

const active = inspectRuntimeSleeveGraphRichness(version, entrypoint, undefined, {
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
assert(active.activeSessionUsed === true, 'active session should be used when sleeveId omitted');
assert(active.sourceSleeveId === sleeveId, 'active session sleeve should be used');

const orchestration = runBoundedReadOnlyOrchestration(version, entrypoint, undefined, {
  requestedToolName: 'umg_envoy_block_library_status',
  requestedAction: 'status_read',
  approvalDecision: 'approve',
  mode: 'approved_read_only',
  useActiveSessionSleeve: true,
  includeTrace: true
});
assert(orchestration.approvedReadOnlyExecution?.sideEffectStatus === 'read_only_no_mutation', 'orchestration drift');

clearRuntimeSleeveSession({ clearReason: 'cleanup', includePreviousState: false, includeTrace: false });

console.log(JSON.stringify({
  ok: true,
  smoke: 'alpha8-sleeve-graph-native-route-cleanup',
  checks: 18,
  sourceMode: explicit.diagnostics?.sourceMode ?? null,
  routePurity: explicit.diagnostics?.routePurity ?? null,
  legacyPreviewResidueDetected: explicit.diagnostics?.legacyPreviewResidueDetected ?? null
}, null, 2));
