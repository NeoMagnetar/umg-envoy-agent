# Stage 4d Bridge Classification

This pass classifies the current explicit runtime-to-legend bridge using real runtime trace output rather than abstract completeness goals.

## Basis
Source surface used:
- `src/umg-runtime-planner-smoke.ts`
- current smoke output from `dist/umg-runtime-planner-smoke.js`
- `config/runtime-legend-alignment.default.json`

## Classification buckets
- `bridge_only`
- `canon_candidate`
- `asset_cleanup_needed`

## Current summary
The current bridge is functioning, but the observed mappings are still dominated by bridge-only many-to-one collapses.

That means:
- the bridge is useful and honest
- semantic success is now inspectable
- current authoritative/discovered targets are still too coarse to preserve runtime distinctions fully

## Many-to-one mappings grouped by target

### Stack targets
#### Target: `S.01`
Emitted runtime sources:
- `stack.persona.core`
- `stack.response.format`
- `stack.response.posture`

Observed properties:
- status: `authoritative`
- target kind: `catalog_backed`
- mode: `bridge_only_many_to_one`
- emitted source count: `3`

Proposed classification:
- `asset_cleanup_needed`

Why:
- a catalog-backed target exists, but it is too coarse for three distinct runtime modulation stacks.
- this suggests the authoritative stack surface is not yet representing the runtime distinction we are actually using.

### Block targets
#### Target: `N.03.01`
Emitted runtime sources:
- `block.format.list`
- `block.persona.analytical`
- `block.persona.base`
- `block.posture.direct`
- `block.format.narrative`
- `block.persona.formal`
- `block.persona.playful`
- `block.posture.expansive`

Observed properties:
- status: `authoritative`
- target kind: `catalog_backed`
- mode: `bridge_only_many_to_one`
- emitted source count: `8`

Proposed classification:
- `asset_cleanup_needed`

Why:
- one authoritative NeoBlock target is currently absorbing multiple distinct runtime concepts across persona, posture, and format.
- this is too coarse to treat as trustworthy canon alignment.

### MOLT / library targets
#### Target: `INST.061`
Emitted runtime sources:
- `block.format.list`
- `block.persona.analytical`
- `block.persona.base`
- `block.posture.direct`
- `block.format.narrative`
- `block.persona.formal`
- `block.persona.playful`
- `block.posture.expansive`

Observed properties:
- status: `discovered`
- target kind: `discovered_fallback`
- mode: `bridge_only_many_to_one`
- emitted source count: `8`

Proposed classification:
- `asset_cleanup_needed`

Why:
- this is not even a catalog-backed authoritative target.
- the bridge is compensating for thin underlying asset representation using a discovered fallback target.
- this is the clearest current signal that the authoritative side needs cleanup or expansion.

## Discovered-fallback targets report
Current discovered-fallback targets observed in the real smoke trace:
- `INST.061`

All observed mappings to this target are currently proposed as:
- `asset_cleanup_needed`

Reason:
- discovered fallback + many-to-one collapse is too weak to treat as durable canon alignment.

## Canon-candidate mappings report
Current observed canon-candidate mappings:
- none yet from the current real smoke trace

Reason:
- the current trace is dominated by many-to-one bridge-only/coarse mappings.
- nothing in the current sample demonstrates a stable one-to-one runtime concept that obviously deserves later canonical promotion.

## Unresolved mappings report
Current observed unresolved mappings in the real smoke trace:
- none in this smoke pass

This is good for runtime continuity, but it does not reduce the importance of the coarse-target problem above.

## Per-entry proposed classification

### Stack mappings
- `stack.persona.core -> S.01` = `asset_cleanup_needed`
- `stack.response.format -> S.01` = `asset_cleanup_needed`
- `stack.response.posture -> S.01` = `asset_cleanup_needed`

### Block mappings
- `block.format.list -> N.03.01` = `asset_cleanup_needed`
- `block.persona.analytical -> N.03.01` = `asset_cleanup_needed`
- `block.persona.base -> N.03.01` = `asset_cleanup_needed`
- `block.posture.direct -> N.03.01` = `asset_cleanup_needed`
- `block.format.narrative -> N.03.01` = `asset_cleanup_needed`
- `block.persona.formal -> N.03.01` = `asset_cleanup_needed`
- `block.persona.playful -> N.03.01` = `asset_cleanup_needed`
- `block.posture.expansive -> N.03.01` = `asset_cleanup_needed`

### MOLT mappings
- `block.format.list -> INST.061` = `asset_cleanup_needed`
- `block.persona.analytical -> INST.061` = `asset_cleanup_needed`
- `block.persona.base -> INST.061` = `asset_cleanup_needed`
- `block.posture.direct -> INST.061` = `asset_cleanup_needed`
- `block.format.narrative -> INST.061` = `asset_cleanup_needed`
- `block.persona.formal -> INST.061` = `asset_cleanup_needed`
- `block.persona.playful -> INST.061` = `asset_cleanup_needed`
- `block.posture.expansive -> INST.061` = `asset_cleanup_needed`

## Practical interpretation
The bridge did its job.
It stopped guessing and surfaced the real shape of the problem.

The current bridge is not mainly telling us:
- "promote these ids into canon"

It is mainly telling us:
- "the current authoritative/discovered targets are too coarse for the runtime distinctions already in use"

## Recommended next move after Stage 4d
Do not widen into compiler work yet.
Do not add more planner mechanics yet.

The next sensible move is a focused asset-side cleanup/design pass driven by these observed coarse targets, likely starting with:
- stack-side canonical representation for persona/posture/format modulation
- block-side canonical representation that does not collapse eight runtime concepts into one NeoBlock
- replacement of discovered fallback MOLT targets with explicit authoritative representations where appropriate
