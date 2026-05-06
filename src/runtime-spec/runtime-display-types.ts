export type UMGRuntimeDisplayMode = "compact" | "developer" | "debug";

export interface UMGRuntimeDisplayContractV0 {
  display_id: string;
  spec_version: "UMG_RUNTIME_DISPLAY.v0.1";
  mode: UMGRuntimeDisplayMode;

  header: {
    agent: "OpenClaw UMG Envoy";
    runtime_mode: string;
    runtime_spec_id?: string;
    trace_id?: string;
    matrix_id?: string;
    execution_statement: string;
  };

  active_runtime: {
    selected_sleeve: string | null;
    selected_neostacks: string[];
    selected_neoblocks: string[];
    selected_molt_blocks: string[];
    support_docs_runtime_selected: false;
  };

  molt_map?: {
    Trigger: string;
    Directive: string;
    Instruction: string;
    Subject: string;
    Primary: string;
    Philosophy: string;
    Blueprint: string;
  };

  ir_matrix?: {
    available: boolean;
    symbolic?: string;
    node_count?: number;
    edge_count?: number;
  };

  governance: {
    approval_required: boolean;
    checkpoint_required: boolean;
    blocked: boolean;
    tool_execution_added: boolean;
  };

  execution_boundary: {
    file_contents_read: false;
    write_performed: false;
    delete_performed: false;
    shell_command_executed: false;
    external_calls_performed: boolean;
    statement: string;
  };

  warnings: string[];
}
