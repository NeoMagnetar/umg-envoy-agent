# OpenClaw UMG Envoy Agent

OpenClaw UMG Envoy Agent is a native OpenClaw plugin for the canonical internal lane, but its long-term role is to be a **stable plugin/operator layer** rather than a hardcoded repo-dependent wrapper.

It currently bridges three layers of the UMG stack:

1. the doctrine / synthesis anchor
2. the canonical `umg-compiler`
3. a compatible content root for sleeves, blocks, and runtime state (today often `UMG_Envoy_Resleever`, but not required in principle)

Its purpose is to expose sleeves, blocks, compilation, runtime inspection, promotion, rollback, and related authoring utilities as explicit OpenClaw tools and CLI surfaces instead of scattered manual repo operations.

## Canonical role

This package is the **canonical internal plugin**.

## Design direction

The intended long-term model is:
- the plugin stays relatively stable
- content repos/libraries grow independently
- users may also maintain their own sleeves/blocks/neostacks/neoblocks without depending on the upstream repos at all

In other words:
- the plugin should use repos as rich default libraries/resources
- but it should not conceptually require the repos in order to exist as a useful system

- Plugin id: `openclaw-umg-envoy-agent`
- Canonical source-of-record:
  - `C:\.openclaw\workspace\artifacts\umg-envoy-agent-plugin`
- Default content root:
  - `vendor\UMG_Envoy_Resleever`

This plugin is **not** the public UMG Envoy Agent release package.
That public-facing package is a later derivative product and should not be treated as the design authority for this internal lane.

The underlying private runtime repo now also documents the twin-track split explicitly:
- private repo lane: `vendor\\UMG_Envoy_Resleever`
- public mirrored lane: `UMG-Block-Library`

## Current status

**Version:** `0.1.0`
**Posture:** private internal RC / workspace canonical lane

What is currently proven in the canonical internal lane:
- TypeScript check passes
- build passes
- plugin loads in OpenClaw
- CLI surface `umg-envoy` loads and works
- path resolution points at the real bundled Resleever lane
- read/list/compare flows work
- valid sample compilation works
- invalid sleeve compilation now fails with an honest compiler-facing error
- promotion works with backup creation
- rollback works

Primary current evidence:
- `C:\.openclaw\workspace\RESLEEVER-STAGE-B4-B5-B6-REPORT.md`
- `C:\.openclaw\workspace\RESLEEVER-TRUTH-AUDIT.md`
- `validation/` artifacts in this plugin folder

## What it does

The plugin exposes OpenClaw-facing tooling for:
- inspecting doctrine anchor / runtime path status
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
- `umg_envoy_create_molt_block`
- `umg_envoy_create_neoblock`
- `umg_envoy_create_neostack`
- `umg_envoy_create_sleeve`
- `umg_envoy_validate_artifact`
- `umg_envoy_scaffold_micro_agent`

CLI root:
- `umg-envoy`

See also:
- `docs/TOOL-SURFACE.md`
- `docs/PATH-SHORTHAND.md`
- `docs/UMG-PATH-SHORTHAND-v0.2-CONTRACT.md`
- `docs/PLANNER-INTEGRATION-STAGES.md`
- `docs/PATH-SHORTHAND-EXAMPLE.umgpath`

## Included package contents

This internal plugin intentionally bundles:
- `dist/` compiled plugin runtime
- `docs/` install and operational docs
- `spec/ANALYTICAL_REPORT_ON_UMG_REVAMP_WORKSPACE.md` doctrine anchor
- vendored `umg-compiler` surfaces
- vendored `UMG_Envoy_Resleever` runtime/content surfaces relevant to sleeves, blocks, compiler/runtime state, and docs

See:
- `docs/BUNDLED-ASSETS.md`

## Install / local working mode

Canonical working folder:
- `C:\.openclaw\workspace\artifacts\umg-envoy-agent-plugin`

This plugin is currently used directly from that folder as both:
- source-of-record
- installed artifact path in OpenClaw

### Prerequisites
- Node.js `>=22`
- OpenClaw plugin runtime compatible with plugin API `1`

### Build
From the plugin root:

```bash
npm install
npm run build
```

## Configuration

Config schema lives in:
- `openclaw.plugin.json`

