# Alpha9 Controlled Action Runtime Report Plugin-Owned Access UI Component Preview Packet

## 1. Purpose

This packet consolidates the current source-level UI component implementation and demo-render state for review before any release-readiness alignment.

The controlled-action runtime report plugin-owned access UI component preview packet does not mount a live UI, mutate runtime state, call live plugin tools, grant approval, record live decisions, execute actions, write files outside this repo artifact, transmit data externally, publish packages, modify installed plugin files, or restart OpenClaw. It packages source-level preview materials only.

## 2. Current Implementation State

The UI component is implemented as a TypeScript render-spec model, not a mounted React/TSX component.

Top-level component:
- `ControlledActionRuntimeReportDashboard`

Implementation style:
- `typescript_render_spec`

No live UI is mounted.
No runtime state is mutated.
No installed plugin files are changed in this preview packet lane.

## 3. Current Demo Render State

Demo render validation passed for:
- full render model
- compact render model
- ascii_fallback render model
- blocked_capabilities selected panel
- next_safe_step selected panel

Safety flags remain false:
- `executionPerformed=false`
- `approvalGranted=false`
- `recordingPerformed=false`
- `liveDecisionRecorded=false`

## 4. Component Preview Summary

Current preview centers on the render-model output for:
- dashboard shell
- navigation and panel structure
- blocked capability visibility
- next safe step guidance
- ASCII fallback parity

## 5. Full Dashboard Preview

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
├─ RuntimeReportAsciiFallback
└─ RuntimeReportBoundaryFooter
```

## 6. Compact Dashboard Preview

Compact Mode:
1. Header
2. Status Strip
3. Accordion: Active Route
4. Accordion: Safety Evidence Chain
5. Accordion: Blocked Capabilities
6. Accordion: Next Safe Step
7. Hard Boundaries
8. ASCII fallback toggle

## 7. ASCII Fallback Preview

```text
┌──────────────────────────────────────────────────────────────────────┐
│ UMG ENVOY RUNTIME REPORT                                            │
│ Mode: READ-ONLY | Approval: FALSE | Execution: FALSE                │
└──────────────────────────────────────────────────────────────────────┘

ACTIVE ROUTE
- Route: desktop_write_candidate
- Class: bridge_action_candidate
- Risk: high
- Status: blocked

SAFETY EVIDENCE CHAIN
✓ Policy Projection
✓ Dry-run Projection
✓ Readiness Matrix
✓ Audit Packet
✓ Review Bundle
✓ Recording Metadata

BLOCKED CAPABILITIES
✗ Execute Action
✗ Write Files
✗ Bridge Actions
✗ direct_source
✗ Automatic Takeover
✗ Package Publish

NEXT SAFE STEP
Design / inspect only. No approval. No execution. No live recording.
```

## 8. Navigation Preview

Preview navigation targets:
- `overview`
- `active_route`
- `safety_evidence_chain`
- `blocked_capabilities`
- `readiness`
- `audit_and_review`
- `recording_metadata`
- `hard_boundaries`
- `next_safe_step`

## 9. Blocked-Capabilities Panel Preview

Preview confirms:
- blocked capabilities remain visible and explicit
- reasons remain attached to each blocked/off capability
- no action authority is implied

## 10. Next-Safe-Step Panel Preview

Preview confirms:
- safe guidance is represented as a dedicated panel
- current guidance remains:
  - design / inspect only
  - no approval
  - no execution
  - no live recording

## 11. Invalid-Panel Behavior Preview

Preview confirms:
- invalid selected panel falls back to `overview`
- invalid panel notice model is produced
- dashboard render model remains stable

## 12. Safety Flag Preview

Preview confirms false safety flags:
- `executionPerformed=false`
- `approvalGranted=false`
- `recordingPerformed=false`
- `liveDecisionRecorded=false`

## 13. Accessibility Preview

Preview carries forward:
- text + marker status communication
- no color-only reliance
- blocked/off states intended to remain screen-reader readable
- ASCII fallback preserved for terminal/log contexts

## 14. Live CLI Proof Caveat

Direct live CLI invocation proof remains:
- `not_available_from_current_cli_surface`

This preview packet does not claim the component is mounted in OpenClaw UI or callable through a live OpenClaw CLI surface.

## 15. Release-Readiness Notes

Release-adjacent notes:
- source-level UI model exists
- deterministic demo render exists
- no frontend runtime dependency was added
- no runtime/plugin install mutation occurred in this lane
- preview is suitable for review and release-readiness discussion, not for claiming live UI exposure

## 16. Recommended Next Lane

- `ALPHA9_CONTROLLED_ACTION_RUNTIME_REPORT_RELEASE_READINESS_SOURCE`
