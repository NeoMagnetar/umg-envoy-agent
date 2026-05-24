# Alpha9 Controlled Action Runtime Report Live Call Path Discovery

## Purpose

This lane investigates whether the installed OpenClaw runtime exposes a supported noninteractive path for listing and invoking loaded plugin tools, specifically `umg_envoy_controlled_action_runtime_report`.

## Baseline

- Source commit: `0b4442125ebe3a9d4e818c0bc92ec4d8ca6d0743`
- Blocked live verification commit: `e3b9e47f4e50ef0f28dc7006ba1d3dd6a4d9d8e7`
- Active installed plugin path: `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`

## Gateway state

Confirmed:
- gateway process is running on port `18789`
- gateway endpoint is reachable at `ws://127.0.0.1:18789`
- webchat connected
- `umg-envoy-agent` remains listed as loaded

## CLI discovery findings

Confirmed CLI surfaces:
- `openclaw plugins list`
- `openclaw plugins inspect`
- `openclaw gateway call <method>`
- `openclaw agent`

Not found as supported CLI surfaces:
- `openclaw tools`
- a documented generic `plugin tool call` command
- a documented generic `plugin tool list` command

## Resolver / active path findings

OpenClaw's installed resolver code shows that `global:<rel>` resolves under the global extensions root beneath the OpenClaw config/state directory.

That resolved the active plugin path with high confidence to:
- `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`

That active path was already backed up and promoted in the previous lane.

## RPC / protocol findings

Confirmed noninteractive gateway RPC path:
- `openclaw gateway call status --json`

That proves the gateway accepts RPC calls.

However, this discovery pass did not produce a supported documented noninteractive method for:
- listing loaded plugin tools
- invoking a plugin tool such as `umg_envoy_controlled_action_runtime_report`

The installed OpenClaw codebase and CLI help strongly suggest internal tool-routing exists for the control UI and runtime, but no public noninteractive plugin-tool call path was proven from the installed CLI/runtime surfaces available here.

## Why this lane remains blocked

What is proven:
- gateway is running
- active installed plugin path is resolved
- active installed plugin path was promoted
- gateway RPC works for known gateway methods

What is not proven:
- explicit noninteractive live tool-list method exposing `umg_envoy_controlled_action_runtime_report`
- explicit noninteractive live tool-call method for invoking that loaded plugin tool

Because of that, this lane cannot honestly claim a verified live call path.

## Boundary preservation

No new source features were implemented in this lane.

No further promotion was performed.

No execution, approval, live recording, write actions, bridge enablement, direct_source enablement, automatic takeover, package publish, UMG-Block-Library mutation, Resleever changes, or MCP changes were introduced.

## Recommended next step

`ALPHA9_OPENCLAW_PLUGIN_TOOL_CALL_PROTOCOL_RESEARCH_SOURCE`

Purpose:
- identify or establish a documented supported protocol for noninteractive listing/invocation of loaded plugin tools in the running OpenClaw gateway/runtime.
