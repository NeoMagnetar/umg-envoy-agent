# Post-Stage-8 Representability Boundary

## Purpose
Make the current compiler-adapter boundary explicit and inspectable across the representative runtime matrix.

This pass does not widen compiler semantics.
It records what current planner intent is:
- fully representable in compiler-v0
- blocked by adapter policy
- future-semantics-required

## Current matrix verdict
Using the Stage 7/8 runtime matrix:
- total cases: 8
- expectation-met cases: 8
- failed expectations: none

## Boundary classes used in this pass
### 1. Fully representable in compiler-v0
Meaning:
- planner doc passed structural validation
- planner doc passed semantic validation
- adapter produced deterministic compiler-v0-compatible sleeve + triggerState input
- compiler invocation path accepted the adapted case
- provenance continuity remained visible across planner -> adapter boundary

### 2. Blocked by adapter policy
Meaning:
- planner doc did not pass required validation gate
- or planner intent included unsupported semantics such as merges/bundles
- adapter refused compile path explicitly rather than flattening intent silently

Current explicit blocked code:
- `ADAPTER_BLOCKED_BY_PLANNER_VALIDATION`

Reserved blocked codes for future unsupported semantics:
- `ADAPTER_UNSUPPORTED_BUNDLES`
- `ADAPTER_UNSUPPORTED_MERGES`

### 3. Future-semantics-required
Meaning:
- planner intent is valid at planner level but cannot be represented in current compiler-v0 semantics without adding real adapter/compiler support

Current matrix status:
- no Stage 7/8 matrix case landed in this bucket yet because current representative cases do not exercise bundle/merge semantics

## Case-by-case classification

### Fully representable in compiler-v0
- `trigger-heavy`
- `neutral-no-trigger`
- `competing-directive`
- `competing-format`
- `persona-modulation`
- `posture-modulation`
- `mixed-modulation`

Shared properties:
- planner structural ok = true
- planner semantic ok = true
- adapter issue codes = []
- adapter provenance includes `planner-adapter` and `compiler-v0-compatible`
- compiler path accepted adapted case

Important note:
The current compile outputs still report `compileHasErrors: true` in the compiler result surface for these cases, but the matrix expectation logic and adapter acceptance path remain stable and deterministic. This suggests the next inspection, if desired, is on compiler-result interpretation rather than on planner/adapter representability.

### Blocked by adapter policy
- `intentional-bad-case`

Observed reason:
- planner semantic validation failed with `LEGEND_UNKNOWN_SLEEVE`
- adapter refused compile path with `ADAPTER_BLOCKED_BY_PLANNER_VALIDATION`

Why this is correct:
- the adapter did not bypass the planner
- the adapter did not try to flatten invalid planner intent into compiler input
- provenance remained visible through `blocked-by-planner-validation`

### Future-semantics-required
- none yet in current matrix

Why none yet:
- the current representative runtime matrix does not include planner docs with active bundle/merge intent that survive planner validation and reach adapter translation

## Provenance continuity
Current boundary continuity is preserved explicitly.

Planner side records:
- sleeve id
- stack ids
- block ids
- molt ids
- winner path
- trigger ids

Adapter side records:
- adapted stack ids
- adapted compiler block ids
- active trigger ids
- provenance markers

Example provenance continuity modes observed:
- `planner-adapter` -> `compiler-v0-compatible`
- `planner-adapter` -> `blocked-by-planner-validation`

## Practical conclusion
The current representability boundary is now explicit enough to guide future work.

What the system can truly compile today:
- current Stage 7 representative runtime cases without merge/bundle semantics

What the system correctly refuses today:
- planner docs that fail validation before adapter translation

What would require future semantics work:
- planner docs with representable-but-currently-unsupported merge/bundle intent

## Recommended next move
If continuing from here, the next useful lane is not broad architecture work.
It is likely one of:
1. inspect compiler result interpretation for the currently accepted adapted cases (`compileHasErrors: true` surface)
2. add explicit representability matrix cases for bundles/merges to populate the `future-semantics-required` bucket honestly
3. expose the adapter boundary report through CLI/tooling for repeatable inspection
