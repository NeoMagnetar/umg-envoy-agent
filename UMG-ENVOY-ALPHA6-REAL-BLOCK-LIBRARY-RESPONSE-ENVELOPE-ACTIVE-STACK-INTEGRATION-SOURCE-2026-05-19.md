# UMG Envoy Alpha6 — Real Block Library Response Envelope Active Stack Integration Source

Date: 2026-05-19

## Verdict

`ALPHA6_REAL_BLOCK_LIBRARY_RESPONSE_ENVELOPE_ACTIVE_STACK_INTEGRATION_SOURCE_READY`

## Baseline

Previous step:
- `ALPHA6_REAL_BLOCK_LIBRARY_ACTIVE_STACK_PROJECTION_LIVE_READY`

Previous commit:
- `09da914ba6e43b7c1913deccaa6eb53feb664737`

Official Alpha6 runtime truth:
- entrypoint: `dist/plugin-entry.js`
- source entry: `src/plugin-entry.ts`
- version: `0.3.0-alpha.6`

## Scope

This step integrated the normalized Active Stack projection into the response envelope fragment.

This step updated:
- `umg_envoy_block_library_response_envelope_fragment`

This step preserved:
- `umg_envoy_block_library_active_stack_projection`

This step added:
- Active Stack projection as the source for envelope Active Stack rendering
- `sourceActiveStackProjection`
- `activeStackSourceContract = umg.active_stack.projection.v1`
- `activeStackSourceStatus = NORMALIZED`
- custom `activeSleeve` pass-through without sleeve discovery
- Active Stack integration smoke coverage

This step did not:
- enable automatic response takeover
- modify global response formatting
- inspect active sleeves
- inspect NeoStacks
- traverse graphs
- scan the full block library
- recursively load referenced targets
- load external MOLT block files
- evaluate triggers
- execute anything
- enable direct_source
- modify UMG-Block-Library
- publish
- package

## Updated Tool

- `umg_envoy_block_library_response_envelope_fragment`

## Confirmed Integration

Confirmed:
- `outputContract.contractId = umg.response_envelope.fragment.v1`
- `outputContract.contractStatus = NORMALIZED`
- `outputContract.activeStackSourceContract = umg.active_stack.projection.v1`
- `outputContract.activeStackSourceStatus = NORMALIZED`
- `sourceActiveStackProjection.outputContract.contractId = umg.active_stack.projection.v1`
- `sourceActiveStackProjection.outputContract.contractStatus = NORMALIZED`

## Confirmed NL Projection

Confirmed:
- `Active Stack` section comes from normalized Active Stack projection
- Active Stack section includes `Runtime Version`
- Active Stack section includes `Official Entrypoint`
- Active Stack section includes `Source Contract`
- Active Stack section includes `MOLT Map Source Contract`
- envelope still includes `Envoy Intuition`
- envelope still includes `Current Context — MOLT Map`
- envelope still includes `Formal Response Content`
- envelope still includes `Metadata`
- MOLT Map still renders all seven fields in fixed order

## Confirmed Partial / Edge Cases

Confirmed:
- partial envelope still renders missing fields as `n/a`
- custom `activeSleeve` is reflected without sleeve discovery
- denied source fragment still returns `RESPONSE_ENVELOPE_FRAGMENT_READY_WITH_SOURCE_WARNINGS`
- missing source fragment hold is preserved
- empty query hold works
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
- `node scripts/alpha6-real-block-library-response-envelope-active-stack-integration-smoke.mjs`

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
`ALPHA6_REAL_BLOCK_LIBRARY_RESPONSE_ENVELOPE_ACTIVE_STACK_INTEGRATION_LIVE_PROMOTION`
