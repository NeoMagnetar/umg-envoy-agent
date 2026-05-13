# UMG Envoy Agent 0.3.0-alpha.5 — Detailed Handoff Worklog

## Purpose
This document is a detailed handoff for the next agent covering what was done in this session around the stabilized public package `umg-envoy-agent@0.3.0-alpha.5`, what was verified, what was published, what artifacts were created, and where the authoritative source files live.

This handoff is intentionally verbose so the next agent can resume without reconstructing context from chat.

---

## Executive summary
We completed a public-package stabilization and documentation pass for the minimized public-safe OpenClaw plugin package:
- package: `umg-envoy-agent`
- version: `0.3.0-alpha.5`
- artifact route used for publish: exact TGZ only
- publish route: `clawhub package publish <tgz>`
- result: successful publish
- ClawHub publish id: `rd78zxnkfn82c2m4vfcxbw7sfd86mwcz`

After publish, we:
1. extracted the exposed command/tool surface from the package metadata
2. created an operator sheet
3. created a test checklist
4. created a live schema-capture prompt
5. executed a live tool registration/schema capture against the public entrypoint
6. executed live readonly probes on the remaining tools using minimal safe inputs
7. produced a condensed live cheat sheet
8. committed each documentation/probe step into the workspace Git repo

---

## User approval constraints that governed publish
The user explicitly approved publishing only the exact stabilized TGZ artifact and explicitly prohibited alternative packaging routes or content changes.

Approved artifact:
- `C:\.openclaw\workspace\work\public-next\package\umg-envoy-agent-0.3.0-alpha.5.tgz`

Approved provenance values provided by user:
- SHA256: `40D146FFC8169977020F625A54412354C1F3F7F6FACA828EE408B2F9945A3289`
- Package: `umg-envoy-agent`
- Version: `0.3.0-alpha.5`
- Source repo: `NeoMagnetar/umg-envoy-agent`
- Source commit: `3a236ee43b6281aafeca4b4b8072c99f05bbe7fa`
- Source ref: `umg-envoy-agent-v0.3.0-alpha.5`

Explicit user constraints:
- use same exact TGZ route that passed dry-run
- do not use folder route
- do not use ZIP
- do not delete
- do not rescan before publish
- do not rename package
- do not modify artifact contents

Practical consequence:
- no repack/rebuild/rename step was performed before publish
- no folder-based `clawhub package publish <folder>` route was used
- no ZIP route was used

---

## Publish action performed
The exact publish command used was:

```powershell
clawhub package publish "C:\.openclaw\workspace\work\public-next\package\umg-envoy-agent-0.3.0-alpha.5.tgz" --name umg-envoy-agent --display-name "UMG Envoy Agent" --version 0.3.0-alpha.5 --source-repo NeoMagnetar/umg-envoy-agent --source-commit 3a236ee43b6281aafeca4b4b8072c99f05bbe7fa --source-ref umg-envoy-agent-v0.3.0-alpha.5
```

Observed publish result:
- `OK. Published umg-envoy-agent@0.3.0-alpha.5 (rd78zxnkfn82c2m4vfcxbw7sfd86mwcz)`

Meaning:
- the approved TGZ was published successfully
- the publish id for lookup/reference is `rd78zxnkfn82c2m4vfcxbw7sfd86mwcz`

---

## Package/source files inspected as source of truth
The following files in the package worktree were used as primary local source-of-truth references for the package surface:

1. Package manifest
- `C:\.openclaw\workspace\work\public-next\package\package.json`

2. Package README
- `C:\.openclaw\workspace\work\public-next\package\README.md`

3. Public variant README
- `C:\.openclaw\workspace\work\public-next\package\PUBLIC-VARIANT-README.md`

4. Plugin metadata / declared tools / config schema
- `C:\.openclaw\workspace\work\public-next\package\openclaw.plugin.json`

These files established:
- package name/version
- public entrypoint path
- declared tool list
- npm scripts
- declared plugin config keys
- the intended public-safe/read-only posture

---

