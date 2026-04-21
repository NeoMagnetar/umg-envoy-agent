# Stage 11 — Compiler-Shape Alignment

## Goal
Fix the remaining compiler-shape seam for accepted adapted cases without widening planner semantics.

This stage addresses only:
1. required primary representation for adapted stacks
2. modulation-group mapping into compiler-v0-compatible alternates/active structure

## What changed
### Primary representation
The adapter now derives a primary block for each adapted stack:
- `S.MOD.01::PRIMARY`
- `S.MOD.02::PRIMARY`
- `S.MOD.03::PRIMARY`

This satisfies compiler-v0's requirement that each stack include a primary representation.

### Modulation-group structure
The adapter no longer invents separate pseudo-stacks for alternates bundles.
Instead, alternates bundles are recorded as segments inside the real stack structure.

This lets compiler-v0 interpret modulation groups as bundled instruction alternates within a normal stack instead of as separate stacks lacking primaries.

## Compiler payload result
After Stage 11 alignment, an accepted adapted case now yields:
- `hasErrors: false`

Observed compiler events include:
- `INFO_PRIMARY_SELECTED`
- `WARN_MULTIPLE_INSTRUCTION_BUNDLED`
- `INFO_PRIORITY_RESOLVED`
- `INFO_DONE`

This means compiler-v0 is now interpreting the modulation groups as expected bundled alternates and resolving them by priority rather than treating them as invalid multiple-active instruction structures.

## Matrix result
The full Stage 8 matrix still holds after the Stage 11 adapter change:
- total cases: 8
- expectation-met cases: 8
- failed expectations: none

## Why this matters
Stage 10 showed the remaining seam was no longer planner/bridge/asset visibility.
It was compiler-shape alignment.

Stage 11 resolves that seam for the current accepted cases by:
- adding required primary representation
- expressing modulation groups in compiler-v0-compatible alternates form
- preserving planner-side, adapter-side, and compiler-side provenance
- keeping fail-closed behavior for unsupported cases

## Practical conclusion
For the currently accepted representable matrix cases, the planner -> adapter -> compiler-v0 path is now not only reachable but compiler-clean at the shape level.

This was achieved without:
- widening planner semantics
- rewriting merge semantics
- rewriting bundle semantics beyond compiler-v0's existing alternates structure
