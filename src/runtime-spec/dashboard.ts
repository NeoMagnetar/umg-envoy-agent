import type { ApprovalRequestV0, ExecutionCheckpointRecordV0, ExecutionResumeReferenceV0, PreflightValidationResultV0 } from "./approval-checkpoint-contract-types.js";
import { buildApprovalRequestDryRun, buildExecutionCheckpointRecordDryRun, buildExecutionResumeReferenceDryRun, buildPreflightValidationDryRun } from "./approval-checkpoint-contract.js";
import type { GovernedExecutionHandoffV0 } from "./governed-execution-handoff-types.js";
import { buildGovernedExecutionHandoffDryRun } from "./governed-execution-handoff.js";
import type { RuntimeIRMatrixV0 } from "./ir-matrix-types.js";
import { buildRuntimeIRMatrix, renderRuntimeIRMatrix } from "./ir-matrix.js";
import type { RuntimeMOLTMapV0 } from "./molt-map-types.js";
import { buildRuntimeMOLTMap } from "./molt-map.js";
import type { RuntimeSpecV0, RuntimeVisibilityMode } from "./types.js";
import type { RuntimeVisibilityHeader } from "./visibility.js";
import { buildRuntimeVisibilityHeader } from "./visibility.js";

export interface RuntimeDashboardOptions {
  include_molt_map?: boolean;
  include_ir_matrix?: boolean;
  include_governed_handoff?: boolean;
  include_approval_checkpoint?: boolean;
  mode?: RuntimeVisibilityMode;
}

export interface RuntimeDashboardV0 {
  header: RuntimeVisibilityHeader;
  molt_map?: RuntimeMOLTMapV0;
  ir_matrix?: RuntimeIRMatrixV0;
  governed_handoff?: GovernedExecutionHandoffV0;
  approval_request?: ApprovalRequestV0;
  checkpoint_record?: ExecutionCheckpointRecordV0;
  resume_reference?: ExecutionResumeReferenceV0;
  preflight?: PreflightValidationResultV0;
  execution_statement: "No tools executed.";
  matrix_available: boolean;
}

export function buildRuntimeDashboard(spec: RuntimeSpecV0, options: RuntimeDashboardOptions = {}): RuntimeDashboardV0 {
  const mode = options.mode ?? "developer";
  const includeMoltMap = Boolean(options.include_molt_map);
  const includeIRMatrix = Boolean(options.include_ir_matrix);
  const includeGovernedHandoff = Boolean(options.include_governed_handoff);
  const includeApprovalCheckpoint = Boolean(options.include_approval_checkpoint);
  const header = buildRuntimeVisibilityHeader(spec, mode);
  const molt_map = includeMoltMap || includeIRMatrix ? buildRuntimeMOLTMap(spec) : undefined;
  const ir_matrix = includeIRMatrix ? buildRuntimeIRMatrix({ spec, molt_map }) : undefined;
  const governed_handoff = (includeGovernedHandoff || includeApprovalCheckpoint) ? buildGovernedExecutionHandoffDryRun({ runtimeSpec: spec, irMatrixId: ir_matrix?.matrix_id, moltMapId: molt_map?.molt_map_id }) : undefined;
  const approval_request = includeApprovalCheckpoint && governed_handoff ? buildApprovalRequestDryRun({ handoff: governed_handoff }) : undefined;
  const checkpoint_record = includeApprovalCheckpoint && governed_handoff ? buildExecutionCheckpointRecordDryRun({ handoff: governed_handoff, approvalRequest: approval_request }) : undefined;
  const resume_reference = includeApprovalCheckpoint && governed_handoff ? buildExecutionResumeReferenceDryRun({ handoff: governed_handoff, checkpoint: checkpoint_record, approvalRequest: approval_request }) : undefined;
  const preflight = includeApprovalCheckpoint && governed_handoff ? buildPreflightValidationDryRun({ handoff: governed_handoff, approvalRequest: approval_request, checkpoint: checkpoint_record, resumeReference: resume_reference }) : undefined;
  const headerWithMatrix = {
    ...header,
    matrix_available: Boolean(ir_matrix)
  };
  const dashboard: RuntimeDashboardV0 = {
    header: headerWithMatrix,
    molt_map: includeMoltMap ? molt_map : undefined,
    ir_matrix,
    governed_handoff,
    approval_request,
    checkpoint_record,
    resume_reference,
    preflight,
    execution_statement: "No tools executed.",
    matrix_available: Boolean(ir_matrix)
  };
  return dashboard;
}

