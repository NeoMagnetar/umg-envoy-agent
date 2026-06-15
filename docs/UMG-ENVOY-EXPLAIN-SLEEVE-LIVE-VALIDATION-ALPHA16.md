# UMG Envoy Explain Sleeve Live Validation — Alpha16

## 1. Purpose

Install the local UMG Envoy package containing `umg_envoy_explain_sleeve` and the `explain-sleeve` CLI command, then validate the live OpenClaw host surface against bundled public sleeves.

## 2. Install Evidence

- Package: `umg-envoy-agent 0.3.0-alpha.15`
- Installed path: `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`
- Package artifact: `C:\.openclaw\workspace\umg-envoy-agent-release-clean\umg-envoy-agent-0.3.0-alpha.15.tgz`
- Install exit: `EXIT_CODE=0`
- Plugin info: status loaded, version `0.3.0-alpha.15`
- Backup path: `C:\.openclaw\workspace\installed-extension-backups\umg-envoy-agent-before-explain-sleeve-alpha16-20260615-114143`

Note: the local tarball was regenerated with `npm pack` before install because the pre-existing tarball timestamp and size were from before the explain-sleeve build. The regenerated tarball manifest contained 18 tools and included `umg_envoy_explain_sleeve`.

## 3. Tool / CLI Surface

| Item | Expected | Observed | Result |
|---|---|---|---|
| Manifest tool count | 18 | 18 in repo manifest and tarball manifest | Pass |
| New tool | `umg_envoy_explain_sleeve` | Present in manifest and live status supported tools | Pass |
| Root CLI help | includes `explain-sleeve` | `openclaw umg-envoy --help` includes `explain-sleeve` | Pass |
| Explain help | shows `--sleeve <id>` | `openclaw umg-envoy -- explain-sleeve --help` shows `--sleeve <id>` | Pass |
| Installed version | `0.3.0-alpha.15` | `0.3.0-alpha.15` | Pass |

Invocation note: this host routes live plugin subcommands with the separator form, for example `openclaw umg-envoy -- explain-sleeve --sleeve public-basic-envoy`. The non-separator form was listed by help but rejected by the host command router during validation.

## 4. public-basic-envoy Explain Proof

| Check | Result | Evidence |
|---|---|---|
| JSON parsed | Pass | `ok=true` |
| all block refs visible | Pass | `block_refs=7` |
| `trigger.sample` visible | Pass | block ref present |
| `trigger.sample` off | Pass | `enabled=false`, `active=false` |
| active block count | Pass | `active_blocks=6` |
| warning preserved | Pass | `disabled block skipped: trigger.sample` |
| tool requests empty | Pass | `tool_requests=[]` |
| RuntimeSpec boundary | Pass | `nonExecuting=true`, `status=valid_non_executing_artifact` |

## 5. public-coder-envoy Explain Proof

| Check | Result | Evidence |
|---|---|---|
| JSON parsed | Pass | `ok=true` |
| all block refs visible | Pass | `block_refs=7` |
| `trigger.sample` visible | Pass | block ref present |
| `trigger.sample` on | Pass | `enabled=true`, `active=true` |
| active block count | Pass | `active_blocks=7` |
| tool requests visible | Pass | `{ "name": "inspect" }` |
| warnings empty | Pass | `warnings=[]` |
| RuntimeSpec boundary | Pass | `nonExecuting=true`, `status=valid_non_executing_artifact` |

## 6. Regression Checks

| Command | Result |
|---|---|
| `openclaw umg-envoy -- status` | Pass, `ok=true`, supported tools include `umg_envoy_explain_sleeve` |
| `openclaw umg-envoy -- compiler-smoke` | Pass, `ok=true` |
| `openclaw umg-envoy -- list-sleeves` | Pass, `public-basic-envoy` and `public-coder-envoy` visible |
| `openclaw umg-envoy -- list-block-libraries` | Pass, `totalBlocks=7` |
| `openclaw umg-envoy -- compile-sleeve --sleeve public-coder-envoy` | Pass, `ok=true`, active block count 7, tool request `inspect` preserved |

## 7. Boundaries Preserved

- no publish
- no ClawHub update
- no version bump
- no writes enabled
- no external bridge execution
- no relation-matrix emit execution
- no private roots required
- installed extension backup exists

## 8. Verdict

EXPLAIN_SLEEVE_ALPHA16_LIVE_VALIDATION_PASSED

## 9. Next Step

Commit/push the explain-sleeve implementation and live validation report, then begin the relation/IR matrix preview lane.
