# UMG Envoy Alpha20D Version Lineage Release-Prep

Date: 2026-06-16

Verdict:

`UMG_ENVOY_ALPHA20D_VERSION_LINEAGE_RELEASE_PREP_SOURCE_READY`

## Scope

This was a source/version-prep pass only. It did not publish to ClawHub, mutate the installed OpenClaw extension, add tools, begin Alpha21, change runtime behavior, enable writes, execute or write generated sleeves, clean untracked diagnostics, or commit changes.

## Repo

Repo path:

`C:\.openclaw\workspace\umg-envoy-agent-release-clean`

Branch:

`main`

Starting HEAD:

`2cec26e4cede54f4b883e294f2a05a1bc9afa58a`

Required baseline:

`2cec26e4cede54f4b883e294f2a05a1bc9afa58a`

Baseline result: pass.

Pre-edit tracked dirty state:

- `git diff --name-only`: no paths
- `git diff --cached --name-only`: no paths
- `git status --short --branch`: only pre-existing untracked diagnostics/reports

## Target Version

Target version:

`0.3.0-alpha.20`

Reason:

The committed repo contains post-Alpha19 capability work with a 22-tool manifest surface, while current package/plugin version lineage previously still reported `0.3.0-alpha.15`. Alpha20 is the consolidated release-prep checkpoint after Alpha20A/Alpha20B/Alpha20C hygiene and reconciliation work.

## Files Changed

Current release/version metadata changed:

- `package.json`
- `package-lock.json`
- `openclaw.plugin.json`
- `README.md`
- `src/plugin-entry.ts`
- `src/compiler/compiler-smoke.ts`
- `dist/plugin-entry.js`
- `dist/compiler/compiler-smoke.js`
- `docs/UMG-ENVOY-ALPHA20D-VERSION-LINEAGE-RELEASE-PREP.md`

The `dist` files changed only as generated build output from the source version metadata update.

## Version Surfaces

Before:

```text
package.json: 0.3.0-alpha.15
package-lock.json root: 0.3.0-alpha.15
package-lock.json packages[""]: 0.3.0-alpha.15
openclaw.plugin.json: 0.3.0-alpha.15
README current package version: 0.3.0-alpha.15
src/plugin-entry.ts status metadata: 0.3.0-alpha.15
src/compiler/compiler-smoke.ts smoke metadata: 0.3.0-alpha.15
dist/plugin-entry.js status metadata: 0.3.0-alpha.15
dist/compiler/compiler-smoke.js smoke metadata: 0.3.0-alpha.15
```

After:

```text
package.json: 0.3.0-alpha.20
package-lock.json root: 0.3.0-alpha.20
package-lock.json packages[""]: 0.3.0-alpha.20
openclaw.plugin.json: 0.3.0-alpha.20
README current package version: 0.3.0-alpha.20
src/plugin-entry.ts status metadata: 0.3.0-alpha.20
src/compiler/compiler-smoke.ts smoke metadata: 0.3.0-alpha.20
dist/plugin-entry.js status metadata: 0.3.0-alpha.20
dist/compiler/compiler-smoke.js smoke metadata: 0.3.0-alpha.20
```

Final version scan result:

- active package/plugin/source/dist version metadata now reports `0.3.0-alpha.20`
- remaining `0.3.0-alpha.15` references are historical Alpha15 document filenames, package-file inclusions for historical docs, or historical README links to Alpha15 governance/checkpoint records

## Historical Docs Left Unchanged

Historical Alpha15 documentation filenames and checkpoint facts were intentionally left unchanged. Package `files` entries still include historical Alpha15 docs by filename. Alpha16-19 reports were not rewritten.

README links to historical Alpha15 governance documents remain historical references, not current-version claims.

## Manifest Tool Count

Current manifest observed tool count:

`22`

Current manifest tools:

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

New tools added: no.

## ClawHub Read-Only Finding

Command:

```text
clawhub package inspect umg-envoy-agent
```

Result:

```text
Latest: 0.3.0-alpha.15
Source Repo: NeoMagnetar/umg-envoy-agent
Source Commit: b88341c77201014faf0d12671ffbb962d08a58d1
Source Ref: main
Tools: 16 listed by registry inspection
Scan: suspicious
```

ClawHub changed: no.

Publication changed: no.

## Installed Extension

Installed extension manifest inspected read-only:

```text
C:\Users\Magne\.openclaw\extensions\umg-envoy-agent\openclaw.plugin.json
version: 0.3.0-alpha.15
tool count: 22
```

Installed extension mutated: no.

## Commands Run

Pre-edit checks:

