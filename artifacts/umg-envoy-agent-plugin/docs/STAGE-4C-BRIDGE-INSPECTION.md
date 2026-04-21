# Stage 4c Bridge Inspection

## Purpose
Tighten the Stage 4b id-alignment bridge without widening scope into compiler changes or broader planner semantics.

## Additions in this pass
The runtime alignment trace now exposes:
- mapping mode: `exact` | `bridge_only_many_to_one` | `unresolved`
- target kind: `catalog_backed` | `discovered_fallback` | `unknown`
- intent: `bridge_only` | `canon_candidate` | `unknown`
- mapping cardinality information
- explicit many-to-one warning surfaces in planner trace output

## Why this matters
A semantic pass succeeding is not enough.
The bridge must also explain when semantic success comes from a coarse temporary mapping rather than from true one-to-one canonical alignment.

## Current finding
The current smoke run shows many-to-one mappings are real in the current bridge.
That means the bridge mechanism is working, but the mapped authoritative/discovered targets are still too coarse to preserve runtime distinction fully.

This is not a planner failure.
It is exactly the kind of seam-inspection result the bridge was meant to surface.

## What this tells us next
After Stage 4c, future work can sort current bridge entries into:
- should remain bridge-only
- should become canon-candidate mappings
- should trigger authoritative asset/catalog cleanup because the target side is still too coarse
