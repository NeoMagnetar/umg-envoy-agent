# UMG Path Shorthand v0.2 Contract

This document freezes the internal planner contract for the current plugin lane.

Until this document is intentionally revised, parser / validator / renderer / builder work must conform to this contract rather than inventing local syntax.

## Status
- lane: internal plugin only
- version: `v0.2`
- role: planner contract before compiler handoff

## Core purpose
UMG Path Shorthand is the planner-layer representation that sits between:
- runtime trigger/gate activation
- sleeve / stack / block legend resolution
- compiler adapter input generation

It is not the compiler format itself.
It is the explicit planning route that the runtime can inspect, validate, trace, and then translate into compiler-ready input.

## Required top-level headers
A valid planner document may contain the following top-level lines:

- `USE[...]`
- `AIM[...]`
- `NEED[...]`
- `SLV[...]`
- `TRG[...]`
- `GATE[...]`
- `LOAD[...]`
- `CMP[...]`

### Canonical meanings
- `USE` = what the planner route is being used for operationally
- `AIM` = what outcome/destination the route is optimizing for
- `NEED` = non-optional requirements/constraints shaping the route
- `SLV` = sleeve identifier the route is anchored to
- `TRG` = trigger ids active or relevant for the route
- `GATE` = gate state declarations relevant to the route
- `LOAD` = loaded stack ids for the route
- `CMP` = compiler handoff stage sequence

## Hierarchy containers
A planner document expresses stack/block/molt hierarchy with:

- `STACK[...]`
- `BLOCK[...]`
- `MOLT[...]`
- `ENDBLOCK`
- `ENDSTACK`

### Hierarchy rules
- `BLOCK[...]` may only appear inside an open `STACK[...]`
- `MOLT[...]` may only appear inside an open `BLOCK[...]`
- `ENDBLOCK` closes the most recent open block
- `ENDSTACK` closes the most recent open stack
- nested `STACK` inside `STACK` is illegal in v0.2
- nested `BLOCK` inside `BLOCK` is illegal in v0.2

## MOLT state markers
Each `MOLT[...]` line begins with a state symbol.

Canonical symbols:
- `+` = active
- `~` = latent
- `-` = suppressed
- `x` = hard-off

### State semantics
- `active` = currently selected for route execution influence
- `latent` = present/available but not currently selected as active
- `suppressed` = intentionally de-emphasized due to current route competition or conditions
- `hard-off` = explicitly disabled and unavailable to win within the current route

## Winner semantics
Winner is a planner concept distinct from ordinary node state.

In v0.2, winner is expressed through:
- `WIN[...]`
- winner-related relationships/chains
- future adapter interpretation into compile intent

Winner is not encoded as a fifth MOLT state symbol in v0.2.
It is a declared route outcome over ids/chains.

## Role codes
Canonical role codes for `MOLT[...]`:
- `T` = trigger-oriented node
- `D` = directive
- `I` = instruction
- `S` = subject
- `P` = primary
- `H` = philosophy
- `B` = blueprint

## Relationship declarations
Relationships are declared with:
- `REL[KIND]{...}`

Canonical relationship kinds in v0.2:
- `PAR` = parallel
- `SEQ` = sequence
- `NEST` = nested
- `OVR` = overlay

### Compatibility note
`CHN` may still appear in transitional code artifacts, but it is not a canonical relationship marker in the frozen v0.2 contract.
If encountered, it should be treated as compatibility-only and normalized explicitly rather than extended informally.

## Bundle declarations
Bundles are declared with:
- `BND[ROLE]=INTENT(member|member|...)`

Canonical bundle intents in current v0.2 code lane:
- `ALT`
- `RANK`
- `COACT`

Bundle semantics:
- bundle members must be same-role compatible for the declared bundle lane
- bundle declarations describe planner-level grouped competition or co-activation intent
- bundle meaning must be preserved into compiler adapter translation rather than guessed later

## Merge declarations
Merges are declared with:
- `MRG[ROLE]=(source+source+...)=>result`

Merge semantics:
- sources declare planner-level merge inputs
- result declares intended merged output id
- merge legality is validator-resolved, not assumed from syntax alone

## Winner path
Winners are declared with:
- `WIN[key]=value`

Canonical current use:
- `WIN[chain]=...`

Winner path semantics:
- winner may point to a chain string, a declared id, or another normalized planner winner target supported by the adapter
- winner path must be explicit and inspectable
- winner path must never depend on hidden compiler guessing

## Compiler handoff
Compiler handoff stages are declared with:
- `CMP[stage>stage>stage...]`

Default internal sequence:
- `validate>normalize>merge>bundle>govern>compile>emit`

This is the planner-to-compiler handoff contract, not merely a display string.

## Gate declarations
Gates are declared with:
- `GATE[+gate,-gate,...]`

Canonical meanings:
- `+` = gate active/open
- `-` = gate suppressed/closed

## Minimum valid planner doc
A minimally valid v0.2 planner document must include:
- `USE`
- `AIM`
- `SLV`
- `CMP`

Practically expected in normal runtime use:
- `TRG`
- `GATE`
- `LOAD`
- at least one stack/block/molt hierarchy

## Validation expectations
Validator behavior in the frozen contract should ultimately enforce:
- valid sleeve id
- valid stack ids
- valid block ids
- valid hierarchy nesting
- legal relationship declarations
- no illegal state contradictions
- legal bundle syntax
- legal merge syntax
- legal winner chain
- no forbidden overlaps or impossible requests

## Non-goals for v0.2 freeze
Do not add during this freeze:
- compiler rewrite
- freehand sleeve authoring via planner syntax
- exotic merge semantics not tied to adapter support
- informal alternate syntaxes that bypass this contract

## Practical rule
The planner layer is now a real runtime subsystem contract.
Parser, validator, resolver, builder, adapter, trace, and tests should all converge on this document.
