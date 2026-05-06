# UMG Runtime Drill-Down Inspection v0 Schema

## Proposed request shape

```ts
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
```

## Proposed response shape

```ts
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
```

## Request field meanings

### query_type
Required inspection intent.

### artifact_id
Optional target artifact id.
Required for most artifact-specific inspection queries.
Not required for `runtime_selection`.

### runtime_spec_id
Optional dry-run RuntimeSpec context.
Useful when the same artifact might appear in multiple runtime projections.

### depth
Conservative depth control.

Recommended meanings:
- `0` = summary only
- `1` = one-level default expansion
- `2` = two explicit levels only when requested later
- `3` = reserved upper bound for future conservative deep inspection

Hard rule:
- default behavior should still act like one-level expansion
- deeper expansion should never be assumed silently

### include_support_docs
Whether support-only documentation should be included in `support_docs`.

### include_provenance
Whether provenance should be included in the response.

### include_matrix_links
Whether matrix-link relations should be included when Runtime IR Matrix context exists.

### include_molt_map_links
Whether MOLT-map-link relations should be included when Runtime MOLT Map context exists.

## Response field meanings

### inspection_id
Stable inspection response identifier.

### source
Primary data source used to build the inspection result.

Expected v0 values:
- `resolver_registry`
- `RuntimeSpecV0`
- `RuntimeDashboardV0`

### query_type
Echo of the request query type.

### artifact
Primary inspected artifact summary, when the query targets one artifact.

### runtime_selection
Used for `runtime_selection` queries.
Describes what is selected in the dry-run runtime.

### children
One-level child artifact summaries.
May be empty.
If child relations are unknown, return empty and add a warning rather than fabricating children.

### relations
Structural inspection relations for the target artifact or runtime-selection surface.

### support_docs
Support-only documentation summaries.
These remain non-runtime-selectable.

### provenance
Optional provenance summary.
Should preserve conservative source truth.

### warnings
Inspection warnings.
Common v0 warning:
- `No declared child relations found.`

### execution_statement
Must remain:
- `No tools executed.`

## Source selection guidance

### Use `RuntimeSpecV0` when:
- answering what is selected in dry-run runtime
- answering what tool-binding intent is present in selected runtime state
- answering runtime-level governance summaries

### Use `RuntimeDashboardV0` when:
- linking drill-down results to existing dashboard projections
- referencing available MOLT Map or IR Matrix outputs

### Use `resolver_registry` when:
- inspecting arbitrary artifact metadata by id
- answering provenance from canonical/generated metadata
- finding declared child relations from normalized registry records

## Support-doc behavior

Support docs should:
- appear in `support_docs`
- use `support_only: true`
- remain `runtime_selectable: false`
- be linked through `supports_explanation` or `has_support_doc`

Support docs must not:
- appear as runtime-selected children
- be promoted to executable/runtime artifacts by inspection alone

## Matrix-link behavior

When matrix context exists, `inspect_matrix_links` may return relations such as:
- `appears_in_matrix`
- `references`
- `contains`
- `requests_tool`
- `requires_approval`

This is still structural only.
No execution is implied.

## MOLT-map-link behavior

When MOLT Map context exists, `inspect_molt_map_links` may return:
- `maps_to_molt_field`
- field labels
- source references

This remains a role-projection link, not reasoning disclosure.

## Hard rule

Runtime Drill-Down Inspection v0 is a read-only structural inspection contract.
It must never imply live activation, tool execution, hidden reasoning, or policy override.