## Important package metadata captured
From `package.json` and `openclaw.plugin.json`, the following package-level facts were captured.

### Package identity
- name: `umg-envoy-agent`
- version: `0.3.0-alpha.5`
- description: `Minimized public alpha.5 UMG Envoy Agent for OpenClaw`

### Entrypoint
- main: `dist/plugin-entry-public.js`
- OpenClaw extension/runtime extension: `./dist/plugin-entry-public.js`

### Compatibility metadata
- plugin API compatibility: `>=1.2.0`
- min gateway version: `2026.3.23-1`
- build openclawVersion: `2026.3.23-1`
- pluginSdkVersion: `2026.3.23-1`

### Declared plugin config keys
From `openclaw.plugin.json`:
- `defaultSleeveId`
- `contentMode`
- `compilerMode`
- `debug`

### Package-local npm scripts present
From `package.json`:
- `build`
- `check`
- `smoke`
- `umg:public-surface:smoke`
- `umg:alpha-demo:smoke`
- `umg:operational-sleeve:smoke`
- `pack:dry`

---

## Declared tool surface from plugin metadata
From `openclaw.plugin.json`, the declared tool list was:
- `umg_envoy_status`
- `umg_envoy_library_status`
- `umg_envoy_library_search`
- `umg_envoy_runtime_spec_dry_run`
- `umg_envoy_runtime_visibility_header`
- `umg_envoy_runtime_molt_map`
- `umg_envoy_runtime_dashboard`
- `umg_envoy_runtime_ir_matrix`
- `umg_envoy_runtime_inspect`
- `umg_envoy_local_readonly_plan`
- `umg_envoy_local_readonly_scan`
- `umg_envoy_alpha_demo`
- `umg_envoy_sleeve_list`
- `umg_envoy_sleeve_inspect`
- `umg_envoy_sleeve_demo`

Total declared tools:
- `15`

---

## Documentation artifacts created in this session
The following workspace documents were created to support operation, validation, and handoff.

### 1) Operator sheet
File:
- `C:\.openclaw\workspace\UMG-ENVOY-AGENT-0.3.0-alpha.5-OPERATOR-SHEET.md`

Purpose:
- human-readable operational overview of the published alpha.5 tool surface
- purpose-oriented descriptions for each tool
- safe ramp / recommended order
- config key reminders

Commit:
- `9f2c9fd` — `Add UMG Envoy Agent alpha.5 operator docs`

### 2) Test checklist
File:
- `C:\.openclaw\workspace\UMG-ENVOY-AGENT-0.3.0-alpha.5-TEST-CHECKLIST.md`

Purpose:
- validation order and pass/fail expectations
- minimal test intent per tool
- known safe example cases

Commit:
- included in `9f2c9fd`

### 3) Live schema capture prompt
File:
- `C:\.openclaw\workspace\UMG-ENVOY-AGENT-ALPHA5-LIVE-SCHEMA-CAPTURE-PROMPT.txt`

Purpose:
- reusable prompt for a future workspace/tool-lane live capture
- explicitly read-only and schema-focused

Commit:
- `c34db0a` — `Add alpha.5 live schema capture prompt`

### 4) Live schema capture raw JSON
File:
- `C:\.openclaw\workspace\UMG-ENVOY-AGENT-ALPHA5-LIVE-SCHEMA-CAPTURE.json`

Purpose:
- raw capture of registered tool defs and first live executions
- authoritative machine-readable schema snapshot

Commit:
- `6e9989f` — `Capture alpha.5 live tool schemas`

### 5) Live tool schemas markdown
File:
- `C:\.openclaw\workspace\UMG-ENVOY-AGENT-ALPHA5-LIVE-TOOL-SCHEMAS.md`

Purpose:
- readable per-tool table derived from the actual registered live tools
- includes accepted args, minimal invocation, expected output shape, and safe test prompt

Commit:
- included in `6e9989f`

### 6) Safe probe results
File:
- `C:\.openclaw\workspace\UMG-ENVOY-AGENT-ALPHA5-SAFE-PROBE-RESULTS.json`

