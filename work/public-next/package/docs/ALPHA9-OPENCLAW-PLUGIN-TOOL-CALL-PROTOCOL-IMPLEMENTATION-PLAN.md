# Alpha9 OpenClaw Plugin Tool Call Protocol Implementation Plan

## Current Baseline

- protocol design commit: `cd667c9c80a61f57b00dd8e32cde5e28ffdf7df9`
- corrected protocol escalation commit: `5414646c67b5a85a0befbe25c4fda888ccb1947e`
- source tool commit: `0b4442125ebe3a9d4e818c0bc92ec4d8ca6d0743`
- target plugin: `umg-envoy-agent`
- target tool: `umg_envoy_controlled_action_runtime_report`
- active plugin path: `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`

## Protocol Methods To Implement Later

Future methods:
- `plugin.tools.list`
- `plugin.tools.inspect`
- `plugin.tools.call`

Each should remain:
- noninteractive
- JSON request/response
- local gateway scoped
- read-only by default
- explicit about safety metadata

## Candidate Implementation Locations

Candidate OpenClaw areas for a future implementation lane:
- CLI gateway call path
- gateway RPC method registry
- plugin registry / manifest registry
- tool routing layer
- control UI RPC layer if relevant

If exact files require tighter confirmation, future implementation target requires OpenClaw source inspection.

## Future Request Envelope

```json
{
  "id": "req-001",
  "method": "plugin.tools.call",
  "params": {
    "pluginId": "umg-envoy-agent",
    "toolName": "umg_envoy_controlled_action_runtime_report",
    "input": {
      "reportMode": "navigation_only"
    }
  }
}
```

## Future Response Envelope

### Success

```json
{
  "id": "req-001",
  "ok": true,
  "result": {
    "toolName": "umg_envoy_controlled_action_runtime_report",
    "toolMode": "read_only_report_preview",
    "executionPerformed": false,
    "approvalGranted": false,
    "recordingPerformed": false
  }
}
```

### Error

```json
{
  "id": "req-001",
  "ok": false,
  "error": {
    "code": "tool_not_found",
    "message": "Tool was not found for plugin."
  },
  "safety": {
    "executionPerformed": false,
    "approvalGranted": false,
    "recordingPerformed": false
  }
}
```

## Read-Only Enforcement Plan

The future implementation must enforce:
- `plugin.tools.call` can only call tools marked `readOnly=true` by default
- actionCapable tools must be rejected unless a future approval protocol exists
- write-capable tools must be rejected
- bridge-capable tools must be rejected
- external-transmission tools must be rejected

Required rejection codes:
- `tool_not_read_only`
- `requires_approval_not_supported`
- `action_tool_blocked`
- `write_tool_blocked`
- `bridge_tool_blocked`
- `external_transmission_blocked`

## Metadata Requirements

Every listed/inspected tool should expose:

```json
{
  "name": "umg_envoy_controlled_action_runtime_report",
  "pluginId": "umg-envoy-agent",
  "mode": "read_only_report_preview",
  "readOnly": true,
  "actionCapable": false,
  "requiresApproval": false,
  "mayWriteFiles": false,
  "mayExecuteCommands": false,
  "mayUseBridgeActions": false,
  "mayTransmitExternally": false,
  "mayMutateBlockLibrary": false
}
```

## CLI Wrapper Plan

Future CLI wrappers:
- `openclaw plugin-tools list --plugin umg-envoy-agent --json`
- `openclaw plugin-tools inspect --plugin umg-envoy-agent --tool umg_envoy_controlled_action_runtime_report --json`
- `openclaw plugin-tools call --plugin umg-envoy-agent --tool umg_envoy_controlled_action_runtime_report --input-json "{...}"`

Gateway-call equivalents:
- `openclaw gateway call plugin.tools.list --json "{...}"`
- `openclaw gateway call plugin.tools.inspect --json "{...}"`
- `openclaw gateway call plugin.tools.call --json "{...}"`

## Future Allowed Files

For the future implementation lane only, proposed allowed files may include:
- OpenClaw protocol / CLI files, only if working inside OpenClaw codebase
- Envoy docs for integration
- test harness scripts
- no Envoy runtime mutation unless needed to add metadata compatibility

Potential Envoy-side files:
- `docs/ALPHA9-OPENCLAW-PLUGIN-TOOL-CALL-PROTOCOL-IMPLEMENTATION.md`
- `scripts/alpha9-openclaw-plugin-tool-call-protocol-implementation-smoke.mjs`
- `fixtures/action-gates/openclaw-plugin-tool-call-protocol-implementation-v1.json`

Current plan lane must not modify implementation files.

## Future Test Requirements

Future implementation smokes must prove:
- `plugin.tools.list` returns loaded tools
- `plugin.tools.inspect` returns target tool metadata
- `plugin.tools.call` can invoke read-only target tool
- `navigation_only` call works
- `ascii_only` call works
- `structured_only` call works
- `panel` call works
- invalid panel returns safe error
- action-capable dummy tool is rejected
- write-capable dummy tool is rejected
- no execution / approval / recording / writes occur

## Deferred Work

Explicitly defer:
- implementing protocol in this lane
- changing OpenClaw runtime
- changing Envoy runtime
- live tool invocation
- approval protocol
- action execution
- write actions
- bridge actions
- package publish
- OpenClaw restart

## Principle

The OpenClaw plugin tool call protocol implementation plan does not implement a live protocol, call plugin tools, grant approval, record live decisions, execute actions, write files, transmit data, publish packages, or mutate runtime state. It defines a future implementation path only.
