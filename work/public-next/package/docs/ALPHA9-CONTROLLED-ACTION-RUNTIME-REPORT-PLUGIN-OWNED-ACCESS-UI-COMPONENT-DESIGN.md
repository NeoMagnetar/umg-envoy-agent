# Alpha9 Controlled Action Runtime Report Plugin-Owned Access UI Component Design

## 1. Purpose

This lane defines a future UI component architecture for the controlled-action runtime report plugin-owned access surface.

The controlled-action runtime report plugin-owned access UI component design does not implement UI components, mutate runtime state, call live plugin tools, grant approval, record live decisions, execute actions, write files outside this repo artifact, transmit data externally, publish packages, modify installed plugin files, or restart OpenClaw. It defines a future component architecture for a read-only runtime report surface only.

## 2. Relationship to Visual UI Wireframe

The prior wireframe lane defined the visual structure and layout regions. This lane converts that visual structure into a component system that can later be implemented without re-deciding layout, panel semantics, or safety signaling.

## 3. Component Hierarchy

```text
ControlledActionRuntimeReportDashboard
├─ RuntimeReportHeader
├─ RuntimeReportStatusStrip
├─ RuntimeReportNavigation
├─ RuntimeReportMainGrid
│  ├─ ActiveRouteCard
│  ├─ SafetyEvidenceChainCard
│  ├─ BlockedCapabilitiesCard
│  └─ NextSafeStepCard
├─ RuntimeReportPanelDrawer
│  ├─ ReadinessPanel
│  ├─ AuditAndReviewPanel
│  ├─ RecordingMetadataPanel
│  └─ HardBoundariesPanel
├─ RuntimeReportAsciiFallback
└─ RuntimeReportBoundaryFooter
```

Required top-level component:
- `ControlledActionRuntimeReportDashboard`

Purpose:
- render the full controlled-action runtime report in visual form

## 4. Data / Props Model

Future props:

```ts
interface ControlledActionRuntimeReportDashboardProps {
  report: ControlledActionRuntimeReportViewModel;
  selectedPanel?: RuntimeReportPanelId;
  displayMode?: "full" | "compact" | "ascii_fallback";
  showAsciiFallback?: boolean;
  onPanelSelect?: (panelId: RuntimeReportPanelId) => void;
}
```

Panel id type:

```ts
type RuntimeReportPanelId =
  | "overview"
  | "active_route"
  | "safety_evidence_chain"
  | "blocked_capabilities"
  | "readiness"
  | "audit_and_review"
  | "recording_metadata"
  | "hard_boundaries"
  | "next_safe_step";
```

## 5. Runtime Report State Model

Future view model:

```ts
interface ControlledActionRuntimeReportViewModel {
  reportId: string;
  mode: "read_only";
  approvalGranted: false;
  executionPerformed: false;
  recordingPerformed: false;
  liveDecisionRecorded: false;

  activeRoute: {
    routeId: string;
    routeClass: string;
    riskLevel: "none" | "low" | "medium" | "high" | "critical";
    status: "blocked" | "metadata_only" | "incomplete";
  };

  safetyEvidenceChain: RuntimeReportEvidenceItem[];

  blockedCapabilities: RuntimeReportBlockedCapability[];

  navigation: RuntimeReportNavigationItem[];

  panels: Record<RuntimeReportPanelId, RuntimeReportPanel>;

  asciiReport?: string;

  liveCallProof: "not_available_from_current_cli_surface" | "available" | "unknown";
}
```

Evidence item:

```ts
interface RuntimeReportEvidenceItem {
  id: string;
  label: string;
  status: "complete" | "warning" | "blocked" | "off";
  marker: "✓" | "!" | "✗" | "OFF";
}
```

Blocked capability:

```ts
interface RuntimeReportBlockedCapability {
  id:
    | "execute_action"
    | "write_files"
    | "bridge_actions"
    | "direct_source"
    | "automatic_takeover"
    | "package_publish";
  label: string;
  status: "blocked" | "off";
  reason: string;
}
```

## 6. Layout Regions

Required layout regions:
- `header`
- `status_strip`
- `navigation`
- `active_route`
- `safety_evidence_chain`
- `blocked_capabilities`
- `next_safe_step`
- `panel_drawer`
- `ascii_fallback`
- `boundary_footer`

## 7. Navigation Component

Navigation component:
- `RuntimeReportNavigation`

