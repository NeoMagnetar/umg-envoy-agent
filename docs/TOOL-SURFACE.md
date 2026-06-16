# Tool Surface

`openclaw.plugin.json` is the authoritative declared public tool surface for this package.

Public tool documentation should be read as a runtime-facing inspection, projection, and bounded demo surface. Staged, deferred, historical, or internal references are not declared public tools unless added to `openclaw.plugin.json` in a later version.

## 1. Current Manifest-Aligned Public Tool Surface

The following tool ids are the current declared public tool surface for this package:

- `umg_envoy_status`
- `umg_envoy_compiler_smoke_test`
- `umg_envoy_list_sleeves`
- `umg_envoy_load_sleeve`
- `umg_envoy_list_block_libraries`
- `umg_envoy_compile_sleeve`
- `umg_envoy_explain_sleeve`
- `umg_envoy_validate_runtime_output`
- `umg_envoy_compare_sleeves`
- `umg_envoy_parse_path`
- `umg_envoy_validate_path`
- `umg_envoy_render_path`
- `umg_envoy_build_path`
- `umg_envoy_matrix_status`
- `umg_envoy_cognitive_registry_query`
- `umg_envoy_plan_neostack`
- `umg_envoy_compose_sleeve_dry_run`
- `umg_envoy_validate_composed_sleeve_dry_run`
- `umg_envoy_compile_ir_bridge`
- `umg_envoy_emit_relation_matrix`
- `umg_envoy_action_gate_runtime_report_view`
- `umg_envoy_low_risk_direct_tool_run`

## 2. Capability-Level Mapping

These are the capability-level public surfaces currently represented by the manifest-aligned tools above:

- runtime-facing status and bundled public surface visibility
- compiler smoke and runtime output validation surfaces
- bundled sleeve and bundled block-library listing surfaces
- bounded sleeve compilation, explanation, and comparison surfaces
- path parse / validate / render / build utilities
- matrix status and explicit relation-matrix / IR bridge surfaces
- bundled public cognitive registry query, deterministic dry-run NeoStack planning, dry-run sleeve composition preview, and composed sleeve validation/audit surfaces

Boundary reminders:
- RuntimeSpec is not execution.
- Trace is not permission.
- Validation does not grant permission.
- Approval does not equal execution.
- Display does not create authority.
- Governance remains binding and inspectable.

## 3. Staged / Deferred / Historical Tool References

These names appear in prior docs or staged planning language, but they are **not** currently declared public tools in `openclaw.plugin.json`.

### Staged or Deferred
- `umg_envoy_library_status`
- `umg_envoy_library_search`
- `umg_envoy_runtime_spec_dry_run`
- `umg_envoy_runtime_visibility_header`
- `umg_envoy_runtime_molt_map`
- `umg_envoy_runtime_dashboard`
- `umg_envoy_runtime_ir_matrix`
- `umg_envoy_runtime_inspect`
- `umg_envoy_local_readonly_plan`
- `umg_envoy_local_readonly_scan`
- `umg_envoy_alpha_demo`
- `umg_envoy_sleeve_inspect`
- `umg_envoy_sleeve_demo`

### Runtime-Reconciled Read-Only Public Surface
- `umg_envoy_load_sleeve`
- `umg_envoy_explain_sleeve`
- `umg_envoy_cognitive_registry_query`
- `umg_envoy_plan_neostack`
- `umg_envoy_compose_sleeve_dry_run`
- `umg_envoy_validate_composed_sleeve_dry_run`

`umg_envoy_load_sleeve` is now part of the manifest-aligned declared public tool surface after runtime reconciliation in alpha.15. It remains a conservative read-only sleeve-loading and inspection surface, not arbitrary execution, and it is still excluded from the first low-risk direct adapter candidate set.

`umg_envoy_explain_sleeve` is a manifest-declared read-only explanation surface added in the alpha16 lane. It explains one bundled sleeve compilation by showing sleeve metadata, all block refs, enabled/disabled state, skipped reasons, active block order, authority-ordered prompt parts, tool requests, warnings/errors, the non-executing RuntimeSpec boundary, and a lightweight response-only sleeve relation preview. It does not execute tool requests, write outputs, invoke the external compiler bridge, or use the gated relation-matrix emitter.

`umg_envoy_cognitive_registry_query` is a manifest-declared read-only alpha17 registry surface for bundled public MOLT blocks, NeoBlocks, and NeoStacks. It loads only package-bundled public registry data and does not mutate sleeves, block libraries, runtime state, or local files.

