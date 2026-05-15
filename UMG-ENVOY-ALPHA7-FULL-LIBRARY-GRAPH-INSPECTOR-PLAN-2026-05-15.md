# UMG Envoy Agent Alpha.7 — Full UMG Library Graph Inspector Plan

Date: 2026-05-15

## Final Verdict

`ALPHA7_FULL_LIBRARY_GRAPH_INSPECTOR_PLAN_READY`

## Baseline

Alpha.6 has been published on ClawHub.

Published package:
- `umg-envoy-agent@0.3.0-alpha.6`

ClawHub ID:
- `rd7cgt05ayt3qhe3a0gryz1tz986s062`

Alpha.6 capability:
- read-only real-library public_curated inspection
- real-library status
- real sleeve list
- real sleeve inspect
- explicit reference extraction
- reference classification
- target availability check
- one approved NeoBlock shallow load
- shallow-load runtime summary

## Phase Intent

Alpha.7 is not execution.

Alpha.7 is the full read-only UMG graph inspection layer.

Design principle:
1. full visibility first
2. runtime activation second
3. tool execution third

Alpha.7 must support inspection across:
- Sleeve
- NeoStack
- NeoBlock
- MOLT Block
- Gate
- Trigger
- active/off routing state
- IR matrix projection

## Hard Non-Goals

Alpha.7 must not:
- add execution
- enable direct_source mode
- recursively execute full graph
- load HUMAN lane as machine source
- load archive lanes
- load Resleever lanes
- bind real tools yet
- publish a new package yet

## Product Goal

Alpha.7 should let the plugin answer, read-only and safely:
- What sleeve is active?
- What NeoStacks are inside this sleeve?
- What NeoBlocks are inside this NeoStack?
- What MOLT blocks are inside this NeoBlock?
- Which blocks are ON, OFF, blocked, missing, rejected, or dormant?
- What path did the runtime actually use?
- Which gates and triggers are present, watching, blocked, or excluded?

## Required Tool Surfaces

### 1. `umg_envoy_current_sleeve_status`

Purpose:
- Show active/current sleeve, top-level NeoStacks, active route summary, and current runtime state.

Proposed input schema:
```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "sleeveId": { "type": "string", "description": "Optional explicit sleeve override for inspection only." },
    "includeWarnings": { "type": "boolean", "default": true },
    "includeExcluded": { "type": "boolean", "default": true }
  }
}
```

Proposed output shape:
- `sleeve_id`
- `sleeve_title`
- `source_path`
- `mode`
- `status`
- `neostack_count`
- `neoblock_ref_count`
- `molt_block_count`
- `active_route`
- `excluded_lanes`
- `warnings`
- `activation_summary`

### 2. `umg_envoy_sleeve_tree`

Purpose:
- Show Sleeve → NeoStacks → NeoBlocks → MOLT Blocks by depth.

Defaults:
- default depth = `2`
- max depth = `4`

Proposed input schema:
```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["sleeveId"],
  "properties": {
    "sleeveId": { "type": "string" },
    "depth": { "type": "integer", "minimum": 1, "maximum": 4, "default": 2 },
    "showStates": { "type": "boolean", "default": true },
    "showWarnings": { "type": "boolean", "default": true }
  }
}
```

Depth behavior:
- `1` → Sleeve only
- `2` → Sleeve + NeoStacks
- `3` → Sleeve + NeoStacks + NeoBlocks
- `4` → Sleeve + NeoStacks + NeoBlocks + MOLT Blocks

### 3. `umg_envoy_neostack_inspect`

Purpose:
- Given a `sleeveId` and `neostackId`, show contained NeoBlocks, activation state, gates, triggers, dependencies, and warnings.

Proposed input schema:
```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["sleeveId", "neostackId"],
  "properties": {
    "sleeveId": { "type": "string" },
    "neostackId": { "type": "string" },
    "includeDependencies": { "type": "boolean", "default": true },
    "includeTriggers": { "type": "boolean", "default": true },
    "includeGates": { "type": "boolean", "default": true }
  }
}
```

