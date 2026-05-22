# Alpha9 Controlled Action Gate Design

## Purpose

Design the controlled action gate model for future action-capable UMG routes.

This lane is design only.
It does **not** implement write actions.
It does **not** enable bridge actions.
It does **not** expand execution authority.

## Why this design is needed

The project now has:
- native sleeves
- read-only runtime bundles
- Desktop Bridge observer design
- PhaseBridge observer design

That means the next meaningful problem is not how to run actions, but how actions would ever become safe enough to permit.

The controlled action gate should define exactly how future actions become:
- classified
- scoped
- approved
- allowlisted
- audited
- reversible where possible
- blocked when unsafe

## Hard boundaries in this lane

- no package
- no publish
- no restart
- no UMG-Block-Library mutation
- no file writes
- no command execution
- no bridge mutation
- no direct_source
- no automatic response takeover
- no broad autonomous execution

## Core design principle

Action declaration is not action permission.

A future sleeve may describe action-capable routes as metadata, but no route becomes executable until it satisfies explicit gate requirements.

## Proposed action classification model

### Class A — metadata-only / visibility
Examples:
- visible blocked routes
- capability inventory
- action availability summaries

Requirements:
- always allowed read-only visibility
- never executes anything

### Class B — dry-run / preview
Examples:
- preview a bridge action plan
- preview a file mutation plan
- preview a command plan
- show intended targets, scopes, and consequences

Requirements:
- explicit dry-run contract
- zero side effects
- approval not required for pure preview if no side effects are possible
- audit output required

### Class C — reversible low-risk actions
Examples (future only, not enabled now):
- scoped state toggle with explicit rollback
- safe temporary artifact creation in approved scratch lane

Requirements:
- explicit approval
- allowlisted route
- bounded target scope
- rollback plan required
- audit trail required
- reversibility proven or simulated

### Class D — nontrivial system mutations
Examples (future only):
- bridge actions with external side effects
- file writes
- command execution
- workflow mutation

Requirements:
- explicit approval
- explicit allowlist
- strict scope boundary
- preflight preview required
- audit trail required
- rollback/backup required where possible
- may still remain categorically blocked in many environments

### Class E — categorically blocked actions
Examples:
- broad autonomous execution
- uncontrolled bridge actions
- implicit write authority
- direct_source enablement bypass
- automatic response takeover
- unconstrained mutation of sensitive sources

Requirements:
- blocked by design
- visible as blocked metadata only
- never enabled by sleeve declaration alone

## Risk model

Each future action route should declare:
- `riskLevel`
- `reversibility`
- `approvalRequired`
- `allowlistRequired`
- `backupRequired`
- `dryRunRequired`
- `auditRequired`
- `scopeKind`
- `scopeTarget`

Suggested risk levels:
- `metadata_only`
- `low_reversible`
- `medium_bounded`
- `high_mutation`
- `forbidden`

## Approval model

A future action-capable route should require explicit approval metadata such as:
- `approvalMode = explicit_user_approval`
- `approvalToken` or gate checkpoint handle
- `approvalScope`
- `approvalExpiry`
- `approvalAuditRef`

Approval must be:
- route-specific
- scope-specific
- time-bounded where possible
- non-transferable to unrelated actions

## Allowlist model

Every future action route must declare:
- which action family it belongs to
- which exact route ids are allowlisted
- which targets are in-bounds
- which targets are forbidden

No action route should inherit broad wildcard permission from a sleeve identity alone.

## Scope boundary model

Future action routes must declare scope explicitly:
- target domain
- target ids / file paths / bridge endpoints
- allowed operation families
- denied operation families
- recursion boundaries
- blast radius notes

Examples:
- `scopeKind = file_path_allowlist`
- `scopeKind = bridge_capability_route`
- `scopeKind = workflow_lane_segment`
- `scopeKind = session_state_only`

## Rollback / backup model

Before any future mutation-capable route is allowed, design must specify:
- whether rollback is possible
- what backup or snapshot is required
- how rollback is invoked
- what irreversibility warnings are surfaced

Suggested reversibility categories:
- `not_needed`
- `automatic_rollback_available`
- `manual_rollback_required`
- `not_reliably_reversible`

## Audit trail requirements

Every future approved action route should emit audit records containing:
- route id
- action class
- risk level
- requested target scope
- approval reference
- preview reference
- execution result
- rollback reference if applicable
- timestamps
- acting sleeve id
- runtime version / entrypoint / source identity

## Preview-before-action model

For any mutation-capable route above metadata-only:
- a dry-run or preview must exist first
- preview should enumerate:
  - intended targets
  - intended changes
  - blocked routes
  - potential risks
  - rollback expectations

No mutation route should jump straight from declaration to execution.

## Blocked action categories

The following categories should remain blocked by default unless a later dedicated lane explicitly changes policy:
- direct_source enablement
- automatic response takeover
- broad command execution
- bridge-wide unrestricted desktop action
- bridge-wide unrestricted workflow mutation
- unconstrained UMG-Block-Library mutation
- broad repo mutation without scoped file targets and explicit approval

## Bridge-specific gate design

### Desktop Bridge
Potential future action families (still blocked in this lane):
- click route
- type route
- key-press route
- focus-switch route

Required gate concepts:
- per-capability allowlist
- per-window or per-target scope
- dry-run intent preview where possible
- audit trail with target window/context

### PhaseBridge
Potential future action families (still blocked in this lane):
- resume route
- stop route
- relay route
- ledger/worklog mutation route

Required gate concepts:
- ledger identity binding
- next-legal-step confirmation
- stop/resume reason capture
- workflow audit trail

## Sleeve-declared action policy model

A future action-capable sleeve should declare action policies as metadata, for example:
- `actionPolicies[]`
  - route id
  - action class
  - risk level
  - allowed = false by default unless explicitly enabled
  - dry-run requirement
  - approval requirement
  - allowlist requirement
  - rollback category
  - audit category

This lets a sleeve expose future capability shape without granting execution.

## Metadata visibility rule

Action-capable routes may be visible in observer sleeves and bundle reports as:
- blocked route inventory
- route category summaries
- approval-needed summaries
- risk summaries

But they must remain:
- non-executable
- non-expanded
- non-authoritative

until a later implementation lane explicitly adds a real controlled gate.

## Suggested future schema direction

A later lane should likely create a formal gate schema for route declarations, for example:
- `umg.controlled_action_gate.v1`

Potential sections:
- action route declaration
- approval requirements
- allowlist requirements
- scope declaration
- rollback declaration
- audit declaration
- blocked category declaration

## Recommended next step after this lane

- `ALPHA9_CONTROLLED_ACTION_GATE_SCHEMA_SOURCE`

That lane should formalize this design into a schema/contract without yet enabling real action execution.
