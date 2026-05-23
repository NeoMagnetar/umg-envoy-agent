# Alpha9 Controlled Action Execution Dry-Run Schema Notes

## Purpose

Formalize the dry-run preview contract so it becomes machine-checkable without enabling execution.

## Important invariant

Dry-run does not equal execution.

The schema explicitly preserves that invariant through:
- `dryRunOnly = true`
- `executionPerformed = false`
- `dryRunDoesNotEqualExecution = true`

## Required dry-run states

The schema supports:
- `requested`
- `ready_for_preview`
- `preview_generated`
- `blocked`
- `failed_validation`
- `dry_run_complete`
- `execution_eligible_after_dry_run`
- `execution_blocked_after_dry_run`

## Required contract sections

The dry-run schema requires:
- dryRun id/version/baseline
- linked action/policy/approval/checkpoint/decision ids
- dryRun state
- dryRun request
- dryRun result
- required and blocked preconditions
- scope preview
- target preview
- expected side effects
- rollback preview
- backup preview
- audit preview
- risk confirmation
- execution eligibility after dry-run

## Execution rule

A dry-run may project future execution eligibility.
It must not perform execution in the current phase.

## Current build rule

Example fixtures in this phase should preserve:
- `actualExecutionUnavailableInThisBuild = true`
- `currentlyBlocked = true` for side-effecting routes
