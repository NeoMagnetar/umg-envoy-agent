export interface LocalReadOnlyInspectionScopeV0 {
    root_path: string;
    allowed: boolean;
    recursive: boolean;
    max_depth: number;
    max_items: number;
    include_hidden: boolean;
    include_system_paths: boolean;
    include_file_contents: false;
    allowed_extensions?: string[];
    blocked_extensions?: string[];
    blocked_path_patterns: string[];
    reason: string;
}
export interface LocalReadOnlyFileMetadataV0 {
    name: string;
    relative_path: string;
    item_type: "file" | "directory";
    extension?: string;
    size_bytes?: number;
    modified_at?: string;
    created_at?: string;
    depth: number;
    child_count?: number;
    skipped?: boolean;
    skipped_reason?: string;
}
export interface LocalReadOnlyInspectionResultV0 {
    result_id: string;
    runtime_spec_id: string;
    handoff_id: string;
    approval_request_id: string;
    checkpoint_id: string;
    tool_id: "desktop_bridge.file_scan";
    status: "not_requested" | "blocked" | "preflight_failed" | "executed_read_only";
    scope: LocalReadOnlyInspectionScopeV0;
    payload_policy: {
        payload_type: "read_only_file_metadata";
        contains_file_contents: false;
        contains_sensitive_data: boolean;
        redaction_applied: boolean;
        max_items: number;
        max_depth: number;
    };
    summary: {
        root_path_redacted?: string;
        item_count: number;
        file_count: number;
        directory_count: number;
        skipped_count: number;
        truncated: boolean;
    };
    items: LocalReadOnlyFileMetadataV0[];
    execution_boundary: {
        read_only_scan_performed: boolean;
        file_contents_read: false;
        write_performed: false;
        delete_performed: false;
        external_calls_performed: false;
        shell_command_executed: false;
        statement: string;
    };
    warnings: string[];
}
