# UMG Envoy Agent 0.3.0-alpha.6

UMG Envoy Agent 0.3.0-alpha.6 is an OpenClaw plugin with a dry-run working runtime preview path backed by the Alpha6 real block-library tool chain.

It is not a broad execution agent package. Alpha.6 is package-sync prep for the current local live runtime truth: real sleeve selection, bounded resolver flow, RuntimeSpecV0 dry-run compile, Active Stack projection, and response-envelope preview.

## Alpha.6 capability note

Alpha.6 now includes the working runtime preview path:
- sleeve graph drilldown
- sleeve selection
- bounded sleeve resolve
- bounded approved NeoBlock shallow load
- visible MOLT extraction
- MOLT Map composition
- RuntimeSpecV0 dry-run compile
- Active Stack projection
- response-envelope preview

Alpha.6 still preserves strict safety boundaries:
- dry-run / preview only
- no uncontrolled execution
- no trigger evaluation
- no external MOLT block file loading
- no full library scan
- no unbounded recursive traversal
- no UMG-Block-Library mutation
- no automatic response takeover
- direct_source remains disabled

## Live-capable tool surface

### Working runtime path tools

- `umg_envoy_block_library_sleeve_graph_drilldown`
- `umg_envoy_sleeve_select`
- `umg_envoy_sleeve_resolve`
- `umg_envoy_runtime_compile`
- `umg_envoy_runtime_preview`

### Real block-library tool chain

- `umg_envoy_block_library_status`
- `umg_envoy_block_library_manifest_index`
- `umg_envoy_block_library_manifest_entry_lookup`
- `umg_envoy_block_library_target_shallow_load_gate`
- `umg_envoy_block_library_target_shallow_load_single`
- `umg_envoy_block_library_target_shallow_summary_normalize`
- `umg_envoy_block_library_neoblock_inspect`
- `umg_envoy_block_library_moltblock_visible_extract`
- `umg_envoy_block_library_molt_map_fragment`
- `umg_envoy_block_library_molt_map_compose`
- `umg_envoy_block_library_response_envelope_fragment`
- `umg_envoy_block_library_active_stack_projection`
- `umg_envoy_block_library_sleeve_graph_index`

### Existing Alpha6 utility tools

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

## What Alpha.6 does

- inspects the real block-library through bounded approved lanes
- resolves a real sleeve into a bounded dry-run graph
- shallow-loads approved NeoBlocks within limits
- extracts visible MOLT fragments
- composes a full or partial MOLT Map
- compiles a dry-run RuntimeSpecV0
- renders Active Stack and response-envelope previews
- surfaces declared tool requests without executing them

## What Alpha.6 does not do

- broad execution
- trigger evaluation
- external MOLT block loading
- full-graph recursion
- public package auto-promotion to Alpha7
- mutation of the UMG-Block-Library

## Default posture

- allowRuntimeWrites: false
- contentMode: bundled-public or configured packaged mode
- compilerMode: compiler-backed dry-run preview
- debug: false

## Install

- `openclaw plugins install clawhub:umg-envoy-agent@0.3.0-alpha.6`

## Build and test

- npm install
- npm run check
- npm run build
- npm run smoke
- npm run pack:dry

## Entrypoint

- `dist/plugin-entry.js`
