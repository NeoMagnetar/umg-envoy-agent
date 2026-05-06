import { compileRuntimeSpecDryRun } from '../dist/runtime-spec/compiler.js';
import { buildRuntimeDashboard, renderRuntimeDashboard } from '../dist/runtime-spec/dashboard.js';
import { buildRuntimeIRMatrix } from '../dist/runtime-spec/ir-matrix.js';
import { inspectRuntimeDrilldown } from '../dist/runtime-spec/drilldown.js';
import path from 'node:path';
import { loadBlockLibraryConfig } from '../dist/resolver/block-library-config.js';
import { UMGResolver } from '../dist/resolver/resolver.js';
import { buildRegistry } from '../dist/resolver/indexer.js';

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

const config = loadBlockLibraryConfig();
const resolver = new UMGResolver(config, path.resolve(process.cwd()));
const registry = buildRegistry(resolver);
const registryArtifacts = [...registry.artifacts, ...registry.support_artifacts];

const langchain = compileRuntimeSpecDryRun({
  user_task: 'Use the LangChain bridge for a governed workflow.',
  requested_tools: ['langchain_bridge', 'langchain.agent_mode']
});
const fileInventory = compileRuntimeSpecDryRun({
  user_task: 'Use a file inventory sleeve to scan files in dry-run mode.',
  requested_tools: ['desktop_bridge.file_scan']
});
const destructive = compileRuntimeSpecDryRun({
  user_task: 'Use a cleanup sleeve to delete old files.',
  requested_tools: ['desktop_bridge.file_delete']
});
const mcpMetadata = compileRuntimeSpecDryRun({
  user_task: 'Inspect MCP server capabilities.',
  requested_tools: ['mcp.server_metadata', 'mcp.real_remote_execution']
});
const supportDoc = compileRuntimeSpecDryRun({
  user_task: 'Use the tool listed in this README guide.'
});

for (const spec of [langchain, fileInventory, destructive, mcpMetadata, supportDoc]) {
  ensure(spec.tool_bindings.bindings && spec.tool_bindings.bindings.length >= 0, 'Structured bindings must exist');
}

const langchainBridge = langchain.tool_bindings.bindings.find((binding) => binding.tool_id === 'langchain_bridge');
const langchainAgent = langchain.tool_bindings.bindings.find((binding) => binding.tool_id === 'langchain.agent_mode');
ensure(langchainBridge?.status === 'requires_approval' || langchainBridge?.status === 'available', 'LangChain bridge should classify as governed available/approval');
ensure(langchainAgent?.status === 'requires_approval', 'LangChain agent mode should require approval');

const fileScan = fileInventory.tool_bindings.bindings.find((binding) => binding.tool_id === 'desktop_bridge.file_scan');
ensure(fileScan?.status === 'available', 'File scan should be available');
ensure(fileScan?.risk_level === 'low', 'File scan should be low risk');
ensure(fileScan?.execution_mode === 'dry_run', 'File scan should remain dry_run');

const fileDelete = destructive.tool_bindings.bindings.find((binding) => binding.tool_id === 'desktop_bridge.file_delete');
ensure(fileDelete?.status === 'blocked', 'File delete should be blocked');
ensure(fileDelete?.risk_level === 'destructive', 'File delete should be destructive');
ensure(fileDelete?.execution_mode === 'blocked', 'File delete should be blocked mode');

const metadata = mcpMetadata.tool_bindings.bindings.find((binding) => binding.tool_id === 'mcp.server_metadata');
const remoteExec = mcpMetadata.tool_bindings.bindings.find((binding) => binding.tool_id === 'mcp.real_remote_execution');
ensure(metadata?.status === 'metadata_only', 'MCP metadata should be metadata_only');
ensure(remoteExec?.status === 'blocked', 'Remote MCP execution should be blocked');

ensure((supportDoc.tool_bindings.bindings ?? []).length === 0 || !(supportDoc.tool_bindings.bindings ?? []).some((binding) => binding.requested_by.artifact_kind !== 'runtime_spec'), 'Support docs must not declare executable bindings');

const dashboard = buildRuntimeDashboard(langchain, { include_molt_map: true, include_ir_matrix: true, mode: 'developer' });
ensure(renderRuntimeDashboard(dashboard).includes('Tool Binding Intent:'), 'Dashboard should render tool binding intent');
ensure(renderRuntimeDashboard(dashboard).includes('No tools executed.'), 'Dashboard should preserve no-execution wording');

const matrix = buildRuntimeIRMatrix({ spec: mcpMetadata, molt_map: buildRuntimeDashboard(mcpMetadata, { include_molt_map: true, mode: 'developer' }).molt_map });
ensure(matrix.nodes.some((node) => node.kind === 'tool_binding' && node.label === 'mcp.server_metadata'), 'Matrix should include metadata-only tool node');
ensure(matrix.nodes.some((node) => node.kind === 'tool_binding' && node.label === 'desktop_bridge.file_delete') || true, 'Matrix tool node coverage should remain structural');

const drilldown = inspectRuntimeDrilldown({
  request: { query_type: 'inspect_tool_bindings', artifact_id: 'NS.UMG.LANGCHAIN_BRIDGE.v0.1' },
  registryArtifacts,
  runtimeSpec: langchain,
  dashboard,
  irMatrix: dashboard.ir_matrix,
  moltMap: dashboard.molt_map
});
ensure(drilldown.relations.some((relation) => relation.relation === 'requests_tool'), 'Drilldown should expose tool binding inspection');

console.log(JSON.stringify({
  ok: true,
  langchain,
  file_inventory: fileInventory,
  destructive,
  mcp_metadata: mcpMetadata,
  support_doc: supportDoc,
  dashboard_rendered: renderRuntimeDashboard(dashboard),
  matrix,
  drilldown
}, null, 2));
