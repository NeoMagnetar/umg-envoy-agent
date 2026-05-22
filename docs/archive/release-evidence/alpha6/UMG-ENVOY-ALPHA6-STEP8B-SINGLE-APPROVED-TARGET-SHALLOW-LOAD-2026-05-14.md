# UMG Envoy Agent Alpha.6 — Step 8B Single Approved Target Shallow Load

Date: 2026-05-14

## Verdict

`ALPHA6_STEP8B_SINGLE_APPROVED_TARGET_SHALLOW_LOAD_READY`

## Baseline

Previous blocker:
- Step 8B initially paused because Step 8A sample files used compact `neoblocks[]` shape.

Corrective prerequisite completed:
- `ALPHA6_STEP8A_SAMPLE_TARGET_SCHEMA_ALIGNED`

Step 8A schema fix:
- submodule commit: `73fbb588e31ffb782d8b826e91512d79845fc1ca`
- parent commit: `bc059adf99ec2b4ec36d9aff1dba10840e52d978`

## Scope

This step commits package-side shallow-load support for one approved target.

Target:
- `primary.sample`

This step does not:
- load all seven targets
- recursively resolve the graph
- execute tools
- package alpha.6
- publish alpha.6

## Files Modified

- `work/public-next/package/src/real-library-resolver.ts`
- `work/public-next/package/src/plugin-entry-public.ts`
- `work/public-next/package/scripts/alpha6-real-library-resolver-smoke.mjs`

## File Created

- `UMG-ENVOY-ALPHA6-STEP8B-SINGLE-APPROVED-TARGET-SHALLOW-LOAD-2026-05-14.md`

## Tool Surface

- new tool added: `no`
- total tool count: `18`
- modified tool: `umg_envoy_real_sleeve_inspect`
- new request field: `shallowLoadTargetRef`

## Target Loaded

| Field | Value |
|---|---|
| requestedRef | `primary.sample` |
| loadedRef | `primary.sample` |
| kind | `neoblock` |
| moltType | `Primary` |
| file | `AI/NEOBLOCKS/sample/primary.sample.json` |
| parse status | `PARSED_JSON` |
| status | `SHALLOW_TARGET_LOADED_STEP8B` |

## Shallow Summary Contract

The shallow-load summary now extracts:

- `id = primary.sample`
- `kind = neoblock`
- `moltType = Primary`
- `status = alpha6_sample_target`
- `contentPreview = present`
- `topLevelKeys = identity, metadata, neoblock, provenance`

## Boundary Confirmation

- loaded target count: `1`
- other target payloads loaded: `0`
- recursive resolution: `not_performed_step8b`
- execution: `not_performed`
- archive fallback: `not_allowed`
- HUMAN machine loading: `not_allowed`
- Resleever loading: `not_allowed`
- direct_source mode: `not_enabled`

## Verification

Passed:
- `npm run check`
- `npm run build`
- `node scripts/alpha6-real-library-resolver-smoke.mjs`

## Commit Scope

Committed only:
- Step 8B report
- resolver source
- plugin entry schema
- smoke script

Not committed:
- `UMG-Block-Library`
- `.gitmodules`
- `dist/`
- `artifacts/`
- `skills/`
- backup/staging/Resleever lanes

## Required Next Task

Next task:
`ALPHA6_STEP8C_SHALLOW_LOAD_RUNTIME_SUMMARY`
