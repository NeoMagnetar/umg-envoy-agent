# UMG Governed Execution Handoff Approvals

## Purpose

This document defines approval-related design rules for governed execution handoff.

The handoff makes approval needs visible.
It does not invoke approval flow.

## Approval relationship to tool bindings

Approval requirements derive from classified tool bindings.

Typical mappings:
- `requires_approval` tool binding → handoff approval item
- `blocked` tool binding → blocked item, not executable approval item
- `metadata_only` tool binding → no approval required
- read-only dry-run tool binding → may remain `not_required` depending on policy

## Approval object semantics

```ts
approval: {
  approval_required: boolean;
  approval_items: GovernedApprovalItemV0[];
  approval_status: "not_required" | "required" | "blocked" | "future_only";
}
```

### approval_required
True when at least one non-blocked tool requires approval before possible future execution.

### approval_items
Structured list of approval-gated tool intents.

### approval_status
Recommended semantics:
- `not_required` → no approval-gated tools
- `required` → approval-gated tools exist
- `blocked` → execution cannot proceed because blocked tools dominate the plan
- `future_only` → reserved for later approval/checkpoint integration

## Approval item semantics

Approval items should include:
- tool id
- risk level
- execution mode
- requested-by artifact
- reason
- optional prompt preview
- status

Prompt preview, if present, is explanatory only in this gate.
It must not trigger execution.

## Example 1 — LangChain approval handoff

Input:
- `Use the LangChain bridge for a governed workflow.`

Expected:
- handoff status: `requires_approval`
- approval items include:
  - `langchain_bridge`
  - `langchain.agent_mode`
- checkpoint policy: `required_before_execution`
- execution boundary remains false

## Example 2 — Read-only file scan handoff

Input:
- `Use a file inventory sleeve to scan files in dry-run mode.`

Expected:
- handoff status: `draft` or `ready_for_approval`
- tool: `desktop_bridge.file_scan`
- approval may remain false under conservative dry-run policy
- execution boundary remains false

## Example 3 — Destructive cleanup blocked

Input:
- `Use a cleanup sleeve to delete old files.`

Expected:
- handoff status: `blocked`
- blocked items include:
  - `desktop_bridge.file_delete`
- do not create an executable approval path for the blocked action

## Approval boundary rules

1. Handoff approval design does not invoke approval flow.
2. Handoff approval design does not mark approval granted.
3. Handoff approval design does not write checkpoints.
4. Handoff approval design does not resume execution.
5. `approval_required` must not be treated as approved.
6. `available` must not be treated as approved.
7. Blocked tools must remain blocked.
8. `No tools executed.` must remain explicit.
