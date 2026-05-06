import type { UMGRuntimeDisplayContractV0 } from "./runtime-display-types.js";

export interface UMGEnvoyAlphaDemoReportV0 {
  demo_id: string;
  mode: "alpha_demo";
  execution_boundary: {
    file_contents_read: false;
    write_performed: false;
    delete_performed: false;
    shell_command_executed: false;
    external_calls_performed: false;
    statement: "Alpha demo completed using safe metadata-only surfaces.";
  };
  library: {
    status_available: boolean;
    source_mode?: string;
    artifact_counts?: Record<string, number>;
  };
  search_sample: {
    query: string;
    kind?: string;
    limit: number;
    result_count: number;
    results: unknown[];
  };
  capabilities: {
    metadata_alpha_targets: string[];
    local_readonly_surfaces: string[];
    blocked_capabilities: string[];
  };
  runtime_surfaces: {
    runtime_spec_dry_run: boolean;
    visibility_header: boolean;
    molt_map: boolean;
    ir_matrix: boolean;
    dashboard: boolean;
    drilldown: boolean;
  };
  local_readonly: {
    plan_surface: "umg_envoy_local_readonly_plan";
    scan_surface: "umg_envoy_local_readonly_scan";
    requires_scope_hash: true;
    requires_approval_token: true;
    requires_exact_scope_approval: true;
    requires_no_contents_confirmation: true;
    automatic_scan_performed: false;
  };
  display?: UMGRuntimeDisplayContractV0;
  warnings: string[];
}