Primary config fields:
- `workspaceRoot`
- `compilerRoot`
- `resleeverRoot`
- `allowRuntimeWrites`
- `defaultSleeveId`
- `debugDirectReplyBehavior`

### Recommended default posture
For cautious use:
- leave override roots unset unless you intentionally want live external repos
- treat mutation as opt-in

### Current write-gate status
As of the latest internal-lane validation:
- persisted `allowRuntimeWrites: true` is honored by mutation commands
- explicit CLI override `--allow-runtime-writes` remains available, but is no longer required when config is set correctly

So mutation support is functioning through both persisted config and explicit CLI override paths.

## Runtime modes

### Bundled internal mode
Uses bundled doctrine/compiler/resleever assets from inside the package.

Recommended when:
- you want the canonical internal working lane
- you want reproducible workspace testing

### External/library override mode
Use plugin config to point at external compatible content roots:
- `compilerRoot`
- `resleeverRoot`

Recommended when:
- you are actively developing against external repos
- bundled vendor state is not the desired source of truth

### User-owned standalone content mode
Use plugin config to point at a user-owned content workspace:
- `workspaceRoot`
- optionally `resleeverRoot`

Recommended when:
- a user wants to author their own sleeves/blocks/stacks without relying on the canonical repos
- the repos are being used mainly as reference libraries or community content sources
- the plugin should operate against user-curated local content instead of upstream repo defaults

## Recommended validation order

Suggested internal-lane validation sequence:
1. `openclaw umg-envoy status`
2. `openclaw umg-envoy list-sleeves`
3. `openclaw umg-envoy read-active-runtime`
4. `openclaw umg-envoy list-block-libraries`
5. `openclaw umg-envoy compare-sleeves --left <id> --right <id>`
6. `openclaw umg-envoy compile-sleeve --sleeve sample-basic-minimal`
7. `openclaw umg-envoy preview-promotion --path <compiled-runtime> --sleeve sample-basic-minimal`
8. `openclaw umg-envoy promote-runtime --allow-runtime-writes --path <compiled-runtime> --sleeve sample-basic-minimal`
9. `openclaw umg-envoy list-runtime-backups`
10. `openclaw umg-envoy rollback-runtime --allow-runtime-writes --backup <backup-dir>`

## What is honestly working now

Working in the canonical internal lane:
- plugin load
- status/path resolution
- sleeve listing
- active runtime reading
- block library listing
- sleeve comparison
- valid compile path
- preview path
- promotion with backup creation
- rollback

## Known caveats

### 1. Some authored sleeves may be historically invalid for compiler-v0
Example:
- `stage5-sleeve`

This now fails honestly with a compiler-facing error rather than a misleading runtime-validation error.

### 3. Experimental hooks remain experimental
The plugin still registers:
- `umg-experimental-before-prompt-build-triggers`
- `umg-experimental-message-sending-exact-response`

These are part of the internal lane and should be treated as experimental surfaces until later cleanup says otherwise.

## Validation references

Current high-value references:
- `C:\.openclaw\workspace\RESLEEVER-SOURCE-OF-RECORD-DECLARATION.md`
- `C:\.openclaw\workspace\RESLEEVER-PLUGIN-BASELINE-AUDIT.md`
- `C:\.openclaw\workspace\RESLEEVER-STAGE-B4-B5-B6-REPORT.md`
- `validation/host-plugin-inspect.json`
- `validation/01-status.txt`
- `validation/02-list-sleeves.txt`
- `validation/03-read-active-runtime.txt`
- `validation/04-list-block-libraries.txt`
- `validation/05-compare-sleeves.txt`
- `validation/06-compile-sleeve.txt`
- `validation/08-preview-promotion.txt`
- `validation/09-promote-runtime.txt`
- `validation/10-list-runtime-backups.txt`
- `validation/11-rollback-runtime.txt`

## Doctrine anchor

Primary unified-analysis source currently used to anchor the plugin design:
- `spec/ANALYTICAL_REPORT_ON_UMG_REVAMP_WORKSPACE.md`

## Runtime relationship

This plugin is not the compiler itself.

Instead:
- the canonical compiler remains an embedded/vendor or externally overridden dependency
- the resleever remains the runtime/homebase layer
- the plugin exposes OpenClaw-facing tools that orchestrate those surfaces for the internal Resleever lane
