# Promotion Pass — Structured Release-Safe Set (2026-04-19)

## Purpose

Record the first explicit promotion pass of release-safe structured content from the private Resleever lane into the public UMG Block Library.

## Source lane

Private source:
- `artifacts/umg-envoy-agent-plugin/vendor/UMG_Envoy_Resleever`

## Promoted in this pass

### AI-side NeoBlocks
Promoted from:
- `blocks/neoblocks`

Promoted entries:
- `slv-bank_audit-compliance-v1-0`
- `slv-business-automation-consultant-v1-0`
- `slv-idaho-grants-finder-v1-0`
- `slv-super-emulator-dev-v1-0`
- `slv-uo-server-developer-v1-0`

### AI-side NeoStacks
Promoted from:
- `blocks/neostacks`

Promoted entries:
- `slv-business-automation-consultant-v1-0`
- `slv-idaho-grants-finder-v1-0`
- `slv-super-emulator-dev-v1-0`
- `slv-uo-server-developer-v1-0`
- `slv-vrchat-developer-v1-0`

### AI-side promoted MOLT artifacts
Promoted from:
- `blocks/molt-promoted`

Promoted entries:
- `slv-bank_audit-compliance-v1-0`
- `slv-business-automation-consultant-v1-0`
- `slv-idaho-grants-finder-v1-0`
- `slv-super-emulator-dev-v1-0`
- `slv-uo-server-developer-v1-0`

## Not promoted in this pass

Not promoted here:
- runtime traces
- runtime backups
- runtime staging
- active runtime state
- generated sleeves
- archived sleeves
- raw source/extraction lanes
- sleeves/library entries that did not line up cleanly by stable filename for safe automated promotion in this pass

## Why sleeve promotion was held back

The structured family promotion surfaces (`neoblocks`, `neostacks`, `molt-promoted`) lined up clearly enough for safe promotion.
The corresponding `sleeves/library` lane did not line up cleanly by stable filenames in the same way, so automated promotion of sleeves was held back for a more careful matching pass rather than guessing.

## Outcome

This pass proves that the private-to-public promotion model works for a real structured release-safe set.
It also shows that sleeve promotion should be treated as a separate, more careful sub-pass rather than bundled into the first automated structured promotion.
