# Alpha9 OpenClaw Plugin Tool Call Protocol Research

## Purpose

This lane researches the installed OpenClaw CLI/runtime surface to determine whether a supported noninteractive method exists for:
- listing loaded plugin tools
- invoking a loaded plugin tool
- capturing safe read-only tool output

Target tool for eventual live verification:
- `umg_envoy_controlled_action_runtime_report`

## Current source checkpoint

- Source tool commit: `0b4442125ebe3a9d4e818c0bc92ec4d8ca6d0743`
- Previous blocked live-call-path discovery commit: `94b8ad0fd515f5aa9576b47e2fd2c4d94ee1bf04`

## Active plugin path

High-confidence active installed plugin path:
- `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`

## Gateway evidence

Confirmed:
- gateway process running on `ws://127.0.0.1:18789`
- active gateway process is `node.exe` running `openclaw.mjs gateway`
- webchat connected
- `umg-envoy-agent` remains listed as loaded

## CLI commands inspected

Inspected help/output for:
- `openclaw --help`
- `openclaw gateway --help`
- `openclaw plugins --help`
- `openclaw node --help`
- `openclaw status --help`
- `openclaw gateway call --help`
- `openclaw plugins inspect --help`
- `openclaw plugins info --help`

Also tested for missing/unsupported command surfaces:
- `openclaw tools --help`
- `openclaw tool --help`
- `openclaw invoke --help`
- `openclaw call --help`

## CLI findings

Supported/documented CLI surfaces found:
- plugin listing/inspection
- gateway RPC call for documented gateway methods
- agent messaging surface

Not found as documented generic plugin-tool surfaces:
- generic `tools` CLI
- generic `tool` CLI
- generic `invoke` CLI
- generic `call` CLI
- documented `plugin tool call` or `plugin tool list` CLI

## Bundled OpenClaw files inspected

Installed OpenClaw root:
- `C:\Users\Magne\AppData\Roaming\npm\node_modules\openclaw`

Relevant bundled code areas inspected included:
- plugin registry / manifest registry
- plugins CLI bundle
- gateway routes bundle
- subsystem/runtime bundle
- resolver/config bundle

## RPC methods found

Documented/observed working RPC and runtime methods included patterns such as:
- `status`
- `sessions.list`
- `chat.history`
- `models.list`
- `node.list`
- `device.pair.list`
- `cron.*`
- system/gateway presence methods

A proven noninteractive gateway RPC call exists for known gateway methods:
- `openclaw gateway call status --json`

## Tool/plugin invocation findings

The installed OpenClaw code strongly suggests internal tool routing and control-UI interactions exist.

However, this research did **not** prove a supported documented noninteractive path for:
- listing loaded plugin tools generically
- invoking a loaded plugin tool such as `umg_envoy_controlled_action_runtime_report`

No public CLI surface or proven gateway RPC method was identified that could be used as a supported noninteractive plugin-tool call path in this installed OpenClaw version.

## Browser/control surface findings

Observed browser/control evidence:
- browser control endpoint exists on `http://127.0.0.1:18791/`
- gateway logs and bundled code show control-UI / WebSocket / RPC-like internal surfaces

But this lane did not prove a supported documented noninteractive plugin-tool call protocol through that browser/control surface.

## Result

### Supported noninteractive tool list path
- not proven

### Supported noninteractive tool call path
- not proven

### Exact blocker
No supported noninteractive plugin-tool discovery/invocation path was found in installed OpenClaw CLI help, gateway call surface, or bundled runtime code inspection.

## Principle

Protocol research does not grant approval, record live decisions, execute actions, write files, transmit data, publish packages, or mutate plugin/runtime state. It documents whether a supported noninteractive tool discovery/invocation path exists.

## Next recommended lane

`ALPHA9_OPENCLAW_RUNTIME_PROTOCOL_ESCALATION_REPORT_SOURCE`

Reason:
- the remaining blocker is no longer plugin/source/runtime state
- it is a missing or undocumented protocol surface for noninteractive plugin-tool discovery/invocation
