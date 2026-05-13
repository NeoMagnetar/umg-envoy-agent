# UMG Envoy Agent 0.3.0-alpha.5 — Live Cheat Sheet

## Confirmed live posture
- version: `0.3.0-alpha.5`
- content mode: `bundled-public`
- compiler mode: `public-readonly`
- runtime writes: `false`
- sleeves: `public-basic-envoy`, `public-coder-envoy`
- bundled blocks: `7`

## Fastest safe smoke order
1. `umg_envoy_status` → `{}`
2. `umg_envoy_sleeve_list` → `{}`
3. `umg_envoy_library_status` → `{}`
4. `umg_envoy_sleeve_inspect` → `{ "sleeveId": "public-basic-envoy" }`
5. `umg_envoy_alpha_demo` → `{}`
6. `umg_envoy_runtime_spec_dry_run` → `{ "message": "Give me a concise demo" }`

---

## Command/tool quick reference

### `umg_envoy_status`
- purpose: plugin/runtime summary
- args: none
- call: `{}`
- returns: `ok`, plugin/version/mode summary, supported tools

### `umg_envoy_sleeve_list`
- purpose: list bundled sleeves
- args: none
- call: `{}`
- returns: `ok`, `sleeves[]`

### `umg_envoy_library_status`
- purpose: summarize bundled block library
- args: none
- call: `{}`
- returns: `ok`, `totalBlocks`, `byKind`, `blockIds`

### `umg_envoy_library_search`
- purpose: search bundled public content
- args: `query: string`
- call: `{ "query": "envoy" }`
- returns: `ok`, `query`, `count`, `results`

### `umg_envoy_runtime_spec_dry_run`
- purpose: build readonly runtime plan/spec-style output
- args: `message: string`, optional `sleeveId: string`
- call: `{ "message": "Give me a concise demo" }`
- returns: `ok`, `mode`, `sleeveId`, `issues`, `rendered`

### `umg_envoy_runtime_visibility_header`
- purpose: concise runtime header
- args: optional `sleeveId: string`
- call: `{}`
- returns: `ok`, `sleeveId`, `header`

### `umg_envoy_runtime_molt_map`
- purpose: readonly block ordering / molt map
- args: optional `sleeveId: string`
- call: `{}`
- returns: `ok`, `sleeveId`, `moltMap`

### `umg_envoy_runtime_dashboard`
- purpose: dashboard stats
- args: none
- call: `{}`
- returns: `ok`, `defaultSleeveId`, `sleeveCount`, `blockCount`, `blockKinds`, `activeBlockCount`, `promptPartCount`, `warnings`, `errors`

### `umg_envoy_runtime_ir_matrix`
- purpose: readonly IR/runtime matrix status
- args: none
- call: `{}`
- returns: `ok`, `compilerAdapter`, `contentMode`, `compilerMode`, `sampleSleeves`, `sampleBlocks`, `blockKinds`, `failClosed`

### `umg_envoy_runtime_inspect`
- purpose: inspect runtime for a sleeve
- args: optional `sleeveId: string`
- call: `{}`
- returns: `ok`, `sleeveId`, `activeBlocks`, `promptParts`, `warnings`, `errors`

### `umg_envoy_local_readonly_plan`
- purpose: readonly plan from a message
- args: `message: string`, optional `sleeveId: string`
- call: `{ "message": "Summarize the public sleeve behavior" }`
- returns: `ok`, `mode`, `sleeveId`, `issues`, `rendered`

### `umg_envoy_local_readonly_scan`
- purpose: readonly bundled-content scan
- args: optional `query: string`
- call: `{}`
- returns: `ok`, `query`, `sleeveHits`, `blockSummary`

### `umg_envoy_alpha_demo`
- purpose: packaged readonly demo
- args: optional `message: string`, optional `sleeveId: string`
- call: `{}`
- returns: `ok`, `sleeveId`, `plan`, `inspect`, `note`

### `umg_envoy_sleeve_inspect`
- purpose: inspect sleeve definition and runtime
- args: `sleeveId: string`
- call: `{ "sleeveId": "public-basic-envoy" }`
- returns: `ok`, `sleeve`, `runtime`

### `umg_envoy_sleeve_demo`
- purpose: sleeve-scoped demo payload
- args: optional `sleeveId: string`, optional `message: string`
- call: `{ "sleeveId": "public-basic-envoy" }`
- returns: `ok`, `sleeveId`, `previewPath`, `runtime`

---

## Best tools by job

### Just tell me if it’s alive
- `umg_envoy_status`
- `umg_envoy_sleeve_list`

### Show me what content exists
- `umg_envoy_sleeve_list`
- `umg_envoy_library_status`
- `umg_envoy_library_search`
- `umg_envoy_local_readonly_scan`

### Show me the runtime shape
- `umg_envoy_runtime_spec_dry_run`
- `umg_envoy_runtime_visibility_header`
- `umg_envoy_runtime_molt_map`
- `umg_envoy_runtime_dashboard`
- `umg_envoy_runtime_ir_matrix`
- `umg_envoy_runtime_inspect`

### Show me a demo
- `umg_envoy_alpha_demo`
- `umg_envoy_sleeve_demo`

### Show me one sleeve in detail
- `umg_envoy_sleeve_inspect`

---

## Known live defaults
- default sleeve behavior resolves to `public-basic-envoy` when no sleeve is provided in the tested tools
- `trigger.sample` is present but disabled in runtime-oriented outputs
- runtime/demo outputs are JSON text payloads, not direct side-effect actions

## Safest canned prompts
- `Give me a concise demo`
- `Summarize the public sleeve behavior`
- `Search bundled public content for envoy`
- `Inspect the public-basic-envoy sleeve`
