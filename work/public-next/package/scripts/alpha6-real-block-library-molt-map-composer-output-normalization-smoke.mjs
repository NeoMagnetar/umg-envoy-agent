import entry from '../dist/plugin-entry.js';
const defs = [];
await entry.register({ registerTool(def){ defs.push(def); }, registerCli(){} }, {});
const tool = defs.find(d => d.name === 'umg_envoy_block_library_molt_map_compose');
if (!tool) throw new Error('tool missing');
const run = async (input) => JSON.parse((await tool.execute(input)).content[0].text);
const full = await run({ neoblockIds: ['trigger.sample','directive.sample','instruction.sample','subject.sample','primary.sample','philosophy.sample','blueprint.sample'] });
if (full.outputContract.contractId !== 'umg.molt_map.compose.v1') throw new Error('contractId drift');
if (full.outputContract.contractStatus !== 'NORMALIZED') throw new Error('contractStatus drift');
if (full.audit.normalizationStatus !== 'COMPOSER_OUTPUT_NORMALIZED') throw new Error('audit normalization drift');
if (full.composition.compositionStatus !== 'MOLT_MAP_COMPOSED') throw new Error('full status drift');
for (const field of ['Trigger','Directive','Instruction','Subject','Primary','Philosophy','Blueprint']) {
  if (!(field in full.moltMap)) throw new Error(`missing field ${field}`);
  if (full.moltMap[field].fieldStatus !== 'FIELD_COMPOSED') throw new Error(`full fieldStatus drift ${field}`);
  if (!full.nlProjection.includes(`${field}:`)) throw new Error(`NL projection missing ${field}`);
}
const partial = await run({ neoblockIds: ['primary.sample','directive.sample','trigger.sample'] });
if (partial.composition.compositionStatus !== 'MOLT_MAP_COMPOSED_WITH_MISSING_FIELDS') throw new Error('partial status drift');
for (const field of ['Instruction','Subject','Philosophy','Blueprint']) {
  if (partial.moltMap[field].fieldStatus !== 'FIELD_MISSING') throw new Error(`partial missing status drift ${field}`);
  if (partial.moltMap[field].value !== 'n/a') throw new Error(`partial missing value drift ${field}`);
}
const denied = await run({ neoblockIds: ['primary.sample','missing.sample'] });
if (denied.composition.compositionStatus !== 'MOLT_MAP_COMPOSED_WITH_DENIED_FRAGMENTS') throw new Error('denied status drift');
const missing = denied.fragmentResults.find(r => r.requestedId === 'missing.sample');
if (!missing) throw new Error('missing fragment result not found');
if (missing.fragmentStatus !== 'MOLT_MAP_FRAGMENT_DENIED') throw new Error('denied fragmentStatus drift');
if (missing.hold !== 'HOLD_MANIFEST_ENTRY_NOT_FOUND') throw new Error('denied hold drift');
if (!missing.errorCodes.includes('HOLD_MANIFEST_ENTRY_NOT_FOUND')) throw new Error('denied errorCodes drift');
const dupe = await run({ neoblockIds: ['primary.sample','primary.sample'], conflictPolicy: 'report_only' });
if (dupe.composition.compositionStatus !== 'MOLT_MAP_COMPOSED_WITH_CONFLICTS') throw new Error('dupe status drift');
if (!dupe.conflicts.some(c => c.field === 'Primary')) throw new Error('dupe conflict drift');
const empty = await run({ neoblockIds: [] });
if (!empty.errors.some(e => e.code === 'HOLD_MOLT_MAP_COMPOSE_QUERY_REQUIRED')) throw new Error('empty hold drift');
const badProjection = await run({ neoblockIds: ['primary.sample'], projectionFormat: 'nonsense' });
if (!badProjection.errors.some(e => e.code === 'HOLD_MOLT_MAP_COMPOSE_PROJECTION_FORMAT_UNSUPPORTED')) throw new Error('bad projection hold drift');
const badPolicy = await run({ neoblockIds: ['primary.sample'], conflictPolicy: 'nonsense' });
if (!badPolicy.errors.some(e => e.code === 'HOLD_MOLT_MAP_COMPOSE_CONFLICT_POLICY_UNSUPPORTED')) throw new Error('bad policy hold drift');
const raw = await run({ neoblockIds: ['primary.sample'], includeRaw: true });
if (!raw.errors.some(e => e.code === 'HOLD_RAW_TARGET_DUMP_NOT_SUPPORTED')) throw new Error('raw hold drift');
if (full.execution !== 'not_performed' || full.directSource !== 'not_enabled' || full.composition.recursiveLoad !== false || full.composition.fullLibraryScan !== false) throw new Error('safety drift');
console.log(JSON.stringify({ ok: true, full, partial, denied, dupe }, null, 2));
