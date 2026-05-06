import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const manifest = JSON.parse(await fs.readFile(path.join(repoRoot, 'openclaw.plugin.json'), 'utf8'));
const readme = await fs.readFile(path.join(repoRoot, 'README.md'), 'utf8');
const pluginEntry = await fs.readFile(path.join(repoRoot, 'src', 'plugin-entry.ts'), 'utf8');
const packDryRun = await fs.readFile(path.join(repoRoot, '.npm-pack-dry-run.txt'), 'utf8').catch(() => '');

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

const manifestTools = new Set(manifest.tools ?? []);
const registeredTools = [...pluginEntry.matchAll(/name:\s*"(umg_envoy_[^"]+)"/g)].map((m) => m[1]);
const registeredSet = new Set(registeredTools);

const requiredTools = [
  'umg_envoy_library_status',
  'umg_envoy_library_search',
  'umg_envoy_runtime_spec_dry_run',
  'umg_envoy_runtime_visibility_header',
  'umg_envoy_runtime_molt_map',
  'umg_envoy_runtime_dashboard',
  'umg_envoy_runtime_ir_matrix',
  'umg_envoy_runtime_inspect',
  'umg_envoy_alpha_demo',
  'umg_envoy_sleeve_list',
  'umg_envoy_sleeve_inspect',
  'umg_envoy_sleeve_demo',
  'umg_envoy_local_readonly_plan',
  'umg_envoy_local_readonly_scan'
];

for (const tool of requiredTools) {
  ensure(manifestTools.has(tool), `manifest missing required tool ${tool}`);
  ensure(registeredSet.has(tool), `plugin registration missing required tool ${tool}`);
}

for (const tool of registeredSet) {
  ensure(manifestTools.has(tool), `registered public tool missing from manifest: ${tool}`);
}
for (const tool of manifestTools) {
  ensure(registeredSet.has(tool), `manifest tool is not registered: ${tool}`);
}

ensure(!registeredSet.has('umg_envoy_compile_ir_bridge'), 'public release must not expose compile_ir_bridge');
ensure(!/child_process|spawn\(/i.test(pluginEntry), 'public plugin entry should not expose spawn-backed user tool surfaces');
ensure(readme.includes('Current Capability Boundary'), 'README must contain Current Capability Boundary');
ensure(readme.includes('Operational Sleeve Demos'), 'README must contain Operational Sleeve Demos');
ensure(readme.includes('handoff / HITL preview only') || readme.includes('handoff-only'), 'README must state LangChain demo is handoff-only');
ensure(readme.includes('file contents') && readme.includes('write files') && readme.includes('delete files') && readme.includes('shell execution'), 'README must state no file contents/writes/deletes/shell');

if (packDryRun) {
  const forbidden = [
    '.compare-approved-tarball',
    '.publish-folder-candidate',
    'META/',
    'FILESET-COMPARISON-VALIDATED-VS-RELEASE-CLONE.md',
    'RELEASE-BLOCKER-PACK-CONTAMINATION-REPORT.md',
    '.tgz',
    'node_modules/'
  ];
  for (const token of forbidden) {
    ensure(!packDryRun.includes(token), `npm pack --dry-run output should not include ${token}`);
  }
}

console.log(JSON.stringify({
  ok: true,
  manifest_tools: [...manifestTools].sort(),
  registered_tools: [...registeredSet].sort(),
  readme_alignment: true,
  pack_dry_run_checked: Boolean(packDryRun)
}, null, 2));
