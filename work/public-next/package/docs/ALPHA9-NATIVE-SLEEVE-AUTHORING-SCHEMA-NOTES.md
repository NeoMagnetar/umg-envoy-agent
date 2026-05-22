# Alpha9 Native Sleeve Authoring Schema Notes

## Purpose

Tighten the native sleeve authoring contract before seeding additional sleeves.

## Required top-level sleeve fields

A native sleeve fixture/document must clearly declare:
- `sleeveId`
- `sleeveName`
- `nativeGraph`

## Required native graph fields

`nativeGraph` must declare:
- `schemaVersion`
- `sleeveId`
- `sleeveName`
- `nativeGraphId`
- `provenance`
- `neoStacks`
- `neoBlocks`
- `moltFragments`
- `toolRequests`
- `runtimeRoutes`
- `irRoutes`
- `envelopeSources`
- `safety`

## Provenance contract

Each native graph surface should carry explicit provenance.

Allowed provenance categories:
- `sleeve_native`
- `sleeve_native_derived`
- `sample_fallback`
- `legacy_preview_residue`
- `mixed_contaminated`
- `unknown`

Meaning:
- `sleeve_native` = declared directly by the sleeve-native graph
- `sleeve_native_derived` = derived by adapter/runtime projection from native graph declarations
- `sample_fallback` = derived from sample or fallback logic, not purely native source
- `legacy_preview_residue` = legacy preview path leaked into output
- `mixed_contaminated` = provenance is mixed and should not qualify as clean-native
- `unknown` = provenance is missing or ambiguous and should not qualify as clean-native

## clean_native eligibility

A sleeve should be considered `clean_native` only if:
- runtime route `sourceMode = sleeve_native`
- IR route `routePurity = clean_native`
- all required safety posture values are preserved
- no required native graph surfaces are missing
- no provenance category on required path surfaces is:
  - `sample_fallback`
  - `legacy_preview_residue`
  - `mixed_contaminated`
  - `unknown`
- `sampleFallbackUsed = false`
- `legacyPreviewResidueDetected = false`

## Downgrade / contamination rules

A native sleeve should be downgraded out of clean-native status if:
- any runtime route reports `sourceMode = sleeve_native_with_sample_fallback`
- any route purity reports `native_with_marked_fallback`
- any route purity reports `contaminated`
- any required path surface carries contaminated provenance
- runtime diagnostics report sample fallback or legacy preview residue

## Tool request declaration rules

Tool requests must remain declarative in the native graph.
They may declare:
- request identity
- requested tool name
- requested action
- purpose
- policy class
- bounded executability
- provenance

They must not expand execution authority by themselves.
Native graph declaration is not execution permission.

## Safety posture rules

Native sleeve graphs in this phase must preserve:
- `approvedOnly = true`
- `allowlistedOnly = true`
- `readOnlyOnly = true`
- `directSourceEnabled = false`
- `automaticResponseTakeover = false`
- `umgBlockLibraryMutation = not_performed`

## Compatibility rule

Schema refinement must remain compatible with the existing alpha.12 clean native fixture:
- `fixtures/native-sleeves/neomagnetar-dynamic-persona-native-v1.json`
