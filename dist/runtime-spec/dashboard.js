import { buildApprovalRequestDryRun, buildExecutionCheckpointRecordDryRun, buildExecutionResumeReferenceDryRun, buildPreflightValidationDryRun } from "./approval-checkpoint-contract.js";
import { executeGovernedAlpha } from "./governed-execution-alpha.js";
import { buildLocalReadOnlyInspectionMockResultDryRun, buildLocalReadOnlyInspectionScope } from "./local-readonly-inspection.js";
import { buildGovernedExecutionHandoffDryRun } from "./governed-execution-handoff.js";
import { buildRuntimeIRMatrix, renderRuntimeIRMatrix } from "./ir-matrix.js";
import { buildRuntimeMOLTMap } from "./molt-map.js";
import { buildRuntimeVisibilityHeader } from "./visibility.js";
export function buildRuntimeDashboard(spec, options = {}) {
    const mode = options.mode ?? "developer";
    const includeMoltMap = Boolean(options.include_molt_map);
    const includeIRMatrix = Boolean(options.include_ir_matrix);
    const includeGovernedHandoff = Boolean(options.include_governed_handoff);
    const includeApprovalCheckpoint = Boolean(options.include_approval_checkpoint);
    const includeGovernedAlpha = Boolean(options.include_governed_alpha);
    const includeLocalReadOnlyInspection = Boolean(options.include_local_readonly_inspection);
    const header = buildRuntimeVisibilityHeader(spec, mode);
    const molt_map = includeMoltMap || includeIRMatrix ? buildRuntimeMOLTMap(spec) : undefined;
    const ir_matrix = includeIRMatrix ? buildRuntimeIRMatrix({ spec, molt_map }) : undefined;
    const governed_handoff = (includeGovernedHandoff || includeApprovalCheckpoint) ? buildGovernedExecutionHandoffDryRun({ runtimeSpec: spec, irMatrixId: ir_matrix?.matrix_id, moltMapId: molt_map?.molt_map_id }) : undefined;
    const local_readonly_scope = includeLocalReadOnlyInspection && options.local_readonly_root_path ? buildLocalReadOnlyInspectionScope({
        root_path: options.local_readonly_root_path,
        recursive: options.local_readonly_recursive,
        max_depth: options.local_readonly_max_depth,
        max_items: options.local_readonly_max_items,
        include_hidden: options.local_readonly_include_hidden,
        include_system_paths: options.local_readonly_include_system_paths,
        include_file_contents: options.local_readonly_include_file_contents,
        reason: "Local read-only metadata inspection requested."
    }) : undefined;
    const local_readonly_scope_summary = local_readonly_scope ? {
        redacted_root: local_readonly_scope.root_path,
        recursive: local_readonly_scope.recursive,
        max_depth: local_readonly_scope.max_depth,
        max_items: local_readonly_scope.max_items
    } : undefined;
    const approval_request = includeApprovalCheckpoint && governed_handoff ? buildApprovalRequestDryRun({ handoff: governed_handoff, localReadOnlyScope: local_readonly_scope_summary }) : undefined;
    const checkpoint_record = includeApprovalCheckpoint && governed_handoff ? buildExecutionCheckpointRecordDryRun({ handoff: governed_handoff, approvalRequest: approval_request, localInspectionScopeHash: local_readonly_scope ? undefined : undefined }) : undefined;
    const resume_reference = includeApprovalCheckpoint && governed_handoff ? buildExecutionResumeReferenceDryRun({ handoff: governed_handoff, checkpoint: checkpoint_record, approvalRequest: approval_request }) : undefined;
    const preflight = includeApprovalCheckpoint && governed_handoff ? buildPreflightValidationDryRun({ handoff: governed_handoff, approvalRequest: approval_request, checkpoint: checkpoint_record, resumeReference: resume_reference }) : undefined;
    const local_readonly_inspection = includeLocalReadOnlyInspection && governed_handoff && local_readonly_scope ? buildLocalReadOnlyInspectionMockResultDryRun({
        runtimeSpec: spec,
        handoff: governed_handoff,
        approvalRequest: approval_request,
        checkpoint: checkpoint_record,
        scope: local_readonly_scope
    }) : undefined;
    const governed_alpha = includeGovernedAlpha && governed_handoff && preflight ? executeGovernedAlpha({
        tool_id: options.governed_alpha_tool_id ?? (spec.tool_bindings.requested.includes("resolver.library_status") ? "resolver.library_status" : spec.tool_bindings.requested[0] ?? "resolver.library_status"),
        runtimeSpec: spec,
        handoff: governed_handoff,
        approvalRequest: approval_request,
        checkpoint: checkpoint_record,
        preflight,
        query: options.governed_alpha_query,
        kind: options.governed_alpha_kind,
        limit: options.governed_alpha_limit
    }) : undefined;
    const headerWithMatrix = {
        ...header,
        matrix_available: Boolean(ir_matrix)
    };
    const dashboard = {
        header: headerWithMatrix,
        molt_map: includeMoltMap ? molt_map : undefined,
        ir_matrix,
        governed_handoff,
        approval_request,
        checkpoint_record,
        resume_reference,
        preflight,
        governed_alpha,
        local_readonly_inspection,
        execution_statement: local_readonly_inspection?.execution_boundary.statement ?? governed_alpha?.execution_boundary.statement ?? "No tools executed.",
        matrix_available: Boolean(ir_matrix)
    };
    return dashboard;
}
export function renderRuntimeDashboard(dashboard) {
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
        for (const key of ["Trigger", "Directive", "Instruction", "Subject", "Primary", "Philosophy", "Blueprint"]) {
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
    if (dashboard.local_readonly_inspection) {
        lines.push('', 'LOCAL READ-ONLY INSPECTION ALPHA');
        lines.push(`Tool: ${dashboard.local_readonly_inspection.tool_id}`);
        lines.push(`Status: ${dashboard.local_readonly_inspection.status}`);
        lines.push(`Scope: ${dashboard.local_readonly_inspection.redacted_root}`);
        lines.push(`Recursive: ${dashboard.local_readonly_inspection.scope.recursive ? 'true' : 'false'}`);
        lines.push(`Max Depth: ${dashboard.local_readonly_inspection.scope.max_depth}`);
        lines.push(`Max Items: ${dashboard.local_readonly_inspection.scope.max_items}`);
        lines.push(`File Contents: no`);
        lines.push(`Writes: no`);
        lines.push(`Deletes: no`);
        lines.push(`External Calls: no`);
        lines.push(`Scope Hash: ${dashboard.local_readonly_inspection.scope_hash}`);
        if (dashboard.local_readonly_inspection.warnings.length > 0) {
            lines.push(`Reason: ${dashboard.local_readonly_inspection.warnings.join('; ')}`);
        }
        lines.push(`Execution: ${dashboard.local_readonly_inspection.execution_boundary.statement}`);
    }
    if (dashboard.governed_alpha) {
        lines.push('', 'FIRST GOVERNED EXECUTION ALPHA');
        lines.push(`Alpha Target: ${dashboard.governed_alpha.tool_id}`);
        lines.push(`Status: ${dashboard.governed_alpha.status}`);
        lines.push(`Risk: ${dashboard.governed_alpha.risk_level}`);
        lines.push(`Approval: ${dashboard.governed_alpha.approval.required ? 'required' : 'not required'}`);
        lines.push(`Checkpoint: ${dashboard.governed_alpha.checkpoint.required ? 'required' : 'not required'}`);
        lines.push(`Payload Policy: ${dashboard.governed_alpha.result_payload_policy.payload_type} only`);
        if (dashboard.governed_alpha.payload && typeof dashboard.governed_alpha.payload === 'object') {
            const payload = dashboard.governed_alpha.payload;
            if (typeof payload.limit === 'number')
                lines.push(`Limit: ${payload.limit}`);
            if (typeof payload.hard_max === 'number')
                lines.push(`Hard Max: ${payload.hard_max}`);
        }
        lines.push(`File Contents: ${dashboard.governed_alpha.result_payload_policy.contains_file_content ? 'yes' : 'no'}`);
        lines.push(`Sensitive Data: ${dashboard.governed_alpha.result_payload_policy.contains_sensitive_data ? 'yes' : 'no'}`);
        lines.push(`Writes: ${dashboard.governed_alpha.execution_boundary.write_performed ? 'yes' : 'no'}`);
        lines.push(`Deletes: ${dashboard.governed_alpha.execution_boundary.delete_performed ? 'yes' : 'no'}`);
        lines.push(`External Calls: ${dashboard.governed_alpha.execution_boundary.external_calls_performed ? 'yes' : 'no'}`);
        if (dashboard.governed_alpha.status === 'blocked' && dashboard.governed_alpha.warnings.length > 0) {
            lines.push(`Reason: ${dashboard.governed_alpha.warnings[0]}`);
        }
        lines.push(`Execution: ${dashboard.governed_alpha.execution_boundary.statement}`);
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
function renderToolIntent(header) {
    const parts = [];
    if (header.tool_binding_summary.available.length > 0)
        parts.push(`${header.tool_binding_summary.available.join(', ')} available`);
    if (header.tool_binding_summary.requires_approval.length > 0)
        parts.push(`${header.tool_binding_summary.requires_approval.join(', ')} requires approval`);
    if (header.tool_binding_summary.metadata_only && header.tool_binding_summary.metadata_only.length > 0)
        parts.push(`${header.tool_binding_summary.metadata_only.join(', ')} metadata-only`);
    if (header.tool_binding_summary.mock_only && header.tool_binding_summary.mock_only.length > 0)
        parts.push(`${header.tool_binding_summary.mock_only.join(', ')} mock-only`);
    if (header.tool_binding_summary.blocked.length > 0)
        parts.push(`${header.tool_binding_summary.blocked.join(', ')} blocked`);
    if (header.tool_binding_summary.unavailable && header.tool_binding_summary.unavailable.length > 0)
        parts.push(`${header.tool_binding_summary.unavailable.join(', ')} unavailable`);
    if (header.tool_binding_summary.unknown && header.tool_binding_summary.unknown.length > 0)
        parts.push(`${header.tool_binding_summary.unknown.join(', ')} unknown`);
    return parts.length > 0 ? parts.join('; ') : 'none';
}
function resolveHandoffStatusText(handoff) {
    if (handoff.blocking.blocked)
        return 'blocked';
    if (handoff.approval.approval_required)
        return 'requires_approval';
    if (handoff.tool_plan.metadata_only.length > 0 && handoff.tool_plan.available.length === 0 && handoff.tool_plan.requires_approval.length === 0)
        return 'metadata_only';
    if (handoff.tool_plan.mock_only.length > 0 && handoff.tool_plan.available.length === 0 && handoff.tool_plan.requires_approval.length === 0)
        return 'mock_only';
    if (handoff.tool_plan.requested.length === 0)
        return 'not_requested';
    return 'draft';
}
function renderResumeStatus(status) {
    switch (status) {
        case "requires_checkpoint": return "requires checkpoint";
        case "resume_ready_future_only": return "future-only ready";
        case "invalid": return "invalid";
        case "expired": return "expired";
        default: return "not applicable";
    }
}
function renderPreflightStatus(status) {
    switch (status) {
        case "pass_future_only": return "pass_future_only (non-authorizing)";
        case "blocked": return "blocked until approval/checkpoint exists";
        default: return "invalid until revalidation";
    }
}
function renderGovernance(header) {
    return [
        header.governance_summary.governed_execution_plane ? 'governed execution plane' : 'ungoverned',
        header.governance_summary.approval_required ? 'approval required' : 'no approval required'
    ].join('; ');
}
