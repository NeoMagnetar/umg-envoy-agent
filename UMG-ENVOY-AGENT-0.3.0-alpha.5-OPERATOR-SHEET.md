# UMG Envoy Agent 0.3.0-alpha.5 — Operator Sheet

## Package
- Name: `umg-envoy-agent`
- Version: `0.3.0-alpha.5`
- Install: `openclaw plugins install clawhub:umg-envoy-agent@0.3.0-alpha.5`

## Published posture
This public alpha.5 artifact is intentionally limited to:
- bundled public sleeves/blocks only
- read-only/demo/runtime inspection behavior
- no private roots
- no write bridges
- no approval/resume/execution bridge internals

## Exposed tools

### `umg_envoy_status`
Purpose:
- basic plugin/package health and status check

Use when:
- you want to confirm the plugin is loaded and responding

Likely output:
- package/version/posture summary
- mode/config hints

---

### `umg_envoy_library_status`
Purpose:
- report bundled public library/content availability

Use when:
- you want to confirm bundled sleeves/blocks are present and readable

Likely output:
- content counts and posture summary

---

### `umg_envoy_library_search`
Purpose:
- search bundled public content/library

Use when:
- you want to find sleeves, blocks, or examples by name/theme

Likely inputs:
- query text

Likely output:
- matching public content entries

---

### `umg_envoy_runtime_spec_dry_run`
Purpose:
- compile/interpret bundled public content into RuntimeSpec-like output without execution

Use when:
- you want a safe preview of runtime output

Likely output:
- dry-run runtime spec or interpreted structure

---

### `umg_envoy_runtime_visibility_header`
Purpose:
- produce or inspect the visibility/header layer of runtime output

Use when:
- you want the high-level runtime presentation/metadata view

Likely output:
- concise runtime header summary

---

### `umg_envoy_runtime_molt_map`
Purpose:
- inspect mapped runtime transformation structure

Use when:
- you want a deeper view of how public content resolves

Likely output:
- mapping/transformation summary

---

### `umg_envoy_runtime_dashboard`
Purpose:
- produce a dashboard-style summary of runtime state/output

Use when:
- you want an at-a-glance operator view

Likely output:
- summarized runtime cards/sections/metrics

---

### `umg_envoy_runtime_ir_matrix`
Purpose:
- inspect a structural IR/matrix representation

Use when:
- you want technical/runtime-shape validation

Likely output:
- matrix/table/IR-style structured output

---

### `umg_envoy_runtime_inspect`
Purpose:
- detailed runtime inspection for selected public sleeve/content

Use when:
- you need more detail than dashboard/header views

Likely output:
- verbose structured runtime inspection

---

### `umg_envoy_local_readonly_plan`
Purpose:
- generate a local read-only plan

Use when:
- you want a safe plan against local material without write behavior

Likely output:
- proposed steps/plan only

---

### `umg_envoy_local_readonly_scan`
Purpose:
- perform a local read-only scan

Use when:
- you want inspection of local data under public-safe read-only posture

Likely output:
- scan findings/summaries with no write side effects

---

### `umg_envoy_alpha_demo`
Purpose:
- run the approved alpha demo flow

Use when:
- you want the simplest “show me what this does” experience

Known likely inputs:
- `message`
- optional `sleeveId`

Known example/default sleeve:
- `public-basic-envoy`

---

### `umg_envoy_sleeve_list`
Purpose:
- list bundled public sleeves

Use when:
- you want to see what sleeves are available

Likely output:
- sleeve IDs/names

---

### `umg_envoy_sleeve_inspect`
Purpose:
- inspect one bundled public sleeve in detail

Use when:
- you want to understand one sleeve before using it

Known likely input:
- `sleeveId`

Known example:
- `public-basic-envoy`

---

### `umg_envoy_sleeve_demo`
Purpose:
- run a demo targeted to a sleeve

Use when:
- you want a sleeve-specific demonstration rather than a general alpha demo

Likely inputs:
- `sleeveId`
- maybe message/context

---

## Recommended safe ramp
1. `umg_envoy_status`
2. `umg_envoy_sleeve_list`
3. `umg_envoy_sleeve_inspect`
4. `umg_envoy_alpha_demo`
5. `umg_envoy_runtime_spec_dry_run`
6. `umg_envoy_runtime_dashboard`

## Plugin config keys
Declared config keys:
- `defaultSleeveId`
- `contentMode`
- `compilerMode`
- `debug`
