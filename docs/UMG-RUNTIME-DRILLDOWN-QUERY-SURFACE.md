# UMG Runtime Drill-Down Query Surface Design

## Purpose

This document defines the proposed query surface for Runtime Drill-Down Inspection v0.

This is a design-only surface.
It is not implemented in this gate.

## Proposed query intents

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
```

## Intent meanings

### runtime_selection
Question:
- what is currently selected in the dry-run runtime?

Primary source:
- RuntimeSpecV0

### inspect_artifact
Question:
- inspect this artifact by id, using the most appropriate known kind

Primary source:
- resolver registry first
- RuntimeSpec/RuntimeDashboard context second

### inspect_sleeve
Question:
- what is inside this sleeve?

Primary source:
- resolver registry declared structure
- RuntimeSpec selection context if this sleeve is selected

### inspect_neostack
Question:
- what is inside this NeoStack?

Primary source:
- resolver registry declared structure
- RuntimeSpec/IR Matrix context when selected in dry-run runtime

### inspect_neoblock
Question:
- what is inside this NeoBlock?

Primary source:
- resolver registry declared structure
- MOLT membership metadata

### inspect_molt_block
Question:
- what is this MOLT block?

Primary source:
- resolver registry metadata

### inspect_tool_bindings
Question:
- what tool-binding intent does this artifact or runtime projection contain?

Primary source:
- RuntimeSpecV0
- IR Matrix when available

### inspect_support_docs
Question:
- what support-only docs explain this artifact?

Primary source:
- resolver support artifacts
- RuntimeSpec support attachment arrays
- IR Matrix support links when available

### inspect_provenance
Question:
- what provenance explains where this artifact came from?

Primary source:
- resolver registry and selection trace provenance

### inspect_matrix_links
Question:
- where does this artifact appear in the Runtime IR Matrix?

Primary source:
- RuntimeIRMatrixV0 nodes and edges

### inspect_molt_map_links
Question:
- which Runtime MOLT Map fields reference this artifact?

Primary source:
- RuntimeMOLTMapV0 field artifact ids
- Runtime IR Matrix `maps_to_molt_field` links when available

## Proposed request shape

```json
{
  "query_type": "inspect_neostack",
  "artifact_id": "NS.UMG.LANGCHAIN_BRIDGE.v0.1",
  "depth": 1,
  "include_support_docs": true,
  "include_provenance": true,
  "include_matrix_links": true,
  "include_molt_map_links": true
}
```

## Request behavior rules

### artifact_id
- optional for `runtime_selection`
- typically required for artifact inspection queries

### depth
- default should behave as one-level expansion
- `0` means summary only
- `1` means one-level expansion
- deeper values must remain conservative and explicit

### include_support_docs
- include support-only docs in `support_docs`
- do not convert them into runtime-selected children

### include_provenance
- include provenance summary when available

### include_matrix_links
- include structural matrix appearances when matrix context exists

### include_molt_map_links
- include role-link references when MOLT Map context exists

## Proposed future surface

Potential future plugin surface:
- `umg_envoy_runtime_inspect`

Potential future CLI shape:
- `umg-envoy runtime-inspect --query-type inspect-neostack --artifact-id NS.UMG.LANGCHAIN_BRIDGE.v0.1`

These are future-only and should not be implemented in this design gate unless explicitly approved.

## Result composition rules

A result should include:
- one primary artifact summary when applicable
- zero or more child summaries
- zero or more structural relations
- optional support docs
- optional provenance
- warnings
- execution statement

If the requested relation surface is unavailable, prefer:
- empty arrays
- plus a warning

Do not fabricate relations.

## Example 1 — runtime selection

Request:
```json
{
  "query_type": "runtime_selection"
}
```

Expected result emphasis:
- active sleeve
- active NeoStacks
- active NeoBlocks
- active MOLT blocks
- support artifacts
- execution statement

## Example 2 — inspect NeoStack

Request:
```json
{
  "query_type": "inspect_neostack",
  "artifact_id": "NS.UMG.LANGCHAIN_BRIDGE.v0.1",
  "depth": 1,
  "include_provenance": true,
  "include_matrix_links": true,
  "include_molt_map_links": true
}
```

Expected result emphasis:
- artifact summary
- child summaries one level down only
- matrix-link relations if available
- MOLT-map-link relations if available
- execution statement

## Example 3 — inspect support docs

Request:
```json
{
  "query_type": "inspect_support_docs",
  "artifact_id": "NS.UMG.LANGCHAIN_BRIDGE.v0.1",
  "include_support_docs": true
}
```

Expected result emphasis:
- support docs only
- support-only status visible
- runtime-selectable remains false
- execution statement

## Example 4 — inspect matrix links

Request:
```json
{
  "query_type": "inspect_matrix_links",
  "artifact_id": "NS.UMG.LANGCHAIN_BRIDGE.v0.1",
  "include_matrix_links": true
}
```

Expected result emphasis:
- matrix appearances
- node state
- incoming/outgoing edge summaries
- execution statement

## Boundary rules for the query surface

1. The query surface is read-only.
2. It does not execute tools.
3. It does not activate sleeves.
4. It does not select a new active sleeve.
5. It does not mutate RuntimeSpec, MOLT Map, or IR Matrix.
6. It cannot bypass governance.
7. It cannot make support docs runtime-selectable.
8. It cannot expose hidden reasoning.
9. It should default to one-level expansion.
10. It should report unknown structure honestly.
