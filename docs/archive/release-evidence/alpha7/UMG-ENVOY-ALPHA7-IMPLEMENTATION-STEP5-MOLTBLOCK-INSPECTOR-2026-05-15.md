# UMG Envoy Agent Alpha.7 — Implementation Step 5: MOLT Block Inspector

Date: 2026-05-15

## Verdict

`ALPHA7_MOLTBLOCK_INSPECTOR_READY`

## Baseline

Previous step:
- `ALPHA7_NEOBLOCK_INSPECTOR_READY`

Step 4 commit:
- `56dc1120ce459844112a4be77643c7459fed7571`

## Scope

This step added the read-only MOLT Block inspector.

This step added:
- `umg_envoy_moltblock_inspect`
- shallow-visible MOLT block inspection
- parent NeoBlock unavailable/not-loaded handling
- visible-graph-only MOLT lookup
- Alpha.7 MOLT Block inspector smoke

This step did not:
- load all NeoBlock targets
- recursively load full graph
- execute NeoBlocks
- execute MOLT blocks
- invent MOLT blocks for not-loaded targets
- modify UMG-Block-Library
- enable direct_source
- load HUMAN/archive/Resleever lanes as machine sources
- bind tools
- publish
- package

## New Tool

- `umg_envoy_moltblock_inspect`

## Current Visible MOLT Block

Observed:
- MOLT block id: `primary.sample`
- parent NeoBlock: `primary.sample`
- MOLT type: `Primary`
- MOLT type source: `shallow_loaded_target`
- state: `ON`
- source: `shallow_loaded_target`

## Current Not-Loaded Parent Behavior

Confirmed:
- `directive.sample` with parent NeoBlock context returns `HOLD_NEOBLOCK_TARGET_AVAILABLE_NOT_LOADED`
- no target file is loaded

## Visible Graph Behavior

Confirmed:
- lookup is restricted to visible graph only
- `directive.sample` without parent NeoBlock context is not treated as a visible MOLT block
- unknown MOLT block returns `HOLD_MOLTBLOCK_NOT_FOUND_IN_VISIBLE_GRAPH`

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

## Tool Count

- previous Alpha.7 Step 4 count: `22`
- Alpha.7 Step 5 count: `23`

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
`ALPHA7_IMPLEMENTATION_STEP6_RUNTIME_IR_PATH`
