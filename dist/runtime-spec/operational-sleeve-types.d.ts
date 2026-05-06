export type OperationalSleeveMode = "inspect_only" | "demo_metadata" | "demo_plan_only" | "demo_handoff_only" | "demo_local_readonly";
export type OperationalSleeveStatus = "available" | "not_found" | "not_demo_ready" | "blocked" | "requires_approval" | "executed_demo" | "planned_only";
export interface OperationalSleeveProfileV0 {
    sleeve_id: string;
    title: string;
    description: string;
    demo_ready: boolean;
    mode: OperationalSleeveMode;
    runtime_kind: "sleeve_runtime" | "neostack_runtime" | "assembled_runtime";
    declared_neostacks: string[];
    declared_neoblocks: string[];
    declared_molt_blocks: string[];
    declared_tools: string[];
    allowed_demo_tools: string[];
    blocked_tools: string[];
    approval_required: boolean;
    checkpoint_required: boolean;
    safety_boundary: {
        file_contents_read: false;
        write_performed: false;
        delete_performed: false;
        shell_command_executed: false;
        external_calls_performed: boolean;
        langchain_agent_started: false;
        mcp_server_started: false;
    };
    warnings: string[];
}
export interface OperationalSleeveDemoResultV0 {
    demo_id: string;
    sleeve_id: string;
    status: OperationalSleeveStatus;
    mode: OperationalSleeveMode;
    runtime_spec_id?: string;
    trace_id?: string;
    matrix_id?: string;
    active_runtime: {
        selected_sleeve: string | null;
        selected_neostacks: string[];
        selected_neoblocks: string[];
        selected_molt_blocks: string[];
    };
    molt_map?: Record<string, string>;
    ir_matrix_summary?: {
        available: boolean;
        node_count?: number;
        edge_count?: number;
        symbolic?: string;
    };
    tool_plan: {
        requested: string[];
        available: string[];
        metadata_only: string[];
        requires_approval: string[];
        blocked: string[];
    };
    handoff?: unknown;
    approval_checkpoint?: unknown;
    demo_payload?: unknown;
    runtime_display?: unknown;
    execution_boundary: {
        file_contents_read: false;
        write_performed: false;
        delete_performed: false;
        shell_command_executed: false;
        external_calls_performed: boolean;
        langchain_agent_started: false;
        mcp_server_started: false;
        statement: string;
    };
    warnings: string[];
}
