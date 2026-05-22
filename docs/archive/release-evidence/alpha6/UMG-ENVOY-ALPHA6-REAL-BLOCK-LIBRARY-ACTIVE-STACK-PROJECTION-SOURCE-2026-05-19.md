# UMG Envoy Alpha6 — Real Block Library Active Stack Projection Source

Date: 2026-05-19

## Verdict

`ALPHA6_REAL_BLOCK_LIBRARY_ACTIVE_STACK_PROJECTION_SOURCE_READY`

## Baseline

Previous step:
- `ALPHA6_REAL_BLOCK_LIBRARY_RESPONSE_ENVELOPE_FRAGMENT_LIVE_READY`

Previous commit:
- `7049c05539b6b690edb817084c8b6e931d2afd41`

Official Alpha6 runtime truth:
- entrypoint: `dist/plugin-entry.js`
- source entry: `src/plugin-entry.ts`
- version: `0.3.0-alpha.6`

## Scope

This step added the read-only Active Stack projection source implementation.

This step added:
- `umg_envoy_block_library_active_stack_projection`
- normalized Active Stack contract
- normalized Active Stack object
- Active Stack NL projection
- explicit runtime-state input mode
- optional source-envelope context check
- audit/safety fields
- Active Stack projection smoke coverage

This step did not:
- inspect active sleeves
- inspect NeoStacks
- traverse graphs
- scan the full block library
- recursively load referenced targets
- load external MOLT block files
- evaluate triggers
- execute anything
- enable direct_source
- enable automatic response takeover
- modify UMG-Block-Library
- publish
- package

## New Tool

- `umg_envoy_block_library_active_stack_projection`

## Confirmed Projection

Confirmed:
- `outputContract.contractId = umg.active_stack.projection.v1`
- `outputContract.contractStatus = NORMALIZED`
- `audit.normalizationStatus = ACTIVE_STACK_PROJECTION_NORMALIZED`
- `activeStackProjection.projectionStatus = ACTIVE_STACK_PROJECTION_READY`

Confirmed NL projection includes:
- `Project`
- `Current State`
- `Runtime Version`
- `Official Entrypoint`
- `Active Tool`
- `Source Tool`
- `Source Contract`
- `MOLT Map Source Contract`
- `Active Sleeve`
- `NeoStack State`
- `Graph State`
- `Boundary`

## Confirmed Source Context

Confirmed:
- explicit `neoblockIds` source context works
- source envelope/composer context remains normalized
- automatic response takeover remains `false`

## Confirmed Holds

Confirmed:
- unsupported projection format hold works
- raw target dump hold works

## Verification

Passed:
- `openclaw plugins info umg-envoy-agent`
- `openclaw doctor --non-interactive`
- `openclaw health --json`
- `npm run check`
- `npm run build`
- all Alpha6 block-library smokes
- `node scripts/alpha6-real-block-library-active-stack-projection-smoke.mjs`

## Safety Confirmations

Confirmed:
- readOnly = `true`
- execution = `not_performed`
- directSource = `not_enabled`
- automatic response takeover = `false`
- active sleeve discovery = `not_performed`
- NeoStack inspection = `not_performed`
- graph traversal = `not_performed`
- recursive full-library load = `not_performed`
- full library scan = `not_performed`
- referenced target loading = `not_performed`
- external MOLT block file loading = `not_performed`
- trigger evaluation = `not_performed`
- UMG-Block-Library mutation = `not_performed`

## Required Next Task

Next task:
`ALPHA6_REAL_BLOCK_LIBRARY_ACTIVE_STACK_PROJECTION_LIVE_PROMOTION`
