# Alpha9 Controlled Action Runtime Report Plugin-Owned Access Visual UI Wireframe

## 1. Purpose

This lane defines a visual/UI wireframe for the controlled-action runtime report plugin-owned access surface.

The controlled-action runtime report plugin-owned access visual UI wireframe does not mutate runtime state, call live plugin tools, grant approval, record live decisions, execute actions, write files outside this repo artifact, transmit data externally, publish packages, modify installed plugin files, or restart OpenClaw. It defines a visual design for a read-only runtime report surface only.

## 2. Design Goal

Translate the current ASCII dashboard into a structured visual layout that could later become:
- an OpenClaw UI panel
- a UMG runtime dashboard
- a command center card
- a navigable report workspace

## 3. Current Proof State

This wireframe is based on source-validated and locally installed plugin-owned access behavior.

Direct live CLI invocation proof remains:
- `not_available_from_current_cli_surface`

Therefore, this wireframe must not claim that live OpenClaw CLI invocation has been proven.

## 4. Primary Screen: Runtime Report Dashboard

Primary layout:

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ UMG ENVOY RUNTIME REPORT                                                │
│ Mode: READ-ONLY | Approval: FALSE | Execution: FALSE | Recording: OFF   │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐ ┌──────────────────────────┐ ┌──────────────────────┐
│ ACTIVE ROUTE         │ │ SAFETY EVIDENCE CHAIN    │ │ BLOCKED CAPABILITIES │
│ Route ID             │ │ Policy Projection ✓      │ │ Execute Action ✗     │
│ Route Class          │ │ Dry-run Projection ✓     │ │ Write Files ✗        │
│ Risk Level           │ │ Readiness Matrix ✓       │ │ Bridge Actions ✗     │
│ Status               │ │ Audit Packet ✓           │ │ direct_source ✗      │
│                      │ │ Review Bundle ✓          │ │ Auto Takeover ✗      │
│                      │ │ Recording Metadata ✓     │ │ Package Publish ✗    │
└──────────────────────┘ └──────────────────────────┘ └──────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ NEXT SAFE STEP                                                          │
│ Design / inspect only. No approval. No execution. No live recording.   │
└──────────────────────────────────────────────────────────────────────────┘
```

## 5. Header Area

Header contents:
- title: `UMG ENVOY RUNTIME REPORT`
- status strip: `Mode: READ-ONLY | Approval: FALSE | Execution: FALSE | Recording: OFF`
- optional metadata chips:
  - route id
  - risk level
  - report mode
  - timestamp / report freshness

Header intent:
- immediately communicate that the surface is non-executing and non-approving
- prevent users from mistaking the screen for an action console

## 6. Left Panel: Active Route

Card title:
- `ACTIVE ROUTE`

Fields:
- Route ID
- Route Class
- Risk Level
- Status

Suggested values for current demo scenario:
- Route ID: `desktop_write_candidate`
- Route Class: `bridge_action_candidate`
- Risk Level: `high`
- Status: `blocked`

Visual semantics:
- route metadata uses blue accents
- risk / blocked status uses red highlight

## 7. Center Panel: Safety Evidence Chain

Card title:
- `SAFETY EVIDENCE CHAIN`

Rows:
- Policy Projection ✓
- Dry-run Projection ✓
- Readiness Matrix ✓
- Audit Packet ✓
- Review Bundle ✓
- Recording Metadata ✓

Intent:
- show why the route is understood and bounded
- show that evidence exists even when execution remains blocked

## 8. Right Panel: Blocked Capabilities

Card title:
- `BLOCKED CAPABILITIES`

Rows:
- Execute Action ✗
- Write Files ✗
- Bridge Actions ✗
- direct_source ✗
- Auto Takeover ✗
- Package Publish ✗

Intent:
- make current hard boundaries visible at a glance
- prevent confusion between report visibility and action authority

## 9. Bottom Panel: Next Safe Step

Bar title:
- `NEXT SAFE STEP`

Primary message:
- `Design / inspect only. No approval. No execution. No live recording.`

Intent:
- turn the report from passive status into guidance
- keep the user inside the safe lane

## 10. Navigation / Sidebar Model

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

Each navigation item should have:
- label
- panel id
- status
- icon/marker
- short description

Suggested sidebar model:
- top: Overview
- middle: route / evidence / capability sections
- bottom: boundaries / next step

## 11. Panel Drilldown Model

Drilldown behavior later:
- selecting a panel opens a focused card/workspace view
- focused view shows explanation, status, and boundaries
- drilldown never implies action enablement

Example drilldown: `blocked_capabilities`
- opens blocked capabilities panel
- shows each blocked capability
- shows reason
- shows whether a future lane could enable it
- shows current boundary flag

Blocked capability drilldown rows:
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

## 12. Status / Color Semantics

Recommended visual semantics:
- green / ✓:
  - present, complete, safe evidence
- yellow / !:
  - warning, incomplete, needs review
- red / ✗:
  - blocked capability, not allowed
- gray / OFF:
  - disabled / unavailable / intentionally off
- blue:
  - active route / report metadata
- purple:
  - policy / governance / approval metadata
- orange:
  - review / audit / evidence layer

Must remain true in UI:
- Execution is always red/off.
- Approval is always false/off.
- Live recording is always false/off.

## 13. ASCII-to-Visual Mapping

Mapping:
- ASCII Header → Dashboard Header
- ACTIVE ROUTE → Left Route Card
- SAFETY EVIDENCE CHAIN → Center Evidence Card
- BLOCKED CAPABILITIES → Right Blocked Card
- NEXT SAFE STEP → Bottom Action/Guidance Bar

This mapping preserves the meaning of the current report while making it easier to scan visually.

## 14. Mobile / Compact Mode

Compact mode layout:
- Header
- Status summary strip
- Accordion:
  1. Active Route
  2. Safety Evidence Chain
  3. Blocked Capabilities
  4. Next Safe Step
  5. Hard Boundaries

Compact mode rules:
- keep the status strip pinned at top
- show blocked capabilities before secondary metadata
- collapse deep audit details by default

## 15. Safety Boundary Summary

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

## 16. Live CLI Proof Caveat

This wireframe is based on source-validated and locally installed plugin-owned access behavior.

Direct live CLI invocation proof remains:
- `not_available_from_current_cli_surface`

Therefore, this wireframe must not claim that live OpenClaw CLI invocation has been proven.

## 17. Recommended Next Lane

- `ALPHA9_CONTROLLED_ACTION_RUNTIME_REPORT_PLUGIN_OWNED_ACCESS_UI_COMPONENT_DESIGN_SOURCE`
