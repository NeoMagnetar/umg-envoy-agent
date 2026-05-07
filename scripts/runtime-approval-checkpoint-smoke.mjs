import { compileRuntimeSpecDryRun } from '../dist/runtime-spec/compiler.js';
import { buildGovernedExecutionHandoffDryRun } from '../dist/runtime-spec/governed-execution-handoff.js';
import {
  buildApprovalRequestDryRun,
  buildExecutionCheckpointRecordDryRun,
  buildExecutionResumeReferenceDryRun,
  buildPreflightValidationDryRun,
  stableHash
} from '../dist/runtime-spec/approval-checkpoint-contract.js';
import { buildRuntimeDashboard, renderRuntimeDashboard } from '../dist/runtime-spec/dashboard.js';

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

function buildCase(user_task, requested_tools) {
  const spec = compileRuntimeSpecDryRun({ user_task, requested_tools });
  const handoff = buildGovernedExecutionHandoffDryRun({ runtimeSpec: spec });
  const approvalRequest = buildApprovalRequestDryRun({ handoff });
  const checkpoint = buildExecutionCheckpointRecordDryRun({ handoff, approvalRequest });
  const resumeReference = buildExecutionResumeReferenceDryRun({ handoff, checkpoint, approvalRequest });
  const preflight = buildPreflightValidationDryRun({ handoff, approvalRequest, checkpoint, resumeReference });
  return { spec, handoff, approvalRequest, checkpoint, resumeReference, preflight };
}

const langchain = buildCase('Use the LangChain bridge for a governed workflow.', ['langchain_bridge', 'langchain.agent_mode']);
const fileScan = buildCase('Scan files in dry-run mode.', ['desktop_bridge.file_scan']);
const fileWrite = buildCase('Write a report file.', ['desktop_bridge.file_write']);
const destructiveDelete = buildCase('Delete old files.', ['desktop_bridge.file_delete']);
const mcpMetadata = buildCase('Inspect MCP server capabilities.', ['mcp.server_metadata']);

const staleSpec = compileRuntimeSpecDryRun({ user_task: 'Use the LangChain bridge for a governed workflow.', requested_tools: ['langchain_bridge', 'langchain.agent_mode'] });
const staleHandoff = buildGovernedExecutionHandoffDryRun({ runtimeSpec: staleSpec });
const staleApproval = buildApprovalRequestDryRun({ handoff: staleHandoff });
const staleCheckpoint = buildExecutionCheckpointRecordDryRun({ handoff: staleHandoff, approvalRequest: staleApproval });
staleCheckpoint.snapshot.tool_plan_hash = stableHash({ tampered: true });
const staleResume = buildExecutionResumeReferenceDryRun({ handoff: staleHandoff, checkpoint: staleCheckpoint, approvalRequest: staleApproval });
const stalePreflight = buildPreflightValidationDryRun({ handoff: staleHandoff, approvalRequest: staleApproval, checkpoint: staleCheckpoint, resumeReference: staleResume });

ensure(langchain.approvalRequest.status === 'required', 'LangChain approval request should be required');
ensure(langchain.approvalRequest.approval_items.some((item) => item.tool_id === 'langchain_bridge' || item.tool_id === 'langchain.agent_mode'), 'LangChain approval items should include bridge or agent mode');
ensure(langchain.checkpoint.status === 'required', 'LangChain checkpoint should be required');
ensure(langchain.resumeReference.status === 'resume_ready_future_only', 'LangChain resume should be future-ready when checkpoint object exists');
ensure(langchain.preflight.status === 'pass_future_only', 'LangChain preflight should pass future-only when read-only contract objects align');
ensure(langchain.preflight.execution_boundary.execution_performed === false, 'LangChain preflight must not execute');

ensure(fileScan.approvalRequest.status === 'required', 'File scan approval should be required');
ensure(fileScan.checkpoint.status === 'required', 'File scan checkpoint should be required');
ensure(fileScan.resumeReference.status === 'resume_ready_future_only', 'File scan resume should be future-ready when checkpoint object exists');
ensure(fileScan.approvalRequest.user_visible_summary.execution_statement === 'No tools executed.', 'File scan must preserve no-execution wording');

ensure(fileWrite.approvalRequest.status === 'required', 'File write should require approval');
ensure(fileWrite.approvalRequest.approval_items.some((item) => item.tool_id === 'desktop_bridge.file_write'), 'File write approval items should include file write');
ensure(fileWrite.checkpoint.status === 'required', 'File write checkpoint should be required');

ensure(destructiveDelete.approvalRequest.status === 'blocked', 'Delete should be blocked');
ensure(destructiveDelete.approvalRequest.blocked_items.some((item) => item.tool_id === 'desktop_bridge.file_delete'), 'Delete blocked items should include file delete');
ensure(destructiveDelete.checkpoint.status === 'not_required', 'Delete checkpoint should not be required');
ensure(destructiveDelete.preflight.status === 'blocked', 'Delete preflight should be blocked');

ensure(mcpMetadata.approvalRequest.status === 'not_required', 'Metadata approval should not be required');
ensure(mcpMetadata.checkpoint.status === 'not_required', 'Metadata checkpoint should not be required');
ensure(mcpMetadata.handoff.tool_plan.metadata_only.includes('mcp.server_metadata'), 'Metadata tool should stay metadata-only');

ensure(stalePreflight.status === 'invalid', 'Stale checkpoint should invalidate preflight');
ensure(stalePreflight.checks.some((item) => item.check === 'tool_plan_match' && item.passed === false), 'Stale checkpoint should fail tool plan match');
ensure(stalePreflight.execution_boundary.statement === 'No tools executed.', 'Stale checkpoint case must preserve no-execution wording');

const dashboard = buildRuntimeDashboard(langchain.spec, {
  include_molt_map: true,
  include_ir_matrix: true,
  include_governed_handoff: true,
  include_approval_checkpoint: true,
  mode: 'developer'
});

ensure(renderRuntimeDashboard(dashboard).includes('APPROVAL / CHECKPOINT CONTRACT'), 'Dashboard should render approval/checkpoint section');
ensure(renderRuntimeDashboard(dashboard).includes('Preflight:'), 'Dashboard should render preflight line');
ensure(renderRuntimeDashboard(dashboard).includes('No tools executed.'), 'Dashboard should preserve no-execution wording');

console.log(JSON.stringify({
  ok: true,
  langchain,
  file_scan: fileScan,
  file_write: fileWrite,
  destructive_delete: destructiveDelete,
  mcp_metadata: mcpMetadata,
  stale_checkpoint_mismatch: {
    handoff: staleHandoff,
    approvalRequest: staleApproval,
    checkpoint: staleCheckpoint,
    resumeReference: staleResume,
    preflight: stalePreflight
  },
  dashboard_rendered: renderRuntimeDashboard(dashboard)
}, null, 2));
