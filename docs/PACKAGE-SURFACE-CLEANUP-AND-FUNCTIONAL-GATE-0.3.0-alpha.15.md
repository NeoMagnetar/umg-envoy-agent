# Package Surface Cleanup and Functional Gate — 0.3.0-alpha.15

## 1. Purpose

This lane performed one narrow package-surface cleanup for `umg-envoy-agent` `0.3.0-alpha.15` and then re-ran functional gates to prove the package still works.

Objectives:
- exclude confirmed package-surface junk from `npm pack --dry-run`
- keep intentional public docs and public UMG content intact
- prove type-check, build, pack, governance tests, and static UMG/tool evidence still hold

## 2. Package Surface Change

| Item | Before | After | Evidence |
|---|---|---|---|
| compiled dist test artifacts in pack output | present | absent | `docs/package_surface_before_cleanup_npm_pack_alpha15.log`, `docs/package_surface_before_cleanup_risk_hits_alpha15.txt`, `docs/package_surface_after_cleanup_npm_pack_alpha15.log` |
| diagnostic docs/log artifacts in pack output | present | absent | `docs/package_surface_before_cleanup_npm_pack_alpha15.log`, `docs/package_surface_before_cleanup_risk_hits_alpha15.txt`, `docs/package_surface_after_cleanup_npm_pack_alpha15.log` |
| intentional alpha.15 docs retained | yes | yes | `docs/package_surface_after_cleanup_npm_pack_alpha15.log` |

Summary of the package-surface change:
- replaced the broad `docs` package include with an explicit allowlist of intentional shipped docs
- added explicit negated `files` entries for `dist/**/*.test.js` and `dist/**/*.test.d.ts`
- did not touch source files, manifest, version, or public-content

## 3. Files Changed

| File | Change Type | Reason |
|---|---|---|
| `package.json` | edited | narrowed shipped package surface while preserving intended public files |
| `docs/PACKAGE-SURFACE-CLEANUP-AND-FUNCTIONAL-GATE-0.3.0-alpha.15.md` | created | required review report for this lane |

## 4. Functional Gates

| Gate | Command | Result | Notes |
|---|---|---|---|
| check | `npm run check` | pass | type-check passed after package-surface cleanup |
| build | `npm run build` | pass | build passed after package-surface cleanup |
| pack dry-run | `npm pack --dry-run` | pass | before cleanup package was 149 files / 93.9 kB; after cleanup package was 87 files / 66.3 kB |
| governance tests | declared package test scripts | pass | all declared governance/runtime/tool boundary tests passed |

Governance tests run exactly as declared in `package.json`:
- `npm run test:runtime-spec-boundary`
- `npm run test:trace-boundary`
- `npm run test:action-gate-types`
- `npm run test:tool-capability-registry`
- `npm run test:action-gate-preview-dry-run`
- `npm run test:low-risk-allowlisted-tool-flow`
- `npm run test:approval-gated-write-tool-flow`
- `npm run test:tool-result-audit-record`
- `npm run test:action-gate-runtime-report-surface`
- `npm run test:action-gate-runtime-report-tool-surface`
- `npm run test:tool-capability-registry-seed`
- `npm run test:tool-manifest-alignment`
- `npm run test:low-risk-direct-execution-adapter`
- `npm run test:low-risk-direct-runtime-tool-surface`

All passed.

## 5. UMG / Tool / Block System Evidence

| System | Evidence | Status |
|---|---|---|
| public content | `public-content/blocks/*.json`, `public-content/examples/*.json`, `public-content/runtimes/README.md`, `public-content/sleeves/*.json`; captured in `docs/functional_gate_umg_content_inventory_alpha15.txt` | present |
| sleeves | `public-content/sleeves/public-basic-envoy.sleeve.json`, `public-content/sleeves/public-coder-envoy.sleeve.json` | present |
| block libraries | `public-content/blocks/*.sample.block.json`; manifest tool extraction still includes `umg_envoy_list_block_libraries` | present |
| compiler / RuntimeSpec | compiler files remain in `src/compiler/*` and runtime-spec test/build paths passed; references captured in `docs/functional_gate_umg_content_inventory_alpha15.txt` | present |
| Trace / diagnostics | trace-boundary tests passed; public example/runtime docs remain present | present |
| ActionGate | `src/action-gate-*` files remain present; ActionGate tests passed | present |
| ToolCapabilityRegistry | `src/tool-capability-registry*` files remain present; registry tests passed | present |
| ToolResult | `src/tool-result-audit-record.test.ts` and compiled runtime tests passed | present |
| manifest tools | extracted successfully to `docs/functional_gate_manifest_tools_alpha15.txt`; 16 manifest-declared tool ids printed successfully | present |

Manifest-declared tools extracted successfully:
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
- `umg_envoy_compile_ir_bridge`
- `umg_envoy_emit_relation_matrix`
- `umg_envoy_action_gate_runtime_report_view`
- `umg_envoy_low_risk_direct_tool_run`

## 6. Boundaries Preserved

Confirmed:
- no source functionality removed
- no UMG public content removed
- no manifest change
- no version change
- no publication change
- no live OpenClaw host validation run
- no ClawHub publication claim made
- no staging performed
- no commit performed

Notes:
- `package.json` changed only to narrow shipped package contents
- `.publish-diagnostics-*` remained untouched and unshipped

## 7. Remaining Issues

Non-blocking remaining issues:
- shipped docs still include some local-path-style references in intentional docs; this is a browse/polish issue, not a functional blocker
- current lane created local evidence artifacts under `docs/` for review, but they are no longer shipping because the package surface is now explicit
- broad `dist` still ships some small runtime `.js` placeholders like `dist/types.js`; this lane did not treat those as package-surface junk because they are not compiled test artifacts

## 8. Next Recommended Step

Run a final staging-readiness review, then proceed only if the operator wants an explicit staging/commit lane for the cleaned alpha.15 set.
