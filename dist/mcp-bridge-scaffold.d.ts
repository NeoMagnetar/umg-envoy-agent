import type { McpBridgeConfig, McpServerConfig } from "./mcp-bridge-config.js";
import type { McpToolMetadata } from "./mcp-tool-candidate.js";
export declare function listMcpServers(config: McpBridgeConfig): {
    servers: {
        server_id: string;
        transport: "stdio" | "http" | "sse";
        enabled: boolean;
    }[];
    trace: {
        event_type: string;
        timestamp_utc: string;
        message: string;
        data: {
            server_count: number;
        };
    }[];
};
export declare function discoverMcpTools(config: McpBridgeConfig, serverId?: string): {
    discovered: {
        server: Pick<McpServerConfig, "server_id" | "transport">;
        tools: McpToolMetadata[];
    }[];
    trace: Record<string, unknown>[];
};
