# UMG Envoy Agent

UMG Envoy Agent is a modular cognitive architecture runtime built on the UMG system. This public release exposes a bounded planner and path-building surface for parsing, validating, rendering, and building human-inspectable runtime paths, while intentionally excluding internal compiler, rollback, promotion, and operator-heavy lanes from the public package.

## Release status

**Version:** `0.1.1`
**Release posture:** trust-cleanup public-safe release

## What it does
This public package exposes a bounded public-safe planner and path-building surface for:
- parsing planner shorthand
- validating planner shorthand
- rendering planner shorthand
- building a human-inspectable planner path from a message
- reporting high-level status and matrix summary

## Supported public commands
- `umg-envoy status`
- `umg-envoy parse-path`
- `umg-envoy validate-path`
- `umg-envoy render-path`
- `umg-envoy build-path`
- `umg-envoy matrix-status`

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
- `docs/RELEASE-NOTES-0.1.1.md`
