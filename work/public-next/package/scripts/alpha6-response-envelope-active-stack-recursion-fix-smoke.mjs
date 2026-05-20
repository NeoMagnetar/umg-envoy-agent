import fs from 'node:fs';
import entry from '../dist/plugin-entry.js';

const defs = [];
await entry.register({ registerTool(def){ defs.push(def); }, registerCli(){} }, {});
for (const name of ['umg_envoy_block_library_response_envelope_fragment','umg_envoy_block_library_active_stack_projection','umg_envoy_block_library_sleeve_graph_index']) {
  if (!defs.find(d => d.name === name)) throw new Error(`${name} missing`);
}
const envelopeTool = defs.find(d => d.name === 'umg_envoy_block_library_response_envelope_fragment');
const activeTool = defs.find(d => d.name === 'umg_envoy_block_library_active_stack_projection');
const sleeveTool = defs.find(d => d.name === 'umg_envoy_block_library_sleeve_graph_index');
const runEnvelope = async (input) => JSON.parse((await envelopeTool.execute(input)).content[0].text);
const runActive = async (input) => JSON.parse((await activeTool.execute(input)).content[0].text);
const runSleeve = async (input) => JSON.parse((await sleeveTool.execute(input)).content[0].text);

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
if (pkg.version !== '0.3.0-alpha.8') throw new Error('version drift');
if (pkg.main !== 'dist/plugin-entry.js') throw new Error('entrypoint drift');
const src = fs.readFileSync(new URL('../src/plugin-entry.ts', import.meta.url), 'utf8');
if (!src.includes('getBlockLibraryResponseEnvelopeFragment')) throw new Error('response envelope source missing');
if (!src.includes('getBlockLibraryActiveStackProjection')) throw new Error('active stack source missing');
if (!src.includes('getBlockLibrarySleeveGraphIndex')) throw new Error('sleeve graph source missing');

const ids = ['trigger.sample','directive.sample','instruction.sample','subject.sample','primary.sample','philosophy.sample','blueprint.sample'];
const full = await runEnvelope({ neoblockIds: ids, currentState: 'ALPHA6_RECURSION_FIX_FULL' });
if (!full.ok) throw new Error('full envelope failed');
if (full.outputContract.contractId !== 'umg.response_envelope.fragment.v1') throw new Error('response envelope contract drift');
if (full.outputContract.contractStatus !== 'NORMALIZED') throw new Error('response envelope status drift');
if (full.outputContract.automaticResponseTakeover !== false) throw new Error('automatic takeover drift');
if (!full.sourceActiveStackProjection?.ok) throw new Error('integrated active stack missing');
if (full.sourceActiveStackProjection.activeStackProjection.sourceContract !== 'umg.molt_map.compose.v1') throw new Error('active stack still points at envelope');
if (full.sourceActiveStackProjection.activeStackProjection.sourceContextStatus !== 'SOURCE_CONTEXT_NORMALIZED' && full.sourceActiveStackProjection.activeStackProjection.sourceContextStatus !== 'SOURCE_CONTEXT_NOT_EVALUATED_TO_AVOID_RECURSION') throw new Error('sourceContextStatus drift');
if (JSON.stringify(full).includes('RangeError')) throw new Error('range error leaked');
if (JSON.stringify(full).includes('Maximum call stack size exceeded')) throw new Error('call stack leak');

const active = await runActive({ neoblockIds: ids, currentState: 'ALPHA6_RECURSION_FIX_ACTIVE' });
if (!active.ok) throw new Error('active stack with source context failed');
if (active.activeStackProjection.sourceContract !== 'umg.molt_map.compose.v1') throw new Error('active stack source contract drift');
if (active.sourceEnvelope !== null) throw new Error('active stack must not call response envelope');
if (!active.sourceComposition || active.sourceComposition.outputContract.contractId !== 'umg.molt_map.compose.v1') throw new Error('active stack composer context missing');
if (active.activeStackProjection.sourceContextStatus !== 'SOURCE_CONTEXT_NORMALIZED') throw new Error('active stack source context not normalized');

const integration = await runEnvelope({ neoblockIds: ids, currentState: 'ALPHA6_RESPONSE_ENVELOPE_ACTIVE_STACK_INTEGRATED' });
if (!integration.ok) throw new Error('integration failed after fix');

const sleeve = await runSleeve({});
if (!sleeve.ok) throw new Error('sleeve graph index failed after fix');

for (const result of [full, active, integration, sleeve]) {
  const txt = JSON.stringify(result);
  if (txt.includes('RangeError')) throw new Error('RangeError surfaced');
  if (txt.includes('Maximum call stack size exceeded')) throw new Error('stack overflow surfaced');
}
if (full.readOnly !== true || full.execution !== 'not_performed' || full.directSource !== 'not_enabled') throw new Error('response envelope safety drift');
if (active.readOnly !== true || active.execution !== 'not_performed' || active.directSource !== 'not_enabled') throw new Error('active stack safety drift');
if (active.audit.neostackInspection !== 'not_performed') throw new Error('neostack inspection drift');
if (active.audit.graphTraversal !== 'not_performed') throw new Error('graph traversal drift');
if (active.audit.recursiveLoad !== 'not_performed') throw new Error('recursive load drift');
if (active.audit.fullLibraryScan !== 'not_performed') throw new Error('full library scan drift');
if (active.audit.referencedTargetLoading !== 'not_performed') throw new Error('referenced target loading drift');
if (active.audit.externalMoltBlockFileLoading !== 'not_performed') throw new Error('external MOLT drift');
if (active.audit.triggerEvaluation !== 'not_performed') throw new Error('trigger evaluation drift');
if (active.audit.libraryMutation !== 'not_performed') throw new Error('library mutation drift');

console.log(JSON.stringify({ ok: true, full, active, integration, sleeve }, null, 2));

