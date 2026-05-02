# TOOL-RUNTIME-29C — Final Documentation Polish / Package Contents Hygiene

## Summary

A final documentation/package-contents hygiene pass was completed for the corrected public `umg-envoy-agent` `v0.2.9` candidate.

## Changes made
- added `docs/RELEASE-NOTES-0.2.9.md`
- retained `docs/RELEASE-NOTES-0.2.8.md` as explicitly historical instead of leaving it implicit or orphaned
- updated README version/context language to reflect the current `v0.2.9` public-surface correction lane
- narrowed README wording that still implied public external compiler bridge behavior
- updated README example ClawHub publish version reference from `0.2.3` to `0.2.9`

## Re-validation result
- `npm run validate:public-surface` passed
- output: `PUBLIC_SURFACE_OK`

## Re-packed artifact
- file: `umg-envoy-agent-0.2.9.tgz`
- updated local SHA-256: `389417497433B3A71B09BFD528ACCE3A453CEE98488DDD1D7A74CB7A7A78AEBC`

## Consumer re-audit result
The consumer install audit was repeated after the docs/package-content change.
Observed:
- installed package still showed public-safe metadata
- installed forbidden-surface search still returned `NO_MATCHES`
- installed docs now include both:
  - `RELEASE-NOTES-0.2.8.md`
  - `RELEASE-NOTES-0.2.9.md`

## npm publish dry-run result
- `npm publish --dry-run` succeeded again
- no real publish occurred

## Hygiene conclusion
The earlier polish concern is now resolved in a professional way:
- `v0.2.9` release notes now ship in the package
- `v0.2.8` notes remain clearly historical rather than misleading by omission

## Boundary preserved
This phase did not publish, upload, tag, widen the public surface, or reintroduce bridge execution exposure.
