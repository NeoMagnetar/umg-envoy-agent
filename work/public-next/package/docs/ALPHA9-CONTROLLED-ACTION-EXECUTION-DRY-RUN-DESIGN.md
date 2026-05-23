# Alpha9 Controlled Action Execution Dry-Run Design

## Purpose

Design what a controlled action dry-run execution preview looks like before any real action is allowed.

This lane is design only.
It does **not** execute actions.
It does **not** enable bridge actions.
It does **not** expand execution authority.

## Core rule

**Dry-run does not equal execution.**

A dry-run may increase confidence and improve visibility, but it must not perform the action.

## What dry-run should answer

A dry-run preview should explain:
- what would be executed later
- what scope it would touch
- what files/tools/bridge routes would be involved
- what approval would be required
- whether it is currently blocked
- whether rollback/backup is required
- whether the action is still metadata-only
- whether actual execution is unavailable in this build

## Hard boundaries in this lane

- no execute actions
- no write actions
- no bridge actions
- no file mutation
- no UMG-Block-Library mutation
- no execution authority expansion
- no direct_source
- no automatic response takeover
- no package
- no publish
- no restart

## Dry-run request shape

A future dry-run request should declare:
- `dryRunId`
- `linkedActionId`
- `linkedPolicyId`
- `linkedApprovalCheckpointId`
- `linkedDecisionSimulationId`
- `requestedScope`
- `requestedTargets`
- `requestedAt`
- `requestedBy`
- `preconditions`

## Dry-run result shape

A future dry-run result should declare:
- `dryRunId`
- `resultState`
- `wouldExecuteLater`
- `dryRunOnly`
- `executionPerformed`
- `linkedPolicyId`
- `linkedApprovalCheckpointId`
- `linkedDecisionSimulationId`
- `preconditionSummary`
- `blockedPreconditions`
- `scopePreview`
- `targetPreview`
- `toolOrBridgePreview`
- `expectedSideEffects`
- `rollbackBackupPreview`
- `auditPreview`
- `riskConfirmation`
- `executionEligibilityAfterDryRun`
- `actualExecutionUnavailableInThisBuild`

## Required preconditions

Dry-run should check and report preconditions such as:
- route declared in policy
- route visible in policy projection
- approval path exists
- preview-before-approval rule satisfied
- scope is bounded
- target route is in allowlist domain
- bridge action implementation availability
- current build execution availability

## Blocked preconditions

Dry-run should explicitly report blocked preconditions such as:
- no execution implementation present
- bridge route still disabled
- approval missing or expired
- target scope outside allowed boundary
- route remains metadata-only

## Scope preview

Dry-run scope preview should make visible:
- scope kind
- scope target
- bounded/unbounded classification
- denied operation families
- projected blast radius

## Target preview

Dry-run target preview should show the concrete or abstract targets that would be touched later.
Examples:
- file path allowlist target
- Desktop Bridge route target
- PhaseBridge ledger target
- session-state target

## Expected side effects preview

Dry-run should list:
- what type of side effect would happen in a future implementation
- whether anything external would be touched
- whether side effects are currently blocked in this build

## Rollback / backup preview

Dry-run should explain:
- whether rollback would be required
- whether backup would be required
- whether reversibility is automatic/manual/unreliable

## Audit preview

Dry-run should show what would be recorded if execution were ever enabled:
- route id
- approval id
- checkpoint id
- scope
- targets
- preview ref
- decision ref
- execution result placeholder

## Risk confirmation

Dry-run should restate:
- action class
- risk level
- approval requirement
- allowlist requirement
- whether the route remains blocked

## Execution eligibility after dry-run

Dry-run may project one of these outcomes:
- still metadata-only
- preview complete but approval missing
- approval simulated but execution unavailable
- execution theoretically eligible in future but blocked in current build

Current phase should never project:
- execution performed

## Suggested next step after this lane

- `ALPHA9_CONTROLLED_ACTION_EXECUTION_DRY_RUN_SCHEMA_SOURCE`
