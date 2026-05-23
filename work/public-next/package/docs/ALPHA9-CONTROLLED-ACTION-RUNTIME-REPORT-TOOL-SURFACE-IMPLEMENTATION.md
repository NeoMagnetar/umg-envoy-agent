# Alpha9 Controlled Action Runtime Report Tool Surface Implementation

## Purpose

This lane implements the read-only OpenClaw / Envoy tool surface for the integrated controlled-action runtime report.

## Relationship to runtime report integration

This tool reuses the integrated report helpers for structured report generation, ASCII rendering, and navigation construction.

## Relationship to tool surface design

The earlier design lane defined the contract. This lane wires the contract into the package as a callable read-only report preview tool.

## Implemented tool name

- `umg_envoy_controlled_action_runtime_report`

## Input contract

The tool accepts:
- `sleeveId?`
- `routeId?`
- `reportMode?`
- `panel?`
- `includeAscii?`
- `includeNavigation?`
- `includeStructuredReport?`
- `reportInput?`

## Output contract

The tool returns safe preview metadata with optional:
- `navigation`
- `structuredReport`
- `asciiReport`
- `selectedPanelReport`
- `validationError` for invalid panel usage

## Supported modes

- `summary`
- `full`
- `ascii_only`
- `structured_only`
- `panel`
- `navigation_only`

## Supported panels

- `overview`
- `active_route`
- `safety_evidence_chain`
- `blocked_capabilities`
- `readiness`
- `audit_and_review`
- `recording_metadata`
- `hard_boundaries`
- `next_safe_step`

## Invalid input behavior

If `panel` mode is requested without a valid panel target, the tool returns safe `validationError` metadata and does not throw an uncaught exception.

## Missing data behavior

If no `reportInput` is supplied, the tool returns a safe deterministic incomplete/report-preview object. It does not scan arbitrary files, call external services, or mutate state.

## Read-only guarantees

The controlled action runtime report tool surface implementation exposes a read-only report preview. It does not grant approval, record live decisions, execute actions, write files, transmit data, publish packages, or restart OpenClaw.

## Non-approval guarantees

Runtime report tool does not equal approval.

## Non-recording guarantees

Runtime report tool does not equal recording.

## Non-execution guarantees

Runtime report tool does not equal execution.

## Future work

Later follow-up can verify live install behavior and operational surfacing, but this lane remains report-preview only.
