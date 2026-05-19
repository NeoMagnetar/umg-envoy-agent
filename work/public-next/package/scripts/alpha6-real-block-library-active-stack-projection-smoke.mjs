import entry from '../dist/plugin-entry.js';
const defs = [];
await entry.register({ registerTool(def){ defs.push(def); }, registerCli(){} }, {});
for (const name of ['umg_envoy_block_library_response_envelope_fragment','umg_envoy_block_library_active_stack_projection']) {
  if (!defs.find(d => d.name === name)) throw new Error(`${name} missing`);
}
const tool = defs.find(d => d.name === 'umg_envoy_block_library_active_stack_projection');
const run = async (input) => JSON.parse((await tool.execute(input)).content[0].text);
const base = await run({});
if (!base.ok) throw new Error('default projection failed');
if (base.outputContract.contractId !== 'umg.active_stack.projection.v1') throw new Error('contractId drift');
if (base.outputContract.contractStatus !== 'NORMALIZED') throw new Error('contractStatus drift');
if (base.audit.normalizationStatus !== 'ACTIVE_STACK_PROJECTION_NORMALIZED') throw new Error('audit normalization drift');
if (base.activeStackProjection.projectionStatus !== 'ACTIVE_STACK_PROJECTION_READY') throw new Error('projectionStatus drift');
for (const label of ['Active Stack:','- Project:','- Current State:','- Runtime Version:','- Official Entrypoint:','- Active Tool:','- Source Tool:','- Source Contract:','- MOLT Map Source Contract:','- Active Sleeve:','- NeoStack State:','- Graph State:','- Boundary:']) {
  if (!base.nlProjection.includes(label)) throw new Error(`missing projection label ${label}`);
}
const custom = await run({ currentState: 'ALPHA6_RESPONSE_ENVELOPE_FRAGMENT_LIVE_READY', activeTool: 'umg_envoy_block_library_response_envelope_fragment', activeSleeve: 'n/a' });
if (custom.activeStackProjection.currentState !== 'ALPHA6_RESPONSE_ENVELOPE_FRAGMENT_LIVE_READY') throw new Error('custom currentState drift');
if (custom.activeStackProjection.activeTool !== 'umg_envoy_block_library_response_envelope_fragment') throw new Error('custom activeTool drift');
const sourceCtx = await run({ neoblockIds: ['trigger.sample','directive.sample','instruction.sample','subject.sample','primary.sample','philosophy.sample','blueprint.sample'], currentState: 'ALPHA6_NORMALIZED_RESPONSE_ENVELOPE_CONTEXT' });
if (!sourceCtx.ok) throw new Error('source context projection failed');
if (sourceCtx.activeStackProjection.sourceContextStatus !== 'SOURCE_CONTEXT_NORMALIZED') throw new Error('source context drift');
const badProjection = await run({ projectionFormat: 'nonsense' });
if (!badProjection.errors.some(e => e.code === 'HOLD_ACTIVE_STACK_PROJECTION_FORMAT_UNSUPPORTED')) throw new Error('bad projection hold drift');
const raw = await run({ includeRaw: true });
if (!raw.errors.some(e => e.code === 'HOLD_RAW_TARGET_DUMP_NOT_SUPPORTED')) throw new Error('raw hold drift');
if (base.outputContract.automaticResponseTakeover !== false || base.readOnly !== true || base.execution !== 'not_performed' || base.directSource !== 'not_enabled') throw new Error('safety drift');
console.log(JSON.stringify({ ok: true, base, custom, sourceCtx }, null, 2));
