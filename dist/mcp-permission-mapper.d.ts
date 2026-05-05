import type { McpToolCandidate } from "./mcp-tool-candidate.js";
export declare function classifyMcpToolCandidate(candidate: McpToolCandidate): {
    candidate: McpToolCandidate;
    classification: {
        permission: string;
        execution_enabled: boolean;
        langchain_exposed: boolean;
    };
    trace: ({
        event_type: string;
        timestamp_utc: string;
        message: string;
        data: {
            candidate_id: string;
            default_permission: "blocked";
        };
    } | {
        event_type: string;
        timestamp_utc: string;
        message: string;
        data: {
            candidate_id: string;
            default_permission?: undefined;
        };
    })[];
};
