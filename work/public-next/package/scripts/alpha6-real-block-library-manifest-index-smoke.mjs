import entry from '../dist/plugin-entry.js';
const defs = [];
await entry.register({ registerTool(def){ defs.push(def); }, registerCli(){} }, {});
const tool = defs.find(d => d.name === 'umg_envoy_block_library_manifest_index');
if (!tool) throw new Error('umg_envoy_block_library_manifest_index missing');
const result = JSON.parse((await tool.execute({})).content[0].text);
if (!result.ok) throw new Error('manifest index not ok');
if (result.version !== '0.3.0-alpha.6') throw new Error('version drift');
if (result.entrypoint !== 'dist/plugin-entry.js') throw new Error('entrypoint drift');
if (result.readOnly !== true) throw new Error('readOnly drift');
if (result.execution !== 'not_performed') throw new Error('execution drift');
if (result.directSource !== 'not_enabled') throw new Error('directSource drift');
if (!result.rootExists) throw new Error('library root missing');
const byPath = (p) => result.manifests.find(x => x.relativePath === p);
for (const required of [
  'AI/MANIFESTS/neoblock-library-index.json',
  'AI/MANIFESTS/molt-block-library-index.json',
  'AI/MANIFESTS/neostack-library-index.json',
  'sleeves/manifests/catalog.json'
]) {
  const record = byPath(required);
  if (!record) throw new Error(`missing manifest record: ${required}`);
  if (!['PRESENT_PARSED_NORMALIZED','PRESENT_PARSED_SHAPE_UNKNOWN','PRESENT_PARSE_FAILED'].includes(record.status)) throw new Error(`unexpected required manifest status: ${required} => ${record.status}`);
}
if (byPath('AI/MANIFESTS/neoblock-library-index.json')?.status !== 'PRESENT_PARSED_NORMALIZED') throw new Error('neoblock index did not normalize');
if (byPath('AI/MANIFESTS/neostack-library-index.json')?.status !== 'PRESENT_PARSED_NORMALIZED') throw new Error('neostack index did not normalize');
if (byPath('sleeves/manifests/catalog.json')?.status !== 'PRESENT_PARSED_NORMALIZED') throw new Error('catalog did not normalize');
if (result.summary.manifestCount < 4) throw new Error('manifest count too small');
if (result.summary.totalEntryCount < 1) throw new Error('entry count too small');
console.log(JSON.stringify({ ok: true, result }, null, 2));
