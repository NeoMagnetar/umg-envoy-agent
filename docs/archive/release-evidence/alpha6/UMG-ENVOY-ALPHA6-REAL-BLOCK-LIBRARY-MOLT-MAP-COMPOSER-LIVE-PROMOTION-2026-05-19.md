# UMG Envoy Alpha6 — Real Block Library MOLT Map Composer Live Promotion

Date: 2026-05-19

## Verdict

`ALPHA6_REAL_BLOCK_LIBRARY_MOLT_MAP_COMPOSER_LIVE_READY`

## Baseline

Previous step:
- `ALPHA6_REAL_BLOCK_LIBRARY_MOLT_MAP_COMPOSER_SOURCE_READY`

Previous commit:
- `6c91aeca8b10ee0c81ed7150c49654c1da1abcea`

Previous report:
- `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-REAL-BLOCK-LIBRARY-MOLT-MAP-COMPOSER-SOURCE-2026-05-19.md`

Official Alpha6 runtime truth:
- entrypoint: `dist/plugin-entry.js`
- version: `0.3.0-alpha.6`
- source entry: `src/plugin-entry.ts`

## Promoted Artifacts

Copied into installed extension:
- `plugin-entry.js`
- `plugin-entry.d.ts`
- `block-library-resolver.js`
- `block-library-resolver.d.ts`

Installed extension:
- `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`

## Live Tool Verification

Confirmed live tools:
- `umg_envoy_block_library_status`
- `umg_envoy_block_library_manifest_index`
- `umg_envoy_block_library_manifest_entry_lookup`
- `umg_envoy_block_library_target_shallow_load_gate`
- `umg_envoy_block_library_target_shallow_load_single`
- `umg_envoy_block_library_target_shallow_summary_normalize`
- `umg_envoy_block_library_neoblock_inspect`
- `umg_envoy_block_library_moltblock_visible_extract`
- `umg_envoy_block_library_molt_map_fragment`
- `umg_envoy_block_library_molt_map_compose`

## Live Full Composition

Confirmed:
- `compositionStatus = MOLT_MAP_COMPOSED`
- `requestedCount = 7`
- `fragmentCount = 7`
- `composedFieldCount = 7`
- `missingFieldCount = 0`
- `duplicateFieldCount = 0`
- `deniedFragmentCount = 0`

Confirmed fields:
- `Trigger` from `trigger.sample`
- `Directive` from `directive.sample`
- `Instruction` from `instruction.sample`
- `Subject` from `subject.sample`
- `Primary` from `primary.sample`
- `Philosophy` from `philosophy.sample`
- `Blueprint` from `blueprint.sample`

Confirmed NL projection:
- includes all seven fields
- fixed order:
 - `Trigger`
 - `Directive`
 - `Instruction`
 - `Subject`
 - `Primary`
 - `Philosophy`
 - `Blueprint`

## Live Partial / Edge Cases

Confirmed:
- partial composition returns `MOLT_MAP_COMPOSED_WITH_MISSING_FIELDS`
- missing fields render as `n/a`
- duplicate field composition returns `MOLT_MAP_COMPOSED_WITH_CONFLICTS`
- denied fragment composition returns `MOLT_MAP_COMPOSED_WITH_DENIED_FRAGMENTS`
- empty query returns `HOLD_MOLT_MAP_COMPOSE_QUERY_REQUIRED`
- unsupported projection format returns `HOLD_MOLT_MAP_COMPOSE_PROJECTION_FORMAT_UNSUPPORTED`
- unsupported conflict policy returns `HOLD_MOLT_MAP_COMPOSE_CONFLICT_POLICY_UNSUPPORTED`
- raw target dump returns `HOLD_RAW_TARGET_DUMP_NOT_SUPPORTED`

Known non-blocking behavior:
- denied fragment entries carry precise hold codes in `errors`
- secondary `fragmentStatus` remains a generic denied label
- classification: `NON_BLOCKING_DENIED_FRAGMENT_STATUS_DETAIL_DRIFT`

## Health

Confirmed:
- live plugin loaded
- `openclaw health --json` reports `ok: true`
- no UMG/plugin-specific regression surfaced

Observed non-UMG notices:
- orphan transcript files
- live session lock file
- browser attach/version notes
- memory-search provider readiness notes

Classification:
- `NON_UMG_OPENCLAW_HOUSEKEEPING_SEPARATE_LANE`

## Safety Confirmations

Confirmed:
- no execution
- no direct_source
- no recursive full-library load
- no full library scan
- no referenced target loading
- no external MOLT block file loading
- no active sleeve inspection
- no NeoStack inspection
- no trigger evaluation
- no UMG-Block-Library mutation
- no publish
- no package

## Normalization Significance

This step proves the Alpha6 runtime can compose a canonical seven-field MOLT Map from explicit real block-library NeoBlocks.

Classification:
- `MOLT_LEVEL_COMPOSITION_LIVE_READY`

Remaining before full UMG normalized runtime:
- composer output normalization / audit polish
- response envelope projection
- Active Stack projection
- explicit sleeve/NeoStack graph layer
- package / publish lane

## Required Next Task

Next task:
`ALPHA6_REAL_BLOCK_LIBRARY_MOLT_MAP_COMPOSER_OUTPUT_NORMALIZATION_SOURCE`
