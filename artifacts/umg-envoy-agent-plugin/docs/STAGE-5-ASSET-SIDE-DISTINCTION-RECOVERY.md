# Stage 5 — Asset-side Distinction Recovery

## Goal
Restore missing distinctions on the authoritative side where the current bridge is collapsing too much runtime meaning into too few targets.

This stage is driven by real runtime evidence from the Stage 4d classification report.

## Confirmed coarse targets
Direct inspection confirms the current targets are semantically wrong for the runtime concepts being mapped into them.

### Current stack-side coarse target
- `S.01` = `SERVER SETUP & CONFIGURATION STACK`

This is not a credible authoritative target for runtime modulation concepts like:
- persona core
- response posture
- response format

### Current block-side coarse target
- `N.03.01` = `Basic Item Creation`

This is not a credible authoritative NeoBlock target for:
- persona base
- persona playful / analytical / formal
- posture direct / expansive
- format list / narrative

### Current MOLT-side coarse/discovered fallback target
- `INST.061` = `write clean code`

This is not a credible authoritative instruction target for runtime modulation concepts above.
Its current use is a bridge fallback symptom, not a legitimate semantic destination.

## Stage 5 workstreams
Only three workstreams belong in this stage.

### 1. Stack-side cleanup
Question:
Do persona, posture, and format modulation need distinct authoritative stack representations?

Current answer:
Yes, probably.
The current collapse into `S.01` is clearly semantically invalid.

Minimal proposed recovery:
- introduce distinct authoritative stack surfaces for:
  - persona modulation
  - response posture modulation
  - response format modulation

Do not overbuild broader stack taxonomy yet.
Recover only the distinctions the runtime is already using.

### 2. Block-side cleanup
Question:
Do the current runtime block concepts deserve separate authoritative NeoBlocks or some other more faithful structure?

Current answer:
Yes.
Collapsing eight runtime concepts into `N.03.01` destroys important distinctions.

Minimal proposed recovery:
- define distinct authoritative NeoBlock surfaces at least for:
  - persona modulation block
  - posture modulation block
  - format modulation block

Possible later refinement:
- split further if runtime evidence shows the need
- keep sub-block/member structure where appropriate

Do not create eight isolated canonical NeoBlocks unless real runtime evidence requires that shape.
Start by recovering the main modulation axes first.

### 3. MOLT-side cleanup
Question:
Should the current runtime concepts continue resolving through discovered fallback `INST.061`?

Current answer:
No.
That is the clearest current pressure point for explicit authoritative asset cleanup.

Minimal proposed recovery:
Create explicit authoritative MOLT representations for the modulation concepts currently being bridged, likely in instruction-oriented and/or directive-oriented surfaces depending on how they function in runtime composition.

At minimum, recover explicit representations for:
- persona modulation
- posture modulation
- format modulation

Potential finer-grain later distinctions:
- playful / analytical / formal
- direct / expansive
- list / narrative

But only if the runtime evidence justifies separate authoritative MOLT entries rather than grouped modulation sets.

## Strict rule
Do not promote new canon just because the bridge found a collapse.

The bridge surfaces missing distinctions.
It does not automatically decide the final canonical shape.

## Recommended workflow
1. use the Stage 4d report as the asset-gap map
2. inspect each coarse target directly
3. propose minimal authoritative distinctions needed
4. implement only distinctions justified by real runtime use
5. re-run Stage 4b/4c/4d bridge passes
6. verify collapse is reduced rather than merely moved around

## Immediate next implementation target
The narrowest justified first recovery step appears to be:
- create three authoritative modulation stacks
- create three authoritative modulation NeoBlocks
- create explicit modulation-oriented MOLT entries so runtime no longer depends on `INST.061` fallback for those concepts

That is enough to test whether distinction recovery reduces the current bridge collapse without rewriting the broader asset library.
