# UMG Envoy Agent v0.3.0-alpha.3

UMG Envoy Agent is an OpenClaw code plugin that runs Universal Modular Generation workflows as a modular cognitive architecture runtime: loading UMG sleeves, resolving artifacts, compiling canonical IR, and emitting runtime specs, traces, diagnostics, and relation matrices.

## What UMG Envoy Agent is

Universal Modular Generation, or UMG, is a modular framework for structuring AI instructions, workflows, and generation logic. It breaks context, rules, intent, tools, and output guidance into reusable blocks that can be assembled into sleeves, stacks, and runtime-ready structures.

UMG Envoy Agent is an OpenClaw code plugin that carries selected UMG structures into an agent/runtime workflow. It loads a UMG sleeve, resolves referenced artifacts, prepares canonical IR, calls the UMG compiler bridge, and exposes outputs such as runtime specs, traces, diagnostics, and relation matrices.

In UMG terminology, an Envoy is an agent-like carrier. The word Agent is included here for compatibility with common AI and OpenClaw terminology.

## Current publication status

- `0.3.0-alpha.1` is published on ClawHub as the first Operational Sleeve Demo Alpha.
- `0.3.0-alpha.2` is a packaging, public-listing, and artifact-route correction release.
- `0.3.0-alpha.3` is the minimized public artifact candidate with a dedicated public-safe entrypoint and narrowed package boundary.
- The public capability boundary remains alpha/demo-scoped.
- Raw npm publication is not the primary documented user path for this package at this stage.

## What it does

- reports UMG library status and metadata search results
- compiles dry-run RuntimeSpec projections without executing tools
- renders Runtime Display, MOLT Map, IR Matrix, and drill-down inspection views
- exposes operational sleeve demos for list / inspect / allowlisted demo flows
- exposes exact-scope local read-only planning and approved metadata-only scan surfaces
- provides a safe alpha demo that proves the governed metadata/runtime surfaces work

## Default posture

- allowRuntimeWrites: false
- contentMode: bundled-public
- compilerMode: bundled-adapter
- debug: false

## Current Capability Boundary

UMG Envoy Agent currently supports governed metadata execution, operational sleeve demos, and exact-scope local read-only metadata inspection.

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

This package is an OpenClaw code plugin for running Universal Modular Generation as a modular cognitive architecture runtime. It is meant to let testers and maintainers inspect bundled public UMG content, run local smoke checks, and exercise the public UMG runtime surface without shipping private roots or private runtime state.

### What this plugin is not

- not the full `UMG-Block-Library`
- not the full `umg-compiler` repository
- not unrestricted production sleeve execution
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

This is a code plugin. In normal packaged use, it loads bundled public content and exposes OpenClaw tools for inspection, metadata-only runtime projection, and operational sleeve demos.

The public alpha surface does not expose arbitrary shell execution, remote MCP execution, MCP server startup, unrestricted LangChain agent mode, file writes, or file deletes.

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

- **Runtime Spec**: the compiled active instruction package for a run
- **Trace**: a record of what happened during compilation or execution
- **Diagnostics**: warnings, validation notes, and errors
- **Relation Matrix**: a compact map showing how UMG parts connect

## Glossary

- **UMG**: Universal Modular Generation; a modular framework for structuring AI workflows and generation logic.
- **Envoy**: UMG’s term for an agent-like carrier that moves selected UMG structures into runtime action.
- **Agent**: the broader AI/OpenClaw term for an executable assistant, worker, or plugin-driven runtime participant.
- **Block**: a reusable unit of instruction, context, rule, value, capability, or output guidance.
- **MOLT**: Modular Operating Language of Thought; the role/layer system used to classify UMG blocks.
- **Sleeve**: a packaged UMG configuration or loadout.
- **Stack**: a layered grouping of related UMG structures or workflow elements.
- **NeoBlock**: a composed functional unit made from one or more related blocks.
- **NeoStack**: a larger workflow stack made from NeoBlocks or related structures.
- **Overlay**: a governance, routing, or control layer that can guide system behavior.
- **Capability**: a declared action, tool, or function available to the system.
- **Canonical IR**: the normalized machine-readable intermediate representation of selected UMG material.
- **Runtime Spec**: the compiled active instruction package for a run.
- **Trace**: a record of what happened during compilation or execution.
- **Diagnostics**: validation messages, warnings, and errors.
- **Relation Matrix**: a compact map of how UMG parts connect.
- **Compiler Bridge**: the controlled path Envoy uses to call the UMG compiler.
- **Artifact Resolution**: the process of locating and loading referenced UMG sleeves, blocks, overlays, capabilities, schemas, or related artifacts.

