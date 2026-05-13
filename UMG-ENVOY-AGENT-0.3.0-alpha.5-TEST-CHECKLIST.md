# UMG Envoy Agent 0.3.0-alpha.5 — Test Checklist

## Goal
A practical checklist for validating the published public-safe plugin surface.

## Install
- `openclaw plugins install clawhub:umg-envoy-agent@0.3.0-alpha.5`

## Suggested validation order
1. `umg_envoy_status`
2. `umg_envoy_sleeve_list`
3. `umg_envoy_sleeve_inspect`
4. `umg_envoy_alpha_demo`
5. `umg_envoy_runtime_spec_dry_run`
6. `umg_envoy_runtime_dashboard`
7. deeper diagnostics as needed

---

## Per-tool checklist and example invocation notes

### 1) `umg_envoy_status`
Check:
- plugin responds
- version/posture look correct

Example invocation intent:
- call with no arguments

Pass signs:
- returns status successfully
- identifies public/read-only/demo posture

---

### 2) `umg_envoy_library_status`
Check:
- bundled content is visible to the plugin

Example invocation intent:
- call with no arguments

Pass signs:
- reports bundled library/content availability

---

### 3) `umg_envoy_library_search`
Check:
- search returns useful bundled-public matches

Example invocation intent:
- query: `envoy`
- query: `public`
- query: `basic`

Pass signs:
- returns matching sleeves/blocks/examples without errors

---

### 4) `umg_envoy_runtime_spec_dry_run`
Check:
- dry-run runtime output is generated without execution side effects

Example invocation intent:
- use sleeve `public-basic-envoy` if supported
- use a short prompt/message if supported, such as: `Give me a concise demo`

Pass signs:
- returns structured runtime-like output
- clearly remains dry-run/read-only

---

### 5) `umg_envoy_runtime_visibility_header`
Check:
- high-level runtime header/visibility summary is coherent

Example invocation intent:
- same sleeve/context as dry-run where applicable

Pass signs:
- returns concise top-level runtime summary/header

---

### 6) `umg_envoy_runtime_molt_map`
Check:
- mapped runtime transformation view is available

Example invocation intent:
- inspect `public-basic-envoy` or equivalent bundled sleeve

Pass signs:
- returns transformation/mapping-oriented output

---

### 7) `umg_envoy_runtime_dashboard`
Check:
- dashboard-style summary renders plausibly

Example invocation intent:
- same sleeve/context as prior runtime tests

Pass signs:
- returns readable operator-facing summary sections/cards

---

### 8) `umg_envoy_runtime_ir_matrix`
Check:
- structural IR/matrix view is available

Example invocation intent:
- inspect bundled sleeve `public-basic-envoy`

Pass signs:
- returns matrix/table/IR-style structure without errors

---

### 9) `umg_envoy_runtime_inspect`
Check:
- detailed runtime inspection works

Example invocation intent:
- inspect bundled sleeve `public-basic-envoy`
- include a short message if the tool accepts it

Pass signs:
- returns detailed structured runtime output

---

### 10) `umg_envoy_local_readonly_plan`
Check:
- local planning works in read-only mode

Example invocation intent:
- run against default/local-visible material with no write request

Pass signs:
- outputs a plan only
- no mutation implied

---

### 11) `umg_envoy_local_readonly_scan`
Check:
- local scan works in read-only mode

Example invocation intent:
- run scan with default/local-visible context only

Pass signs:
- returns findings/summary
- no write side effects

---

### 12) `umg_envoy_alpha_demo`
Check:
- approved public alpha demo works end-to-end

Known likely invocation:
- `message: "Give me a concise demo"`
- `sleeveId: "public-basic-envoy"`

Pass signs:
- returns demo output successfully
- result is clearly public-safe

---

### 13) `umg_envoy_sleeve_list`
Check:
- bundled sleeves enumerate successfully

Example invocation intent:
- call with no arguments

Pass signs:
- includes `public-basic-envoy` or other bundled sleeve ids

---

### 14) `umg_envoy_sleeve_inspect`
Check:
- a specific bundled sleeve can be inspected

Known likely invocation:
- `sleeveId: "public-basic-envoy"`

Pass signs:
- returns structured sleeve details

---

### 15) `umg_envoy_sleeve_demo`
Check:
- sleeve-specific demo succeeds

Example invocation intent:
- `sleeveId: "public-basic-envoy"`
- optional short message/context if supported

Pass signs:
- returns sleeve-targeted demo output

---

## Suggested quick acceptance set
Minimum confidence run:
- `umg_envoy_status`
- `umg_envoy_sleeve_list`
- `umg_envoy_sleeve_inspect` with `public-basic-envoy`
- `umg_envoy_alpha_demo` with message `Give me a concise demo`
- `umg_envoy_runtime_spec_dry_run`
- `umg_envoy_runtime_dashboard`

## Notes
- This checklist is based on the published package surface and embedded script expectations.
- Some exact argument names beyond the known smoke-tested cases may need confirmation from live tool schemas after install.
- Public alpha.5 is intentionally read-only/demo-oriented and should not expose private execution bridges.