export function renderRuntimeDashboard(dashboard: RuntimeDashboardV0): string {
  const lines = [
    "OPENCLAW ENVOY RUNTIME",
    `Agent: ${dashboard.header.agent}`,
    `Runtime Mode: ${dashboard.header.runtime_mode}`,
    `Library Mode: ${dashboard.header.library_mode}`,
    `RuntimeSpec: ${dashboard.header.runtime_spec_id}`,
    `Runtime Kind: ${dashboard.header.runtime_kind}`,
    `Selected Sleeve: ${dashboard.header.active_sleeve ?? 'none'}`,
    `Active NeoStack: ${dashboard.header.active_neostacks.length > 0 ? dashboard.header.active_neostacks.join(', ') : 'none'}`,
    `Tool Binding Intent: ${renderToolIntent(dashboard.header)}`,
    `Governance: ${renderGovernance(dashboard.header)}`,
    `Trace: ${dashboard.header.trace_id}`,
    `Matrix: ${dashboard.header.matrix_id} ${dashboard.matrix_available ? 'available' : 'unavailable'}`,
    `Execution: ${dashboard.execution_statement}`
  ];

  if (dashboard.header.warnings.length > 0) {
    lines.push(`Warnings: ${dashboard.header.warnings.join('; ')}`);
  }
  if (dashboard.header.support_artifacts.length > 0) {
    lines.push(`Support Artifacts: ${dashboard.header.support_artifacts.join(', ')} attached for explanation only`);
    lines.push('Runtime Selection: support docs not selected as runtime artifacts');
  }
  if (dashboard.header.trace_events && dashboard.header.trace_events.length > 0) {
    lines.push(`Trace Events: ${dashboard.header.trace_events.join(', ')}`);
  }

  if (dashboard.molt_map) {
    lines.push('', 'RUNTIME MOLT MAP');
    for (const key of ["Trigger", "Directive", "Instruction", "Subject", "Primary", "Philosophy", "Blueprint"] as const) {
      lines.push(`${key}: ${dashboard.molt_map.fields[key].value}`);
    }
  }

  if (dashboard.ir_matrix) {
    lines.push('', 'RUNTIME IR MATRIX');
    if (dashboard.header.trace_events && dashboard.header.trace_events.length > 0) {
      lines.push(`Matrix Nodes: ${dashboard.ir_matrix.nodes.length}`);
      lines.push(`Matrix Edges: ${dashboard.ir_matrix.edges.length}`);
    }
    lines.push(renderRuntimeIRMatrix(dashboard.ir_matrix));
  }

  if (dashboard.governed_handoff) {
    lines.push('', 'APPROVAL / CHECKPOINT CONTRACT');
    lines.push(`Approval Status: ${dashboard.governed_handoff.approval.approval_status}`);
    if (dashboard.governed_handoff.approval.approval_items.length > 0) {
      lines.push(`Approval Items: ${dashboard.governed_handoff.approval.approval_items.map((item) => `${item.tool_id} — ${item.risk_level} risk — exact-scope approval required`).join(', ')}`);
    }
    lines.push(`Checkpoint: ${dashboard.governed_handoff.checkpoint.checkpoint_required ? 'required before execution' : dashboard.governed_handoff.checkpoint.checkpoint_policy}`);
    lines.push(`Resume: ${dashboard.resume_reference ? renderResumeStatus(dashboard.resume_reference.status) : dashboard.governed_handoff.checkpoint.resume_policy === 'resume_requires_checkpoint' ? 'requires checkpoint' : dashboard.governed_handoff.checkpoint.resume_policy}`);
    if (dashboard.governed_handoff.blocking.blocked_items.length > 0) {
      lines.push(`Blocked Items: ${dashboard.governed_handoff.blocking.blocked_items.map((item) => `${item.tool_id} — ${item.risk_level} — cannot be approved under conservative v0`).join(', ')}`);
    }
    if (dashboard.preflight) {
      lines.push(`Preflight: ${renderPreflightStatus(dashboard.preflight.status)}`);
    }
    lines.push(`Execution: ${dashboard.execution_statement}`);
    lines.push('', 'GOVERNED EXECUTION HANDOFF');
    lines.push(`Status: ${resolveHandoffStatusText(dashboard.governed_handoff)}`);
    lines.push(`Approval Required: ${dashboard.governed_handoff.approval.approval_required ? 'yes' : 'no'}`);
    if (dashboard.governed_handoff.approval.approval_items.length > 0) {
      lines.push(`Approval Items: ${dashboard.governed_handoff.approval.approval_items.map((item) => `${item.tool_id} — ${item.risk_level} risk — ${item.status}`).join(', ')}`);
    }
    if (dashboard.governed_handoff.blocking.blocked_items.length > 0) {
      lines.push(`Blocked Tools: ${dashboard.governed_handoff.blocking.blocked_items.map((item) => `${item.tool_id} — ${item.risk_level} — ${item.blocked_reason}`).join(', ')}`);
    }
    if (dashboard.governed_handoff.tool_plan.metadata_only.length > 0) {
      lines.push(`Metadata Only: ${dashboard.governed_handoff.tool_plan.metadata_only.join(', ')}`);
    }
    lines.push(`Checkpoint: ${dashboard.governed_handoff.checkpoint.checkpoint_policy}`);
    lines.push(`Execution: ${dashboard.governed_handoff.execution_boundary.statement}`);
  }

  return lines.join('\n');
}

