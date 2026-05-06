import { stableHash } from "./approval-checkpoint-contract.js";
import { buildUMGEnvoyAlphaDemo } from "./alpha-demo.js";
import { buildApprovalRequestDryRun, buildExecutionCheckpointRecordDryRun, buildPreflightValidationDryRun } from "./approval-checkpoint-contract.js";
import { compileRuntimeSpecDryRun } from "./compiler.js";
import { buildRuntimeDashboard } from "./dashboard.js";
import { buildGovernedExecutionHandoffDryRun } from "./governed-execution-handoff.js";
import { buildLocalReadOnlyInspectionPlanDryRun } from "./local-readonly-inspection.js";
import { buildUMGRuntimeDisplayContract } from "./runtime-display.js";
import type { OperationalSleeveDemoResultV0, OperationalSleeveProfileV0 } from "./operational-sleeve-types.js";

const SLEEVES: OperationalSleeveProfileV0[] = [
  {
    sleeve_id: "SL.UMG.LIBRARY_RESEARCH_DEMO.v0.1",
    title: "UMG Library Research Demo",
    description: "Demonstrate UMG library status, search, and tool capability metadata.",
    demo_ready: true,
    mode: "demo_metadata",
    runtime_kind: "sleeve_runtime",
    declared_neostacks: ["NS.UMG.LIBRARY_RESEARCH.v0.1"],
    declared_neoblocks: ["NB.UMG.LIBRARY.SEARCH.v0.1"],
    declared_molt_blocks: ["MOLT.RUNTIME.DISPLAY.v0.1"],
    declared_tools: ["resolver.library_status", "resolver.library_search", "tool.capability_summary"],
    allowed_demo_tools: ["resolver.library_status", "resolver.library_search", "tool.capability_summary"],
    blocked_tools: [],
    approval_required: false,
    checkpoint_required: false,
    safety_boundary: { file_contents_read: false, write_performed: false, delete_performed: false, shell_command_executed: false, external_calls_performed: false, langchain_agent_started: false, mcp_server_started: false },
    warnings: []
  },
  {
    sleeve_id: "SL.UMG.LOCAL_READONLY_WORKSPACE_DEMO.v0.1",
    title: "Local Read-Only Workspace Demo",
    description: "Demonstrate exact-scope local read-only planning and approved metadata scan gating.",
    demo_ready: true,
    mode: "demo_plan_only",
    runtime_kind: "sleeve_runtime",
    declared_neostacks: ["NS.UMG.LOCAL_READONLY_SCOPE.v0.1"],
    declared_neoblocks: ["NB.UMG.LOCAL.READONLY.SCOPE.v0.1"],
    declared_molt_blocks: ["MOLT.RUNTIME.DISPLAY.v0.1"],
    declared_tools: ["desktop_bridge.file_scan", "umg_envoy_local_readonly_plan", "umg_envoy_local_readonly_scan"],
    allowed_demo_tools: ["umg_envoy_local_readonly_plan"],
    blocked_tools: ["desktop_bridge.file_scan"],
    approval_required: true,
    checkpoint_required: true,
    safety_boundary: { file_contents_read: false, write_performed: false, delete_performed: false, shell_command_executed: false, external_calls_performed: false, langchain_agent_started: false, mcp_server_started: false },
    warnings: []
  },
  {
    sleeve_id: "SL.UMG.LANGCHAIN_BRIDGE_DEMO.v0.1",
    title: "LangChain Bridge Demo",
    description: "Demonstrate governed LangChain bridge handoff and HITL-style checkpoint preview without starting agent mode.",
    demo_ready: true,
    mode: "demo_handoff_only",
    runtime_kind: "neostack_runtime",
    declared_neostacks: ["NS.UMG.LANGCHAIN_BRIDGE.v0.1"],
    declared_neoblocks: ["NB.UMG.LANGCHAIN.BRIDGE.v0.1"],
    declared_molt_blocks: ["MOLT.RUNTIME.DISPLAY.v0.1"],
    declared_tools: ["langchain_bridge", "langchain.agent_mode"],
    allowed_demo_tools: [],
    blocked_tools: ["langchain.agent_mode"],
    approval_required: true,
    checkpoint_required: true,
    safety_boundary: { file_contents_read: false, write_performed: false, delete_performed: false, shell_command_executed: false, external_calls_performed: false, langchain_agent_started: false, mcp_server_started: false },
    warnings: ["LangChain demo is handoff-only in this pass."]
  }
];

