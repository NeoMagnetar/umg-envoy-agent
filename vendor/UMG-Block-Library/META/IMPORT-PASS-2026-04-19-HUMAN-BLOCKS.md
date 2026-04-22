# Human Block Browse Import Pass — 2026-04-19

## Purpose

Record the first conservative import of human-readable block browse assets from the private resleever into the public UMG Block Library.

## What was imported

Source:
- `artifacts/umg-envoy-agent-plugin/vendor/UMG_Envoy_Resleever/browse/blocks`

Imported into:
- `HUMAN/MOLT-BLOCKS/blueprints`
- `HUMAN/MOLT-BLOCKS/directives`
- `HUMAN/MOLT-BLOCKS/instructions`
- `HUMAN/MOLT-BLOCKS/philosophy`
- `HUMAN/MOLT-BLOCKS/primary`
- `HUMAN/MOLT-BLOCKS/subjects`

These imported assets are human-readable browse-layer markdown files intended to make the public repo feel more real and explorable without claiming that all private/internal surfaces are public-ready.

## What was intentionally excluded

Not imported in this pass:
- runtime backups
- runtime traces
- runtime compile-output artifacts
- runtime staging surfaces
- active runtime state files
- archive/generated/private sleeve lanes
- internal machine/path/runtime contract material
- trigger browse layer (left separate pending gate/trigger curation)

## Reasoning

This pass follows the curated-public-surface rule:
- copy only clearly public-safe and readable assets
- do not mirror the entire private resleever
- do not leak runtime/private history
- do not collapse gate/trigger structure into the wrong public lane

## Current status

Result: the HUMAN-side MOLT block library now contains substantial readable browse content in multiple categories, while the AI-side and gate/trigger surfaces remain intentionally curated and more conservative.

## Follow-up recommendation

Future passes should:
1. review whether trigger browse content belongs in HUMAN/GATES rather than HUMAN/MOLT-BLOCKS
2. continue curating AI-side canonical data separately from browse-layer readable assets
3. avoid bulk-copying generated or runtime-tied artifacts from the private resleever
