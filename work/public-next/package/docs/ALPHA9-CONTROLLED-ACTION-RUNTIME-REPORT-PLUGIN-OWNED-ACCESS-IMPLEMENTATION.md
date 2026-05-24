# Alpha9 Controlled Action Runtime Report Plugin-Owned Access Implementation

## Purpose

This lane implements an Envoy-owned read-only access surface for `umg_envoy_controlled_action_runtime_report` without patching OpenClaw core or depending on a generic plugin tool call protocol.

The controlled-action runtime report plugin-owned access implementation exposes a read-only report access surface owned by UMG Envoy. It does not patch OpenClaw core, grant approval, record live decisions, execute actions, write files, transmit data, publish packages, or mutate runtime state outside the Envoy plugin source.

## Relationship to Plugin-Owned Access Design

This implementation follows the design lane decision to prefer a plugin-owned access surface over a generic OpenClaw core protocol patch. The design-preferred future method name remains `umg.envoy.controlledActionRuntimeReport`.

## Relationship to Implementation Plan

This implementation follows the plan lane by delivering the narrowest local access surface first. In current plugin structure, the clearest supported registration path is a plugin-owned tool plus plugin-owned CLI command, while preserving the preferred future Gateway method shape in metadata and docs.

## Implemented Access Surface

Implemented local access surfaces:
- tool: `umg_envoy_controlled_action_runtime_report_access`
- CLI command: `openclaw umg-envoy runtime-report`

Preferred future method label preserved in output metadata:
- `umg.envoy.controlledActionRuntimeReport`

## Input Contract

Supported input:
- `reportMode?: "summary" | "full" | "ascii_only" | "structured_only" | "navigation_only" | "panel"`
- `panel?: "overview" | "active_route" | "safety_evidence_chain" | "blocked_capabilities" | "readiness" | "audit_and_review" | "recording_metadata" | "hard_boundaries" | "next_safe_step"`
- `includeAscii?: boolean`
- `includeNavigation?: boolean`
- `includeStructuredReport?: boolean`
- `reportInput?: unknown`
- `sleeveId?: string`
- `routeId?: string`

Defaults:
- `reportMode=full`
- `includeAscii=true` unless `structured_only` or `navigation_only`
- `includeNavigation=true` unless `ascii_only`
- `includeStructuredReport=true` unless `ascii_only` or `navigation_only`

## Output Contract

Every result includes:
- `toolMode: "read_only_report_preview"` inside the underlying result payload
- `runtimeReportOnly=true`
- `toolSurfaceReadOnly=true`
- `executionPerformed=false`
- `approvalGranted=false`
- `recordingPerformed=false`
- `liveDecisionRecorded=false`
- `fileWritten=false`
- `externalTransmissionPerformed=false`
- `packagePublished=false`
- `directSourceEnabled=false`
- `automaticResponseTakeoverEnabled=false`

The plugin-owned access wrapper also returns:
- `accessSurface: "plugin_owned_envoy_access"`
- `preferredGatewayMethod: "umg.envoy.controlledActionRuntimeReport"`
- `currentToolName: "umg_envoy_controlled_action_runtime_report_access"`
- `currentCliCommand: "openclaw umg-envoy runtime-report"`

## Supported Modes

Supported modes:
- `full`
- `summary`
- `ascii_only`
- `structured_only`
- `navigation_only`
- `panel`

## Supported Panels

Supported panels:
- `overview`
- `active_route`
- `safety_evidence_chain`
- `blocked_capabilities`
- `readiness`
- `audit_and_review`
- `recording_metadata`
- `hard_boundaries`
- `next_safe_step`

## Invalid Input Behavior

If `panel` mode is selected without a valid supported panel, the surface returns a bounded `validationError` and does not throw an uncaught exception.

## Missing Data Behavior

If explicit report input is missing, the surface returns safe incomplete/report-preview metadata. It does not scan arbitrary files, call external services, or execute commands.

## Read-Only Guarantees

- no OpenClaw core patch
- no generic `plugin.tools.call` implementation
- no file writes from the report surface
- no external transmission
- no package publish
- no bridge actions
- no direct_source enablement
- no automatic takeover enablement

## Non-Approval Guarantees

- approval state is always reported as false
- tool access does not grant approval
- tool access does not imply approval eligibility

## Non-Recording Guarantees

- recording state is always reported as false
- live decision recording is always false
- metadata preview does not become recording authority

## Non-Execution Guarantees

- execution state is always reported as false
- the access surface does not dispatch actions
- the access surface is report-only

## Future Installed-Runtime Verification Plan

After implementation, installed-runtime verification should be:
1. build source
2. back up installed plugin files
3. promote only required dist outputs to `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`
4. restart OpenClaw gateway
5. call the Envoy-owned access surface
6. verify all read-only flags remain false for side effects
