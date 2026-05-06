export type GovernedMetadataAlphaToolV2 =
  | "resolver.library_status"
  | "resolver.library_search"
  | "tool.capability_summary";

export type GovernedMetadataAlphaCandidateToolV2 =
  | "mcp.server_metadata";

export interface MetadataAlphaPayloadPolicyV0 {
  payload_type: "metadata";
  max_items?: number;
  hard_max_items?: number;
  contains_file_content: false;
  contains_sensitive_data: false;
  contains_secret_values: false;
  contains_environment_values: false;
  redaction_required: boolean;
  support_docs_full_text_allowed: false;
}

export interface PluginNativeMetadataClassificationV0 {
  tool_id:
    | "resolver.library_status"
    | "resolver.library_search"
    | "tool.capability_summary";
  status: "metadata_only";
  risk_level: "none";
  execution_mode: "metadata_only";
  approval_required: false;
  governance_policy: "plugin_native_metadata_only";
}

export interface McpMetadataCandidateClassificationV0 {
  tool_id: "mcp.server_metadata";
  status: "metadata_only";
  risk_level: "none";
  execution_mode: "metadata_only";
  approval_required: false;
  governance_policy: "mcp_metadata_only";
  candidate_only: true;
}
