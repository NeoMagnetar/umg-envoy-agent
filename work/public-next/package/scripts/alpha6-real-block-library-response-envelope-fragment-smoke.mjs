import entry from '../dist/plugin-entry.js';
const defs = [];
await entry.register({ registerTool(def){ defs.push(def); }, registerCli(){} }, {});
for (const name of ['umg_envoy_block_library_molt_map_compose','umg_envoy_block_library_response_envelope_fragment']) {
  if (!defs.find(d => d.name === name)) throw new Error(`${name} missing`);
}
const tool = defs.find(d => d.name === 'umg_envoy_block_library_response_envelope_fragment');
const run = async (input) => JSON.parse((await tool.execute(input)).content[0].text);
const full = await run({ neoblockIds: ['trigger.sample','directive.sample','instruction.sample','subject.sample','primary.sample','philosophy.sample','blueprint.sample'], currentState: 'ALPHA6_MOLT_MAP_COMPOSER_OUTPUT_NORMALIZED' });
if (!full.ok) throw new Error('full envelope failed');
if (full.outputContract.contractId !== 'umg.response_envelope.fragment.v1') throw new Error('contractId drift');
if (full.outputContract.contractStatus !== 'NORMALIZED') throw new Error('contractStatus drift');
if (full.sourceComposition.outputContract.contractId !== 'umg.molt_map.compose.v1') throw new Error('source contract drift');
if (full.responseEnvelopeFragment.fragmentStatus !== 'RESPONSE_ENVELOPE_FRAGMENT_READY') throw new Error('fragmentStatus drift');
if (full.responseEnvelopeFragment.automaticResponseTakeover !== false) throw new Error('automatic takeover drift');
for (const label of ['Active Stack:','Envoy Intuition:','Current Context — MOLT Map:','Formal Response Content:','Metadata:']) {
  if (!full.nlProjection.includes(label)) throw new Error(`missing section ${label}`);
}
for (const label of ['Trigger:','Directive:','Instruction:','Subject:','Primary:','Philosophy:','Blueprint:']) {
  if (!full.nlProjection.includes(label)) throw new Error(`missing map field ${label}`);
}
const partial = await run({ neoblockIds: ['primary.sample','directive.sample','trigger.sample'] });
if (!partial.nlProjection.includes('Instruction: n/a')) throw new Error('partial missing Instruction drift');
if (!partial.nlProjection.includes('Subject: n/a')) throw new Error('partial missing Subject drift');
const denied = await run({ neoblockIds: ['primary.sample','missing.sample'] });
if (denied.responseEnvelopeFragment.fragmentStatus !== 'RESPONSE_ENVELOPE_FRAGMENT_READY_WITH_SOURCE_WARNINGS') throw new Error('denied fragmentStatus drift');
if (!denied.sourceComposition.fragmentResults.some(r => r.requestedId === 'missing.sample' && r.hold === 'HOLD_MANIFEST_ENTRY_NOT_FOUND')) throw new Error('missing hold preservation drift');
const empty = await run({ neoblockIds: [] });
if (!empty.errors.some(e => e.code === 'HOLD_RESPONSE_ENVELOPE_FRAGMENT_QUERY_REQUIRED')) throw new Error('empty hold drift');
const badProjection = await run({ neoblockIds: ['primary.sample'], projectionFormat: 'nonsense' });
if (!badProjection.errors.some(e => e.code === 'HOLD_RESPONSE_ENVELOPE_FRAGMENT_PROJECTION_FORMAT_UNSUPPORTED')) throw new Error('bad projection hold drift');
const raw = await run({ neoblockIds: ['primary.sample'], includeRaw: true });
if (!raw.errors.some(e => e.code === 'HOLD_RAW_TARGET_DUMP_NOT_SUPPORTED')) throw new Error('raw hold drift');
if (full.readOnly !== true || full.execution !== 'not_performed' || full.directSource !== 'not_enabled' || full.outputContract.automaticResponseTakeover !== false) throw new Error('safety drift');
console.log(JSON.stringify({ ok: true, full, partial, denied }, null, 2));
