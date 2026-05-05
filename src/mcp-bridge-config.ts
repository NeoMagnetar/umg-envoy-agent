import fs from "node:fs";
import path from "node:path";

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

function mockFallbackConfig(): McpBridgeConfig {
  return {
    enabled: true,
    mode: "metadata_only",
    execution_enabled: false,
    langchain_exposure_enabled: false,
    servers: [
      {
        server_id: "local_example_server",
        label: "Local Example Server",
        transport: "stdio",
        command: "example-mcp-server",
        args: [],
        enabled: false,
        metadata_only: true
      }
    ]
  };
}

function defaultWorkspaceCandidates(): Array<{ type: string; path: string }> {
  return [
    { type: "plugin_workspace", path: path.resolve(process.cwd(), "config", "mcp-bridge.json") },
    { type: "project_local", path: path.resolve(process.cwd(), "mcp-bridge.json") },
    { type: "user_local", path: path.resolve(process.env.USERPROFILE ?? process.cwd(), ".umg-envoy-agent", "mcp-bridge.json") }
  ];
}

function validateAndNormalizeConfig(input: unknown, sourceLabel: string) {
  const trace: Array<Record<string, unknown>> = [];
  const errors: string[] = [];
  const record = input as Record<string, unknown>;
  const bridge = (record?.mcp_bridge ?? input) as Record<string, unknown>;

  if (!bridge || typeof bridge !== "object") {
    errors.push("mcp_bridge must be an object");
    trace.push({ event_type: "MCP_CONFIG_SCHEMA_REJECTED", timestamp_utc: new Date().toISOString(), message: "MCP config schema rejected.", data: { source: sourceLabel, errors } });
    return { ok: false, errors, trace };
  }

  const rawServers = bridge.servers;
  if (!Array.isArray(rawServers)) {
    errors.push("mcp_bridge.servers must be an array");
  }

  const seen = new Set<string>();
  const servers: McpServerConfig[] = [];
  if (Array.isArray(rawServers)) {
    for (const item of rawServers) {
      if (!item || typeof item !== "object") {
        errors.push("server entry must be an object");
        trace.push({ event_type: "MCP_SERVER_ENTRY_REJECTED", timestamp_utc: new Date().toISOString(), message: "MCP server entry rejected.", data: { reason: "entry_not_object" } });
        continue;
      }
      const entry = item as Record<string, unknown>;
      const server_id = typeof entry.server_id === "string" ? entry.server_id : "";
      const transport = typeof entry.transport === "string" ? entry.transport : "";
      if (!server_id) {
        errors.push("server_id must be a non-empty string");
        trace.push({ event_type: "MCP_SERVER_ENTRY_REJECTED", timestamp_utc: new Date().toISOString(), message: "MCP server entry rejected.", data: { reason: "missing_server_id" } });
        continue;
      }
      if (seen.has(server_id)) {
        errors.push(`duplicate server_id: ${server_id}`);
        trace.push({ event_type: "MCP_SERVER_ENTRY_REJECTED", timestamp_utc: new Date().toISOString(), message: "MCP server entry rejected.", data: { reason: "duplicate_server_id", server_id } });
        continue;
      }
      if (!["stdio", "http", "sse"].includes(transport)) {
        errors.push(`unsupported transport for ${server_id}: ${transport}`);
        trace.push({ event_type: "MCP_SERVER_ENTRY_REJECTED", timestamp_utc: new Date().toISOString(), message: "MCP server entry rejected.", data: { reason: "unsupported_transport", server_id, transport } });
        continue;
      }
      if (entry.command && typeof entry.command !== "string") {
        errors.push(`command must be a string for ${server_id}`);
        continue;
      }
      if (typeof entry.command === "string") {
        const normalized = entry.command.replace(/\\/g, "/");
        const cwd = process.cwd().replace(/\\/g, "/").toLowerCase();
        const user = (process.env.USERPROFILE ?? "").replace(/\\/g, "/").toLowerCase();
        const lowered = normalized.toLowerCase();
        const isBareCommand = !normalized.includes("/") && !normalized.includes(":");
        if (!isBareCommand && !(lowered.startsWith(cwd) || (user && lowered.startsWith(user)))) {
          errors.push(`command path outside allowed workspace/user area for ${server_id}`);
          trace.push({ event_type: "MCP_SERVER_ENTRY_REJECTED", timestamp_utc: new Date().toISOString(), message: "MCP server entry rejected.", data: { reason: "unsafe_command_path", server_id } });
          continue;
        }
      }
      seen.add(server_id);
      const normalized: McpServerConfig = {
        server_id,
        label: typeof entry.label === "string" ? entry.label : server_id,
        transport: transport as McpServerConfig["transport"],
        command: typeof entry.command === "string" ? entry.command : undefined,
        args: Array.isArray(entry.args) ? entry.args.filter((item): item is string => typeof item === "string") : [],
        url: typeof entry.url === "string" ? entry.url : undefined,
        enabled: false,
        metadata_only: true
      };
      servers.push(normalized);
      trace.push({ event_type: "MCP_SERVER_ENTRY_NORMALIZED", timestamp_utc: new Date().toISOString(), message: "MCP server entry normalized.", data: { server_id, transport } });
    }
  }

  const executionEnabled = bridge.execution_enabled === true;
  const langchainExposureEnabled = bridge.langchain_exposure_enabled === true;
  if (executionEnabled || langchainExposureEnabled || bridge.mode !== "metadata_only") {
    trace.push({ event_type: "MCP_METADATA_ONLY_MODE_ENFORCED", timestamp_utc: new Date().toISOString(), message: "MCP metadata-only mode enforced.", data: { execution_enabled_requested: executionEnabled, langchain_exposure_requested: langchainExposureEnabled, mode: bridge.mode ?? null } });
  }

  if (errors.length > 0) {
    trace.push({ event_type: "MCP_CONFIG_SCHEMA_REJECTED", timestamp_utc: new Date().toISOString(), message: "MCP config schema rejected.", data: { source: sourceLabel, errors } });
    return { ok: false, errors, trace };
  }

  const config: McpBridgeConfig = {
    enabled: bridge.enabled !== false,
    mode: "metadata_only",
    execution_enabled: false,
    langchain_exposure_enabled: false,
    servers
  };
  trace.push({ event_type: "MCP_CONFIG_SCHEMA_VALIDATED", timestamp_utc: new Date().toISOString(), message: "MCP config schema validated.", data: { source: sourceLabel, server_count: servers.length } });
  return { ok: true, config, errors, trace };
}

