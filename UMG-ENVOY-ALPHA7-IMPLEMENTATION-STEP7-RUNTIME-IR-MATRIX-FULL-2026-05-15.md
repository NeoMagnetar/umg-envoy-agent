# UMG Envoy Agent Alpha.7 — Implementation Step 7: Runtime IR Matrix Full

Date: 2026-05-15

## Verdict

`ALPHA7_RUNTIME_IR_MATRIX_FULL_READY`

## Baseline

Previous step:
- `ALPHA7_RUNTIME_IR_PATH_READY`

Step 6 commit:
- `db2ffcacdda12cdb6bff37407679a86a78535011`

## Scope

This step added the read-only Runtime IR Matrix Full projection.

This step added:
- `umg_envoy_runtime_ir_matrix_full`
- matrix nodes
- matrix edges
- state buckets
- route projection
- dormant refs
- excluded lanes
- NL matrix projection string
- Alpha.7 runtime IR matrix full smoke

This step did not:
- execute anything
- create the tool execution graph
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

- `umg_envoy_runtime_ir_matrix_full`

## Current Matrix Nodes

Confirmed nodes include:
- `SLEEVE neomagnetar-dynamic-persona-v1 [ON]`
- `NEOSTACK none_declared [REFERENCE_ONLY]`
- `NEOBLOCK primary.sample [ON]`
- `MOLTBLOCK primary.sample / Primary [ON]`
- `NEOBLOCK directive.sample [DORMANT]`
- `NEOBLOCK instruction.sample [DORMANT]`
- `NEOBLOCK subject.sample [DORMANT]`
- `NEOBLOCK philosophy.sample [DORMANT]`
- `NEOBLOCK blueprint.sample [DORMANT]`
- `NEOBLOCK trigger.sample [DORMANT]`

## Current Matrix Edges

Confirmed edge relations include:
- `contains_marker`
- `references`
- `available_ref`
- `exposes_molt_summary`
- `excludes_lane`

## State Buckets

Confirmed:
- `ON`
- `DORMANT`
- `REFERENCE_ONLY`
- `OFF`

## Excluded Lanes

Confirmed:
- `archive [OFF]`
- `HUMAN [REFERENCE_ONLY]`
- `Resleever [OFF]`
- `direct_source [OFF]`

## NL Projection

Confirmed:
- `nlProjection` exists
- includes `Runtime IR Matrix`
- includes `Nodes`
- includes `Edges`
- includes `Excluded Lanes`
- includes `Route`

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
- `node scripts/alpha7-runtime-ir-matrix-full-smoke.mjs`

## Tool Count

- previous Alpha.7 Step 6 count: `24`
- Alpha.7 Step 7 count: `25`

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
`ALPHA7_IMPLEMENTATION_STEP8_RESPONSE_ENVELOPE_DRAFT`
