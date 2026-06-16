# UMG Envoy Alpha20E Versioned Package Live Validation

Date: 2026-06-16

Validation verdict:

`UMG_ENVOY_ALPHA20E_VERSIONED_PACKAGE_LIVE_VALIDATED_READY_TO_COMMIT`

Final closeout verdict:

`UMG_ENVOY_ALPHA20E_VERSIONED_PACKAGE_LIVE_VALIDATED_COMMITTED_AND_PUSHED`

## Scope

This was an operator-approved live install validation for the local version-prepped `0.3.0-alpha.20` package. It did not publish to ClawHub, begin Alpha21, add tools, change runtime behavior beyond version metadata, enable writes, execute generated sleeves, write generated sleeves, clean untracked diagnostics, or commit before validation passed.

## Repo

Repo path:

`C:\.openclaw\workspace\umg-envoy-agent-release-clean`

Branch:

`main`

Starting HEAD:

`2cec26e4cede54f4b883e294f2a05a1bc9afa58a`

Required baseline:

`2cec26e4cede54f4b883e294f2a05a1bc9afa58a`

Target version:

`0.3.0-alpha.20`

## Pre-Install State

Tracked dirty files before live install were the intended Alpha20D version-prep files:

```text
README.md
dist/compiler/compiler-smoke.js
dist/plugin-entry.js
openclaw.plugin.json
package-lock.json
package.json
src/compiler/compiler-smoke.ts
src/plugin-entry.ts
```

Pre-existing untracked diagnostics/reports were left untouched.

No tracked package-included unrelated dirty files were present.

## Version Surfaces Before / After

Before Alpha20D prep:

```text
package.json: 0.3.0-alpha.15
package-lock.json: 0.3.0-alpha.15
openclaw.plugin.json: 0.3.0-alpha.15
README current-version text: 0.3.0-alpha.15
src/plugin-entry.ts: 0.3.0-alpha.15
src/compiler/compiler-smoke.ts: 0.3.0-alpha.15
dist/plugin-entry.js: 0.3.0-alpha.15
dist/compiler/compiler-smoke.js: 0.3.0-alpha.15
installed extension: 0.3.0-alpha.15
```

After Alpha20D prep and Alpha20E live install:

```text
package.json: 0.3.0-alpha.20
package-lock.json root: 0.3.0-alpha.20
package-lock.json packages[""]: 0.3.0-alpha.20
openclaw.plugin.json: 0.3.0-alpha.20
README current-version text: 0.3.0-alpha.20
src/plugin-entry.ts: 0.3.0-alpha.20
src/compiler/compiler-smoke.ts: 0.3.0-alpha.20
dist/plugin-entry.js: 0.3.0-alpha.20
dist/compiler/compiler-smoke.js: 0.3.0-alpha.20
installed extension: 0.3.0-alpha.20
```

Historical Alpha15 docs and filenames were not renamed or rewritten as current-version docs. Remaining Alpha15 references in current-version scans are historical doc filenames, package-file inclusions, or historical README links.

## Installed Extension

Installed extension path:

`C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`

Backup path:

`C:\.openclaw\workspace\installed-extension-backups\umg-envoy-agent-before-alpha20e-20260616-075707`

Installed extension mutated:

`yes, operator approved`

## Manifest Tool Count

Expected manifest tool count:

`22`

Observed installed manifest tool count:

`22`

Observed installed version:

`0.3.0-alpha.20`

Observed installed tools:

```text
umg_envoy_status
umg_envoy_compiler_smoke_test
umg_envoy_list_sleeves
umg_envoy_load_sleeve
umg_envoy_list_block_libraries
umg_envoy_compile_sleeve
umg_envoy_explain_sleeve
umg_envoy_validate_runtime_output
umg_envoy_compare_sleeves
umg_envoy_parse_path
umg_envoy_validate_path
umg_envoy_render_path
umg_envoy_build_path
umg_envoy_matrix_status
umg_envoy_cognitive_registry_query
umg_envoy_plan_neostack
umg_envoy_compose_sleeve_dry_run
umg_envoy_validate_composed_sleeve_dry_run
umg_envoy_compile_ir_bridge
umg_envoy_emit_relation_matrix
umg_envoy_action_gate_runtime_report_view
umg_envoy_low_risk_direct_tool_run
```

