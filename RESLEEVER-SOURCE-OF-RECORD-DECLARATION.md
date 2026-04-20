# Resleever Plugin Source-of-Record Declaration

Generated: 2026-04-20

## Canonical internal plugin

The canonical internal / Resleever-connected plugin is:
- `umg-envoy-agent`
- source-of-record path: `C:\.openclaw\workspace\artifacts\umg-envoy-agent-plugin`

## Evidence

### OpenClaw install metadata
Current OpenClaw config records:
- `plugins.installs.umg-envoy-agent.sourcePath = C:\.openclaw\workspace\artifacts\umg-envoy-agent-plugin`
- `plugins.installs.umg-envoy-agent.installPath = C:\.openclaw\workspace\artifacts\umg-envoy-agent-plugin`

This means:
- the plugin is installed from the same directory it uses as its source path
- there is no separate copied install directory for this plugin at present

### Enabled state
Current config shows:
- `plugins.entries.umg-envoy-agent.enabled = false`

So the internal plugin is currently disabled in config, but it is still the canonical installed source-of-record.

## Authoritative files

The authoritative internal plugin files live under:
- `src/`
- `dist/`
- `openclaw.plugin.json`
- `package.json`
- `README.md`
- `docs/`
- `spec/`
- `validation/`
- `vendor/UMG_Envoy_Resleever`
- `vendor/umg-compiler`

## Drift assessment

### Source vs installed/runtime copy
For the internal plugin, source and installed path are the same directory:
- `sourcePath == installPath == C:\.openclaw\workspace\artifacts\umg-envoy-agent-plugin`

Conclusion:
- there is **no separate install-copy drift** to manage for `umg-envoy-agent`
- edits to this directory are edits to the canonical installed artifact

### Internal vs public derivative
A distinct public derivative package also exists at:
- `C:\.openclaw\workspace\repair-lanes\umg-envoy-agent-public-v0-rc1`

This public derivative is **not authoritative** for the internal plugin.

## Final declaration

The real internal plugin lives here:
- `C:\.openclaw\workspace\artifacts\umg-envoy-agent-plugin`

That directory is the canonical source-of-record for:
- the Resleever-connected UMG Envoy plugin
- future stabilization work
- future workspace-finalized internal version
