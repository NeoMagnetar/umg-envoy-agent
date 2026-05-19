# UMG Envoy Alpha6 — Real Block Library MOLT Map Composer Source

Date: 2026-05-19

## Verdict

`ALPHA6_REAL_BLOCK_LIBRARY_MOLT_MAP_COMPOSER_SOURCE_READY`

## Baseline

Previous step:
- `ALPHA6_REAL_BLOCK_LIBRARY_MOLT_MAP_FRAGMENT_PROVENANCE_BACKFILL_LIVE_READY`

Previous commit:
- `f89fcf64bdbe76b178425709aa9496d800a72bb3`

Official Alpha6 runtime truth:
- entrypoint: `dist/plugin-entry.js`
- source entry: `src/plugin-entry.ts`
- version: `0.3.0-alpha.6`

## Scope

This step added the read-only MOLT Map composer source implementation.

This step added:
- `umg_envoy_block_library_molt_map_compose`
- explicit-list MOLT Map composition
- seven-field MOLT Map output
- fixed field order
- full NL MOLT Map projection
- partial map support with `n/a`
- duplicate field conflict reporting
- denied fragment reporting
- per-field provenance preservation
- MOLT Map composer smoke

This step did not:
- scan the full block library
- inspect active sleeves
- inspect NeoStacks
- recursively load referenced targets
- load external MOLT block files
- evaluate triggers
- execute anything
- enable direct_source
- modify UMG-Block-Library
- publish
- package
- render a full response envelope

## New Tool

- `umg_envoy_block_library_molt_map_compose`

## Confirmed Full Composition

Confirmed:
- `compositionStatus = MOLT_MAP_COMPOSED`
- `requestedCount = 7`
- `fragmentCount = 7`
- `composedFieldCount = 7`
- `missingFieldCount = 0`
- `duplicateFieldCount = 0`
- `deniedFragmentCount = 0`

Confirmed fields:
- `Trigger` from `trigger.sample`
- `Directive` from `directive.sample`
- `Instruction` from `instruction.sample`
- `Subject` from `subject.sample`
- `Primary` from `primary.sample`
- `Philosophy` from `philosophy.sample`
- `Blueprint` from `blueprint.sample`

## Confirmed Partial / Edge Cases

Confirmed:
- partial composition returns `MOLT_MAP_COMPOSED_WITH_MISSING_FIELDS`
- missing fields render as `n/a`
- duplicate field composition returns `MOLT_MAP_COMPOSED_WITH_CONFLICTS`
- denied fragment composition returns `MOLT_MAP_COMPOSED_WITH_DENIED_FRAGMENTS`
- empty query returns `HOLD_MOLT_MAP_COMPOSE_QUERY_REQUIRED`
- unsupported projection format returns `HOLD_MOLT_MAP_COMPOSE_PROJECTION_FORMAT_UNSUPPORTED`
- unsupported conflict policy returns `HOLD_MOLT_MAP_COMPOSE_CONFLICT_POLICY_UNSUPPORTED`
- raw target dump returns `HOLD_RAW_TARGET_DUMP_NOT_SUPPORTED`

## Verification

Passed:
- `openclaw plugins info umg-envoy-agent`
- `openclaw doctor --non-interactive`
- `openclaw health --json`
- `npm run check`
- `npm run build`
- all Alpha6 block-library smokes
- `node scripts/alpha6-real-block-library-molt-map-composer-smoke.mjs`

## Safety Confirmations

Confirmed:
- readOnly = `true`
- execution = `not_performed`
- directSource = `not_enabled`
- recursive full-library load = `not_performed`
- full library scan = `not_performed`
- referenced target loading = `not_performed`
- external MOLT block file loading = `not_performed`
- active sleeve inspection = `not_performed`
- NeoStack inspection = `not_performed`
- trigger evaluation = `not_performed`
- UMG-Block-Library mutation = `not_performed`

## Required Next Task

Next task:
`ALPHA6_REAL_BLOCK_LIBRARY_MOLT_MAP_COMPOSER_LIVE_PROMOTION`