Purpose:
- second-pass live probe results using minimal readonly inputs for the remaining tools
- records success and output-key previews

Commit:
- `cb34d29` — `Add alpha.5 safe probe and cheat sheet`

### 7) Condensed live cheat sheet
File:
- `C:\.openclaw\workspace\UMG-ENVOY-AGENT-ALPHA5-LIVE-CHEAT-SHEET.md`

Purpose:
- compact reference for the next operator/agent
- fastest smoke order
- minimal safe calls
- known default sleeve behavior and output shapes

Commit:
- included in `cb34d29`

---

## Git commits created or referenced during this session
Recent relevant commits in the workspace repo:

1. `cb34d29` — `Add alpha.5 safe probe and cheat sheet`
2. `6e9989f` — `Capture alpha.5 live tool schemas`
3. `c34db0a` — `Add alpha.5 live schema capture prompt`
4. `9f2c9fd` — `Add UMG Envoy Agent alpha.5 operator docs`
5. `3a236ee` — `stabilize alpha5 public package metadata and runtime version`
6. `82dab9d` — `fix alpha4 compatibility metadata and README`
7. `7805192` — `fix public plugin config schema metadata`
8. `6f29798` — `Clean non-public build outputs from package tree`

Interpretation:
- `3a236ee` is the source commit the user cited as provenance for the approved package
- the later docs/verification commits are workspace documentation/handoff artifacts created after publish and validation

---

## Live schema capture method
To avoid relying only on static docs, we performed a live registration pass against the public entrypoint:
- entrypoint used: `C:\.openclaw\workspace\work\public-next\package\dist\plugin-entry-public.js`

Method:
1. import the public plugin entrypoint in Node
2. provide a stub bridge with `registerTool(def)`
3. collect each tool definition object at runtime
4. extract `name`, `description`, and `inputSchema`
5. execute two initial validation calls:
   - `umg_envoy_status`
   - `umg_envoy_sleeve_list`

Result:
- actual registered tool count captured: `15`
- registered tool list matched the declared package surface

Primary live-capture output files:
- `C:\.openclaw\workspace\UMG-ENVOY-AGENT-ALPHA5-LIVE-SCHEMA-CAPTURE.json`
- `C:\.openclaw\workspace\UMG-ENVOY-AGENT-ALPHA5-LIVE-TOOL-SCHEMAS.md`

---

## Live schema capture findings
The live capture confirmed the actual runtime input schemas for each registered tool.

### Tools with no required inputs
- `umg_envoy_status`
- `umg_envoy_library_status`
- `umg_envoy_runtime_dashboard`
- `umg_envoy_runtime_ir_matrix`
- `umg_envoy_sleeve_list`

### Tools with required `query`
- `umg_envoy_library_search`

Schema:
- `{ query: string }`

### Tools with required `message`
- `umg_envoy_runtime_spec_dry_run`
- `umg_envoy_local_readonly_plan`

Schema:
- `{ message: string, sleeveId?: string }`

### Tools with required `sleeveId`
- `umg_envoy_sleeve_inspect`

Schema:
- `{ sleeveId: string }`

### Tools with optional `sleeveId`
- `umg_envoy_runtime_visibility_header`
- `umg_envoy_runtime_molt_map`
- `umg_envoy_runtime_inspect`
- `umg_envoy_sleeve_demo`
- `umg_envoy_alpha_demo`

### Tool with optional `query`
- `umg_envoy_local_readonly_scan`

---

## First live run results
We executed the user-requested first-pass live calls:
1. `umg_envoy_status`
2. `umg_envoy_sleeve_list`

### `umg_envoy_status` observed output
Observed live fields:
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

Important observed values:
- `plugin`: `umg-envoy-agent`
- `version`: `0.3.0-alpha.5`
- `publicEntrypoint`: `dist/plugin-entry-public.js`
- `contentMode`: `bundled-public`
- `compilerMode`: `public-readonly`
- `allowRuntimeWrites`: `false`
- `sampleSleeves`: `2`
- `sampleBlocks`: `7`

