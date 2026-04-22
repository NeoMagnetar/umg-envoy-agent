# Human Gates Import Pass — 2026-04-19

## Purpose

Record the conservative import of human-readable trigger/gate browse assets from the private resleever into the public UMG Block Library.

## What was imported

Source:
- `artifacts/umg-envoy-agent-plugin/vendor/UMG_Envoy_Resleever/browse/blocks/triggers`

Imported into:
- `HUMAN/GATES`

Imported content includes:
- `INDEX.md`
- human-readable trigger browse markdown files (`TRG.*.md`)

## Why this lane was chosen

The trigger browse layer is readable public-facing material and fits the public HUMAN/GATES surface better than the HUMAN/MOLT-BLOCKS surface.
This preserves a cleaner distinction between:
- human-readable MOLT block assets
- human-readable trigger/gate assets

## What was intentionally excluded

Still not imported in this pass:
- runtime traces
- runtime backups
- runtime staging surfaces
- private/internal compile-output artifacts
- active runtime state files
- non-curated internal gate/routing/runtime artifacts that are not yet public-safe

## Follow-up recommendation

Future passes may:
1. curate `HUMAN/GATES/TRIGGERS.md` and `HUMAN/GATES/ROUTING-PATTERNS.md` to summarize the imported trigger surface
2. decide whether any AI-side gate manifests/indexes are mature enough for a public-safe canonical export
3. continue keeping browse-layer human-readable gates separate from AI-side canonical gate schemas/manifests
