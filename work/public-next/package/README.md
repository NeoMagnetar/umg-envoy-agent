# UMG Envoy Agent 0.3.0-alpha.12

UMG Envoy Agent 0.3.0-alpha.12 lets you run Universal Modular Generation as a modular cognitive architectural runtime inside OpenClaw, with sleeve-aware orchestration, active sleeve session state, runtime inspection, IR Matrix visibility, and approved read-only tool gating.

It is not a broad execution agent package.

- `0.3.0-alpha.7` may be referenced historically as the public package baseline.
- `0.3.0-alpha.8` is the previous verified public release.
- `0.3.0-alpha.9` is the previous verified public release.
- `0.3.0-alpha.10` is the previous verified public release.
- `0.3.0-alpha.11` is the previous public release.
- `0.3.0-alpha.12` is the current clean native graph fixture/runtime integration package.

## alpha.12 capability summary

alpha.12 includes:
- bounded read-only orchestration
- active sleeve session state
- sleeve graph richness
- native route provenance cleanup
- clean native graph fixture/runtime integration
- native graph schema/types/adapter
- runtimeCodeIdentity diagnostics
- nativeFixtureResolution diagnostics
- packaged `fixtures/native-sleeves`
- packaged `schemas`

It also preserves the broader Alpha6/Alpha7/Alpha8 runtime surfaces, including:
- runtime tool request classifier
- execution gate plan
- approval checkpoint create/resume
- approved allowlisted read-only execution
- end-to-end approved read-only execution chain
- active sleeve / IR Matrix / envelope inspector

## alpha.12 proof caveat

Direct custom live graph probe was not callable from the chat harness during final alpha.12 proof.

Accepted proof chain:
- artifact verification
- local install verification
- runtime identity proof
- installed fixture/schema presence
- installed runtime smoke result

## alpha.12 safety posture

alpha.12 preserves strict safety boundaries:
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

### Alpha7/Alpha8/Alpha10+ runtime control / visibility tools

- `umg_envoy_runtime_tool_request_classify`
- `umg_envoy_runtime_execution_gate_plan`
- `umg_envoy_runtime_approval_checkpoint_create`
- `umg_envoy_runtime_approval_checkpoint_resume`
- `umg_envoy_runtime_execute_approved_allowlisted`
- `umg_envoy_runtime_execution_chain_e2e_approved_read_only`
- `umg_envoy_runtime_active_sleeve_ir_matrix_envelope_inspect`
- `umg_envoy_runtime_bounded_read_only_orchestrate`
- `umg_envoy_sleeve_session_select`
- `umg_envoy_sleeve_session_current`
- `umg_envoy_sleeve_session_clear`
- `umg_envoy_sleeve_session_inspect`
- `umg_envoy_runtime_sleeve_graph_richness_inspect`

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

## What alpha.12 does

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
- selects and remembers an explicit active sleeve for the session
- reports current active sleeve session state
- clears active sleeve session state without hidden fallback
- inspects active sleeve, NeoStacks, NeoBlocks, MOLT blocks, RuntimeSpec, IR Matrix, envelope preview, and execution gate state

## What alpha.12 does not do

- broad execution
- unapproved execution
- non-allowlisted execution
- write/mutate runtime actions through the Alpha7 chain
- trigger evaluation as independent execution authority
- external MOLT block loading
- full-graph recursion
- mutation of the UMG-Block-Library
- package / publish / restart execution

## Known stabilization notes

- `validate:alpha-current` exists but requires dependencies/bootstrap before `npm run check` can pass in a clean worktree.
- current failure mode: `tsc` missing.
- no tracked `node_modules`.
- legacy tracked publish-stage/artifact debt remains and should be cleaned in a dedicated repo hygiene lane.

## Default posture

- allowRuntimeWrites: false
- contentMode: bundled-public or configured packaged mode
- compilerMode: compiler-backed dry-run preview
- debug: false

## Docs

- Quickstart: `docs/ALPHA8-QUICKSTART.md`
- Demo runtime flow: `docs/ALPHA8-DEMO-RUNTIME-FLOW.md`
- Public alpha.12 notes: `docs/ALPHA12-PUBLIC-STATUS.md`
- Release ledger: `../RELEASE_LEDGER.md`

## Install

- current public release: `openclaw plugins install clawhub:umg-envoy-agent@0.3.0-alpha.12`
- current source/package target: `umg-envoy-agent@0.3.0-alpha.12`

## Build and test

- `npm run validate:alpha-current`
- `npm run smoke`
- `npm run pack:dry`

## Entrypoint

- `dist/plugin-entry.js`
