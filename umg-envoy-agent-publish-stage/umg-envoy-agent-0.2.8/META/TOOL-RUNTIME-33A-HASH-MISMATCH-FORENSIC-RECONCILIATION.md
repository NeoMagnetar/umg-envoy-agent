# TOOL-RUNTIME-33A — v0.2.10 Hash Mismatch Forensic Reconciliation

## Scope
Forensic investigation only.
No publish performed.
No upload performed.
No package contents mutated in this phase.

## Candidate under review
- package: `umg-envoy-agent`
- version: `0.2.10`
- artifact path: `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.2.8\umg-envoy-agent-0.2.10.tgz`
- approved SHA-256: `C8B15CD9738A90D845094D5C03D326B6AC6B4B98D4C852B4A47A2D9B0953D661`
- observed SHA-256: `B8C1CE37D692DC59B175407B5FCD3C54A670F573D1AA63BB14070E37BC07B13F`

## Findings
### 1. The current tarball is normalized, not obviously contaminated
- tar listing shows a stable, public-safe file set
- archive entries use normalized mtimes (`Oct 25 1985`)
- no `META/` content observed in the tarball
- no `_inspect_*` folders observed in the tarball
- no legacy ZIP path involved

### 2. The current tarball does NOT exactly match current staging inputs
A file-by-file comparison between the extracted tarball payload and the current staging tree showed one material mismatch:
- `package.json`

All other compared payload files matched exactly:
- `dist/**`
- `public-content/**`
- `README.md`
- `openclaw.plugin.json`
- `docs/COMPILER-CONTRACT.md`
- release notes / validation script files present in the tarball

### 3. The mismatch is substantive, not just pack-container noise
The embedded tarball `package.json` differs materially from the current staging `package.json`.
Observed differences include:
- tarball `package.json` contains an older `files` declaration block plus a second later `files` block
- tarball `package.json` omits the current staging self-file dependency entry:
  - staging has `"umg-envoy-agent": "file:umg-envoy-agent-0.2.10.tgz"`
  - tarball does not
- tarball `package.json` shape does not match current staging bytes

Therefore the changed SHA is not explained purely by harmless tar header variation.
The current tarball payload itself reflects a different `package.json` than current staging.

### 4. No clean historical commit match was found for the tarball-embedded `package.json`
A commit-history scan of `umg-envoy-agent-publish-stage/umg-envoy-agent-0.2.8/package.json` did not find a committed revision whose bytes matched the tarball-embedded `package.json`.

This suggests the current tarball likely came from a local regenerated or stale-mutated packaging state rather than from the exact approved candidate or the exact current staging file.

## Conclusion
The current observed tarball hash `B8C1CE37D692DC59B175407B5FCD3C54A670F573D1AA63BB14070E37BC07B13F` cannot be accepted as the previously approved candidate.

The tarball may still be broadly public-safe, but it is not byte-identical to the approved candidate and does not exactly match current staging inputs.
That means approval must NOT be refreshed automatically in this phase.

## Publish status
Remain blocked.
Do not publish this tarball.

## Recommended next step
Create a deliberate fresh packing candidate from the verified intended staging state, then rerun:
- artifact identity check
- public-surface validation
- tarball content inspection
- hash capture
- provenance/approval gate refresh

Only after that should a new exact-hash approval be requested.