Navigation targets:
- `overview`
- `active_route`
- `safety_evidence_chain`
- `blocked_capabilities`
- `readiness`
- `audit_and_review`
- `recording_metadata`
- `hard_boundaries`
- `next_safe_step`

Each navigation item should carry:
- label
- panel id
- status
- icon/marker
- short description

## 8. Panel Components

Future panel components:
- `OverviewPanel`
- `ActiveRoutePanel`
- `SafetyEvidenceChainPanel`
- `BlockedCapabilitiesPanel`
- `ReadinessPanel`
- `AuditAndReviewPanel`
- `RecordingMetadataPanel`
- `HardBoundariesPanel`
- `NextSafeStepPanel`

BlockedCapabilitiesPanel detail rows:
- `execute_action`
  - status=`blocked`
  - reason=`No execution lane active.`
- `write_files`
  - status=`blocked`
  - reason=`Write actions disabled.`
- `bridge_actions`
  - status=`blocked`
  - reason=`Bridge actions disabled.`
- `direct_source`
  - status=`off`
  - reason=`direct_source remains disabled.`
- `automatic_takeover`
  - status=`off`
  - reason=`automatic response takeover remains disabled.`
- `package_publish`
  - status=`blocked`
  - reason=`Package publish not performed.`

## 9. Status Marker / Color Model

Use:
- `complete`: green / ✓
- `warning`: yellow / !
- `blocked`: red / ✗
- `off`: gray / OFF
- active route: blue
- policy / governance: purple
- audit / review / evidence: orange

Hard rules:
- Execution is always false/off.
- Approval is always false/off.
- Live recording is always false/off.

## 10. ASCII Fallback Component

Component:
- `RuntimeReportAsciiFallback`

Purpose:
- preserve terminal/log readability
- provide a deterministic fallback when visual rendering is unavailable
- keep parity with the existing ASCII-first demonstration surface

## 11. Compact / Mobile Component Behavior

Compact mode layout:
- Header
- Status strip
- Accordion panels:
  1. Active Route
  2. Safety Evidence Chain
  3. Blocked Capabilities
  4. Next Safe Step
  5. Hard Boundaries
- ASCII fallback toggle

Compact behavior goals:
- keep blocked state highly visible
- avoid horizontal overflow
- keep next safe step reachable without deep navigation

## 12. Accessibility Notes

- Do not rely on color alone.
- Every status must include text label and icon/marker.
- Blocked/off states must be readable by screen readers.
- ASCII fallback should remain available for terminal/log contexts.
- Panel navigation should be keyboard-addressable in future UI.

## 13. Error / Invalid Panel Component Behavior

If `selectedPanel` is invalid:
- render `InvalidPanelNotice`
- show allowed panels
- do not crash dashboard
- `executionPerformed` remains false
- `approvalGranted` remains false
- `recordingPerformed` remains false

## 14. Future Implementation Files

For a later implementation lane, proposed files may include:
- `src/ui/ControlledActionRuntimeReportDashboard.tsx`
- `src/ui/runtime-report-view-model.ts`
- `src/ui/runtime-report-components.tsx`
- `src/ui/runtime-report-status-model.ts`
- `docs/ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-PLUGIN-OWNED-ACCESS-UI-COMPONENT-IMPLEMENTATION.md`
- `scripts/alpha9-controlled-action-runtime-report-plugin-owned-access-ui-component-implementation-smoke.mjs`

This design lane does not create those files.

## 15. Future Test Plan

Future implementation tests should prove:
- top-level dashboard renders with valid view model
- panel selection updates focused content
- blocked capability rows render exact reasons
- compact mode layout renders accordions correctly
- ASCII fallback renders when enabled
- invalid panel renders notice without crash
- all status states show icon + label + accessible text
- execution/approval/recording flags remain visually false/off

## 16. Live CLI Proof Caveat

This component design is based on source-validated and locally installed plugin-owned access behavior.

Direct live CLI invocation proof remains:
- `not_available_from_current_cli_surface`

Therefore, the design must not claim that live OpenClaw CLI invocation has been proven.

## 17. Safety Boundary Summary

- no UI implementation
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

## 18. Recommended Next Lane

- `ALPHA9_CONTROLLED_ACTION_RUNTIME_REPORT_PLUGIN_OWNED_ACCESS_UI_COMPONENT_IMPLEMENTATION_PLAN_SOURCE`
