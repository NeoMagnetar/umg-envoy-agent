import type { McpBridgeConfig, McpServerConfig } from "./mcp-bridge-config.js";
import type { McpToolMetadata } from "./mcp-tool-candidate.js";

const MOCK_DISCOVERY_REGISTRY: Record<string, McpToolMetadata[]> = {
  local_example_server: [
    {
      tool_name: "example_lookup",
      description: "Example metadata-only MCP lookup tool.",
      input_schema: { type: "object", properties: { query: { type: "string" } }, additionalProperties: false }
    },
    {
      tool_name: "example_status",
      description: "Example metadata-only MCP status tool.",
      input_schema: { type: "object", properties: {}, additionalProperties: false }
    }
  ]
};

export function listMcpServers(config: McpBridgeConfig) {
  return {
    servers: config.servers.map((server) => ({
      server_id: server.server_id,
      transport: server.transport,
      enabled: server.enabled ?? true
    })),
    trace: [
      { event_type: "MCP_SERVER_REGISTRY_LOADED", timestamp_utc: new Date().toISOString(), message: "MCP server registry loaded.", data: { server_count: config.servers.length } }
    ]
  };
}

export function discoverMcpTools(config: McpBridgeConfig, serverId?: string) {
  const trace: Array<Record<string, unknown>> = [
    { event_type: "MCP_SERVER_DISCOVERY_STARTED", timestamp_utc: new Date().toISOString(), message: "MCP server discovery started.", data: { server_id: serverId ?? null } }
  ];

  const servers = serverId ? config.servers.filter((server) => server.server_id === serverId) : config.servers;
  const discovered = [] as Array<{ server: Pick<McpServerConfig, "server_id" | "transport">; tools: McpToolMetadata[] }>;

  for (const server of servers) {
    const tools = MOCK_DISCOVERY_REGISTRY[server.server_id] ?? [];
    trace.push({ event_type: "MCP_SERVER_DISCOVERY_SUCCEEDED", timestamp_utc: new Date().toISOString(), message: "MCP server discovery succeeded.", data: { server_id: server.server_id, tool_count: tools.length } });
    for (const tool of tools) {
      trace.push({ event_type: "MCP_TOOL_METADATA_DISCOVERED", timestamp_utc: new Date().toISOString(), message: "MCP tool metadata discovered.", data: { server_id: server.server_id, tool_name: tool.tool_name } });
    }
    discovered.push({ server: { server_id: server.server_id, transport: server.transport }, tools });
  }

  if (servers.length === 0) {
    trace.push({ event_type: "MCP_SERVER_DISCOVERY_FAILED", timestamp_utc: new Date().toISOString(), message: "MCP server discovery failed because the requested server was not found.", data: { server_id: serverId ?? null } });
  }

  return { discovered, trace };
}
