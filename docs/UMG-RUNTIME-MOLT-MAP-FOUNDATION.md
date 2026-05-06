# UMG Runtime MOLT Map Foundation

## Purpose

RuntimeSpec answers: what runtime artifacts would be active for this task.

Runtime Visibility Header answers: how to summarize that active runtime state.

Runtime MOLT Map answers: what cognitive role layout would be active for that RuntimeSpec.

The MOLT Map is a **declarative runtime projection**. It is not hidden reasoning and it is not execution permission.

## Position in the stack

1. Cognitive Registry Plane
   - what exists
   - provenance
   - canonical/runtime-selectable/support-only distinctions
2. RuntimeSpec layer
   - what would be active for this task
3. Runtime Visibility Header
   - how to summarize active runtime state
4. Runtime MOLT Map
   - how the active cognitive role layout should be described
5. IR Matrix (later)
   - how artifacts are connected, routed, enabled, disabled, or blocked

MOLT Map comes before IR Matrix.

## Design scope for this gate

This pass defines:
- Runtime MOLT Map v0 contract
- derivation rules from RuntimeSpec and selected artifact metadata
- confidence/source labeling
- examples
- boundary rules

This pass does **not** implement:
- live map generation
- matrix generation
- matrix rendering
- execution
- activation
- runtime mutation

## What MOLT Map should answer

For a compiled RuntimeSpec, the MOLT Map should explain:
- Trigger
- Directive
- Instruction
- Subject
- Primary
- Philosophy
- Blueprint

For v0, every field must make uncertainty explicit.
If unknown, use:
- `n/a`
- or `derived_default`

## Core rule

Runtime MOLT Map must be derived from:
- RuntimeSpec
- selected artifact metadata
- governance/default policy

It must **not** expose hidden model reasoning.
