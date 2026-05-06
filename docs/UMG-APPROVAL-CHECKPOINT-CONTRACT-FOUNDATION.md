# UMG Approval / Checkpoint Contract Foundation

## Status
Design gate only.

This document defines the formal approval, checkpoint, and resume contract required before any future governed execution can occur.

## Scope Boundary
This phase is design-only.

It does **not**:
- approve live execution
- invoke approval flows
- write checkpoints
- mutate resume state
- execute tools
- activate sleeves live
- broaden MCP or LangChain execution
- expose hidden reasoning

Execution statement for every artifact in this phase:

> No tools executed.

## Core Model
Approval and checkpointing are separate but linked.

- **Approval** answers whether a future action was explicitly allowed.
- **Checkpoint** answers what exact dry-run state must be preserved before any future execution discussion.
- **Resume** answers whether a later continuation still matches the preserved dry-run state and policy boundary.

The contract exists to prevent:
- approving one action but executing another
- vague or open-ended tool approval
- support-doc-derived tool claims
- stale RuntimeSpec resume
- blocked-tool bypass
- treating availability as approval

## Contract Objects
The v0 design defines these objects:

1. `ApprovalRequestV0`
2. `ApprovalRequestItemV0`
3. `ApprovalDecisionV0`
4. `ExecutionCheckpointRecordV0`
5. `ExecutionResumeReferenceV0`
6. `ApprovalCheckpointPreflightCheckV0`

These are documentation and type scaffolds only in this phase.

## Approval Contract States
```ts
export type ApprovalContractStatus =
 | "not_required"
 | "required"
 | "pending"
 | "approved_future_only"
 | "denied"
 | "blocked"
 | "expired"
 | "invalid";
```

Interpretation:
- `not_required`: no approval gate is needed for the dry-run shape
- `required`: approval would be required before future execution
- `pending`: approval request exists conceptually but is undecided
- `approved_future_only`: reserved future state, still non-executing in this phase
- `denied`: explicit denial
- `blocked`: policy forbids approval under v0
- `expired`: approval window is stale
- `invalid`: shape, match, or policy integrity failed

## Checkpoint Contract States
```ts
export type CheckpointContractStatus =
 | "not_required"
 | "required"
 | "draft"
 | "ready_to_write_future_only"
 | "written_future_only"
 | "invalid"
 | "expired";
```

Interpretation:
- `not_required`: nothing resumable is being prepared
- `required`: a checkpoint would be mandatory before any future execution attempt
- `draft`: checkpoint content can be assembled conceptually but not persisted
- `ready_to_write_future_only`: reserved future state; still design-only here
- `written_future_only`: documentation-only reserved state; no file writes occur in this phase
- `invalid`: mismatch or incomplete checkpoint contract
- `expired`: checkpoint is stale for future replay

## Resume Contract States
```ts
export type ResumeContractStatus =
 | "not_applicable"
 | "requires_checkpoint"
 | "resume_ready_future_only"
 | "invalid"
 | "expired";
```

Interpretation:
- `not_applicable`: no resumable governed execution exists
- `requires_checkpoint`: resume cannot exist without checkpoint material
- `resume_ready_future_only`: reserved future state; still non-resuming in this phase
- `invalid`: mismatch or guard failure
- `expired`: stale resume reference

## Exact-Scope Principle
All approval is exact-scope.

Approval cannot be interpreted broadly across:
- different RuntimeSpec IDs
- different handoff IDs
- different tool plans
- different selected contexts
- different policy versions

A valid future approval must bind to a specific dry-run handoff and visible request summary.

## Blocked Item Principle
Blocked tools are never approvable under v0.

If a tool is blocked because it is:
- destructive
- unknown
- unsupported by governance policy
- derived from support docs rather than runtime artifacts

then it must remain outside the approvable item set.

## User-Visible Principle
Nothing may be approved unless the user-visible summary accurately states:
- what was requested
- what tools are involved
- what risks exist
- what remains blocked
- whether checkpointing would be required
- that no tools have executed

## Relationship to Existing Runtime Artifacts
The contract hangs off the existing chain:

`RuntimeSpec -> Tool Binding Classification -> Governed Execution Handoff -> Approval / Checkpoint Contract`

That means the contract is downstream of already-classified tool intent. It does not independently invent tool requests.

## Design Outcome
This phase produces the contract surface required for a later read-only dry-run implementation.

It does not authorize execution.