export function listOperationalSleeves(): OperationalSleeveProfileV0[] {
  return SLEEVES.map((sleeve) => ({ ...sleeve }));
}

export function inspectOperationalSleeve(input: {
  sleeve_id: string;
  include_molt_map?: boolean;
  include_ir_matrix?: boolean;
  display_mode?: "compact" | "developer" | "debug";
}): OperationalSleeveDemoResultV0 {
  const sleeve = SLEEVES.find((item) => item.sleeve_id === input.sleeve_id);
  if (!sleeve) return notFoundResult(input.sleeve_id);
  const dashboard = demoDashboardForSleeve(sleeve, input.display_mode ?? "developer");
  const display = buildUMGRuntimeDisplayContract({ dashboard, mode: input.display_mode ?? "developer" });
  return {
    demo_id: `sleeve_inspect_${stableHash({ sleeve_id: sleeve.sleeve_id, mode: input.display_mode ?? "developer" })}`,
    sleeve_id: sleeve.sleeve_id,
    status: sleeve.demo_ready ? "available" : "not_demo_ready",
    mode: sleeve.mode,
    runtime_spec_id: dashboard.header.runtime_spec_id,
    trace_id: dashboard.header.trace_id,
    matrix_id: dashboard.ir_matrix?.matrix_id,
    active_runtime: {
      selected_sleeve: sleeve.sleeve_id,
      selected_neostacks: sleeve.declared_neostacks,
      selected_neoblocks: sleeve.declared_neoblocks,
      selected_molt_blocks: sleeve.declared_molt_blocks
    },
    molt_map: dashboard.molt_map ? mapMolt(dashboard.molt_map.fields) : undefined,
    ir_matrix_summary: dashboard.ir_matrix ? { available: true, node_count: dashboard.ir_matrix.nodes.length, edge_count: dashboard.ir_matrix.edges.length, symbolic: dashboard.ir_matrix.symbolic } : { available: false },
    tool_plan: toolPlanFromSleeve(sleeve),
    runtime_display: display,
    execution_boundary: { file_contents_read: false, write_performed: false, delete_performed: false, shell_command_executed: false, external_calls_performed: false, langchain_agent_started: false, mcp_server_started: false, statement: "No demo execution performed." },
    warnings: [...sleeve.warnings]
  };
}

