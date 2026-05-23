# Alpha9 Action Gate Approval Flow Schema Notes

## Purpose

Formalize the approval-flow contract so future controlled action approvals become machine-checkable without enabling execution.

## Important invariant

Approval does not equal execution.

The schema explicitly preserves that invariant through:
- `approvalDoesNotEqualExecution = true`
- `auditTrail.executionPerformed = false`
- `executionEligibilityProjection` being metadata only

## Required states

The schema supports these approval states:
- `requested`
- `preview_required`
- `waiting_for_approval`
- `approved`
- `denied`
- `expired`
- `revoked`
- `superseded`
- `execution_eligible`
- `execution_blocked`

## Required decisions

The schema supports these decision values:
- `approve`
- `deny`
- `edit`
- `revoke`
- `expire`
- `supersede`
- `dry_run_only`

## Execution eligibility rule

A route may be projected as `execution_eligible` only if policy allows the execution class.

Even then, that does not mean execution occurred.

The schema still keeps:
- execution blocked metadata
- execution not performed in audit trail
- no bridge actions enabled by this contract alone

## Bridge rule

Desktop Bridge and PhaseBridge routes remain blocked until a future implementation lane explicitly changes that.
