# UMG Approval / Checkpoint Contract Resume

## Status
Design gate only.

Resume is not continuation by assumption. Resume is continuation by exact-match proof.

## Resume Preconditions
A future resume path must require:
- a checkpoint identity
- exact-match RuntimeSpec linkage
- exact-match handoff linkage
- policy revalidation
- approval revalidation where approval is required

If those conditions are absent, resume is invalid.

## Resume Status Semantics
- `not_applicable`: nothing resumable exists
- `requires_checkpoint`: resumable flow conceptually exists, but checkpoint material is mandatory first
- `resume_ready_future_only`: reserved future state only
- `invalid`: mismatch, stale identity, or failed guard
- `expired`: time or policy freshness boundary failed

## Resume Guard
`ExecutionResumeReferenceV0.resume_guard` requires:
- `checkpoint_required: true`
- `approval_required: boolean`
- `exact_match_required: true`
- `policy_revalidation_required: true`

These rules intentionally force replay safety instead of trust-by-memory.

## Invalidation Rules
Future resume must be invalidated when any of the following change:
- RuntimeSpec content or ID
- tool plan content
- selected context content
- approval request content
- policy version
- blocked-tool classification
- tool provenance from runtime to support-only or unknown

Additional invalidators:
- approval expired
- checkpoint expired
- resume reference expired
- approval scope no longer matches requested action

## Resumable What / Non-Resumable What
Potentially resumable in a future phase:
- the exact governed handoff identity
- the exact approved request shape
- the exact dry-run snapshot hashes
- the exact visible approval summary

Not resumable from this phase:
- executed tool state
- partially-run steps
- side effects
- live sleeve activation state
- implicit user intent

## Boundary
This design does not create resume state and does not mutate resume state.

> No tools executed.
