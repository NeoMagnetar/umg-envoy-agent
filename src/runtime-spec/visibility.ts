import type { RuntimeSpecV0 } from "./types.js";

export type RuntimeVisibilityMode =
  | "compact"
  | "developer"
  | "debug";

export interface RuntimeVisibilityHeader {
  agent: "OpenClaw Envoy Agent";
  runtime_mode: "DRY_RUN";
  library_mode: string;
  runtime_spec_id: string;
  runtime_kind: string;
  active_sleeve: string | null;
  active_neostacks: string[];
  active_neoblocks: string[];
  active_molt_blocks: string[];
  support_artifacts: string[];
  candidate_sleeves?: { sleeve_id: string; confidence: string }[];
  selection_confidence?: string;
  selection_policy?: string;
  tool_binding_summary: {
    requested: string[];
    available: string[];
    blocked: string[];
    requires_approval: string[];
    metadata_only?: string[];
    mock_only?: string[];
    unavailable?: string[];
    unknown?: string[];
  };
  governance_summary: {
    execution_mode: string;
    approval_required: boolean;
    governed_execution_plane: boolean;
    mcp_policy: string;
    langchain_policy: string;
  };
  trace_id: string;
  trace_events?: string[];
  matrix_id: string;
  matrix_available: boolean;
  warnings: string[];
  execution_statement: "No tools executed.";
}

export function buildRuntimeVisibilityHeader(spec: RuntimeSpecV0, mode: RuntimeVisibilityMode = "developer"): RuntimeVisibilityHeader {
  return {
    agent: "OpenClaw Envoy Agent",
    runtime_mode: "DRY_RUN",
    library_mode: spec.source_mode,
    runtime_spec_id: spec.runtime_spec_id,
    runtime_kind: spec.runtime_kind,
    active_sleeve: spec.selection.active_sleeve,
    active_neostacks: spec.selection.active_neostacks,
    active_neoblocks: spec.selection.active_neoblocks,
    active_molt_blocks: spec.selection.active_molt_blocks,
    support_artifacts: spec.selection.support_artifacts,
    candidate_sleeves: spec.selection.candidate_sleeves?.map((candidate) => ({ sleeve_id: candidate.sleeve_id, confidence: candidate.confidence })),
    selection_confidence: spec.selection.selection_confidence,
    selection_policy: spec.selection.selection_policy,
    tool_binding_summary: spec.tool_bindings,
    governance_summary: {
      execution_mode: spec.governance.execution_mode,
      approval_required: spec.governance.approval_required,
      governed_execution_plane: spec.governance.governed_execution_plane,
      mcp_policy: spec.governance.mcp_policy,
      langchain_policy: spec.governance.langchain_policy
    },
    trace_id: spec.trace.trace_id,
    trace_events: mode === "debug" ? spec.trace.selection_events.map((event) => event.event) : undefined,
    matrix_id: spec.matrix.matrix_id,
    matrix_available: false,
    warnings: spec.trace.warnings,
    execution_statement: "No tools executed."
  };
}

export function renderRuntimeVisibilityHeader(header: RuntimeVisibilityHeader): string {
  const lines = [
    "OPENCLAW ENVOY RUNTIME",
    `Agent: ${header.agent}`,
    `Runtime Mode: ${header.runtime_mode}`,
    `Library Mode: ${header.library_mode}`,
    `RuntimeSpec: ${header.runtime_spec_id}`,
    `Runtime Kind: ${header.runtime_kind}`,
    `Selected Sleeve: ${header.active_sleeve ?? 'none'}`,
    ...(header.selection_confidence ? [`Selection Confidence: ${header.selection_confidence}`] : []),
    ...(header.candidate_sleeves && header.candidate_sleeves.length > 0 ? [`Candidate Sleeves: ${header.candidate_sleeves.map((candidate) => `${candidate.sleeve_id} — ${candidate.confidence}`).join(', ')}`] : []),
    `Active NeoStack: ${header.active_neostacks.length > 0 ? header.active_neostacks.join(', ') : 'none'}`,
    `Active NeoBlocks: ${header.active_neoblocks.length > 0 ? header.active_neoblocks.join(', ') : 'none'}`,
    `Active MOLT Blocks: ${header.active_molt_blocks.length > 0 ? header.active_molt_blocks.join(', ') : 'none'}`,
    `Tool Binding Intent: ${toolBindingSummaryText(header)}`,
    `Governance: ${governanceSummaryText(header)}`,
    `Trace: ${header.trace_id}`,
    `Matrix: ${header.matrix_id} ${header.matrix_available ? 'available' : 'unavailable'}`,
    `Execution: ${header.execution_statement}`
  ];

  if (header.support_artifacts.length > 0) {
    lines.push(`Support Artifacts: ${header.support_artifacts.join(', ')} (explanation only)`);
    lines.push('Runtime Selection: support docs not selected as runtime artifacts');
  }
  if (header.warnings.length > 0) {
    lines.push(`Warnings: ${header.warnings.join('; ')}`);
  }
  if (header.trace_events && header.trace_events.length > 0) {
    lines.push(`Trace Events: ${header.trace_events.join(', ')}`);
  }
  return lines.join('\n');
}

function toolBindingSummaryText(header: RuntimeVisibilityHeader): string {
  const parts: string[] = [];
  if (header.tool_binding_summary.available.length > 0) parts.push(`${header.tool_binding_summary.available.join(', ')} available`);
  if (header.tool_binding_summary.requires_approval.length > 0) parts.push(`${header.tool_binding_summary.requires_approval.join(', ')} requires approval`);
  if (header.tool_binding_summary.metadata_only && header.tool_binding_summary.metadata_only.length > 0) parts.push(`${header.tool_binding_summary.metadata_only.join(', ')} metadata-only`);
  if (header.tool_binding_summary.mock_only && header.tool_binding_summary.mock_only.length > 0) parts.push(`${header.tool_binding_summary.mock_only.join(', ')} mock-only`);
  if (header.tool_binding_summary.blocked.length > 0) parts.push(`${header.tool_binding_summary.blocked.join(', ')} blocked`);
  if (header.tool_binding_summary.unavailable && header.tool_binding_summary.unavailable.length > 0) parts.push(`${header.tool_binding_summary.unavailable.join(', ')} unavailable`);
  if (header.tool_binding_summary.unknown && header.tool_binding_summary.unknown.length > 0) parts.push(`${header.tool_binding_summary.unknown.join(', ')} unknown`);
  if (parts.length === 0) return 'none';
  return parts.join('; ');
}

function governanceSummaryText(header: RuntimeVisibilityHeader): string {
  const parts = [
    header.governance_summary.governed_execution_plane ? 'governed execution plane' : 'ungoverned',
    header.governance_summary.approval_required ? 'approval required' : 'no approval required',
    `mcp=${header.governance_summary.mcp_policy}`,
    `langchain=${header.governance_summary.langchain_policy}`
  ];
  return parts.join('; ');
}
