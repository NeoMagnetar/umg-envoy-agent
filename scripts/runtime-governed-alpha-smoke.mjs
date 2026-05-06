import { compileRuntimeSpecDryRun } from '../dist/runtime-spec/compiler.js';
import { buildGovernedExecutionHandoffDryRun } from '../dist/runtime-spec/governed-execution-handoff.js';
import { buildApprovalRequestDryRun, buildExecutionCheckpointRecordDryRun, buildPreflightValidationDryRun } from '../dist/runtime-spec/approval-checkpoint-contract.js';
import { executeGovernedAlpha } from '../dist/runtime-spec/governed-execution-alpha.js';
import { buildRuntimeDashboard, renderRuntimeDashboard } from '../dist/runtime-spec/dashboard.js';

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

function buildContext(user_task, requested_tools) {
  const runtimeSpec = compileRuntimeSpecDryRun({ user_task, requested_tools });
  const handoff = buildGovernedExecutionHandoffDryRun({ runtimeSpec });
  const approvalRequest = buildApprovalRequestDryRun({ handoff });
  const checkpoint = buildExecutionCheckpointRecordDryRun({ handoff, approvalRequest });
  const preflight = buildPreflightValidationDryRun({ handoff, approvalRequest, checkpoint });
  return { runtimeSpec, handoff, approvalRequest, checkpoint, preflight };
}

const statusContext = buildContext('Show UMG library status through governed alpha.', ['resolver.library_status']);
const statusResult = executeGovernedAlpha({ tool_id: 'resolver.library_status', ...statusContext });
ensure(statusResult.status === 'executed_metadata_only', 'resolver.library_status should execute as metadata-only alpha');
ensure(statusResult.result_payload_policy.payload_type === 'metadata', 'resolver.library_status payload should be metadata');
ensure(statusResult.execution_boundary.external_calls_performed === false, 'resolver.library_status should not perform external calls');
ensure(statusResult.execution_boundary.write_performed === false, 'resolver.library_status should not write');
ensure(statusResult.execution_boundary.delete_performed === false, 'resolver.library_status should not delete');

const searchContext = buildContext('Search the UMG library for LangChain.', ['resolver.library_search']);
const searchResult = executeGovernedAlpha({ tool_id: 'resolver.library_search', query: 'langchain bridge', kind: 'neostack', limit: 10, ...searchContext });
ensure(searchResult.status === 'executed_metadata_only', 'resolver.library_search should execute as metadata-only alpha');
ensure(searchResult.result_payload_policy.payload_type === 'metadata', 'resolver.library_search payload should be metadata');
ensure(searchResult.payload.limit === 10, 'resolver.library_search should preserve explicit limit 10');
ensure(searchResult.payload.runtime_results.length <= 10, 'resolver.library_search results should be bounded');
ensure(!JSON.stringify(searchResult.payload).includes('markdown'), 'resolver.library_search should not return full support-doc text');
ensure(searchResult.execution_boundary.statement === 'Metadata-only governed alpha executed for resolver.library_search.', 'resolver.library_search should report metadata-only execution');

const clampedSearch = executeGovernedAlpha({ tool_id: 'resolver.library_search', query: 'langchain', limit: 999, ...searchContext });
ensure(clampedSearch.status === 'executed_metadata_only', 'clamped library search should still execute');
ensure(clampedSearch.payload.limit === 25, 'resolver.library_search should clamp limit to hard max 25');
ensure(clampedSearch.warnings.includes('limit clamped to metadata alpha hard max'), 'resolver.library_search should warn when clamping limit');

const capabilityContext = buildContext('Show available governed tool capabilities.', ['tool.capability_summary']);
const capabilityResult = executeGovernedAlpha({ tool_id: 'tool.capability_summary', ...capabilityContext });
ensure(capabilityResult.status === 'executed_metadata_only', 'tool.capability_summary should execute as metadata-only alpha');
ensure(capabilityResult.result_payload_policy.payload_type === 'metadata', 'tool.capability_summary payload should be metadata');
ensure(capabilityResult.payload.metadata_only.some((row) => row.tool_id === 'resolver.library_status'), 'tool.capability_summary should include resolver.library_status');
ensure(!JSON.stringify(capabilityResult.payload).toLowerCase().includes('token'), 'tool.capability_summary should not return secrets or tokens');
ensure(capabilityResult.execution_boundary.statement === 'Metadata-only governed alpha executed for tool.capability_summary.', 'tool.capability_summary should report metadata-only execution');

