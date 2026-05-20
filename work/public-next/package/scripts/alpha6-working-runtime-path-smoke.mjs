import entry from '../dist/plugin-entry.js';

const defs = [];
await entry.register({ registerTool(def){ defs.push(def); }, registerCli(){} }, {});
for (const name of [
  'umg_envoy_block_library_sleeve_graph_drilldown',
  'umg_envoy_sleeve_select',
  'umg_envoy_sleeve_resolve',
  'umg_envoy_runtime_compile',
  'umg_envoy_runtime_preview',
  'umg_envoy_block_library_sleeve_graph_index',
  'umg_envoy_block_library_response_envelope_fragment',
  'umg_envoy_block_library_active_stack_projection'
]) {
  if (!defs.find(d => d.name === name)) throw new Error(`${name} missing`);
}
const byName = (name) => defs.find(d => d.name === name);
const run = async (name, input) => JSON.parse((await byName(name).execute(input)).content[0].text);

const drill = await run('umg_envoy_block_library_sleeve_graph_drilldown', { sleeveId: 'neomagnetar-dynamic-persona-v1' });
if (!drill.ok || drill.outputContract.contractId !== 'umg.sleeve_graph.drilldown.v1' || drill.drilldownStatus !== 'SLEEVE_DRILLDOWN_READY') throw new Error('drilldown failed');
const drillMissing = await run('umg_envoy_block_library_sleeve_graph_drilldown', { sleeveId: 'missing-sleeve' });
if (drillMissing.ok || drillMissing.drilldownStatus !== 'SLEEVE_NOT_FOUND') throw new Error('drilldown missing hold failed');

const select = await run('umg_envoy_sleeve_select', { sleeveId: 'neomagnetar-dynamic-persona-v1', selectionMode: 'explicit', runtimeSessionId: 'alpha6-smoke' });
if (!select.ok || select.selectionStatus !== 'SLEEVE_SELECTED') throw new Error('selection failed');
const selectMissing = await run('umg_envoy_sleeve_select', { sleeveId: 'missing-sleeve', selectionMode: 'explicit', runtimeSessionId: 'alpha6-smoke' });
if (selectMissing.ok || selectMissing.selectionStatus !== 'SLEEVE_NOT_FOUND') throw new Error('selection missing failed');

const resolvedRef = await run('umg_envoy_sleeve_resolve', { sleeveId: 'neomagnetar-dynamic-persona-v1', resolveDepth: 'reference_only' });
if (!resolvedRef.ok || !['RESOLVED','PARTIAL'].includes(resolvedRef.resolutionStatus)) throw new Error('reference resolve failed');
const resolvedVisible = await run('umg_envoy_sleeve_resolve', { sleeveId: 'neomagnetar-dynamic-persona-v1', resolveDepth: 'molt_visible' });
if (!resolvedVisible.ok || !['RESOLVED','PARTIAL'].includes(resolvedVisible.resolutionStatus)) throw new Error('visible resolve failed');

const compiled = await run('umg_envoy_runtime_compile', { sleeveId: 'neomagnetar-dynamic-persona-v1', resolveDepth: 'molt_visible', strictness: 'dev' });
if (!['COMPILED','PARTIAL'].includes(compiled.compileStatus) || compiled.runtimeSpecVersion !== 'RuntimeSpecV0') throw new Error('compile failed');

const preview = await run('umg_envoy_runtime_preview', { sleeveId: 'neomagnetar-dynamic-persona-v1', previewFormat: 'full' });
if (!['RUNTIME_PREVIEW_READY','PARTIAL'].includes(preview.previewStatus)) throw new Error('preview failed');
if (preview.executionStatus !== 'not_performed') throw new Error('execution status drift');
if (!preview.runtimeSpec) throw new Error('runtimeSpec missing');
if (!preview.activeStackProjection) throw new Error('activeStack missing');
if (!preview.responseEnvelopePreview) throw new Error('envelope preview missing');
if (JSON.stringify(preview).includes('RangeError') || JSON.stringify(preview).includes('Maximum call stack size exceeded')) throw new Error('recursion regression');

const clear = await run('umg_envoy_sleeve_select', { selectionMode: 'clear', runtimeSessionId: 'alpha6-smoke' });
if (!clear.ok || clear.selectionStatus !== 'SELECTION_CLEARED') throw new Error('clear selection failed');
const previewNoSelection = await run('umg_envoy_runtime_preview', { runtimeSessionId: 'alpha6-smoke' });
if (previewNoSelection.ok || previewNoSelection.previewStatus !== 'HELD') throw new Error('preview no selection hold failed');

console.log(JSON.stringify({ ok: true, drill, select, resolvedRef, resolvedVisible, compiled, preview, previewNoSelection }, null, 2));
