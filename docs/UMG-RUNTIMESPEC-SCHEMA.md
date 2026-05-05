# UMG RuntimeSpec v0 Schema

## RuntimeSpec v0 target

```json
{
  "runtime_spec_id": "runtime_spec_...",
  "runtime_kind": "neostack_runtime",
  "source_mode": "MIXED_MODE",
  "created_at": "2026-05-05T00:00:00.000Z",
  "input": {
    "user_task": "Use LangChain bridge to run a governed workflow.",
    "requested_capabilities": [],
    "requested_tools": [],
    "risk_level": "low"
  },
  "selection": {
    "active_sleeve": null,
    "active_neostacks": [],
    "active_neoblocks": [],
    "active_molt_blocks": [],
    "support_artifacts": []
  },
  "constraints": {
    "instructions": [],
    "blocked_artifacts": [],
    "required_approvals": [],
    "protected_rules": []
  },
  "tool_bindings": {
    "requested": [],
    "available": [],
    "blocked": [],
    "requires_approval": []
  },
  "governance": {
    "execution_mode": "dry_run",
    "approval_required": false,
    "governed_execution_plane": true,
    "mcp_policy": "blocked_by_default",
    "langchain_policy": "governed"
  },
  "trace": {
    "trace_id": "trace_...",
    "selection_events": [],
    "warnings": []
  },
  "matrix": {
    "matrix_id": "matrix_...",
    "available": false
  },
  "status": "compiled"
}
```

## Field meanings

### runtime_spec_id
Stable identifier for the compiled runtime configuration.

### runtime_kind
One of:
- sleeve_runtime
- neostack_runtime
- assembled_runtime

### source_mode
Inherited from resolver status:
- SAMPLE_MODE
- FULL_LIBRARY_MODE
- MIXED_MODE
- NO_LIBRARY_MODE

### input
Request-side intent, capabilities, tools, and risk.

### selection
The active cognitive selection:
- active sleeve
- active neostacks
- active neoblocks
- active molt blocks
- attached support artifacts only for explanation/context

### constraints
Selection-time safety and policy constraints.

### tool_bindings
Requested vs available vs blocked vs approval-required tool binding view.

### governance
Handoff policy to the governed execution plane.

### trace
Selection trace and warnings.

### matrix
Reserved future reference to matrix/visibility layers.

### status
Proposed v0 statuses:
- draft
- compiled
- assembled_runtime
- blocked
- invalid

## Trace events

Suggested selection trace events:
- RUNTIMESPEC_CREATED
- SLEEVE_CANDIDATE_SELECTED
- NEOSTACK_SELECTED
- NEOBLOCK_SELECTED
- MOLT_BLOCK_SELECTED
- SUPPORT_ARTIFACT_ATTACHED
- TOOL_BINDING_REQUESTED
- APPROVAL_REQUIRED
- GOVERNANCE_HANDOFF_CREATED
- SELECTION_WARNING

## Provenance requirement

Every selected runtime artifact should preserve provenance fields from the resolver:
- source_kind
- discovery_method
- generated_from_lane when present
- path

## Design examples

### Example 1 — LangChain NeoStack runtime

Input:
- Use the LangChain bridge for a governed workflow.

Expected shape:
- runtime_kind: neostack_runtime
- active_neostacks:
  - NS.UMG.LANGCHAIN_BRIDGE.v0.1
- governance:
  - langchain_policy: governed
  - mcp_policy: blocked_by_default or metadata_only

### Example 2 — Assembled runtime / no sleeve

Input:
- Build a one-off file report.

Expected shape:
- runtime_kind: assembled_runtime
- active_sleeve: null
- warning present: no matching sleeve found

### Example 3 — Support artifact query

Input:
- Explain how this sleeve works.

Expected shape:
- support_artifacts attached
- runtime_selectable: false
- no execution requested
```