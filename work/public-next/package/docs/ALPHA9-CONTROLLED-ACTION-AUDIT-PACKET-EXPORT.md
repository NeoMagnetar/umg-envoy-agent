# ALPHA9 Controlled Action Audit Packet Export

## Purpose

Build a read-only export projection around the controlled action audit packet.

The controlled action audit packet export does not write files, transmit data, publish packages, or grant execution authority. It returns a structured export projection for review.

## Relationship to audit packet

The export layer wraps the audit packet in a stable, portable envelope so it can be:
- reviewed by humans
- handed off to other agents
- used in compliance review
- compared deterministically in tests

## Export formats

Supported metadata formats:
- `review_json`
- `handoff_json`
- `compliance_json`
- `debug_json`

## Export profiles

Supported profile metadata:
- `internal_review`
- `agent_handoff`
- `compliance_review`
- `debug_trace`

## Redaction policy

Explicit redaction policy controls whether route IDs, action IDs, policy IDs, or timestamps are replaced with deterministic redacted values.

If requested:
- routeId -> `REDACTED_ROUTE`
- linkedActionId -> `REDACTED_ACTION`
- linkedPolicyId -> `REDACTED_POLICY`
- generated timestamps -> `REDACTED_TIMESTAMP`

Shape is preserved.

## Route export shape

Each exported route includes:
- route identifiers
- route class / risk level / audit status
- evidence map
- blocked / missing / satisfied lists
- trace counts and optionally trace stages
- hard-boundary evidence through the parent export object

## Summary preservation

The export summary preserves source packet counts and adds:
- `exportedRoutes`
- `redactedRoutes`

## Hard boundaries

Always present at export level:
- `policyDoesNotEqualExecution`
- `approvalDoesNotEqualExecution`
- `checkpointDoesNotEqualExecution`
- `dryRunDoesNotEqualExecution`
- `decisionSimulationOnly`
- `readinessDoesNotEqualExecution`
- `traceReportDoesNotEqualExecution`
- `auditPacketDoesNotEqualExecution`
- `auditPacketExportDoesNotEqualExecution`

## Non-execution guarantees

This lane does not:
- write files
- transmit data
- publish packages
- execute actions
- enable bridge behavior
- enable direct source
- enable automatic response takeover

## Future use

This export projection is the handoff/review/compliance substrate above the audit packet.

## Explicit principles

Policy does not equal execution.
Approval does not equal execution.
Checkpoint does not equal execution.
Dry-run does not equal execution.
Decision simulation does not equal execution.
Readiness does not equal execution.
Trace report does not equal execution.
Audit packet does not equal execution.
Audit packet export does not equal execution.
