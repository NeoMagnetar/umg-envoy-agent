import type { BridgeToolExecutor, ToolDefinition, TraceEvent } from "./langchain-bridge-adapter.js";
import type { LangChainBridgePayload } from "./types.js";
export interface LangChainToolAdapterResult {
    tools: unknown[];
    traceEvents: TraceEvent[];
}
export declare function adaptApprovedToolsToLangChain(payload: LangChainBridgePayload, approvedTools: ToolDefinition[], executor: BridgeToolExecutor): LangChainToolAdapterResult;
