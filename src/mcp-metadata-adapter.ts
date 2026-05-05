import type { McpServerConfig } from "./mcp-bridge-config.js";

export interface McpRawToolMetadata {
  name: string;
  description?: string;
  input_schema?: Record<string, unknown>;
}

export interface McpRawResourceMetadata {
  name: string;
  uri?: string;
  description?: string;
}

export interface McpRawPromptMetadata {
  name: string;
  description?: string;
}

export interface McpMetadataAdapterResult {
  server_id: string;
  adapter_mode: "mock" | "disabled_real";
  metadata_only: true;
  execution_enabled: false;
  langchain_exposure_enabled: false;
  tools: McpRawToolMetadata[];
  resources: McpRawResourceMetadata[];
  prompts: McpRawPromptMetadata[];
  trace: Array<Record<string, unknown>>;
}

export interface McpMetadataAdapter {
  probe(server: McpServerConfig): Promise<McpMetadataAdapterResult>;
}

const MOCK_SERVER_DATA: Record<string, { tools: McpRawToolMetadata[]; resources: McpRawResourceMetadata[]; prompts: McpRawPromptMetadata[] }> = {
  local_example_server: {
    tools: [
      { name: "example_lookup", description: "Metadata-only example lookup tool.", input_schema: { type: "object", properties: { query: { type: "string" } }, additionalProperties: false } },
      { name: "example_status", description: "Metadata-only example status tool.", input_schema: { type: "object", properties: {}, additionalProperties: false } }
    ],
    resources: [
      { name: "example_docs", uri: "mcp://local_example_server/docs", description: "Example metadata-only resource." }
    ],
    prompts: [
      { name: "example_prompt", description: "Example metadata-only prompt template." }
    ]
  }
};

export class MockMcpMetadataAdapter implements McpMetadataAdapter {
  async probe(server: McpServerConfig): Promise<McpMetadataAdapterResult> {
    const trace: Array<Record<string, unknown>> = [
      { event_type: "MCP_METADATA_ADAPTER_SELECTED", timestamp_utc: new Date().toISOString(), message: "MCP metadata adapter selected.", data: { server_id: server.server_id, adapter_mode: "mock" } },
      { event_type: "MCP_METADATA_ADAPTER_STARTED", timestamp_utc: new Date().toISOString(), message: "MCP metadata adapter started.", data: { server_id: server.server_id, adapter_mode: "mock" } }
    ];
    const data = MOCK_SERVER_DATA[server.server_id] ?? { tools: [], resources: [], prompts: [] };
    for (const resource of data.resources) {
      trace.push({ event_type: "MCP_RESOURCE_METADATA_DISCOVERED", timestamp_utc: new Date().toISOString(), message: "MCP resource metadata discovered.", data: { server_id: server.server_id, resource_name: resource.name } });
    }
    for (const prompt of data.prompts) {
      trace.push({ event_type: "MCP_PROMPT_METADATA_DISCOVERED", timestamp_utc: new Date().toISOString(), message: "MCP prompt metadata discovered.", data: { server_id: server.server_id, prompt_name: prompt.name } });
    }
    trace.push({ event_type: "MCP_METADATA_ADAPTER_SUCCEEDED", timestamp_utc: new Date().toISOString(), message: "MCP metadata adapter succeeded.", data: { server_id: server.server_id, adapter_mode: "mock", tool_count: data.tools.length, resource_count: data.resources.length, prompt_count: data.prompts.length } });
    return {
      server_id: server.server_id,
      adapter_mode: "mock",
      metadata_only: true,
      execution_enabled: false,
      langchain_exposure_enabled: false,
      tools: data.tools,
      resources: data.resources,
      prompts: data.prompts,
      trace
    };
  }
}

export class DisabledRealMcpMetadataAdapter implements McpMetadataAdapter {
  async probe(server: McpServerConfig): Promise<McpMetadataAdapterResult> {
    const trace: Array<Record<string, unknown>> = [
      { event_type: "MCP_METADATA_ADAPTER_SELECTED", timestamp_utc: new Date().toISOString(), message: "MCP metadata adapter selected.", data: { server_id: server.server_id, adapter_mode: "disabled_real" } },
      { event_type: "MCP_METADATA_ADAPTER_STARTED", timestamp_utc: new Date().toISOString(), message: "MCP metadata adapter started.", data: { server_id: server.server_id, adapter_mode: "disabled_real" } },
      { event_type: "MCP_METADATA_ADAPTER_FAILED", timestamp_utc: new Date().toISOString(), message: "Real MCP metadata adapter is disabled in Phase 5.2.", data: { server_id: server.server_id, adapter_mode: "disabled_real" } }
    ];
    return {
      server_id: server.server_id,
      adapter_mode: "disabled_real",
      metadata_only: true,
      execution_enabled: false,
      langchain_exposure_enabled: false,
      tools: [],
      resources: [],
      prompts: [],
      trace
    };
  }
}

export function selectMcpMetadataAdapter(server: McpServerConfig): McpMetadataAdapter {
  return server.server_id === "local_example_server" ? new MockMcpMetadataAdapter() : new DisabledRealMcpMetadataAdapter();
}