## Operational Sleeve Demos

```bash
node dist/plugin-entry-public.js umg-envoy sleeve-list
node dist/plugin-entry-public.js umg-envoy sleeve-demo --sleeve-id SL.UMG.LIBRARY_RESEARCH_DEMO.v0.1 --query "langchain bridge" --kind neostack --limit 3
node dist/plugin-entry-public.js umg-envoy sleeve-demo --sleeve-id SL.UMG.LANGCHAIN_BRIDGE_DEMO.v0.1 --display-mode debug
```

UMG has usable operational sleeve demos, but not unrestricted production sleeve execution yet.

The LangChain demo is governed handoff / HITL preview only. It does not start LangChain agent mode.

## Quick Alpha Demo

Run the alpha demo to verify safe UMG Envoy surfaces:

- library status
- metadata search
- tool capability summary
- runtime display
- exact-scope local readonly surface availability

This demo does not read file contents, write files, delete files, run shell commands, start MCP, run remote MCP, or run LangChain agent mode.

See also: `docs/UMG-RUNTIME-DISPLAY-CONTRACT.md`

Compact runtime display example:

```nl
Runtime Header:
Agent: OpenClaw UMG Envoy
Mode: OPERATIONAL_SLEEVE_DEMO
RuntimeSpec: runtime_spec_...
Trace: trace_...
Matrix: matrix_...
Execution: LangChain handoff preview generated. No agent started.
```

```nl
Active Runtime:
Selected Sleeve: SL.UMG.LANGCHAIN_BRIDGE_DEMO.v0.1
Selected NeoStack: NS.UMG.LANGCHAIN_BRIDGE.v0.1
Support Docs Runtime-Selected: false
```

```nl
Execution / Safety:
File Contents Read: false
Writes: false
Deletes: false
Shell: false
Remote MCP: false
LangChain Agent Mode: false
Approval Required: true
Checkpoint Required: true
SpecVersion: UMG_RUNTIME_DISPLAY.v0.1
```

```bash
node dist/plugin-entry.js umg-envoy runtime-alpha-demo --query "langchain bridge" --kind neostack --limit 3
```

## Library lane alignment

- `AI/` is the machine-facing source lane.
- `HUMAN/` is the human-readable support lane.
- `sleeves/manifests/` is the curated public/package-facing sleeve catalog.
- support docs are not runtime-selected artifacts.
- public demos prefer curated/package-facing sleeve catalogs where possible.

Resolver behavior in this alpha may still use generated index and fallback indexing when needed; do not assume perfect manifest coverage.

## Compiler alignment note

`umg-compiler` is an adjacent/compiler package. This `0.3.0-alpha.2` correction release does not expose external compiler process execution as a public tool. Future compiler/runtime sync should align RuntimeSpecV0, Trace, MOLT Map, IR Matrix, and Runtime Display schemas.

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

## ClawHub publication note

`0.3.0-alpha.1` is the first public ClawHub operational-sleeve alpha release.

`0.3.0-alpha.2` is reserved for packaging, listing, and artifact-format correction only. It does not widen the public capability boundary.

Maintainers should publish only from a validated release artifact and keep source repo / commit metadata aligned with the uploaded package.

## Entry point

- `dist/plugin-entry.js`
