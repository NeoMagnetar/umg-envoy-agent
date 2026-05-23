# ALPHA9 Controlled Action Review Decision Packet Schema Notes

## Purpose

Formalize the review decision packet design as a JSON schema.

The controlled action review decision packet schema validates review-decision metadata shape only. It does not record a live decision, grant approval, or create execution authority.

## Relationship to design

This schema is the formal rulebook for the design fixture and future metadata examples.

## Required fields

The schema requires:
- packet identity fields
- source review bundle reference
- decision request
- decision result
- evidence requirements
- hard boundaries
- blocked decision categories
- non-approval / non-execution flags

## Allowed decision vocabulary

Allowed decisions:
- deny
- request_more_evidence
- mark_incomplete
- approve_for_dry_run_only
- approve_for_future_execution_review_only
- revoke_prior_review
- supersede_prior_review
- expire_review
- no_decision

## Blocked decision vocabulary

Explicitly blocked categories include:
- execute_action
- approve_for_execution
- authorize_write_action
- authorize_bridge_action
- enable_direct_source
- enable_automatic_response_takeover
- publish_package
- restart_openclaw
- mutate_block_library
- touch_resleever

## Allowed result states

The schema allows only metadata/result states that do not imply execution.

## Evidence requirements

Schema requires evidence references for:
- audit packet review bundle
- audit packet export
- audit packet
- policy trace report
- policy-to-readiness integration
- readiness matrix
- blocked-route summary
- dry-run projection
- decision simulation
- approval checkpoint
- approval-flow projection
- policy projection

## Hard boundary fields

Schema requires hard true/false safety boundaries showing:
- non-approval
- non-execution
- no file writing
- no external transmission
- no package publish
- direct source disabled
- automatic response takeover disabled

## Example fixture

The example fixture demonstrates:
- one `request_more_evidence` route
- one `deny` route
- one `no_decision` route
- no forbidden execution decisions

## Non-approval guarantees

Review decision packet does not equal approval.

## Non-execution guarantees

Review decision packet does not equal execution.

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

## Future runtime projection notes

A future runtime projection lane may project this packet as metadata, but it must not record live approvals or enable execution automatically.
