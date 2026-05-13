# UMG Envoy Agent 0.3.0-alpha.5 — Live Tool Schema Capture

Generated from the installed/public entrypoint by registering the live tool surface and executing the requested readonly checks.

## Summary
- Tool count: `15`
- Version observed from live status: `0.3.0-alpha.5`
- Content mode: `bundled-public`
- Compiler mode: `public-readonly`
- Runtime writes: `false`
- Bundled sample sleeves: `2`
- Bundled sample blocks: `7`

## Live validation run results

### `umg_envoy_status`
Result:
- success: `true`
- output shape: JSON text payload

Observed fields:
- `ok`
- `plugin`
- `version`
- `publicEntrypoint`
- `contentMode`
- `compilerMode`
- `allowRuntimeWrites`
- `sampleSleeves`
- `sampleBlocks`
- `supportedTools`

### `umg_envoy_sleeve_list`
Result:
- success: `true`
- output shape: JSON text payload

Observed fields:
- `ok`
- `sleeves[]`
  - `sleeve_id`
  - `title`
  - `primary_shell_block_id`
  - `block_count`

Observed sleeves:
- `public-basic-envoy`
- `public-coder-envoy`

---

## Tool table

| Tool | Purpose | Accepted args | Minimal valid invocation | Expected output shape | Safe test prompt |
|---|---|---|---|---|---|
| `umg_envoy_status` | Report public alpha.5 status. | none | `{}` | JSON text object with plugin/runtime summary | `Report current public alpha status.` |
| `umg_envoy_library_status` | Summarize bundled public block library status. | none | `{}` | JSON text object with bundled library summary | `Summarize the bundled public block library.` |
| `umg_envoy_library_search` | Search bundled public block content. | `query: string` | `{ "query": "envoy" }` | JSON text object with search matches | `Search bundled public content for envoy.` |
| `umg_envoy_runtime_spec_dry_run` | Build a readonly RuntimeSpec-style plan without execution. | `message: string`, optional `sleeveId: string` | `{ "message": "Give me a concise demo" }` | JSON text object with readonly runtime-plan/spec-style output | `Build a readonly runtime plan for: Give me a concise demo.` |
| `umg_envoy_runtime_visibility_header` | Return a concise visibility header for the selected public sleeve runtime. | optional `sleeveId: string` | `{}` | JSON text object with concise visibility/header summary | `Show the runtime visibility header for the default public sleeve.` |
| `umg_envoy_runtime_molt_map` | Return readonly ordering and public molt-style mapping for the selected sleeve. | optional `sleeveId: string` | `{}` | JSON text object with readonly mapping/order details | `Show the readonly molt map for the default public sleeve.` |
| `umg_envoy_runtime_dashboard` | Report readonly public runtime dashboard stats. | none | `{}` | JSON text object with dashboard stats/summary | `Show readonly runtime dashboard stats.` |
| `umg_envoy_runtime_ir_matrix` | Report public readonly IR matrix status. | none | `{}` | JSON text object with IR/matrix-style status | `Show the public readonly IR matrix status.` |
| `umg_envoy_runtime_inspect` | Inspect readonly RuntimeSpec-like output for a public sleeve. | optional `sleeveId: string` | `{}` | JSON text object with detailed readonly runtime inspection | `Inspect readonly runtime output for the default public sleeve.` |
| `umg_envoy_local_readonly_plan` | Create a local readonly plan from a message. | `message: string`, optional `sleeveId: string` | `{ "message": "Summarize the public sleeve behavior" }` | JSON text object with plan-only output | `Create a local readonly plan for summarizing the public sleeve behavior.` |
| `umg_envoy_local_readonly_scan` | Scan bundled public content without writes or execution. | optional `query: string` | `{}` | JSON text object with readonly scan findings | `Run a readonly scan of bundled public content.` |
| `umg_envoy_alpha_demo` | Run the public alpha demo in readonly mode. | optional `message: string`, optional `sleeveId: string` | `{}` | JSON text object with demo payload/result | `Run the public alpha demo in readonly mode.` |
| `umg_envoy_sleeve_list` | List bundled public sleeves. | none | `{}` | JSON text object with `sleeves[]` array | `List bundled public sleeves.` |
| `umg_envoy_sleeve_inspect` | Inspect a bundled public sleeve and its readonly runtime. | `sleeveId: string` | `{ "sleeveId": "public-basic-envoy" }` | JSON text object with sleeve/runtime inspection | `Inspect the public-basic-envoy sleeve.` |
| `umg_envoy_sleeve_demo` | Show a sleeve-scoped public readonly demo payload. | optional `sleeveId: string`, optional `message: string` | `{ "sleeveId": "public-basic-envoy" }` | JSON text object with sleeve-scoped demo output | `Run a sleeve-scoped readonly demo for public-basic-envoy.` |

---

## Raw per-tool notes

### 1. `umg_envoy_status`
- description: `Report public alpha.5 status.`
- schema:
  - type: `object`
  - additionalProperties: `false`
  - properties: none
- minimal invocation: `{}`
- observed output shape:
  - JSON text object
  - live run succeeded

### 2. `umg_envoy_library_status`
- description: `Summarize bundled public block library status.`
- schema:
  - type: `object`
  - additionalProperties: `false`
  - properties: none
- minimal invocation: `{}`
- expected output shape:
  - JSON text object with bundled block library summary

