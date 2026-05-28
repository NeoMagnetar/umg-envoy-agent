# Tool Surface

`openclaw.plugin.json` is the authoritative declared public tool surface for this package.

Public tool documentation should be read as a runtime-facing inspection, projection, and bounded demo surface. Staged, deferred, historical, or internal references are not declared public tools unless added to `openclaw.plugin.json` in a later version.

## 1. Current Manifest-Aligned Public Tool Surface

The following tool ids are the current declared public tool surface for this package:

- `umg_envoy_status`
- `umg_envoy_compiler_smoke_test`
- `umg_envoy_list_sleeves`
- `umg_envoy_list_block_libraries`
- `umg_envoy_compile_sleeve`
- `umg_envoy_validate_runtime_output`
- `umg_envoy_compare_sleeves`
- `umg_envoy_parse_path`
- `umg_envoy_validate_path`
- `umg_envoy_render_path`
- `umg_envoy_build_path`
- `umg_envoy_matrix_status`
- `umg_envoy_compile_ir_bridge`
- `umg_envoy_emit_relation_matrix`

## 2. Capability-Level Mapping

These are the capability-level public surfaces currently represented by the manifest-aligned tools above:

- runtime-facing status and bundled public surface visibility
- compiler smoke and runtime output validation surfaces
- bundled sleeve and bundled block-library listing surfaces
- bounded sleeve compilation and comparison surfaces
- path parse / validate / render / build utilities
- matrix status and explicit relation-matrix / IR bridge surfaces

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

## 4. Deprecated or Renamed Tool Names

These names look like earlier or alternate naming forms and should not be treated as the current declared public surface unless they appear in `openclaw.plugin.json`.

- `umg_envoy_runtime_spec_compile`
- `umg_envoy_trace_inspect`
- `umg_envoy_runtime_display`

## Notes

- README should remain capability-oriented.
- For exact declared public tool ids, consult `openclaw.plugin.json` and this file.
- Technical contract docs may describe artifact behavior or staged planning surfaces without implying a currently declared public tool id.
