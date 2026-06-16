# UMG Envoy Agent v0.3.0-alpha.15

UMG Envoy Agent is an OpenClaw plugin that exposes a runtime-facing UMG cognition specification and inspection layer. It loads governed UMG sleeves and related artifacts, supports inspection and library navigation, and emits dry-run runtime projections such as RuntimeSpec, Trace, diagnostics, and related runtime-visible views without making UMG itself an execution engine.

## What UMG Envoy Agent is

Universal Modular Generation, or UMG, is a framework for specifying cognition as explicit, governed, auditable artifacts before execution.

UMG Envoy Agent is an OpenClaw plugin that carries selected UMG cognition artifacts into runtime-facing inspection, projection, and downstream execution-preparation surfaces. It loads a UMG sleeve, resolves referenced artifacts, prepares compilation inputs, calls the UMG compiler bridge where allowed, and exposes outputs such as RuntimeSpec projections, Trace artifacts, diagnostics, and relation matrices.

In UMG terminology, an Envoy is a carrier surface for moving selected governed artifacts into downstream inspection, projection, or execution-preparation contexts. The word Agent is included here for compatibility with common AI and OpenClaw terminology.

## Publication status

- Current package version in this repo is `0.3.0-alpha.15`.
- ClawHub/public release publication remains a separate explicit operation after metadata alignment, validation review, and release-note audit.
- Raw npm publication is not the primary documented user path for this package at this stage.
- This repo now contains bounded runtime-facing capability work; that does **not** imply broad arbitrary execution support.

## What it does

- exposes runtime-facing inspection surfaces for governed UMG artifacts
- emits dry-run RuntimeSpec projections for downstream execution planning
- exposes Trace, diagnostics, and related inspection views without treating them as permission
- provides ActionGate runtime report inspection
- seeds a conservative ToolCapabilityRegistry policy for known Envoy tools
- emits ToolResult audit records for bounded direct runtime execution
- provides bundled public MOLT, NeoBlock, and NeoStack registry inspection with deterministic dry-run planning, sleeve composition preview, and composed sleeve validation
- provides a six-tool low-risk direct runtime runner for static safe read-only tools only
- keeps write, bridge, destructive, external, and arbitrary execution paths out of the current direct runner

## Governance-layer positioning

UMG Envoy Agent is packaged as an OpenClaw plugin, but its product role is broader: it is a runtime-facing governance, specification, inspection, and audit layer for AI-agent systems. For the strategic model-agnostic framing, see [`docs/FRONTIER-AGENT-GOVERNANCE-PACK-0.3.0-alpha.15.md`](docs/FRONTIER-AGENT-GOVERNANCE-PACK-0.3.0-alpha.15.md).

This positioning does not claim live OpenClaw host readiness, ClawHub publication status, unrestricted execution, or replacement of model-safety controls. The execution boundary remains governed by [`docs/GOVERNANCE-EXECUTION-CONTRACT-0.3.0-alpha.15.md`](docs/GOVERNANCE-EXECUTION-CONTRACT-0.3.0-alpha.15.md).

## Current surface status at 0.3.0-alpha.15

### Manifest-declared public tools

`openclaw.plugin.json` is the authoritative manifest-declared public surface for this repo line.

For exact current tool-id status, use `openclaw.plugin.json`, `docs/TOOL-SURFACE.md`, and `docs/RELEASE-TRUTH-0.3.0-alpha.15.md` together.

The manifest-declared surface includes bounded inspection, validation, comparison, path, runtime-report, direct-runner tools, the runtime-reconciled read-only `umg_envoy_load_sleeve` sleeve-loading/inspection surface, the read-only `umg_envoy_explain_sleeve` sleeve explanation surface, alpha17 bundled public cognitive registry / dry-run NeoStack planning surfaces, the alpha18 dry-run sleeve composition preview surface, and the alpha19 composed sleeve validation/audit surface. It also includes declared but governed bridge and relation-matrix-related surfaces.

### Runtime-reconciled manifest-declared read-only surface

