# Alpha9 Action Gate Approval Decision Simulation

## Purpose

Simulate what happens when an approval decision is applied to a checkpoint without executing any action.

## Supported simulated decisions

- `approve`
- `deny`
- `edit`
- `revoke`
- `expire`
- `supersede`
- `dry_run_only`

## Required output

Decision simulation should show:
- original checkpoint state
- requested decision
- allowed/rejected decision result
- resulting checkpoint state
- resulting approval state
- execution eligibility projection
- whether preview is still required
- whether dry-run is required
- updated audit trail summary
- `executionPerformed = false`
- `decisionSimulationOnly = true`

## Hard rule

Approve may make an action `execution_eligible` only as a projection.

Approve must not execute anything.