export function loadMcpBridgeConfig(explicitPath?: string): McpConfigLoadResult {
  const trace: Array<Record<string, unknown>> = [
    { event_type: "MCP_CONFIG_SOURCE_RESOLUTION_STARTED", timestamp_utc: new Date().toISOString(), message: "MCP config source resolution started.", data: { explicit_path: explicitPath ?? null } }
  ];

  const candidates: Array<{ type: string; path: string }> = [];
  if (explicitPath) {
    candidates.push({ type: "explicit", path: path.resolve(explicitPath) });
  }
  candidates.push(...defaultWorkspaceCandidates());

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate.path)) {
      trace.push({ event_type: "MCP_CONFIG_SOURCE_MISSING", timestamp_utc: new Date().toISOString(), message: "MCP config source missing.", data: { source_type: candidate.type, path: candidate.path } });
      continue;
    }
    trace.push({ event_type: "MCP_CONFIG_SOURCE_SELECTED", timestamp_utc: new Date().toISOString(), message: "MCP config source selected.", data: { source_type: candidate.type, path: candidate.path } });
    trace.push({ event_type: "MCP_CONFIG_FILE_READ_STARTED", timestamp_utc: new Date().toISOString(), message: "MCP config file read started.", data: { path: candidate.path } });
    try {
      const raw = fs.readFileSync(candidate.path, "utf8");
      trace.push({ event_type: "MCP_CONFIG_FILE_READ_SUCCEEDED", timestamp_utc: new Date().toISOString(), message: "MCP config file read succeeded.", data: { path: candidate.path } });
      const parsed = JSON.parse(raw);
      const validated = validateAndNormalizeConfig(parsed, candidate.path);
      return {
        ok: validated.ok,
        source: candidate.path,
        sourceType: candidate.type,
        config: validated.ok ? validated.config : undefined,
        trace: [...trace, ...validated.trace],
        errors: validated.errors
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      trace.push({ event_type: "MCP_CONFIG_FILE_READ_FAILED", timestamp_utc: new Date().toISOString(), message: "MCP config file read failed.", data: { path: candidate.path, error: message } });
      return {
        ok: false,
        source: candidate.path,
        sourceType: candidate.type,
        trace,
        errors: [message]
      };
    }
  }

  trace.push({ event_type: "MCP_MOCK_REGISTRY_FALLBACK_USED", timestamp_utc: new Date().toISOString(), message: "MCP mock registry fallback used.", data: {} });
  return {
    ok: true,
    source: "mock-fallback",
    sourceType: "mock",
    config: mockFallbackConfig(),
    trace,
    errors: []
  };
}

export function validateMcpBridgeConfig(config: unknown) {
  return validateAndNormalizeConfig(config, "inline-config");
}
