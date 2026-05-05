import type { McpMetadataAdapterResult } from "./mcp-metadata-adapter.js";
export interface McpNormalizedToolMetadata {
    tool_name: string;
    description: string;
    input_schema: Record<string, unknown>;
}
export interface McpNormalizedResourceMetadata {
    resource_name: string;
    uri: string | null;
    description: string;
}
export interface McpNormalizedPromptMetadata {
    prompt_name: string;
    description: string;
}
export interface McpNormalizedMetadataResult {
    server_id: string;
    adapter_mode: "mock" | "disabled_real";
    metadata_only: true;
    execution_enabled: false;
    langchain_exposure_enabled: false;
    tools: McpNormalizedToolMetadata[];
    resources: McpNormalizedResourceMetadata[];
    prompts: McpNormalizedPromptMetadata[];
    trace: Array<Record<string, unknown>>;
}
export declare function normalizeMcpMetadata(result: McpMetadataAdapterResult): McpNormalizedMetadataResult;
