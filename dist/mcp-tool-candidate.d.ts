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
export declare function createMcpToolCandidate(server_id: string, tool: McpToolMetadata): McpToolCandidate;
