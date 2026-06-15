# UMG Envoy Explain Sleeve Matrix Preview Live Validation Alpha16

## Purpose

Install the local UMG Envoy package containing the `matrix_summary` extension for `umg_envoy_explain_sleeve`, then validate live OpenClaw CLI behavior against bundled public sleeves.

## Install Evidence

- Installed extension path: `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`
- Backup path: `C:\.openclaw\workspace\installed-extension-backups\umg-envoy-agent-before-matrix-preview-alpha16-20260615-124354`
- Package artifact: `C:\.openclaw\workspace\umg-envoy-agent-release-clean\umg-envoy-agent-0.3.0-alpha.15.tgz`
- Package version: `0.3.0-alpha.15`
- Install result: pass, `openclaw plugins install` exit code `0`
- Plugin status: loaded
- Tool count: 18 from live `status.supportedTools`

Existing host warnings were still present for unrelated plugin/config state:

- `openclaw-desktop-bridge` package subpath export warning
- `uo-server-code-plugin` compiled runtime output warning
- shared SQLite plugin install metadata warning for `umg-envoy-agent`

These warnings did not block UMG Envoy install or validation commands.

## Tool / CLI Surface

- Tool: `umg_envoy_explain_sleeve`
- CLI syntax validated: `openclaw umg-envoy -- explain-sleeve --sleeve <id>`
- Root command help includes `explain-sleeve`
- Version remains `0.3.0-alpha.15`

## public-basic-envoy Matrix Proof

| Check | Observed | Result |
|---|---|---|
| `matrix_summary.available` | `true` | Pass |
| block nodes | `7` | Pass |
| `trigger.sample` exists | `block:trigger.sample` | Pass |
| `trigger.sample` off | `enabled=false`, `active=false` | Pass |
| skipped relationship | `skipped_from_runtime` present | Pass |
| skipped reason | `has_skipped_reason` present | Pass |
| active count | `6` | Pass |
| prompt part count | `6` | Pass |
| tool request count | `0` | Pass |
| RuntimeSpecBoundary represented | `runtime_spec -> guarded_by -> boundary:runtime_spec` | Pass |
| non-executing | `matrix_summary.non_executing=true`, boundary node `non_executing=true` | Pass |

## public-coder-envoy Matrix Proof

| Check | Observed | Result |
|---|---|---|
| `matrix_summary.available` | `true` | Pass |
| block nodes | `7` | Pass |
| `trigger.sample` on | `enabled=true`, `active=true` | Pass |
| active relationship | `active_in_runtime` present | Pass |
| active count | `7` | Pass |
| prompt part count | `7` | Pass |
| inspect tool request | `tool_request:1:inspect` and `requests_tool` edge present | Pass |
| RuntimeSpecBoundary represented | `runtime_spec -> guarded_by -> boundary:runtime_spec` | Pass |
| non-executing | `matrix_summary.non_executing=true`, boundary node `non_executing=true` | Pass |

## Regression Checks

| Command | Result |
|---|---|
| `openclaw umg-envoy -- status` | Pass, `ok=true`, supported tool count `18`, explain tool present |
| `openclaw umg-envoy -- compiler-smoke` | Pass, `ok=true` |
| `openclaw umg-envoy -- list-sleeves` | Pass, two public sleeves visible |
| `openclaw umg-envoy -- list-block-libraries` | Pass, `totalBlocks=7` |
| `openclaw umg-envoy -- compile-sleeve --sleeve public-coder-envoy` | Pass, `ok=true`, active count `7`, tool request `inspect` preserved |

## Boundaries Preserved

- no publication
- no ClawHub update
- no version bump
- no tag
- no writes enabled
- no external compiler bridge execution
- no unrestricted relation-matrix emit
- no MOLT, NeoBlock, or NeoStack implementation
- installed extension backup preserved

## Verdict

MATRIX_PREVIEW_ALPHA16_LIVE_VALIDATION_PASSED

## Next Step

Commit and push the matrix preview implementation and validation report.
