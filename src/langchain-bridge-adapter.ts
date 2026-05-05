export type PermissionLevel = "read_only" | "draft_only" | "safe_execute" | "approval_required" | "blocked";
export type RiskClass = "low" | "medium" | "high" | "destructive" | "sensitive";
export type BridgeMode = "direct_openclaw_tool_bridge" | "mcp_adapter_bridge" | "mock_test_bridge";
export const NEOSTACK_ID = "NS.UMG.LANGCHAIN_BRIDGE.v0.1";

export interface ToolDefinition {
  tool_id: string;
  tool_name: string;
  description: string;
  runtime_target: "openclaw" | "mcp" | "mock" | "local_python" | "http_api";
  input_schema: Record<string, unknown>;
  output_schema: Record<string, unknown>;
  permission_level: PermissionLevel;
  risk_class: RiskClass;
  requires_approval: boolean;
  trace_enabled: boolean;
  secrets_policy?: "none" | "runtime_only_never_to_model" | "blocked";
}

export interface LangChainBridgePayload {
  neostack_id: typeof NEOSTACK_ID;
  call_mode: "simple_agent" | "langgraph_workflow" | "rag" | "tool_bridge_only" | "validation_only";
  bridge_mode: BridgeMode;
  sleeve_id: string;
  task: { user_intent: string; input?: unknown; constraints?: string[] };
  provider: { mode: "static" | "dynamic" | "local" | "fallback"; preferred?: string; fallback?: string; model?: string };
  tools: { allowed?: string[]; approval_required?: string[]; blocked?: string[]; definitions?: ToolDefinition[] };
  trace: { enabled: boolean; mode?: "minimal" | "full" | "debug" };
  retrieval?: { enabled?: boolean; mode?: "2_step_rag" | "agentic_rag" | "hybrid_rag"; sources?: string[] };
  langgraph?: { enabled?: boolean; checkpointing?: boolean; human_in_loop?: boolean; max_steps?: number };
  output?: { structured?: boolean; schema_name?: string; json_schema?: Record<string, unknown> };
}

export interface TraceEvent {
  event_type: string;
  timestamp_utc: string;
  sleeve_id: string;
  neostack_id: string;
  neoblock_id?: string | null;
  tool_id?: string | null;
  message: string;
  data?: Record<string, unknown>;
}

function event(payload: Partial<LangChainBridgePayload>, event_type: string, message: string, data: Record<string, unknown> = {}, tool_id: string | null = null): TraceEvent {
  return {
    event_type,
    timestamp_utc: new Date().toISOString(),
    sleeve_id: payload.sleeve_id ?? "UNKNOWN",
    neostack_id: NEOSTACK_ID,
    tool_id,
    message,
    data
  };
}

export function validatePayload(payload: LangChainBridgePayload): TraceEvent[] {
  if (payload.neostack_id !== NEOSTACK_ID) throw new Error(`Wrong neostack_id: ${payload.neostack_id}`);
  for (const key of ["call_mode", "sleeve_id", "task", "provider", "tools", "trace"] as const) {
    if (!(key in payload)) throw new Error(`Missing required runtime field: ${key}`);
  }
  return [event(payload, "RUNTIME_CONTRACT_VALIDATED", "Runtime payload accepted.")];
}

export function filterTools(payload: LangChainBridgePayload) {
  const allowed = new Set(payload.tools.allowed ?? []);
  const approval = new Set(payload.tools.approval_required ?? []);
  const blocked = new Set(payload.tools.blocked ?? []);
  const definitions = payload.tools.definitions ?? [];
  const events: TraceEvent[] = [event(payload, "SLEEVE_PERMISSION_PROFILE_APPLIED", "Sleeve permission profile applied before tool registration.", { allowed: [...allowed], approval_required: [...approval], blocked: [...blocked] })];

  const decisions = definitions.map((tool) => {
    let decision: "allow" | "approval_required" | "deny" = "deny";
    let reason = "Tool was not explicitly allowed by the sleeve permission profile.";
    if (blocked.has(tool.tool_name) || tool.permission_level === "blocked") {
      decision = "deny";
      reason = "Tool is blocked by sleeve or tool contract.";
    } else if (approval.has(tool.tool_name) || tool.requires_approval || ["high", "destructive", "sensitive"].includes(tool.risk_class) || tool.permission_level === "approval_required") {
      decision = "approval_required";
      reason = "Tool requires approval because of sleeve profile, permission level, or risk class.";
    } else if (allowed.has(tool.tool_name) && ["read_only", "draft_only", "safe_execute"].includes(tool.permission_level)) {
      decision = "allow";
      reason = "Tool is explicitly allowed and below approval threshold.";
    }
    events.push(event(payload, "TOOL_DECISION", reason, { tool_name: tool.tool_name, decision, permission_level: tool.permission_level, risk_class: tool.risk_class }, tool.tool_id));
    return { tool, decision, reason };
  });
  events.push(event(payload, "TOOLS_FILTERED", "Tool permission filtering complete.", { allowed_count: decisions.filter(d => d.decision === "allow").length, approval_count: decisions.filter(d => d.decision === "approval_required").length, denied_count: decisions.filter(d => d.decision === "deny").length }));
  return { decisions, events };
}

export async function invokeLangChainBridge(payload: LangChainBridgePayload) {
  const trace_events: TraceEvent[] = [event(payload, "NEOSTACK_LOADED", "UMG LangChain Bridge loaded.")];
  trace_events.push(...validatePayload(payload));
  const { decisions, events } = filterTools(payload);
  trace_events.push(...events);
  trace_events.push(event(payload, "PROVIDER_SELECTED", "Provider selection placeholder emitted. Bind to LangChain provider adapter in runtime.", payload.provider));
  trace_events.push(event(payload, "AGENT_OR_GRAPH_CREATED", "Execution runtime placeholder emitted. Bind to create_agent or LangGraph graph runtime as needed.", { call_mode: payload.call_mode, bridge_mode: payload.bridge_mode }));
  trace_events.push(event(payload, "FINAL_RESULT_RETURNED", "Dry-run runtime result returned; no external tool was executed by this adapter skeleton."));
  return {
    neostack_id: NEOSTACK_ID,
    sleeve_id: payload.sleeve_id,
    status: "dry_run_ready",
    result: "LangChain Bridge payload validated. Tools filtered. Bind real LangChain/OpenClaw runtime to execute.",
    allowed_tools: decisions.filter(d => d.decision === "allow").map(d => d.tool),
    approval_requests: decisions.filter(d => d.decision === "approval_required"),
    denied_tools: decisions.filter(d => d.decision === "deny"),
    trace_events,
    warnings: ["This adapter is safe-by-default and does not execute tools until OpenClaw/LangChain bindings are attached."],
    errors: []
  };
}
