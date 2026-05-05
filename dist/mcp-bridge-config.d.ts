export interface McpServerConfig {
    server_id: string;
    label?: string;
    transport: "stdio" | "http" | "sse";
    command?: string;
    args?: string[];
    url?: string;
    enabled?: boolean;
    metadata_only?: boolean;
}
export interface McpBridgeConfig {
    enabled?: boolean;
    mode?: "metadata_only";
    execution_enabled?: boolean;
    langchain_exposure_enabled?: boolean;
    servers: McpServerConfig[];
}
export interface McpConfigEnvelope {
    mcp_bridge: McpBridgeConfig;
}
export interface McpConfigLoadResult {
    ok: boolean;
    source: string;
    sourceType: string;
    config?: McpBridgeConfig;
    trace: Array<Record<string, unknown>>;
    errors: string[];
}
export declare function loadMcpBridgeConfig(explicitPath?: string): McpConfigLoadResult;
export declare function validateMcpBridgeConfig(config: unknown): {
    ok: boolean;
    errors: string[];
    trace: Record<string, unknown>[];
    config?: undefined;
} | {
    ok: boolean;
    config: McpBridgeConfig;
    errors: string[];
    trace: Record<string, unknown>[];
};
