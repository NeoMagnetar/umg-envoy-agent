# UMG Active Sleeve Selection Policy

## Conservative v0 policy

Policy name:
- `conservative_v0`

Core rule:
- only high-confidence sleeves may become `active_sleeve`

If confidence is not high:
- keep `active_sleeve: null`
- return candidates and warnings when appropriate

## Sleeve eligibility rules

A sleeve can be considered only if all of the following are true:
- `kind = sleeve`
- `canonical = true`
- `runtime_selectable != false`
- `support_only != true`
- `status = active` or `promoted_reference`
- `discovery_method = manifest`, `index`, or `generated_index`
- `source_kind = ai_machine` or `package_lane`
- not deprecated
- not unknown fallback

A sleeve must be rejected if it is:
- HUMAN support doc
- README or guide
- support-only artifact
- `runtime_selectable = false`
- deprecated
- non-canonical unless explicitly package-approved by later policy
- unknown fallback artifact
- schema-only artifact
- manifest-only reference without actual sleeve artifact

Support docs can explain sleeves.
They cannot become sleeves.

## Confidence levels

### high
- eligible for dry-run selection
- may become `active_sleeve`

### medium
- may be listed as candidate sleeve only
- must not become `active_sleeve`

### low
- should not be selected
- may appear only in candidate explanation/debug contexts if useful

### none
- no viable sleeve result

## Threshold behavior

### Strong match

```json
{
  "runtime_kind": "sleeve_runtime",
  "active_sleeve": "sleeve_id",
  "selection_confidence": "high",
  "execution_mode": "dry_run",
  "execution_statement": "No tools executed."
}
```

### Medium match

```json
{
  "runtime_kind": "neostack_runtime",
  "active_sleeve": null,
  "candidate_sleeves": ["sleeve_id"],
  "selection_confidence": "medium",
  "warnings": ["candidate sleeve found but conservative threshold was not met"]
}
```

### No match

```json
{
  "runtime_kind": "neostack_runtime",
  "active_sleeve": null,
  "candidate_sleeves": [],
  "warnings": ["no matching sleeve found"]
}
```

### Support-doc confusion

```json
{
  "active_sleeve": null,
  "blocked_artifacts": ["README/support_doc"],
  "warnings": ["support docs are not runtime-selectable"]
}
```

## Containment policy

A selected NeoStack may be used to search for containing sleeves.

But containment must be explicit.
Acceptable containment evidence includes:
- declared sleeve child lists
- declared manifest/index relations
- normalized registry relation fields

Unacceptable containment evidence includes:
- filename similarity only
- path-neighbor guessing only
- title similarity only

If no explicit containing sleeve is declared:
- do not select one
- warn: `no declared containing sleeve found`

## Governance compatibility policy

Even an eligible sleeve must not be selected if:
- it requires unsafe execution mode beyond current dry-run policy
- it implies MCP expansion beyond current governance
- it implies LangChain execution expansion beyond current governance
- it conflicts with required approvals or protected rules

This policy preserves dry-run truthfulness over convenience.

## Candidate sleeve behavior

Candidate sleeves should be surfaced when:
- a sleeve is eligible enough to discuss
- but not strong enough to select

Candidate output should include:
- sleeve id
- title/description if available
- score
- confidence
- reasons
- warnings
- provenance summary

Required warning language:
- `candidate sleeve found but conservative threshold was not met`

## Dashboard wording rules

If selected:
- `Selected Sleeve: sleeve.example.v1`
- `Runtime Mode: DRY_RUN`
- `Execution: No tools executed.`

Do not use:
- `Running Sleeve:`
- `Live Sleeve:`
- `Executed Sleeve:`

If not selected:
- `Selected Sleeve: none`
- `Reason: no matching sleeve met conservative v0 threshold`

If candidate exists:
- `Candidate Sleeve: sleeve.example.v1`
- `Selection Confidence: medium`
- `Reason: candidate did not meet conservative v0 threshold`

## Drill-down relationship

Drill-down should eventually support:
- inspect selected sleeve
- inspect candidate sleeve
- inspect why candidate was not selected
- inspect contained NeoStacks
- inspect sleeve tool bindings
- inspect sleeve provenance

If no sleeve is selected:
- drill-down may inspect active NeoStack instead

Example:
- `Selected Sleeve: none`
- `Selected NeoStack: NS.UMG.LANGCHAIN_BRIDGE.v0.1`
- `Inspection target: NeoStack`

## Hard rule

Conservative v0 policy prefers honest null selection over a weak or inflated sleeve claim.
