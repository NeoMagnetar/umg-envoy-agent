# Stage 8 — Compiler Adapter Integration

## Goal
Adapt the validated planner document into current compiler-v0-compatible input without widening compiler semantics or bypassing planner provenance.

## Adapter scope
The adapter currently does only this:
- consumes a planner document
- maps planner-selected stacks, NeoBlocks, MOLT nodes, winners, and trigger ids into a compiler-v0-compatible sleeve + triggerState input
- preserves planner-side and adapter-side provenance in trace
- fails clearly when planner intent cannot be represented safely

## Explicit non-goals in this pass
- no compiler semantic widening
- no merge semantics expansion
- no bundle semantics expansion
- no planner bypass
- no provenance loss

## Current fail-closed behavior
The Stage 8 matrix now blocks compile when planner validation has not passed.
That means intentionally bad planner cases do not reach compiler invocation through the adapter.

Blocked code used in this stage:
- `ADAPTER_BLOCKED_BY_PLANNER_VALIDATION`

Unsupported future intent codes already reserved by adapter policy:
- `ADAPTER_UNSUPPORTED_BUNDLES`
- `ADAPTER_UNSUPPORTED_MERGES`

## Matrix result
The compiler-adapter matrix completed with:
- total cases: 8
- expectation-met cases: 8
- failed expectations: none

This means:
- valid planner cases adapted deterministically
- the current compiler-v0 surface accepted the adapted valid cases
- the intentional bad case failed cleanly before compile because planner validation did not pass

## Why this matters
This is the first end-to-end point where:
- planner side is stable
- adapter side is deterministic
- compiler side is gated by planner validity
- provenance is still visible across the seam

## Current conclusion
Stage 8 passed narrowly and correctly.
The adapter is not widening compiler semantics; it is conservatively translating planner output into the current compiler-v0 surface while keeping the Stage 7/8 matrix as the regression gate.
