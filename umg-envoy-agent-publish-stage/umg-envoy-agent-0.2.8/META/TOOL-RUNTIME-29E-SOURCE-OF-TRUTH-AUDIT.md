# TOOL-RUNTIME-29E — Final Publish Source-of-Truth / Artifact Selection Audit

## Summary

A final pre-approval audit was performed to ensure any future publish/upload step uses the exact verified polished `v0.2.9` artifact and not a stale tarball, stale hash, extracted inspection folder, temp consumer install folder, or other ambiguous source.

## Verified current candidate identity
- package: `umg-envoy-agent`
- version: `0.2.9`
- artifact: `umg-envoy-agent-0.2.9.tgz`
- branch: `fix/public-envoy-surface-v0.2.9`
- commit: `96d954f`
- SHA-256: `389417497433B3A71B09BFD528ACCE3A453CEE98488DDD1D7A74CB7A7A78AEBC`

## Nearby tarball inventory
Observed in the package tree root:
- `umg-envoy-agent-0.2.8.tgz`
- `umg-envoy-agent-0.2.9.tgz`

Audit conclusion:
- only `umg-envoy-agent-0.2.9.tgz` is the valid candidate source for any future explicit approval flow
- `umg-envoy-agent-0.2.8.tgz` is a stale historical artifact and must not be used

## Non-publish source markers
The following must not be mistaken for publish source:
- extracted `_inspect_*` folders
- temp consumer audit folder `C:\.openclaw\workspace\tmp-umg-envoy-consumer-audit`
- installed package copy under `node_modules\umg-envoy-agent`

## Stale-hash audit
A search found the old pre-polish hash still present in some documentation.
This phase refreshed active approval-gate references so they now point at the current final hash.
The older hash must be treated as historical only.

## Current posture
- approval-review ready
- no-publish hold remains active
- source-of-truth artifact is explicitly identified

## Recommended next action
If explicit approval is requested later, use the exact package/version/artifact/hash/branch tuple recorded in `META/FINAL-PUBLISH-SOURCE-OF-TRUTH.md`.

## Boundary preserved
This phase did not publish, upload, tag, or change runtime behavior.
