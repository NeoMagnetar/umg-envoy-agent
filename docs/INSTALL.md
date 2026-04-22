# Install

## Package identity

- Package name: `umg-envoy-agent`
- Display name: `UMG Envoy Agent`
- Version: `0.1.2`

## What this package is for

UMG Envoy Agent is a modular cognitive runtime for OpenClaw that lets you parse, validate, render, and build human-inspectable planner paths through a bounded public-safe interface.

## Install from local path

Use the plugin folder directly:

- `C:\.openclaw\workspace\artifacts\umg-envoy-agent-plugin-public-block-library`

## Requirements

- Node.js `>=22`
- OpenClaw plugin runtime compatible with plugin API `1`

## Build

From the plugin root:

```bash
npm install
npm run build
```

If you are using the prepared package release, `dist/` is already included.

## Minimal workflow example

```bash
umg-envoy parse-path --file sample.umg
umg-envoy validate-path --file sample.umg
umg-envoy render-path --file sample.umg
```

## Configuration metadata

For OpenClaw package publishing and installation, the public package metadata lives in:

- `package.json -> openclaw.extensions`
- `package.json -> openclaw.configSchema`

Plugin manifest metadata lives in:

- `openclaw.plugin.json`

