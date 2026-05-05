export type PermissionLevel = "read_only" | "draft_only" | "safe_execute" | "approval_required" | "blocked";
export type RiskClass = "low" | "medium" | "high" | "destructive" | "sensitive";
export type BridgeMode = "direct_openclaw_tool_bridge" | "mcp_adapter_bridge" | "mock_test_bridge";
export declare const NEOSTACK_ID = "NS.UMG.LANGCHAIN_BRIDGE.v0.1";
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
    task: {
        user_intent: string;
        input?: unknown;
        constraints?: string[];
    };
    provider: {
        mode: "static" | "dynamic" | "local" | "fallback";
        preferred?: string;
        fallback?: string;
        model?: string;
    };
    tools: {
        allowed?: string[];
        approval_required?: string[];
        blocked?: string[];
        definitions?: ToolDefinition[];
    };
    trace: {
        enabled: boolean;
        mode?: "minimal" | "full" | "debug";
    };
    retrieval?: {
        enabled?: boolean;
        mode?: "2_step_rag" | "agentic_rag" | "hybrid_rag";
        sources?: string[];
    };
    langgraph?: {
        enabled?: boolean;
        checkpointing?: boolean;
        human_in_loop?: boolean;
        max_steps?: number;
    };
    output?: {
        structured?: boolean;
        schema_name?: string;
        json_schema?: Record<string, unknown>;
    };
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
    agentRunner?: (payload: LangChainBridgePayload, approvedTools: ToolDefinition[], executor: BridgeToolExecutor) => Promise<{
        ok: boolean;
        output?: unknown;
        traceEvents: TraceEvent[];
        warnings: string[];
        errors: string[];
    }>;
}
export declare function validatePayload(payload: LangChainBridgePayload): TraceEvent[];
export declare function filterTools(payload: LangChainBridgePayload): {
    decisions: {
        tool: ToolDefinition;
        decision: "approval_required" | "allow" | "deny";
        reason: string;
    }[];
    events: TraceEvent[];
};
export declare function invokeLangChainBridge(payload: LangChainBridgePayload, options?: LangChainBridgeInvokeOptions): Promise<{
    neostack_id: string;
    sleeve_id: string;
    status: string;
    result: string;
    allowed_tools: ToolDefinition[];
    approval_requests: {
        tool: ToolDefinition;
        decision: "approval_required" | "allow" | "deny";
        reason: string;
    }[];
    denied_tools: {
        tool: ToolDefinition;
        decision: "approval_required" | "allow" | "deny";
        reason: string;
    }[];
    execution_results: Record<string, unknown>[];
    trace_events: TraceEvent[];
    warnings: string[];
    errors: string[];
}>;
