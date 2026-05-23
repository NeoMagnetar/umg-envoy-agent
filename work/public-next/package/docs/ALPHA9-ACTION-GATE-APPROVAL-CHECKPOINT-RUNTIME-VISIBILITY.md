# Alpha9 Action Gate Approval Checkpoint Runtime Visibility

## Purpose

Project approval checkpoint state into runtime-visible inspection surfaces without enabling execution.

## Runtime-visible checkpoint metadata should show

- checkpoint id
- linked approval id
- linked action id
- linked policy id
- checkpoint state
- approval state
- allowed decisions
- requested decision if present
- decision result if present
- scope boundaries
- preview requirement
- dry-run requirement
- expiration timestamp or policy
- audit trail summary
- execution eligibility
- `executionPerformed = false`
- `checkpointDoesNotEqualExecution = true`
- `approvalDoesNotEqualExecution = true`

## Expected checkpoint states

- `checkpoint_created`
- `waiting_for_approval`
- `preview_required`
- `approved_not_executed`
- `denied`
- `expired`
- `revoked`
- `superseded`
- `execution_eligible`
- `execution_blocked`

## Hard rule

Checkpoint runtime visibility is metadata only.
It does not:
- execute actions
- enable bridge actions
- persist real approvals globally
- create write authority
- mutate files, bridges, or runtime state
