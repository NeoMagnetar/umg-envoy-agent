# UMG Envoy Alpha6 — Response Envelope Active Stack Recursion Fix Source

Date: 2026-05-19

## Verdict

`ALPHA6_RESPONSE_ENVELOPE_ACTIVE_STACK_RECURSION_FIX_SOURCE_READY`

## Baseline

Blocked task:
- `ALPHA6_REAL_BLOCK_LIBRARY_SLEEVE_GRAPH_INDEX_LIVE_PROMOTION`

Blocked verdict:
- `HOLD_SLEEVE_GRAPH_INDEX_SOURCE_REGRESSION_BEFORE_PROMOTION`

Previous source commit:
- `9ac9ce698ffe047fa0f046d9aff61288bbd0fb0e`

Observed regression:
- `RangeError: Maximum call stack size exceeded`
- recursive loop between:
 - `getBlockLibraryResponseEnvelopeFragment`
 - `getBlockLibraryActiveStackProjection`

## Fix

Fixed the cyclic dependency between response envelope fragment and Active Stack projection.

Dependency rule after fix:
- response envelope fragment may call Active Stack projection
- Active Stack projection must not call response envelope fragment
- Active Stack projection source context uses composer-level context or explicit non-recursive source-context status

## Confirmed

Confirmed:
- no RangeError
- no Maximum call stack size exceeded
- response envelope fragment still works
- Active Stack projection still works
- response envelope Active Stack integration still works
- sleeve graph index source smoke still works
- full Alpha6 smoke chain passed

## Safety Confirmations

Confirmed:
- no automatic response takeover
- no active sleeve discovery
- no NeoStack inspection
- no graph traversal
- no recursive full-library load
- no full library scan
- no referenced target loading
- no external MOLT block file loading
- no trigger evaluation
- no execution
- direct_source = not_enabled
- no UMG-Block-Library mutation
- no publish
- no package

## Required Next Task

Next task:
`ALPHA6_REAL_BLOCK_LIBRARY_SLEEVE_GRAPH_INDEX_LIVE_PROMOTION_RETRY`
