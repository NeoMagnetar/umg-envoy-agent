export interface McpServerConfig {
    server_id: string;
    transport: "stdio" | "http" | "sse";
    command?: string;
    args?: string[];
    url?: string;
    enabled?: boolean;
}
export interface McpBridgeConfig {
    servers: McpServerConfig[];
    executionEnabled?: false;
}
export declare function validateMcpBridgeConfig(config: unknown): {
    ok: boolean;
    errors: string[];
    trace: {
        event_type: string;
        timestamp_utc: string;
        message: string;
        data: {};
    }[];
};
