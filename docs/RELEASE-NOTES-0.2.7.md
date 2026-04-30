# UMG Envoy Agent v0.2.7

UMG Envoy Agent v0.2.7 is a metadata-only compatibility correction release. It fixes the OpenClaw plugin API compatibility range so compatible OpenClaw runtimes exposing plugin API 1.2.0 can install the package. No runtime, compiler, relation matrix, artifact resolver, or sleeve behavior changes are included.

## Root cause

v0.2.6 published `openclaw.compat.pluginApi` using the OpenClaw host/build version axis:

- `>=2026.3.23-1`

Local OpenClaw installer compatibility code compares that field against the runtime plugin API semver value:

- `1.2.0`

v0.2.7 corrects that metadata mismatch by placing plugin API compatibility on the plugin API semver axis and host compatibility on the host-version axis.

## Fixed

- Corrected `openclaw.compat.pluginApi` from the OpenClaw host/build version axis to the plugin API semver axis.
- Added/uses `openclaw.install.minHostVersion` for host-version gating.
- Preserved `openclaw.compat.minGatewayVersion` and build provenance metadata.

## Unchanged

- No UMG runtime behavior changes.
- No compiler bridge behavior changes.
- No relation matrix behavior changes.
- No artifact resolver behavior changes.
- No sleeve/block/NeoBlock/NeoStack logic changes.
- No public description or hardened staging model changes.

## Validation

- `npm run build`
- `npm run check`
- `npm run smoke`
- `npm run pack:dry`
- canonical `npm run validate:umg:e2e`
- hardened staging audit
