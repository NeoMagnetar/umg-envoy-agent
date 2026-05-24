# Alpha9 Controlled Action Runtime Report Plugin-Owned Access UI Component Demo Render

## 1. Purpose

This lane validates deterministic demo-render output for the source-level UI component/render model:
`ControlledActionRuntimeReportDashboard`

The controlled-action runtime report plugin-owned access UI component demo render does not mount a live UI, mutate runtime state, call live plugin tools, grant approval, record live decisions, execute actions, write files outside this repo artifact, transmit data externally, publish packages, modify installed plugin files, or restart OpenClaw. It validates deterministic render-model output only.

## 2. Relationship to UI Component Implementation

This lane exercises the implemented TypeScript render-spec model without introducing a frontend runtime or live UI mount.

## 3. Demo Data Source

Demo data source:
- `controlledActionRuntimeReportDemoViewModel`

Imported from built output:
- `dist/ui/runtime-report-demo-data.js`

## 4. Render Model Generated

Render model generator:
- `buildControlledActionRuntimeReportDashboardRenderModel(...)`

Imported from built output:
- `dist/ui/ControlledActionRuntimeReportDashboard.js`

Top-level component expected:
- `ControlledActionRuntimeReportDashboard`

## 5. Full Mode Demo

Validated behavior:
- `displayMode=full`
- `selectedPanel=overview` by default
- required regions present
- required component descriptors present
- route remains `desktop_write_candidate`
- risk remains `high`
- status remains `blocked`

## 6. Compact Mode Demo

Validated behavior:
- `displayMode=compact`
- same report content
- safety flags remain false
- regions remain available through the render model

## 7. ASCII Fallback Demo

Validated behavior:
- `displayMode=ascii_fallback`
- ASCII fallback remains available
- safety flags remain false
- liveCallProof remains `not_available_from_current_cli_surface`

## 8. Blocked-Capabilities Selected Panel Demo

Validated behavior:
- `selectedPanel=blocked_capabilities`
- render model focuses the blocked capabilities panel
- blocked capability rows remain present
- no action authority implied

## 9. Next-Safe-Step Selected Panel Demo

Validated behavior:
- `selectedPanel=next_safe_step`
- render model focuses the safe guidance panel
- guidance remains read-only and non-executing

## 10. Invalid Panel Behavior

Validated behavior:
- invalid selected panel falls back to `overview`
- invalid panel notice model is present
- dashboard does not crash
- safety flags remain false

## 11. Safety Flag Verification

Verified false in demo render models:
- `executionPerformed=false`
- `approvalGranted=false`
- `recordingPerformed=false`
- `liveDecisionRecorded=false`

## 12. Live CLI Proof Caveat

Direct live CLI invocation proof remains:
- `not_available_from_current_cli_surface`

This demo render must not be described as proof of a live OpenClaw CLI invocation path.

## 13. What This Does Not Prove

- it does not mount a live UI
- it does not prove live CLI invocation
- it does not prove generic OpenClaw `plugin.tools.call`
- it does not execute actions
- it does not approve anything
- it does not record live decisions

## 14. Recommended Next Lane

- `ALPHA9_CONTROLLED_ACTION_RUNTIME_REPORT_PLUGIN_OWNED_ACCESS_UI_COMPONENT_PREVIEW_PACKET_SOURCE`
