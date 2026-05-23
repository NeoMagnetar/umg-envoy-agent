# ALPHA9 Controlled Action Policy-to-Readiness Integration

## Purpose

Build a read-only integration layer that translates controlled action policy requirements into readiness metadata.

Policy-to-readiness integration does not grant execution authority. It translates policy requirements and route state into readiness metadata only.

## Relationships

### Policy projection
The policy projection defines what a route requires:
- approval
- dry-run
- allowlist
- scope validation
- backup / rollback
- bridge implementation
- write-action enablement
- direct source
- automatic response takeover

### Readiness matrix
The readiness matrix shows whether those requirements are currently satisfied, missing, invalid, or future-only.

### Blocked-route summary
The blocked-route summary explains why a route is blocked right now.
The policy-to-readiness layer is the translation bridge between policy requirements and readiness gates.

## Input fields

Each route input contains:
- route identity fields
- route class and risk level
- `policy` requirement flags
- `state` satisfaction / validity flags

## Output fields

Each output row contains:
- route identity fields
- `policyPresent`
- `policyRequirements`
- `readinessGates`
- `blockedReasons`
- `missingRequirements`
- `satisfiedRequirements`
- `readinessStatus`
- `executionEligibility`
- hard non-execution flags

## Readiness gate mapping

Examples:
- `approvalRequired=true` -> approval gate becomes relevant
- `dryRunRequired=false` -> dry-run gate becomes `not_required`
- `allowlistRequired=true` and unsatisfied -> `blocked_no_allowlist`
- `bridgeImplementationRequired=true` and missing -> `blocked_bridge_not_implemented`
- `writeActionsRequired=true` and disabled -> `blocked_write_actions_disabled`
- `directSourceRequired=true` and disabled -> `blocked_direct_source_disabled`
- `automaticResponseTakeoverRequired=true` and disabled -> `blocked_automatic_takeover_disabled`

## Blocked reason mapping

The integration emits blocked reasons such as:
- `blocked_policy_missing`
- `blocked_no_approval`
- `blocked_dry_run_required`
- `blocked_no_allowlist`
- `blocked_scope_invalid`
- `blocked_backup_required`
- `blocked_rollback_required`
- `blocked_bridge_not_implemented`
- `blocked_write_actions_disabled`
- `blocked_direct_source_disabled`
- `blocked_automatic_takeover_disabled`

## Non-execution rules

Always true in this lane:
- `policyToReadinessIntegrationOnly = true`
- `executionPerformed = false`
- `policyDoesNotEqualExecution = true`
- `readinessDoesNotEqualExecution = true`
- `approvalDoesNotEqualExecution = true`
- `checkpointDoesNotEqualExecution = true`
- `dryRunDoesNotEqualExecution = true`
- `decisionSimulationOnly = true`

## Future integration path

This layer is preparation for later trace/report work and eventual future execution-lane design.
It exists so Envoy can say:
- what policy requires
- what readiness currently satisfies
- what remains blocked
- why that still does not equal execution

## Explicit principles

Policy does not equal execution.
Approval does not equal execution.
Checkpoint does not equal execution.
Dry-run does not equal execution.
Decision simulation does not equal execution.
Readiness does not equal execution.
