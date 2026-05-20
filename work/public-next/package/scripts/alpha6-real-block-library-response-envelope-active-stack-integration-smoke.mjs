import entry from '../dist/plugin-entry.js';
const defs = [];
await entry.register({ registerTool(def){ defs.push(def); }, registerCli(){} }, {});
for (const name of ['umg_envoy_block_library_response_envelope_fragment','umg_envoy_block_library_active_stack_projection']) {
  if (!defs.find(d => d.name === name)) throw new Error(`${name} missing`);
}
const tool = defs.find(d => d.name === 'umg_envoy_block_library_response_envelope_fragment');
const run = async (input) => JSON.parse((await tool.execute(input)).content[0].text);
const full = await run({ neoblockIds: ['trigger.sample','directive.sample','instruction.sample','subject.sample','primary.sample','philosophy.sample','blueprint.sample'], currentState: 'ALPHA6_RESPONSE_ENVELOPE_ACTIVE_STACK_INTEGRATED' });
if (!full.ok) throw new Error('full integration failed');
if (full.outputContract.contractId !== 'umg.response_envelope.fragment.v1') throw new Error('contractId drift');
if (full.outputContract.contractStatus !== 'NORMALIZED') throw new Error('contractStatus drift');
if (full.outputContract.activeStackSourceContract !== 'umg.active_stack.projection.v1') throw new Error('activeStackSourceContract drift');
if (full.outputContract.activeStackSourceStatus !== 'NORMALIZED') throw new Error('activeStackSourceStatus drift');
if (full.sourceActiveStackProjection.outputContract.contractId !== 'umg.active_stack.projection.v1') throw new Error('source active stack contract drift');
if (full.sourceActiveStackProjection.outputContract.contractStatus !== 'NORMALIZED') throw new Error('source active stack status drift');
for (const label of ['Active Stack:','- Runtime Version:','- Official Entrypoint:','- Source Contract:','- MOLT Map Source Contract:','Envoy Intuition:','Current Context — MOLT Map:','Formal Response Content:','Metadata:']) {
  if (!full.nlProjection.includes(label)) throw new Error(`missing label ${label}`);
}
for (const field of ['Trigger:','Directive:','Instruction:','Subject:','Primary:','Philosophy:','Blueprint:']) {
  if (!full.nlProjection.includes(field)) throw new Error(`missing MOLT field ${field}`);
}
const partial = await run({ neoblockIds: ['primary.sample','directive.sample','trigger.sample'] });
if (!partial.nlProjection.includes('Instruction: n/a')) throw new Error('partial Instruction drift');
const customSleeve = await run({ neoblockIds: ['primary.sample'], activeSleeve: 'manual-alpha6-test-sleeve', currentState: 'CUSTOM_ACTIVE_STACK_TEST' });
if (customSleeve.sourceActiveStackProjection.activeStackProjection.activeSleeve !== 'manual-alpha6-test-sleeve') throw new Error('custom activeSleeve drift');
if (!customSleeve.nlProjection.includes('- Active Sleeve: manual-alpha6-test-sleeve')) throw new Error('custom activeSleeve NL drift');
const denied = await run({ neoblockIds: ['primary.sample','missing.sample'] });
if (denied.responseEnvelopeFragment.fragmentStatus !== 'RESPONSE_ENVELOPE_FRAGMENT_READY_WITH_SOURCE_WARNINGS') throw new Error('denied fragmentStatus drift');
if (!denied.sourceComposition.fragmentResults.some(r => r.requestedId === 'missing.sample' && r.hold === 'HOLD_MANIFEST_ENTRY_NOT_FOUND')) throw new Error('missing hold preservation drift');
const empty = await run({ neoblockIds: [] });
if (!empty.errors.some(e => e.code === 'HOLD_RESPONSE_ENVELOPE_FRAGMENT_QUERY_REQUIRED')) throw new Error('empty hold drift');
const badProjection = await run({ neoblockIds: ['primary.sample'], projectionFormat: 'nonsense' });
if (!badProjection.errors.some(e => e.code === 'HOLD_RESPONSE_ENVELOPE_FRAGMENT_PROJECTION_FORMAT_UNSUPPORTED')) throw new Error('bad projection hold drift');
const raw = await run({ neoblockIds: ['primary.sample'], includeRaw: true });
if (!raw.errors.some(e => e.code === 'HOLD_RAW_TARGET_DUMP_NOT_SUPPORTED')) throw new Error('raw hold drift');
if (full.outputContract.automaticResponseTakeover !== false || full.readOnly !== true || full.execution !== 'not_performed' || full.directSource !== 'not_enabled') throw new Error('safety drift');
console.log(JSON.stringify({ ok: true, full, partial, customSleeve, denied }, null, 2));
