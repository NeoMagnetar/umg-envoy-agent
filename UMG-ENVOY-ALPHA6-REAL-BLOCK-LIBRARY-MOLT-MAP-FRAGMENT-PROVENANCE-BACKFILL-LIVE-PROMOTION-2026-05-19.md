# UMG Envoy Alpha6 — Real Block Library MOLT Map Fragment Provenance Backfill Live Promotion

Date: 2026-05-19

## Verdict

`ALPHA6_REAL_BLOCK_LIBRARY_MOLT_MAP_FRAGMENT_PROVENANCE_BACKFILL_LIVE_READY`

## Baseline

Previous step:
- `ALPHA6_REAL_BLOCK_LIBRARY_MOLT_MAP_FRAGMENT_PROVENANCE_BACKFILL_SOURCE_READY`

Previous commit:
- `d324dd9c48ca2e5d6f2047c778f2a518999a266c`

Previous report:
- `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-REAL-BLOCK-LIBRARY-MOLT-MAP-FRAGMENT-PROVENANCE-BACKFILL-SOURCE-2026-05-19.md`

Official Alpha6 runtime truth:
- entrypoint: `dist/plugin-entry.js`
- version: `0.3.0-alpha.6`
- source entry: `src/plugin-entry.ts`

## Promoted Artifacts

Copied into installed extension:
- `plugin-entry.js`
- `plugin-entry.d.ts`
- `block-library-resolver.js`
- `block-library-resolver.d.ts`

Installed extension:
- `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`

## Live Tool Verification

Confirmed live tool:
- `umg_envoy_block_library_molt_map_fragment`

## Live Provenance Backfill Verification

Confirmed:
- `primary.sample`
 - `provenance.manifestPath = AI/MANIFESTS/neoblock-library-index.json`
 - `provenance.sourcePath = AI/NEOBLOCKS/sample/primary.sample.json`
 - `provenance.loadedFrom = single_shallow_target`
 - `provenance.backfillStatus = SOURCE_PATH_BACKFILLED_FROM_MANIFEST_ENTRY`
- `directive.sample`
 - `provenance.sourcePath = AI/NEOBLOCKS/sample/directive.sample.json`
 - `provenance.backfillStatus = SOURCE_PATH_BACKFILLED_FROM_MANIFEST_ENTRY`
- `trigger.sample`
 - `provenance.sourcePath = AI/NEOBLOCKS/sample/trigger.sample.json`
 - `provenance.backfillStatus = SOURCE_PATH_BACKFILLED_FROM_MANIFEST_ENTRY`

Confirmed explicit sourcePath behavior:
- `provenance.backfillStatus = SOURCE_PATH_PROVIDED_BY_QUERY`

## Regression Confirmations

Confirmed:
- `primary.sample` still returns `MOLT_MAP_FRAGMENT_READY`
- `primary.sample` still maps to `Primary`
- `directive.sample` still maps to `Directive`
- `trigger.sample` still maps to `Trigger`
- no full seven-field MOLT Map rendered
- forbidden target hold still works
- outside-allowlist hold still works
- missing entry hold still works
- unsupported projection format hold still works
- raw target dump hold still works

## Health

Confirmed:
- live plugin loaded
- `openclaw health --json` reports `ok: true`
- no UMG/plugin-specific regression surfaced

Observed non-UMG notices:
- orphan transcript files
- live session lock file
- browser attach/version notes
- memory-search provider readiness notes

Classification:
- `NON_UMG_OPENCLAW_HOUSEKEEPING_SEPARATE_LANE`

## Safety Confirmations

Confirmed:
- no execution
- no direct_source
- no recursive full-library load
- no referenced target loading
- no external MOLT block file loading
- no full MOLT Map composition
- no response envelope rendering
- no trigger evaluation
- no UMG-Block-Library mutation
- no publish
- no package

## Required Next Task

Next task:
`ALPHA6_REAL_BLOCK_LIBRARY_MOLT_MAP_COMPOSER_SOURCE`