### `umg_envoy_sleeve_list` observed output
Observed sleeves:
1. `public-basic-envoy`
   - title: `Public Basic Envoy`
   - primary shell block id: `primary.sample`
   - block count: `7`

2. `public-coder-envoy`
   - title: `Public Coder Envoy`
   - primary shell block id: `primary.sample`
   - block count: `7`

---

## Second-pass safe probe method
After confirming the basic live tool surface, we executed a second-pass readonly probe against the remaining tools using minimal safe arguments only.

Goals:
- avoid mutation
- avoid private bridges
- avoid execution semantics beyond readonly/demo surfaces
- confirm real output-key shapes for future operators

Minimal invocation set used:
- `umg_envoy_library_status` → `{}`
- `umg_envoy_library_search` → `{ "query": "envoy" }`
- `umg_envoy_runtime_spec_dry_run` → `{ "message": "Give me a concise demo" }`
- `umg_envoy_runtime_visibility_header` → `{}`
- `umg_envoy_runtime_molt_map` → `{}`
- `umg_envoy_runtime_dashboard` → `{}`
- `umg_envoy_runtime_ir_matrix` → `{}`
- `umg_envoy_runtime_inspect` → `{}`
- `umg_envoy_local_readonly_plan` → `{ "message": "Summarize the public sleeve behavior" }`
- `umg_envoy_local_readonly_scan` → `{}`
- `umg_envoy_alpha_demo` → `{}`
- `umg_envoy_sleeve_inspect` → `{ "sleeveId": "public-basic-envoy" }`
- `umg_envoy_sleeve_demo` → `{ "sleeveId": "public-basic-envoy" }`

Result:
- all second-pass probes succeeded
- outputs were consistently JSON text payloads
- no mutation behavior was observed

Primary output file:
- `C:\.openclaw\workspace\UMG-ENVOY-AGENT-ALPHA5-SAFE-PROBE-RESULTS.json`

---

## Key second-pass probe findings by tool

### `umg_envoy_library_status`
Observed keys:
- `ok`
- `totalBlocks`
- `byKind`
- `blockIds`

Observed data:
- total blocks: `7`
- one block each for:
  - `blueprint`
  - `directive`
  - `instruction`
  - `philosophy`
  - `primary`
  - `subject`
  - `trigger`

### `umg_envoy_library_search`
Invocation used:
- `{ "query": "envoy" }`

Observed keys:
- `ok`
- `query`
- `count`
- `results`

Observed preview:
- count `2`
- returned sample block matches including `subject.sample` and `trigger.sample`

### `umg_envoy_runtime_spec_dry_run`
Observed keys:
- `ok`
- `mode`
- `sleeveId`
- `issues`
- `rendered`

Observed behavior:
- returns `readonly-plan`
- defaulted to `public-basic-envoy`
- emitted a rendered path/spec-style string

### `umg_envoy_runtime_visibility_header`
Observed keys:
- `ok`
- `sleeveId`
- `header`

Observed header preview included:
- sleeve id
- primary shell
- active blocks count
- prompt parts count

### `umg_envoy_runtime_molt_map`
Observed keys:
- `ok`
- `sleeveId`
- `moltMap`

Observed behavior:
- returns ordered block sequence with `order`, `block_id`, `kind`, `authority`

### `umg_envoy_runtime_dashboard`
Observed keys:
- `ok`
- `defaultSleeveId`
- `sleeveCount`
- `blockCount`
- `blockKinds`
- `activeBlockCount`
- `promptPartCount`
- `warnings`
- `errors`

Important observed warning:
- `disabled block skipped: trigger.sample`

### `umg_envoy_runtime_ir_matrix`
Observed keys:
- `ok`
- `compilerAdapter`
- `contentMode`
- `compilerMode`
- `sampleSleeves`
- `sampleBlocks`
- `blockKinds`
- `failClosed`

Important observed values:
- `compilerAdapter`: `not-shipped-publicly`
- `failClosed`: `true`

