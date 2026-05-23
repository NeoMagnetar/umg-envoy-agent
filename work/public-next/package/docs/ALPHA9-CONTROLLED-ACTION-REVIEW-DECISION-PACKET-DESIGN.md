# ALPHA9 Controlled Action Review Decision Packet Design

## Purpose

Define a future metadata shape for representing reviewer decisions over controlled-action review bundles.

The controlled action review decision packet design does not grant approval or execution authority. It defines a future metadata shape for recording review decisions only.

## Relationships

- **Audit packet review bundle** is the immediate source context for future decisions.
- **Audit packet export** provides portable evidence.
- **Approval-flow runtime projection** remains separate and does not collapse into review decisions.

## Allowed decision types

- `deny`
- `request_more_evidence`
- `mark_incomplete`
- `approve_for_dry_run_only`
- `approve_for_future_execution_review_only`
- `revoke_prior_review`
- `supersede_prior_review`
- `expire_review`
- `no_decision`

## Blocked decision categories

Not allowed in this design:
- `execute_action`
- `approve_for_execution`
- `authorize_write_action`
- `authorize_bridge_action`
- `enable_direct_source`
- `enable_automatic_response_takeover`
- `publish_package`
- `restart_openclaw`
- `mutate_block_library`
- `touch_resleever`

Each blocked category requires a future explicit implementation lane, explicit safety design, and later explicit user approval.

## Request shape

The design models a future request object with:
- decision request id
- review bundle id
- requester identity / timestamp
- target routes
- requested decision per route
- review reason
- non-execution flags

## Result shape

The design models a future result object with:
- decision result id
- request linkage
- result state
- route decision results
- decision accepted / rejected metadata
- non-approval / non-execution flags

## Evidence requirements

For non-`no_decision` route decisions, evidence should identify:
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

The packet should track:
- `evidencePresent`
- `evidenceMissing`
- `reviewerFocus`
- `blockedReasonsReviewed`
- `missingRequirementsReviewed`
- `hardBoundariesReviewed`

## Expiration / supersession / revocation concepts

The design reserves explicit concepts for:
- expiration policy
- supersession policy
- revocation policy

These are still metadata only.
They do not grant execution or modify runtime authority in this lane.

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

## Future implementation notes

A later schema lane can formalize this design.
A later runtime lane can decide how decision packets are validated.
Neither future lane should allow review decisions to imply execution automatically.
