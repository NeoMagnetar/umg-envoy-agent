# Release Notes — UMG Envoy Agent 0.2.8

## Summary

UMG Envoy Agent 0.2.8 now presents a bounded runtime-facing capability story built around ActionGate-controlled execution eligibility, ToolCapabilityRegistry seed policy, ToolResult audit records, runtime report inspection, and a tightly scoped low-risk direct runtime runner.

This does **not** make Envoy a generic executor.

## Included capability state

Envoy now has:
- RuntimeSpecBoundary
- TraceBoundary
- ActionGate execution-control models
- conservative ToolCapabilityRegistry seed policy for known Envoy tools
- ToolResult audit record alignment
- ActionGate runtime report tool surface
- low-risk direct runtime runner:
  - `umg_envoy_low_risk_direct_tool_run`

## Low-risk direct runtime runner

The current direct runner is limited to exactly six static safe read-only tools:
- `umg_envoy_status`
- `umg_envoy_validate_runtime_output`
- `umg_envoy_parse_path`
- `umg_envoy_validate_path`
- `umg_envoy_render_path`
- `umg_envoy_action_gate_runtime_report_view`

Every successful direct run produces ToolResult audit output.

## Explicit exclusions

The current low-risk direct runtime runner does **not** include:
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
- ActionGate / ToolCapability / ToolResult / runtime report / low-risk direct test suites

Known validation caveat:
- `validate:umg:e2e` is still external-input-required unless `sleevePath` / `UMG_E2E_SLEEVE_PATH` is provided.
