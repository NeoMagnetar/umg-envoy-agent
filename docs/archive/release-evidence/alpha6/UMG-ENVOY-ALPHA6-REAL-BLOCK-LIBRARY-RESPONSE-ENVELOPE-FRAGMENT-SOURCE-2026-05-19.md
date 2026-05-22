# UMG Envoy Alpha6 — Real Block Library Response Envelope Fragment Source

Date: 2026-05-19

## Verdict

`ALPHA6_REAL_BLOCK_LIBRARY_RESPONSE_ENVELOPE_FRAGMENT_SOURCE_READY`

## Baseline

Previous step:
- `ALPHA6_REAL_BLOCK_LIBRARY_MOLT_MAP_COMPOSER_OUTPUT_NORMALIZATION_LIVE_READY`

Previous commit:
- `8dee04d47abdd183d22d3a912ea2e8f54d17a605`

Official Alpha6 runtime truth:
- entrypoint: `dist/plugin-entry.js`
- source entry: `src/plugin-entry.ts`
- version: `0.3.0-alpha.6`

## Scope

This step added the read-only response envelope fragment source implementation.

This step added:
- `umg_envoy_block_library_response_envelope_fragment`
- envelope fragment contract
- Active Stack section rendering
- Envoy Intuition section rendering
- Current Context — MOLT Map section rendering from normalized composer output
- Formal Response Content placeholder rendering
- Metadata section rendering
- source composition preservation
- audit/safety preservation
- response envelope fragment smoke coverage

This step did not:
- enable automatic response takeover
- modify global response formatting
- inspect active sleeves
- inspect NeoStacks
- scan the full block library
- recursively load referenced targets
- load external MOLT block files
- evaluate triggers
- execute anything
- enable direct_source
- modify UMG-Block-Library
- publish
- package

## New Tool

- `umg_envoy_block_library_response_envelope_fragment`

## Confirmed Envelope Fragment

Confirmed:
- `outputContract.contractId = umg.response_envelope.fragment.v1`
- `outputContract.contractStatus = NORMALIZED`
- source contract = `umg.molt_map.compose.v1`
- `responseEnvelopeFragment.fragmentStatus = RESPONSE_ENVELOPE_FRAGMENT_READY`
- `automaticResponseTakeover = false`

Confirmed NL sections:
- `Active Stack`
- `Envoy Intuition`
- `Current Context — MOLT Map`
- `Formal Response Content`
- `Metadata`

Confirmed MOLT Map rendering:
- all seven fields render in fixed order
- missing fields render as `n/a`

## Confirmed Partial / Edge Cases

Confirmed:
- partial envelope renders missing fields as `n/a`
- denied source fragment returns `RESPONSE_ENVELOPE_FRAGMENT_READY_WITH_SOURCE_WARNINGS`
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
- `node scripts/alpha6-real-block-library-response-envelope-fragment-smoke.mjs`

## Safety Confirmations

Confirmed:
- readOnly = `true`
- execution = `not_performed`
- directSource = `not_enabled`
- automatic response takeover = `false`
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
`ALPHA6_REAL_BLOCK_LIBRARY_RESPONSE_ENVELOPE_FRAGMENT_LIVE_PROMOTION`
