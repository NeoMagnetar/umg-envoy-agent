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

Stage 8B bridge addition:
- `umg_envoy_compile_ir_bridge`
  - requires explicit compiler bridge opt-in
  - prepares canonical IR in an Envoy-local temp workspace
  - invokes the configured local compiler `compile-ir` path only
  - captures `runtime-spec.json`, `trace.json`, and `diagnostics.json`
  - does not emit relation matrix output
  - does not mutate UMG-Block-Library or the compiler repo

Stage 9B relation matrix addition:
- `umg_envoy_emit_relation_matrix`
  - runs after the compiler bridge
  - returns ASCII-safe doctrine-aligned relation matrix text by default
  - may write `relation-matrix.umg` only under Envoy-local temp output when explicitly enabled
  - uses response-only default and temp-only write policy
  - does not mutate UMG-Block-Library or the compiler repo
  - does not change compiler behavior
