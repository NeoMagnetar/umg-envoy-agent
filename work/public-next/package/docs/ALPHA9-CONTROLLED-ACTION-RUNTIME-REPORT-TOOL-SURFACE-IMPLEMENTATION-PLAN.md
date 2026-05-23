# Alpha9 Controlled Action Runtime Report Tool Surface Implementation Plan

## Purpose

This lane defines the future implementation path for wiring the read-only OpenClaw / Envoy tool:
- `umg_envoy_controlled_action_runtime_report`

## Relationship to runtime report integration

The runtime report integration lane created the integrated report object, ASCII renderer, and navigation model.

## Relationship to tool surface design

The tool surface design lane defined the future tool contract. This implementation-plan lane turns that design into a concrete future implementation checklist without registering the tool yet.

## Future tool name

- `umg_envoy_controlled_action_runtime_report`

## Future input contract

```json
{
  "sleeveId": "optional string",
  "routeId": "optional string",
  "reportMode": "summary | full | ascii_only | structured_only | panel | navigation_only",
  "panel": "overview | active_route | safety_evidence_chain | blocked_capabilities | readiness | audit_and_review | recording_metadata | hard_boundaries | next_safe_step",
  "includeAscii": true,
  "includeNavigation": true,
  "includeStructuredReport": true
}
```

## Future output contract

```json
{
  "toolName": "umg_envoy_controlled_action_runtime_report",
  "toolMode": "read_only_report_preview",
  "runtimeReportReturned": true,
  "selectedMode": "full",
  "selectedPanel": null,
  "navigation": [],
  "structuredReport": {},
  "asciiReport": "...",
  "executionPerformed": false,
  "approvalGranted": false,
  "recordingPerformed": false,
  "liveDecisionRecorded": false,
  "fileWritten": false,
  "externalTransmissionPerformed": false,
  "packagePublished": false
}
```

## Future output modes

- `summary`
- `full`
- `ascii_only`
- `structured_only`
- `panel`
- `navigation_only`

## Future navigation targets

- `overview`
- `active_route`
- `safety_evidence_chain`
- `blocked_capabilities`
- `readiness`
- `audit_and_review`
- `recording_metadata`
- `hard_boundaries`
- `next_safe_step`

## Future helper calls

The later implementation lane should reuse:
- `projectControlledActionRuntimeReport`
- `renderControlledActionRuntimeReportAscii`
- `buildControlledActionRuntimeReportNavigation`

## Future implementation files

These may be modified only in the later implementation lane, not this planning lane:
- `src/plugin-entry.ts`
- `src/controlled-action-runtime-report-integration.ts`
- `scripts/alpha9-controlled-action-runtime-report-tool-surface-implementation-smoke.mjs`
- `docs/ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-TOOL-SURFACE-IMPLEMENTATION.md`
- `dist/plugin-entry.js`
- `dist/plugin-entry.d.ts`
- `openclaw.plugin.json` only if tool metadata must be declared there

## Future validation requirements

The future implementation lane must prove:
- tool is read-only
- tool returns `runtimeReportOnly=true`
- tool returns `executionPerformed=false`
- tool returns `approvalGranted=false`
- tool returns `recordingPerformed=false`
- tool returns `fileWritten=false`
- tool returns `externalTransmissionPerformed=false`
- `ascii_only` mode works
- `structured_only` mode works
- `navigation_only` mode works
- `panel` mode works for every navigation target
- invalid panel returns safe validation-error metadata
- no execution/approval/recording wording appears

## Blocked operations

The future tool implementation must continue blocking:
- `execute_action`
- `approve_action`
- `blocked_grant_approval`
- `record_live_decision`
- `perform_write_action`
- `write_report_file`
- `transmit_report`
- `publish_package`
- `restart_openclaw`
- `enable_bridge_action`
- `enable_direct_source`
- `enable_automatic_response_takeover`
- `mutate_block_library`
- `touch_resleever`

## Deferred work

Deferred to the later implementation lane:
- plugin-entry wiring
- any manifest declaration if required
- per-mode response shaping
- panel-selection request validation
- invalid-panel safe error metadata
- final read-only tool smoke coverage

## Non-implementation guarantee

This lane does not implement the live tool.

## Non-approval guarantee

This lane does not grant approval.

## Non-recording guarantee

This lane does not record live decisions.

## Non-execution guarantee

This lane does not execute actions.

The controlled action runtime report tool surface implementation plan does not register a live OpenClaw tool, grant approval, record live decisions, execute actions, write files, transmit data, publish packages, or restart OpenClaw. It defines a future read-only implementation path only.

## Recommended next lane

- `ALPHA9_CONTROLLED_ACTION_EXECUTION_RUNTIME_REPORT_TOOL_SURFACE_IMPLEMENTATION_SOURCE`