Proposed output shape:
- `neostack_id`
- `title`
- `purpose`
- `status`
- `contained_neoblocks`
- `activation_rules`
- `gates`
- `triggers`
- `dependencies`
- `off_excluded_blocks`
- `warnings`

### 4. `umg_envoy_neoblock_inspect`

Purpose:
- Given a `neoblockId`, show contained MOLT blocks, MOLT type, content preview, source path, provenance, activation state, and warnings.

Proposed input schema:
```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["neoblockId"],
  "properties": {
    "neoblockId": { "type": "string" },
    "includeContentPreview": { "type": "boolean", "default": true },
    "includeProvenance": { "type": "boolean", "default": true }
  }
}
```

Proposed output shape:
- `neoblock_id`
- `kind`
- `molt_type`
- `status`
- `contained_molt_blocks`
- `content_preview`
- `source_path`
- `provenance`
- `activation_state`
- `dependencies`
- `warnings`

### 5. `umg_envoy_moltblock_inspect`

Purpose:
- Given a MOLT block id, show block content, MOLT type, merge/stack keys, role, status, and off reason.

Proposed input schema:
```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["moltBlockId"],
  "properties": {
    "moltBlockId": { "type": "string" },
    "includeContent": { "type": "boolean", "default": true },
    "includeStackData": { "type": "boolean", "default": true }
  }
}
```

Proposed output shape:
- `block_id`
- `molt_type`
- `role`
- `content`
- `status`
- `source_path`
- `merge_key`
- `stack_key`
- `stack_rank`
- `activation_state`
- `off_reason`
- `warnings`

### 6. `umg_envoy_runtime_ir_path`

Purpose:
- Show the active runtime route as Sleeve → NeoStack → NeoBlock → MOLT Block.

Proposed output shape:
- `active_sleeve`
- `active_neostacks`
- `active_neoblocks`
- `active_molt_blocks`
- `gates`
- `triggers`
- `enabled_paths`
- `disabled_paths`
- `blocked_paths`
- `warnings`
- `trace`

### 7. `umg_envoy_runtime_ir_matrix_full`

Purpose:
- Show compact IR matrix with nodes, edges, active/off states, gates, triggers, and excluded lanes.

Proposed output sections:
- `SLEEVE`
- `NEOSTACKS`
- `NEOBLOCKS`
- `MOLT`
- `Edges`
- `Excluded`
- `Warnings`

### 8. `umg_envoy_route_explain`

Purpose:
- Explain why a block/path is `ON`, `OFF`, `DORMANT`, `BLOCKED`, `REJECTED`, `MISSING`, or `SHADOWED`.

Proposed input schema:
```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "sleeveId": { "type": "string" },
    "neostackId": { "type": "string" },
    "neoblockId": { "type": "string" },
    "moltBlockId": { "type": "string" },
    "path": { "type": "string" }
  }
}
```

Rule:
- exactly one target selector should be used per call

## Response Envelope Design

Alpha.7 must design a response-visibility envelope that can render:
1. Active Stack
2. Envoy Intuition
3. Current Context — MOLT Map
4. Formal answer payload
5. IR Matrix when requested

### Default Compact Envelope

```text
Active Stack:
- Active Sleeve: <sleeve_id>
- Active NeoStack: <neostack_id or inferred route>
- Active NeoBlocks: <list>
- Active MOLT Blocks: <list>
- Runtime Mode: public_curated_readonly
- Tool Execution: off

(Envoy Intuition: <short self-evaluation of route/confidence/limits>)

Current Context — MOLT Map:
Trigger: <value>
Directive: <value>
Instruction: <value>
Subject: <value>
Primary: <value>
Philosophy: <value>
Blueprint: <value>

Formal Answer:
<tool payload rendered for the requested surface>
```

