export type RuntimeInspectionQueryType =
  | "runtime_selection"
  | "inspect_artifact"
  | "inspect_sleeve"
  | "inspect_neostack"
  | "inspect_neoblock"
  | "inspect_molt_block"
  | "inspect_tool_bindings"
  | "inspect_support_docs"
  | "inspect_provenance"
  | "inspect_matrix_links"
  | "inspect_molt_map_links";

export interface RuntimeInspectionRequestV0 {
  query_type: RuntimeInspectionQueryType;
  artifact_id?: string;
  runtime_spec_id?: string;
  depth?: 0 | 1 | 2 | 3;
  include_support_docs?: boolean;
  include_provenance?: boolean;
  include_matrix_links?: boolean;
  include_molt_map_links?: boolean;
}

export interface RuntimeInspectionArtifactSummaryV0 {
  id: string;
  kind: string;
  title?: string;
  description?: string;
  status?: string;
  canonical?: boolean;
  runtime_selectable?: boolean;
  support_only?: boolean;
  source_kind?: string;
  discovery_method?: string;
  generated_from_lane?: string;
  path?: string;
}

export interface RuntimeInspectionRelationV0 {
  relation:
    | "contains"
    | "selects"
    | "references"
    | "requests_tool"
    | "requires_approval"
    | "supports_explanation"
    | "maps_to_molt_field"
    | "appears_in_matrix"
    | "has_support_doc";
  target_id: string;
  target_kind?: string;
  label?: string;
}

export interface RuntimeInspectionResultV0 {
  inspection_id: string;
  source: "resolver_registry" | "RuntimeSpecV0" | "RuntimeDashboardV0";
  query_type: RuntimeInspectionQueryType;
  artifact?: RuntimeInspectionArtifactSummaryV0;
  runtime_selection?: {
    runtime_spec_id: string;
    runtime_kind: string;
    active_sleeve: string | null;
    active_neostacks: string[];
    active_neoblocks: string[];
    active_molt_blocks: string[];
    support_artifacts: string[];
  };
  children: RuntimeInspectionArtifactSummaryV0[];
  relations: RuntimeInspectionRelationV0[];
  support_docs: RuntimeInspectionArtifactSummaryV0[];
  provenance?: {
    source_kind?: string;
    discovery_method?: string;
    generated_from_lane?: string;
    declared_by?: string;
    path?: string;
  };
  warnings: string[];
  execution_statement: "No tools executed.";
}
