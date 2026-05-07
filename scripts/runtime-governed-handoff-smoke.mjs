import { compileRuntimeSpecDryRun } from '../dist/runtime-spec/compiler.js';
import { buildGovernedExecutionHandoffDryRun } from '../dist/runtime-spec/governed-execution-handoff.js';
import { buildRuntimeDashboard, renderRuntimeDashboard } from '../dist/runtime-spec/dashboard.js';

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

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
  requested_tools: ['mcp.server_metadata']
});
const remoteExecution = compileRuntimeSpecDryRun({
  user_task: 'Use remote execution through MCP.',
  requested_tools: ['mcp.real_remote_execution']
});

const langchainHandoff = buildGovernedExecutionHandoffDryRun({ runtimeSpec: langchain });
const fileInventoryHandoff = buildGovernedExecutionHandoffDryRun({ runtimeSpec: fileInventory });
const destructiveHandoff = buildGovernedExecutionHandoffDryRun({ runtimeSpec: destructive });
const mcpMetadataHandoff = buildGovernedExecutionHandoffDryRun({ runtimeSpec: mcpMetadata });
const remoteExecutionHandoff = buildGovernedExecutionHandoffDryRun({ runtimeSpec: remoteExecution });

ensure(langchainHandoff.execution_boundary.execution_performed === false, 'LangChain handoff must not execute');
ensure(langchainHandoff.approval.approval_required === true, 'LangChain handoff should require approval');
ensure(langchainHandoff.approval.approval_items.some((item) => item.tool_id === 'langchain.agent_mode'), 'LangChain approval items should include agent mode');
ensure(langchainHandoff.checkpoint.checkpoint_required === true, 'LangChain handoff should require checkpoint policy');

ensure(fileInventoryHandoff.execution_boundary.execution_performed === false, 'File scan handoff must not execute');
ensure(fileInventoryHandoff.blocking.blocked === false, 'File scan handoff should not be blocked');
ensure(fileInventoryHandoff.approval.approval_required === true, 'File scan handoff should require exact-scope approval');
ensure(fileInventoryHandoff.tool_plan.bindings.some((binding) => binding.tool_id === 'desktop_bridge.file_scan' && binding.execution_mode === 'approval_required'), 'File scan should remain approval_required');

ensure(destructiveHandoff.blocking.blocked === true, 'Destructive handoff should be blocked');
ensure(destructiveHandoff.blocking.blocked_items.some((item) => item.tool_id === 'desktop_bridge.file_delete'), 'Destructive blocked items should include file delete');

ensure(mcpMetadataHandoff.execution_boundary.execution_performed === false, 'Metadata handoff must not execute');
ensure(mcpMetadataHandoff.tool_plan.metadata_only.includes('mcp.server_metadata'), 'Metadata handoff should include metadata-only tool');
ensure(mcpMetadataHandoff.approval.approval_required === false, 'Metadata handoff should not require approval');

ensure(remoteExecutionHandoff.blocking.blocked === true, 'Remote execution handoff should be blocked');
ensure(remoteExecutionHandoff.blocking.blocked_items.some((item) => item.tool_id === 'mcp.real_remote_execution'), 'Remote execution blocked item should exist');

const dashboard = buildRuntimeDashboard(langchain, { include_molt_map: true, include_ir_matrix: true, include_governed_handoff: true, mode: 'developer' });
ensure(Boolean(dashboard.governed_handoff), 'Dashboard should include governed handoff when requested');
ensure(renderRuntimeDashboard(dashboard).includes('GOVERNED EXECUTION HANDOFF'), 'Rendered dashboard should include governed handoff section');
ensure(renderRuntimeDashboard(dashboard).includes('No tools executed.'), 'Rendered dashboard should preserve no-execution wording');

console.log(JSON.stringify({
  ok: true,
  langchain: langchainHandoff,
  file_inventory: fileInventoryHandoff,
  destructive: destructiveHandoff,
  mcp_metadata: mcpMetadataHandoff,
  remote_execution: remoteExecutionHandoff,
  dashboard_rendered: renderRuntimeDashboard(dashboard)
}, null, 2));
