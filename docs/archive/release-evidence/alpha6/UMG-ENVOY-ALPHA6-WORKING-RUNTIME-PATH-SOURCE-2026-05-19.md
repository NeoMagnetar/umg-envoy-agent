# UMG Envoy Alpha6 — Working Runtime Path Source

Date: 2026-05-19

## Verdict

`ALPHA6_WORKING_RUNTIME_PATH_SOURCE_READY`

## Baseline

Starting commit:
- `ef347959fcbd56af609074243a7267b88e883335`

Starting checkpoint:
- `ALPHA6_REAL_BLOCK_LIBRARY_SLEEVE_GRAPH_INDEX_LIVE_READY`

Official runtime truth:
- entrypoint: `dist/plugin-entry.js`
- source entry: `work/public-next/package/src/plugin-entry.ts`
- version: `0.3.0-alpha.6`

## Goal

Make the plugin operational in dry-run runtime-preview mode:

selected sleeve
→ sleeve graph drilldown
→ bounded sleeve resolve
→ approved NeoBlock shallow load
→ visible MOLT extraction
→ MOLT Map composition
→ RuntimeSpecV0 compile
→ Active Stack projection
→ response-envelope preview
→ execution explicitly `not_performed`

## Tools Added

Added source tools:
- `umg_envoy_block_library_sleeve_graph_drilldown`
- `umg_envoy_sleeve_select`
- `umg_envoy_sleeve_resolve`
- `umg_envoy_runtime_compile`
- `umg_envoy_runtime_preview`

Not implemented in this lane:
- `umg_envoy_runtime_run`

## Contracts Added

Added normalized source contracts:
- `umg.sleeve_graph.drilldown.v1`
- `umg.sleeve.select.v1`
- `umg.sleeve.resolve.v1`
- `umg.runtime.compile.v1`
- `umg.runtime.preview.v1`

## Files Changed

Modified:
- `work/public-next/package/src/block-library-resolver.ts`
- `work/public-next/package/src/plugin-entry.ts`

Created:
- `work/public-next/package/scripts/alpha6-working-runtime-path-smoke.mjs`
- `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-WORKING-RUNTIME-PATH-SOURCE-2026-05-19.md`

## Runtime Path Proof

Confirmed source path:
- real sleeve selected: `neomagnetar-dynamic-persona-v1`
- focused sleeve drilldown works
- bounded sleeve resolve works
- multiple approved NeoBlocks shallow-load within limits
- visible MOLT fragments are extracted from resolved NeoBlocks
- RuntimeSpecV0 compiles coherently
- Active Stack preview builds from compiled runtime state
- response-envelope preview builds from compiled/runtime state
- declared tool requests are surfaced only as declared requests
- execution remains `not_performed`

## Source Validation

Passed:
- `npm run check`
- `npm run build`
- `node scripts/alpha6-real-block-library-response-envelope-fragment-smoke.mjs`
- `node scripts/alpha6-real-block-library-active-stack-projection-smoke.mjs`
- `node scripts/alpha6-real-block-library-response-envelope-active-stack-integration-smoke.mjs`
- `node scripts/alpha6-real-block-library-sleeve-graph-index-smoke.mjs`
- `node scripts/alpha6-response-envelope-active-stack-recursion-fix-smoke.mjs`
- `node scripts/alpha6-working-runtime-path-smoke.mjs`

## Old Tool Regression Status

Confirmed:
- old Alpha6 block-library tool chain still passes
- sleeve graph index source smoke still passes
- response envelope fragment still works
- Active Stack projection still works
- response envelope / Active Stack integration still works

## Recursion Regression Status

Confirmed:
- no recursion reintroduced
- no `RangeError`
- no `Maximum call stack size exceeded`
- dependency flow remains acyclic:
  - `MOLT Map Composer -> Active Stack Projection -> Response Envelope Fragment`

## Safety Boundaries Preserved

Confirmed:
- no uncontrolled execution
- no UMG-Block-Library mutation
- no full library scan
- no unbounded recursive graph traversal
- no external MOLT block file loading
- no trigger evaluation
- no broad tool execution
- no automatic response takeover
- execution = `not_performed`
- directSource = `not_enabled`

## Known Limitations

Current limitations:
- runtime selection is scoped/regenerable in process state, not durable config-backed state
- runtime path currently targets dry-run preview only
- trigger actions are surfaced as declared tool requests only
- NeoStack payload loading is still not implemented
- external MOLT block file loading is still not implemented
- runtime execution lane is intentionally deferred

## Required Next Task

Recommended next task:
`ALPHA6_WORKING_RUNTIME_PATH_LIVE_PROMOTION`
