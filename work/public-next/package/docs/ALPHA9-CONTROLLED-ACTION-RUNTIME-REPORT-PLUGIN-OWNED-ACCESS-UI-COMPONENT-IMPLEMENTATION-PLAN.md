# Alpha9 Controlled Action Runtime Report Plugin-Owned Access UI Component Implementation Plan

## 1. Purpose

This lane defines the concrete future implementation path for the UI component:
`ControlledActionRuntimeReportDashboard`

The controlled-action runtime report plugin-owned access UI component implementation plan does not implement UI components, mutate runtime state, call live plugin tools, grant approval, record live decisions, execute actions, write files outside this repo artifact, transmit data externally, publish packages, modify installed plugin files, or restart OpenClaw. It defines a future UI component implementation path only.

## 2. Relationship to UI Component Design

The previous design lane defined the target component architecture, props, view model, layout regions, panel set, accessibility expectations, and safety semantics. This plan translates that design into a practical implementation sequence.

## 3. Implementation Scope

Planned implementation scope:
- add UI-facing types and view-model adapter
- add status/color model helpers
- add demo data fixture for local rendering
- add small presentational cards
- add the top-level dashboard component
- add ASCII fallback component
- add invalid panel notice
- add smoke/static validation for UI exports and structure

Out of scope for the first implementation:
- external data fetching
- runtime mutation
- OpenClaw core patching
- installed plugin changes
- live CLI invocation proof

## 4. Future Component Files

The future implementation lane should propose these files:
- `src/ui/ControlledActionRuntimeReportDashboard.tsx`
- `src/ui/runtime-report-view-model.ts`
- `src/ui/runtime-report-components.tsx`
- `src/ui/runtime-report-status-model.ts`
- `src/ui/runtime-report-demo-data.ts`
- `docs/ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-PLUGIN-OWNED-ACCESS-UI-COMPONENT-IMPLEMENTATION.md`
- `scripts/alpha9-controlled-action-runtime-report-plugin-owned-access-ui-component-implementation-smoke.mjs`

If the repo does not currently have a `src/ui/` convention, the implementation lane should first inspect repo structure and either:
- create `src/ui/` if acceptable, or
- use the closest existing UI/component directory, or
- stop and report blocked if no UI/component layer exists

## 5. Component Responsibility Map

`ControlledActionRuntimeReportDashboard`:
- top-level composition component
- receives view model
- controls selected panel
- selects full/compact/ascii fallback display

`RuntimeReportHeader`:
- title
- read-only mode
- approval/execution/recording status flags

`RuntimeReportStatusStrip`:
- compact row of major safety flags

`RuntimeReportNavigation`:
- renders navigation targets
- sends selected panel callback

`RuntimeReportMainGrid`:
- desktop layout wrapper

`ActiveRouteCard`:
- route id, class, risk, status

`SafetyEvidenceChainCard`:
- policy/dry-run/readiness/audit/review/recording evidence

`BlockedCapabilitiesCard`:
- execute/write/bridge/direct_source/automatic takeover/package publish blocked rows

`NextSafeStepCard`:
- recommended next safe step and boundary reminders

`RuntimeReportPanelDrawer`:
- renders selected detailed panel

`RuntimeReportAsciiFallback`:
- terminal/log-friendly report view

`RuntimeReportBoundaryFooter`:
- hard non-execution / non-approval / non-recording summary

## 6. View-Model Adapter Plan

The future implementation should convert existing runtime report output into UI view model.

Input source:
- `ControlledActionRuntimeReport`

Adapter output:
- `ControlledActionRuntimeReportViewModel`

Required adapter behavior:
- normalize missing fields
- preserve false safety flags
- preserve liveCallProof caveat
- ensure blocked capabilities are always present
- ensure invalid/missing panel never crashes UI
- ensure ASCII fallback is available when `asciiReport` exists

## 7. Rendering Sequence

Recommended rendering sequence:
1. resolve / normalize input report into UI view model
2. render dashboard shell
3. render header + status strip
4. render navigation targets
5. render main grid cards
6. render panel drawer when selected
7. render boundary footer
8. optionally render ASCII fallback in compact or fallback mode

## 8. Panel Implementation Sequence

Recommended future order:
1. `OverviewPanel`
2. `ActiveRoutePanel`
3. `SafetyEvidenceChainPanel`
4. `BlockedCapabilitiesPanel`
5. `NextSafeStepPanel`
6. `ReadinessPanel`
7. `AuditAndReviewPanel`
8. `RecordingMetadataPanel`
9. `HardBoundariesPanel`
10. `InvalidPanelNotice`

This sequence front-loads the panels that map directly to the current demo and wireframe.

## 9. Status / Color Implementation Plan

Implement a shared status model:
- `complete` → green / ✓
- `warning` → yellow / !
- `blocked` → red / ✗
- `off` → gray / OFF
- route metadata → blue
- policy/governance → purple
- audit/review/evidence → orange

Hard UI rules:
- execution stays false/off
- approval stays false/off
- live recording stays false/off

## 10. Accessibility Implementation Plan

Implementation requirements:
- do not rely on color alone
- include text label and marker for every state
- provide readable blocked/off text for screen readers
- make navigation keyboard-addressable
- keep ASCII fallback available for terminal/log contexts
- ensure invalid panel notice is announced clearly

## 11. Compact / Mobile Implementation Plan

Compact mode should render:
- Header
- Status strip
- Accordion panels:
  1. Active Route
  2. Safety Evidence Chain
  3. Blocked Capabilities
  4. Next Safe Step
  5. Hard Boundaries
- ASCII fallback toggle

Implementation guidance:
- keep blocked state visible above fold
- avoid horizontal-only navigation
- keep next safe step pinned or easily reachable

## 12. Error / Invalid Panel Behavior

If `selectedPanel` is invalid:
- render `InvalidPanelNotice`
- show allowed panels
- do not crash dashboard
- `executionPerformed` remains false
- `approvalGranted` remains false
- `recordingPerformed` remains false

## 13. Future Smoke / Test Plan

Future smoke should verify:
- component files exist
- top-level component export exists
- view model type/model exists
- demo data exists
- supported panels are represented
- blocked capabilities are represented
- safety flags default false
- liveCallProof caveat represented
- no forbidden authority wording

If a React build/test stack exists, use it. If not, use static export/file-content validation only.

## 14. Live CLI Proof Caveat

This implementation plan is based on source-validated and locally installed plugin-owned access behavior.

Direct live CLI invocation proof remains:
- `not_available_from_current_cli_surface`

Therefore, the plan must not claim that live OpenClaw CLI invocation has been proven.

## 15. Safety Boundary Summary

- no UI implementation in this lane
- no runtime mutation
- no installed plugin changes
- no gateway restart
- no live tool call
- no execution
- no approval
- no live recording
- no writes outside repo artifact
- no external transmission
- no package publish

## 16. Recommended Next Lane

- `ALPHA9_CONTROLLED_ACTION_RUNTIME_REPORT_PLUGIN_OWNED_ACCESS_UI_COMPONENT_IMPLEMENTATION_SOURCE`