`umg_envoy_plan_neostack` is a manifest-declared dry-run-only alpha17 planning surface. It uses deterministic tag scoring against the bundled public cognitive registry to select candidate NeoStacks, NeoBlocks, and MOLT blocks for an intent string. It does not use hidden LLM calls, generate saved sleeves, enable writes, or execute selected tool intents.

`umg_envoy_compose_sleeve_dry_run` is a manifest-declared dry-run-only alpha18 composition preview surface. It uses the alpha17 planner and bundled public registry to propose a deterministic sleeve outline with resolved NeoBlocks, resolved MOLT blocks, selection trace, composition trace, and non-executing/no-write boundary metadata. It does not execute generated sleeves, save sleeves, merge sleeves, mutate registry data, or write runtime artifacts.

`umg_envoy_validate_composed_sleeve_dry_run` is a manifest-declared dry-run-only alpha19 validation/audit surface. It uses the alpha18 composer output and bundled public registry to verify selected NeoStack resolution, proposed sleeve id, sleeve outline, resolved NeoBlocks, resolved MOLT blocks, selection/composition/validation traces, and explicit non-executing/no-write/no-mutation/no-publication safety boundaries. It does not execute, save, export, install, publish, or mutate composed sleeves.

## 4. Deprecated or Renamed Tool Names

These names look like earlier or alternate naming forms and should not be treated as the current declared public surface unless they appear in `openclaw.plugin.json`.

- `umg_envoy_runtime_spec_compile`
- `umg_envoy_trace_inspect`
- `umg_envoy_runtime_display`

## Registry and ActionGate Note

Envoy is intended to become tool-capable through explicit capability mapping, not through implicit execution authority.

- `ToolCapabilityRegistry` defines what Envoy knows how to do.
- Unknown tools are blocked or review-required by default.
- `ActionGate` decides whether a known capability may proceed.
- Preview and dry-run are pre-execution planning layers only.
- Preview and dry-run do not equal approval or execution.
- Low-risk direct does not mean unrestricted execution; it requires a known registry entry and explicit allowlist policy.
- Unknown tools, writes, deletes, publishing, plugin mutation, and external transmission are not low-risk direct.
- Approval-gated write flow is pre-execution only; approval is required for durable mutation and does not equal execution.
- Preview and dry-run do not equal execution.
- Destructive/sensitive and external-transmission flows remain separate lanes.
- `ToolResult` records actual execution later.
- `ToolResult` is not compiler Trace.
- Ready-for-future-execution does not equal execution.
- Blocked, denied, preview, and dry-run records must remain distinguishable from executed results.
- Runtime report surfaces ActionGate/ToolResult readiness but is not approval and is not execution.
- Runtime report tool surface is read-only and report-only.
- ToolCapabilityRegistry seed classifies known Envoy tools.
- Known tool does not equal authorized execution.
- Unknown tools remain blocked/review-required.
- First seed pass does not mark any tool as `low_risk_direct`.
- Blocked bridge/emission surfaces require later policy lanes.
- The first low-risk direct adapter runs only six static safe tools.
- `umg_envoy_low_risk_direct_tool_run` is the narrow runtime surface for that adapter.
- `umg_envoy_load_sleeve` is intentionally excluded from that first direct adapter set.
- `umg_envoy_explain_sleeve` is intentionally excluded from that first direct adapter set.
- `umg_envoy_cognitive_registry_query` is intentionally excluded from that first direct adapter set.
- `umg_envoy_plan_neostack` is intentionally excluded from that first direct adapter set.
- `umg_envoy_compose_sleeve_dry_run` is intentionally excluded from that first direct adapter set.
- `umg_envoy_validate_composed_sleeve_dry_run` is intentionally excluded from that first direct adapter set.
- Every direct run creates `ToolResult` audit output.
- Writes, deletes, publishing, bridge, relation-matrix, compiler bridge, load-sleeve, explain-sleeve, cognitive registry query, NeoStack planning, sleeve composition preview, composed sleeve validation, and external actions are not part of this adapter.
- Executed status only comes from `ToolResult.executionStatus`.
- The registry itself does not execute tools and does not authorize execution by itself.

## Notes

- README should remain capability-oriented.
- For exact declared public tool ids, consult `openclaw.plugin.json` and this file.
- Technical contract docs may describe artifact behavior or staged planning surfaces without implying a currently declared public tool id.