`umg_envoy_load_sleeve` is source-present and, after runtime reconciliation in alpha.15, is now manifest-declared as a read-only public tool surface.

It is part of the current public manifest surface as a bounded sleeve-loading and inspection workflow surface. It should not be presented as arbitrary execution or as part of the first low-risk direct runner.

`umg_envoy_explain_sleeve` is source-present as a read-only public explanation surface. It compiles one bundled public sleeve through the bundled adapter and reports all block refs, active/skipped/disabled state, authority-ordered prompt parts, tool requests, warnings/errors, and RuntimeSpec boundary metadata without executing requested tools or writing runtime outputs.

`umg_envoy_cognitive_registry_query` and `umg_envoy_plan_neostack` are source-present alpha17 public-safe cognitive registry surfaces. They expose bundled MOLT block, NeoBlock, and NeoStack metadata and deterministic dry-run planning for an intent string. They do not generate or save sleeves, mutate block libraries, enable writes, call hidden LLM planners, or run external compiler bridge execution.

`umg_envoy_compose_sleeve_dry_run` is source-present as an alpha18 public-safe composition preview surface. It uses the alpha17 planner and bundled public cognitive registry to return a proposed sleeve outline, resolved NeoBlocks, resolved MOLT blocks, selection trace, composition trace, and explicit non-executing/no-write boundary metadata. It does not execute generated sleeves, save sleeves, merge sleeves, mutate the registry, enable writes, or invoke the external compiler bridge.

`umg_envoy_validate_composed_sleeve_dry_run` is source-present as an alpha19 public-safe validation/audit surface. It validates the alpha18 composed sleeve preview for selected NeoStack resolution, proposed sleeve id, sleeve outline, resolved NeoBlocks, resolved MOLT blocks, selection/composition/validation traces, and explicit non-executing/no-write/no-mutation/no-publication boundaries. It does not execute, export, install, publish, save, or mutate composed sleeves.

### Staged or historical names

Some capability-oriented labels in docs are staged, deferred, historical, or shorthand names rather than current public tool ids.

Staged/deferred names should not be read as current public tool ids. Historical names should not be read as current public tool ids.

For exact tool-id status, use `docs/TOOL-SURFACE.md`.

### Governance-gated declared tools

`umg_envoy_compile_ir_bridge` and `umg_envoy_emit_relation_matrix` are manifest-declared, but they are gated and config-constrained surfaces rather than evidence of unrestricted runtime execution.

The low-risk direct runner is narrow and should not be read as arbitrary execution.

### Truth boundary

These docs do not prove live OpenClaw host or CLI readiness.

These docs do not prove current ClawHub or publication status.

## Default posture

- allowRuntimeWrites: false
- contentMode: bundled-public
- compilerMode: bundled-adapter
- debug: false

## Current Capability Boundary

UMG Envoy Agent currently supports runtime-facing inspection, governed metadata projection, operational sleeve demos, and exact-scope local read-only metadata inspection.

### Boundary Notes

- UMG specifies cognition; it does not execute tools, actions, or behavior.
- This plugin exposes runtime-facing inspection and projection surfaces for governed UMG artifacts.
- RuntimeSpec is not execution.
- Trace is not permission.
- Validation does not grant permission.
- Approval does not equal execution.
- Display does not create authority.
- Governance remains binding and inspectable.

Capability themes and bounded surface areas:

The list below is capability-oriented shorthand, not a guarantee that each label corresponds to a current manifest-declared public tool id.

- UMG library status
- UMG library metadata search
- RuntimeSpec dry-run
- Runtime Display
- MOLT Map
- IR Matrix
- operational sleeve list / inspect / demo
- alpha demo
- exact-scope local read-only metadata scan
- LangChain handoff-only demo

Not allowed in this release:
- file contents reading
- file writes
- file deletes
- shell execution
- remote MCP execution
- MCP server startup
- LangChain agent mode execution
- broad Desktop Bridge automation
- unrestricted production sleeve execution

## Fresh tester quickstart

### What this plugin is

