import entry from '../dist/plugin-entry.js';
import { getBlockLibraryStatus, defaultBlockLibraryRoot } from '../dist/block-library-resolver.js';
const defs = [];
await entry.register({ registerTool(def){ defs.push(def); }, registerCli(){} }, {});
const tool = defs.find(d => d.name === 'umg_envoy_block_library_status');
if (!tool) throw new Error('umg_envoy_block_library_status missing');
const result = JSON.parse((await tool.execute({ root: defaultBlockLibraryRoot() })).content[0].text);
if (!result.ok) throw new Error('block library status not ok');
if (result.entrypoint !== 'dist/plugin-entry.js') throw new Error('entrypoint drift');
if (result.version !== '0.3.0-alpha.8') throw new Error('version drift');
if (result.surface !== 'compiler_backed_12_tool_runtime') throw new Error('surface drift');
if (result.readOnly !== true) throw new Error('readOnly drift');
if (result.execution !== 'not_performed') throw new Error('execution drift');
if (result.directSource !== 'not_enabled') throw new Error('directSource drift');
if (!result.rootExists) throw new Error('library root missing');
const lane = (name) => result.lanes.find(x => x.lane === name);
if (!lane('AI/MANIFESTS')) throw new Error('AI/MANIFESTS missing');
if (!lane('AI/SLEEVES')) throw new Error('AI/SLEEVES missing');
if (!lane('AI/MOLT-BLOCKS')) throw new Error('AI/MOLT-BLOCKS missing');
if (!lane('AI/NEOBLOCKS')) throw new Error('AI/NEOBLOCKS missing');
if (!lane('AI/NEOSTACKS')) throw new Error('AI/NEOSTACKS missing');
if (lane('HUMAN')?.classification !== 'REFERENCE_ONLY') throw new Error('HUMAN classification drift');
for (const forbidden of ['archive','backups','artifacts','release-staging','publish-stage','Resleever','vendor']) {
  if (lane(forbidden)?.classification !== 'FORBIDDEN') throw new Error(`forbidden lane drift: ${forbidden}`);
}
console.log(JSON.stringify({ ok: true, toolRegistered: true, laneChecks: true, result }, null, 2));


