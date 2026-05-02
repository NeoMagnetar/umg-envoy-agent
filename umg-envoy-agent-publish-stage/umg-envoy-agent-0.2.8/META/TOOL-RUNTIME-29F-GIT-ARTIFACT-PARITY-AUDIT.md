# TOOL-RUNTIME-29F — Final Git / Artifact Parity + No-Dirty-State Audit

## Summary

A final non-publishing audit was performed to verify that the current branch, committed docs, package files, and authoritative `v0.2.9` tarball are aligned closely enough for a future explicit approval request.

## Verified source-of-truth identity
- package: `umg-envoy-agent`
- version: `0.2.9`
- branch: `fix/public-envoy-surface-v0.2.9`
- HEAD at audit start: `025935d`
- authoritative artifact: `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.2.8\umg-envoy-agent-0.2.9.tgz`
- SHA-256: `389417497433B3A71B09BFD528ACCE3A453CEE98488DDD1D7A74CB7A7A78AEBC`

## Git status findings
- branch matched expected branch
- working tree was not fully pristine because inspection artifacts/directories exist in the package tree
- no evidence from this audit suggests uncommitted source/package changes that would change the authoritative tarball contents
- inspection directories should be treated as audit byproducts, not publish source

## Artifact parity findings
### Version parity
- repo/stage `package.json` version = `0.2.9`
- tarball `package.json` version = `0.2.9`
- repo/stage `openclaw.plugin.json` version = `0.2.9`
- tarball `openclaw.plugin.json` version = `0.2.9`

### Tarball presence
- `README.md` present in tarball: yes
- total packed file count observed during parity extraction: `57`

### Public-surface validation
- `npm run validate:public-surface` passed
- output included `PUBLIC_SURFACE_OK`

## Stale hash audit
A stale-hash search was rerun for:
- `016951EBB535CB93032D5BD0979A06227B5AC6DB98EC79D48EAAA40614CEC418`

Result:
- historical references may still exist in audit/history artifacts, but the active approval/source-of-truth path is now synced to the current final hash
- future approval wording must use only `389417497433B3A71B09BFD528ACCE3A453CEE98488DDD1D7A74CB7A7A78AEBC`

## No-dirty-state interpretation
Strictly speaking, the tree contains audit byproducts and is therefore not a perfectly pristine scratch tree.
Operationally, the authoritative tarball and the committed package metadata are aligned.
This means:
- the candidate is suitable for future approval review
- publish source should remain the authoritative tarball path, not the live folder state

## Recommended next action
If a future explicit approval request is made, reference:
- `META/FINAL-PUBLISH-SOURCE-OF-TRUTH.md`
- `META/EXPLICIT-PUBLISH-APPROVAL-TEMPLATE.md`

And use the tarball, not any temp folder or extracted inspection folder, as the candidate source.

## Boundary preserved
This phase did not publish, upload, tag, or mutate runtime behavior.
