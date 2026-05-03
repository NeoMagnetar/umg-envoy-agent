# TOOL-RUNTIME-30H — Remaining Scan Layer Classification

## Layer-by-layer status

### 1. Static analysis layer
- status: `resolved / benign`
- evidence: user-provided static analysis panel for `v0.2.9`
- verdict: `Benign`
- summary: `No suspicious patterns detected.`
- interpretation: prior `suspicious.dangerous_exec` issue is closed

### 2. Published package surface layer
- status: `corrected and visibly live`
- evidence: ClawHub package inspect and public page
- interpretation: corrected bundled-adapter/public-safe package shape is live; removed bridge tools remain absent from visible public tool list

### 3. Verification/source provenance layer
- status: `resolved`
- evidence: ClawHub package inspect
- interpretation: source-linked provenance is attached successfully

### 4. ClawHub scan-status layer
- status: `pending`
- evidence: `clawhub package inspect umg-envoy-agent`
- interpretation: final overall scan workflow is not visibly complete yet

### 5. VirusTotal / external reputation layer
- status: `stale`
- evidence: user-provided public badge observation
- interpretation: external reputation view has not yet visibly refreshed to a final post-upload settled state

### 6. ClawScan review layer
- status: `Review`
- evidence: user-provided public badge observation
- interpretation: some ClawHub-visible review layer still has not flipped fully to a final clear state despite static-analysis closure

## Current overall classification
The package is not blocked by the original dangerous-exec static-analysis issue anymore.
However, full multi-layer ClawHub security clearance still cannot be claimed because:
- scan status remains `pending`
- VirusTotal badge remains `stale`
- ClawScan badge remains `Review`

## Best current wording
Use this wording:
- the original static-analysis issue is resolved for `v0.2.9`
- the corrected public-safe package is live
- source provenance is linked
- remaining ClawHub security layers are still pending/review/stale and final full clearance is not yet established
