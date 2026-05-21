# UMG Envoy Agent 0.3.0-alpha.9

UMG Envoy Agent 0.3.0-alpha.9 is an OpenClaw plugin with a real block-library-backed runtime path, Alpha8 bounded read-only orchestration, Alpha7 classified/gated approved read-only execution flow, and a refined active sleeve / IR matrix / envelope inspector.

It is not a broad execution agent package.

- `0.3.0-alpha.7` may be referenced historically as the public package baseline.
- `0.3.0-alpha.8` is the previous verified public release.
- `0.3.0-alpha.9` is the current package candidate for Alpha8 bounded read-only orchestration.

## alpha.9 capability note

alpha.9 includes the Alpha6 real block-library runtime path, Alpha7 controlled runtime flow additions, and the Alpha8 bounded read-only orchestration surface:
- runtime tool request classifier
- execution gate plan
- approval checkpoint create
- approval checkpoint resume
- approved allowlisted read-only execution
- end-to-end dry-run-to-approved-read-only execution chain
- active sleeve / IR Matrix / envelope inspector

alpha.9 preserves strict safety boundaries:
- approved only
- allowlisted only
- read-only only
- no broad autonomous execution
- no trigger evaluation as execution authority
- no external MOLT block file loading
- no full library scan
- no unbounded recursive traversal
- no UMG-Block-Library mutation
- no restart / publish / package execution
- no automatic response takeover
- direct_source remains disabled

## Live-capable tool surface

### Alpha6 / block-library runtime path tools

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
- `umg_envoy_block_library_sleeve_graph_drilldown`
- `umg_envoy_sleeve_select`
- `umg_envoy_sleeve_resolve`
- `umg_envoy_runtime_compile`
- `umg_envoy_runtime_preview`

### Alpha7/Alpha8 runtime control / visibility tools

- `umg_envoy_runtime_tool_request_classify`
- `umg_envoy_runtime_execution_gate_plan`
- `umg_envoy_runtime_approval_checkpoint_create`
- `umg_envoy_runtime_approval_checkpoint_resume`
- `umg_envoy_runtime_execute_approved_allowlisted`
- `umg_envoy_runtime_execution_chain_e2e_approved_read_only`
- `umg_envoy_runtime_active_sleeve_ir_matrix_envelope_inspect`
- `umg_envoy_runtime_bounded_read_only_orchestrate`

### Existing utility tools

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

## What alpha.9 does

- inspects the real block-library through bounded approved lanes
- resolves a real sleeve into a bounded dry-run graph
- shallow-loads approved NeoBlocks within limits
- extracts visible MOLT fragments
- composes a full or partial MOLT Map
- compiles a dry-run RuntimeSpecV0
- classifies declared tool requests without executing them
- creates execution gate plans and approval checkpoint projections
- can execute approved allowlisted read-only actions only
- renders Active Stack and response-envelope previews
- inspects active sleeve, NeoStacks, NeoBlocks, MOLT blocks, RuntimeSpec, IR Matrix, envelope preview, and execution gate state

## What alpha.9 does not do

- broad execution
- unapproved execution
- non-allowlisted execution
- write/mutate runtime actions through the Alpha7 chain
- trigger evaluation as independent execution authority
- external MOLT block loading
- full-graph recursion
- mutation of the UMG-Block-Library
- package / publish / restart execution

## Default posture

- allowRuntimeWrites: false
- contentMode: bundled-public or configured packaged mode
- compilerMode: compiler-backed dry-run preview
- debug: false

## Docs

- Quickstart: `docs/ALPHA8-QUICKSTART.md`
- Demo runtime flow: `docs/ALPHA8-DEMO-RUNTIME-FLOW.md`

## Alpha8 fast path

Recommended next development direction:
1. release hygiene and demo docs
2. bounded read-only orchestration surface
3. active sleeve session state design
4. richer sleeve graph support

This is roadmap guidance, not a claim that Alpha8 implementation is already complete.

## Install

- previous public release: `openclaw plugins install clawhub:umg-envoy-agent@0.3.0-alpha.8`
- current package candidate for prep: `umg-envoy-agent@0.3.0-alpha.9`

## Build and test

- npm install
- npm run check
- npm run build
- npm run smoke
- npm run pack:dry

## Entrypoint

- `dist/plugin-entry.js`
