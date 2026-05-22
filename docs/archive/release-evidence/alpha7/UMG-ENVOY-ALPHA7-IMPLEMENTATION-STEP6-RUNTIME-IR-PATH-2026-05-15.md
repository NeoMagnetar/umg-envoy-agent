# UMG Envoy Agent Alpha.7 — Implementation Step 6: Runtime IR Path

Date: 2026-05-15

## Verdict

`ALPHA7_RUNTIME_IR_PATH_READY`

## Baseline

Previous step:
- `ALPHA7_MOLTBLOCK_INSPECTOR_READY`

Step 5 commit:
- `59f86efa23df1842e01b90ef65513c884da550de`

## Scope

This step added the read-only Runtime IR Path projection.

This step added:
- `umg_envoy_runtime_ir_path`
- active path nodes
- route edges
- dormant refs
- excluded lanes
- NL code projection string
- Alpha.7 runtime IR path smoke

This step did not:
- create the full IR matrix
- load all NeoBlock targets
- recursively load full graph
- execute NeoBlocks
- execute MOLT blocks
- invent NeoStacks
- modify UMG-Block-Library
- enable direct_source
- load HUMAN/archive/Resleever lanes as machine sources
- bind tools
- publish
- package

## New Tool

- `umg_envoy_runtime_ir_path`

## Current Runtime Path

Observed active path:
- `SLEEVE neomagnetar-dynamic-persona-v1 [ON]`
- `NEOSTACK none_declared [REFERENCE_ONLY]`
- `NEOBLOCK primary.sample [ON]`
- `MOLTBLOCK primary.sample / Primary [ON]`

## Dormant Refs

Observed dormant refs:
- `directive.sample`
- `instruction.sample`
- `subject.sample`
- `philosophy.sample`
- `blueprint.sample`
- `trigger.sample`

## Excluded Lanes

Confirmed:
- `archive [OFF]`
- `HUMAN [REFERENCE_ONLY]`
- `Resleever [OFF]`
- `direct_source [OFF]`

## NL Projection

Confirmed:
- `nlProjection` exists
- includes `Runtime IR Path`
- includes `Dormant NeoBlock Refs`
- includes `Excluded Lanes`

## Verification

Passed:
- `npm run check`
- `npm run build`
- `node scripts/alpha6-real-library-resolver-smoke.mjs`
- `node scripts/alpha7-graph-resolver-smoke.mjs`
- `node scripts/alpha7-sleeve-tree-smoke.mjs`
- `node scripts/alpha7-neostack-inspector-smoke.mjs`
- `node scripts/alpha7-neoblock-inspector-smoke.mjs`
- `node scripts/alpha7-moltblock-inspector-smoke.mjs`
- `node scripts/alpha7-runtime-ir-path-smoke.mjs`

## Tool Count

- previous Alpha.7 Step 5 count: `23`
- Alpha.7 Step 6 count: `24`

## Safety Confirmations

Confirmed:
- readOnly = `true`
- execution = `not_performed`
- directSource = `not_enabled`
- all-target recursive loading = `not_performed`
- HUMAN machine loading = `not_performed`
- archive loading = `not_performed`
- Resleever loading = `not_performed`
- UMG-Block-Library mutation = `not_performed`

## Required Next Task

Next task:
`ALPHA7_IMPLEMENTATION_STEP7_RUNTIME_IR_MATRIX_FULL`
