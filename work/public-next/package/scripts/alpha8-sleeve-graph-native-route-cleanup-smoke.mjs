import {
  clearRuntimeSleeveSession,
  inspectRuntimeSleeveGraphRichness,
  runBoundedReadOnlyOrchestration,
  selectRuntimeSleeveSession
} from '../dist/block-library-resolver.js';

const version = '0.3.0-alpha.11';
const entrypoint = 'dist/plugin-entry.js';
const sleeveId = 'neomagnetar-dynamic-persona-v1';
const legacySleeveId = 'legacy-sample-contaminated-sleeve';

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
assert((explicit.neoStackSummary?.count ?? 0) === 2, 'clean native fixture should expose 2 NeoStacks');
assert(!explicit.neoStackSummary?.reason, 'clean native fixture should not report empty NeoStack reason');
assert((explicit.neoBlockSummary?.count ?? 0) === 7, 'expected 7 NeoBlocks for known sleeve');
assert((explicit.moltFragmentSummary?.visibleCount ?? 0) > 0, 'molt fragments should be visible');
assert((explicit.toolRequestSummary?.requestCount ?? 0) > 0, 'tool requests should be visible');
assert(explicit.runtimeSpecSummary?.sourceMode === 'sleeve_native', 'clean native fixture should be sleeve_native');
assert(explicit.diagnostics?.routePurity === 'clean_native', 'clean native fixture should be clean_native');
assert(explicit.diagnostics?.legacyPreviewResidueDetected === false, 'clean native fixture should not report legacy residue');
assert(explicit.diagnostics?.sampleFallbackUsed === false, 'clean native fixture should not report sample fallback');
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

const legacy = inspectRuntimeSleeveGraphRichness(version, entrypoint, undefined, {
  sleeveId: legacySleeveId,
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
assert(legacy.runtimeSpecSummary?.sourceMode !== 'sleeve_native', 'legacy path must not report sleeve_native');
assert(legacy.diagnostics?.routePurity !== 'clean_native', 'legacy path must not report clean_native');
assert(
  legacy.runtimeSpecSummary?.sourceMode === 'sample_only' ||
  legacy.runtimeSpecSummary?.sourceMode === 'legacy_preview' ||
  legacy.runtimeSpecSummary?.sourceMode === 'unavailable' ||
  legacy.diagnostics?.routePurity === 'contaminated' ||
  legacy.diagnostics?.routePurity === 'unknown',
  'legacy path should remain explicitly non-native'
);

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
  checks: 24,
  nativeSourceMode: explicit.diagnostics?.sourceMode ?? null,
  nativeRoutePurity: explicit.diagnostics?.routePurity ?? null,
  nativeNeoStackCount: explicit.neoStackSummary?.count ?? null,
  legacySourceMode: legacy.runtimeSpecSummary?.sourceMode ?? null,
  legacyRoutePurity: legacy.diagnostics?.routePurity ?? null
}, null, 2));
