import entry from '../dist/plugin-entry.js';
const defs = [];
await entry.register({ registerTool(def){ defs.push(def); }, registerCli(){} }, {});
for (const name of ['umg_envoy_block_library_status','umg_envoy_block_library_manifest_index','umg_envoy_block_library_manifest_entry_lookup','umg_envoy_block_library_target_shallow_load_gate','umg_envoy_block_library_target_shallow_load_single','umg_envoy_block_library_target_shallow_summary_normalize']) {
  if (!defs.find(d => d.name === name)) throw new Error(`${name} missing`);
}
const tool = defs.find(d => d.name === 'umg_envoy_block_library_target_shallow_summary_normalize');
const run = async (input) => JSON.parse((await tool.execute(input)).content[0].text);
const primary = await run({ entryId: 'primary.sample', manifestKind: 'neoblock' });
if (!primary.ok) throw new Error('primary summary failed');
if (primary.normalizedSummary.artifactKind !== 'neoblock') throw new Error('primary artifactKind drift');
if (primary.normalizedSummary.artifactId !== 'primary.sample') throw new Error('primary artifactId drift');
if (primary.normalizedSummary.moltType !== 'Primary') throw new Error('primary moltType drift');
if (primary.normalizedSummary.summaryStatus !== 'NORMALIZED') throw new Error('primary summaryStatus drift');
if (primary.gate.payloadLoaded !== true || primary.gate.recursiveLoad !== false) throw new Error('primary gate flags drift');
for (const key of ['identity','metadata','neoblock','provenance']) { if (!primary.payload.topLevelKeys.includes(key)) throw new Error(`missing topLevelKey ${key}`); }
if (primary.normalizedSummary.contentPreview && primary.normalizedSummary.contentPreview.length > 501) throw new Error('primary preview not bounded');
if (primary.normalizedSummary.referenceSummary.resolvedRefs !== 0 || primary.normalizedSummary.referenceSummary.loadedRefs !== 0) throw new Error('primary refs should not resolve/load');
const directive = await run({ entryId: 'directive.sample', manifestKind: 'neoblock' });
if (directive.normalizedSummary.moltType !== 'Directive') throw new Error('directive moltType drift');
const trigger = await run({ entryId: 'trigger.sample', manifestKind: 'neoblock' });
if (trigger.normalizedSummary.moltType !== 'Trigger') throw new Error('trigger moltType drift');
const forbidden = await run({ sourcePath: 'archive/sample-basic_minimal.json', manifestKind: 'public_curated_catalog' });
if (!forbidden.errors.some(e => e.code === 'HOLD_TARGET_FORBIDDEN')) throw new Error('forbidden hold failed');
const slv = await run({ sourcePath: 'SLV.OPERATOR.json', manifestKind: 'public_curated_catalog' });
if (!slv.errors.some(e => e.code === 'HOLD_TARGET_OUTSIDE_ALLOWLIST')) throw new Error('SLV hold failed');
const persona = await run({ sourcePath: 'sleeve-neomagnetar-dynamic-persona-v1.json', manifestKind: 'public_curated_catalog' });
if (!persona.errors.some(e => e.code === 'HOLD_TARGET_OUTSIDE_ALLOWLIST')) throw new Error('persona hold failed');
const missing = await run({ entryId: 'missing.sample' });
if (!missing.errors.some(e => e.code === 'HOLD_MANIFEST_ENTRY_NOT_FOUND')) throw new Error('missing hold failed');
const noQuery = await run({});
if (!noQuery.errors.some(e => e.code === 'HOLD_SHALLOW_SINGLE_LOAD_QUERY_REQUIRED')) throw new Error('noQuery hold failed');
const badKind = await run({ entryId: 'primary.sample', manifestKind: 'nonsense' });
if (!badKind.errors.some(e => e.code === 'HOLD_MANIFEST_KIND_UNSUPPORTED')) throw new Error('bad kind hold failed');
const badProfile = await run({ entryId: 'primary.sample', manifestKind: 'neoblock', summaryProfile: 'nonsense' });
if (!badProfile.errors.some(e => e.code === 'HOLD_SHALLOW_SUMMARY_PROFILE_UNSUPPORTED')) throw new Error('bad profile hold failed');
const raw = await run({ entryId: 'primary.sample', manifestKind: 'neoblock', includeRaw: true });
if (!raw.errors.some(e => e.code === 'HOLD_RAW_TARGET_DUMP_NOT_SUPPORTED')) throw new Error('raw hold failed');
console.log(JSON.stringify({ ok: true, primary, directive, trigger }, null, 2));
