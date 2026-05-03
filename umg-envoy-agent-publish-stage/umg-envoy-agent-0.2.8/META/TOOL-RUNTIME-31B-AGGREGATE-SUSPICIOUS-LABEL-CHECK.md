# TOOL-RUNTIME-31B — Aggregate Suspicious Label Resolution Check

## Timestamp
- `2026-05-02T18:30:21.6698432-09:00`

## Evidence sources
### 1. Plugin list/card suspicious label
- evidence source: user-observed plugin list/card state
- observed aggregate label: `Suspicious`

### 2. Detailed static-analysis panel
- evidence source: user-provided detailed `v0.2.9` static-analysis panel
- verdict: `Benign`
- summary: `No suspicious patterns detected.`
- reason codes: `None`
- timestamp: `May 2, 2026, 3:50 PM`
- engine: `v2.4.22`
- panel hash: `22831c5145f344f7cdef34334e8dd7e9e1c42b5b3dc67bbf35ec52d96e2a0ac2`

### 3. Public page badge stack
Current public page / user-observed badge stack:
- VirusTotal: `stale`
- ClawScan: `Review`
- Static analysis: `Benign`
- Scan status: `pending`

### 4. Read-only ClawHub CLI state
From `clawhub package inspect umg-envoy-agent`:
- latest version: `0.2.9`
- package is live
- corrected public-safe tool list remains visible
- scan: `pending`

## Classification
- `STATIC_ANALYSIS_CLEARED`
- `AGGREGATE_LABEL_STILL_SUSPICIOUS`
- `FULL_CLEARANCE_NOT_YET_CLAIMED`

## Why this classification fits
### STATIC_ANALYSIS_CLEARED
The detailed `v0.2.9` static-analysis panel explicitly reports:
- `Benign`
- no suspicious patterns
- no reason codes

This closes the earlier dangerous-exec static-analysis issue.

### AGGREGATE_LABEL_STILL_SUSPICIOUS
The user-observed plugin list/card still showing `Suspicious` is not consistent with the detailed static-analysis panel alone.
It is most likely reflecting the broader aggregate/security stack rather than just the static-analysis layer.

### FULL_CLEARANCE_NOT_YET_CLAIMED
Full clearance still cannot be claimed because the other visible layers remain unresolved:
- VirusTotal stale
- ClawScan Review
- Scan status pending

## Interpretation
The remaining mismatch appears to be:
- detailed static analysis says benign
- top-level aggregate label still says suspicious
- broader scan/reputation layers have not fully converged yet

That means the top-level label should not yet be treated as proof that the dangerous-exec static-analysis problem still exists.
