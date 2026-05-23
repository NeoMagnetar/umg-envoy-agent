# Alpha9 Controlled Action Runtime Report Integration

## Purpose

This lane creates a read-only integrated runtime report surface for the Alpha9 controlled-action safety stack.

The report combines policy, readiness, audit, review, recording, and handoff metadata into one structured object and one text/ASCII visualization.

## Relationship to phase handoff report

The phase handoff report summarizes the completed Alpha9 chain at a broader checkpoint level.

The runtime report integration uses that checkpointed chain as source context and turns it into a readable runtime-style dashboard surface.

## Relationship to policy/readiness/audit/review/recording layers

This layer sits above:
- policy projection
- approval flow projection
- approval checkpoint projection
- decision simulation
- dry-run runtime projection
- blocked-route summary
- readiness matrix
- policy-to-readiness integration
- policy trace report
- audit packet
- audit packet export
- audit packet review bundle
- review decision packet projection
- recording metadata chain
- phase handoff report

It does not replace those layers. It integrates them into one readable report.

## Structured report object

The runtime report object provides:
- runtime context
- overview status
- navigation model
- active route panel
- safety evidence chain panel
- blocked capabilities panel
- readiness panel
- audit and review panel
- recording metadata panel
- hard boundaries panel
- next safe step panel
- deterministic ASCII/text report

## Navigation model

The navigation model exists so a future OpenClaw/Envoy tool or UI can jump between sections without changing the integrated report contract.

Navigation entries are data only in this lane.

## Panel model

Each panel exposes:
- panel id
- title
- status
- rows

Each row exposes:
- label
- value
- marker

This makes the same report usable in text, JSON, or a later UI layer.

## ASCII/text rendering model

The ASCII rendering creates a deterministic text dashboard showing:
- report title
- mode
- approval false
- execution false
- active route
- safety evidence chain
- blocked capabilities
- why blocked / missing
- next safe step

## Relationship to future OpenClaw tool/UI surfacing

This lane does not register a new OpenClaw tool.

That should be a later lane:
- `ALPHA9_CONTROLLED_ACTION_EXECUTION_RUNTIME_REPORT_TOOL_SURFACE_DESIGN_SOURCE`

The tool surface design should come only after this integrated report passes validation.

## Non-execution guarantees

The controlled action runtime report integration does not grant approval, record live decisions, execute actions, write files, transmit data, or publish packages. It creates a read-only integrated report and text visualization surface only.

Runtime report does not equal execution.
Runtime report does not equal approval.
Runtime report does not equal live recording.

## Forbidden wording / forbidden authority

This runtime report must not imply execution authority, approval authority, live decision recording, or file/transmission side effects.

Forbidden execution wording includes:
- `ready_to_execute`
- `can_execute`
- `approved_for_execution`
- `execution_allowed`
- `approval_granted`
- `grant_execution`
- `authorize_execution`
- `recorded_live`
- `write_allowed`
- `bridge_allowed`

## Recommended next lane

Recommended next lane:
- `ALPHA9_CONTROLLED_ACTION_EXECUTION_RUNTIME_REPORT_TOOL_SURFACE_DESIGN_SOURCE`

Use that only after this integrated report passes validation.
