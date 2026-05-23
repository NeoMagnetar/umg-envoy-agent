# ALPHA9 Controlled Action Review Decision Packet Recording Design

## Purpose

Define a future metadata-only recording model for review decision packets.

The controlled action review decision packet recording design does not record a live decision, grant approval, or create execution authority. It defines a future metadata-recording model only.

## Relationships

- **Review decision packet runtime projection** shows runtime-visible packet metadata.
- **Review decision packet schema** defines valid packet shape.
- **Review decision packet design** defines the decision semantics.

## Recording request shape

The design models a future request with:
- recording request id
- review decision packet id
- review decision packet projection id
- requested recording action
- requester identity / timestamp
- recording reason
- non-recording / non-approval / non-execution flags

## Recording result shape

The design models a future result with:
- recording result id
- request linkage
- recording state
- recording accepted flag
- recording performed flag
- live decision recorded flag
- non-approval / non-execution flags

## Allowed recording states

- `recording_design_only`
- `recording_not_started`
- `recording_requested_metadata_only`
- `recording_validated_metadata_only`
- `recording_rejected_invalid`
- `recording_rejected_missing_evidence`
- `recording_recorded_metadata_only_future_lane`
- `recording_superseded_metadata_only`
- `recording_revoked_metadata_only`
- `recording_expired_metadata_only`

## Allowed recording actions

- `validate_recording_request`
- `reject_invalid_recording_request`
- `reject_missing_evidence`
- `record_metadata_only_future_lane`
- `supersede_recorded_metadata`
- `revoke_recorded_metadata`
- `expire_recorded_metadata`
- `no_recording_action`

All of these remain future metadata recording only.

## Blocked recording actions

Blocked in this design:
- `record_live_decision_now`
- `grant_approval`
- `approve_for_execution`
- `execute_action`
- `authorize_write_action`
- `authorize_bridge_action`
- `enable_direct_source`
- `enable_automatic_response_takeover`
- `write_recording_file`
- `transmit_recording`
- `publish_package`
- `restart_openclaw`
- `mutate_block_library`
- `touch_resleever`

## Evidence requirements

Evidence should reference:
- review decision packet design
- review decision packet schema
- review decision packet runtime projection
- audit packet review bundle
- audit packet export
- audit packet
- policy trace report
- policy-to-readiness integration
- readiness matrix
- blocked-route summary
- dry-run projection
- approval checkpoint
- approval-flow projection
- policy projection

## Idempotency policy

The design reserves these principles:
- recordingRequestId should be stable for the same request
- duplicate requests should not create duplicate live side effects
- future recording implementation must be idempotent
- duplicate metadata recording should return existing metadata or supersede explicitly

In this lane, no recording happens.

## Supersession / revocation / expiration

Supersession:
- later metadata recording may supersede earlier metadata
- supersession must preserve history
- supersession does not grant approval or execution

Revocation:
- metadata recording may be revoked as metadata
- revocation does not execute rollback
- revocation does not mutate external systems

Expiration:
- metadata recordings may expire
- expiration does not execute anything
- expiration does not delete history

## Audit trail requirements

A future implementation should preserve:
- request id
- packet/projection ids
- requested action
- result state
- evidence reviewed
- hard boundaries preserved
- supersession / revocation / expiration references

## Non-recording guarantees

Recording design does not equal recording.

## Non-approval guarantees
n
Recording does not equal approval.

## Non-execution guarantees

Recording does not equal execution.

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
Recording design does not equal recording.
Recording does not equal approval.
Recording does not equal execution.

## Future implementation notes

A later schema lane can formalize this recording design.
A later runtime lane can project or validate recording metadata.
Neither should allow recording to imply approval or execution automatically.
