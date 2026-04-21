# Release Notes — UMG Envoy Agent 0.1.0

## Release posture
**Private RC / packaged handoff release**

This is the first packaged release of the UMG Envoy Agent plugin as a real native OpenClaw tool plugin rather than a planning scaffold.

## What shipped
- native OpenClaw plugin package identity: `umg-envoy-agent`
- compiled runtime in `dist/`
- manifest/config schema in `openclaw.plugin.json`
- bundled doctrine anchor
- bundled compiler surfaces
- bundled resleever runtime surfaces
- install and setup documentation
- validation artifacts from the Stage 5 install/load and runtime test pass

## Tool surface included
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

## Major validation results
Validated in local OpenClaw host flow:
- plugin recognized
- plugin enabled
- plugin loaded successfully
- full tool surface registered
- direct safe-order execution passed
- direct mutation-side execution passed
- promotion backup flow passed
- rollback flow passed
- generated artifact validation passed

Primary report:
- `validation/STAGE5-VALIDATION-REPORT.md`

## Important fixes included in this release

### Fixed: unresolved runtime import during plugin load
Problem:
- plugin failed to load due to unresolved `openclaw/plugin-sdk/plugin-entry`

Resolution:
- removed the problematic runtime dependency pattern
- exported the plugin entry object directly

### Fixed: package/plugin identity mismatch
Problem:
- package identity hints and manifest id were inconsistent

Resolution:
- normalized package identity to `umg-envoy-agent`

### Fixed: validation contract mismatch against real compiler output
Problem:
- plugin validation logic expected guessed output fields rather than the real compiler payload shape

Resolution:
- aligned validation to the actual top-level `runtime` and `trace` structure
- aligned promotion writes to the real compiled payload contract

### Fixed: mutation validation bridge lacked a direct runtime-write enable path
Problem:
- direct validation bridge needed an explicit mutation-enable route

Resolution:
- added explicit runtime-write bridge handling for validation-side mutation tests

## Recommended operator posture
For first install:
- use bundled defaults
- keep runtime writes disabled
- validate inspection and compile flows first

Only then:
- enable runtime writes if you want live promotion / rollback / generation testing

## Compiler-alignment follow-up pass
A post-RC alignment pass updated the plugin package and bundled compiler to match the newer trigger-gating runtime contract.

Included in this follow-up:
- vendored compiler synced from patched live `umg-compiler`
- trigger handled as stack gating / routing rather than as a core MOLT type
- `use`, `aim`, and `need` carried through runtime and prompt output
- plugin compile summaries now surface:
  - `matchedTriggerIds`
  - `activeStackIds`
  - `useIds`
  - `aimIds`
  - `needIds`
  - `gateTriggerIds`
- active runtime inspection now reports the newer gate/use/aim/need-aware runtime shape after promotion
- merge-output duplication quirk tightened in the compiler runtime build path

Validation completed in this pass:
- fresh compile through updated vendored compiler succeeded
- promotion through plugin runtime path succeeded with backup creation
- `read-active-runtime` confirmed new active runtime shape

## Known follow-up work
- optional package-size/vendor pruning pass
- optional public-release polish pass
- future compatibility check against any OpenClaw plugin SDK/runtime drift

## Bottom line
This release is a real working private RC, not a placeholder. The remaining work is release tightening and future polish, not core viability.