function renderToolIntent(header: RuntimeVisibilityHeader): string {
  const parts: string[] = [];
  if (header.tool_binding_summary.available.length > 0) parts.push(`${header.tool_binding_summary.available.join(', ')} available`);
  if (header.tool_binding_summary.requires_approval.length > 0) parts.push(`${header.tool_binding_summary.requires_approval.join(', ')} requires approval`);
  if (header.tool_binding_summary.metadata_only && header.tool_binding_summary.metadata_only.length > 0) parts.push(`${header.tool_binding_summary.metadata_only.join(', ')} metadata-only`);
  if (header.tool_binding_summary.mock_only && header.tool_binding_summary.mock_only.length > 0) parts.push(`${header.tool_binding_summary.mock_only.join(', ')} mock-only`);
  if (header.tool_binding_summary.blocked.length > 0) parts.push(`${header.tool_binding_summary.blocked.join(', ')} blocked`);
  if (header.tool_binding_summary.unavailable && header.tool_binding_summary.unavailable.length > 0) parts.push(`${header.tool_binding_summary.unavailable.join(', ')} unavailable`);
  if (header.tool_binding_summary.unknown && header.tool_binding_summary.unknown.length > 0) parts.push(`${header.tool_binding_summary.unknown.join(', ')} unknown`);
  return parts.length > 0 ? parts.join('; ') : 'none';
}

function resolveHandoffStatusText(handoff: GovernedExecutionHandoffV0): string {
  if (handoff.blocking.blocked) return 'blocked';
  if (handoff.approval.approval_required) return 'requires_approval';
  if (handoff.tool_plan.metadata_only.length > 0 && handoff.tool_plan.available.length === 0 && handoff.tool_plan.requires_approval.length === 0) return 'metadata_only';
  if (handoff.tool_plan.mock_only.length > 0 && handoff.tool_plan.available.length === 0 && handoff.tool_plan.requires_approval.length === 0) return 'mock_only';
  if (handoff.tool_plan.requested.length === 0) return 'not_requested';
  return 'draft';
}

function renderResumeStatus(status: ExecutionResumeReferenceV0["status"]): string {
  switch (status) {
    case "requires_checkpoint": return "requires checkpoint";
    case "resume_ready_future_only": return "future-only ready";
    case "invalid": return "invalid";
    case "expired": return "expired";
    default: return "not applicable";
  }
}

function renderPreflightStatus(status: PreflightValidationResultV0["status"]): string {
  switch (status) {
    case "pass_future_only": return "pass_future_only (non-authorizing)";
    case "blocked": return "blocked until approval/checkpoint exists";
    default: return "invalid until revalidation";
  }
}

function renderGovernance(header: RuntimeVisibilityHeader): string {
  return [
    header.governance_summary.governed_execution_plane ? 'governed execution plane' : 'ungoverned',
    header.governance_summary.approval_required ? 'approval required' : 'no approval required'
  ].join('; ');
}
