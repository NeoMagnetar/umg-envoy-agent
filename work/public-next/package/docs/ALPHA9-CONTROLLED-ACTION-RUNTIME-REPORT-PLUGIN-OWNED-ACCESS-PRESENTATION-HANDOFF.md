# Alpha9 Controlled Action Runtime Report Plugin-Owned Access Presentation Handoff

## 1. Executive Summary

UMG Envoy now has a source-implemented, locally installed, read-only controlled-action runtime report access surface.

The report can show:
- active route
- safety evidence chain
- blocked capabilities
- readiness/review/recording metadata
- next safe step
- hard non-execution boundaries

The demo packet shows how this report should appear and be interpreted.

Direct live CLI invocation proof remains unavailable from the current OpenClaw CLI surface.

The controlled-action runtime report plugin-owned access presentation handoff does not mutate runtime state, call live plugin tools, grant approval, record live decisions, execute actions, write files outside this repo artifact, transmit data externally, publish packages, modify installed plugin files, or restart OpenClaw. It packages the completed local work into a human/agent handoff only.

## 2. What Was Built

Completed work includes:
- controlled-action runtime report integration
- runtime report tool surface
- plugin-owned access design
- plugin-owned access implementation
- local install verification
- user-facing examples
- demo packet

## 3. Why This Lane Exists

This lane exists to turn the completed local work into a clear handoff packet for humans or future agents, without reopening runtime mutation or trying to force a missing generic CLI/tool-call surface.

## 4. Current Proof State

Source implementation:
- READY

Local install verification:
- READY at file/install level

Gateway:
- previously restarted and plugin loaded during install verification

Live CLI call proof:
- `not_available_from_current_cli_surface`

Runtime mutation:
- none in this lane

Package publish:
- not performed

## 5. What the Demo Shows

- what the runtime report is intended to display
- how the ASCII dashboard reads
- how navigation targets are structured
- how blocked capabilities are presented
- how invalid panel input is safely handled
- how safety flags remain false for execution / approval / recording

## 6. What the Demo Does Not Prove

- it does not prove live CLI invocation
- it does not prove generic OpenClaw `plugin.tools.call`
- it does not execute actions
- it does not approve anything
- it does not record live decisions
- it does not mutate runtime

## 7. Runtime Report Modes

Supported modes:
- `full`
- `summary`
- `ascii_only`
- `structured_only`
- `navigation_only`
- `panel`

## 8. Navigation / Panel Model

Panel targets:
- `overview`
- `active_route`
- `safety_evidence_chain`
- `blocked_capabilities`
- `readiness`
- `audit_and_review`
- `recording_metadata`
- `hard_boundaries`
- `next_safe_step`

Key panel:
- `blocked_capabilities`

## 9. ASCII Dashboard Explanation

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

This ASCII surface is the clearest current presentation of the report’s meaning: it visualizes risk, blocked capability state, and next-safe-step guidance while keeping all action/approval/recording flags false.

## 10. Safety Boundary Summary

- no runtime mutation
- no installed plugin changes in this lane
- no gateway restart in this lane
- no live tool call
- no execution
- no approval
- no live recording
- no writes outside repo artifact
- no external transmission
- no package publish

## 11. Known Limitation: Live CLI Call Proof Unavailable

Known limitation:
- `liveCallProof=not_available_from_current_cli_surface`

That means the work is proven at source level and installed-file level, but should not be described as a live CLI-invoked demonstration through the current OpenClaw surface.

## 12. Recommended Next Paths

### Option A — Presentation / UI Continuation
`ALPHA9_CONTROLLED_ACTION_RUNTIME_REPORT_PLUGIN_OWNED_ACCESS_VISUAL_UI_WIREFRAME_SOURCE`

Purpose:
Design a UI/wireframe version of the ASCII report so the runtime report can become an OpenClaw-visible visual workspace later.

### Option B — Runtime Protocol Continuation
`ALPHA9_CONTROLLED_ACTION_RUNTIME_REPORT_PLUGIN_OWNED_ACCESS_CALL_PATH_REVISIT_SOURCE`

Purpose:
Revisit live invocation proof if OpenClaw exposes a call path later or if the plugin-owned method becomes callable through an available gateway surface.

Recommended:
- Option A — Visual UI wireframe

Reason:
- The report is already understandable as a text/ASCII surface. The next useful local step is visualizing it, not looping on the missing CLI call path.

## 13. Copy-Ready Handoff Summary for a New Agent / Chat

Current UMG Envoy Alpha9 status:

- Controlled-action runtime report is implemented in source.
- Plugin-owned access surface is implemented.
- Local installed plugin path was verified and promoted:
  `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`
- User-facing examples and demo packet exist.
- Runtime report modes:
  `full`, `summary`, `ascii_only`, `structured_only`, `navigation_only`, `panel`
- Key panel:
  `blocked_capabilities`
- Live CLI call proof remains unavailable from current OpenClaw CLI surface.
- Do not claim live tool invocation proof.
- Do not patch OpenClaw core.
- Recommended next lane:
  `ALPHA9_CONTROLLED_ACTION_RUNTIME_REPORT_PLUGIN_OWNED_ACCESS_VISUAL_UI_WIREFRAME_SOURCE`
