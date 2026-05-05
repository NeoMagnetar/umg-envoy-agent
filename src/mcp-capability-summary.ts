import type { McpNormalizedMetadataResult } from "./mcp-metadata-normalizer.js";

export function createMcpCapabilitySummary(result: McpNormalizedMetadataResult) {
  const summary = {
    server_id: result.server_id,
    metadata_only: true,
    execution_enabled: false,
    langchain_exposure_enabled: false,
    capabilities: {
      tools: result.tools.length,
      resources: result.resources.length,
      prompts: result.prompts.length
    },
    status: "metadata_discovered"
  };

  const trace = [
    ...result.trace,
    { event_type: "MCP_CAPABILITY_SUMMARY_CREATED", timestamp_utc: new Date().toISOString(), message: "MCP capability summary created.", data: { server_id: result.server_id, tools: result.tools.length, resources: result.resources.length, prompts: result.prompts.length } }
  ];

  return { summary, trace };
}
