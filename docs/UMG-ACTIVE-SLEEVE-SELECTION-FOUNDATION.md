# UMG Active Sleeve Selection Foundation

## Purpose

Active Sleeve Selection answers one narrow question:
- when is the RuntimeSpec compiler allowed to select a sleeve as the dry-run runtime container?

This design gate defines conservative dry-run selection policy only.
It does not implement automatic sleeve selection yet.

The purpose is to prevent weak, false, inflated, or support-doc-derived sleeve claims.

## Current system state

The runtime lane already supports:
- resolver registry
- RuntimeSpecV0 dry-run compilation
- Runtime Visibility Header
- Runtime MOLT Map
- Runtime IR Matrix
- Runtime Dashboard
- Runtime Drill-Down Inspection

These remain:
- read-only
- dry-run
- non-executing
- non-mutating
- no hidden reasoning
- no live sleeve activation

## Core question

The system should only say:
- `Selected Sleeve: sleeve.example.v1`

when resolver truth, metadata, scoring, provenance, containment, and governance rules justify that claim.

If that threshold is not met, the system must preserve:
- `active_sleeve: null`

## Three required states

### 1. No Sleeve Selected

```json
{
  "runtime_kind": "neostack_runtime",
  "active_sleeve": null,
  "active_neostacks": ["NS.UMG.LANGCHAIN_BRIDGE.v0.1"]
}
```

Meaning:
- no sleeve met the conservative v0 selection threshold
- current NeoStack or assembled-runtime behavior remains the honest result

### 2. Candidate Sleeve Found

```json
{
  "active_sleeve": null,
  "candidate_sleeves": ["sleeve.example.v1"],
  "selection_confidence": "medium"
}
```

Meaning:
- a possible sleeve was found
- it did not meet the threshold for dry-run selection

Required warning:
- `Candidate sleeve found, but conservative threshold was not met.`

### 3. Dry-Run Selected Sleeve

```json
{
  "runtime_kind": "sleeve_runtime",
  "active_sleeve": "sleeve.example.v1",
  "selection_confidence": "high"
}
```

Meaning:
- the sleeve was selected inside dry-run RuntimeSpec only
- no live activation occurred
- no tools executed

Required wording:
- `Dry-run selected sleeve`

Avoid:
- live active sleeve
- running sleeve
- executed sleeve
- activated sleeve

## Position in the runtime stack

1. Resolver Registry
2. RuntimeSpecV0 candidate classification
3. NeoStack / NeoBlock / MOLT selection
4. Active Sleeve Selection policy
5. Runtime Visibility Header
6. Runtime MOLT Map
7. Runtime IR Matrix
8. Runtime Dashboard
9. Runtime Drill-Down Inspection

The key design rule is:
- MOLT Map does not decide sleeve selection
- IR Matrix does not decide sleeve selection
- Dashboard does not decide sleeve selection
- Drill-down does not decide sleeve selection

Active Sleeve Selection is a conservative policy layer inside dry-run RuntimeSpec compilation.

## Relationship to NeoStack selection

The current system can already select a NeoStack like:
- `NS.UMG.LANGCHAIN_BRIDGE.v0.1`

A selected NeoStack may be used to search for containing sleeves.

But a containing sleeve becomes active only if:
- containment is explicitly declared
- the sleeve is canonical
- the sleeve is runtime-selectable
- the sleeve matches the task
- the sleeve governance is compatible
- the sleeve tool bindings are compatible
- the confidence threshold is high

If containment is not declared:
- `active_sleeve: null`
- warning: `no declared containing sleeve found`

Hard rule:
- do not infer sleeve containment from filenames alone

## MOLT Map relationship

MOLT Map reflects selected RuntimeSpec state.
It does not decide sleeve selection.

If a sleeve is selected, its metadata may inform:
- Directive
- Instruction
- Subject
- Primary
- Blueprint

If no sleeve is selected, existing NeoStack or assembled-runtime derivation remains valid.

## Future polish note

Current drill-down smoke output does not yet surface `generated_from_lane` for the LangChain artifact summary.

This is not a blocker for the active-sleeve design gate.
But it should be noted as useful future polish for:
- scoring explanation
- provenance display
- candidate sleeve justification output

## Boundary rules

1. Active sleeve selection is dry-run selection only.
2. Active sleeve selection does not execute tools.
3. Active sleeve selection does not activate a sleeve live.
4. Active sleeve selection does not mutate runtime outside compiled dry-run output.
5. Active sleeve selection does not bypass governance.
6. Active sleeve selection does not bypass approval.
7. Active sleeve selection does not broaden MCP or LangChain execution.
8. Active sleeve selection cannot select support-only artifacts.
9. Active sleeve selection cannot select HUMAN docs.
10. Active sleeve selection cannot select unknown fallback artifacts.
11. Active sleeve selection cannot select deprecated sleeves unless a later explicit policy allows it.
12. Active sleeve selection must preserve `active_sleeve: null` when confidence is insufficient.
13. Active sleeve selection must warn instead of fabricating sleeve containment.
14. Active sleeve selection must never call support docs active sleeves.
15. Selected in dry-run does not mean executed.

## Future path

If this design gate passes, the next phase should be:
- Active Sleeve Selection — Read-Only Dry-Run Implementation

That later phase may allow RuntimeSpec compilation to select sleeves under conservative v0 policy.
It should still remain:
- dry-run
- non-executing
- non-mutating
- non-activating
