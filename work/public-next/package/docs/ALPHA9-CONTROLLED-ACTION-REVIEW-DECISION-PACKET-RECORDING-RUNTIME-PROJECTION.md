# ALPHA9 Controlled Action Review Decision Packet Recording Runtime Projection

## Purpose

Project recording-shaped review decision packet metadata into a runtime-visible summary.

The controlled action review decision packet recording runtime projection does not implement live recording, record a live decision, grant approval, or create execution authority. It projects recording-shaped metadata for runtime visibility only.

## Relationships

- **Recording schema** defines the valid metadata shape.
- **Recording design** defines intended recording semantics.
- **Review decision packet runtime projection** remains the upstream packet projection surface.

## Input shape

The input includes:
- recording packet identity
- source review decision packet reference
- source projection reference
- recording request / result metadata
- allowed recording states and actions
- blocked recording actions
- evidence requirements
- idempotency / lifecycle / audit / retention policy objects
- hard boundaries

## Output shape

The projection returns:
- packet identity + projection id
- source packet / projection summary
- recording request summary
- recording result summary
- vocabulary summary
- evidence summary
- policy summary
- hard boundaries
- projection notes

## Recording state metadata mappings

The projection preserves metadata-only state language such as:
- `recording_validated_metadata_only`
- `recording_rejected_missing_evidence`
- `recording_recorded_metadata_only_future_lane`
- `recording_superseded_metadata_only`
- `recording_revoked_metadata_only`
- `recording_expired_metadata_only`

## Recording action handling

Requested actions are surfaced as metadata only.
No requested action performs live recording in this lane.

## Evidence summary

The projection counts:
- total evidence items
- required evidence items
- present evidence items
- missing evidence items

## Blocked recording action summary

The projection summarizes blocked categories such as:
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

## Idempotency / lifecycle / audit / retention summary

The projection surfaces:
- idempotency required
- side effects disallowed
- supersession metadata-only
- revocation metadata-only
- expiration metadata-only
- audit trail required
- retention metadata-only

## Hard boundaries

Always preserved:
- recordingImplemented = false
- recordingPerformed = false
- liveDecisionRecorded = false
- reviewDecisionRecorded = false
- approvalGranted = false
- executionPerformed = false

## Non-recording guarantees

Recording projection does not equal recording.

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
Recording schema does not equal recording.
Recording projection does not equal recording.
Recording does not equal approval.
Recording does not equal execution.

## Future runtime recording notes

A later lane may design or implement live metadata recording, but that must remain explicitly separate from approval and execution authority.
