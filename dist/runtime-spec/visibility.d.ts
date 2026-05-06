import type { RuntimeSpecV0 } from "./types.js";
export type RuntimeVisibilityMode = "compact" | "developer" | "debug";
export interface RuntimeVisibilityHeader {
    agent: "OpenClaw Envoy Agent";
    runtime_mode: "DRY_RUN";
    library_mode: string;
    runtime_spec_id: string;
    runtime_kind: string;
    active_sleeve: string | null;
    active_neostacks: string[];
    active_neoblocks: string[];
    active_molt_blocks: string[];
    support_artifacts: string[];
    tool_binding_summary: {
        requested: string[];
        available: string[];
        blocked: string[];
        requires_approval: string[];
    };
    governance_summary: {
        execution_mode: string;
        approval_required: boolean;
        governed_execution_plane: boolean;
        mcp_policy: string;
        langchain_policy: string;
    };
    trace_id: string;
    trace_events?: string[];
    matrix_id: string;
    matrix_available: false;
    warnings: string[];
    execution_statement: "No tools executed.";
}
export declare function buildRuntimeVisibilityHeader(spec: RuntimeSpecV0, mode?: RuntimeVisibilityMode): RuntimeVisibilityHeader;
export declare function renderRuntimeVisibilityHeader(header: RuntimeVisibilityHeader): string;
