# TOOL-RUNTIME-31B — Current Layer Mismatch

## Current mismatch
- detailed static analysis layer: `Benign`
- top-level aggregate/list label: `Suspicious` (user-observed)
- public page badges still include unresolved layers:
  - VirusTotal stale
  - ClawScan Review
  - Static analysis Benign
  - Scan status pending

## Best current interpretation
Do not treat the aggregate suspicious label as evidence that the original dangerous-exec static-analysis issue remains active.
Treat it as an aggregate label that may still be incorporating unresolved/review/pending layers.

## Rule
- static-analysis issue: closed
- aggregate top-level label: not yet reconciled
- full clearance: not yet claimed
