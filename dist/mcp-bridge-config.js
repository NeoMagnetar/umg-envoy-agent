export function validateMcpBridgeConfig(config) {
    const errors = [];
    const trace = [
        { event_type: "MCP_BRIDGE_CONFIG_VALIDATE_REQUESTED", timestamp_utc: new Date().toISOString(), message: "MCP bridge config validation requested.", data: {} }
    ];
    if (!config || typeof config !== "object") {
        errors.push("config must be an object");
    }
    const record = (config ?? {});
    const servers = record.servers;
    if (!Array.isArray(servers)) {
        errors.push("config.servers must be an array");
    }
    else {
        for (const [index, item] of servers.entries()) {
            if (!item || typeof item !== "object") {
                errors.push(`config.servers[${index}] must be an object`);
                continue;
            }
            const server = item;
            if (typeof server.server_id !== "string" || server.server_id.length === 0) {
                errors.push(`config.servers[${index}].server_id must be a non-empty string`);
            }
            if (!["stdio", "http", "sse"].includes(String(server.transport ?? ""))) {
                errors.push(`config.servers[${index}].transport must be stdio, http, or sse`);
            }
        }
    }
    if (record.executionEnabled === true) {
        errors.push("executionEnabled must remain false in Phase 5");
    }
    if (errors.length > 0) {
        trace.push({ event_type: "MCP_BRIDGE_CONFIG_REJECTED", timestamp_utc: new Date().toISOString(), message: "MCP bridge config rejected.", data: { errors } });
        return { ok: false, errors, trace };
    }
    trace.push({ event_type: "MCP_BRIDGE_CONFIG_VALIDATED", timestamp_utc: new Date().toISOString(), message: "MCP bridge config validated.", data: { server_count: Array.isArray(servers) ? servers.length : 0 } });
    return { ok: true, errors, trace };
}
