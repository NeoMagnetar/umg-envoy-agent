# UMG Envoy Alpha6 — Real Block Library MOLT Map Fragment Provenance Backfill Source

Date: 2026-05-19

## Verdict

`ALPHA6_REAL_BLOCK_LIBRARY_MOLT_MAP_FRAGMENT_PROVENANCE_BACKFILL_SOURCE_READY`

## Baseline

Previous step:
- `ALPHA6_REAL_BLOCK_LIBRARY_MOLT_MAP_FRAGMENT_LIVE_READY`

Previous commit:
- `e34dc442172435d88ea7cc9f12ef051ca3752249`

Official Alpha6 runtime truth:
- entrypoint: `dist/plugin-entry.js`
- source entry: `src/plugin-entry.ts`
- version: `0.3.0-alpha.6`

## Scope

This step fixed the known MOLT Map fragment provenance limitation.

This step changed:
- entry-id fragment queries now backfill resolved manifest target path into provenance
- `moltMapFragment.provenance.sourcePath` now reflects the resolved target source path
- explicit sourcePath queries preserve the provided path
- provenance backfill status is reported

This step did not:
- create a new graph layer
- compose a full MOLT Map
- render a response envelope
- recursively load the full library
- load referenced targets
- load external MOLT block files
- inspect NeoStacks
- inspect sleeves
- evaluate triggers
- execute anything
- enable direct_source
- modify UMG-Block-Library
- publish
- package

## Fixed Limitation

Previous limitation:
- `KNOWN_LIMITATION_SOURCEPATH_PROVENANCE_BACKFILL_PENDING`

Resolved behavior:
- `primary.sample` → `AI/NEOBLOCKS/sample/primary.sample.json`
- `directive.sample` → `AI/NEOBLOCKS/sample/directive.sample.json`
- `trigger.sample` → `AI/NEOBLOCKS/sample/trigger.sample.json`

## Confirmed Provenance

Confirmed:
- `primary.sample`
 - `manifestPath = AI/MANIFESTS/neoblock-library-index.json`
 - `sourcePath = AI/NEOBLOCKS/sample/primary.sample.json`
 - `loadedFrom = single_shallow_target`
 - `backfillStatus = SOURCE_PATH_BACKFILLED_FROM_MANIFEST_ENTRY`
- `directive.sample`
 - `sourcePath = AI/NEOBLOCKS/sample/directive.sample.json`
- `trigger.sample`
 - `sourcePath = AI/NEOBLOCKS/sample/trigger.sample.json`

Confirmed explicit sourcePath query:
- `backfillStatus = SOURCE_PATH_PROVIDED_BY_QUERY`

## Regression Confirmations

Confirmed:
- `primary.sample` still returns `MOLT_MAP_FRAGMENT_READY`
- `directive.sample` still maps to `Directive`
- `trigger.sample` still maps to `Trigger`
- no full seven-field MOLT Map rendered
- forbidden target hold still works
- outside-allowlist hold still works
- missing entry hold still works
- unsupported projection format hold still works
- raw target dump hold still works

## Verification

Passed:
- `openclaw plugins info umg-envoy-agent`
- `openclaw doctor --non-interactive`
- `openclaw health --json`
- `npm run check`
- `npm run build`
- all Alpha6 block-library smokes
- `node scripts/alpha6-real-block-library-molt-map-fragment-provenance-backfill-smoke.mjs`

## Safety Confirmations

Confirmed:
- readOnly = `true`
- execution = `not_performed`
- directSource = `not_enabled`
- recursive full-library load = `not_performed`
- referenced target loading = `not_performed`
- external MOLT block file loading = `not_performed`
- full MOLT Map composition = `not_performed`
- response envelope rendering = `not_performed`
- trigger evaluation = `not_performed`
- UMG-Block-Library mutation = `not_performed`

## Required Next Task

Next task:
`ALPHA6_REAL_BLOCK_LIBRARY_MOLT_MAP_FRAGMENT_PROVENANCE_BACKFILL_LIVE_PROMOTION`
