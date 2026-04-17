# KNOWN CAVEATS

## 1. Historical trigger library vs newer trigger semantics
This repo still contains stored trigger block assets under `blocks/molt/triggers/`.

That does not mean the current runtime/compiler direction treats trigger as a peer generative output bucket.

Current alignment direction is:
- trigger as routing/gate logic
- stack activation driven by trigger state and matched trigger behavior

## 2. Older docs may still exist
Some older stage-based docs remain useful as history, but they are not always the best first-read documents.

For current orientation, prefer:
- `README.md`
- `docs/SYSTEM-OVERVIEW.md`
- `docs/QUICK-START.md`
- `docs/FOLDER-GUIDE.md`
- `docs/AGENT-INDEX.md`

## 3. Historical path references
Some older files were authored against earlier workspace layouts.

This pass updates the main bridge/path docs, but if a file contains obviously stale machine-specific paths, treat the newer path-contract docs and config as the authoritative current reference.

## 4. Browse layer is for humans, not runtime truth
The markdown browse layer under `browse/` is a human-readable mirror.

The runtime truth still lives in the JSON source/runtime files.

## 5. Separation still matters
Do not collapse:
- compiler
- runtime homebase
- plugin

into one blurred layer. The repo is clearer when those boundaries stay explicit.
