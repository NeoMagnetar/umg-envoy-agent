# ALPHA9 Controlled Action Review Decision Packet Recording Schema Notes

## Purpose

Formalize the recording design as a JSON schema.

The controlled action review decision packet recording schema validates future recording-metadata shape only. It does not record a live decision, grant approval, or create execution authority.

## Relationship to design

This schema encodes the design-only recording model in machine-checkable form.

## Required fields

The schema requires:
- recording identity
- source review decision packet reference
- source projection reference
- recording request
- recording result
- evidence requirements
- idempotency / supersession / revocation / expiration policy sections
- audit trail and retention policy sections
- hard boundaries
- blocked recording actions
- non-recording / non-approval / non-execution flags

## Allowed recording vocabulary

Allowed states:
- recording_design_only
- recording_not_started
- recording_requested_metadata_only
- recording_validated_metadata_only
- recording_rejected_invalid
- recording_rejected_missing_evidence
- recording_recorded_metadata_only_future_lane
- recording_superseded_metadata_only
- recording_revoked_metadata_only
- recording_expired_metadata_only

Allowed actions:
- validate_recording_request
- reject_invalid_recording_request
- reject_missing_evidence
- record_metadata_only_future_lane
- supersede_recorded_metadata
- revoke_recorded_metadata
- expire_recorded_metadata
- no_recording_action

## Blocked recording vocabulary

Blocked actions include:
- record_live_decision_now
- grant_approval
- approve_for_execution
- execute_action
- authorize_write_action
- authorize_bridge_action
- enable_direct_source
- enable_automatic_response_takeover
- write_recording_file
- transmit_recording
- publish_package
- restart_openclaw
- mutate_block_library
- touch_resleever

## Evidence requirements

Schema requires evidence references for:
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

## Hard boundary fields

Schema requires hard false flags for:
- recordingImplemented
- recordingPerformed
- liveDecisionRecorded
- approvalGranted
- executionPerformed
- writeActionPerformed
- bridgeActionPerformed
- fileWritten
- externalTransmissionPerformed
- packagePublished
- directSourceEnabled
- automaticResponseTakeoverEnabled

## Example fixture

The example fixture demonstrates the schema shape and stays entirely metadata-only.

## Non-recording guarantees

Recording design does not equal recording.

## Non-approval guarantees

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

## Future runtime projection notes

A later runtime lane may project recording metadata, but no lane should allow recording metadata to imply approval or execution automatically.
