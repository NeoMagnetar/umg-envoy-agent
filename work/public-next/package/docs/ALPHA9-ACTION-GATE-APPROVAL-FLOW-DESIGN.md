# Alpha9 Action Gate Approval Flow Design

## Purpose

Design the approval flow for future controlled action gates.

This lane is design only.
It does **not** implement write actions.
It does **not** enable bridge actions.
It does **not** execute action gates.
It does **not** expand execution authority.

## Core rule

**Approval does not equal execution.**

Approval creates a scoped, auditable state that may later permit an execution attempt under a separate future execution lane.
Approval alone must not cause side effects.

## Questions this design answers

- What does approval mean?
- Who/what can approve?
- What state changes after approval?
- What still remains blocked?
- When does approval expire?
- What must be previewed first?
- What audit trail is required?
- How does approval differ from execution?

## Hard boundaries in this lane

- no write actions
- no bridge actions
- no action execution
- no real approvals that perform actions
- no execution authority expansion
- no package
- no publish
- no restart
- no UMG-Block-Library mutation
- no direct_source
- no automatic response takeover

## Approval model overview

Approval is a **gated metadata state transition** attached to a declared action route.

It should record:
- which route was reviewed
- what preview was shown
- what scope was approved
- who/what approved it
- when approval expires
- whether the route is still blocked from execution due to missing future execution capability

Approval is therefore:
- narrower than execution
- more specific than policy visibility
- more durable than a pure preview
- still non-executing by itself

## Proposed approval states

### `not_requested`
- route is visible as metadata only
- no approval has been requested

### `preview_ready`
- route preview exists and is reviewable
- no approval decision yet

### `approval_requested`
- explicit approval request created
- scope, risk, preview ref, and audit seed captured

### `approved_pending_execution_capability`
- approval decision is affirmative
- route remains non-executable until future execution support exists
- useful in current phase because approval can be modeled without execution

### `denied`
- approval explicitly denied
- route remains blocked

### `expired`
- approval existed but time-bounded approval expired
- route remains blocked

### `superseded`
- approval replaced by a newer request or updated scope
- old approval becomes non-authoritative

### `revoked`
- previously approved request explicitly revoked
- route remains blocked

## Approval request shape

A future approval request should include:
- `approvalRequestId`
- `actionId`
- `actionClass`
- `riskLevel`
- `routePolicyRef`
- `previewRef`
- `requestedScope`
- `requestedAt`
- `requestedBy`
- `expiresAt`
- `notes`

### Required invariants
- preview must exist before approval request for anything above metadata-only
- request scope must be narrower or equal to route allowlist scope
- request must reference current policy projection version

## Approval decision shape

A future approval decision should include:
- `approvalDecisionId`
- `approvalRequestId`
- `decision`
- `decisionAt`
- `decidedBy`
- `reason`
- `approvedScope`
- `approvalExpiry`
- `auditRef`
- `executionStillBlocked`

## Allowed decisions

- `approve`
- `deny`
- `revoke`
- `supersede`
- `expire`

## Preview-before-approval rule

For any route that is not metadata-only:
- preview/dry-run must exist first
- preview must enumerate:
  - intended target scope
  - intended route category
  - risk summary
  - blocked categories
  - rollback expectations if relevant

Approval requests without preview should be invalid for action-capable routes.

## Approval expiration model

Approvals should be time-bounded unless a later lane explicitly proves otherwise.

Suggested fields:
- `approvalIssuedAt`
- `approvalExpiresAt`
- `approvalWindowKind`

Suggested window kinds:
- `single_use_future`
- `short_lived`
- `session_bound`
- `until_revoked`

Current preferred posture:
- `single_use_future` or `short_lived`

## Approval scope boundaries

Approval should be scope-specific and non-transferable.

Scope should bind at least:
- action id
- scope kind
- target scope
- route category
- affected bridge domain if any
- denied operation families

Approval for one scope must not silently authorize another.

## Approval audit trail requirements

Approval flow should record:
- approval request id
- decision id
- route id / action id
- risk level
- preview reference
- approval scope
- requester identity
- approver identity
- timestamps
- expiry / revoke / supersede state
- execution blocked status

## Relationship to runtime policy projection

Runtime policy projection tells the user/runtime:
- this route exists
- this route is blocked / preview-only / approval-required
- these are the scope and risk characteristics

Approval flow adds:
- a concrete request/decision lifecycle

Policy projection is the visible rulebook.
Approval flow is the documented approval process.
Neither one is execution.

## Relationship to execution

Execution is a future lane and must remain separate.

Sequence should eventually be:
1. route visible as metadata
2. preview generated
3. approval requested
4. approval decision recorded
5. approval state becomes `approved_pending_execution_capability`
6. only a future execution-capable lane may attempt execution

Current phase stops at step 5 at most.

## Desktop Bridge / PhaseBridge implications

Even after approval design exists:
- Desktop Bridge routes remain blocked until future implementation
- PhaseBridge routes remain blocked until future implementation
- bridge approval metadata may exist before bridge execution support exists

This keeps observer/design lanes compatible with future action policy without opening action authority today.

## Read-only approval vs write/action approval

### Read-only approval
In many cases read-only routes may not need approval at all.
If approval exists, it is mostly a visibility/audit formality and should still not imply execution.

### Write/action approval
Write/action approval is materially stricter:
- preview required
- scope binding required
- allowlist required
- audit required
- expiration required
- route may still remain non-executable if execution capability is absent

## Suggested next step after this lane

- `ALPHA9_ACTION_GATE_APPROVAL_FLOW_SCHEMA_SOURCE`

That lane should formalize the approval-flow contract into a schema/fixture/smoke without yet enabling execution.
