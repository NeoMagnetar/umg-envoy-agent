# Alpha9 OpenClaw Runtime Maintainer Question Send Approval

## Purpose

This lane records that the user approved the maintainer/source clarification question text for possible future sending.

This lane does not send the question, does not create a GitHub issue, does not contact maintainers, and does not mutate runtime.

## Baseline

- current baseline lane: `ALPHA9_OPENCLAW_RUNTIME_MAINTAINER_QUESTION_USER_REVIEW_SOURCE_READY`
- latest accepted commit: `714c1c803f5bbd31b0f9769e44cf521421cb238c`
- user review outcome: `approve_with_edits`

## Approved Question Scope

The approved question asks how to:
1. list loaded plugin tools
2. inspect plugin tool metadata/capability classification without invoking it
3. invoke a read-only plugin tool with JSON input
4. capture JSON output

## Approved Question Text

Hello — we are trying to verify a read-only OpenClaw plugin tool noninteractively.

Plugin:
umg-envoy-agent

Tool:
umg_envoy_controlled_action_runtime_report

The plugin is installed and loaded, and the gateway is running, but we cannot find a documented noninteractive way to list, inspect, or invoke loaded plugin tools from the OpenClaw CLI/runtime surface.

What is the supported way to:

list loaded plugin tools
inspect a plugin tool’s metadata/capability classification without invoking it
invoke a read-only plugin tool with JSON input
capture JSON output from that invocation

If available, please also provide:

command name or RPC method
request envelope shape
example payload
example response
auth/session requirements
source file/module names
whether the path is public/supported or internal/unsupported

Relevant environment details:

source tool commit: 0b4442125ebe3a9d4e818c0bc92ec4d8ca6d0743
active installed plugin path: C:\Users\Magne\.openclaw\extensions\umg-envoy-agent
gateway endpoint: ws://127.0.0.1:18789
gateway process: openclaw.mjs gateway

If there is no supported public path, the most useful fallback would be the exact source modules responsible for:

gateway RPC registration
plugin manifest/runtime loading
model/UI tool exposure
plugin tool metadata/capability classification
plugin tool invocation dispatch
read-only / approval / permission enforcement

## Review State

- review choices considered:
  - `approve_as_written`
  - `approve_with_edits`
  - `needs_more_context`
  - `defer_external_contact`
  - `reject_question`
- selected review choice: `approve_with_edits`
- question approved for future send: `true`
- delivery method selected: `false`

## Safety Constraints

- no external contact
- no issue creation
- no runtime mutation
- no protocol implementation
- no live tool call
- no execution
- no approval of tool execution
- no live recording
- no writes outside repo artifacts
- no package publish

## Next Lane

- `ALPHA9_OPENCLAW_RUNTIME_MAINTAINER_QUESTION_DELIVERY_METHOD_SOURCE`