Visible surface result:

- Alpha16 explain-sleeve surface: pass
- Alpha16 matrix preview surface: pass
- Alpha17 `umg_envoy_cognitive_registry_query`: pass
- Alpha17 `umg_envoy_plan_neostack`: pass
- Alpha18 `umg_envoy_compose_sleeve_dry_run`: pass
- Alpha19 `umg_envoy_validate_composed_sleeve_dry_run`: pass

## Commands Run

Pre-install checks:

```text
git rev-parse --show-toplevel
git branch --show-current
git rev-parse HEAD
git status --short --branch
git diff --name-only
node -e "<version surface and manifest inspection>"
rg -n "0\.3\.0-alpha\.20|0\.3\.0-alpha\.15" README.md package.json package-lock.json openclaw.plugin.json src/plugin-entry.ts src/compiler/compiler-smoke.ts dist/plugin-entry.js dist/compiler/compiler-smoke.js docs/TOOL-SURFACE.md
```

Source gates:

```text
npm run check
npm run build
npm pack --dry-run
node dist/compiler/cognitive-registry.test.js
node dist/compiler/sleeve-composer-dry-run.test.js
node dist/compiler/composed-sleeve-validator-dry-run.test.js
npm run test:tool-manifest-alignment
npm run test:tool-capability-registry
npm run test:tool-capability-registry-seed
npm run test:low-risk-direct-execution-adapter
npm run test:low-risk-direct-runtime-tool-surface
npm run test:low-risk-allowlisted-tool-flow
```

Live install and reload:

```text
openclaw plugins list
Copy-Item C:\Users\Magne\.openclaw\extensions\umg-envoy-agent C:\.openclaw\workspace\installed-extension-backups\umg-envoy-agent-before-alpha20e-20260616-075707 -Recurse -Force
npm pack --pack-destination %TEMP%\umg-envoy-alpha20e-pack
openclaw plugins install "%TEMP%\umg-envoy-alpha20e-pack\umg-envoy-agent-0.3.0-alpha.20.tgz" --force
openclaw gateway restart
openclaw gateway status
```

Live validation:

```text
node -e "<installed manifest inspection>"
openclaw umg-envoy -- status
openclaw umg-envoy -- --help
openclaw umg-envoy -- registry-query --kind molt
openclaw --log-level fatal umg-envoy -- registry-query --kind neoblock
openclaw --log-level fatal umg-envoy -- registry-query --kind neostack
node --input-type=module - "<installed-module shape inspection>"
node --input-type=module - "<installed-module Alpha16-19 smoke assertions>"
```

Note: `openclaw gateway restart` interrupted the active tool call while the Gateway restarted. After resume, `openclaw gateway status` reported runtime running, connectivity probe OK, and admin capability available. No native tool-call/result mismatch appeared.

## Source Gate Results

`npm run check`: pass.

```text
> umg-envoy-agent@0.3.0-alpha.20 check
> tsc --noEmit
```

`npm run build`: pass.

```text
> umg-envoy-agent@0.3.0-alpha.20 build
> tsc
```

`npm pack --dry-run`: pass.

```text
name: umg-envoy-agent
version: 0.3.0-alpha.20
filename: umg-envoy-agent-0.3.0-alpha.20.tgz
package size: 80.6 kB
unpacked size: 390.3 kB
shasum: 10712b68f2f16c67c56f70612f79d37620f0a3e4
total files: 96
```

`node dist/compiler/cognitive-registry.test.js`: pass.

```text
=== Cognitive Registry Tests Complete: 20 passed, 0 failed ===
```

`node dist/compiler/sleeve-composer-dry-run.test.js`: pass.

```text
=== Sleeve Composer Dry-Run Tests Complete: 14 passed, 0 failed ===
```

`node dist/compiler/composed-sleeve-validator-dry-run.test.js`: pass.

```text
=== Composed Sleeve Validator Dry-Run Tests Complete: 21 passed, 0 failed ===
```

Guard tests:

```text
Tool Manifest Alignment: 28 passed, 0 failed
Tool Capability Registry: 26 passed, 0 failed
Tool Capability Registry Seed: 20 passed, 0 failed
Low-Risk Direct Execution Adapter: 30 passed, 0 failed
Low-Risk Direct Runtime Tool Surface: 21 passed, 0 failed
Low-Risk Allowlisted Tool Flow: 16 passed, 0 failed
```

