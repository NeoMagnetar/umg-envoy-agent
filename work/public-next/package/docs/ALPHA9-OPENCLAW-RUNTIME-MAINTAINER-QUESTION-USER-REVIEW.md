# Alpha9 OpenClaw Runtime Maintainer Question User Review

## Review Purpose

This packet prepares the OpenClaw maintainer/source clarification question for Mag to review before any external contact is considered.

The OpenClaw runtime maintainer question user-review packet does not contact maintainers, open issues, implement protocol methods, call plugin tools, grant approval, record live decisions, execute actions, write files outside this repo artifact, transmit data externally, publish packages, or mutate runtime state. It prepares the question for user review only.

## Current Blocker Summary

The plugin is installed and the gateway is running, but no supported documented noninteractive way has been proven to list, inspect, or invoke loaded plugin tools from the installed OpenClaw CLI/runtime surface.

## Target Tool and Plugin

- plugin: `umg-envoy-agent`
- tool: `umg_envoy_controlled_action_runtime_report`
- source tool commit: `0b4442125ebe3a9d4e818c0bc92ec4d8ca6d0743`
- active installed plugin path: `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`
- gateway endpoint: `ws://127.0.0.1:18789`
- gateway process: `openclaw.mjs gateway`

## Copy-Ready Maintainer Question

Hello — we are trying to verify a read-only OpenClaw plugin tool noninteractively.

Plugin:
`umg-envoy-agent`

Tool:
`umg_envoy_controlled_action_runtime_report`

The plugin is installed and loaded, and the gateway is running, but we cannot find a documented noninteractive way to list or invoke loaded plugin tools from the OpenClaw CLI/runtime surface.

What is the supported way to:
1. list loaded plugin tools
2. inspect a plugin tool
3. invoke a read-only plugin tool with JSON input
4. capture JSON output

If available, please also provide:
- command name or RPC method
- request envelope shape
- example payload
- example response
- auth/session requirements
- source file/module names
- whether the path is public/supported or internal/unsupported

Relevant environment details:
- source tool commit: `0b4442125ebe3a9d4e818c0bc92ec4d8ca6d0743`
- active installed plugin path: `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`
- gateway endpoint: `ws://127.0.0.1:18789`
- gateway process: `openclaw.mjs gateway`

If there is no supported public path, the most useful fallback would be the exact source modules responsible for:
- gateway RPC registration
- plugin manifest/runtime loading
- model/UI tool exposure
- plugin tool invocation dispatch
- read-only / approval / permission classification

## Key Technical Facts

- target plugin: `umg-envoy-agent`
- target tool: `umg_envoy_controlled_action_runtime_report`
- source tool commit: `0b4442125ebe3a9d4e818c0bc92ec4d8ca6d0743`
- active installed plugin path: `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`
- gateway endpoint: `ws://127.0.0.1:18789`
- gateway process: `openclaw.mjs gateway`
- plugin is installed and loaded
- blocker is runtime protocol discoverability, not plugin source implementation
- no supported documented noninteractive list/invoke path has been proven yet

## Exact Questions Being Asked

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

Please answer with:
- command name or RPC method
- request envelope shape
- example payload
- example response
- auth/session requirements
- source file/module names
- whether the path is public/supported or internal/unsupported

## Safety Constraints

- no external contact performed in this lane
- no issue created in this lane
- no runtime mutation
- no protocol implementation
- no live tool call
- no execution
- no approval
- no live recording
- no writes outside repo artifact
- no package publish

## User Review Choices

- `approve_as_written`
- `approve_with_edits`
- `needs_more_context`
- `defer_external_contact`
- `reject_question`

## Recommended Next Lane

Default recommendation: `needs_user_review`

Follow-up lane after review if approved for send preparation:
- `ALPHA9_OPENCLAW_RUNTIME_MAINTAINER_QUESTION_SEND_APPROVAL_SOURCE`

If review remains local and no send path is approved, manual user review in chat is the correct holding state.