This package is an OpenClaw plugin for runtime-facing inspection and dry-run projection of governed UMG cognition artifacts. It is meant to let testers and maintainers inspect bundled public UMG content, run local smoke checks, and exercise the public runtime-facing UMG surface without shipping private roots or private runtime state.

### What this plugin is not

- not the whole UMG framework
- not the full `UMG-Block-Library`
- not the full `umg-compiler` repository
- not unrestricted execution
- not an autonomous behavior engine
- not a standalone runtime
- not arbitrary tool execution
- not a prompt wrapper
- not primarily documented for raw npm-registry end-user consumption
- not a private personal runtime package

### What ships in the package

- `dist/` compiled plugin output
- `docs/` public-facing package and release docs
- `public-content/` bundled sample blocks, sleeves, and runtime examples
- `README.md`
- `PUBLIC-VARIANT-README.md`
- `PUBLIC-VARIANT-OVERVIEW.md`
- `openclaw.plugin.json`
- `package.json`
- `tsconfig.json`

### What does not ship in the package

- the full `UMG-Block-Library`
- the full `umg-compiler` repo
- maintainer validation script source at `scripts/validate-umg-e2e.mjs`
- untracked release/audit reports
- runtime output artifacts such as `runtime-spec.json`, `trace.json`, `diagnostics.json`, `relation-matrix.umg`, or `resolved.ir.json`
- `node_modules/`

### Commands most testers should start with

```bash
npm install
npm run check
npm run build
npm run smoke
npm run pack:dry
```

### Execution boundary note

This is a code plugin. In normal packaged use, it loads bundled public content and exposes OpenClaw tools for runtime-facing inspection, metadata-only projection, and operational sleeve demos.

Optional compiler-bridge behavior may invoke a configured local compiler process through explicit configured paths. This is intended for controlled local UMG workflows, not arbitrary shell execution.

Maintainer-only validation assets are not part of the hardened ClawHub artifact.

### Maintainer-only validation gate

The npm script name is:

```bash
npm run validate:umg:e2e
```

That script runs the real repo file:

```text
scripts/validate-umg-e2e.mjs
```

Important notes:
- the earlier colon-style file wording (`scripts/validate-umg:e2e.mjs`) was just a typo/confusion between the npm script name and the file path
- `validate:umg:e2e` is a maintainer validation gate, not the normal first step for fresh testers
- it requires expected local adjacent repo paths for `UMG-Block-Library` and `umg-compiler`
- UO-specific paths, sleeves, or plugin test layouts are optional test contexts only and are not core Envoy defaults
- it remains repo-only and is intentionally not shipped in the published package surface

If you do not already have the expected local UMG dependency layout, stop at `check`, `build`, `smoke`, and `pack:dry`.

## Current bounded direct runner

This adapter is narrower than the full manifest-declared surface and should not be read as a generic execution path.

Envoy now exposes:
- `umg_envoy_low_risk_direct_tool_run`

It is limited to exactly these six static safe tools:
- `umg_envoy_status`
- `umg_envoy_validate_runtime_output`
- `umg_envoy_parse_path`
- `umg_envoy_validate_path`
- `umg_envoy_render_path`
- `umg_envoy_action_gate_runtime_report_view`

Every successful direct run returns `ToolResult` audit data.

Explicit exclusions from this first direct runner:
- `umg_envoy_load_sleeve`
- `umg_envoy_explain_sleeve`
- `umg_envoy_cognitive_registry_query`
- `umg_envoy_plan_neostack`
- `umg_envoy_compose_sleeve_dry_run`
- `umg_envoy_validate_composed_sleeve_dry_run`
- `umg_envoy_compile_ir_bridge`
- `umg_envoy_emit_relation_matrix`
- `umg_envoy_compile_sleeve`
- `umg_envoy_build_path`

