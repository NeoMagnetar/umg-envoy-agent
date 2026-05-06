# UMG Runtime Display Contract

## Status
Public runtime display contract for human-facing UMG Envoy output.

## Purpose
The display contract defines how UMG Envoy runtime state is presented to humans without exposing hidden reasoning.

Use terms like:
- runtime state
- runtime projection
- declared state
- trace summary
- matrix projection

Do not use:
- thoughts
- private reasoning
- internal chain
- hidden cognition

## Display Modes
```ts
export type UMGRuntimeDisplayMode =
 | "compact"
 | "developer"
 | "debug";
```

### compact
Default user-facing display.

Show:
- agent
- mode
- selected sleeve
- selected NeoStack
- execution statement
- short MOLT Map
- matrix availability

### developer
Show more runtime state.

Show:
- RuntimeSpec ID
- trace ID
- matrix ID
- selected artifacts
- tool-binding summary
- approval/checkpoint summary
- warnings

### debug
Show full structural display.

Show:
- symbolic IR Matrix
- MOLT field links
- selected/candidate sleeves
- provenance
- drill-down references
- blocked/support-only status

## NL Display Rendering
Display output should render in `nl` code fences.

Example sections:
- Runtime Header
- Active Runtime
- MOLT Map
- IR Matrix
- Execution / Safety

## Safety Requirement
The display contract must never expose hidden reasoning.
It reports declared runtime state only.
