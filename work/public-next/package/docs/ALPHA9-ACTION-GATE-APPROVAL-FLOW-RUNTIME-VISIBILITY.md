# Alpha9 Action Gate Approval Flow Runtime Visibility

## Purpose

Project approval-flow state into runtime-visible inspection surfaces without enabling execution.

## Runtime-visible approval metadata should show

- approval id
- linked action id
- linked policy id
- current approval state
- allowed decisions
- approval request summary
- approval decision summary
- preview requirement
- dry-run requirement
- scope boundaries
- expiration state
- revocation/supersession state
- audit trail summary
- execution eligibility projection
- `approvalDoesNotEqualExecution = true`
- `executionPerformed = false`

## Hard rule

Approval-flow runtime visibility is metadata only.
It does not:
- execute approval-gated actions
- enable bridge actions
- create write authority
- bypass approval or allowlist requirements
- mutate files, bridges, or runtime state
