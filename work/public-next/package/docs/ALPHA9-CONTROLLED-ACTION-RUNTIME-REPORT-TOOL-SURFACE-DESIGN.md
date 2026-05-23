# Alpha9 Controlled Action Runtime Report Tool Surface Design

## Purpose

This lane defines the future read-only OpenClaw / Envoy tool surface for pulling up the integrated controlled-action runtime report.

## Relationship to runtime report integration

The runtime report integration lane created:
- a structured report object
- a deterministic ASCII/text dashboard
- a navigation model

This design lane defines how a future tool would expose those surfaces without registering the tool yet.

## Future tool name

Preferred future tool name:
- `umg_envoy_controlled_action_runtime_report`

This name is specific, Envoy-scoped, controlled-action-scoped, and report-oriented.

## Future tool input shape

```json
{
  "sleeveId": "optional string",
  "routeId": "optional string",
  "reportMode": "summary | full | ascii_only | structured_only | panel",
  "panel": "overview | active_route | safety_evidence_chain | blocked_capabilities | readiness | audit_and_review | recording_metadata | hard_boundaries | next_safe_step",
  "includeAscii": true,
  "includeNavigation": true,
  "includeStructuredReport": true
}
```

Rules:
- `ascii_only` returns the ASCII/text dashboard plus minimal metadata.
- `structured_only` returns the structured report without requiring the ASCII surface.
- `panel` requires one valid navigation target.
- if no `routeId` is supplied, a future implementation should use the current active route or return incomplete/report-not-found metadata.
- no input may trigger execution, approval, recording, writing, publishing, bridge use, direct_source, or automatic takeover.

## Future tool output shape

```json
{
  "toolName": "umg_envoy_controlled_action_runtime_report",
  "toolSurfaceStatus": "design_only",
  "runtimeReportReturned": true,
  "runtimeReportOnly": true,
  "executionPerformed": false,
  "approvalGranted": false,
  "recordingPerformed": false,
  "liveDecisionRecorded": false,
  "fileWritten": false,
  "externalTransmissionPerformed": false,
  "packagePublished": false,
  "openClawRestarted": false,
  "selectedMode": "full",
  "selectedPanel": null,
  "navigation": [],
  "structuredReport": {},
  "asciiReport": "...",
  "hardBoundaries": {
    "runtimeReportDoesNotEqualExecution": true,
    "toolSurfaceDoesNotEqualExecution": true,
    "toolSurfaceDoesNotEqualApproval": true,
    "toolSurfaceDoesNotEqualRecording": true
  }
}
```

## Supported output modes

- `summary`
- `full`
- `ascii_only`
- `structured_only`
- `panel`
- `navigation_only`

## Navigation targets

- `overview`
- `active_route`
- `safety_evidence_chain`
- `blocked_capabilities`
- `readiness`
- `audit_and_review`
- `recording_metadata`
- `hard_boundaries`
- `next_safe_step`

These targets map directly to the navigation model produced by:
- `buildControlledActionRuntimeReportNavigation`

## Panel selection behavior

A future panel mode should return one panel selected from the integrated report while preserving the same read-only hard boundaries as the full report.

## ASCII report behavior

A future `ascii_only` mode should surface the deterministic text dashboard for quick operator inspection.

## Structured report behavior

A future `structured_only` mode should surface the structured runtime report object for tools, renderers, and higher-level UX layers.

## Blocked operations

The future tool surface must explicitly block:
- `execute_action`
- `approve_action`
- `blocked_grant_approval`
- `record_live_decision`
- `perform_write_action`
- `write_report_file`
- `transmit_report`
- `send_report`
- `publish_package`
- `restart_openclaw`
- `enable_bridge_action`
- `enable_direct_source`
- `enable_automatic_response_takeover`
- `mutate_block_library`
- `touch_resleever`

## Non-approval guarantees

Runtime report tool surface does not equal approval.
Runtime report tool surface does not grant approval.

## Non-recording guarantees

Runtime report tool surface does not equal recording.
Runtime report tool surface does not record live decisions.

## Non-execution guarantees

Runtime report tool surface does not equal execution.
Runtime report tool surface does not execute actions.

The controlled action runtime report tool surface design does not register a live OpenClaw tool, grant approval, record live decisions, execute actions, write files, transmit data, or publish packages. It defines a future read-only report surface only.

## Safety principles

- Policy does not equal execution.
- Approval does not equal execution.
- Checkpoint does not equal execution.
- Dry-run does not equal execution.
- Decision simulation does not equal execution.
- Readiness does not equal execution.
- Trace report does not equal execution.
- Audit packet does not equal execution.
- Audit packet export does not equal execution.
- Review bundle does not equal approval.
- Review bundle does not equal execution.
- Review decision packet does not equal approval.
- Review decision packet does not equal execution.
- Review decision packet projection does not equal approval.
- Review decision packet projection does not equal execution.
- Recording schema does not equal recording.
- Recording projection does not equal recording.
- Recording audit summary does not equal recording.
- Recording review export does not equal recording.
- Recording handoff bundle does not equal recording.
- Recording phase summary does not equal recording.
- Runtime report does not equal approval.
- Runtime report does not equal recording.
- Runtime report does not equal execution.
- Runtime report tool surface does not equal approval.
- Runtime report tool surface does not equal recording.
- Runtime report tool surface does not equal execution.

## Future implementation lane notes

This lane is design only.

It must not:
- register plugin-entry tools
- modify `openclaw.plugin.json`
- wire live tool calls
- add execution authority
- add approval authority
- add recording authority

Recommended next lane after this design checkpoint:
- `ALPHA9_CONTROLLED_ACTION_EXECUTION_RUNTIME_REPORT_TOOL_SURFACE_IMPLEMENTATION_PLAN_SOURCE`