### Envoy Intuition Rules

Envoy Intuition must be:
- short
- non-chain-of-thought
- self-evaluation only
- focused on confidence, route, limitations, and next action

Example:

```text
(Envoy Intuition: The active sleeve is readable. The route is shallow-loaded and non-executing. One NeoBlock is active; six related refs are available but not loaded.)
```

### Optional IR Matrix Block

Shown only when requested or when diagnostics mode is enabled.

## IR Matrix Format

Canonical compact format:

```text
IR Matrix:
SLEEVE[neomagnetar-dynamic-persona-v1] = ON

NEOSTACKS:
- persona.runtime.core = ON
- persona.safety.boundary = ON
- persona.visual.output = DORMANT
- tool.execution.bridge = OFF

NEOBLOCKS:
- primary.sample = ON
- directive.sample = ON
- instruction.sample = ON
- subject.sample = ON
- philosophy.sample = WATCHING
- blueprint.sample = FORMAT
- trigger.sample = WATCHING

MOLT:
- Primary = ON
- Directive = ON
- Instruction = ON
- Subject = ON
- Philosophy = CONTEXTUAL
- Blueprint = OUTPUT_FORMAT
- Trigger = EVENT_GATE

Edges:
- Trigger → Directive
- Directive → Instruction
- Instruction → Primary
- Subject → Primary
- Blueprint → Output
- Philosophy → Tone/Value Constraint

Excluded:
- archive = OFF
- HUMAN = REFERENCE_ONLY
- Resleever = OFF
- direct_source = OFF
```

Rendering rules:
- compact by default
- deterministic ordering
- no recursive file execution
- no hidden activation claims without trace support

## Activation State Definitions

Use these states:
- `ON`
- `OFF`
- `DORMANT`
- `WATCHING`
- `BLOCKED`
- `REJECTED`
- `MISSING`
- `REFERENCE_ONLY`
- `FORMAT`
- `CONTEXTUAL`
- `SHADOWED`

Definitions:
- `ON` = actively used in current route
- `OFF` = deliberately disabled
- `DORMANT` = available but not currently used
- `WATCHING` = trigger/gate is present and observing conditions
- `BLOCKED` = wanted but blocked by policy or missing dependency
- `REJECTED` = rejected by resolver policy
- `MISSING` = referenced but not found
- `REFERENCE_ONLY` = visible but not machine-loaded
- `FORMAT` = controls response/output structure
- `CONTEXTUAL` = influences values/tone/context but does not directly command
- `SHADOWED` = exists but superseded by higher-priority block

## Resolver Rules

### Source Boundary Rules

Allowed:
- public curated indexes
- approved real-library allowlist roots already established in Alpha.6
- shallow inspection of approved target files when explicitly allowed by tool behavior

Disallowed:
- direct source loading from HUMAN lanes
- archive lane loading
- Resleever loading
- direct_source mode
- recursive full graph execution
- tool/action execution

### Resolution Strategy

Alpha.7 resolution should proceed in layers:
1. identify sleeve
2. parse declared refs
3. classify ref kinds
4. map refs to indexes
5. determine target availability
6. determine runtime state
7. optionally shallow-load explicitly requested approved targets
8. project graph state into envelope / matrix

### Graph Model

Internal graph should treat these as first-class node kinds:
- `SLEEVE`
- `NEOSTACK`
- `NEOBLOCK`
- `MOLT_BLOCK`
- `GATE`
- `TRIGGER`

Edge kinds:
- `contains`
- `resolves`
- `depends_on`
- `may_activate`
- `constrains`
- `blocked_by`
- `shadowed_by`
- `formats`
- `contextualizes`

## Data / Schema Notes

Alpha.7 should add normalized internal records for:
- current sleeve summary
- neostack membership map
- neoblock → molt decomposition map
- activation-state projection
- route trace
- excluded-lane register
- gate/trigger summary register

