import entry from '../dist/plugin-entry.js';
const defs = [];
await entry.register({ registerTool(def){ defs.push(def); }, registerCli(){} }, {});
for (const name of ['umg_envoy_block_library_molt_map_fragment','umg_envoy_block_library_molt_map_compose']) {
  if (!defs.find(d => d.name === name)) throw new Error(`${name} missing`);
}
const tool = defs.find(d => d.name === 'umg_envoy_block_library_molt_map_compose');
const run = async (input) => JSON.parse((await tool.execute(input)).content[0].text);
const full = await run({ neoblockIds: ['trigger.sample','directive.sample','instruction.sample','subject.sample','primary.sample','philosophy.sample','blueprint.sample'] });
if (!full.ok) throw new Error('full compose failed');
if (full.composition.compositionStatus !== 'MOLT_MAP_COMPOSED') throw new Error('full status drift');
if (full.composition.requestedCount !== 7 || full.composition.composedFieldCount !== 7 || full.composition.missingFieldCount !== 0 || full.composition.duplicateFieldCount !== 0) throw new Error('full composition counts drift');
for (const [field, id] of [['Trigger','trigger.sample'],['Directive','directive.sample'],['Instruction','instruction.sample'],['Subject','subject.sample'],['Primary','primary.sample'],['Philosophy','philosophy.sample'],['Blueprint','blueprint.sample']]) {
  if (full.moltMap[field].sourceNeoblockId !== id) throw new Error(`${field} source drift`);
}
for (const label of ['Trigger:','Directive:','Instruction:','Subject:','Primary:','Philosophy:','Blueprint:']) {
  if (!full.nlProjection.includes(label)) throw new Error(`missing NL field ${label}`);
}
const partial = await run({ neoblockIds: ['primary.sample','directive.sample','trigger.sample'] });
if (partial.composition.compositionStatus !== 'MOLT_MAP_COMPOSED_WITH_MISSING_FIELDS') throw new Error('partial status drift');
if (partial.moltMap.Instruction.value !== 'n/a' || partial.moltMap.Subject.value !== 'n/a' || partial.moltMap.Philosophy.value !== 'n/a' || partial.moltMap.Blueprint.value !== 'n/a') throw new Error('partial n/a drift');
const dupe = await run({ neoblockIds: ['primary.sample','primary.sample'], conflictPolicy: 'report_only' });
if (dupe.composition.compositionStatus !== 'MOLT_MAP_COMPOSED_WITH_CONFLICTS') throw new Error('dupe status drift');
if (dupe.composition.duplicateFieldCount < 1) throw new Error('dupe count drift');
if (!dupe.conflicts.some(c => c.field === 'Primary')) throw new Error('dupe conflict detail drift');
const denied = await run({ neoblockIds: ['primary.sample','missing.sample'] });
if (denied.composition.compositionStatus !== 'MOLT_MAP_COMPOSED_WITH_DENIED_FRAGMENTS') throw new Error('denied status drift');
if (denied.composition.deniedFragmentCount !== 1) throw new Error('denied count drift');
if (!denied.fragmentResults.some(r => r.requestedId === 'missing.sample' && r.errorCodes.includes('HOLD_MANIFEST_ENTRY_NOT_FOUND'))) throw new Error('missing denied detail drift');
const empty = await run({ neoblockIds: [] });
if (!empty.errors.some(e => e.code === 'HOLD_MOLT_MAP_COMPOSE_QUERY_REQUIRED')) throw new Error('empty hold drift');
const badProjection = await run({ neoblockIds: ['primary.sample'], projectionFormat: 'nonsense' });
if (!badProjection.errors.some(e => e.code === 'HOLD_MOLT_MAP_COMPOSE_PROJECTION_FORMAT_UNSUPPORTED')) throw new Error('bad projection hold drift');
const badPolicy = await run({ neoblockIds: ['primary.sample'], conflictPolicy: 'nonsense' });
if (!badPolicy.errors.some(e => e.code === 'HOLD_MOLT_MAP_COMPOSE_CONFLICT_POLICY_UNSUPPORTED')) throw new Error('bad conflict policy hold drift');
const raw = await run({ neoblockIds: ['primary.sample'], includeRaw: true });
if (!raw.errors.some(e => e.code === 'HOLD_RAW_TARGET_DUMP_NOT_SUPPORTED')) throw new Error('raw hold drift');
if (full.execution !== 'not_performed' || full.directSource !== 'not_enabled' || full.composition.recursiveLoad !== false || full.composition.fullLibraryScan !== false) throw new Error('safety drift');
console.log(JSON.stringify({ ok: true, full, partial, dupe, denied }, null, 2));