export function demoOperationalSleeve(input: {
  sleeve_id: string;
  query?: string;
  kind?: string;
  limit?: number;
  root_path?: string;
  recursive?: boolean;
  max_depth?: number;
  max_items?: number;
  display_mode?: "compact" | "developer" | "debug";
}): OperationalSleeveDemoResultV0 {
  const sleeve = SLEEVES.find((item) => item.sleeve_id === input.sleeve_id);
  if (!sleeve) return notFoundResult(input.sleeve_id);
  if (!sleeve.demo_ready) return notDemoReadyResult(sleeve);

  if (sleeve.sleeve_id === "SL.UMG.LIBRARY_RESEARCH_DEMO.v0.1") {
    const demo = buildUMGEnvoyAlphaDemo({ query: input.query, kind: input.kind, limit: input.limit, display_mode: input.display_mode ?? "developer", include_display: true });
    return {
      demo_id: `sleeve_demo_${stableHash({ sleeve_id: sleeve.sleeve_id, query: input.query, kind: input.kind, limit: input.limit })}`,
      sleeve_id: sleeve.sleeve_id,
      status: "executed_demo",
      mode: sleeve.mode,
      active_runtime: {
        selected_sleeve: sleeve.sleeve_id,
        selected_neostacks: sleeve.declared_neostacks,
        selected_neoblocks: sleeve.declared_neoblocks,
        selected_molt_blocks: sleeve.declared_molt_blocks
      },
      demo_payload: demo,
      runtime_display: demo.display,
      tool_plan: {
        requested: ["resolver.library_search"],
        available: ["resolver.library_status", "resolver.library_search", "tool.capability_summary"],
        metadata_only: ["resolver.library_status", "resolver.library_search", "tool.capability_summary"],
        requires_approval: [],
        blocked: []
      },
      execution_boundary: { file_contents_read: false, write_performed: false, delete_performed: false, shell_command_executed: false, external_calls_performed: false, langchain_agent_started: false, mcp_server_started: false, statement: "Metadata-only sleeve demo executed." },
      warnings: []
    };
  }

  if (sleeve.sleeve_id === "SL.UMG.LOCAL_READONLY_WORKSPACE_DEMO.v0.1") {
    const runtimeSpec = compileRuntimeSpecDryRun({ user_task: `Scan ${input.root_path ?? "the workspace"} for file metadata only.`, requested_tools: ["desktop_bridge.file_scan"], execution_mode: "dry_run" });
    const handoff = buildGovernedExecutionHandoffDryRun({ runtimeSpec });
    const plan = buildLocalReadOnlyInspectionPlanDryRun({ runtimeSpec, handoff, root_path: input.root_path ?? "C:\\.openclaw\\workspace\\umg-envoy-agent-release-clean", recursive: input.recursive, max_depth: input.max_depth, max_items: input.max_items });
    const dashboard = buildRuntimeDashboard(runtimeSpec, { include_molt_map: true, include_ir_matrix: true, include_governed_handoff: true, include_approval_checkpoint: true, include_local_readonly_inspection: true, local_readonly_root_path: input.root_path ?? "C:\\.openclaw\\workspace\\umg-envoy-agent-release-clean", local_readonly_recursive: input.recursive, local_readonly_max_depth: input.max_depth, local_readonly_max_items: input.max_items, mode: "developer" });
    return {
      demo_id: `sleeve_demo_${stableHash({ sleeve_id: sleeve.sleeve_id, root_path: input.root_path, recursive: input.recursive })}`,
      sleeve_id: sleeve.sleeve_id,
      status: plan.status === "blocked" ? "blocked" : "planned_only",
      mode: sleeve.mode,
      runtime_spec_id: runtimeSpec.runtime_spec_id,
      trace_id: handoff.trace_id,
      matrix_id: dashboard.ir_matrix?.matrix_id,
      active_runtime: { selected_sleeve: sleeve.sleeve_id, selected_neostacks: sleeve.declared_neostacks, selected_neoblocks: sleeve.declared_neoblocks, selected_molt_blocks: sleeve.declared_molt_blocks },
      molt_map: dashboard.molt_map ? mapMolt(dashboard.molt_map.fields) : undefined,
      ir_matrix_summary: dashboard.ir_matrix ? { available: true, node_count: dashboard.ir_matrix.nodes.length, edge_count: dashboard.ir_matrix.edges.length, symbolic: dashboard.ir_matrix.symbolic } : { available: false },
      tool_plan: toolPlanFromSleeve(sleeve),
      approval_checkpoint: { approval_preview: plan.approval_request, checkpoint_preview: plan.checkpoint_preview, preflight: plan.preflight, scope_hash: plan.scope_hash, approval_token: plan.approval_token },
      demo_payload: plan,
      runtime_display: buildUMGRuntimeDisplayContract({ dashboard, mode: input.display_mode ?? "developer" }),
      execution_boundary: { file_contents_read: false, write_performed: false, delete_performed: false, shell_command_executed: false, external_calls_performed: false, langchain_agent_started: false, mcp_server_started: false, statement: "Local read-only sleeve demo planned only. No scan executed." },
      warnings: plan.warnings
    };
  }

  const runtimeSpec = compileRuntimeSpecDryRun({ user_task: input.query ?? "Plan a governed LangChain bridge workflow", requested_tools: ["langchain_bridge", "langchain.agent_mode"], execution_mode: "dry_run" });
  const handoff = buildGovernedExecutionHandoffDryRun({ runtimeSpec });
  const approval = buildApprovalRequestDryRun({ handoff });
  const checkpoint = buildExecutionCheckpointRecordDryRun({ handoff, approvalRequest: approval });
  const preflight = buildPreflightValidationDryRun({ handoff, approvalRequest: approval, checkpoint });
  const dashboard = buildRuntimeDashboard(runtimeSpec, { include_molt_map: true, include_ir_matrix: true, include_governed_handoff: true, include_approval_checkpoint: true, mode: "developer" });
  const display = buildUMGRuntimeDisplayContract({ dashboard, mode: input.display_mode ?? "debug" });
  return {
    demo_id: `sleeve_demo_${stableHash({ sleeve_id: sleeve.sleeve_id, query: input.query })}`,
    sleeve_id: sleeve.sleeve_id,
    status: "planned_only",
    mode: sleeve.mode,
    runtime_spec_id: runtimeSpec.runtime_spec_id,
    trace_id: handoff.trace_id,
    matrix_id: dashboard.ir_matrix?.matrix_id,
    active_runtime: { selected_sleeve: sleeve.sleeve_id, selected_neostacks: sleeve.declared_neostacks, selected_neoblocks: sleeve.declared_neoblocks, selected_molt_blocks: sleeve.declared_molt_blocks },
    molt_map: dashboard.molt_map ? mapMolt(dashboard.molt_map.fields) : undefined,
    ir_matrix_summary: dashboard.ir_matrix ? { available: true, node_count: dashboard.ir_matrix.nodes.length, edge_count: dashboard.ir_matrix.edges.length, symbolic: dashboard.ir_matrix.symbolic } : { available: false },
    tool_plan: toolPlanFromSleeve(sleeve),
    handoff,
    approval_checkpoint: { approval, checkpoint, preflight, hitl_compatible: true },
    runtime_display: display,
    execution_boundary: { file_contents_read: false, write_performed: false, delete_performed: false, shell_command_executed: false, external_calls_performed: false, langchain_agent_started: false, mcp_server_started: false, statement: "No LangChain agent started." },
    warnings: [...sleeve.warnings]
  };
}