Implementation should prefer:
- pre-normalized internal JSON-ish structures
- deterministic field names
- stable output order
- machine-readable payload plus human-readable rendering

## Test / Smoke Plan

### Unit-Level / Local Smoke

1. current sleeve status smoke
- returns current sleeve summary
- shows runtime mode = `public_curated_readonly`
- tool execution = `off`

2. sleeve tree depth smoke
- depth 1/2/3/4 produce bounded output
- no uncontrolled dump

3. neostack inspect smoke
- valid neostack returns contained blocks and state
- unknown neostack yields clear hold/error

4. neoblock inspect smoke
- known neoblock returns MOLT decomposition
- source path and provenance visible

5. moltblock inspect smoke
- returns role/content/status safely
- no execution side effects

6. IR path smoke
- reports active route with explicit non-executing boundary

7. IR matrix smoke
- outputs compact node/edge/state projection
- excluded lanes always visible

8. route explain smoke
- explains `ON`, `OFF`, `DORMANT`, `REJECTED`, `MISSING`, `SHADOWED`

9. safety smoke
- HUMAN lane rejected as machine source
- archive rejected
- Resleever rejected
- direct_source rejected

10. regression smoke
- preserve Alpha.6 tool behavior
- preserve existing 18-tool public surface unless Alpha.7 intentionally expands it

## Hard Safety Boundaries

Alpha.7 must explicitly preserve:
- no recursive execution
- no tool execution
- no implicit activation beyond read-only state projection
- no direct loading from forbidden roots
- no archive fallback
- no HUMAN lane machine loading
- no Resleever loading
- no direct_source mode
- no hidden state mutation during inspect operations

Every new tool should state:
- runtime mode
- execution boundary
- source policy
- excluded lanes

## Implementation Sequence

### Step 1 — Internal Graph Inventory Layer
- define node and edge model
- define activation-state enum
- add normalized route/graph projection types

### Step 2 — Current Sleeve Summary
- implement `umg_envoy_current_sleeve_status`
- derive top-level current sleeve + warnings + excluded lanes

### Step 3 — Sleeve Tree Projection
- implement `umg_envoy_sleeve_tree`
- support depth-limited traversal

### Step 4 — Drill-Down Inspectors
- implement `umg_envoy_neostack_inspect`
- implement `umg_envoy_neoblock_inspect`
- implement `umg_envoy_moltblock_inspect`

### Step 5 — Route / State Explainers
- implement `umg_envoy_runtime_ir_path`
- implement `umg_envoy_route_explain`

### Step 6 — IR Matrix Renderer
- implement `umg_envoy_runtime_ir_matrix_full`
- add compact deterministic rendering

### Step 7 — Response Envelope Foundation
- build reusable envelope formatter for:
  - Active Stack
  - Envoy Intuition
  - Current Context — MOLT Map
  - Formal payload
  - optional IR Matrix

### Step 8 — Final Alpha.7 Regression + Safety Pass
- verify all new tools stay read-only
- confirm Alpha.6 boundaries remain intact
- confirm no execution path exists

## Output Guidance

Default response behavior should remain compact.

Every response should be able to show:
- Active Sleeve
- Current NeoStack
- Current MOLT Map
- Envoy Intuition

Deeper inspection should happen only on demand.

Do not load the entire library into every response.

## Recommended Next Development Order

1. finish Alpha.6 post-publish verification record
2. implement Alpha.7 full library graph inspector
3. implement Alpha.8 response envelope
4. implement Alpha.9 runtime route selection
5. implement Alpha.10 approval-gated tool binding

## Phase Summary

Alpha.6 created the first real bridge into the real UMG Block Library.

Alpha.7 should make the structure visible.

Alpha.8 should make the UMG-style response format native.

Alpha.9 should make routing dynamic.

Alpha.10 should connect tools with approvals.

That path reaches full UMG use without turning the plugin into a black box.
