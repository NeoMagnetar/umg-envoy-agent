import { createAgent } from "langchain";
import { adaptApprovedToolsToLangChain } from "./langchain-tool-adapter.js";
import { checkLangChainProviderReadiness } from "./langchain-provider-readiness.js";
function event(payload, event_type, message, data = {}, tool_id = null) {
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
export async function runMinimalLangChainAgent(payload, approvedTools, executor) {
    const traceEvents = [event(payload, "LANGCHAIN_AGENT_MODE_REQUESTED", "LangChain agent execution mode requested.")];
    const warnings = [];
    const errors = [];
    try {
        const { readiness, traceEvents: readinessTraceEvents } = checkLangChainProviderReadiness(payload);
        traceEvents.push(...readinessTraceEvents);
        const approvedToolNames = approvedTools.map((tool) => tool.tool_name);
        if (!readiness.ok || !readiness.canInvokeModel) {
            return {
                ok: false,
                status: "agent_runtime_unavailable",
                reason: readiness.reason,
                provider: readiness.provider,
                missing: readiness.missing,
                executed: false,
                tools_exposed_to_agent: approvedToolNames,
                message: readiness.provider === "openai"
                    ? "LangChain agent mode is configured, but OpenAI model credentials are not available in this environment."
                    : "LangChain agent mode is configured, but the selected provider is not available in this environment.",
                traceEvents,
                warnings,
                errors
            };
        }
        const { tools, traceEvents: toolTraceEvents } = adaptApprovedToolsToLangChain(payload, approvedTools, executor);
        traceEvents.push(...toolTraceEvents);
        if (readiness.provider === "mock") {
            traceEvents.push(event(payload, "LANGCHAIN_AGENT_CREATE_STARTED", "Mock LangChain agent creation started.", { adapted_tool_count: approvedTools.length }));
            traceEvents.push(event(payload, "LANGCHAIN_AGENT_CREATE_SUCCEEDED", "Mock LangChain agent creation succeeded.", { adapted_tool_count: approvedTools.length }));
            traceEvents.push(event(payload, "LANGCHAIN_AGENT_INVOKE_STARTED", "Mock LangChain agent invoke started.", { user_intent: payload.task.user_intent }));
            const firstTool = approvedTools[0];
            const toolOutput = firstTool ? await executor.execute(firstTool.tool_name, {}) : null;
            const output = {
                provider: "mock",
                mode: "agent_execute",
                summary: firstTool ? `Mock agent called ${firstTool.tool_name} successfully.` : "Mock agent had no approved tools to call.",
                tool_output: toolOutput
            };
            traceEvents.push(event(payload, "LANGCHAIN_AGENT_INVOKE_SUCCEEDED", "Mock LangChain agent invoke succeeded."));
            traceEvents.push(event(payload, "LANGCHAIN_AGENT_OUTPUT_RECEIVED", "Mock LangChain agent output received."));
            return {
                ok: true,
                output,
                status: "agent_execution_complete",
                provider: readiness.provider,
                missing: [],
                executed: true,
                tools_exposed_to_agent: approvedTools.map((tool) => tool.tool_name),
                traceEvents,
                warnings,
                errors
            };
        }
        traceEvents.push(event(payload, "LANGCHAIN_AGENT_CREATE_STARTED", "LangChain createAgent started.", { adapted_tool_count: approvedTools.length }));
        const agent = createAgent({
            model: payload.provider?.model ?? "openai:gpt-4.1-mini",
            tools: tools,
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
            status: "agent_execution_complete",
            provider: payload.provider?.preferred ?? payload.provider?.model?.split(":")[0] ?? "openai",
            missing: [],
            executed: true,
            tools_exposed_to_agent: approvedTools.map((tool) => tool.tool_name),
            traceEvents,
            warnings,
            errors
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(message);
        const phase = traceEvents.some((item) => item.event_type === "LANGCHAIN_AGENT_CREATE_SUCCEEDED") ? "LANGCHAIN_AGENT_INVOKE_FAILED" : "LANGCHAIN_AGENT_CREATE_FAILED";
        traceEvents.push(event(payload, phase, phase === "LANGCHAIN_AGENT_CREATE_FAILED" ? "LangChain createAgent failed." : "LangChain agent invoke failed.", { error: message }));
        return {
            ok: false,
            status: "agent_execution_failed",
            provider: payload.provider?.preferred ?? payload.provider?.model?.split(":")[0] ?? "openai",
            missing: [],
            executed: false,
            tools_exposed_to_agent: approvedTools.map((tool) => tool.tool_name),
            traceEvents,
            warnings,
            errors
        };
    }
}
