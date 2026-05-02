# UMG Envoy Agent v0.2.9

UMG Envoy Agent is an OpenClaw code plugin for bundled-adapter public UMG workflows: loading bundled public sleeves, resolving artifacts, validating runtime outputs, and providing public-safe diagnostics and inspection surfaces.

## What UMG Envoy Agent is

Universal Modular Generation, or UMG, is a modular framework for structuring AI instructions, workflows, and generation logic. It breaks context, rules, intent, tools, and output guidance into reusable blocks that can be assembled into sleeves, stacks, and runtime-ready structures.

UMG Envoy Agent is an OpenClaw code plugin that carries selected bundled public UMG structures into an agent/runtime workflow. In the public package it resolves bundled artifacts, uses the bundled adapter path, and exposes public-safe outputs such as runtime validation, diagnostics, sleeve inspection, and path tooling.

In UMG terminology, an Envoy is an agent-like carrier. The word Agent is included here for compatibility with common AI and OpenClaw terminology.

## Publication status

- `v0.2.2` was the GitHub proof milestone and release-hardening checkpoint.
- `v0.2.3` is a publication-cleanup patch focused on docs, packaging clarity, and fresh-tester onboarding.
- ClawHub publication is intentionally handled as a separate final release operation after cleanup, validation, re-audit, and explicit publish authorization.
- Raw npm publication is not the primary documented user path for this package at this stage.

## What it does

- compiles bundled public sleeves into Runtime Spec-like output
- validates runtime output structure honestly
- lists bundled sleeves and bundled block libraries
- compares sleeves
- keeps public path parse / validate / render / build tools
- runs a smoke test that proves the bundled public compiler loop works

## Default posture

- allowRuntimeWrites: false
- contentMode: bundled-public
- compilerMode: bundled-adapter
- debug: false

## Public package boundary (v0.2.9 target)

The public package is intended to remain bundled-adapter only.
It should expose public sleeve/content inspection, validation, diagnostics, and safe runtime output checks.
It should not ship external compiler process bridge surfaces in the public artifact.

That means the public package should not expose:
- `child_process`
- `spawn(...)`
- external compiler bridge tool registration
- relation-matrix bridge execution surfaces that depend on the external compiler bridge

## Fresh tester quickstart

### What this plugin is

This package is an OpenClaw code plugin for running Universal Modular Generation as a modular cognitive architecture runtime. It is meant to let testers and maintainers inspect bundled public UMG content, run local smoke checks, and exercise the public UMG runtime surface without shipping private roots or private runtime state.

### What this plugin is not

- not the full `UMG-Block-Library`
- not the full `umg-compiler` repository
- ClawHub publication is handled as a separate release operation; check the current ClawHub listing or GitHub release notes for publication status
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

This is a code plugin. In normal packaged use, it loads bundled public content and exposes OpenClaw tools for inspection and validation.

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

## Entry point

- `dist/plugin-entry.js`
