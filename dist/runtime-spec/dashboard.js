import { buildRuntimeMOLTMap } from "./molt-map.js";
import { buildRuntimeVisibilityHeader } from "./visibility.js";
export function buildRuntimeDashboard(spec, options = {}) {
    const header = buildRuntimeVisibilityHeader(spec, options.mode ?? "developer");
    const molt_map = options.include_molt_map ? buildRuntimeMOLTMap(spec) : undefined;
    return {
        header,
        molt_map,
        execution_statement: "No tools executed.",
        matrix_available: false
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
        `Matrix: ${dashboard.header.matrix_id} ${dashboard.header.matrix_available ? 'available' : 'unavailable'}`,
        `Execution: ${dashboard.execution_statement}`
    ];
    if (dashboard.header.warnings.length > 0) {
        lines.push(`Warnings: ${dashboard.header.warnings.join('; ')}`);
    }
    if (dashboard.header.support_artifacts.length > 0) {
        lines.push(`Support Artifacts: ${dashboard.header.support_artifacts.join(', ')} attached for explanation only`);
        lines.push('Runtime Selection: support docs not selected as runtime artifacts');
    }
    if (dashboard.molt_map) {
        lines.push('', 'RUNTIME MOLT MAP');
        for (const key of ["Trigger", "Directive", "Instruction", "Subject", "Primary", "Philosophy", "Blueprint"]) {
            lines.push(`${key}: ${dashboard.molt_map.fields[key].value}`);
        }
    }
    return lines.join('\n');
}
function renderToolIntent(header) {
    const parts = [];
    if (header.tool_binding_summary.available.length > 0)
        parts.push(`${header.tool_binding_summary.available.join(', ')} available`);
    if (header.tool_binding_summary.requires_approval.length > 0)
        parts.push(`${header.tool_binding_summary.requires_approval.join(', ')} requires approval`);
    if (header.tool_binding_summary.blocked.length > 0)
        parts.push(`${header.tool_binding_summary.blocked.join(', ')} blocked`);
    return parts.length > 0 ? parts.join('; ') : 'none';
}
function renderGovernance(header) {
    return [
        header.governance_summary.governed_execution_plane ? 'governed execution plane' : 'ungoverned',
        header.governance_summary.approval_required ? 'approval required' : 'no approval required'
    ].join('; ');
}
