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
  invoke_mode?: "dry_run" | "direct_execute" | "agent_execute";
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

export interface BridgeToolExecutor {
  execute(toolName: string, payload: Record<string, unknown>): Promise<unknown>;
}

export interface LangChainBridgeInvokeOptions {
  executor?: BridgeToolExecutor;
  agentRunner?: (payload: LangChainBridgePayload, approvedTools: ToolDefinition[], executor: BridgeToolExecutor) => Promise<{ ok: boolean; output?: unknown; traceEvents: TraceEvent[]; warnings: string[]; errors: string[] }>;
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

const PHASE2_ALLOWLIST = new Set(["umg_envoy_status"]);

function canExecuteInPhase2(tool: ToolDefinition, decision: "allow" | "approval_required" | "deny") {
  return decision === "allow"
    && tool.tool_name === "umg_envoy_status"
    && PHASE2_ALLOWLIST.has(tool.tool_name)
    && tool.permission_level === "read_only"
    && tool.risk_class === "low";
}

export async function invokeLangChainBridge(payload: LangChainBridgePayload, options?: LangChainBridgeInvokeOptions) {
  const trace_events: TraceEvent[] = [event(payload, "NEOSTACK_LOADED", "UMG LangChain Bridge loaded."), event(payload, "NEOSTACK_INVOKE_RECEIVED", "NeoStack invoke request received.", { call_mode: payload.call_mode, bridge_mode: payload.bridge_mode })];
  trace_events.push(...validatePayload(payload));
  const { decisions, events } = filterTools(payload);
  trace_events.push(...events);

  for (const decision of decisions) {
    trace_events.push(event(payload, "TOOL_PERMISSION_CLASSIFIED", `Tool ${decision.tool.tool_name} classified as ${decision.decision}.`, {
      tool_name: decision.tool.tool_name,
      decision: decision.decision,
      permission_level: decision.tool.permission_level,
      risk_class: decision.tool.risk_class
    }, decision.tool.tool_id));
  }

  const allowed_tools = decisions.filter(d => d.decision === "allow").map(d => d.tool);
  const approval_requests = decisions.filter(d => d.decision === "approval_required");
  const denied_tools = decisions.filter(d => d.decision === "deny");
  const execution_results: Array<Record<string, unknown>> = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  for (const item of approval_requests) {
    trace_events.push(event(payload, "TOOL_EXECUTION_SKIPPED_APPROVAL_REQUIRED", "Tool execution skipped because approval is required.", { tool_name: item.tool.tool_name }, item.tool.tool_id));
  }

  for (const item of denied_tools) {
    trace_events.push(event(payload, "TOOL_EXECUTION_DENIED", "Tool execution denied by permission filter.", { tool_name: item.tool.tool_name }, item.tool.tool_id));
  }

  const executor = options?.executor;
  const invokeMode = payload.invoke_mode ?? (payload.call_mode === "validation_only" ? "dry_run" : executor ? "direct_execute" : "dry_run");

  if (invokeMode === "dry_run" || payload.call_mode === "validation_only" || !executor && invokeMode !== "agent_execute") {
    trace_events.push(event(payload, "PROVIDER_SELECTED", "Provider selection placeholder emitted. Bind to LangChain provider adapter in runtime.", payload.provider));
    trace_events.push(event(payload, "AGENT_OR_GRAPH_CREATED", "Execution runtime placeholder emitted. Bind to create_agent or LangGraph graph runtime as needed.", { call_mode: payload.call_mode, bridge_mode: payload.bridge_mode }));
    trace_events.push(event(payload, "NEOSTACK_INVOKE_COMPLETED", "Dry-run NeoStack invocation completed without executing external tools."));
    return {
      neostack_id: NEOSTACK_ID,
      sleeve_id: payload.sleeve_id,
      status: "dry_run_ready",
      result: "LangChain Bridge payload validated. Tools filtered. Bind real LangChain/OpenClaw runtime to execute.",
      allowed_tools,
      approval_requests,
      denied_tools,
      execution_results,
      trace_events,
      warnings: ["This adapter is safe-by-default and does not execute tools until OpenClaw/LangChain bindings are attached."],
      errors
    };
  }

  if (invokeMode === "agent_execute") {
    trace_events.push(event(payload, "LANGCHAIN_AGENT_MODE_REQUESTED", "LangChain agent execution mode requested."));
    if (!executor || !options?.agentRunner) {
      const error = "LangChain agent execution is unavailable because the executor or agent runner is not bound.";
      errors.push(error);
      trace_events.push(event(payload, "LANGCHAIN_AGENT_CREATE_FAILED", "LangChain agent execution prerequisites are missing.", { error }));
      trace_events.push(event(payload, "NEOSTACK_INVOKE_COMPLETED", "NeoStack invocation completed with LangChain agent setup failure."));
      return {
        neostack_id: NEOSTACK_ID,
        sleeve_id: payload.sleeve_id,
        status: "agent_execution_unavailable",
        result: "LangChain agent execution is unavailable.",
        allowed_tools,
        approval_requests,
        denied_tools,
        execution_results,
        trace_events,
        warnings,
        errors
      };
    }

    const approvedTools = decisions.filter((item) => canExecuteInPhase2(item.tool, item.decision)).map((item) => item.tool);
    const boundExecutor = executor;
    const agentResult = await options.agentRunner(payload, approvedTools, boundExecutor);
    execution_results.push({ mode: "agent_execute", status: agentResult.ok ? "succeeded" : "failed", output: agentResult.output ?? null });
    trace_events.push(...agentResult.traceEvents);
    warnings.push(...agentResult.warnings);
    errors.push(...agentResult.errors);
    trace_events.push(event(payload, "NEOSTACK_INVOKE_COMPLETED", "NeoStack invocation completed.", { executed_count: execution_results.length, invoke_mode: invokeMode }));
    return {
      neostack_id: NEOSTACK_ID,
      sleeve_id: payload.sleeve_id,
      status: agentResult.ok ? "agent_execution_complete" : "agent_execution_failed",
      result: agentResult.ok ? "Phase 3 LangChain agent execution completed." : "Phase 3 LangChain agent execution failed.",
      allowed_tools,
      approval_requests,
      denied_tools,
      execution_results,
      trace_events,
      warnings,
      errors
    };
  }

  const directExecutor = executor;

  for (const item of decisions) {
    const tool = item.tool;
    if (!canExecuteInPhase2(tool, item.decision)) {
      if (item.decision === "allow") {
        warnings.push(`Allowed tool is not executable in Phase 2: ${tool.tool_name}`);
        trace_events.push(event(payload, "TOOL_EXECUTION_DENIED", "Allowed tool is outside the hardcoded Phase 2 execution allowlist or safety envelope.", { tool_name: tool.tool_name }, tool.tool_id));
      }
      continue;
    }

    trace_events.push(event(payload, "TOOL_EXECUTION_ALLOWED", "Tool execution allowed by Phase 2 read-only binding policy.", { tool_name: tool.tool_name }, tool.tool_id));
    trace_events.push(event(payload, "TOOL_EXECUTION_STARTED", "Tool execution started.", { tool_name: tool.tool_name }, tool.tool_id));

    try {
      const output = await directExecutor!.execute(tool.tool_name, {});
      execution_results.push({ tool_name: tool.tool_name, tool_id: tool.tool_id, status: "succeeded", output });
      trace_events.push(event(payload, "TOOL_EXECUTION_SUCCEEDED", "Tool execution succeeded.", { tool_name: tool.tool_name }, tool.tool_id));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      execution_results.push({ tool_name: tool.tool_name, tool_id: tool.tool_id, status: "failed", error: message });
      errors.push(`Tool execution failed for ${tool.tool_name}: ${message}`);
      trace_events.push(event(payload, "TOOL_EXECUTION_FAILED", "Tool execution failed.", { tool_name: tool.tool_name, error: message }, tool.tool_id));
    }
  }

  trace_events.push(event(payload, "NEOSTACK_INVOKE_COMPLETED", "NeoStack invocation completed.", { executed_count: execution_results.length, invoke_mode: invokeMode }));

  return {
    neostack_id: NEOSTACK_ID,
    sleeve_id: payload.sleeve_id,
    status: errors.length === 0 ? "execution_complete" : "execution_failed",
    result: execution_results.length > 0 ? "Phase 2 read-only tool execution completed." : "No executable Phase 2 tools were run.",
    allowed_tools,
    approval_requests,
    denied_tools,
    execution_results,
    trace_events,
    warnings,
    errors
  };
}
