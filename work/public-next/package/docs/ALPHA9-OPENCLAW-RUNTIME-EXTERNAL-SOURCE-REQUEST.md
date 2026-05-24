# Alpha9 OpenClaw Runtime External Source Request

## Executive Summary

Envoy has a read-only runtime report tool implemented and validated at source level, but live verification is blocked because installed OpenClaw does not expose a proven supported noninteractive plugin-tool list/call path.

The OpenClaw runtime external source request does not contact maintainers, implement protocol methods, call plugin tools, grant approval, record live decisions, execute actions, write files, transmit data, publish packages, or mutate runtime state. It prepares a clarification package for the missing supported plugin-tool discovery/invocation path only.

## Known Facts

- target plugin: `umg-envoy-agent`
- target tool: `umg_envoy_controlled_action_runtime_report`
- source tool commit: `0b4442125ebe3a9d4e818c0bc92ec4d8ca6d0743`
- active installed plugin path: `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`
- gateway endpoint: `ws://127.0.0.1:18789`
- gateway process: `node.exe` running `openclaw.mjs gateway`
- plugin is listed as loaded
- source implementation validates
- active installed plugin path was promoted
- current baseline commit: `94711a3660bf89bf4850bea4ce6da0dd2c7eb4cb`
- previous lane: `ALPHA9_OPENCLAW_RUNTIME_SOURCE_MAP_EXTRACTION_SOURCE_READY`
- previous status: `source_map_insufficient_for_runtime_mutation`

## Current Blocker

The remaining blocker is not Envoy source code, installed plugin files, or gateway availability. The remaining blocker is absence of a proven supported noninteractive OpenClaw protocol for listing and invoking loaded plugin tools.

## What Was Tried

- OpenClaw CLI help inspection
- `openclaw plugins list`
- `openclaw gateway call status --json`
- OpenClaw bundle/source-map inspection
- resolver/global path inspection
- active plugin path promotion
- live call path discovery lane
- runtime protocol escalation lane
- source map extraction lane

## Current Confidence Map

- plugin registry / global plugin resolution: high confidence
- gateway call dispatch: medium confidence
- RPC method registry: medium confidence
- plugin-tool invocation route: low confidence
- read-only enforcement hook: low confidence

## Exact Questions for Maintainer / Source

1. What is the supported noninteractive command or RPC method to list loaded plugin tools?
2. What is the supported noninteractive command or RPC method to invoke a loaded plugin tool?
3. Does `openclaw gateway call` support plugin tool invocation? If yes, what method name and payload shape?
4. Is there an internal JSON-RPC method equivalent to `plugin.tools.list`, `plugin.tools.inspect`, or `plugin.tools.call`?
5. Where in source are gateway RPC methods registered?
6. Where in source are plugin manifests loaded into runtime state?
7. Where in source are plugin tools exposed to the model/UI?
8. Are plugin tools callable outside the model loop?
9. Is there a read-only tool metadata flag or safety classification already supported?
10. What is the intended way to verify a plugin tool is callable after local install?

## Source Files / Modules Requested

Request original source locations for:

- gateway call dispatch
- WebSocket JSON-RPC method registry
- plugin registry / manifest registry
- plugin loader
- model-visible tool registry
- tool invocation dispatch
- read-only / approval / permission enforcement
- CLI command definitions for plugins/gateway call

## Desired Protocol

Proposed protocol names for clarification:

- `plugin.tools.list`
- `plugin.tools.inspect`
- `plugin.tools.call`

This is a proposed design, not assumed to exist.

## Safe Acceptance Criteria

This lane is unblocked only if we obtain enough information for at least one of these safe paths:

- documented command/RPC for tool listing
- documented command/RPC for tool invocation
- request/response shape
- safety metadata path
- clear read-only enforcement behavior
- enough source mapping to patch safely if no protocol exists

## Boundaries

- no execution
- no approval
- no live recording
- no writes
- no bridge enablement
- no direct_source
- no automatic takeover
- no package publish
- no runtime mutation
- no external contact performed in this lane

## Maintainer-Ready Problem Statement

We have a source-validated read-only Envoy tool implementation and a promoted installed plugin path, but we cannot prove a supported noninteractive runtime path for enumerating or invoking plugin tools from the installed OpenClaw gateway. Static inspection of the bundled runtime and source maps improved confidence in plugin registry resolution, but did not safely isolate the gateway/RPC/tool-dispatch/enforcement surfaces needed for mutation or for reliable external invocation.

The specific clarification request is:

What is the supported way, in OpenClaw 2026.3.23-1, to list and invoke loaded plugin tools noninteractively?

## Next-Step Decision Criteria

Proceed to response review or maintainer-question drafting only after at least one of the following is available:

- a documented supported CLI or RPC path for tool listing
- a documented supported CLI or RPC path for tool invocation
- confirmed source module locations for runtime tool exposure and dispatch
- confirmed source module locations for read-only or approval enforcement
- enough source clarity to determine that no supported protocol exists and a safe patch target can be isolated instead

## Lane Output Summary

This lane produces a clean clarification package only. It does not perform outreach, does not change runtime behavior, and does not convert the Envoy tool into an executable live path.
