import entry from '../dist/plugin-entry.js';
import fs from 'node:fs';

const defs = [];
await entry.register({ registerTool(def){ defs.push(def); }, registerCli(){} }, {});
for (const name of ['umg_envoy_block_library_response_envelope_fragment','umg_envoy_block_library_active_stack_projection','umg_envoy_block_library_sleeve_graph_index']) {
  if (!defs.find(d => d.name === name)) throw new Error(`${name} missing`);
}
const tool = defs.find(d => d.name === 'umg_envoy_block_library_sleeve_graph_index');
const run = async (input) => JSON.parse((await tool.execute(input)).content[0].text);

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
if (pkg.version !== '0.3.0-alpha.7') throw new Error('version drift');
if (pkg.main !== 'dist/plugin-entry.js') throw new Error('official entrypoint drift');
const pluginSrc = fs.readFileSync(new URL('../src/plugin-entry.ts', import.meta.url), 'utf8');
if (!pluginSrc.includes('getBlockLibrarySleeveGraphIndex')) throw new Error('source entry missing sleeve graph index import');
if (!pluginSrc.includes('umg_envoy_block_library_response_envelope_fragment')) throw new Error('response envelope registration drift');
if (!pluginSrc.includes('umg_envoy_block_library_active_stack_projection')) throw new Error('active stack registration drift');

const allowedStatuses = new Set([
  'SLEEVE_GRAPH_INDEX_READY',
  'SLEEVE_GRAPH_INDEX_READY_WITH_WARNINGS',
  'SLEEVE_GRAPH_INDEX_EMPTY',
  'SLEEVE_GRAPH_INDEX_DENIED',
  'SLEEVE_GRAPH_INDEX_UNAVAILABLE'
]);

const base = await run({});
if (!base.ok) throw new Error('default graph index failed');
if (base.outputContract.contractId !== 'umg.sleeve_graph.index.v1') throw new Error('contractId drift');
if (base.outputContract.contractStatus !== 'NORMALIZED') throw new Error('contractStatus drift');
if (!allowedStatuses.has(base.sleeveGraphIndex.indexStatus)) throw new Error('indexStatus drift');
if (base.outputContract.activation !== false) throw new Error('activation drift');
if (base.outputContract.recursiveLoad !== false) throw new Error('recursiveLoad drift');
if (base.outputContract.fullLibraryScan !== false) throw new Error('fullLibraryScan drift');
if (base.outputContract.payloadLoading !== 'catalog_or_manifest_only') throw new Error('payloadLoading drift');
for (const label of ['Sleeve Graph Index:','- Sleeve Count:','- Activation:','- Recursive Load:','- Full Library Scan:']) {
  if (!base.nlProjection.includes(label)) throw new Error(`missing projection label ${label}`);
}
if (!base.sleeveGraphIndex.referenceSummary) throw new Error('referenceSummary missing');
if (!base.sleeveGraphIndex.policySummary) throw new Error('policySummary missing');
if (base.readOnly !== true || base.execution !== 'not_performed' || base.directSource !== 'not_enabled') throw new Error('safety drift');
if (base.audit.sleeveActivation !== 'not_performed') throw new Error('sleeveActivation audit drift');
if (base.audit.activeSleeveMutation !== 'not_performed') throw new Error('activeSleeveMutation audit drift');
if (base.audit.neoStackPayloadLoading !== 'not_performed') throw new Error('neoStackPayloadLoading audit drift');
if (base.audit.neoBlockRecursiveLoading !== 'not_performed') throw new Error('neoBlockRecursiveLoading audit drift');
if (base.audit.externalMoltBlockFileLoading !== 'not_performed') throw new Error('externalMoltBlockFileLoading audit drift');
if (base.audit.graphTraversal !== 'not_performed') throw new Error('graphTraversal audit drift');
if (base.audit.recursiveFullLibraryLoad !== 'not_performed') throw new Error('recursiveFullLibraryLoad audit drift');
if (base.audit.fullLibraryScan !== 'not_performed') throw new Error('fullLibraryScan audit drift');
if (base.audit.triggerEvaluation !== 'not_performed') throw new Error('triggerEvaluation audit drift');
if (base.audit.libraryMutation !== 'not_performed') throw new Error('libraryMutation audit drift');
if (base.audit.publish !== 'not_performed') throw new Error('publish audit drift');
if (base.audit.package !== 'not_performed') throw new Error('package audit drift');

const autoCatalog = await run({ sourceCatalog: 'auto' });
if (!autoCatalog.ok) throw new Error('sourceCatalog=auto failed');

const focus = await run({ sleeveId: 'neomagnetar-dynamic-persona-v1' });
if (focus.ok) {
  if (focus.sleeveGraphIndex.focusedSleeveId !== 'neomagnetar-dynamic-persona-v1') throw new Error('focusedSleeveId drift');
  const hit = focus.sleeveGraphIndex.sleeves.find(s => s.sleeveId === 'neomagnetar-dynamic-persona-v1');
  if (!hit) throw new Error('focused sleeve missing');
  if (hit.activationState !== 'not_active') throw new Error('activationState drift');
  if (hit.graphStatus !== 'INDEXED_REFERENCE_ONLY') throw new Error('graphStatus drift');
} else if (!focus.errors.some(e => e.code === 'HOLD_SLEEVE_GRAPH_INDEX_SLEEVE_NOT_FOUND')) {
  throw new Error('focused sleeve hold drift');
}

const badCatalog = await run({ sourceCatalog: 'nonsense' });
if (!badCatalog.errors.some(e => e.code === 'HOLD_SLEEVE_GRAPH_INDEX_SOURCE_CATALOG_UNSUPPORTED')) throw new Error('bad catalog hold drift');
const badProjection = await run({ projectionFormat: 'nonsense' });
if (!badProjection.errors.some(e => e.code === 'HOLD_SLEEVE_GRAPH_INDEX_PROJECTION_FORMAT_UNSUPPORTED')) throw new Error('bad projection hold drift');
const raw = await run({ includeRaw: true });
if (!raw.errors.some(e => e.code === 'HOLD_RAW_TARGET_DUMP_NOT_SUPPORTED')) throw new Error('raw hold drift');

console.log(JSON.stringify({ ok: true, base, autoCatalog, focus }, null, 2));

