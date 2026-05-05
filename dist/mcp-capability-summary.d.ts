import type { McpNormalizedMetadataResult } from "./mcp-metadata-normalizer.js";
export declare function createMcpCapabilitySummary(result: McpNormalizedMetadataResult): {
    summary: {
        server_id: string;
        metadata_only: boolean;
        execution_enabled: boolean;
        langchain_exposure_enabled: boolean;
        capabilities: {
            tools: number;
            resources: number;
            prompts: number;
        };
        status: string;
    };
    trace: Record<string, unknown>[];
};
