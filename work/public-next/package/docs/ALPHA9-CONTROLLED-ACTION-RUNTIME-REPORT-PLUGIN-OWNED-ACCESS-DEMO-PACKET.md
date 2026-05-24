# Alpha9 Controlled Action Runtime Report Plugin-Owned Access Demo Packet

## 1. Purpose

This packet packages the current controlled-action runtime report plugin-owned access work into presentation-ready and agent-handoff-ready demo material.

The controlled-action runtime report plugin-owned access demo packet does not mutate runtime state, call live plugin tools, grant approval, record live decisions, execute actions, write files outside this repo artifact, transmit data externally, publish packages, modify installed plugin files, or restart OpenClaw. It packages read-only demonstration materials only.

## 2. Current Implementation State

The controlled-action runtime report plugin-owned access surface is implemented in source and locally installed into the active plugin path.

## 3. Current Install Verification State

Local install verification passed at file/install level:
- installed access file present
- plugin-entry references access
- manifest references access
- gateway restarted
- plugin loaded

The installed local plugin path is:
`C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`

Direct live CLI invocation proof remains:
- `not_available_from_current_cli_surface`

## 4. What the Demo Shows

- what the runtime report is intended to display
- how the ASCII dashboard reads
- how navigation targets are structured
- how blocked capabilities are presented
- how invalid panel input is safely handled
- how safety flags remain false for execution / approval / recording

## 5. What the Demo Does Not Prove

- it does not prove live CLI invocation
- it does not prove generic OpenClaw `plugin.tools.call`
- it does not execute actions
- it does not approve anything
- it does not record live decisions
- it does not mutate runtime

## 6. Demo Scenario

Scenario:
A route is classified as a controlled-action candidate. Envoy needs to show why the route is blocked, what evidence exists, what capabilities remain off, and what the next safe step is.

Route:
`desktop_write_candidate`

Risk:
`high`

Status:
`blocked`

Purpose:
Visualize the safety state without execution.

## 7. Demo Flow

1. User asks to inspect controlled-action runtime state.
2. Envoy generates read-only runtime report.
3. Report shows active route.
4. Report shows safety evidence chain.
5. Report shows blocked capabilities.
6. Report shows next safe step.
7. Report confirms no execution / approval / recording occurred.

## 8. Full Mode Demo

Intended request:

```json
{
  "reportMode": "full",
  "includeAscii": true,
  "includeNavigation": true,
  "includeStructuredReport": true
}
```

Expected demo output includes:
- metadata
- navigation
- structured report
- ASCII report
- hard safety flags

## 9. ASCII Dashboard Demo

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

## 10. Navigation Demo

Intended request:

```json
{
  "reportMode": "navigation_only",
  "includeAscii": false,
  "includeNavigation": true,
  "includeStructuredReport": false
}
```

Expected navigation targets include:
- `overview`
- `active_route`
- `safety_evidence_chain`
- `blocked_capabilities`
- `readiness`
- `audit_and_review`
- `recording_metadata`
- `hard_boundaries`
- `next_safe_step`

## 11. Blocked-Capabilities Panel Demo

Intended request:

```json
{
  "reportMode": "panel",
  "panel": "blocked_capabilities",
  "includeAscii": false,
  "includeNavigation": true,
  "includeStructuredReport": false
}
```

Expected:
- `selectedPanel=blocked_capabilities`
- `selectedPanelReport` exists
- blocked capabilities remain visible as disabled / blocked
- `executionPerformed=false`
- `approvalGranted=false`
- `recordingPerformed=false`

## 12. Invalid-Panel Demo

Intended request:

```json
{
  "reportMode": "panel",
  "panel": "invalid_panel_name"
}
```

Expected:
- `validationError` exists
- `executionPerformed=false`
- `approvalGranted=false`
- `recordingPerformed=false`

## 13. Safety Boundary Summary

- no runtime mutation
- no installed plugin changes
- no gateway restart in this lane
- no live tool call
- no execution
- no approval
- no live recording
- no writes outside repo artifact
- no external transmission
- no package publish

## 14. Live CLI Proof Caveat

The demo packet is built from validated source behavior, user-facing examples, and prior local install verification.

It does not claim direct live CLI invocation proof.

Current caveat:
- `liveCallProof=not_available_from_current_cli_surface`

## 15. Recommended Next Lane

- `ALPHA9_CONTROLLED_ACTION_RUNTIME_REPORT_PLUGIN_OWNED_ACCESS_PRESENTATION_HANDOFF_SOURCE`
