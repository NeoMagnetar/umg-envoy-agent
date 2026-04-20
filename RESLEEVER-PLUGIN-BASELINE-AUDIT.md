# Resleever Plugin Baseline Audit

Generated: 2026-04-20
Plugin:
- `umg-envoy-agent`
- `C:\.openclaw\workspace\artifacts\umg-envoy-agent-plugin`

## Stage B2 objective
Understand what the canonical plugin currently does and what is broken before stabilization work.

## Baseline inventory

### Root structure
Present:
- `config/`
- `dist/`
- `docs/`
- `node_modules/`
- `spec/`
- `src/`
- `validation/`
- `vendor/`
- `openclaw.plugin.json`
- `package.json`
- `README.md`
- `tsconfig.json`

### Source layout
`src/` contains:
- `activation-runtime.ts`
- `authoring.ts`
- `blocks.ts`
- `compiler-smoke.ts`
- `fs-utils.ts`
- `index.ts`
- `models.ts`
- `openclaw-plugin-sdk.d.ts`
- `paths.ts`
- `plugin-entry.ts`
- `resolver-rules.ts`
- `rollback.ts`
- `runtime.ts`
- `scaffold.ts`
- `trigger-hooks.ts`
- `types.ts`

### Distribution layout
`dist/` contains compiled JS/DTS for the source tree, including:
- `index.js`
- `plugin-entry.js`
- `runtime.js`
- `paths.js`
- `trigger-hooks.js`
- all expected support modules

### Vendor layout
`vendor/` contains:
- `UMG_Envoy_Resleever`
- `umg-compiler`

This matches the intended internal/plugin doctrine.

## Manifest baseline

### package.json
- name: `umg-envoy-agent`
- version: `0.1.0`
- main: `dist/index.js`
- OpenClaw extension entry: `./dist/index.js`
- packaged files explicitly include:
  - `vendor/UMG_Envoy_Resleever/docs`
  - `vendor/UMG_Envoy_Resleever/blocks`
  - `vendor/UMG_Envoy_Resleever/sleeves`
  - `vendor/UMG_Envoy_Resleever/compiler`
  - selected `vendor/umg-compiler/compiler-v0` outputs

### openclaw.plugin.json
- id: `umg-envoy-agent`
- name: `UMG Envoy Agent`
- config schema is internal-lane appropriate
- `resleeverRoot` wording explicitly references a real `UMG_Envoy_Resleever` checkout

## Entrypoint / identity baseline

### Plugin identity
In `src/plugin-entry.ts`:
- plugin id is `umg-envoy-agent`
- this matches the manifest/package identity

### CLI identity
In `src/plugin-entry.ts`:
- CLI root is `umg-envoy`

### Hook identity
In `src/plugin-entry.ts`:
- registers `umg-experimental-before-prompt-build-triggers`
- registers `umg-experimental-message-sending-exact-response`

### Tool identity
In `src/plugin-entry.ts` the plugin registers the internal tool family:
- `umg_envoy_activation_trace`
- `umg_envoy_compiler_smoke_test`
- `umg_envoy_status`
- `umg_envoy_list_sleeves`
- `umg_envoy_read_active_runtime`
- `umg_envoy_compare_sleeves`
- `umg_envoy_list_block_libraries`
- `umg_envoy_compile_sleeve`
- `umg_envoy_validate_runtime_output`
- `umg_envoy_preview_promotion`
- `umg_envoy_promote_runtime`
- `umg_envoy_list_runtime_backups`
- `umg_envoy_rollback_runtime`
- authoring/scaffold tools

## Runtime path doctrine baseline

In `src/paths.ts`:
- internal plugin resolves `resleeverRoot` to:
  - `vendor/UMG_Envoy_Resleever`
- there is no `UMG-Block-Library` default in the internal plugin path resolver

Conclusion:
- the internal plugin is already path-doctrine clean and Resleever-oriented

## Build / type-check baseline

Commands run:
- `npm run check`
- `npm run build`

Results:
- PASS
- TypeScript check succeeds
- build succeeds

## Runtime status baseline

OpenClaw inspection reports:
- plugin id: `umg-envoy-agent`
- format: `openclaw`
- source: `C:\.openclaw\workspace\artifacts\umg-envoy-agent-plugin\dist\index.js`
- status: `disabled`
- reason: `disabled in config`

## Current known limitations / starting-point issues

### 1. Plugin is currently disabled
This means runtime validation for the canonical plugin has not yet been re-run in this stabilization phase.

### 2. CLI/hook/tool names intentionally overlap with the public derivative
This is acceptable only because the public derivative is no longer being treated as the canonical lane.

### 3. Experimental hook names remain in the internal plugin
This is not necessarily wrong, but should be reviewed in stabilization work to decide whether they remain intentionally experimental or should be renamed/cleaned.

### 4. Config fallback / effectiveConfig logic exists and should be validated during full runtime testing
The code structure mirrors the public sibling pattern closely enough that it must be exercised directly in the internal lane.

## Baseline conclusion

The canonical internal plugin currently appears structurally coherent:
- correct plugin identity
- correct Resleever path doctrine
- correct vendored content roots
- builds successfully
- source/install path are the same

The real starting point for stabilization is therefore:
- enable and validate the internal plugin directly
- test runtime surfaces against the actual Resleever lane
- fix any remaining runtime/config/mutation issues there, not in the public derivative
