# UMG Envoy Alpha6 — Real Block Library MOLT Map Composer Output Normalization Source

Date: 2026-05-19

## Verdict

`ALPHA6_REAL_BLOCK_LIBRARY_MOLT_MAP_COMPOSER_OUTPUT_NORMALIZATION_SOURCE_READY`

## Baseline

Previous step:
- `ALPHA6_REAL_BLOCK_LIBRARY_MOLT_MAP_COMPOSER_LIVE_READY`

Previous commit:
- `6c6295b11bb923a29aa0e441c0ca3bb1775eda78`

Official Alpha6 runtime truth:
- entrypoint: `dist/plugin-entry.js`
- source entry: `src/plugin-entry.ts`
- version: `0.3.0-alpha.6`

## Scope

This step normalized the MOLT Map composer output contract.

This step added:
- `outputContract`
- `contractId = umg.molt_map.compose.v1`
- normalized `composition` fields
- normalized seven-field `moltMap` entries
- normalized `fragmentResults`
- precise denied-fragment hold reporting
- composer audit object
- output-normalization smoke coverage

This step did not:
- add a new graph layer
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
- render a full response envelope

## New / Updated Behavior

Updated tool:
- `umg_envoy_block_library_molt_map_compose`

Confirmed:
- `outputContract.contractId = umg.molt_map.compose.v1`
- `outputContract.contractStatus = NORMALIZED`
- `audit.normalizationStatus = COMPOSER_OUTPUT_NORMALIZED`

## Confirmed Full Composition

Confirmed:
- `compositionStatus = MOLT_MAP_COMPOSED`
- all seven MOLT fields exist
- all seven fields render in fixed order
- all seven fields have stable field entries
- full-composition fields have `fieldStatus = FIELD_COMPOSED`

## Confirmed Partial / Edge Cases

Confirmed:
- partial composition returns `MOLT_MAP_COMPOSED_WITH_MISSING_FIELDS`
- missing fields have `fieldStatus = FIELD_MISSING`
- missing values render as `n/a`
- duplicate composition returns `MOLT_MAP_COMPOSED_WITH_CONFLICTS`
- denied fragment composition returns `MOLT_MAP_COMPOSED_WITH_DENIED_FRAGMENTS`
- denied fragment now reports precise hold details in normalized fragmentResults
- empty query hold works
- unsupported projection format hold works
- unsupported conflict policy hold works
- raw target dump hold works

## Fixed Drift

Previous drift:
- denied fragment entries carried precise hold codes in `errors`
- secondary `fragmentStatus` remained generic denied label

Normalized behavior:
- denied fragment entries now expose stable denied fragment status
- denied fragment entries expose precise hold code directly
- denied fragment entries preserve precise error codes

## Verification

Passed:
- `openclaw plugins info umg-envoy-agent`
- `openclaw doctor --non-interactive`
- `openclaw health --json`
- `npm run check`
- `npm run build`
- all Alpha6 block-library smokes
- `node scripts/alpha6-real-block-library-molt-map-composer-output-normalization-smoke.mjs`

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
`ALPHA6_REAL_BLOCK_LIBRARY_MOLT_MAP_COMPOSER_OUTPUT_NORMALIZATION_LIVE_PROMOTION`