`umg_envoy_load_sleeve` is now manifest-declared in alpha.15 after runtime reconciliation, but it remains read-only and excluded from the first low-risk direct runner.
`umg_envoy_explain_sleeve` is manifest-declared as a read-only explanation surface, but it remains excluded from the first low-risk direct runner.
`umg_envoy_cognitive_registry_query` and `umg_envoy_plan_neostack` are manifest-declared as read-only/dry-run cognitive registry surfaces, but they remain excluded from the first low-risk direct runner.
`umg_envoy_compose_sleeve_dry_run` is manifest-declared as a dry-run composition preview surface, but it remains excluded from the first low-risk direct runner.
`umg_envoy_validate_composed_sleeve_dry_run` is manifest-declared as a dry-run validation/audit surface, but it remains excluded from the first low-risk direct runner.
- unknown tools
- arbitrary dispatch
- writes / deletes
- network or external transmission
- package or plugin mutation

Boundary rules remain strict:
- RuntimeSpec is not execution authority.
- Trace is not permission.
- ActionGate and ToolCapabilityRegistry govern execution eligibility.
- Approval-gated writes and external transmission are not enabled yet.

### Plain-English output guide

- **Runtime Spec**: a dry-run runtime projection for downstream execution planning
- **Trace**: an audit artifact recording compilation/resolution inputs, selections, suppressions, and outcomes
- **Diagnostics**: warnings, validation notes, and errors
- **Relation Matrix**: a compact map showing how UMG parts connect

## Glossary

- **UMG**: Universal Modular Generation; a framework for specifying cognition as explicit, governed, auditable artifacts before execution.
- **Envoy**: a carrier surface that moves selected UMG cognition artifacts into runtime-facing inspection, projection, or execution-preparation contexts.
- **Agent**: the broader AI/OpenClaw term for an executable assistant, worker, or plugin-driven runtime participant.
- **Block**: a reusable cognitive artifact unit used in governed UMG specification.
- **MOLT**: Modular Operating Language of Thought; the role/layer system used to classify UMG blocks.
- **Sleeve**: a packaged UMG configuration or loadout.
- **Stack**: a layered grouping of related UMG structures or workflow elements.
- **NeoBlock**: a composed functional unit made from one or more related blocks.
- **NeoStack**: a larger workflow stack made from NeoBlocks or related structures.
- **Overlay**: a governance, routing, or control layer that can guide system behavior.
- **Capability**: a declared action, tool, or function available to the system.
- **Runtime Spec**: a dry-run runtime projection for downstream execution planning.
- **Trace**: an audit artifact recording compilation/resolution inputs, selections, suppressions, and outcomes.
- **Diagnostics**: validation messages, warnings, and errors.
- **Relation Matrix**: a compact map of how UMG parts connect.
- **Compiler Bridge**: the controlled path Envoy uses to call the UMG compiler.
- **Artifact Resolution**: the process of locating and loading referenced UMG sleeves, blocks, overlays, capabilities, schemas, or related artifacts.

## Build and validation

```bash
npm install
npm run check
npm run build
npm run smoke
npm run pack:dry
```

Maintainers with the expected local adjacent repos may also run:

```bash
npm run validate:umg:e2e -- --sleevePath "<path-to-sleeve.json>" --libraryRoot "<path-to-UMG-Block-Library>" --compilerRepoPath "<path-to-umg-compiler>"
```

## External UMG validation boundary

External UMG validation requires explicit local inputs:
- an explicit sleeve path
- an explicit `UMG-Block-Library` root
- an explicit `umg-compiler` repo path

Runtime outputs remain temp-only and are not intended for commit.

## ClawHub-first publication note

ClawHub publication is the intended first public plugin path for this package line. That publication step remains intentionally separate from the current repo-truth and docs-only reconciliation lanes.

Future maintainer reference only, not to run as part of this documentation lane:

```text
clawhub package publish <path> --family code-plugin --name umg-envoy-agent --display-name "UMG Envoy Agent" --version 0.3.0-alpha.15 ...
```

For exact declared public tool ids, see `openclaw.plugin.json` and `docs/TOOL-SURFACE.md`.

For exact current tool-id status, use `openclaw.plugin.json`, `docs/TOOL-SURFACE.md`, and `docs/RELEASE-TRUTH-0.3.0-alpha.15.md` together.

## Entry point

- `dist/plugin-entry.js`
