import type { BridgeToolExecutor, ToolDefinition, TraceEvent } from "./langchain-bridge-adapter.js";
import type { LangChainBridgePayload } from "./types.js";
export interface LangChainAgentExecutionResult {
    ok: boolean;
    output?: unknown;
    traceEvents: TraceEvent[];
    warnings: string[];
    errors: string[];
}
export declare function runMinimalLangChainAgent(payload: LangChainBridgePayload, approvedTools: ToolDefinition[], executor: BridgeToolExecutor): Promise<LangChainAgentExecutionResult>;
