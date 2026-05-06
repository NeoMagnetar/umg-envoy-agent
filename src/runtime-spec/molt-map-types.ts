export type MOLTMapFieldName =
  | "Trigger"
  | "Directive"
  | "Instruction"
  | "Subject"
  | "Primary"
  | "Philosophy"
  | "Blueprint";

export type MOLTMapFieldSource =
  | "runtime_input"
  | "selected_sleeve"
  | "selected_neostack"
  | "selected_neoblock"
  | "selected_molt_block"
  | "governance"
  | "governance_default"
  | "visibility_layer"
  | "runtime_input_and_selection"
  | "derived_default"
  | "n/a";

export type MOLTMapConfidence =
  | "high"
  | "medium"
  | "low"
  | "n/a";

export interface RuntimeMOLTMapField {
  value: string | "n/a";
  source: MOLTMapFieldSource;
  artifact_ids: string[];
  confidence: MOLTMapConfidence;
  notes?: string[];
}

export interface RuntimeMOLTMapV0 {
  molt_map_id: string;
  runtime_spec_id: string;
  source: "RuntimeSpecV0";
  created_at: string;
  mode: "dry_run";
  fields: Record<MOLTMapFieldName, RuntimeMOLTMapField>;
  warnings: string[];
  trace_id: string;
  matrix_id: string;
  matrix_available: false;
}
