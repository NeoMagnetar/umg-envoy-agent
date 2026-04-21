# Stage 12 — Compile-Clean Matrix Confirmation

## Goal
Confirm that all currently accepted representable runtime matrix cases are compile-clean across the full planner -> adapter -> compiler path.

This pass does not widen semantics.
It confirms clean compiler behavior across the current supported runtime patterns.

## Assertion used
For accepted representable cases:
- `compileAccepted = true`
- `compileHasErrors = false`

For the intentional bad case:
- fail-closed behavior must remain intact
- compile should not proceed past planner-validation gate

## Matrix result
Full matrix summary:
- total cases: 8
- expectation-met cases: 8
- failed expectations: none

## Accepted representable cases
The following cases are now compile-clean:
- `trigger-heavy`
- `neutral-no-trigger`
- `competing-directive`
- `competing-format`
- `persona-modulation`
- `posture-modulation`
- `mixed-modulation`

For all of these cases:
- planner structural ok = true
- planner semantic ok = true
- adapter ok = true
- adapter issue codes = []
- compiler acceptance = true
- compiler `hasErrors = false`
- provenance continuity preserved across planner -> adapter -> compiler seam

## Intentional bad case
Case:
- `intentional-bad-case`

Behavior:
- planner semantic validation fails as expected (`LEGEND_UNKNOWN_SLEEVE`)
- adapter blocks compile path with `ADAPTER_BLOCKED_BY_PLANNER_VALIDATION`
- `compileAccepted = false`
- `compileHasErrors = false` because compile does not proceed

This confirms fail-closed behavior still holds.

## Provenance continuity
Accepted matrix cases preserve continuity across all three layers:
- planner-side summary
- adapter-side summary
- compiler-side clean acceptance

Adapter trace now clearly records:
- stack ids
- block ids
- active trigger ids
- provenance markers
- derived primary ids
- derived alternates bundle ids

Current accepted-case provenance markers include:
- `planner-adapter`
- `compiler-v0-compatible`
- `stage11-shape-aligned`

## What this proves
The current internal lane is now a genuinely clean end-to-end path for the currently supported runtime patterns.

Specifically, it is no longer merely:
- planner-valid
- semantically resolvable
- adapter-reachable

It is also:
- compiler-clean across the representative accepted matrix

## Practical conclusion
The internal lane now has a clean, evidence-backed:
- runtime planner path
- legend bridge/resolver path
- asset recovery path
- fail-closed adapter path
- compiler-clean shape alignment path

for the current supported runtime patterns.
