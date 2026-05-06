# UMG Runtime IR Matrix Foundation

## Purpose

Runtime IR Matrix answers: how RuntimeSpec-selected artifacts relate structurally within a dry-run runtime projection.

- Resolver Registry answers: what exists, where it came from, whether it is canonical/generated/support-only, and whether it is runtime-selectable.
- RuntimeSpec answers: what would be selected for this task, what constraints apply, what tool bindings are requested, and what governance handoff exists.
- Runtime Visibility Header answers: how to summarize the dry-run runtime state.
- Runtime MOLT Map answers: what cognitive role layout is active.
- Runtime IR Matrix answers: how selected artifacts, constraints, governance surfaces, support-only artifacts, warnings, and trace references connect.

The Runtime IR Matrix is a **structural runtime projection**. It is not hidden reasoning and it is not execution.

## Position in the runtime stack

Document the stack explicitly:

1. Resolver Registry
2. RuntimeSpecV0
3. Runtime Visibility Header
4. Runtime MOLT Map
5. Runtime Dashboard
6. Runtime IR Matrix

RuntimeSpec provides selected artifacts.
MOLT Map provides cognitive role projection.
IR Matrix provides structural relation projection.

## Design scope for this gate

This pass defines:
- Runtime IR Matrix v0 contract
- node model
- edge model
- state model
- symbolic rendering design
- examples
- boundary rules
- dry-run semantics
- relationship to RuntimeSpec, MOLT Map, and dashboard outputs

This pass may add:
- type-only scaffolding
- no-op placeholder references if useful

This pass does **not** implement:
- live IR Matrix generation
- matrix rendering implementation
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

## What the IR Matrix represents

Runtime IR Matrix v0 should answer:
- what runtime artifacts were selected?
- how are they connected?
- which artifacts are active within dry-run RuntimeSpec?
- which artifacts are unavailable, blocked, support-only, or warnings?
- which tool bindings are requested?
- which governance constraints apply?
- which trace and MOLT Map does this matrix correspond to?

The matrix is a runtime graph/debug projection, not model reasoning.

It should show:
- artifact relationships
- selection state
- containment
- route selection
- blocked edges
- governance constraints
- tool-binding intent
- support-only separation

It must not show:
- hidden chain-of-thought
- private scratchpad
- internal model deliberation
- hidden system/developer instructions

## Core semantic distinction

Two distinctions must remain explicit:

1. `selected` does not mean executed.
2. `active` means active within dry-run RuntimeSpec, not live execution.

The matrix may represent execution intent, approval need, blocked state, and governance constraints, but it may not imply that execution occurred.

## Matrix v0 object shape

```json
{
  "matrix_id": "matrix_...",
  "runtime_spec_id": "runtime_spec_...",
  "molt_map_id": "molt_map_...",
  "source": "RuntimeSpecV0",
  "mode": "dry_run",
  "created_at": "2026-05-05T00:00:00.000Z",
  "matrix_available": true,
  "nodes": [
    {
      "id": "runtime_spec_...",
      "kind": "runtime_spec",
      "label": "RuntimeSpec",
      "state": "active",
      "artifact_id": null,
      "metadata": {}
    },
    {
      "id": "NS.UMG.LANGCHAIN_BRIDGE.v0.1",
      "kind": "neostack",
      "label": "UMG LangChain Bridge",
      "state": "selected",
      "artifact_id": "NS.UMG.LANGCHAIN_BRIDGE.v0.1",
      "metadata": {
        "source_kind": "ai_machine",
        "discovery_method": "generated_index",
        "generated_from_lane": "ai_neostacks"
      }
    }
  ],
  "edges": [
    {
      "from": "runtime_spec_...",
      "to": "NS.UMG.LANGCHAIN_BRIDGE.v0.1",
      "relation": "selects",
      "state": "active",
      "reason": "Selected as matching NeoStack runtime."
    }
  ],
  "symbolic": "◆ runtime_spec_... ●\n → ▣ NS.UMG.LANGCHAIN_BRIDGE.v0.1 ●",
  "warnings": [],
  "trace_id": "trace_..."
}
```

## Structural composition rules

Runtime IR Matrix v0 should usually include:
- one `runtime_spec` root node
- zero or one `molt_map` reference node
- zero or one selected sleeve node
- zero or more selected neostack nodes
- zero or more selected neoblock nodes
- zero or more selected molt_block nodes
- zero or more tool binding nodes
- one or more governance/constraint nodes when relevant
- support artifact nodes only when attached as support-only context
- warning nodes when warnings exist
- trace event or trace reference nodes when trace projection is included
- placeholder nodes when runtime surfaces are intentionally unavailable in v0

## Provenance requirement

When a node represents a selected artifact, its metadata should preserve provenance fields when available:
- `source_kind`
- `discovery_method`
- `generated_from_lane`
- `path`

This keeps the matrix aligned with resolver truth rather than informal summaries.

## Structural interpretation goals

The matrix should make it easy to inspect:
- what was selected
- what was merely available
- what is blocked by policy
- what requires approval
- what exists only as support context
- what trace/warnings correspond to this runtime projection
- what remains a placeholder for later implementation

## Relationship to Runtime MOLT Map

MOLT Map answers:
- what cognitive roles are active?

IR Matrix answers:
- how selected artifacts and governance relations connect structurally.

The matrix should not replace MOLT Map. It should reference it.

Example mapping pattern:
- MOLT Map `Directive`
  - `maps_to_molt_field` edge
  - selected NeoStack node
- MOLT Map `Instruction`
  - `maps_to_molt_field` edge
  - governance or constraint nodes
- MOLT Map `Blueprint`
  - `maps_to_molt_field` edge
  - visibility or dashboard projection node

In v0, MOLT linkage is representational only.
It does not add execution rights, mutate RuntimeSpec, or expose hidden reasoning.

## Relationship to dashboard and visibility outputs

Runtime Dashboard is a combined read-only projection.
Runtime IR Matrix is a separate structural view.

The dashboard may later include matrix references, but matrix v0 should still be defined as its own output contract.

## Boundary rules

1. IR Matrix is a structural runtime projection.
2. IR Matrix is not hidden chain-of-thought.
3. IR Matrix does not execute anything.
4. IR Matrix does not activate sleeves.
5. IR Matrix does not mutate RuntimeSpec.
6. IR Matrix cannot make support docs runtime-selectable.
7. IR Matrix cannot bypass governance.
8. IR Matrix cannot bypass approval.
9. IR Matrix cannot change MCP or LangChain policy.
10. IR Matrix can only represent execution intent, approval need, and blocked state.
11. IR Matrix v0 remains dry-run only.

## Anti-confusion language

Use wording like:
- selected in dry-run RuntimeSpec
- requested tool binding
- requires approval
- blocked by governance
- support-only artifact
- matrix placeholder
- runtime structure projection

Avoid wording like:
- the agent thought
- chain of thought
- executed path
- live activated sleeve
- tool ran
- real MCP connection
- unbounded LangChain agent

## Examples included in this design pass

This design gate includes:
- LangChain NeoStack dry-run example
- assembled runtime / no sleeve example
- support artifact query example

## Future path

If this design gate passes, the next possible phase is:
- Runtime IR Matrix Foundation — Read-Only Dry-Run Implementation

That later phase may generate a matrix object from:
- `RuntimeSpecV0`
- `RuntimeMOLTMapV0`
- `RuntimeDashboardV0`

It would still not execute tools or activate sleeves.
