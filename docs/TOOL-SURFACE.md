# Tool Surface

Implemented public tools:
- umg_envoy_status
- umg_envoy_compiler_smoke_test
- umg_envoy_list_sleeves
- umg_envoy_list_block_libraries
- umg_envoy_compile_sleeve
- umg_envoy_validate_runtime_output
- umg_envoy_compare_sleeves
- umg_envoy_parse_path
- umg_envoy_validate_path
- umg_envoy_render_path
- umg_envoy_build_path
- umg_envoy_matrix_status
- umg_envoy_load_sleeve

Read-only Stage 7B addition:
- `umg_envoy_load_sleeve`
  - loads a sleeve JSON from an explicit path
  - performs deterministic structural validation
  - resolves referenced artifacts against an explicit library root
  - emits a canonical preparation preview only
  - does not invoke the compiler
  - does not emit runtime-spec, trace, diagnostics, or relation matrix outputs
  - Stage 8 compiler bridge remains deferred
