# UMG Envoy Agent

UMG Envoy Agent is a native OpenClaw tool plugin that bridges three layers of the current UMG ecosystem:

1. the **UMG revamp doctrine / synthesis layer**
2. the **canonical `umg-compiler`**
3. the **`UMG_Envoy_Resleever` runtime homebase**

Its purpose is to make UMG sleeves, blocks, NeoBlocks, NeoStacks, compilation, and runtime resleeving available as explicit OpenClaw tools rather than as scattered manual repository operations.

## Release status

**Version:** `0.1.0`  
**Release posture:** private RC / packaged workspace release

This package is past the sketch phase.

Current validated status:
- native OpenClaw plugin manifest present
- TypeScript build output present in `dist/`
- plugin install/load validated in local OpenClaw host flow
- tool surface registered successfully
- safe-order and mutation-side validation passes recorded
- bundled compiler + resleever assets included for portable first install

Primary validation report:
- `validation/STAGE5-VALIDATION-REPORT.md`

## What it does

The plugin exposes OpenClaw-facing tooling for:
- inspecting doctrine anchor information
- listing sleeves
- reading active runtime state
- comparing sleeves
- listing block libraries
- compiling sleeves with the canonical compiler
- validating compiled runtime output
- previewing promotion changes before mutation
- promoting runtime output into active state with backup creation
- listing and rolling back runtime backups
- scaffolding MOLT blocks, NeoBlocks, NeoStacks, Sleeves, and micro-agents

## Registered tool surface

Current registered tools:
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
- `umg_envoy_create_molt_block`
- `umg_envoy_create_neoblock`
- `umg_envoy_create_neostack`
- `umg_envoy_create_sleeve`
- `umg_envoy_validate_artifact`
- `umg_envoy_scaffold_micro_agent`

See also:
- `docs/TOOL-SURFACE.md`
- `docs/PUBLIC-SAFE-CAPABILITY.md`
- `vendor/UMG-Block-Library/HUMAN/MOLT-BLOCKS/INDEX.md`

Bundled public library additions in this pass:
- dedicated AIM library
- dedicated USE library
- dedicated NEED library
- matching HUMAN natural-language descriptions

## Included package contents

This release intentionally bundles the first working portable asset set:
- `dist/` compiled plugin runtime
- `docs/` install and operational docs
- `spec/ANALYTICAL_REPORT_ON_UMG_REVAMP_WORKSPACE.md` doctrine anchor
- vendored `umg-compiler` surfaces
- vendored `UMG_Envoy_Resleever` runtime surfaces relevant to sleeves, blocks, compiler/runtime state, and docs

See:
- `docs/BUNDLED-ASSETS.md`

## Install

### Option A - local path install in OpenClaw
Use the plugin folder directly:

- `C:\.openclaw\workspace\artifacts\umg-envoy-agent-plugin`

This was the validation install mode used during the Stage 5 pass.

### Package prerequisites
- Node.js `>=22`
- OpenClaw plugin runtime compatible with plugin API `1`

### Build
From the plugin root:

```bash
npm install
npm run build
```

If you are using the already-prepared packaged release, `dist/` is already included.

## Configuration

Config schema lives in:
- `openclaw.plugin.json`

Important fields:
- `workspaceRoot`
- `compilerRoot`
- `resleeverRoot`
- `allowRuntimeWrites`
- `defaultSleeveId`

### Recommended first config posture
For a cautious first install:
- leave override roots unset unless you specifically want live external repos
- keep `allowRuntimeWrites = false`

Enable runtime writes only when you intentionally want mutation-capable promotion / scaffold behavior.

## Runtime modes

### Bundled default mode
Uses bundled doctrine/compiler/resleever assets from inside the package.

Recommended when:
- you want a portable first install
- you want validation without relying on external repo checkouts

### External override mode
Use plugin config to point at newer or live working trees:
- `compilerRoot`
- `resleeverRoot`

Recommended when:
- you are actively developing against live repos
- bundled vendor state is no longer the desired source of truth

## Recommended smoke-test order

Suggested safe first-pass validation sequence:
1. `umg_envoy_status`
2. `umg_envoy_list_sleeves`
3. `umg_envoy_read_active_runtime`
4. `umg_envoy_list_block_libraries`
5. `umg_envoy_compile_sleeve`
6. `umg_envoy_validate_runtime_output`
7. `umg_envoy_preview_promotion`
8. only then enable runtime writes if you want promotion / generation tests

## Validation summary

Documented successful validation includes:
- plugin recognized by host
- plugin enabled and loaded
- full tool surface registered
- direct compile validation pass
- direct promotion validation pass with backup creation
- direct rollback validation pass
- generated artifact validation pass for stage-5 test artifacts

Primary evidence artifacts:
- `validation/STAGE5-VALIDATION-REPORT.md`
- `validation/host-plugin-inspect.json`
- `docs/install-inspect-after-restart.json`

## Release notes

This packaged release includes documentation and install-positioning for the first private RC line.

Highlights:
- plugin identity normalized as `umg-envoy-agent`
- runtime import/load defect fixed
- validation contract patched to match real compiler output shape
- promotion logic aligned to real compiled runtime payloads
- direct mutation bridge validation completed
- install docs and release notes added for handoff/package use

Detailed notes:
- `docs/RELEASE-NOTES-0.1.0.md`

## Known limits

This is a real working release candidate, not a fully polished public package.

Remaining caveats:
- package size/vendor pruning may still be worth a later cleanup pass
- mutation tools are intentionally gated behind config
- long-term SDK/runtime compatibility should still be checked against future OpenClaw plugin API movement

## Doctrine anchor

Primary unified-analysis source currently used to anchor the plugin design:
- `spec/ANALYTICAL_REPORT_ON_UMG_REVAMP_WORKSPACE.md`

## Runtime relationship

This plugin should not pretend to be the compiler itself.

Instead:
- the canonical compiler remains an embedded/vendor or externally overridden dependency
- the resleever remains the runtime/homebase layer
- the plugin exposes OpenClaw-facing tools that orchestrate those surfaces cleanly