## Live Smoke Results

Installed live status:

```text
ok: true
version: 0.3.0-alpha.20
allowRuntimeWrites: false
supportedTools: 22 entries
```

Alpha17 registry-query:

```text
molt: ok=true, counts molt=8 neoblock=4 neostack=3, errors=[]
neoblock: ok=true, counts molt=8 neoblock=4 neostack=3, errors=[]
neostack: ok=true, counts molt=8 neoblock=4 neostack=3, errors=[]
```

Alpha17 plan-neostack:

```text
sleeve explanation intent -> NS.SLEEVE_EXPLAINER, non_executing=true, allows_writes=false
code generation intent -> NS.PUBLIC_CODER_RUNTIME, non_executing=true, allows_writes=false
public post/generation intent -> NS.SAFE_GENERATION_PLANNER, non_executing=true, allows_writes=false
```

Alpha18 compose-sleeve:

```text
sleeve explanation intent -> NS.SLEEVE_EXPLAINER, non_executing=true, writes_enabled=false
code generation intent -> NS.PUBLIC_CODER_RUNTIME, non_executing=true, writes_enabled=false
public post/generation intent -> NS.SAFE_GENERATION_PLANNER, non_executing=true, writes_enabled=false
```

Alpha19 validate-composed-sleeve:

```text
sleeve explanation intent -> NS.SLEEVE_EXPLAINER, safety non_executing=true writes_enabled=false execution_allowed=false mutation_allowed=false publish_allowed=false
code generation intent -> NS.PUBLIC_CODER_RUNTIME, safety non_executing=true writes_enabled=false execution_allowed=false mutation_allowed=false publish_allowed=false
public post/generation intent -> NS.SAFE_GENERATION_PLANNER, safety non_executing=true writes_enabled=false execution_allowed=false mutation_allowed=false publish_allowed=false
unsupported intent -> invalid_dry_run, fail-closed safety non_executing=true writes_enabled=false execution_allowed=false mutation_allowed=false publish_allowed=false
```

Alpha16 explain-sleeve and matrix preview:

```text
public-basic-envoy: ok=true
matrix_summary.available=true
matrix_summary.non_executing=true
runtime_spec_boundary.nonExecuting=true
```

Live smoke result: pass.

## Safety Confirmation

writes_enabled remains false: pass.

non_executing remains true where applicable: pass.

generated sleeves executed: no.

generated sleeves written: no.

ClawHub changed: no.

publication changed: no.

new tools added: no.

source behavior changed: no, except version metadata.

version changed in source: yes.

installed extension mutated: yes, operator approved.

commit performed at initial report time: no.

commit performed after validation: yes.

commit pushed: yes.

commit:

`861dfffdaed6b3cbdb8a6be951677e67adfee9ba`

## Warnings Observed

The OpenClaw CLI printed pre-existing unrelated warnings during plugin list/install/live command startup:

- shared SQLite plugin install metadata conflict for `umg-envoy-agent`
- `uo-server-code-plugin` compiled runtime output warning
- `openclaw-desktop-bridge` package export warning

These warnings did not prevent the UMG Envoy plugin from installing, loading, reporting `0.3.0-alpha.20`, exposing 22 tools, or passing live smoke validation.

## Commit Closeout

After live validation passed, only Alpha20D/Alpha20E version-prep and validation-report files were staged. Unrelated diagnostics and older untracked reports were left unstaged.

Commit command:

```text
git commit -m "chore: prepare Alpha20 release version metadata"
```

Commit result:

```text
[main 861dfff] chore: prepare Alpha20 release version metadata
10 files changed, 730 insertions(+), 14 deletions(-)
```

Push command:

```text
git push origin main
```

Push result:

```text
2cec26e..861dfff  main -> main
```

Post-push tracked status:

```text
main...origin/main
tracked files clean
pre-existing untracked diagnostics/reports remain untouched
```

## Final Verdict

`UMG_ENVOY_ALPHA20E_VERSIONED_PACKAGE_LIVE_VALIDATED_COMMITTED_AND_PUSHED`
