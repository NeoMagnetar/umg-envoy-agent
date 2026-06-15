# Governance Execution Contract — 0.3.0-alpha.15

## 1. Purpose

This document is the authoritative governance and execution-boundary contract for `umg-envoy-agent` `0.3.0-alpha.15`.

Its purpose is to make one rule unmistakable:

**ToolResult is the only artifact that may represent actual execution.**

Everything else in this package line must be read as planning, inspection, validation, projection, classification, gating, reporting, or readiness evidence unless and until an actual execution path emits `ToolResult`.

## 2. Contract Summary

Core rule:

- **ToolResult is the only artifact that may represent actual execution.**

Boundary rules:

- RuntimeSpec is not permission.
- Trace is not permission.
- Diagnostics are not permission.
- Validation is not permission.
- Preview is not execution.
- Dry-run is not execution.
- Approval is not execution.
- ActionGate is not execution.
- ToolCapabilityRegistry is not execution.
- Known capability is not authorized capability.
- Manifest-declared tool is not automatically authorized execution.

## 3. Artifact Authority Ladder

| Artifact | Meaning | Authority level | Can execute? | Can grant permission? | Notes |
|---|---|---|---|---|---|
| intent / sleeve / blocks | source intent and governed input artifacts | input | no | no | describes what is being carried or proposed |
| compiler resolution | artifact-resolution and transform step | preprocessing | no | no | may prepare or normalize inputs |
| RuntimeSpec | runtime-facing dry-run projection | projection | no | no | informs planning only |
| Trace | audit-style compilation/resolution record | audit | no | no | records what happened in projection/compilation context |
| diagnostics | warnings, validation notes, errors | validation | no | no | can block confidence, not create authority |
| IR / relation matrix views | structural or relation-oriented views | inspection | no | no | visibility artifacts, not execution |
| MOLT map / runtime display | explanatory or display surfaces | inspection | no | no | display does not create authority |
| ToolCapabilityRegistry classification | capability classification | governance metadata | no | no | says what a known tool is classified as |
| ActionGate decision | policy decision about whether a later action may proceed | governance decision | no | no | gating is not execution |
| execution adapter, if allowed | actual runtime path that can invoke a bounded tool | execution path | yes | no | only matters when a real adapter actually runs |
| ToolResult | execution audit artifact | execution truth | yes | no | only execution-truth artifact in this contract |

## 4. Non-Execution Artifacts

### RuntimeSpec

What it is:
- a runtime-facing dry-run projection for downstream execution planning

What it is not:
- not execution
- not permission
- not approval
- not proof that any tool ran

### Trace

What it is:
- an audit artifact recording compilation/resolution inputs, selections, suppressions, and outcomes

What it is not:
- not permission
- not execution
- not a substitute for `ToolResult`

### Diagnostics

What it is:
- warnings, validation notes, and errors

What it is not:
- not authority
- not approval
- not execution proof

### IR Matrix / Relation Matrix

What it is:
- structural and relation-oriented inspection/projection output

What it is not:
- not a command
- not permission
- not execution

### MOLT Map / Runtime Display

What it is:
- visibility and explanatory display surfaces for governed runtime-facing artifacts

What it is not:
- not authority
- not approval
- not execution

### Preview

What it is:
- a pre-execution planning surface required by some policy lanes

What it is not:
- not execution
- not approval
- not evidence that a tool was run

### Dry-run

What it is:
- a non-executing planning/projection surface for bounded future execution evaluation

What it is not:
- not execution
- not approval
- not permission

### Approval

What it is:
- a governance prerequisite that may be required before a later execution lane

What it is not:
- not execution
- not `ToolResult`
- not proof that the approved action actually ran

### ActionGate decision

What it is:
- a policy decision surface about whether a proposed action may proceed, be previewed, be dry-run, require approval, be denied, or be blocked

What it is not:
- not execution
- not permission by itself
- not proof of runtime side effects

### ToolCapabilityRegistry entry

What it is:
- a classification entry for a known tool capability

What it is not:
- not execution authority
- not approval
- not proof that a tool is publicly executable

## 5. Execution-Truth Artifact

`ToolResult` is the execution audit artifact.

Rules:
- `ToolResult` should only be emitted by an actual execution path.
- `ToolResult` must distinguish success, failure, blocked, denied, and non-execution states where applicable.
- Approval alone does not create `ToolResult`.
- ActionGate alone does not create `ToolResult`.
- Registry classification alone does not create `ToolResult`.

In `src/action-gate-types.ts`, `ToolResult.executionStatus` explicitly distinguishes:
- `not_executed`
- `preview_recorded`
- `dry_run_recorded`
- `executed_success`
- `executed_failure`
- `execution_blocked`
- `execution_denied`
- `execution_cancelled`
- `execution_error`

That separation is part of the contract. Blocked, denied, preview, and dry-run states must remain distinguishable from actual executed outcomes.

## 6. ActionGate Boundary

ActionGate decides whether a proposed action may proceed under policy.

ActionGate does **not** execute the action.

ActionGate does **not** prove the action ran.

ActionGate does **not** replace `ToolResult`.

Evidence from `src/action-gate-types.ts`:
- runtime report boundaries explicitly mark `inspectionOnly`, `notApproval`, `notExecution`, and `notPermission`
- `createProposedActionGate(...)` can produce policy states like `allow_direct`, `allow_after_approval`, `require_preview`, `require_dry_run`, `deny`, `block`, and `review_required`
- those are governance states, not execution outcomes

