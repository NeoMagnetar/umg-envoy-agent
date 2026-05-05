import { createAgent } from "langchain";
import type { BridgeToolExecutor, ToolDefinition, TraceEvent } from "./langchain-bridge-adapter.js";
import { adaptApprovedToolsToLangChain } from "./langchain-tool-adapter.js";
import type { LangChainBridgePayload } from "./types.js";

function event(payload: Partial<LangChainBridgePayload>, event_type: string, message: string, data: Record<string, unknown> = {}, tool_id: string | null = null): TraceEvent {
  return {
    event_type,
    timestamp_utc: new Date().toISOString(),
    sleeve_id: payload.sleeve_id ?? "UNKNOWN",
    neostack_id: payload.neostack_id ?? "NS.UMG.LANGCHAIN_BRIDGE.v0.1",
    tool_id,
    message,
    data
  };
}

export interface LangChainAgentExecutionResult {
  ok: boolean;
  output?: unknown;
  traceEvents: TraceEvent[];
  warnings: string[];
  errors: string[];
}

export async function runMinimalLangChainAgent(payload: LangChainBridgePayload, approvedTools: ToolDefinition[], executor: BridgeToolExecutor): Promise<LangChainAgentExecutionResult> {
  const traceEvents: TraceEvent[] = [event(payload, "LANGCHAIN_AGENT_MODE_REQUESTED", "LangChain agent execution mode requested.")];
  const warnings: string[] = [];
  const errors: string[] = [];

  try {
    const { tools, traceEvents: toolTraceEvents } = adaptApprovedToolsToLangChain(payload, approvedTools, executor);
    traceEvents.push(...toolTraceEvents);

    traceEvents.push(event(payload, "LANGCHAIN_AGENT_CREATE_STARTED", "LangChain createAgent started.", { adapted_tool_count: approvedTools.length }));
    const agent = createAgent({
      model: "openai:gpt-4.1-mini",
      tools: tools as any,
      systemPrompt: "Use only the provided approved read-only tools."
    });
    traceEvents.push(event(payload, "LANGCHAIN_AGENT_CREATE_SUCCEEDED", "LangChain createAgent succeeded.", { adapted_tool_count: approvedTools.length }));

    traceEvents.push(event(payload, "LANGCHAIN_AGENT_INVOKE_STARTED", "LangChain agent invoke started.", { user_intent: payload.task.user_intent }));
    const output = await agent.invoke({ messages: [{ role: "user", content: payload.task.user_intent }] });
    traceEvents.push(event(payload, "LANGCHAIN_AGENT_INVOKE_SUCCEEDED", "LangChain agent invoke succeeded."));
    traceEvents.push(event(payload, "LANGCHAIN_AGENT_OUTPUT_RECEIVED", "LangChain agent output received."));

    return {
      ok: true,
      output,
      traceEvents,
      warnings,
      errors
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(message);
    const phase = traceEvents.some((item) => item.event_type === "LANGCHAIN_AGENT_CREATE_SUCCEEDED") ? "LANGCHAIN_AGENT_INVOKE_FAILED" : "LANGCHAIN_AGENT_CREATE_FAILED";
    traceEvents.push(event(payload, phase, phase === "LANGCHAIN_AGENT_CREATE_FAILED" ? "LangChain createAgent failed." : "LangChain agent invoke failed.", { error: message }));
    return {
      ok: false,
      traceEvents,
      warnings,
      errors
    };
  }
}
