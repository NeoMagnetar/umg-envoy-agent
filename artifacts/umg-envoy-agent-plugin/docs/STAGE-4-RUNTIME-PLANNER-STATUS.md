# Stage 4 Runtime Planner Status

## What landed
A deterministic runtime-to-planner path now exists in the internal plugin lane.

Main additions:
- `src/umg-runtime-planner.ts`
- `src/umg-runtime-planner-smoke.ts`
- CLI semantic validation option on `validate-path`
- CLI `path-trace` command
- `build-path` now routes through the Stage 4 runtime planner helper

## Current behavior
The runtime planner now:
1. reads current message input
2. derives runtime activation trace and payload from authored trigger/resolver rules
3. emits a planner document
4. runs structural validation
5. runs semantic legend resolution
6. returns an inspectable planner-trace object

## Important current finding
The first deterministic smoke run succeeded structurally but failed semantic resolution.

This is expected and useful.

It shows the current authored resolver-rule ids are still in a local runtime modulation namespace such as:
- `stack.persona.core`
- `block.persona.base`
- `block.posture.direct`
- `block.format.list`

Those ids do not yet align with authoritative Block Library / Resleever stack/block ids, so semantic legend resolution correctly fails.

## Why this matters
This confirms the planner pipeline is now honest and inspectable:
- we can see the runtime planner output
- we can see structural validity
- we can see semantic failures clearly
- we do not need to guess where the mismatch is

## What Stage 4 now needs next
The next Stage 4 sub-pass should align deterministic runtime modulation ids with authoritative legend-backed ids.

That likely means one or both of:
- adding explicit mapping from current runtime modulation ids to real legend ids
- replacing local modulation ids in resolver-rules with authoritative ids once those assets are curated enough

Do not let the runtime planner silently become a permanent canon source.
The long-term truth should remain in Block Library / Resleever assets and their manifests.

## Current conclusion
Stage 4 plumbing is active.
The planner can now emit live docs from runtime state.
The remaining work is semantic id alignment between runtime modulation rules and authoritative legend surfaces.