### `umg_envoy_runtime_inspect`
Observed keys:
- `ok`
- `sleeveId`
- `activeBlocks`
- `promptParts`
- `warnings`
- `errors`

Observed behavior:
- returns active runtime block sequence
- again confirms disabled `trigger.sample` warning

### `umg_envoy_local_readonly_plan`
Observed keys:
- `ok`
- `mode`
- `sleeveId`
- `issues`
- `rendered`

Observed behavior:
- readonly plan generation from a message
- default sleeve again resolved to `public-basic-envoy`

### `umg_envoy_local_readonly_scan`
Observed keys:
- `ok`
- `query`
- `sleeveHits`
- `blockSummary`

Observed behavior:
- scan returns both sleeves and block summary without writes

### `umg_envoy_alpha_demo`
Observed keys:
- `ok`
- `sleeveId`
- `plan`
- `inspect`
- `note`

Observed behavior:
- wraps a plan plus inspection into a packaged readonly demo response

### `umg_envoy_sleeve_inspect`
Observed keys:
- `ok`
- `sleeve`
- `runtime`

Observed behavior:
- returns full sleeve metadata plus runtime object
- sleeve metadata includes:
  - `sleeve_id`
  - `title`
  - `snap_id`
  - `primary_shell_block_id`
  - `block_refs`
  - `strategy`
  - `constraints`
  - `context`
  - `values`
  - `format`
  - `tool_requests`

### `umg_envoy_sleeve_demo`
Observed keys:
- `ok`
- `sleeveId`
- `previewPath`
- `runtime`

Observed behavior:
- sleeve-specific demo returning preview path plus runtime object

---

## Workspace files that are now most important for the next agent
If the next agent needs to resume this lane quickly, these are the highest-value files to read first.

### First priority
1. `C:\.openclaw\workspace\UMG-ENVOY-AGENT-ALPHA5-LIVE-CHEAT-SHEET.md`
2. `C:\.openclaw\workspace\UMG-ENVOY-AGENT-ALPHA5-LIVE-TOOL-SCHEMAS.md`
3. `C:\.openclaw\workspace\UMG-ENVOY-AGENT-ALPHA5-SAFE-PROBE-RESULTS.json`
4. `C:\.openclaw\workspace\UMG-ENVOY-AGENT-ALPHA5-LIVE-SCHEMA-CAPTURE.json`

### Package source-of-truth files
5. `C:\.openclaw\workspace\work\public-next\package\package.json`
6. `C:\.openclaw\workspace\work\public-next\package\openclaw.plugin.json`
7. `C:\.openclaw\workspace\work\public-next\package\README.md`
8. `C:\.openclaw\workspace\work\public-next\package\PUBLIC-VARIANT-README.md`

### Supporting operator docs
9. `C:\.openclaw\workspace\UMG-ENVOY-AGENT-0.3.0-alpha.5-OPERATOR-SHEET.md`
10. `C:\.openclaw\workspace\UMG-ENVOY-AGENT-0.3.0-alpha.5-TEST-CHECKLIST.md`
11. `C:\.openclaw\workspace\UMG-ENVOY-AGENT-ALPHA5-LIVE-SCHEMA-CAPTURE-PROMPT.txt`

---

## Current known live posture
These are the most important live-operational facts confirmed in this session:
- registered tool count: `15`
- live version: `0.3.0-alpha.5`
- content mode: `bundled-public`
- compiler mode: `public-readonly`
- runtime writes allowed: `false`
- bundled sleeves seen live:
  - `public-basic-envoy`
  - `public-coder-envoy`
- bundled block count seen live: `7`
- runtime outputs are JSON text payloads
- several no-arg runtime tools default to `public-basic-envoy`
- `trigger.sample` is present but disabled in runtime-oriented outputs
- no write bridge behavior was exposed in the probed surface

---

## Things we did not do
This is important for the next agent so they do not assume extra validation occurred.

We did **not**:
- repack or modify the approved TGZ before publish
- use the folder route for publish
- use ZIP for publish
- perform a fresh artifact rescan before publish
- test every imaginable argument permutation for every tool
- run destructive or mutating operations
- inspect a separately installed remote runtime beyond the locally registered public entrypoint and live readonly tool executions
- change gateway config or plugin config during this doc/probe phase

