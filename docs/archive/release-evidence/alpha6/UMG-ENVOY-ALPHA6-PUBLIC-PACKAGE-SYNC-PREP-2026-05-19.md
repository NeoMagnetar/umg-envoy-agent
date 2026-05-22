# UMG Envoy Alpha6 — Public Package Sync Prep

Date: 2026-05-19

## Verdict

`ALPHA6_PUBLIC_PACKAGE_SYNC_PREP_READY`

## Baseline

- decision verdict: `RECOMMEND_ALPHA6_PUBLIC_PACKAGE_SYNC_FIRST`
- decision report: `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-PUBLIC-PACKAGE-SYNC-OR-ALPHA7-CUT-DECISION-2026-05-19.md`
- source commit: `04599e5a9cfe107cab1238871b2692e5e5fc5afe`
- live promotion commit: `d62cc31a25f273af4f6f3d6f658adce2f4dba991`
- live state: `ALPHA6_WORKING_RUNTIME_PATH_LIVE_READY`
- installed extension path: `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`

## Package Sync Reason

- local live Alpha6 includes the working runtime path
- public/package Alpha6 metadata was behind the local live truth
- package sync was recommended before Alpha7 to avoid split release states

## Metadata Review

### package.json

Status:
- updated to describe dry-run working runtime preview capability
- `main` confirmed as `dist/plugin-entry.js`
- OpenClaw extension metadata aligned to `dist/plugin-entry.js`
- `files` list aligned to package-ready surfaces
- removed stale public-only extension/runtime extension references

### openclaw.plugin.json

Status:
- updated entrypoint to `dist/plugin-entry.js`
- version remains `0.3.0-alpha.6`
- tool list updated to include:
  - `umg_envoy_block_library_sleeve_graph_drilldown`
  - `umg_envoy_sleeve_select`
  - `umg_envoy_sleeve_resolve`
  - `umg_envoy_runtime_compile`
  - `umg_envoy_runtime_preview`
- description updated to dry-run working runtime preview positioning

### README

Status:
- updated to reflect current Alpha6 truth
- now documents working runtime preview path
- now documents dry-run / execution boundary
- no overclaim of broad execution readiness

### Version recommendation

Recommendation:
- keep `0.3.0-alpha.6`

Reason:
- this lane prepares package/public state to match already-live local Alpha6 truth
- no new runtime feature was added in this prep lane
- a new version is not required unless publish policy demands a distinct public sync bump

## Staging

Staging path:
- `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.6`

Included:
- `package.json`
- `openclaw.plugin.json`
- `README.md`
- `dist/`
- `docs/`
- `public-content/`

Excluded:
- `node_modules/`
- `src/`
- `scripts/`
- `.git/`
- `UMG-Block-Library/`
- installed extension files
- stale `.tgz` files
- local workspace reports

Package root confirmation:
- `package.json` present at staging root
- `openclaw.plugin.json` present at staging root
- `dist/plugin-entry.js` present at staging root

Entrypoint confirmation:
- package-ready entrypoint = `dist/plugin-entry.js`

Stage cleanup note:
- removed stale staged copies of `plugin-entry-public.*`
- removed stale staged copies of `real-library-resolver.*`

## Validation

Passed:
- `npm run check`
- `npm run build`
- `node scripts/alpha6-real-block-library-response-envelope-fragment-smoke.mjs`
- `node scripts/alpha6-real-block-library-active-stack-projection-smoke.mjs`
- `node scripts/alpha6-real-block-library-response-envelope-active-stack-integration-smoke.mjs`
- `node scripts/alpha6-real-block-library-sleeve-graph-index-smoke.mjs`
- `node scripts/alpha6-response-envelope-active-stack-recursion-fix-smoke.mjs`
- `node scripts/alpha6-working-runtime-path-smoke.mjs`
- `npm pack --dry-run`

Dry package validation confirmed:
- package root contains `package.json`
- package includes `dist/plugin-entry.js`
- package includes `openclaw.plugin.json`
- package includes `README.md`
- package excludes `node_modules`
- package excludes `UMG-Block-Library`
- no missing package.json error

Optional local install verify:
- `LOCAL_INSTALL_VERIFY_FROM_STAGED_PACKAGE_NOT_PERFORMED`

## Runtime Tool Inclusion

Confirmed staged/package candidate includes:
- `umg_envoy_block_library_sleeve_graph_drilldown`
- `umg_envoy_sleeve_select`
- `umg_envoy_sleeve_resolve`
- `umg_envoy_runtime_compile`
- `umg_envoy_runtime_preview`

Confirmed staged/package candidate preserves prior Alpha6 real block-library tools:
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

## Safety Confirmations

Confirmed:
- no publish performed
- no ClawHub publish
- no npm publish
- no Alpha7 cut
- no UMG-Block-Library mutation
- no `.gitmodules` change
- no source feature expansion
- no trigger evaluation
- no uncontrolled execution

## Recommendation

Next lane:
`ALPHA6_PUBLIC_PACKAGE_SYNC_DRY_RUN_OR_LOCAL_INSTALL_VERIFY`