```text
git rev-parse --show-toplevel
git branch --show-current
git rev-parse HEAD
git status --short --branch
git diff --name-only
git diff --cached --name-only
node -e "<version and manifest inspection>"
rg -n "0\.3\.0-alpha\.15|alpha\.15|alpha15|Alpha15|ALPHA15|0\.3\.0-alpha" README.md docs openclaw.plugin.json package.json package-lock.json dist src public-content
rg -n "0\.3\.0-alpha\.15|0\.3\.0-alpha|Current surface status|Current package version|clawhub package publish" README.md docs/TOOL-SURFACE.md
node -e "<manifest tool count inspection>"
clawhub package inspect umg-envoy-agent
```

Post-edit and gate commands:

```text
node -e "<version surface inspection>"
rg -n "Current package version|Current surface status|clawhub package publish|RELEASE-TRUTH-0\.3\.0-alpha\.15|0\.3\.0-alpha\.20|0\.3\.0-alpha\.15" README.md package.json package-lock.json openclaw.plugin.json docs/TOOL-SURFACE.md
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
rg -n "0\.3\.0-alpha\.20|0\.3\.0-alpha\.15" dist src public-content openclaw.plugin.json package.json package-lock.json README.md docs/TOOL-SURFACE.md
node -e "<installed extension manifest read-only inspection>"
git diff --name-only
```

After source metadata embeds were found in `src/plugin-entry.ts` and `src/compiler/compiler-smoke.ts`, those version literals were updated and the required gates were rerun from `npm run check` onward.

## Gate Results

`npm run check`

Result: pass.

```text
> umg-envoy-agent@0.3.0-alpha.20 check
> tsc --noEmit
```

`npm run build`

Result: pass.

```text
> umg-envoy-agent@0.3.0-alpha.20 build
> tsc
```

`npm pack --dry-run`

Result: pass.

```text
name: umg-envoy-agent
version: 0.3.0-alpha.20
filename: umg-envoy-agent-0.3.0-alpha.20.tgz
package size: 80.6 kB
unpacked size: 390.3 kB
shasum: 10712b68f2f16c67c56f70612f79d37620f0a3e4
total files: 96
```

`node dist/compiler/cognitive-registry.test.js`

Result: pass.

```text
=== Cognitive Registry Tests Complete: 20 passed, 0 failed ===
```

`node dist/compiler/sleeve-composer-dry-run.test.js`

Result: pass.

```text
=== Sleeve Composer Dry-Run Tests Complete: 14 passed, 0 failed ===
```

`node dist/compiler/composed-sleeve-validator-dry-run.test.js`

Result: pass.

```text
=== Composed Sleeve Validator Dry-Run Tests Complete: 21 passed, 0 failed ===
```

`npm run test:tool-manifest-alignment`

Result: pass.

```text
=== Tool Manifest Alignment Tests Complete: 28 passed, 0 failed ===
```

`npm run test:tool-capability-registry`

Result: pass.

```text
=== Tool Capability Registry Tests Complete: 26 passed, 0 failed ===
```

`npm run test:tool-capability-registry-seed`

Result: pass.

```text
=== Tool Capability Registry Seed Tests Complete: 20 passed, 0 failed ===
```

`npm run test:low-risk-direct-execution-adapter`

Result: pass.

```text
=== Low-Risk Direct Execution Adapter Tests Complete: 30 passed, 0 failed ===
```

`npm run test:low-risk-direct-runtime-tool-surface`

Result: pass.

```text
=== Low-Risk Direct Runtime Tool Surface Tests Complete: 21 passed, 0 failed ===
```

`npm run test:low-risk-allowlisted-tool-flow`

Result: pass.

```text
=== Low-Risk Allowlisted Tool Flow Tests Complete: 16 passed, 0 failed ===
```

## Package Readiness

`npm pack --dry-run` includes only the intended package surface from the strict `files` whitelist. The package still contains 96 files and excludes untracked diagnostics/reports, including Alpha20 audit reports.

Package-included dirty docs remain resolved. Remaining untracked diagnostics/reports are package-excluded.

Version surfaces are internally consistent at `0.3.0-alpha.20` for current package/plugin/source/dist metadata.

Manifest expected tool count: 22.

Manifest observed tool count: 22.

## Release-Prep Assertions

Installed extension mutated: no.

ClawHub changed: no.

Publication changed: no.

Version changed in source: yes.

New tools added: no.

Source behavior changed: no, except version metadata.

Generated sleeves executed/written: no.

Writes enabled: no.

Untracked diagnostics cleaned: no.

Commit performed: no.

## Final Verdict

`UMG_ENVOY_ALPHA20D_VERSION_LINEAGE_RELEASE_PREP_SOURCE_READY`
