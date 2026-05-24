# Alpha9 Controlled Action Runtime Report Plugin-Owned Access User-Facing Examples

## 1. Purpose

This lane creates user-facing examples for the controlled-action runtime report plugin-owned access surface.

The controlled-action runtime report plugin-owned access user-facing examples do not mutate runtime state, call live plugin tools, grant approval, record live decisions, execute actions, write files outside this repo artifact, transmit data externally, publish packages, or modify installed plugin files. They provide examples for a read-only runtime report access surface only.

## 2. Current Verification State

The plugin-owned access surface is implemented in source and locally promoted into the installed plugin path.

Installed file-level verification passed:
- installed access file present
- plugin-entry references access
- manifest references access
- plugin loaded after gateway restart

However, direct live CLI invocation proof remains:
- `not_available_from_current_cli_surface`

## 3. What This Report Access Surface Is

A read-only UMG Envoy runtime report access surface for visualizing controlled-action safety state.

## 4. What It Is Not

It is not execution.
It is not approval.
It is not live recording.
It is not a bridge action.
It is not a file writer.
It is not package publishing.

## 5. Example: Full Mode

Intended request:

```json
{
  "reportMode": "full",
  "includeAscii": true,
  "includeNavigation": true,
  "includeStructuredReport": true
}
```

Expected output categories:
- metadata
- navigation
- structuredReport
- asciiReport
- hard safety flags

## 6. Example: Summary Mode

Intended request:

```json
{
  "reportMode": "summary",
  "includeAscii": true,
  "includeNavigation": true,
  "includeStructuredReport": true
}
```

Expected:
- overview summary
- optional asciiReport
- optional navigation
- executionPerformed=false
- approvalGranted=false

## 7. Example: ascii_only Mode

Intended request:

```json
{
  "reportMode": "ascii_only",
  "includeAscii": true,
  "includeNavigation": false,
  "includeStructuredReport": false
}
```

Expected:
- asciiReport
- minimal metadata
- executionPerformed=false
- approvalGranted=false
- recordingPerformed=false

## 8. Example: structured_only Mode

Intended request:

```json
{
  "reportMode": "structured_only",
  "includeAscii": false,
  "includeNavigation": false,
  "includeStructuredReport": true
}
```

Expected:
- structuredReport
- minimal metadata
- hard safety flags remain false

## 9. Example: navigation_only Mode

Intended request:

```json
{
  "reportMode": "navigation_only",
  "includeAscii": false,
  "includeNavigation": true,
  "includeStructuredReport": false
}
```

Expected:
- navigation
- minimal metadata
- no execution or approval side effects

## 10. Example: Panel Mode

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
- `executionPerformed=false`
- `approvalGranted=false`

## 11. Example: Invalid Panel Behavior

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

## 12. ASCII Dashboard Example

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

## 13. Safety Boundaries

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

These examples are based on verified source behavior and installed file-level verification state. They are not presented as direct live CLI invocation proof.

Current caveat:
- `liveCallProof=not_available_from_current_cli_surface`

## 15. Recommended Next Lane

- `ALPHA9_CONTROLLED_ACTION_RUNTIME_REPORT_PLUGIN_OWNED_ACCESS_DEMO_PACKET_SOURCE`
