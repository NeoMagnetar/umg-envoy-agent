# Alpha8 Demo Runtime Flow

## Demo 1 — Bounded read-only orchestration flow

Recommended tool:
- `umg_envoy_runtime_bounded_read_only_orchestrate`

Sequence:
- active sleeve inspection
- runtime preview / RuntimeSpec summary
- classify
- gate plan
- checkpoint create
- checkpoint resume `approve`
- execute approved `status_read`
- final orchestration report

This is the new Alpha8 fast-path surface built on top of the proven Alpha7 pieces.

## Demo 1b — Runtime E2E approved read-only flow

Sequence:
- runtime path
- classify
- gate plan
- checkpoint create
- checkpoint resume `approve`
- execute approved `status_read`
- result

This remains the corrected successful lower-level demo path.

## Demo 2 — Inspector flow

Sequence:
- sleeve
- resolved NeoBlocks
- visible MOLT fragments
- RuntimeSpec
- IR Matrix
- envelope preview
- execution gate state

Current tested sleeve:
- `neomagnetar-dynamic-persona-v1`
- `NeoStacks = 0` with explicit reason `sleeve_declares_no_neostacks`
- `NeoBlocks = 7`
- `MOLT source = sleeve_native`
- `RuntimeSpec source mode = sleeve_native_graph`
- `envelope = neoblock_fragment, READY`
- `overall completeness = rich_sleeve_native`

## Demo 3 — Blocked path example

Wrong input:
- `approvalDecision = approved`

Correct input:
- `approvalDecision = approve`

Why the wrong token fails:
- checkpoint allowed decisions are `approve`, `deny`, `edit`, `dry_run_only`
- `decision_not_allowed` occurs when the probe uses the wrong token

This was the exact cause of the earlier package-local-verify hold. It was a probe-shape mismatch, not a package defect.
