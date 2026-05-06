# UMG Active Sleeve Selection Governance

## Purpose

This document defines governance and safety boundaries for dry-run active sleeve selection.

Active sleeve selection is a policy-governed dry-run classification step.
It is not live sleeve activation and not tool execution.

## Core governance rule

A sleeve may only be selected in dry-run RuntimeSpec if:
- the sleeve is eligible
- the score/confidence is high
- governance is compatible
- no blocked artifact rule applies

If any of these conditions fail:
- keep `active_sleeve: null`
- warn honestly

## Disallowed selection classes

The conservative v0 policy must reject:
- support-only artifacts
- HUMAN docs
- README/guide content
- unknown fallback artifacts
- deprecated sleeves
- schema-only artifacts
- manifest-only reference entries without actual sleeve artifacts
- sleeves implying unsafe execution-mode expansion
- sleeves implying unapproved MCP or LangChain expansion

## Governance compatibility checks

A future implementation should verify that a candidate sleeve does not require:
- direct execution beyond current dry-run mode
- unapproved agent execution paths
- MCP execution expansion beyond metadata-only policy
- LangChain expansion beyond current governed dry-run policy
- approval bypass
- protected-rule violations

These checks are part of whether a sleeve can become `high` confidence.

## RuntimeSpec relationship

RuntimeSpec should eventually include or derive selection-related fields such as:
- `selection.active_sleeve`
- `selection.candidate_sleeves`
- `selection.selection_confidence`
- `selection.selection_policy`
- `selection.warnings`

These fields describe dry-run compiled output only.
They must not mutate live runtime state.

## Dashboard relationship

The dashboard must distinguish:
- dry-run selected sleeve
- candidate sleeve only
- no sleeve selected

Recommended wording:

### Selected sleeve
- `Selected Sleeve: sleeve.example.v1`
- `Runtime Mode: DRY_RUN`
- `Execution: No tools executed.`

### No sleeve selected
- `Selected Sleeve: none`
- `Reason: no matching sleeve met conservative v0 threshold`

### Candidate sleeve only
- `Candidate Sleeve: sleeve.example.v1`
- `Selection Confidence: medium`
- `Reason: candidate did not meet conservative v0 threshold`

## Drill-down relationship

Drill-down should eventually support inspection of:
- selected sleeves
- candidate sleeves
- sleeve provenance
- sleeve containment reasons
- non-selection reasons

If no sleeve is selected:
- the user may drill down into the active NeoStack instead

This design keeps inspection useful without forcing selection.

## IR Matrix relationship

The IR Matrix should eventually represent sleeve selection structurally.

### Selected sleeve

```text
◆ runtime_spec ●
 → ◆ sleeve.example.v1 ● selected
```

### Candidate not selected

```text
◆ runtime_spec ●
 → ◆ sleeve.example.v1 ○ candidate
 → ! candidate did not meet conservative threshold
```

### Support doc blocked

```text
📘 support_doc ~
 → ⊘ runtime_selection
 → ! support docs are not runtime-selectable
```

These are design relationships only in this gate.

## MOLT Map relationship

MOLT Map must not force sleeve selection.

Rule:
- MOLT Map reflects selected RuntimeSpec state
- it does not decide sleeve selection

If a sleeve is selected:
- sleeve metadata may help inform Directive, Instruction, Subject, Primary, Blueprint

If no sleeve is selected:
- existing NeoStack or assembled-runtime derivation remains valid

## Anti-confusion language

Use:
- dry-run selected sleeve
- candidate sleeve
- conservative threshold not met
- support docs are not runtime-selectable
- no declared containing sleeve found
- No tools executed.

Avoid:
- activated sleeve
- running sleeve
- executed sleeve
- live active sleeve
- hidden reasoning language

## Boundary rules

1. Active sleeve selection is dry-run selection only.
2. Active sleeve selection does not execute tools.
3. Active sleeve selection does not activate a sleeve live.
4. Active sleeve selection does not mutate runtime outside dry-run compiled output.
5. Active sleeve selection does not bypass governance.
6. Active sleeve selection does not bypass approval.
7. Active sleeve selection does not broaden MCP or LangChain execution.
8. Active sleeve selection cannot select support-only artifacts.
9. Active sleeve selection cannot select HUMAN docs.
10. Active sleeve selection cannot select unknown fallback artifacts.
11. Active sleeve selection cannot select deprecated sleeves unless later policy explicitly allows it.
12. Active sleeve selection must preserve `active_sleeve: null` when confidence is insufficient.
13. Active sleeve selection must warn instead of fabricating sleeve containment.
14. Active sleeve selection must never call support docs active sleeves.
15. Selected in dry-run does not mean executed.
