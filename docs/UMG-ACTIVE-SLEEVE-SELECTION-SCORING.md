# UMG Active Sleeve Selection Scoring

## Purpose

This document defines a conservative v0 scoring model for dry-run active sleeve selection.

The model is intentionally conservative.
It exists to prevent false sleeve claims, not to maximize selection frequency.

## Scoring philosophy

The system should not select a sleeve just because it loosely resembles the task.

A sleeve should only be selected when:
- eligibility is satisfied
- containment is explicit when needed
- governance is compatible
- task/capability fit is strong
- the resulting confidence band is high

## Positive factors

Examples of positive scoring factors:
- task text matches sleeve title/description
- domain match
- capability match
- tool-binding match
- selected NeoStack is explicitly contained by sleeve
- selected NeoBlock is explicitly contained by sleeve
- required MOLT roles are declared
- governance constraints are compatible
- output or Blueprint expectation matches
- sleeve status is active or promoted reference
- sleeve provenance is manifest/index/generated_index
- sleeve has clear tool-binding policy

## Negative factors

Examples of negative scoring factors:
- missing required tool bindings
- missing declared child relations
- weak title-only match
- support-doc confusion
- deprecated status
- non-canonical source
- unknown fallback source
- conflicting governance
- requires unsafe execution mode
- requires MCP/LangChain expansion not allowed by current governance

## Suggested v0 score bands

A future implementation may compute a numeric score, but the design gate only requires conservative semantics.

Suggested interpretation:
- very strong positive fit + no blocking negatives → `high`
- partial fit with unresolved structure or weak containment → `medium`
- weak fit or mostly title-only similarity → `low`
- ineligible or blocked → `none`

## Confidence band semantics

### high
- eligible for dry-run selection
- `runtime_kind` may become `sleeve_runtime`
- `active_sleeve` may be set

### medium
- sleeve may be listed in `candidate_sleeves`
- `active_sleeve` must remain `null`

### low
- sleeve should not be selected
- may appear in deeper debug/candidate explanation only if useful

### none
- not a viable sleeve candidate under conservative v0 policy

## Suggested scoring output shape

```ts
export type SleeveSelectionConfidence =
  | "high"
  | "medium"
  | "low"
  | "none";

export type SleeveSelectionPolicy =
  | "conservative_v0";

export interface SleeveSelectionCandidateV0 {
  sleeve_id: string;
  title?: string;
  description?: string;
  score: number;
  confidence: SleeveSelectionConfidence;
  selected: boolean;
  reasons: string[];
  warnings: string[];
  provenance: {
    source_kind?: string;
    discovery_method?: string;
    generated_from_lane?: string;
    path?: string;
  };
}
```

## Candidate reasoning outputs

Candidate reasons should be user-verifiable and structural.

Good reasons:
- explicit NeoStack containment matched selected NeoStack
- governance compatible with dry-run policy
- title/capability match to requested task
- runtime-selectable canonical sleeve

Good warnings:
- candidate sleeve found but conservative threshold was not met
- no declared containing sleeve found
- missing declared tool-binding compatibility
- support docs are not runtime-selectable

Bad reasons:
- the model felt this was right
- hidden chain-of-thought statements
- speculative containment claims

## Example 1 — No sleeve selected / NeoStack runtime

Input:
- Use the LangChain bridge for a governed workflow.

Expected:
- `runtime_kind: neostack_runtime`
- `active_sleeve: null`
- warning: `no matching sleeve found` or `no declared containing sleeve found`
- `No tools executed.`

## Example 2 — Strong sleeve match

Input:
- Use the Desktop Bridge file report sleeve to generate a dry-run file inventory.

Expected if such a sleeve truly exists and qualifies:
- `runtime_kind: sleeve_runtime`
- `active_sleeve: sleeve.desktop_bridge.file_report.v1`
- `selection_confidence: high`
- `No tools executed.`

## Example 3 — Candidate sleeve found but not selected

Input:
- Use file reporting tools.

Expected:
- `active_sleeve: null`
- `candidate_sleeves: [sleeve.file_report.v1]`
- `selection_confidence: medium`
- warning: `candidate sleeve found but conservative threshold was not met`

## Example 4 — Support doc confusion blocked

Input:
- Use the README sleeve guide.

Expected:
- `active_sleeve: null`
- blocked artifact warning for README or support doc
- `support docs are not runtime-selectable`

## Example 5 — Deprecated sleeve rejected

Input:
- Use the old file cleanup sleeve.

Expected:
- `active_sleeve: null`
- deprecated sleeve remains rejected by conservative v0 policy

## Hard rule

Only `high` confidence sleeves may become `active_sleeve`.
Everything else must preserve truthful dry-run non-selection.
