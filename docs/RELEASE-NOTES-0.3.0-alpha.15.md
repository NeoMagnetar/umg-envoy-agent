# Release Notes — UMG Envoy Agent 0.3.0-alpha.15 — bounded low-risk direct runtime runner

## Summary

UMG Envoy Agent 0.3.0-alpha.15 supersedes the alpha14 release candidate as the clean successor release candidate for the current public alpha line.

The bounded low-risk direct runtime runner remains unchanged in scope.

This does **not** make Envoy a generic executor.

## Successor note

- alpha15 supersedes the alpha14 release candidate
- alpha14 should not be treated as the completed public release tag
- alpha15 does not broaden capability scope relative to alpha14

## Included capability state

Envoy continues to provide:
- RuntimeSpecBoundary
- TraceBoundary
- ActionGate model for execution-control readiness
- conservative ToolCapabilityRegistry seed policy for known Envoy tools
- ToolResult audit records for bounded direct runtime execution
- ActionGate runtime report surface
- low-risk direct runtime runner:
  - `umg_envoy_low_risk_direct_tool_run`

## Low-risk direct runtime runner

The current direct runner remains limited to exactly six approved static safe read-only tools:
- `umg_envoy_status`
- `umg_envoy_validate_runtime_output`
- `umg_envoy_parse_path`
- `umg_envoy_validate_path`
- `umg_envoy_render_path`
- `umg_envoy_action_gate_runtime_report_view`

Every successful direct run produces ToolResult audit output.

## Explicit exclusions

The current low-risk direct runtime runner still does **not** include:
- `umg_envoy_load_sleeve`
- `umg_envoy_compile_ir_bridge`
- `umg_envoy_emit_relation_matrix`
- `umg_envoy_compile_sleeve`
- `umg_envoy_build_path`
- unknown tools
- arbitrary dispatch
- writes / deletes
- package or plugin mutation
- network / external transmission

## Boundary reminders

- RuntimeSpec is not execution authority.
- Trace is not permission.
- ActionGate and ToolCapabilityRegistry govern execution eligibility.
- Approval-gated writes are modeled but not enabled for runtime execution here.
- Bridge and emission paths are not part of direct execution here.
- External transmission is not enabled here.

## load_sleeve policy

`umg_envoy_load_sleeve` remains:
- registered in plugin code
- conservatively seeded as `read_only`
- internal-only / blocked-public under current manifest policy
- excluded from the first low-risk direct adapter set

Its long-term public/internal status remains deferred.

## Validation state

Passing validation includes:
- build
- check
- smoke
- RuntimeSpecBoundary and TraceBoundary validation suites
- ActionGate / ToolCapability / ToolResult / runtime report / low-risk direct test suites

Known validation caveat:
- `validate:umg:e2e` remains external-input-required unless `sleevePath` / `UMG_E2E_SLEEVE_PATH` is provided.
