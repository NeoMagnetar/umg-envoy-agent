# UMG Envoy Agent v0.2.8

UMG Envoy Agent is an OpenClaw plugin that exposes a runtime-facing UMG cognition specification and inspection layer. It loads governed UMG sleeves and related artifacts, supports inspection and library navigation, and emits dry-run runtime projections such as RuntimeSpec, Trace, diagnostics, and related runtime-visible views without making UMG itself an execution engine.

## What UMG Envoy Agent is

Universal Modular Generation, or UMG, is a framework for specifying cognition as explicit, governed, auditable artifacts before execution.

UMG Envoy Agent is an OpenClaw plugin that carries selected UMG cognition artifacts into runtime-facing inspection, projection, and downstream execution-preparation surfaces. It loads a UMG sleeve, resolves referenced artifacts, prepares compilation inputs, calls the UMG compiler bridge where allowed, and exposes outputs such as RuntimeSpec projections, Trace artifacts, diagnostics, and relation matrices.

In UMG terminology, an Envoy is a carrier surface for moving selected governed artifacts into downstream inspection, projection, or execution-preparation contexts. The word Agent is included here for compatibility with common AI and OpenClaw terminology.

## Publication status

- `v0.2.2` was the GitHub proof milestone and release-hardening checkpoint.
- `v0.2.3` is a publication-cleanup patch focused on docs, packaging clarity, and fresh-tester onboarding.
- ClawHub publication is intentionally handled as a separate final release operation after cleanup, validation, re-audit, and explicit publish authorization.
- Raw npm publication is not the primary documented user path for this package at this stage.

## What it does

- exposes runtime-facing inspection surfaces for governed UMG artifacts
- supports library metadata search and governed sleeve navigation
- emits dry-run RuntimeSpec projections for downstream execution planning
- exposes Trace, runtime-visible display, MOLT Map, diagnostics, and related inspection views
- supports bounded demo and exact-scope read-only planning/inspection flows
- keeps execution downstream and approval-gated

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

Allowed alpha capabilities:
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

ClawHub publication is the intended first public plugin path for this package line. That publication step remains intentionally separate from this patch.

Future maintainer reference only, not to run during Stage 14D:

```text
clawhub package publish <path> --family code-plugin --name umg-envoy-agent --display-name "UMG Envoy Agent" --version 0.2.3 ...
```

For exact declared public tool ids, see `openclaw.plugin.json` and `docs/TOOL-SURFACE.md`.

## Entry point

- `dist/plugin-entry.js`
