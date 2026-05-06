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

const successContext = buildContext('Show UMG library status through governed alpha.', ['resolver.library_status']);
const success = executeGovernedAlpha({ tool_id: 'resolver.library_status', ...successContext });
ensure(success.status === 'executed_metadata_only', 'resolver.library_status should execute as metadata-only alpha');
ensure(success.result_payload_policy.payload_type === 'metadata', 'resolver.library_status payload should be metadata');
ensure(success.approval.required === false, 'resolver.library_status should not require approval');
ensure(success.checkpoint.required === false, 'resolver.library_status should not require checkpoint');
ensure(success.execution_boundary.external_calls_performed === false, 'resolver.library_status should not perform external calls');
ensure(success.execution_boundary.write_performed === false, 'resolver.library_status should not write');
ensure(success.execution_boundary.delete_performed === false, 'resolver.library_status should not delete');
ensure(success.execution_boundary.statement === 'Metadata-only governed alpha executed for resolver.library_status.', 'resolver.library_status should report metadata-only execution');
ensure(!JSON.stringify(success.payload).includes('sleeve.json'), 'resolver.library_status should not return file contents');

const mcpBlockedContext = buildContext('Inspect MCP server capabilities.', ['mcp.server_metadata']);
const mcpBlocked = executeGovernedAlpha({ tool_id: 'mcp.server_metadata', ...mcpBlockedContext });
ensure(mcpBlocked.status === 'blocked', 'mcp.server_metadata should be blocked in first alpha implementation');
ensure(mcpBlocked.execution_boundary.tool_execution_performed === false, 'blocked MCP alpha should not execute');

const searchBlockedContext = buildContext('Search library status.', ['resolver.library_search']);
const searchBlocked = executeGovernedAlpha({ tool_id: 'resolver.library_search', ...searchBlockedContext });
ensure(searchBlocked.status === 'blocked', 'resolver.library_search should be blocked in first alpha implementation');

const fileScanBlockedContext = buildContext('Scan files in dry-run mode.', ['desktop_bridge.file_scan']);
const fileScanBlocked = executeGovernedAlpha({ tool_id: 'desktop_bridge.file_scan', ...fileScanBlockedContext });
ensure(fileScanBlocked.status === 'blocked', 'desktop_bridge.file_scan should be blocked in first alpha implementation');

const fileWriteBlockedContext = buildContext('Write a report file.', ['desktop_bridge.file_write']);
const fileWriteBlocked = executeGovernedAlpha({ tool_id: 'desktop_bridge.file_write', ...fileWriteBlockedContext });
ensure(fileWriteBlocked.status === 'blocked', 'desktop_bridge.file_write should be blocked');
ensure(fileWriteBlocked.execution_boundary.write_performed === false, 'blocked file write should not write');

const deleteBlockedContext = buildContext('Delete old files.', ['desktop_bridge.file_delete']);
const deleteBlocked = executeGovernedAlpha({ tool_id: 'desktop_bridge.file_delete', ...deleteBlockedContext });
ensure(deleteBlocked.status === 'blocked', 'desktop_bridge.file_delete should be blocked');
ensure(deleteBlocked.execution_boundary.delete_performed === false, 'blocked delete should not delete');

const langchainBlockedContext = buildContext('Run LangChain agent mode.', ['langchain.agent_mode']);
const langchainBlocked = executeGovernedAlpha({ tool_id: 'langchain.agent_mode', ...langchainBlockedContext });
ensure(langchainBlocked.status === 'blocked', 'langchain.agent_mode should be blocked');
ensure(langchainBlocked.execution_boundary.external_calls_performed === false, 'blocked LangChain alpha should not perform external calls');

const dashboard = buildRuntimeDashboard(successContext.runtimeSpec, {
  include_molt_map: true,
  include_ir_matrix: true,
  include_governed_handoff: true,
  include_approval_checkpoint: true,
  include_governed_alpha: true,
  mode: 'developer'
});
ensure(renderRuntimeDashboard(dashboard).includes('FIRST GOVERNED EXECUTION ALPHA'), 'dashboard should render governed alpha section');
ensure(renderRuntimeDashboard(dashboard).includes('resolver.library_status'), 'dashboard should show resolver.library_status alpha target');
ensure(renderRuntimeDashboard(dashboard).includes('executed_metadata_only'), 'dashboard should show executed metadata-only status');

console.log(JSON.stringify({
  ok: true,
  resolver_library_status: success,
  blocked: {
    mcp_server_metadata: mcpBlocked,
    resolver_library_search: searchBlocked,
    desktop_bridge_file_scan: fileScanBlocked,
    desktop_bridge_file_write: fileWriteBlocked,
    desktop_bridge_file_delete: deleteBlocked,
    langchain_agent_mode: langchainBlocked
  },
  dashboard_rendered: renderRuntimeDashboard(dashboard)
}, null, 2));
