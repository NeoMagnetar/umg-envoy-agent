# UMG Governed Execution Handoff Foundation

## Purpose

Governed Execution Handoff defines the contract for turning a dry-run RuntimeSpec/tool-binding plan into a governed execution request object.

This phase does not execute tools.
It defines how the system will eventually say:
- this RuntimeSpec requests tool X
- tool X requires approval
- here is the proposed governed execution handoff
- no tools executed

The handoff is the bridge between:
- dry-run runtime planning
and future:
- approved live execution

## Core concept

A governed execution handoff is not execution.

It is a structured request object that says:
- RuntimeSpec wants to execute or inspect something later
- here is the selected sleeve/stack context
- here is the tool-binding intent
- here is the risk level
- here is whether approval is required
- here is what is blocked
- here is what checkpoint/resume would later need
- no tool has executed

Required wording:
- `Governed Execution Handoff`

Avoid:
- executed tool
- started tool
- ran sleeve
- activated bridge
- connected MCP
- started LangChain agent

## Position in the runtime stack

1. RuntimeSpecV0 dry-run plan
2. Sleeve / NeoStack / NeoBlock / MOLT selection
3. Tool-binding intent classification
4. Governed Execution Handoff
5. Future approval/checkpoint contract
6. Much later: approved execution

The handoff is downstream of RuntimeSpec and tool-binding classification.
Neither RuntimeSpec nor handoff executes tools.

## Current system relationship

The plugin can already show:
- Selected Sleeve / Candidate Sleeve / NeoStack runtime
- Tool Binding Intent
- Risk Level
- Approval Requirement
- Blocked Tools
- Metadata-only Tools
- Mock-only Tools
- No tools executed.

The missing layer is:
- how this tool-binding plan becomes a governed execution request later

## Handoff states

```ts
export type GovernedExecutionHandoffStatus =
  | "not_requested"
  | "draft"
  | "requires_approval"
  | "blocked"
  | "metadata_only"
  | "mock_only"
  | "ready_for_approval"
  | "approved_future_only";
```

Important:
- `approved_future_only` is documentation-only in this design gate
- do not implement approval or execution

## Handoff relationship rules

A governed execution handoff derives from:
- `RuntimeSpecV0`
- `tool_bindings.bindings[]`
- governance
- `trace_id`
- `matrix_id`
- `molt_map_id` when available
- selected sleeve/stack context

RuntimeSpec remains a dry-run plan.
Governed handoff is a downstream request description.
Neither executes tools.

## Resolution overview

The handoff should classify tool-plan outcomes like:
- metadata-only
- dry-run/read-only draft
- requires approval
- blocked
- future-only approval-ready state

Hard rule:
- execution boundary remains false in all design-gate examples

## Dashboard relationship

Dashboard should eventually show:
- `GOVERNED EXECUTION HANDOFF`
- `Status: requires_approval`
- `Approval Required: yes`
- `Blocked Tools: desktop_bridge.file_delete`
- `Metadata Only: mcp.server_metadata`
- `Checkpoint Required: yes for approval-gated external action`
- `Execution: No tools executed.`

## IR Matrix relationship

IR Matrix should eventually include structural handoff nodes.

Example:
- runtime_spec
- governed_execution_handoff
- approval-required tool nodes
- checkpoint policy nodes
- trace node

No execution edges.

## Drill-down relationship

Drill-down should eventually answer:
- what would need approval?
- why is this tool blocked?
- what checkpoint would be required?
- what trace would track this handoff?
- what selected sleeve or stack requested this tool?

Still structural only.

## Boundary rules

1. Handoff design does not execute tools.
2. Handoff design does not activate sleeves.
3. Handoff design does not call approval flow.
4. Handoff design does not create checkpoints.
5. Handoff design does not resume actions.
6. Handoff design does not broaden MCP execution.
7. Handoff design does not broaden LangChain execution.
8. Handoff design cannot convert blocked tools into executable tools.
9. Handoff design cannot convert support docs into tool declarations.
10. Handoff design cannot treat available as approved.
11. Handoff design cannot treat approval_required as approved.
12. Handoff design must keep `execution_performed: false`.
13. Handoff design must preserve `No tools executed.`

## Future path

If this design gate passes, the next phase should be:
- Governed Execution Handoff — Read-Only Dry-Run Implementation

That later phase may build handoff objects from RuntimeSpec and tool bindings, still without execution.
