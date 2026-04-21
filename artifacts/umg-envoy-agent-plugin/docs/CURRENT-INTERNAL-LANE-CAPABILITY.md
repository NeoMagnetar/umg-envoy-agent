# Current Internal Lane Capability

## Supported now
The current internal lane supports a clean end-to-end path for the currently covered runtime matrix:
- runtime message -> planner document
- planner validation
- semantic legend resolution
- runtime/legend bridge provenance
- asset-recovered modulation surfaces
- fail-closed planner -> compiler adapter
- compiler-v0-compatible shape alignment
- compile-clean accepted matrix cases

## Operator-facing inspection surfaces
Current operator-facing surfaces now include:
- `umg-envoy path-trace`
- `umg-envoy adapter-trace`
- `umg-envoy compiler-trace`
- `umg-envoy matrix-status`
- `umg-envoy matrix-status --compiler`

## Fail-closed behavior
The internal lane is intentionally fail-closed for:
- planner docs that fail structural/semantic validation
- unsupported adapter intent such as planner merges/bundles not yet representable in current compiler-v0 adapter policy

Current explicit blocked codes include:
- `ADAPTER_BLOCKED_BY_PLANNER_VALIDATION`
- `ADAPTER_UNSUPPORTED_BUNDLES`
- `ADAPTER_UNSUPPORTED_MERGES`

## Not yet widened
The following are intentionally not widened yet:
- broader planner semantics beyond the current supported runtime matrix
- merge support beyond current fail-closed adapter policy
- bundle support beyond compiler-v0-compatible alternates structure already in use
- public-lane widening of the full internal planner/adapter/compiler subsystem

## Regression gate
The current internal lane should be treated as stable only while the matrix gate remains green:
- Stage 7 runtime smoke matrix
- Stage 8/11/12 compiler adapter + compile-clean matrix

## Current posture
This is now a working integrated internal subsystem for the currently supported runtime patterns.
It should be preserved against drift before any semantics widening.
