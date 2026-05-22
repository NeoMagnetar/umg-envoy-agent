# UMG Envoy Alpha6 Manifest / Runtime Alignment

## Objective
Make alpha6 internally truthful by aligning the metadata and operator-facing docs with the runtime that is actually loaded by OpenClaw.

## Official Alpha6 Runtime Truth
- version: `0.3.0-alpha.6`
- entrypoint: `dist/plugin-entry.js`
- live source: `~\.openclaw\extensions\umg-envoy-agent\dist\plugin-entry.js`
- install source: `path`
- surface: compiler-backed

## Live Active Tool Surface
The actually loaded alpha6 runtime exposes 12 tools:
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

## Misalignment Found
Before this pass, the package was split across layers:

### Installed runtime truth
- `openclaw plugins info umg-envoy-agent` showed runtime loaded from `dist/plugin-entry.js`
- plugin loaded successfully
- health ok true
- doctor had no UMG stale/missing warnings

### Installed metadata drift
Installed `openclaw.plugin.json` and `package.json` still described the public-alpha6/public-entry shape:
- public-facing description text
- public tool family in manifest tool declarations
- package file list/smoke scripts pointing at `plugin-entry-public.js`
- README/operator text describing public-safe published artifact posture

### Source workspace drift
`C:\.openclaw\workspace\work\public-next\package` remained even more stale and still pointed at `dist/plugin-entry-public.js` in both manifest and package metadata.

## Alignment Action Taken
Narrow installed-package metadata repairs were applied to the live local extension only:
- `openclaw.plugin.json`
  - description updated to compiler-backed local alpha6 truth
  - tool list updated to the 12 active runtime tools
- `package.json`
  - description updated to compiler-backed local alpha6 truth
  - file list no longer advertises `dist/plugin-entry-public.js` as shipped runtime truth
- `README.md`
  - intro updated to say current alpha6 is a local compiler-backed recovery checkpoint, not a publish-ready public artifact

## What Was Intentionally Not Done
- no publish
- no ClawHub reinstall
- no alpha5 overwrite
- no broad workspace commit
- no block-library resolver work yet
- no attempt to make the source workspace package fully releasable

## Remaining Stale References
### Still present in source workspace package
`C:\.openclaw\workspace\work\public-next\package` still contains stale public-entry metadata and docs.
That source package is not yet aligned to the live runtime truth.

### Possibly still present in auxiliary docs/files
Public-variant documentation files in the installed extension may still describe the older public packaging story. They are now historical context, not authoritative runtime truth.

## Interpretation
Alpha6 should now be treated as:
- a local recovered working checkpoint
- compiler-backed
- path/sleeve/matrix oriented
- not the same thing as the verified public alpha5 baseline

## Baseline Boundary
- alpha5 public release remains the verified public-safe baseline
- alpha6 local runtime remains the working compiler-backed checkpoint
- do not conflate those two states in future agent work
