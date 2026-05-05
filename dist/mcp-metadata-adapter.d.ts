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
export declare class MockMcpMetadataAdapter implements McpMetadataAdapter {
    probe(server: McpServerConfig): Promise<McpMetadataAdapterResult>;
}
export declare class DisabledRealMcpMetadataAdapter implements McpMetadataAdapter {
    probe(server: McpServerConfig): Promise<McpMetadataAdapterResult>;
}
export declare function selectMcpMetadataAdapter(server: McpServerConfig): McpMetadataAdapter;
