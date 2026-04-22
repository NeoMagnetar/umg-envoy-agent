# UMG Envoy Agent

UMG Envoy Agent is a modular cognitive runtime for OpenClaw that lets you parse, validate, render, and build human-inspectable planner paths through a bounded public-safe interface.

UMG Envoy Agent is a modular cognitive architecture runtime built on the UMG system. This public release exposes a bounded planner and path-building surface for parsing, validating, rendering, and building human-inspectable runtime paths, while intentionally excluding internal compiler, rollback, promotion, and operator-heavy lanes from the public package.

## Release status

**Version:** `0.1.2`
**Release posture:** trust-cleanup public-safe release

## Why use it

UMG Envoy Agent is useful when you want a readable, reviewable planner workflow instead of opaque internal execution. Its public surface is designed to help users inspect structure before downstream action, making it better suited for bounded planning, path validation, and human review than for direct engine-room runtime control.

## What it does

UMG Envoy Agent helps you work with structured planner paths in a bounded public-safe workflow. It lets you:
- parse planner shorthand into inspectable structure
- validate planner paths before downstream use
- render paths into readable output
- build human-inspectable runtime paths from a message
- inspect the currently exposed public command surface

## Supported public commands
- `umg-envoy status`
- `umg-envoy parse-path`
- `umg-envoy validate-path`
- `umg-envoy render-path`
- `umg-envoy build-path`
- `umg-envoy matrix-status`

## Example workflow

A typical public-safe workflow is:

```bash
umg-envoy parse-path --file sample.umg
umg-envoy validate-path --file sample.umg
umg-envoy render-path --file sample.umg
```

This gives you a staged planner workflow:
1. parse the input
2. validate structure and constraints
3. render a human-inspectable output

You can also build a path directly from a message:

```bash
umg-envoy build-path --message "Plan a bounded release trust-cleanup pass"
```

## What `matrix-status` is for

`matrix-status` reports the bounded public command surface currently exposed by the package and helps confirm that the public lane is operating in a fail-closed posture.

## Public boundary

UMG Envoy Agent is a bounded planner and path-building interface, not the full internal UMG compiler/governance runtime.

## Intentionally excluded from the public package
This public package does **not** ship:
- internal compiler/build orchestration lanes
- rollback and promotion lanes
- runtime authoring/scaffolding lanes
- internal operator-heavy runtime surfaces
- full `path-trace`
- full `adapter-trace`
- full `compiler-trace`
- raw bridge provenance

## Included package contents
This public package includes:
- `dist/` compiled public plugin runtime
- `docs/` public-facing package docs
- `README.md`
- `PUBLIC-VARIANT-README.md`
- `PUBLIC-VARIANT-OVERVIEW.md`
- `openclaw.plugin.json`
- `package.json`

## Install
### Local path install in OpenClaw
Use the plugin folder directly:

- `C:\.openclaw\workspace\artifacts\umg-envoy-agent-plugin-public-block-library`

### Package prerequisites
- Node.js `>=22`
- OpenClaw plugin runtime compatible with plugin API `1`

### Build
From the plugin root:

```bash
npm install
npm run build
```

If you are using the prepared packaged release, `dist/` is already included.

## Configuration
OpenClaw package metadata required for publishing and installation lives in:
- `package.json -> openclaw.extensions`
- `package.json -> openclaw.configSchema`

Plugin manifest metadata lives in:
- `openclaw.plugin.json`

## Public-safe posture
UMG Envoy Agent is a modular cognitive architecture runtime for OpenClaw that exposes a bounded public-safe planner and path-building surface from the broader UMG system.

It should be evaluated as a bounded public package, not as the full internal UMG runtime lane.

## See also
- `docs/TOOL-SURFACE.md`
- `docs/PUBLIC-SAFE-CAPABILITY.md`
- `docs/INSTALL.md`
- `docs/RELEASE-NOTES-0.1.2.md`

