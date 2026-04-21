# Stage 5b Resolver Recovery Status

## Goal
Teach the legend resolver to recognize the generated Stage 5a recovery assets as valid resolution surfaces while preserving provenance and precedence truth.

## What changed
The legend resolver now indexes generated recovery lanes for:
- generated NeoStacks
- generated NeoBlocks
- generated MOLT entries

It preserves explicit source-class truth with precedence:
- `catalog_backed`
- `generated_recovery`
- `discovered_fallback`

Current precedence rule:
- catalog-backed beats generated-recovery
- generated-recovery beats discovered-fallback

## Result
After Stage 5b:
- semantic legend resolution passes again
- the new Stage 5a recovery assets are visible to the resolver
- the bridge can now point to real recovery assets without being rejected as unknown legend targets

## Why this matters
This demonstrates the bridge was not merely diagnosing a problem abstractly.
It correctly identified the exact missing asset-side distinctions that, once added and indexed, reduce the gap in a real runtime planner pass.

## Remaining issue shape
The remaining issues are no longer legend-visibility failures.
Observed remaining warnings/errors are structural/planner-shape concerns such as:
- duplicate MOLT ids in current planner assembly
- empty stack warnings
- winner target trace issues
- no triggers in the current sample input

Those are downstream from the asset-recovery seam and can be handled separately.

## Practical conclusion
Stage 5a + 5b together prove:
- the current coarse-target problem was real
- the bridge correctly exposed it
- a small authoritative recovery set meaningfully improved the seam
- the resolver can now see and use those recovery assets deterministically
