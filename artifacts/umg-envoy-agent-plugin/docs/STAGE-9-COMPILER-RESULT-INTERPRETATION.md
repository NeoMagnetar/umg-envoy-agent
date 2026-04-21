# Stage 9 — Compiler Result Interpretation

## Goal
Inspect and classify compiler-result behavior for matrix cases that are already accepted by the current planner + adapter path.

This pass does not widen semantics.
It interprets the current compiler-result surface for accepted adapted cases.

## Basis
Sources used:
- Stage 8 compiler-adapter matrix output
- planner-side summary
- adapter-side trace
- compiler-side `compileResult` / `hasErrors` surface

## Key observation
For the currently representable and adapter-accepted cases:
- planner structural ok = true
- planner semantic ok = true
- adapter ok = true
- adapter issue codes = []
- compileAccepted = true
- but `compileHasErrors = true`

This pattern is consistent across all currently accepted matrix cases.

## Classification buckets used in this pass
- `true_compile_failure`
- `expected_warning_or_noise`
- `adapter_shape_mismatch`
- `compiler_result_interpretation_mismatch`

## Current classification result
### Representable accepted cases
Affected cases:
- `trigger-heavy`
- `neutral-no-trigger`
- `competing-directive`
- `competing-format`
- `persona-modulation`
- `posture-modulation`
- `mixed-modulation`

Current classification:
- `compiler_result_interpretation_mismatch`

Why:
- the adapter path is deterministic and stable
- the adapter does not report errors
- the cases remain expectation-met under the current acceptance logic
- the compiler result surface reports `hasErrors: true`, but this is not yet paired with enough surfaced detail to prove a true compiler incompatibility
- therefore the remaining seam is currently best interpreted as a result-surface interpretation problem until deeper compiler trace/event inspection proves otherwise

Important nuance:
This classification is provisional, not dismissive.
It means the current visible evidence is insufficient to call these true compile failures.

### Intentional bad case
Case:
- `intentional-bad-case`

Current classification:
- blocked before compile by adapter policy, not a compiler-result interpretation issue

Observed adapter block:
- `ADAPTER_BLOCKED_BY_PLANNER_VALIDATION`

## Why not classify as true compile failure yet?
Because the currently accepted cases show:
- consistent planner success
- consistent adapter success
- consistent provenance continuity
- no adapter-side unsupported-intent signal

Without a more detailed compiler trace/error payload surfaced alongside `hasErrors`, calling this a true compile failure would be stronger than the current evidence supports.

## Why not classify as adapter shape mismatch yet?
Because the adapter-generated cases are being accepted through the same current compiler invocation path and the matrix expectations hold.
If the shape were obviously incompatible, we would expect more direct failure signals at adapter or invocation level rather than a stable pattern of accepted invocation plus ambiguous `hasErrors`.

## Current best interpretation
The most defensible current label is:
- `compiler_result_interpretation_mismatch`

Meaning:
- the planner->adapter->compiler path is functioning
- but the meaning of compiler `hasErrors` in this adapted lane is not yet sufficiently surfaced for trustworthy diagnosis

## Provenance continuity
The current trace continuity is intact across all accepted cases:
- planner-side summary preserved
- adapter-side summary preserved
- adapter provenance preserved (`planner-adapter`, `compiler-v0-compatible`)

The missing visibility is on the compiler-result interpretation side, not on planner/adapter provenance.

## Recommended next move
If continuing, the next narrow follow-up should be:
1. surface compiler trace/events and error payload details for accepted adapted cases
2. classify whether `hasErrors: true` corresponds to:
   - real compile-invalid output
   - expected warning/noise
   - result-surface mismatch in this adapted lane
3. keep using the existing matrix rather than widening semantics yet

## Current conclusion
Stage 9 does not show that the planner/adapter seam is broken.
It shows that the next unresolved seam is the meaning of compiler-reported `hasErrors` for already-accepted adapted cases.
