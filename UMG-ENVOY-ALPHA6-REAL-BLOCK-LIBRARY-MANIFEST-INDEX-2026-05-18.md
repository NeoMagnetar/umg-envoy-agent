# UMG Envoy Alpha6 — Real Block Library Manifest Index

Date: 2026-05-18

## Verdict

`ALPHA6_REAL_BLOCK_LIBRARY_MANIFEST_INDEX_SOURCE_READY`

## Baseline

Previous verdict:
- `ALPHA6_REAL_BLOCK_LIBRARY_RESOLVER_LIVE_READY`

Previous commit:
- `d859453`

Official runtime truth:
- entrypoint: `dist/plugin-entry.js`
- source entry: `src/plugin-entry.ts`
- version: `0.3.0-alpha.6`
- live tool confirmed: `umg_envoy_block_library_status`
- root: `C:\.openclaw\workspace\UMG-Block-Library`
- readOnly: `true`
- execution: `not_performed`
- directSource: `not_enabled`

## New Tool

- `umg_envoy_block_library_manifest_index`

## Scope

This step added a read-only manifest-index inspection tool to the official Alpha6 compiler-backed runtime source lane.

This step does not yet claim live promotion.
The installed OpenClaw extension still reflects the previously promoted resolver-live step and has not yet been updated with the new manifest-index tool.

## Verification

Passed:
- `openclaw plugins info umg-envoy-agent`
- `openclaw doctor --non-interactive`
- `openclaw health --json`
- `npm run check`
- `npm run build`
- `node scripts\alpha6-path-valid-smoke.mjs`
- `node scripts\alpha6-path-invalid-smoke.mjs`
- `node scripts\alpha6-real-block-library-resolver-smoke.mjs`
- `node scripts\alpha6-real-block-library-manifest-index-smoke.mjs`

## Source Manifest Index Result

Observed from source smoke:
- `libraryRoot`: `C:\.openclaw\workspace\UMG-Block-Library`
- `rootExists`: `true`
- `mode`: `real_block_library_manifest_index`
- `readOnly`: `true`
- `execution`: `not_performed`
- `directSource`: `not_enabled`

### Summary
- `manifestCount`: `7`
- `parsedManifestCount`: `5`
- `normalizedManifestCount`: `4`
- `missingManifestCount`: `2`
- `parseFailedManifestCount`: `0`
- `shapeUnknownManifestCount`: `1`
- `totalEntryCount`: `20`
- `allowedTargetEntryCount`: `7`
- `missingTargetEntryCount`: `9`
- `forbiddenTargetEntryCount`: `1`
- `outsideAllowlistTargetEntryCount`: `2`

### Manifest statuses observed
Required manifests:
- `AI/MANIFESTS/neoblock-library-index.json` → `PRESENT_PARSED_NORMALIZED`
- `AI/MANIFESTS/molt-block-library-index.json` → `PRESENT_PARSED_NORMALIZED`
- `AI/MANIFESTS/neostack-library-index.json` → `PRESENT_PARSED_NORMALIZED`
- `sleeves/manifests/catalog.json` → `PRESENT_PARSED_NORMALIZED`

Optional manifests:
- `AI/MANIFESTS/gate-library-index.json` → `PRESENT_PARSED_SHAPE_UNKNOWN`
- `AI/MANIFESTS/sleeve-library-index.json` → `MISSING_OPTIONAL`
- `AI/MANIFESTS/compiler-library-index.json` → `MISSING_OPTIONAL`

## Classification Behavior

Confirmed:
- approved manifest files are inspected only
- JSON is parsed safely, including BOM-tolerant reads
- manifest entries are normalized when shape is understood
- target paths are classified without loading target payload files
- missing targets are counted separately
- forbidden targets are counted separately
- outside-allowlist targets are counted separately
- no recursive full-library load occurs
- no target NeoBlock / MOLT block / NeoStack payload loading occurs
- no UMG-Block-Library mutation occurs

## Notable Findings

- `sleeves/manifests/catalog.json` includes entries that currently classify as:
  - `OUTSIDE_ALLOWLIST_TARGET` (`SLV.OPERATOR.json`, `sleeve-neomagnetar-dynamic-persona-v1.json`)
  - `FORBIDDEN_TARGET` (`archive/sample-basic_minimal.json`)
- `gate-library-index.json` exists but its shape is not yet normalized by the alpha6 source manifest-index implementation.
- Several block-library targets referenced through `blocks/library/...` paths classify as `MISSING_TARGET` under the current root-relative allowlist model, which is correctly reported without trying to load payloads.

## Live Runtime Status

Current live plugin remains healthy but unchanged for this step:
- loaded: `yes`
- version: `0.3.0-alpha.6`
- live tools still include `umg_envoy_block_library_status`
- live tool list does not yet include `umg_envoy_block_library_manifest_index`

Therefore this step is correctly classified as:
- `SOURCE_READY`
- not `LIVE_READY`

## Boundaries Confirmed

- no publish performed
- no package created
- stale `plugin-entry-public` references not treated as live runtime truth
- no target payload loading
- no recursive full-library load
- no UMG-Block-Library mutation

## Required Next Task

Next task:
`ALPHA6_REAL_BLOCK_LIBRARY_MANIFEST_INDEX_LIVE_PROMOTION`
