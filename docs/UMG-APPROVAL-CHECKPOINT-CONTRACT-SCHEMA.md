# UMG Approval / Checkpoint Contract Schema

## Status
Design gate only.

## Approval Request
`ApprovalRequestV0` is the user-reviewable, exact-scope request built from a governed handoff.

Required fields:
- `approval_request_id`
- `handoff_id`
- `runtime_spec_id`
- `trace_id`
- optional `matrix_id`
- optional `molt_map_id`
- `status`
- `mode: "dry_run"`
- `requested_action_summary`
- `selected_context`
- `approval_items`
- `blocked_items`
- `user_visible_summary`
- `constraints`
- `warnings`

### Approval request rules
- status cannot imply execution
- `mode` stays `dry_run`
- `blocked_items` are displayed but not approvable
- `execution_statement` must always be `No tools executed.`
- request scope must be exact-match against handoff and RuntimeSpec

## Approval Request Item
Each `ApprovalRequestItemV0` represents one tool-level approval subject.

Fields:
- `item_id`
- `tool_id`
- `requested_by.artifact_id`
- `requested_by.artifact_kind`
- `risk_level`
- `execution_mode`
- `reason`
- `user_visible_risk`
- `approval_scope`
- `status`

### Item rules
- only approval-gated tools belong here
- blocked items do not migrate into approvable items
- support-doc-derived requests are invalid
- scope is one of:
  - `single_tool`
  - `single_handoff`
  - `single_runtime_spec`
- `future_only` indicates non-live reserved state

## Approval Decision
`ApprovalDecisionV0` records the conceptual decision shape for a future phase.

Fields:
- `approval_decision_id`
- `approval_request_id`
- `decision`
- `approved_item_ids`
- `denied_item_ids`
- `decided_at`
- `decided_by`
- optional `notes`
- `execution_authorized_future_only`

### Decision rules
- approval is explicit, never inferred
- partial decisions are possible only if item IDs remain exact-match
- `execution_authorized_future_only` must remain `false` or `"future_only"` in design docs
- in this gate, no decision can unlock execution

## Checkpoint Record
`ExecutionCheckpointRecordV0` defines the future persisted boundary for governed execution replay safety.

Fields:
- `checkpoint_id`
- `handoff_id`
- optional `approval_request_id`
- `runtime_spec_id`
- `trace_id`
- `status`
- `snapshot`
- `replay_guard`
- `execution_boundary`
- `warnings`

### Snapshot requirements
The snapshot must preserve hashes for:
- RuntimeSpec content
- tool plan content
- selected context content
- approval request content, if present
- policy version

### Boundary requirements
- `execution_performed` is always `false`
- `checkpoint_written` is always `false` in this design gate
- `statement` is always `No tools executed.`

## Resume Reference
`ExecutionResumeReferenceV0` identifies the future resume boundary.

Fields:
- `resume_reference_id`
- `checkpoint_id`
- `handoff_id`
- `runtime_spec_id`
- `status`
- `resume_guard`
- `execution_boundary`

### Resume rules
- resume requires checkpoint material
- resume must revalidate policy and exact-match scope
- resume cannot exist independently of checkpoint identity
- resume is design-only in this gate

## Preflight Check Shape
`ApprovalCheckpointPreflightCheckV0` captures mandatory future validation checks.

Fields:
- `code`
- `required`
- `passes_future_only`
- `failure_blocks_execution`
- `reason`

These checks exist to prove that the approved summary, the checkpoint snapshot, and the future execution request still describe the same thing.
