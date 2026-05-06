# UMG Governed Execution Handoff Trace Relationship

## Purpose

This document defines how governed execution handoff relates to trace, matrix, dashboard, and drill-down outputs.

The handoff should be traceable without implying execution.

## Trace relationship

A handoff should reference:
- `runtime_spec_id`
- `trace_id`
- `matrix_id` when available
- `molt_map_id` when available

This lets the user or future policy layers answer:
- which dry-run RuntimeSpec produced this handoff?
- which trace records describe the selection and tool-binding plan?
- which matrix showed structural relations for the same runtime?

## Dashboard relationship

Dashboard should eventually show a governed handoff section like:
- `GOVERNED EXECUTION HANDOFF`
- `Status: requires_approval`
- `Approval Required: yes`
- `Blocked Tools: desktop_bridge.file_delete`
- `Metadata Only: mcp.server_metadata`
- `Checkpoint Required: yes for approval-gated external action`
- `Execution: No tools executed.`

Wording must remain declarative.

## IR Matrix relationship

IR Matrix should eventually represent handoff nodes structurally.

Example:
```text
◆ runtime_spec ●
 → ⚖ governed_execution_handoff ! requires_approval
 → 🔧 langchain.agent_mode ! requires_approval
 → ⛓ checkpoint_policy required_before_execution
 → ⚑ trace_id
```

Blocked example:
```text
⚖ governed_execution_handoff ⊘ blocked
 → 🔧 desktop_bridge.file_delete ⊘ destructive
```

No execution edges.
Forbidden edges:
- `executes_tool`
- `ran_tool`
- `started_agent`
- `activated_bridge`
- `connected_remote`

## Drill-down relationship

Drill-down should eventually answer:
- what would need approval?
- why is this tool blocked?
- what checkpoint would be required?
- what trace would track this handoff?
- what selected sleeve or stack requested this tool?

This remains structural and read-only.

## Examples

### Example 1 — LangChain approval handoff
- handoff status: `requires_approval`
- approval items include LangChain bindings
- checkpoint required before execution
- execution boundary false

### Example 2 — Read-only file scan handoff
- handoff status: `draft` or `ready_for_approval`
- low-risk dry-run tool binding
- trace linked
- no execution

### Example 3 — Destructive cleanup blocked
- handoff status: `blocked`
- blocked item includes destructive delete tool
- no execution

### Example 4 — MCP metadata handoff
- handoff status: `metadata_only`
- metadata-only tool binding
- no approval required
- no execution

### Example 5 — Unknown remote execution blocked
- handoff status: `blocked`
- blocked reason reflects remote execution policy
- no execution

## Boundary rules

1. Trace linkage does not imply execution.
2. Dashboard linkage does not imply approval granted.
3. Matrix linkage does not imply a runnable path.
4. Drill-down linkage does not mutate handoff state.
5. `No tools executed.` must remain explicit.
