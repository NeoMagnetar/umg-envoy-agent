# ALPHA9 Controlled Action Blocked Route Runtime Summary

## Purpose

Provide a read-only runtime-visible summary of controlled-action routes that are known,
action-shaped, and still blocked in the current build.

This projection consolidates existing Alpha9 metadata lanes:
- controlled action gate policy projection
- approval-flow runtime projection
- approval checkpoint projection
- approval decision simulation
- dry-run runtime projection

It does **not** execute anything.
It does **not** enable bridge actions.
It does **not** expand authority.

## Questions answered

For each route the summary answers:
- what route exists
- what action it links to
- what policy it links to
- whether approval is required
- whether dry-run is required
- whether allowlist/scope/backup/rollback conditions still block execution
- whether bridge implementation is missing
- whether direct source remains disabled
- whether automatic response takeover remains disabled
- whether execution happened (always false in this lane)

## Output shape

Top-level projection:
- `blockedRouteSummaryVersion`
- `sourcePolicyId`
- `routeCount`
- `blockedCount`
- `futureActionCapableCount`
- `metadataOnlyCount`
- `executionEnabled`
- `routes[]`
- `summary`

Per-route fields:
- `blockedRouteSummaryId`
- `routeId`
- `linkedActionId`
- `linkedPolicyId`
- `linkedApprovalId`
- `linkedCheckpointId`
- `linkedDecisionSimulationId`
- `linkedDryRunId`
- `routeClass`
- `riskLevel`
- `routeStatus`
- `blockedReasons`
- `requiredApprovalState`
- `requiredDryRunState`
- `requiredAllowlistState`
- `requiredScopeValidation`
- `requiredBackupState`
- `requiredRollbackState`
- `bridgeImplementationStatus`
- `directSourceStatus`
- `automaticResponseTakeoverStatus`
- `executionEligibility`
- `executionPerformed`
- `blockedRouteSummaryOnly`
- `approvalDoesNotEqualExecution`
- `checkpointDoesNotEqualExecution`
- `dryRunDoesNotEqualExecution`
- `decisionSimulationOnly`

## Required hard flags

- `executionPerformed = false`
- `blockedRouteSummaryOnly = true`
- `approvalDoesNotEqualExecution = true`
- `checkpointDoesNotEqualExecution = true`
- `dryRunDoesNotEqualExecution = true`
- `decisionSimulationOnly = true`

## Status vocabulary

The projection uses a constrained status vocabulary:
- `blocked_policy`
- `blocked_no_approval`
- `blocked_no_allowlist`
- `blocked_scope_invalid`
- `blocked_preview_required`
- `blocked_dry_run_required`
- `blocked_backup_required`
- `blocked_rollback_required`
- `blocked_bridge_not_implemented`
- `blocked_write_actions_disabled`
- `blocked_direct_source_disabled`
- `blocked_automatic_takeover_disabled`
- `metadata_only`
- `future_action_capable`
- `execution_ineligible`

## Safety posture

This lane is metadata only.

The summary is intended to make blocked routes legible without changing runtime authority.
It should help future readiness-matrix work answer:
- what is blocked now
- what would still be required later
- what remains intentionally disabled in this build

## Current build assumptions

- bridge implementation remains unavailable
- direct source remains disabled
- automatic response takeover remains disabled
- approval/decision/dry-run/checkpoint projections are visible as metadata only
- no route becomes executable through this summary
