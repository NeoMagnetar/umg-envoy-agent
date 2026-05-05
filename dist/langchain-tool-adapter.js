import { z } from "zod";
import { tool } from "langchain";
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
export function adaptApprovedToolsToLangChain(payload, approvedTools, executor) {
    const traceEvents = [event(payload, "LANGCHAIN_TOOL_ADAPTER_STARTED", "LangChain tool adaptation started.", { approved_count: approvedTools.length })];
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
