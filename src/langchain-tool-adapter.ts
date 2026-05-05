import { z } from "zod";
import { tool } from "langchain";
import type { BridgeToolExecutor, ToolDefinition, TraceEvent } from "./langchain-bridge-adapter.js";
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

export interface LangChainToolAdapterResult {
  tools: unknown[];
  traceEvents: TraceEvent[];
}

export function adaptApprovedToolsToLangChain(payload: LangChainBridgePayload, approvedTools: ToolDefinition[], executor: BridgeToolExecutor): LangChainToolAdapterResult {
  const traceEvents: TraceEvent[] = [event(payload, "LANGCHAIN_TOOL_ADAPTER_STARTED", "LangChain tool adaptation started.", { approved_count: approvedTools.length })];

  const tools = approvedTools.map((definition) => {
    traceEvents.push(event(payload, "LANGCHAIN_TOOL_ADAPTER_COMPLETED", "Approved tool adapted into LangChain tool.", { tool_name: definition.tool_name }, definition.tool_id));
    return tool(async () => executor.execute(definition.tool_name, {}), {
      name: definition.tool_name,
      description: definition.description,
      schema: z.object({})
    });
  });

  return { tools, traceEvents };
}
