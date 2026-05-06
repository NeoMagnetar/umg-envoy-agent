# UMG Runtime Drill-Down Inspection Foundation

## Purpose

Runtime Drill-Down Inspection answers: what is inside one selected or known runtime artifact, one level at a time, within a read-only dry-run inspection model.

- Runtime Dashboard answers: what would be active in the current dry-run runtime state.
- Runtime MOLT Map answers: what cognitive roles are active.
- Runtime IR Matrix answers: how runtime structures connect.
- Runtime Drill-Down Inspection answers: what is inside a selected runtime structure or known artifact.

In plain terms:
- dashboard = current dry-run state
- drill-down = inspect one part of that state

Drill-down inspection is a **structural read-only inspection layer**. It is not selection, not activation, not execution, and not hidden reasoning.

## Why this phase comes before active sleeve selection

Active Sleeve Selection asks:
- which sleeve should become selected?

Drill-Down Inspection asks:
- what is inside this sleeve, NeoStack, NeoBlock, MOLT block, or support surface?

Inspection is safer because it does not change selection logic.
It should come before active sleeve selection.

This matters because current RuntimeSpec often has:
- `active_sleeve: null`
- `active_neostacks: ["NS.UMG.LANGCHAIN_BRIDGE.v0.1"]`

The inspection layer must therefore work even when no sleeve exists.

## Position in the runtime stack

1. Resolver Registry
2. RuntimeSpecV0
3. Runtime Visibility Header
4. Runtime MOLT Map
5. Runtime IR Matrix
6. Runtime Dashboard
7. Runtime Drill-Down Inspection

Runtime Dashboard summarizes the dry-run runtime state.
Runtime Drill-Down Inspection inspects one selected surface or known artifact inside that state.

## Design scope for this gate

This pass defines:
- drill-down inspection purpose
- hierarchy model
- request/response shape
- one-level expansion rules
- provenance display rules
- support-doc display rules
- relation/link rules
- examples
- boundary rules

This pass may add:
- type-only scaffolding
- no-op design references

This pass does **not** implement:
- live drill-down execution
- active sleeve selection
- live sleeve activation
- tool execution
- MCP execution expansion
- LangChain execution expansion
- runtime mutation
- runtime reconfiguration
- draft writing
- approval bypass
- checkpoint/resume changes
- hidden chain-of-thought exposure

## What drill-down inspection should answer

The drill-down layer should answer questions like:
- what sleeve is selected?
- what NeoStacks are in this sleeve?
- what NeoBlocks are in this NeoStack?
- what MOLT blocks make this NeoBlock?
- what tools does this sleeve or NeoStack request?
- what support docs explain this artifact?
- what provenance does this artifact have?
- what matrix nodes reference this artifact?
- what MOLT Map fields reference this artifact?

It should expose structure, not reasoning.

Allowed:
- artifact hierarchy
- artifact metadata
- source/provenance
- runtime selection state
- support-only docs
- tool-binding intent
- governance references
- matrix links
- MOLT Map links

Not allowed:
- hidden model reasoning
- private scratchpad
- internal deliberation
- hidden system/developer instructions
- implied live activation
- implied execution

## Design principle: one-level expansion by default

Default behavior expands only one level.

Example:
- ask which NeoStacks are in a sleeve → show NeoStacks only
- ask which NeoBlocks are in a NeoStack → show NeoBlocks only
- ask which MOLT blocks are in a NeoBlock → show MOLT blocks only

Reason:
- avoid flooding the user with the whole hierarchy unless explicitly requested

The design may allow deeper depth values later, but the default contract should remain conservative.

## Inspection levels

### Level 0 — Runtime Selection Summary

Question:
- what is currently selected in the dry-run runtime?

Answer shape:
- RuntimeSpec runtime kind
- active sleeve
- active NeoStacks
- active NeoBlocks
- active MOLT blocks
- support artifacts
- governance summary
- trace id
- matrix id

### Level 1 — Sleeve Inspection

Question:
- what NeoStacks are in this sleeve?

Answer shape:
- sleeve id
- title
- description
- status
- provenance
- contained NeoStacks
- directly declared NeoBlocks if any
- directly declared MOLT blocks if any
- tool bindings
- support docs

### Level 2 — NeoStack Inspection

Question:
- what NeoBlocks are in this NeoStack?

Answer shape:
- NeoStack id
- title
- description
- status
- provenance
- contained NeoBlocks
- directly declared MOLT blocks
- tool bindings
- governance constraints
- support docs

### Level 3 — NeoBlock Inspection

Question:
- what MOLT blocks make this NeoBlock?

Answer shape:
- NeoBlock id
- title
- description
- status
- provenance
- MOLT block members
- MOLT role coverage
- support docs

### Level 4 — MOLT Block Inspection

Question:
- what is this MOLT block?

Answer shape:
- MOLT block id
- molt_type
- title
- description
- domains
- capabilities
- tags
- status
- provenance
- runtime_selectable
- support_only

### Level 5 — Tool Binding Inspection

Question:
- what tools does this artifact request?

Answer shape:
- requested
- available
- blocked
- requires_approval
- governing policy
- execution statement: `No tools executed.`

## Relationship to existing outputs

### Runtime Dashboard

Dashboard answers:
- what is the current dry-run runtime state?

Drill-down answers:
- what is inside one part of that runtime state?

### MOLT Map

MOLT Map answers:
- what cognitive roles are active?

Drill-down can answer:
- which artifact contributed to this MOLT field?

### IR Matrix

IR Matrix answers:
- how are runtime structures connected?

Drill-down can answer:
- which matrix nodes and edges reference this artifact?

## Hierarchy detection order

Containment and drill-down structure should be resolved conservatively in this order:

1. explicit artifact fields
   - `neostacks`
   - `neoblocks`
   - `molt_blocks`
   - `blocks`
   - `members`
   - `children`
   - `tools`
   - `tool_bindings`
2. manifest/index declared relations
3. RuntimeSpec selection arrays
   - `active_sleeve`
   - `active_neostacks`
   - `active_neoblocks`
   - `active_molt_blocks`
   - `support_artifacts`
4. IR Matrix edges
   - `contains`
   - `selects`
   - `references`
   - `requests_tool`
   - `maps_to_molt_field`
5. generated registry metadata
6. fallback
   - no children found
   - warning: `No declared child relations found.`

Hard rule:
- do not infer too aggressively
- do not fabricate child lists

## Boundary rules

1. Drill-down inspection is read-only.
2. Drill-down inspection does not execute tools.
3. Drill-down inspection does not activate sleeves.
4. Drill-down inspection does not select a new active sleeve.
5. Drill-down inspection does not mutate RuntimeSpec.
6. Drill-down inspection does not mutate MOLT Map.
7. Drill-down inspection does not mutate IR Matrix.
8. Drill-down inspection cannot make support docs runtime-selectable.
9. Drill-down inspection cannot bypass governance.
10. Drill-down inspection cannot expose hidden reasoning.
11. One-level expansion is default.
12. Unknown child relations must be reported as unknown, not fabricated.

## Anti-confusion language

Use wording like:
- selected in dry-run RuntimeSpec
- contained by declared metadata
- referenced by matrix
- support-only documentation
- tool-binding intent
- requires approval
- No tools executed.

Avoid wording like:
- actually running
- live active sleeve
- the model thought
- chain-of-thought
- executed relation
- tool ran
- real activation

## Future path

If this design gate passes, the next phase should be:
- Runtime Drill-Down Inspection — Read-Only Implementation

That later phase may add safe inspection commands or surfaces.
It should still not execute tools or perform active sleeve selection.
