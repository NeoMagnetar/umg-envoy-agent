# Public Sleeve Lane

This sleeve lane is the public-facing sibling of the private `UMG_Envoy_Resleever` sleeve lane.

It is no longer treated as a raw compatibility mirror only.
It is now a **curated public sleeve lane** with explicit promotion posture for each direct sleeve entry.

## Current sleeve posture classes
- `promoted_reference` - public-safe reference sleeve suitable for normal public smoke validation
- `compatibility_reference` - meaningful public sleeve carried for compatibility/reference value, but not yet fully normalized
- `needs_normalization` - stable sleeve candidate that still needs naming/style cleanup for stronger public posture
- `historical_non_promoted` - carried historical/testing sleeve that should not be treated as a promoted public success-path sleeve

## Current direct sleeve entries
- `sample-basic-minimal` -> `promoted_reference`
- `neomagnetar-dynamic-persona-v1` -> `compatibility_reference`
- `slv-operator` -> `needs_normalization`
- `stage5-sleeve` -> `historical_non_promoted`

## Important rule
The public lane catalog id is the stable public-facing reference name.
Payload/runtime ids inside sleeve JSON may differ and should not be confused with the public catalog id.

## Relationship to the private lane
The private lane remains authoritative.
This public sleeve lane carries approved/promoted or intentionally classified public-safe sleeve artifacts only.