## 7. ToolCapabilityRegistry Boundary

ToolCapabilityRegistry classifies known capabilities.

Unknown tools are default-denied or review-required.

Known tools are not automatically authorized tools.

Capability existence is not execution permission.

Evidence from `src/action-gate-types.ts` and `src/tool-capability-registry-seed.ts`:
- the registry stores risk class, direct-execution eligibility, preview/dry-run/approval posture, audit requirements, and blocked surfaces
- `createBlockedUnknownToolGate(...)` blocks or review-requires unknown tools by default
- registry seed notes repeatedly describe conservative first-pass classification rather than broad execution authority

## 8. Low-Risk Direct Runner Boundary

The low-risk direct runner is narrow.

It is not arbitrary execution.

It only covers the explicitly allowlisted read-only path.

`umg_envoy_load_sleeve` is excluded from the low-risk direct runner.

Writes, deletes, external transmission, compiler bridge execution, and relation-matrix emission are not unrestricted low-risk direct operations.

Evidence from `src/low-risk-direct-execution-adapter.ts`:
- `LOW_RISK_DIRECT_TOOL_IDS` contains exactly six static tool ids
- non-listed tools are blocked with `tool_not_in_static_low_risk_direct_set`
- `umg_envoy_load_sleeve` is explicitly blocked with `load_sleeve_excluded`
- blocked risk classes include `dry_run_only`, `preview_only`, `approval_gated_write`, `destructive_or_sensitive`, and `external_transmission`
- successful direct execution emits `ToolResult`

## 9. Gated / Blocked Governance Surfaces

The following manifest-declared tools are governance-gated / config-constrained / policy-constrained surfaces rather than broad runtime powers:

- `umg_envoy_compile_ir_bridge`
- `umg_envoy_emit_relation_matrix`

Evidence from `src/tool-capability-registry-seed.ts`:
- both are seeded with `allowedRiskClass: "blocked"`
- both have `directExecutionAllowed: false`
- both carry notes explaining why first-pass policy keeps them blocked

These are manifest-declared surfaces, but they are not unrestricted execution authority.

## 10. Manifest Tool Surface Boundary

`openclaw.plugin.json` is the authoritative manifest-declared public tool surface for alpha.15.

OpenClaw host semantics support manifest allowlist behavior.

Source registration alone is not sufficient to make `umg_envoy_load_sleeve` part of the alpha.15 public manifest-declared surface.

Current alpha.15 meaning:
- manifest-declared public surface is defined by `openclaw.plugin.json`
- `umg_envoy_load_sleeve` is source-present
- `umg_envoy_load_sleeve` is manifest-absent
- `umg_envoy_load_sleeve` is excluded from the first low-risk direct runner
- `umg_envoy_load_sleeve` is not part of the current alpha.15 public manifest-declared surface

## 11. Public / Private Boundary

This package line is intended to expose bounded public runtime-facing inspection, projection, validation, report, and governed direct-runner surfaces.

It does **not** authorize:
- private adjacent repo content by default
- unrestricted file mutation
- unrestricted shell/process execution
- external transmission by default
- private NeoUO content

Public package documentation must not blur public bounded surfaces with private maintainer-only or adjacent-repo workflows.

## 12. What This Contract Does Not Prove

This contract does not prove live OpenClaw host CLI readiness.

This contract does not prove ClawHub/publication status.

This contract does not prove external MCP/Hermes integration.

This contract does not authorize private NeoUO content.

This contract does not enable unrestricted execution.

## 13. Validation Evidence

The `0.3.0-alpha.15` release-truth document records:
- package/manifest/README alignment
- `npm run check = tsc --noEmit`
- `npm run build = tsc`
- `npm pack --dry-run` passes
- governance tests: `119` assertions, `0` failures
- no `no-shadow` blocker in the public `umg-envoy-agent` repo

This contract does not rerun those checks. It consolidates their already-recorded meaning.

## 14. Release / Host Boundary

Release truth and host truth are separate boundaries.

For alpha.15:
- repo-scoped release truth is documented in `docs/RELEASE-TRUTH-0.3.0-alpha.15.md`
- capability-surface reconciliation is documented in `docs/CAPABILITY-SURFACE-RECONCILIATION-PLAN-0.3.0-alpha.15.md`
- load-sleeve surface classification is documented in `docs/LOAD-SLEEVE-SURFACE-DECISION-0.3.0-alpha.15.md`
- manifest-allowlist host semantics are documented in `docs/OPENCLAW-HOST-TOOL-VISIBILITY-SEMANTICS-LOAD-SLEEVE-0.3.0-alpha.15.md`

None of those documents should be read as a live host readiness claim.

## 15. Maintainer Rule

If a future maintainer has to ask whether an artifact represents execution, the default answer is **no** unless the artifact is `ToolResult` emitted by a real execution path.

Maintainer rule:
- do not describe RuntimeSpec, Trace, diagnostics, previews, dry-runs, ActionGate reports, registry entries, or manifest presence as execution
- do not collapse planning, approval, and execution into one claim
- do not treat known capability as authorized capability
- do not treat manifest declaration as automatic permission
- do not treat gated surfaces as unrestricted powers
- keep `ToolResult` as the sole execution-truth artifact
