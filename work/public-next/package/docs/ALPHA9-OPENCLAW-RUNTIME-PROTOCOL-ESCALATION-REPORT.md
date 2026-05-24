# Alpha9 OpenClaw Runtime Protocol Escalation Report

## Executive Summary

- Envoy source tool implementation is complete.
- Active installed plugin path was resolved.
- Active installed path was promoted.
- Gateway is running.
- Plugin is loaded.
- Live verification remains blocked.
- The blocker is protocol-level: no proven supported noninteractive plugin-tool discovery/invocation path.

## Proven Facts

- Source tool: `umg_envoy_controlled_action_runtime_report`
- Source tool commit: `0b4442125ebe3a9d4e818c0bc92ec4d8ca6d0743`
- Protocol research commit: `1760d444a12e09393e156a532e4f64043756a7e0`
- Active installed plugin path: `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`
- Gateway: `ws://127.0.0.1:18789`
- Known live plugin: `umg-envoy-agent`
- Plugin version: `0.3.0-alpha.12`

## What Was Verified

- source build passes
- runtime report implementation smoke passes
- validate:alpha-current passes
- active path resolved
- stale active path promoted
- gateway process running
- plugin loaded
- protocol research smoke passes

## What Was Not Verified

- live runtime tool list containing `umg_envoy_controlled_action_runtime_report`
- live invocation of `umg_envoy_controlled_action_runtime_report`
- navigation_only live probe
- ascii_only live probe
- structured_only live probe
- panel live probes
- invalid panel live probe

## Exact Blocker

The remaining blocker is not Envoy source code, installed plugin files, or gateway availability. The remaining blocker is that the installed OpenClaw CLI/runtime surface did not expose a proven supported noninteractive protocol for listing and invoking loaded plugin tools.

## Resolution Options

### Option A — Ask / Inspect OpenClaw Supported Protocol
Goal:
Find the intended supported way to list and invoke plugin tools through OpenClaw.

Needed:
- docs
- maintainer guidance
- CLI support
- RPC method name
- expected request/response shape

Risk:
- low

Recommended:
- yes

### Option B — Add a Dedicated OpenClaw Plugin Tool Call Protocol
Goal:
Design or request a stable OpenClaw runtime method for:
- plugin tool list
- plugin tool invoke
- read-only call metadata
- structured result capture

Risk:
- medium

Recommended:
- yes, if no existing protocol exists

### Option C — Add Envoy Self-Test Tool Surface
Goal:
Expose a read-only Envoy self-test / runtime-report probe through an already supported surface.

Risk:
- medium

Recommended:
- only after protocol path is understood

### Option D — Stop at Source-Level Verification
Goal:
Accept source-level validation and defer live proof.

Risk:
- low technically, but incomplete for live runtime confidence

Recommended:
- no, except as temporary pause

## Recommended Next Path

Recommended next lane:
- `ALPHA9_OPENCLAW_PLUGIN_TOOL_CALL_PROTOCOL_DESIGN_SOURCE`

Purpose:
- design the minimal read-only protocol contract needed for OpenClaw to list and call loaded plugin tools noninteractively

Alternative:
- `ALPHA9_OPENCLAW_RUNTIME_PROTOCOL_MAINTAINER_QUESTION_SOURCE`

Purpose:
- prepare a concise issue/question for OpenClaw maintainers or documentation

If staying fully local, preferred:
- `ALPHA9_OPENCLAW_PLUGIN_TOOL_CALL_PROTOCOL_DESIGN_SOURCE`

## Required Future Protocol Capabilities

The future protocol should support:
- list loaded plugins
- list loaded plugin tools
- identify tool namespace/plugin owner
- call read-only plugin tool by name
- pass JSON input
- receive JSON output
- return validation errors safely
- expose no execution authority by default
- distinguish read-only tools from action-capable tools

## Boundaries

- no execution
- no approval
- no live recording
- no write actions
- no bridge enablement
- no direct_source enablement
- no automatic takeover
- no package publish
- no UMG-Block-Library mutation
- no Resleever touch
- no MCP changes

## Principle

The OpenClaw runtime protocol escalation report does not grant approval, record live decisions, execute actions, write files, transmit data, publish packages, or mutate runtime state. It documents the missing supported plugin-tool discovery/invocation path and defines safe resolution options.
