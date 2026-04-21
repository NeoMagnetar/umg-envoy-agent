# Stage 6 — Planner Assembly Cleanup

## Goal
Clean up runtime planner assembly issues after the asset-recovery and resolver-recovery seam was solved.

## Scope in this pass
Only the four intended cleanup targets were addressed:
1. duplicate MOLT assembly
2. empty-stack artifacts
3. winner target alignment
4. explicit trigger presence handling

## What changed
### Duplicate MOLT assembly
The runtime planner now deduplicates aligned entries before planner document assembly.
It also avoids emitting the same resolved MOLT id more than once inside the same assembled NeoBlock.

### Empty-stack artifacts
The runtime planner no longer emits stacks that end up with zero assembled NeoBlocks after alignment/grouping.

### Winner target alignment
Winner paths are now built from aligned resolved block + resolved MOLT ids rather than mixing resolved block ids with fallback/non-resolved MOLT targets.

### Trigger presence handling
The runtime planner now computes an explicit trigger state:
- `matched`
- `neutral`
- `omitted`

Current smoke result uses:
- `trigger_state:neutral`

This means no triggers fired, but the message was present and the omission was not accidental.

## Result
The real runtime smoke now dropped the following prior issues:
- `DUP_MOLT_ID`
- `EMPTY_STACK`
- `WIN_UNKNOWN_TARGET`

Remaining observed issue codes:
- `SLEEVE_ID_SHAPE`
- `MULTI_ACTIVE_BLOCK`
- `NO_TRIGGERS`

## Interpretation
This is a meaningful cleanup pass.
The remaining problems are smaller and more policy-shaped than the previous asset/resolution gaps.

### `SLEEVE_ID_SHAPE`
This is a naming-shape warning rather than a semantic failure.

### `MULTI_ACTIVE_BLOCK`
This suggests the current assembly still allows more than one active modulation member inside a recovered block grouping. That may be either:
- a real remaining assembly issue
- or a validator rule that is too strict for modulation-style grouped NeoBlocks

### `NO_TRIGGERS`
This warning now coexists with explicit `trigger_state:neutral`, which means the runtime planner knows why no triggers are present. The validator warning may now need to become context-aware rather than generic.

## Practical next move
If continuing immediately, the next narrow cleanup should likely be:
1. inspect whether `MULTI_ACTIVE_BLOCK` is a real planner problem or a validator-policy mismatch for modulation groups
2. make `NO_TRIGGERS` warning context-aware when trigger state is explicitly `neutral`
3. decide whether sleeve-id shape warnings should accept this internal lane naming style or remain intentionally noisy
