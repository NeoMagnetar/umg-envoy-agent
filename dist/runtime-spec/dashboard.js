import { buildRuntimeIRMatrix, renderRuntimeIRMatrix } from "./ir-matrix.js";
import { buildRuntimeMOLTMap } from "./molt-map.js";
import { buildRuntimeVisibilityHeader } from "./visibility.js";
export function buildRuntimeDashboard(spec, options = {}) {
    const mode = options.mode ?? "developer";
    const includeMoltMap = Boolean(options.include_molt_map);
    const includeIRMatrix = Boolean(options.include_ir_matrix);
    const header = buildRuntimeVisibilityHeader(spec, mode);
    const molt_map = includeMoltMap || includeIRMatrix ? buildRuntimeMOLTMap(spec) : undefined;
    const ir_matrix = includeIRMatrix ? buildRuntimeIRMatrix({ spec, molt_map }) : undefined;
    return {
        header: {
            ...header,
            matrix_available: Boolean(ir_matrix)
        },
        molt_map: includeMoltMap ? molt_map : undefined,
        ir_matrix,
        execution_statement: "No tools executed.",
        matrix_available: Boolean(ir_matrix)
    };
}
export function renderRuntimeDashboard(dashboard) {
    const lines = [
        "OPENCLAW ENVOY RUNTIME",
        `Agent: ${dashboard.header.agent}`,
        `Runtime Mode: ${dashboard.header.runtime_mode}`,
        `Library Mode: ${dashboard.header.library_mode}`,
        `RuntimeSpec: ${dashboard.header.runtime_spec_id}`,
        `Runtime Kind: ${dashboard.header.runtime_kind}`,
        `Active Sleeve: ${dashboard.header.active_sleeve ?? 'none'}`,
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
function renderGovernance(header) {
    return [
        header.governance_summary.governed_execution_plane ? 'governed execution plane' : 'ungoverned',
        header.governance_summary.approval_required ? 'approval required' : 'no approval required'
    ].join('; ');
}
