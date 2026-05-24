# Alpha9 OpenClaw Plugin Tool Call Protocol Design

## Purpose

This protocol design defines a future supported, noninteractive way to discover and invoke loaded OpenClaw plugin tools for verification and read-only automation.

## Relationship to protocol research

The protocol research lane established that the installed OpenClaw CLI/runtime surface did not expose a proven supported noninteractive path for plugin-tool discovery or invocation.

## Relationship to escalation report

The escalation report concluded that the remaining blocker is protocol-level rather than source/plugin/runtime-state level. This design lane defines the minimal future contract needed to close that gap safely.

## Target use case

Immediate target tool:
- `umg_envoy_controlled_action_runtime_report`

Tool class:
- `read_only_report_preview`

The protocol should make it possible to:
- list loaded plugins
- list tools exposed by a loaded plugin
- inspect tool metadata
- invoke a read-only tool by name
- pass JSON input
- receive structured JSON output
- return safe validation errors

## Proposed protocol surface

Recommended methods:
- `plugin.tools.list`
- `plugin.tools.inspect`
- `plugin.tools.call`

Alternative gateway-style names if OpenClaw prefers namespacing:
- `gateway.pluginTools.list`
- `gateway.pluginTools.inspect`
- `gateway.pluginTools.call`

Recommended names remain:
- `plugin.tools.list`
- `plugin.tools.inspect`
- `plugin.tools.call`

Reason:
- clear
- plugin-scoped
- tool-scoped
- non-ambiguous

## Proposed Method: plugin.tools.list

### Request

```json
{
  "id": "req-001",
  "method": "plugin.tools.list",
  "params": {
    "pluginId": "umg-envoy-agent",
    "includeMetadata": true
  }
}
```

### Response

```json
{
  "id": "req-001",
  "ok": true,
  "result": {
    "pluginId": "umg-envoy-agent",
    "pluginVersion": "0.3.0-alpha.12",
    "tools": [
      {
        "name": "umg_envoy_controlled_action_runtime_report",
        "mode": "read_only_report_preview",
        "readOnly": true,
        "actionCapable": false,
        "requiresApproval": false
      }
    ]
  }
}
```

Rule:
- listing tools must not invoke tools

## Proposed Method: plugin.tools.inspect

### Request

```json
{
  "id": "req-002",
  "method": "plugin.tools.inspect",
  "params": {
    "pluginId": "umg-envoy-agent",
    "toolName": "umg_envoy_controlled_action_runtime_report"
  }
}
```

### Response

```json
{
  "id": "req-002",
  "ok": true,
  "result": {
    "pluginId": "umg-envoy-agent",
    "toolName": "umg_envoy_controlled_action_runtime_report",
    "mode": "read_only_report_preview",
    "readOnly": true,
    "supportedModes": [
      "summary",
      "full",
      "ascii_only",
      "structured_only",
      "navigation_only",
      "panel"
    ],
    "supportedPanels": [
      "overview",
      "active_route",
      "safety_evidence_chain",
      "blocked_capabilities",
      "readiness",
      "audit_and_review",
      "recording_metadata",
      "hard_boundaries",
      "next_safe_step"
    ],
    "executionPerformed": false,
    "approvalGranted": false,
    "recordingPerformed": false
  }
}
```

Rule:
- inspecting a tool must not invoke the tool

## Proposed Method: plugin.tools.call

### Request

```json
{
  "id": "req-003",
  "method": "plugin.tools.call",
  "params": {
    "pluginId": "umg-envoy-agent",
    "toolName": "umg_envoy_controlled_action_runtime_report",
    "input": {
      "reportMode": "navigation_only",
      "includeAscii": false,
      "includeNavigation": true,
      "includeStructuredReport": false
    }
  }
}
```

### Response

```json
{
  "id": "req-003",
  "ok": true,
  "result": {
    "toolName": "umg_envoy_controlled_action_runtime_report",
    "toolMode": "read_only_report_preview",
    "runtimeReportReturned": true,
    "executionPerformed": false,
    "approvalGranted": false,
    "recordingPerformed": false,
    "liveDecisionRecorded": false,
    "fileWritten": false,
    "externalTransmissionPerformed": false,
    "packagePublished": false
  }
}
```

Rule:
- calling a read-only tool may return data but must not mutate external state

## Safety metadata

Every tool record should include:

```json
{
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

Every call response should include:

```json
{
  "executionPerformed": false,
  "approvalGranted": false,
  "recordingPerformed": false,
  "liveDecisionRecorded": false,
  "fileWritten": false,
  "externalTransmissionPerformed": false,
  "packagePublished": false,
  "directSourceEnabled": false,
  "automaticResponseTakeoverEnabled": false
}
```

## Error handling

Safe errors:
- `plugin_not_found`
- `tool_not_found`
- `invalid_tool_input`
- `invalid_report_mode`
- `invalid_panel`
- `tool_not_read_only`
- `tool_call_not_supported`
- `tool_protocol_disabled`
- `permission_denied`
- `internal_error`

### Example error

```json
{
  "id": "req-004",
  "ok": false,
  "error": {
    "code": "invalid_panel",
    "message": "Panel is not supported.",
    "details": {
      "allowedPanels": [
        "overview",
        "active_route",
        "safety_evidence_chain",
        "blocked_capabilities",
        "readiness",
        "audit_and_review",
        "recording_metadata",
        "hard_boundaries",
        "next_safe_step"
      ]
    }
  },
  "safety": {
    "executionPerformed": false,
    "approvalGranted": false,
    "recordingPerformed": false
  }
}
```

## Authentication / permission expectations

The design assumes:
- local gateway must require existing OpenClaw local auth/session rules
- external network exposure is not introduced
- `plugin.tools.call` must only permit tools declared read-only unless a future approval/action protocol exists
- action-capable tools must return `tool_not_read_only` or `requires_approval_not_supported` in this design

## Noninteractive CLI wrapper proposal

Future CLI wrappers:
- `openclaw plugin-tools list --plugin umg-envoy-agent --json`
- `openclaw plugin-tools inspect --plugin umg-envoy-agent --tool umg_envoy_controlled_action_runtime_report --json`
- `openclaw plugin-tools call --plugin umg-envoy-agent --tool umg_envoy_controlled_action_runtime_report --input-json "{...}"`

Alternative gateway-style wrappers:
- `openclaw gateway call plugin.tools.list --json "{...}"`
- `openclaw gateway call plugin.tools.inspect --json "{...}"`
- `openclaw gateway call plugin.tools.call --json "{...}"`

Recommended eventual outcome:
- support both protocol-level gateway methods and ergonomic CLI wrappers

## Blocked operations

This protocol must block:
- `execute_action`
- `blocked_grant_approval`
- `record_live_decision`
- `perform_write_action`
- `enable_bridge_action`
- `enable_direct_source`
- `enable_automatic_response_takeover`
- `mutate_block_library`
- `touch_resleever`
- `publish_package`
- `restart_openclaw_from_tool_call`
- `external_transmission`

## Future implementation notes

- keep the first implementation read-only only
- make list/inspect/call behavior explicit and separate
- do not allow implicit fallback into action-capable surfaces
- prefer structured JSON-first responses with explicit safety metadata
- keep validation errors safe and non-mutating

## Principle

The OpenClaw plugin tool call protocol design does not implement a live protocol, call plugin tools, grant approval, record live decisions, execute actions, write files, transmit data, publish packages, or mutate runtime state. It defines a future supported discovery/invocation contract only.
