# ALPHA9 Controlled Action Review Decision Packet Runtime Projection

## Purpose

Project schema-shaped review decision packet metadata into a runtime-visible summary.

The controlled action review decision packet runtime projection does not record a live decision, grant approval, or create execution authority. It projects review-decision packet metadata for runtime visibility only.

## Relationships

- **Review decision packet schema** defines the valid shape.
- **Review decision packet design** defines the intended semantics.
- **Audit packet review bundle** remains the upstream review surface.

## Input shape

The input includes:
- packet identity
- source review bundle reference
- decision request metadata
- decision result metadata
- evidence requirements
- hard boundaries
- blocked decision categories
- non-approval / non-execution flags

## Output shape

The projection returns:
- packet identity + projection id
- source bundle summary
- decision request summary
- decision result summary
- route decision projections
- evidence summary
- blocked decision category summary
- repeated hard boundaries
- projection notes

## Decision projection statuses

- `denied_metadata_only`
- `needs_more_evidence_metadata_only`
- `incomplete_metadata_only`
- `dry_run_only_metadata`
- `future_execution_review_only_metadata`
- `revoked_metadata_only`
- `superseded_metadata_only`
- `expired_metadata_only`
- `no_decision_metadata_only`
- `invalid_or_rejected_metadata_only`

## Evidence summary

The projection counts:
- total evidence items
- required evidence items
- present evidence items
- missing evidence items

## Blocked decision category summary

The projection exposes blocked decision categories such as:
- execute_action
- approve_for_execution
- authorize_write_action
- authorize_bridge_action
- enable_direct_source
- enable_automatic_response_takeover

## Hard boundaries

Projection always preserves:
- approval does not equal execution
- review decision packet does not equal approval
- review decision packet does not equal execution
- liveDecisionRecorded = false
- approvalGranted = false
- executionPerformed = false

## Non-approval guarantees

Review decision packet projection does not equal approval.

## Non-execution guarantees

Review decision packet projection does not equal execution.

Policy does not equal execution.
Approval does not equal execution.
Checkpoint does not equal execution.
Dry-run does not equal execution.
Decision simulation does not equal execution.
Readiness does not equal execution.
Trace report does not equal execution.
Audit packet does not equal execution.
Audit packet export does not equal execution.
Review bundle does not equal approval.
Review bundle does not equal execution.
Review decision packet does not equal approval.
Review decision packet does not equal execution.
Review decision packet projection does not equal approval.
Review decision packet projection does not equal execution.

## Future runtime recording notes

A later recording-design lane may define how metadata could be recorded, but that must remain explicitly separate from approval and execution authority.
