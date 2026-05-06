# UMG Approval / Checkpoint Contract Trace

## Status
Design gate only.

This document defines how approval/checkpoint contract concepts relate to runtime trace, dashboard, matrix, and drill-down surfaces.

## Dashboard Relationship
The dashboard should eventually gain an `APPROVAL / CHECKPOINT CONTRACT` section.

Example wording:
- `Approval Status: required`
- `Approval Items: langchain.agent_mode — medium risk — exact-scope approval required`
- `Checkpoint: required before execution`
- `Resume: requires checkpoint`
- `Execution: No tools executed.`

Blocked example:
- `Approval Status: blocked`
- `Blocked Tools: desktop_bridge.file_delete — destructive — cannot be approved under v0`
- `Execution: No tools executed.`

## Matrix Relationship
The matrix should eventually add structural nodes and edges for approval/checkpoint contract state.

Allowed conceptual node pattern:
- `◆ runtime_spec ●`
- ` → ⚖ governed_execution_handoff ! requires_approval`
- ` → ⛓ approval_request ! pending`
- ` → ⛓ checkpoint_policy ! required_before_execution`
- ` → 🔧 langchain.agent_mode ! requires_approval`

Blocked example:
- `🔧 desktop_bridge.file_delete ⊘`
- ` → ⛓ approval_blocked ⊘`
- ` → ⚖ governance_policy destructive_action_blocked_by_default`

Forbidden edges in this phase:
- `executes_tool`
- `ran_tool`
- `approval_granted_and_executed`
- `checkpoint_written`
- `resume_started`

## Drill-Down Relationship
Drill-down should eventually answer:
- what needs approval
- why it needs approval
- what would be checkpointed
- what blocks this action
- what would invalidate resume
- which RuntimeSpec and tool plan the approval applies to

Recommended future drill-down views:
- `inspect_approval`
- `inspect_checkpoint`
- `inspect_resume_guard`
- `inspect_invalidation_reason`

These names align with the added design-only drill-down query types.

## Trace Expectations
Trace should be able to explain, in a future read-only phase:
- approval request derived from governed handoff
- checkpoint requirement derived from approval/risk state
- resume invalidation caused by mismatch or policy drift

Trace must remain declarative.
It must not imply execution occurred.

## Boundary
All trace and relationship work here is structural only.

> No tools executed.
