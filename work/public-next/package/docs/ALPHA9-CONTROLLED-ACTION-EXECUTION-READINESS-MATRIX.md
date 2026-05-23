# ALPHA9 Controlled Action Execution Readiness Matrix

## Purpose

Provide a read-only readiness matrix for controlled-action routes.

The matrix consumes or mirrors these Alpha9 runtime projection lanes:
- controlled action gate policy projection
- approval-flow runtime projection
- approval checkpoint projection
- approval decision simulation
- dry-run runtime projection
- blocked-route runtime summary

The readiness matrix does not grant execution authority. It only summarizes whether route preconditions appear satisfied, missing, blocked, or future-action-capable.

## What it answers

For each route:
- does the route exist
- is it action-capable
- what is the risk level
- is policy present
- is approval present and valid
- is checkpoint present and valid
- is decision simulation present
- is dry-run present and valid
- is allowlist satisfied
- is scope valid
- is backup required/satisfied
- is rollback required/satisfied
- is bridge implementation available
- are write actions enabled or disabled
- is direct source disabled
- is automatic response takeover disabled
- is execution eligible now or only after a future execution lane
- did execution happen (always false)

## Output surfaces

Top-level matrix:
- `matrixId`
- `generatedAt`
- `readinessMatrixOnly`
- `readinessDoesNotEqualExecution`
- `executionPerformed`
- `rows[]`
- `summary`

Each row includes:
- route links and IDs
- route class and risk level
- `readinessStatus`
- `gates`
- `blockedReasons`
- `missingRequirements`
- `satisfiedRequirements`
- `executionEligibility`
- hard non-execution flags

## Readiness statuses

- `metadata_only`
- `blocked`
- `future_action_capable`
- `dry_run_ready`
- `approval_ready`
- `policy_ready`
- `execution_ineligible`
- `execution_ready_future_only`

No status in this lane means real execution.

## Gate vocabulary

Per-row gate fields:
- policy: `present | missing`
- approval: `valid | missing | invalid | not_required`
- checkpoint: `valid | missing | invalid | not_required`
- decisionSimulation: `present | missing | not_required`
- dryRun: `valid | missing | invalid | not_required`
- allowlist: `satisfied | missing | not_required`
- scope: `valid | invalid | unknown`
- backup: `satisfied | required_missing | not_required`
- rollback: `satisfied | required_missing | not_required`
- bridgeImplementation: `available | missing | not_required`
- writeActions: `enabled | disabled`
- directSource: `enabled | disabled`
- automaticResponseTakeover: `enabled | disabled`

## Hard non-execution flags

- `executionPerformed = false`
- `readinessMatrixOnly = true`
- `approvalDoesNotEqualExecution = true`
- `checkpointDoesNotEqualExecution = true`
- `dryRunDoesNotEqualExecution = true`
- `decisionSimulationOnly = true`
- `readinessDoesNotEqualExecution = true`

## Relationship to blocked-route summary

The blocked-route summary explains why a route is blocked.

The readiness matrix sits one layer above it and shows:
- which gates are already satisfied
- which gates are still missing
- whether the route is only metadata-visible
- whether the route is future-action-capable only
- whether the route is still ineligible despite policy/readiness progress

## Relationship to future controlled action execution

This lane is still projection only.
It does not add write actions.
It does not enable bridge actions.
It does not enable direct source.
It does not enable automatic response takeover.

A future execution lane would still need explicit authority expansion and safety review.

## Explicit principles

Approval does not equal execution.
Checkpoint does not equal execution.
Dry-run does not equal execution.
Decision simulation does not equal execution.
Readiness does not equal execution.

## Safety statement

This lane does not execute actions.
It only produces a runtime-visible readiness matrix for blocked or future action-capable routes.
