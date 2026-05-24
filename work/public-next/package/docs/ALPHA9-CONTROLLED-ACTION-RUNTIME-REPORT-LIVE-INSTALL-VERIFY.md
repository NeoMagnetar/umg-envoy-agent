# Alpha9 Controlled Action Runtime Report Live Install Verify

## Purpose

This lane verifies whether `umg_envoy_controlled_action_runtime_report` is available through the actual loaded OpenClaw / Envoy runtime, rather than only existing in source-level implementation.

## Source checkpoint

- Source commit: `0b4442125ebe3a9d4e818c0bc92ec4d8ca6d0743`
- Branch: `alpha7/from-public-synced-alpha6`
- Source path: `C:\.openclaw\workspace\worktrees\umg-envoy-alpha7\work\public-next\package`

## Active installed plugin path

Resolved via OpenClaw's own plugin resolver code:
- OpenClaw resolver logic maps `global:<rel>` to `path.join(resolveConfigDir(env), "extensions")`
- `resolveConfigDir(env)` resolves to the OpenClaw state dir under the user home when no override is set
- High-confidence active plugin path:
  - `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`

Evidence at active path:
- `openclaw.plugin.json`: present
- `package.json`: present
- `dist/plugin-entry.js`: present
- plugin/package version: `0.3.0-alpha.12`

## Stale check and local promotion

Before promotion, the active installed path was stale:
- `dist/controlled-action-runtime-report-tool-surface.js`: absent
- `dist/plugin-entry.js` did not reference `umg_envoy_controlled_action_runtime_report`

A backup was created:
- `C:\.openclaw\workspace\alpha9-runtime-report-live-verify-backups\umg-envoy-agent-active-before-runtime-report-tool-live-verify-20260523-153313`

Required built files were promoted into the active installed path:
- `dist/plugin-entry.js`
- `dist/plugin-entry.d.ts`
- `dist/controlled-action-runtime-report-tool-surface.js`
- `dist/controlled-action-runtime-report-tool-surface.d.ts`
- `dist/controlled-action-runtime-report-integration.js`
- `dist/controlled-action-runtime-report-integration.d.ts`
- `openclaw.plugin.json`

After promotion, the active path contained:
- `dist/controlled-action-runtime-report-tool-surface.js`
- `dist/plugin-entry.js` referencing `umg_envoy_controlled_action_runtime_report`

## Gateway process

Running gateway process identified on port `18789`:
- process: `node.exe`
- executable: `C:\Program Files\nodejs\node.exe`
- command line:
  - `"C:\Program Files\nodejs\node.exe" --disable-warning=ExperimentalWarning C:\Users\Magne\AppData\Roaming\npm\node_modules\openclaw\openclaw.mjs gateway`

Gateway shell output confirmed:
- listening on `ws://127.0.0.1:18789`
- listening on `ws://[::1]:18789`
- webchat connected

## Plugin loaded state

OpenClaw plugin listing showed:
- plugin id: `umg-envoy-agent`
- version: `0.3.0-alpha.12`
- token: `global:umg-envoy-agent/dist/plugin-entry.js`

## Remaining blocker

The live install verification remains blocked for one narrow reason:

A documented, noninteractive live tool discovery + tool call path for plugin tools could not be proven from the installed OpenClaw CLI/runtime surface in this environment.

What is proven:
- gateway process is real and reachable
- active plugin path is resolved with high confidence
- active plugin path was stale and was promoted
- plugin is listed as loaded

What is not proven:
- explicit live tool-list evidence containing `umg_envoy_controlled_action_runtime_report`
- successful live runtime tool calls for navigation/ascii/structured/panel probes

## Why blocked instead of ready

The public CLI surfaces available here expose:
- `openclaw plugins list`
- `openclaw plugins inspect`
- `openclaw gateway call <method>` for known gateway methods such as health/status/system-presence/cron
- `openclaw agent`

But no documented noninteractive plugin-tool invocation path was confirmed for calling `umg_envoy_controlled_action_runtime_report` directly through the loaded runtime.

Therefore the lane cannot honestly claim `live_verified` yet.

## Read-only guarantees preserved

The live install verification confirms only local runtime state and promotion status. Verification does not grant approval, record live decisions, execute actions, write files from the tool call, transmit data, publish packages, or restart OpenClaw from the tool call.

## Boundaries preserved

- no action execution
- no approval granting
- no live review decision recording
- no write actions added
- no bridge actions enabled
- no UMG-Block-Library mutation
- no Resleever changes
- no MCP server changes
- no package publish
- `direct_source` remains disabled
- automatic response takeover remains disabled

## Next recommended step

Resolve or expose a supported noninteractive live plugin-tool discovery/call path in the running OpenClaw runtime, then rerun this lane's live tool-list and probe verification.
