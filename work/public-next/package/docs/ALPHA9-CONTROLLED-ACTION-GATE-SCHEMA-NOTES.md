# Alpha9 Controlled Action Gate Schema Notes

## Purpose

Formalize the controlled action gate contract so future sleeves can declare action-capable routes without enabling them.

## This schema does not enable execution

The schema is for declaration/validation only.
It preserves current safety posture:
- no write actions
- no bridge actions
- no execution authority expansion
- no direct_source
- no automatic response takeover

## Required contract sections

A controlled action gate document must define:
- gate identity
- gate version
- baseline version
- execution authority expanded flag
- hard boundaries
- action routes
- blocked action categories
- bridge policies
- metadata visibility rules

## Required action route fields

Each action route must declare:
- action id
- action class
- action risk level
- allowed execution mode
- approval requirements
- allowlist requirements
- scope boundary
- preview requirements
- rollback requirements
- audit requirements
- sleeve-declared action policy metadata

## Allowed execution modes in this phase

This schema allows declaration of routes in these modes only:
- `metadata_only`
- `preview_only`
- `approval_gated_disabled_now`
- `forbidden`

None of these modes make execution active in the current phase.

## Why metadata visibility matters

Future action routes need to be visible before they are executable so sleeves can report:
- blocked action inventory
- approval-needed summaries
- risk summaries
- target scope expectations

This lets UMG explain the shape of future controlled actions without performing them.

## Bridge policy sections

The schema includes bridge policy metadata for:
- Desktop Bridge
- PhaseBridge

These sections exist to declare future action families while keeping:
- `enabledNow = false`

## Future direction

A later runtime-policy projection lane can map these declarations into runtime-visible policy summaries without enabling execution.
