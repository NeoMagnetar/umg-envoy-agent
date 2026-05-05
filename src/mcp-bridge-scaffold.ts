import type { McpBridgeConfig, McpServerConfig } from "./mcp-bridge-config.js";
import { normalizeMcpMetadata } from "./mcp-metadata-normalizer.js";
import { selectMcpMetadataAdapter } from "./mcp-metadata-adapter.js";

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

export async function discoverMcpTools(config: McpBridgeConfig, serverId?: string) {
  const trace: Array<Record<string, unknown>> = [
    { event_type: "MCP_SERVER_DISCOVERY_STARTED", timestamp_utc: new Date().toISOString(), message: "MCP server discovery started.", data: { server_id: serverId ?? null } }
  ];

  const servers = serverId ? config.servers.filter((server) => server.server_id === serverId) : config.servers;
  const discovered = [] as Array<{ server: Pick<McpServerConfig, "server_id" | "transport">; metadata: ReturnType<typeof normalizeMcpMetadata> }>;

  for (const server of servers) {
    const adapter = selectMcpMetadataAdapter(server);
    const raw = await adapter.probe(server);
    const normalized = normalizeMcpMetadata(raw);
    trace.push({ event_type: "MCP_SERVER_DISCOVERY_SUCCEEDED", timestamp_utc: new Date().toISOString(), message: "MCP server discovery succeeded.", data: { server_id: server.server_id, tool_count: normalized.tools.length, resource_count: normalized.resources.length, prompt_count: normalized.prompts.length } });
    for (const tool of normalized.tools) {
      trace.push({ event_type: "MCP_TOOL_METADATA_DISCOVERED", timestamp_utc: new Date().toISOString(), message: "MCP tool metadata discovered.", data: { server_id: server.server_id, tool_name: tool.tool_name } });
    }
    discovered.push({ server: { server_id: server.server_id, transport: server.transport }, metadata: normalized });
  }

  if (servers.length === 0) {
    trace.push({ event_type: "MCP_SERVER_DISCOVERY_FAILED", timestamp_utc: new Date().toISOString(), message: "MCP server discovery failed because the requested server was not found.", data: { server_id: serverId ?? null } });
  }

  return { discovered, trace };
}
