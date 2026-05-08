# Changelog

## 0.3.0-alpha.3

- Create a dedicated public-safe plugin entrypoint for the approved public alpha surfaces.
- Retarget the package to `dist/plugin-entry-public.js` and exclude compiler bridge, MCP bridge, LangChain bridge, and approval resume executor internals from the packed artifact.
- Preserve package identity and public behavior while tightening the shipped artifact boundary.

## 0.3.0-alpha.2

UMG Envoy Agent 0.3.0-alpha.2 — Public Listing / Packaging Correction Alpha

### Changed

- Tightens the public package story around the operational sleeve alpha boundary.
- Updates README publication status and removes stale 0.2.x-era publish guidance from the public listing surface.
- Narrows the public manifest tool list to the read-only, metadata-only, runtime-display, operational-sleeve-demo, and exact-scope local-readonly alpha surfaces.
- Aligns package/manifest versions for the packaging-correction release.

### Notes

- This release is intended as a public listing, metadata, and artifact-format correction pass.
- No new UMG runtime capability is introduced.
- The alpha boundary remains: usable operational sleeve demos, not unrestricted production sleeve execution.

## 0.3.0-alpha.1

UMG Envoy Agent 0.3.0-alpha.1 — Operational Sleeve Demo Alpha

### Added

- UMG Runtime Display contract with compact, developer, and debug render modes.
- Safe alpha demo/self-test surface for governed metadata and runtime projection.
- Operational sleeve demo layer with:
  - `SL.UMG.LIBRARY_RESEARCH_DEMO.v0.1`
  - `SL.UMG.LOCAL_READONLY_WORKSPACE_DEMO.v0.1`
  - `SL.UMG.LANGCHAIN_BRIDGE_DEMO.v0.1`
- Public sleeve surfaces:
  - `umg_envoy_sleeve_list`
  - `umg_envoy_sleeve_inspect`
  - `umg_envoy_sleeve_demo`
- Exact-scope local read-only metadata planning and approved scan flow.

### Capability boundary

This release supports:
- UMG library status and metadata search
- RuntimeSpec dry-run
- runtime dashboard / MOLT Map / IR Matrix / runtime display
- operational sleeve list / inspect / demo
- alpha demo
- exact-scope local read-only metadata scan
- LangChain handoff-only demo

This release does not support:
- file contents reading
- file writes
- file deletes
- shell execution
- remote MCP execution
- MCP server startup
- LangChain agent mode execution
- broad Desktop Bridge automation
- unrestricted production sleeve execution

## 0.2.8

Install metadata validation correction release.

### Fixed

- Corrects `openclaw.install.minHostVersion` to the OpenClaw installer-required semver floor format `>=2026.3.23`.
- Preserves `openclaw.compat.pluginApi` as `>=1.2.0`.
- Preserves runtime, compiler bridge, artifact resolver, relation matrix, sleeve, block, NeoBlock, and NeoStack behavior.

### Notes

- This release exists because `0.2.7` fixed the plugin API version axis but still used `>=2026.3.23-1` in `install.minHostVersion`, which the installer rejects.
- No runtime behavior changes are included.
