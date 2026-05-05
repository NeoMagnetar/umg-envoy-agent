export function normalizeMcpMetadata(result) {
    const trace = [
        { event_type: "MCP_METADATA_NORMALIZATION_STARTED", timestamp_utc: new Date().toISOString(), message: "MCP metadata normalization started.", data: { server_id: result.server_id, adapter_mode: result.adapter_mode } }
    ];
    try {
        const tools = result.tools.map((tool) => ({
            tool_name: tool.name,
            description: tool.description ?? "",
            input_schema: tool.input_schema ?? {}
        }));
        const resources = result.resources.map((resource) => ({
            resource_name: resource.name,
            uri: resource.uri ?? null,
            description: resource.description ?? ""
        }));
        const prompts = result.prompts.map((prompt) => ({
            prompt_name: prompt.name,
            description: prompt.description ?? ""
        }));
        for (const tool of tools) {
            trace.push({ event_type: "MCP_TOOL_METADATA_EXECUTION_WITHHELD", timestamp_utc: new Date().toISOString(), message: "MCP tool metadata execution withheld.", data: { server_id: result.server_id, tool_name: tool.tool_name } });
        }
        trace.push({ event_type: "MCP_METADATA_NORMALIZATION_SUCCEEDED", timestamp_utc: new Date().toISOString(), message: "MCP metadata normalization succeeded.", data: { server_id: result.server_id, tool_count: tools.length, resource_count: resources.length, prompt_count: prompts.length } });
        return {
            server_id: result.server_id,
            adapter_mode: result.adapter_mode,
            metadata_only: true,
            execution_enabled: false,
            langchain_exposure_enabled: false,
            tools,
            resources,
            prompts,
            trace: [...result.trace, ...trace]
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        trace.push({ event_type: "MCP_METADATA_NORMALIZATION_FAILED", timestamp_utc: new Date().toISOString(), message: "MCP metadata normalization failed.", data: { server_id: result.server_id, error: message } });
        return {
            server_id: result.server_id,
            adapter_mode: result.adapter_mode,
            metadata_only: true,
            execution_enabled: false,
            langchain_exposure_enabled: false,
            tools: [],
            resources: [],
            prompts: [],
            trace: [...result.trace, ...trace]
        };
    }
}
