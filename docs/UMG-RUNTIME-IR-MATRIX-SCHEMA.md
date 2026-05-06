# UMG Runtime IR Matrix v0 Schema

## Proposed v0 shape

```json
{
  "matrix_id": "matrix_...",
  "runtime_spec_id": "runtime_spec_...",
  "molt_map_id": "molt_map_...",
  "source": "RuntimeSpecV0",
  "mode": "dry_run",
  "created_at": "2026-05-05T00:00:00.000Z",
  "matrix_available": true,
  "nodes": [
    {
      "id": "runtime_spec_...",
      "kind": "runtime_spec",
      "label": "RuntimeSpec",
      "state": "active",
      "artifact_id": null,
      "metadata": {}
    },
    {
      "id": "NS.UMG.LANGCHAIN_BRIDGE.v0.1",
      "kind": "neostack",
      "label": "UMG LangChain Bridge",
      "state": "selected",
      "artifact_id": "NS.UMG.LANGCHAIN_BRIDGE.v0.1",
      "metadata": {
        "source_kind": "ai_machine",
        "discovery_method": "generated_index",
        "generated_from_lane": "ai_neostacks"
      }
    },
    {
      "id": "tool.langchain.agent_mode",
      "kind": "tool_binding",
      "label": "langchain.agent_mode",
      "state": "requires_approval",
      "artifact_id": null,
      "metadata": {
        "binding_scope": "requested_tool_binding"
      }
    },
    {
      "id": "gov.runtime",
      "kind": "governance",
      "label": "Governed Execution Plane",
      "state": "active",
      "artifact_id": null,
      "metadata": {
        "mcp_policy": "metadata_only",
        "langchain_policy": "governed"
      }
    }
  ],
  "edges": [
    {
      "from": "runtime_spec_...",
      "to": "NS.UMG.LANGCHAIN_BRIDGE.v0.1",
      "relation": "selects",
      "state": "active",
      "reason": "Selected as matching NeoStack runtime."
    },
    {
      "from": "NS.UMG.LANGCHAIN_BRIDGE.v0.1",
      "to": "tool.langchain.agent_mode",
      "relation": "requests_tool",
      "state": "requires_approval",
      "reason": "Requested binding is approval-gated under dry-run governance."
    },
    {
      "from": "tool.langchain.agent_mode",
      "to": "gov.runtime",
      "relation": "governed_by",
      "state": "active",
      "reason": "Tool-binding intent remains governed by policy."
    }
  ],
  "symbolic": "◆ runtime_spec_... ●\n → ▣ NS.UMG.LANGCHAIN_BRIDGE.v0.1 ●\n → 🔧 langchain.agent_mode ! requires_approval\n → ⚖ governed_execution_plane ●",
  "warnings": [],
  "trace_id": "trace_..."
}
```

## Top-level fields

### matrix_id
Stable identifier for the matrix projection.

### runtime_spec_id
Reference to the RuntimeSpecV0 that this matrix projects.

### molt_map_id
Optional reference to the Runtime MOLT Map associated with this matrix.

### source
For v0:
- `RuntimeSpecV0`

### mode
For v0:
- `dry_run`

### created_at
ISO timestamp for matrix creation.

### matrix_available
Boolean availability flag.
For matrix-producing implementations later, this should be `true`.
For placeholder references in earlier layers, this may remain `false`.

### nodes
Graph nodes representing runtime surfaces, artifacts, policies, support-only context, warnings, and trace references.

### edges
Directed relations between nodes.

### symbolic
Optional compact textual rendering of the matrix structure.

### warnings
Human-readable matrix warnings.

### trace_id
Reference to the associated trace output.

## Node kinds

Required v0 node kinds:
- `runtime_spec`
- `molt_map`
- `sleeve`
- `neostack`
- `neoblock`
- `molt_block`
- `tool_binding`
- `governance`
- `constraint`
- `support_artifact`
- `warning`
- `trace_event`
- `matrix_placeholder`

Potential later node kinds, documented only as future:
- `approval_checkpoint`
- `mcp_server`
- `langchain_agent`
- `runtime_reconfiguration`
- `draft_artifact`

These later node kinds are not required and should not imply implementation in this pass.

## Edge relations

Required v0 relations:
- `selects`
- `contains`
- `references`
- `constrains`
- `requests_tool`
- `requires_approval`
- `blocked_by`
- `governed_by`
- `supports_explanation`
- `maps_to_molt_field`
- `emits_trace`
- `has_warning`

Optional later relations, future only:
- `activates`
- `deactivates`
- `reconfigures`
- `resumes_from_checkpoint`
- `executes_tool`

Execution-oriented relations are intentionally future-only and must not be used in v0 to imply that execution occurred.

## Node states

Required v0 states:
- `active`
- `selected`
- `available`
- `support_only`
- `blocked`
- `requires_approval`
- `warning`
- `unavailable`
- `placeholder`

## State semantics

### active
Active within dry-run RuntimeSpec or active as a structural authority/reference node.
Not live execution.

### selected
Selected by RuntimeSpec in dry-run.
Not executed.

### available
Visible and available as part of the dry-run structural graph, but not necessarily selected.

### support_only
Attached for explanation/context only.
Not runtime-selectable.

### blocked
Represented but blocked by governance, policy, or boundary rules.

### requires_approval
Represents a requested binding or route that cannot proceed without approval.
No execution is implied.

### warning
Represents a warning node or warning-marked relation.

### unavailable
Represents a surface that is not present, not configured, or intentionally absent.

### placeholder
Represents a future runtime surface that exists only as a placeholder in v0.

## Node metadata guidance

Node metadata may include:
- provenance fields
- source mode
- support-only markers
- approval requirement markers
- policy summaries
- blocked reason summaries
- dashboard/visibility linkage hints
- MOLT field linkage hints

Recommended artifact provenance metadata when available:
- `source_kind`
- `discovery_method`
- `generated_from_lane`
- `path`

## Edge state guidance

Edges should use the same state vocabulary as nodes for simplicity in v0.
Typical patterns:
- `selects` edge with state `active`
- `requests_tool` edge with state `requires_approval`
- `blocked_by` edge with state `blocked`
- `supports_explanation` edge with state `support_only`
- `maps_to_molt_field` edge with state `available`

## Minimal inclusion rules

A valid v0 matrix should include at minimum:
- `matrix_id`
- `runtime_spec_id`
- `source`
- `mode`
- `created_at`
- `matrix_available`
- `nodes`
- `edges`
- `warnings`
- `trace_id`

And should include at least one node of kind:
- `runtime_spec`

## Optional linkage rules

A matrix may include:
- `molt_map` node and `molt_map_id`
- symbolic rendering
- warning nodes in addition to string warnings
- trace event nodes in addition to `trace_id`
- placeholder nodes for future execution/runtime surfaces

## Hard rule

The Runtime IR Matrix is a structural dry-run projection.
It must never present itself as hidden reasoning, live activation, tool execution, or policy override.
