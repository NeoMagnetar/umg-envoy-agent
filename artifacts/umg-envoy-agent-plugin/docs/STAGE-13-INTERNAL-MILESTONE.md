# Stage 13 — Internal Lane Packaging and Operator Surfacing

## Milestone
The internal planner / bridge / asset / adapter / compiler lane is frozen here as a working integrated internal milestone for the currently supported runtime patterns.

## What is frozen at this milestone
- planner contract and runtime planner path
- semantic legend resolver and explicit provenance bridge
- asset-side distinction recovery for modulation surfaces
- resolver support for generated recovery assets
- planner assembly and policy cleanup
- representative runtime smoke matrix
- fail-closed compiler adapter
- compiler-shape alignment
- compile-clean matrix confirmation

## Operator-facing commands added for this milestone
- `umg-envoy path-trace`
- `umg-envoy adapter-trace`
- `umg-envoy compiler-trace`
- `umg-envoy matrix-status`
- `umg-envoy matrix-status --compiler`

## Regression gate to preserve
This milestone should continue to be guarded by:
- Stage 7 runtime smoke matrix
- Stage 8/11/12 compiler matrix

## Current risk
The main risk is now drift, not rescue.
That is why this milestone is being frozen before any further semantics widening.
