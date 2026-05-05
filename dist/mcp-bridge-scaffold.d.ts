import type { McpBridgeConfig, McpServerConfig } from "./mcp-bridge-config.js";
import { normalizeMcpMetadata } from "./mcp-metadata-normalizer.js";
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
export declare function discoverMcpTools(config: McpBridgeConfig, serverId?: string): Promise<{
    discovered: {
        server: Pick<McpServerConfig, "server_id" | "transport">;
        metadata: ReturnType<typeof normalizeMcpMetadata>;
    }[];
    trace: Record<string, unknown>[];
}>;