const mcpBlockedContext = buildContext('Inspect MCP server metadata.', ['mcp.server_metadata']);
const mcpBlocked = executeGovernedAlpha({ tool_id: 'mcp.server_metadata', ...mcpBlockedContext });
ensure(mcpBlocked.status === 'blocked', 'mcp.server_metadata should remain blocked in metadata alpha v2');
ensure(mcpBlocked.warnings[0].includes('candidate-only') || mcpBlocked.warnings[0].includes('not implemented'), 'mcp.server_metadata should explain candidate-only blocking');

const fileScanBlockedContext = buildContext('Scan files in dry-run mode.', ['desktop_bridge.file_scan']);
const fileScanBlocked = executeGovernedAlpha({ tool_id: 'desktop_bridge.file_scan', ...fileScanBlockedContext });
ensure(fileScanBlocked.status === 'blocked', 'desktop_bridge.file_scan should remain blocked');

const fileWriteBlockedContext = buildContext('Write a report file.', ['desktop_bridge.file_write']);
const fileWriteBlocked = executeGovernedAlpha({ tool_id: 'desktop_bridge.file_write', ...fileWriteBlockedContext });
ensure(fileWriteBlocked.status === 'blocked', 'desktop_bridge.file_write should remain blocked');
ensure(fileWriteBlocked.execution_boundary.write_performed === false, 'blocked file write should not write');

const deleteBlockedContext = buildContext('Delete old files.', ['desktop_bridge.file_delete']);
const deleteBlocked = executeGovernedAlpha({ tool_id: 'desktop_bridge.file_delete', ...deleteBlockedContext });
ensure(deleteBlocked.status === 'blocked', 'desktop_bridge.file_delete should remain blocked');
ensure(deleteBlocked.execution_boundary.delete_performed === false, 'blocked delete should not delete');

const langchainBlockedContext = buildContext('Run LangChain agent mode.', ['langchain.agent_mode']);
const langchainBlocked = executeGovernedAlpha({ tool_id: 'langchain.agent_mode', ...langchainBlockedContext });
ensure(langchainBlocked.status === 'blocked', 'langchain.agent_mode should remain blocked');
ensure(langchainBlocked.execution_boundary.external_calls_performed === false, 'blocked LangChain alpha should not perform external calls');

const shellBlockedContext = buildContext('Run a shell command.', ['shell.command']);
const shellBlocked = executeGovernedAlpha({ tool_id: 'shell.command', ...shellBlockedContext });
ensure(shellBlocked.status === 'blocked', 'shell.command should remain blocked');

const repoPublishContext = buildContext('Publish the repo.', ['repo.publish']);
const repoPublishBlocked = executeGovernedAlpha({ tool_id: 'repo.publish', ...repoPublishContext });
ensure(repoPublishBlocked.status === 'blocked', 'repo.publish should remain blocked');

const dashboard = buildRuntimeDashboard(searchContext.runtimeSpec, {
  include_molt_map: true,
  include_ir_matrix: true,
  include_governed_handoff: true,
  include_approval_checkpoint: true,
  include_governed_alpha: true,
  governed_alpha_tool_id: 'resolver.library_search',
  governed_alpha_query: 'langchain bridge',
  governed_alpha_kind: 'neostack',
  governed_alpha_limit: 10,
  mode: 'developer'
});
ensure(renderRuntimeDashboard(dashboard).includes('FIRST GOVERNED EXECUTION ALPHA'), 'dashboard should render governed alpha section');
ensure(renderRuntimeDashboard(dashboard).includes('resolver.library_search'), 'dashboard should show resolver.library_search alpha target');
ensure(renderRuntimeDashboard(dashboard).includes('Limit: 10'), 'dashboard should show search limit');

console.log(JSON.stringify({
  ok: true,
  resolver_library_status: statusResult,
  resolver_library_search: searchResult,
  resolver_library_search_clamped: clampedSearch,
  tool_capability_summary: capabilityResult,
  blocked: {
    mcp_server_metadata: mcpBlocked,
    desktop_bridge_file_scan: fileScanBlocked,
    desktop_bridge_file_write: fileWriteBlocked,
    desktop_bridge_file_delete: deleteBlocked,
    langchain_agent_mode: langchainBlocked,
    shell_command: shellBlocked,
    repo_publish: repoPublishBlocked
  },
  dashboard_rendered: renderRuntimeDashboard(dashboard)
}, null, 2));