### 3. `umg_envoy_library_search`
- description: `Search bundled public block content.`
- schema:
  - type: `object`
  - additionalProperties: `false`
  - required: `query`
  - properties:
    - `query: string`
- minimal invocation: `{ "query": "envoy" }`
- expected output shape:
  - JSON text object with search results

### 4. `umg_envoy_runtime_spec_dry_run`
- description: `Build a readonly RuntimeSpec-style plan without execution.`
- schema:
  - type: `object`
  - additionalProperties: `false`
  - required: `message`
  - properties:
    - `message: string`
    - `sleeveId?: string`
- minimal invocation: `{ "message": "Give me a concise demo" }`
- expected output shape:
  - JSON text object with runtime-plan/spec-like payload

### 5. `umg_envoy_runtime_visibility_header`
- description: `Return a concise visibility header for the selected public sleeve runtime.`
- schema:
  - type: `object`
  - additionalProperties: `false`
  - properties:
    - `sleeveId?: string`
- minimal invocation: `{}`
- expected output shape:
  - JSON text object with concise runtime header summary

### 6. `umg_envoy_runtime_molt_map`
- description: `Return readonly ordering and public molt-style mapping for the selected sleeve.`
- schema:
  - type: `object`
  - additionalProperties: `false`
  - properties:
    - `sleeveId?: string`
- minimal invocation: `{}`
- expected output shape:
  - JSON text object with ordering/mapping details

### 7. `umg_envoy_runtime_dashboard`
- description: `Report readonly public runtime dashboard stats.`
- schema:
  - type: `object`
  - additionalProperties: `false`
  - properties: none
- minimal invocation: `{}`
- expected output shape:
  - JSON text object with dashboard metrics/summary

### 8. `umg_envoy_runtime_ir_matrix`
- description: `Report public readonly IR matrix status.`
- schema:
  - type: `object`
  - additionalProperties: `false`
  - properties: none
- minimal invocation: `{}`
- expected output shape:
  - JSON text object with matrix-style summary

### 9. `umg_envoy_runtime_inspect`
- description: `Inspect readonly RuntimeSpec-like output for a public sleeve.`
- schema:
  - type: `object`
  - additionalProperties: `false`
  - properties:
    - `sleeveId?: string`
- minimal invocation: `{}`
- expected output shape:
  - JSON text object with detailed runtime inspection

### 10. `umg_envoy_local_readonly_plan`
- description: `Create a local readonly plan from a message.`
- schema:
  - type: `object`
  - additionalProperties: `false`
  - required: `message`
  - properties:
    - `message: string`
    - `sleeveId?: string`
- minimal invocation: `{ "message": "Summarize the public sleeve behavior" }`
- expected output shape:
  - JSON text object with plan-only output

### 11. `umg_envoy_local_readonly_scan`
- description: `Scan bundled public content without writes or execution.`
- schema:
  - type: `object`
  - additionalProperties: `false`
  - properties:
    - `query?: string`
- minimal invocation: `{}`
- expected output shape:
  - JSON text object with scan findings

### 12. `umg_envoy_alpha_demo`
- description: `Run the public alpha demo in readonly mode.`
- schema:
  - type: `object`
  - additionalProperties: `false`
  - properties:
    - `message?: string`
    - `sleeveId?: string`
- minimal invocation: `{}`
- expected output shape:
  - JSON text object with demo payload/output

### 13. `umg_envoy_sleeve_list`
- description: `List bundled public sleeves.`
- schema:
  - type: `object`
  - additionalProperties: `false`
  - properties: none
- minimal invocation: `{}`
- observed output shape:
  - JSON text object
  - `sleeves[]` array present
  - live run succeeded

### 14. `umg_envoy_sleeve_inspect`
- description: `Inspect a bundled public sleeve and its readonly runtime.`
- schema:
  - type: `object`
  - additionalProperties: `false`
  - required: `sleeveId`
  - properties:
    - `sleeveId: string`
- minimal invocation: `{ "sleeveId": "public-basic-envoy" }`
- expected output shape:
  - JSON text object with sleeve/runtime details

### 15. `umg_envoy_sleeve_demo`
- description: `Show a sleeve-scoped public readonly demo payload.`
- schema:
  - type: `object`
  - additionalProperties: `false`
  - properties:
    - `sleeveId?: string`
    - `message?: string`
- minimal invocation: `{ "sleeveId": "public-basic-envoy" }`
- expected output shape:
  - JSON text object with sleeve demo output

---

## Live run excerpts

### `umg_envoy_status` excerpt
```json
{
  "ok": true,
  "plugin": "umg-envoy-agent",
  "version": "0.3.0-alpha.5",
  "publicEntrypoint": "dist/plugin-entry-public.js",
  "contentMode": "bundled-public",
  "compilerMode": "public-readonly",
  "allowRuntimeWrites": false,
  "sampleSleeves": 2,
  "sampleBlocks": 7
}
```

### `umg_envoy_sleeve_list` excerpt
```json
{
  "ok": true,
  "sleeves": [
    {
      "sleeve_id": "public-basic-envoy",
      "title": "Public Basic Envoy",
      "primary_shell_block_id": "primary.sample",
      "block_count": 7
    },
    {
      "sleeve_id": "public-coder-envoy",
      "title": "Public Coder Envoy",
      "primary_shell_block_id": "primary.sample",
      "block_count": 7
    }
  ]
}
```
