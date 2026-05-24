# Alpha9 OpenClaw Runtime Maintainer Question Draft

## Short Summary

We have a source-validated read-only Envoy tool and a loaded installed plugin, but we could not prove a supported noninteractive OpenClaw path to list or invoke loaded plugin tools from the installed CLI/runtime surface.

The OpenClaw runtime maintainer question draft does not contact maintainers, open issues, implement protocol methods, call plugin tools, grant approval, record live decisions, execute actions, write files, transmit data, publish packages, or mutate runtime state. It prepares a copy-ready clarification question only.

## Environment Details

- OpenClaw target environment: installed OpenClaw runtime
- target plugin: `umg-envoy-agent`
- target tool: `umg_envoy_controlled_action_runtime_report`
- source tool commit: `0b4442125ebe3a9d4e818c0bc92ec4d8ca6d0743`
- active installed plugin path: `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`
- gateway endpoint: `ws://127.0.0.1:18789`
- gateway process: `openclaw.mjs gateway`
- current baseline commit: `7e092ae2ae0a2e31d3ec4e7a03494458f845d32`

## What We Are Trying To Do

We want to verify, noninteractively and without runtime mutation, that a loaded local plugin tool can be discovered and invoked through a supported OpenClaw interface.

The specific tool we want to verify is the read-only Envoy tool:

- plugin: `umg-envoy-agent`
- tool: `umg_envoy_controlled_action_runtime_report`

## What Already Works

- the Envoy tool exists and validates at source level
- the source tool implementation is tied to commit `0b4442125ebe3a9d4e818c0bc92ec4d8ca6d0743`
- the plugin is installed at `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`
- the active installed plugin path was promoted
- the gateway is available at `ws://127.0.0.1:18789`
- the gateway process is `openclaw.mjs gateway`
- the plugin is listed as loaded

## What Is Blocked

No supported documented noninteractive way was proven to list or invoke loaded plugin tools from the installed OpenClaw CLI/runtime surface.

## Exact Questions

1. What is the supported noninteractive command or RPC method to list loaded plugin tools?
2. What is the supported noninteractive command or RPC method to invoke a loaded plugin tool?
3. Does `openclaw gateway call` support plugin tool invocation? If yes, what method name and payload shape should be used?
4. Is there a JSON-RPC method equivalent to `plugin.tools.list`, `plugin.tools.inspect`, or `plugin.tools.call`?
5. Where in source are gateway RPC methods registered?
6. Where in source are plugin manifests loaded into runtime state?
7. Where in source are plugin tools exposed to the model/UI?
8. Are plugin tools callable outside the model loop?
9. Is there a read-only tool metadata flag or safety classification already supported?
10. What is the intended way to verify a plugin tool is callable after local install?

## Desired Answer Format

Please answer with, if available:

- command name or RPC method
- request envelope shape
- example payload
- example response
- auth/session requirements
- source file/module names
- whether the path is public/supported or internal/unsupported

## Safety Constraints

- no runtime mutation requested
- no protocol implementation requested
- no live tool execution requested
- no approval or write-path escalation requested
- no bridge enablement requested
- no direct source enablement requested
- looking for supported clarification first, not bundled-runtime patch guidance unless no supported path exists

## Copy-Ready Maintainer / Source Question

Hello — I’m trying to verify a loaded local plugin tool in installed OpenClaw without mutating runtime state.

Environment details:
- target plugin: `umg-envoy-agent`
- target tool: `umg_envoy_controlled_action_runtime_report`
- source tool commit: `0b4442125ebe3a9d4e818c0bc92ec4d8ca6d0743`
- active installed plugin path: `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`
- gateway endpoint: `ws://127.0.0.1:18789`
- gateway process: `openclaw.mjs gateway`

What I’m trying to do:
- noninteractively list loaded plugin tools
- noninteractively invoke a loaded plugin tool
- specifically verify the read-only tool `umg_envoy_controlled_action_runtime_report`

What already works:
- the Envoy tool validates at source level
- the plugin is installed and listed as loaded
- the gateway is up

What is blocked:
- I have not been able to prove a supported documented noninteractive CLI or RPC path for listing or invoking loaded plugin tools from the installed OpenClaw runtime surface

Questions:
1. What is the supported noninteractive command or RPC method to list loaded plugin tools?
2. What is the supported noninteractive command or RPC method to invoke a loaded plugin tool?
3. Does `openclaw gateway call` support plugin tool invocation? If yes, what method name and payload shape should be used?
4. Is there a JSON-RPC method equivalent to `plugin.tools.list`, `plugin.tools.inspect`, or `plugin.tools.call`?
5. Where in source are gateway RPC methods registered?
6. Where in source are plugin manifests loaded into runtime state?
7. Where in source are plugin tools exposed to the model/UI?
8. Are plugin tools callable outside the model loop?
9. Is there a read-only tool metadata flag or safety classification already supported?
10. What is the intended way to verify a plugin tool is callable after local install?

If possible, please answer with:
- command name or RPC method
- request envelope shape
- example payload
- example response
- auth/session requirements
- source file/module names
- whether the path is public/supported or internal/unsupported

If there is no supported public path yet, the most useful fallback would be the exact source modules responsible for:
- gateway call dispatch
- WebSocket JSON-RPC method registry
- plugin manifest/runtime registry
- plugin loader
- model-visible tool exposure
- tool invocation dispatch
- read-only / approval / permission enforcement
- CLI command definitions for plugins/gateway call

## Boundaries

This draft is prepared for review only. It does not perform external contact, issue creation, runtime mutation, protocol implementation, live tool invocation, execution, approval, recording, writing, transmission, or package publishing.
