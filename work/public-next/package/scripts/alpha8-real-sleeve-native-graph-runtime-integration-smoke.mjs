import {
  inspectRuntimeSleeveGraphRichness,
  clearRuntimeSleeveSession
} from '../dist/block-library-resolver.js';

const version = '0.3.0-alpha.11';
const entrypoint = 'dist/plugin-entry.js';
const nativeSleeveId = 'neomagnetar-dynamic-persona-v1';
const oldSleeveId = 'legacy-sample-contaminated-sleeve';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

clearRuntimeSleeveSession({ clearReason: 'pre-runtime-integration-smoke', includePreviousState: false, includeTrace: false });

const nativeResult = inspectRuntimeSleeveGraphRichness(version, entrypoint, undefined, {
  sleeveId: nativeSleeveId,
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

assert(nativeResult.graphStatus === 'GRAPH_READY', 'native fixture should be GRAPH_READY');
assert(nativeResult.runtimeSpecSummary?.sourceMode === 'sleeve_native', 'native fixture sourceMode drift');
assert(nativeResult.diagnostics?.routePurity === 'clean_native', 'native fixture routePurity drift');
assert(nativeResult.diagnostics?.legacyPreviewResidueDetected === false, 'native fixture legacy residue drift');
assert(nativeResult.diagnostics?.sampleFallbackUsed === false, 'native fixture sample fallback drift');
assert((nativeResult.neoStackSummary?.count ?? 0) > 0, 'native NeoStacks should be visible');
assert((nativeResult.neoBlockSummary?.count ?? 0) > 0, 'native NeoBlocks should be visible');
assert((nativeResult.moltFragmentSummary?.visibleCount ?? 0) >= 7, 'native MOLT fragments should be visible');
assert(nativeResult.toolRequestSummary?.requests?.[0]?.requestedToolName === 'umg_envoy_block_library_status', 'tool request provenance/tool name drift');
assert(nativeResult.irMatrixSummary?.routePurity === 'clean_native', 'IR matrix purity drift');
assert(nativeResult.envelopeSummary?.routePurity === 'clean_native', 'envelope purity drift');
assert(nativeResult.audit?.libraryMutation === 'not_performed', 'library mutation drift');
assert(nativeResult.audit?.directSource === 'disabled', 'direct_source drift');
assert(nativeResult.audit?.automaticResponseTakeover === false, 'automatic response takeover drift');

const oldResult = inspectRuntimeSleeveGraphRichness(version, entrypoint, undefined, {
  sleeveId: oldSleeveId,
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

assert(oldResult.runtimeSpecSummary?.sourceMode !== 'sleeve_native', 'old sleeve must not report sleeve_native');
assert(oldResult.diagnostics?.routePurity !== 'clean_native', 'old sleeve must not report clean_native');
assert(
  oldResult.runtimeSpecSummary?.sourceMode === 'sample_only' ||
  oldResult.runtimeSpecSummary?.sourceMode === 'legacy_preview' ||
  oldResult.runtimeSpecSummary?.sourceMode === 'unavailable' ||
  oldResult.diagnostics?.routePurity === 'contaminated' ||
  oldResult.diagnostics?.routePurity === 'unknown',
  'old sleeve should remain honestly non-native'
);

clearRuntimeSleeveSession({ clearReason: 'post-runtime-integration-smoke', includePreviousState: false, includeTrace: false });

console.log(JSON.stringify({
  ok: true,
  smoke: 'alpha8-real-sleeve-native-graph-runtime-integration',
  nativeGraphStatus: nativeResult.graphStatus,
  nativeSourceMode: nativeResult.runtimeSpecSummary?.sourceMode ?? null,
  nativeRoutePurity: nativeResult.diagnostics?.routePurity ?? null,
  oldSourceMode: oldResult.runtimeSpecSummary?.sourceMode ?? null,
  oldRoutePurity: oldResult.diagnostics?.routePurity ?? null
}, null, 2));
