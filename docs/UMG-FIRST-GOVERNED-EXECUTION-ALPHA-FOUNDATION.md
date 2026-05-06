# UMG First Governed Execution Alpha Foundation

## Status
Design gate only.

This document defines the smallest safe governed execution alpha that could eventually move beyond pure dry-run planning.

## Recommended First Alpha
Preferred target:
- `mcp.server_metadata`

Why this is preferred:
- already classified as `metadata_only`
- no file mutation semantics
- no delete semantics
- no publish semantics
- no broad agent execution semantics
- fits the existing RuntimeSpec -> Handoff -> Approval/Checkpoint -> Preflight chain

## Core Rule
The first alpha must stay narrow enough that governance remains credible.

That means the first alpha is not "some execution." It is one deliberately constrained class of execution:
- metadata-only capability inspection
- or, later and under stricter policy, harmless read-only local inspection

## Required Chain Before Any Future Alpha Execution
A later implementation must require:
1. RuntimeSpec exists
2. Tool binding exists
3. Governed handoff exists
4. Approval/checkpoint contract exists
5. Preflight validation passes
6. Tool is on explicit alpha allowlist
7. Tool is metadata-only or tightly-scoped read-only
8. Result payload policy is known
9. Trace records what happened
10. Dashboard says exactly what happened

## First Alpha Status
```ts
export type GovernedExecutionAlphaStatus =
 | "not_requested"
 | "eligible"
 | "preflight_required"
 | "preflight_failed"
 | "approval_required"
 | "blocked"
 | "ready_for_alpha_future_only"
 | "executed_future_alpha_only";
```

For this phase, `executed_future_alpha_only` is documentation-only.
No execution is implemented.

## Preferred Safety Posture
- prefer metadata over environment inspection
- prefer registry/status/capability summaries over arbitrary tool runs
- prefer allowlist over broad policy classes
- prefer explicit blocklist plus allowlist
- prefer exact-scope result policy before any execution path exists

## Design Artifacts In This Pass
This pass adds:
- design docs for alpha foundation, scope, preflight, results, trace, and forbidden scope
- type-only alpha scaffolding in `src/runtime-spec/governed-execution-alpha-types.ts`

This pass does not add a live alpha executor.

## Design Boundary
This phase does not execute tools.

> No tools executed in design gate.