function demoDashboardForSleeve(sleeve: OperationalSleeveProfileV0, mode: "compact" | "developer" | "debug") {
  const requested_tools = sleeve.sleeve_id === "SL.UMG.LIBRARY_RESEARCH_DEMO.v0.1" ? ["resolver.library_search"] : sleeve.sleeve_id === "SL.UMG.LOCAL_READONLY_WORKSPACE_DEMO.v0.1" ? ["desktop_bridge.file_scan"] : ["langchain_bridge", "langchain.agent_mode"];
  const runtimeSpec = compileRuntimeSpecDryRun({ user_task: sleeve.description, requested_tools, execution_mode: "dry_run" });
  return buildRuntimeDashboard(runtimeSpec, { include_molt_map: true, include_ir_matrix: true, include_governed_handoff: true, include_approval_checkpoint: true, mode });
}

function toolPlanFromSleeve(sleeve: OperationalSleeveProfileV0) {
  return {
    requested: [...sleeve.declared_tools],
    available: [...sleeve.allowed_demo_tools],
    metadata_only: sleeve.mode === "demo_metadata" ? [...sleeve.allowed_demo_tools] : [],
    requires_approval: sleeve.approval_required ? [...sleeve.declared_tools] : [],
    blocked: [...sleeve.blocked_tools]
  };
}

function mapMolt(fields: Record<string, { value?: string }>) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, value?.value ?? ""]));
}

function notFoundResult(sleeve_id: string): OperationalSleeveDemoResultV0 {
  return {
    demo_id: `sleeve_demo_${stableHash({ sleeve_id, status: "not_found" })}`,
    sleeve_id,
    status: "not_found",
    mode: "inspect_only",
    active_runtime: { selected_sleeve: null, selected_neostacks: [], selected_neoblocks: [], selected_molt_blocks: [] },
    tool_plan: { requested: [], available: [], metadata_only: [], requires_approval: [], blocked: [] },
    execution_boundary: { file_contents_read: false, write_performed: false, delete_performed: false, shell_command_executed: false, external_calls_performed: false, langchain_agent_started: false, mcp_server_started: false, statement: "No sleeve execution performed." },
    warnings: ["sleeve not found"]
  };
}

function notDemoReadyResult(sleeve: OperationalSleeveProfileV0): OperationalSleeveDemoResultV0 {
  return {
    demo_id: `sleeve_demo_${stableHash({ sleeve_id: sleeve.sleeve_id, status: "not_demo_ready" })}`,
    sleeve_id: sleeve.sleeve_id,
    status: "not_demo_ready",
    mode: sleeve.mode,
    active_runtime: { selected_sleeve: sleeve.sleeve_id, selected_neostacks: sleeve.declared_neostacks, selected_neoblocks: sleeve.declared_neoblocks, selected_molt_blocks: sleeve.declared_molt_blocks },
    tool_plan: toolPlanFromSleeve(sleeve),
    execution_boundary: { file_contents_read: false, write_performed: false, delete_performed: false, shell_command_executed: false, external_calls_performed: false, langchain_agent_started: false, mcp_server_started: false, statement: "No sleeve execution performed." },
    warnings: ["sleeve is not demo ready"]
  };
}
