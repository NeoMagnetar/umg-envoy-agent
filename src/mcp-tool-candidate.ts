export interface McpToolMetadata {
  tool_name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export interface McpToolCandidate {
  candidate_id: string;
  source: "mcp";
  server_id: string;
  tool_name: string;
  description: string;
  input_schema: Record<string, unknown>;
  umg_permission_candidate: {
    default_permission: "blocked";
    requires_explicit_sleeve_allow: true;
    requires_approval_if_risk_unknown: true;
  };
  execution_enabled: false;
}

export function createMcpToolCandidate(server_id: string, tool: McpToolMetadata): McpToolCandidate {
  return {
    candidate_id: `mcp_tool_candidate_${server_id}_${tool.tool_name}`,
    source: "mcp",
    server_id,
    tool_name: tool.tool_name,
    description: tool.description,
    input_schema: tool.input_schema,
    umg_permission_candidate: {
      default_permission: "blocked",
      requires_explicit_sleeve_allow: true,
      requires_approval_if_risk_unknown: true
    },
    execution_enabled: false
  };
}
