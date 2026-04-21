# Stage 7 — Representative Runtime Smoke Matrix

## Goal
Prove the internal planner loop across a representative runtime matrix before beginning compiler-adapter integration.

## Matrix coverage
The following runtime case types were executed through the full planner path:
- trigger-heavy case
- neutral/no-trigger case
- competing directive case
- competing format case
- persona modulation case
- posture modulation case
- mixed modulation case
- intentional bad case expected to fail semantically

## Captured for each case
- message
- trigger state
- planner doc summary
- structural result
- semantic result
- issue codes
- key bridge provenance
- winner path

## Result summary
The matrix runner completed with:
- total cases: 8
- expectation-met cases: 8
- failed expectations: none

This means:
- the clean single-case result was not a fluke
- the current internal planner loop is now stable enough across representative runtime patterns to support the next stage

## Interpretation
### Good news
The internal planner loop now behaves coherently across multiple runtime patterns, including:
- modulation-heavy requests
- competing instruction/posture/format tensions
- neutral/no-trigger conditions
- a deliberately bad sleeve-resolution case that fails in the expected semantic way

### Important nuance
This does not mean the bridge/canon distinction questions disappear.
The bridge provenance still shows where block-side mappings remain many-to-one grouped modulation bridges.
But those are now interpretable, expected, and visible rather than hidden failures.

## Decision surface
Stage 7 succeeded strongly enough to justify moving to:
- Stage 8 — compiler-adapter integration

Not because every bridge mapping is perfectly one-to-one, but because:
- planner generation is stable
- semantic resolution is stable where expected
- intentional failure behavior is stable
- provenance remains explicit and inspectable

## Recommendation
Proceed to compiler-adapter integration on top of the current internal planner lane.
Do not widen outward yet.
Keep using the Stage 7 matrix as a regression surface while building the adapter.