---

## Risks / caveats for the next agent
1. The schema capture and probe were done against the public entrypoint in the workspace package lane, not through an external production deployment UI.
2. The output shapes are live and real for this entrypoint, but future versions may differ.
3. Some tools with optional inputs were probed using empty/default arguments; downstream behavior may change when `sleeveId`, `message`, or `query` is varied.
4. The workspace repo contains a large amount of unrelated modified/untracked material; commits in this session intentionally staged only the new handoff/doc/probe files.
5. Line-ending warnings (`LF` -> `CRLF`) were observed on commit but were not blockers.

---

## Recommended next steps for the next agent
If continuation is needed, a sensible order is:

1. Read:
   - `UMG-ENVOY-AGENT-ALPHA5-LIVE-CHEAT-SHEET.md`
   - `UMG-ENVOY-AGENT-ALPHA5-LIVE-TOOL-SCHEMAS.md`
   - this handoff file

2. If deeper validation is needed:
   - compare `UMG-ENVOY-AGENT-ALPHA5-LIVE-SCHEMA-CAPTURE.json` against `openclaw.plugin.json`
   - compare `UMG-ENVOY-AGENT-ALPHA5-SAFE-PROBE-RESULTS.json` for output consistency

3. If preparing future operator docs:
   - use the cheat sheet as the compact reference
   - use the tool schemas markdown as the detailed reference

4. If preparing a future release or patch:
   - anchor provenance to source commit `3a236ee43b6281aafeca4b4b8072c99f05bbe7fa`
   - verify whether the next release should keep the same readonly/demo posture or intentionally expand the surface

---

## File index with quick descriptions
- `C:\.openclaw\workspace\UMG-ENVOY-AGENT-0.3.0-alpha.5-OPERATOR-SHEET.md`
  - high-level operator overview
- `C:\.openclaw\workspace\UMG-ENVOY-AGENT-0.3.0-alpha.5-TEST-CHECKLIST.md`
  - validation checklist
- `C:\.openclaw\workspace\UMG-ENVOY-AGENT-ALPHA5-LIVE-SCHEMA-CAPTURE-PROMPT.txt`
  - reusable prompt for live schema capture
- `C:\.openclaw\workspace\UMG-ENVOY-AGENT-ALPHA5-LIVE-SCHEMA-CAPTURE.json`
  - raw live tool registration/schema data + initial runs
- `C:\.openclaw\workspace\UMG-ENVOY-AGENT-ALPHA5-LIVE-TOOL-SCHEMAS.md`
  - readable schema table and notes
- `C:\.openclaw\workspace\UMG-ENVOY-AGENT-ALPHA5-SAFE-PROBE-RESULTS.json`
  - raw second-pass minimal readonly probe results
- `C:\.openclaw\workspace\UMG-ENVOY-AGENT-ALPHA5-LIVE-CHEAT-SHEET.md`
  - condensed live operator reference
- `C:\.openclaw\workspace\work\public-next\package\package.json`
  - package manifest
- `C:\.openclaw\workspace\work\public-next\package\README.md`
  - package overview and install/build notes
- `C:\.openclaw\workspace\work\public-next\package\PUBLIC-VARIANT-README.md`
  - public-variant posture description
- `C:\.openclaw\workspace\work\public-next\package\openclaw.plugin.json`
  - declared tool list and config schema

---

## Final state at handoff
At handoff time, the lane is in a good documentation/verification state:
- exact approved alpha.5 TGZ was published successfully
- the public tool surface was documented from both metadata and live registration
- readonly live probes succeeded across the remaining tools
- all resulting artifacts were saved in the workspace and committed

Most recent relevant doc/probe commit at handoff:
- `cb34d29` — `Add alpha.5 safe probe and cheat sheet`

Publish id to carry forward:
- `rd78zxnkfn82c2m4vfcxbw7sfd86mwcz`
