import type { TraceEvent } from "./langchain-bridge-adapter.js";
import type { LangChainBridgePayload } from "./types.js";
export interface ProviderReadinessResult {
    ok: boolean;
    provider: string;
    missing: string[];
    reason?: string;
    canInvokeModel: boolean;
}
export declare function checkLangChainProviderReadiness(payload: LangChainBridgePayload): {
    readiness: ProviderReadinessResult;
    traceEvents: TraceEvent[];
};
