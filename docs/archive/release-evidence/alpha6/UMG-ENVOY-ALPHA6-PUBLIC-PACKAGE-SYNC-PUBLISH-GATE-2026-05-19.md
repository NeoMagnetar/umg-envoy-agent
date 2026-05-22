# UMG Envoy Alpha6 — Public Package Sync Publish Gate

Date: 2026-05-19

## Verdict

`HOLD_ALPHA6_PUBLIC_PACKAGE_SYNC_PUBLISH_GATE`

## Failed Phase

- Phase 9 — Destination Readiness Check
- Phase 10 — Version Policy Final Check

## Baseline

- local install verify verdict: `ALPHA6_PUBLIC_PACKAGE_SYNC_LOCAL_INSTALL_VERIFY_READY`
- local install verify commit: `5d286d097ec7ca0cfbc8e777588a765620a74b09`
- verify report: `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-PUBLIC-PACKAGE-SYNC-DRY-RUN-OR-LOCAL-INSTALL-VERIFY-2026-05-19.md`
- prep verdict: `ALPHA6_PUBLIC_PACKAGE_SYNC_PREP_READY`
- prep commit: `5f7b9075ed029e1ab3916039f09a75f24c64e986`
- live state: `ALPHA6_WORKING_RUNTIME_PATH_LIVE_READY`
- version: `0.3.0-alpha.6`
- staging path: `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.6`
- tgz path: `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.6\umg-envoy-agent-0.3.0-alpha.6.tgz`

## Baseline Sanity Check

From `C:\.openclaw\workspace\work\public-next\package`:

- current `HEAD`: `bf8dfdc`
- expected verify commit `5d286d097ec7ca0cfbc8e777588a765620a74b09` is reachable as an ancestor of `HEAD`
- required reports exist:
  - verify report: present
  - prep report: present
  - live promotion report: present

Notes:
- `HEAD` is newer than the expected verify commit.
- Commit lineage is still coherent for the verified Alpha6 lane.
- Working tree is very dirty, so report-only staging must stay narrow.

## Package Artifact

- tgz path: `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.6\umg-envoy-agent-0.3.0-alpha.6.tgz`
- SHA256: `E8E1902042B06FFA1BC835FF7200B3AE8D4420E525BD89110191F6C415D8D9E9`
- package size: `42005` bytes
- package root status: valid
- package artifact exists: yes
- artifact file name matches package/version: yes
- artifact is nonzero: yes
- npm pack dry-run status: passed

## Staged Root

Confirmed at staging root:

- `package.json`: present
- `openclaw.plugin.json`: present
- `README.md`: present
- `dist/plugin-entry.js`: present
- nested wrong package root: not observed
- missing package root issue: not observed

## Metadata

Staged metadata confirms:

- `package.json` version: `0.3.0-alpha.6`
- `openclaw.plugin.json` version: `0.3.0-alpha.6`
- entrypoint: `dist/plugin-entry.js`
- package name: `umg-envoy-agent`
- README status: present and aligned with dry-run runtime preview positioning
- runtime-preview tools represented: yes
- execution boundary represented: yes
- broad autonomous execution claim: not observed in staged metadata
- Alpha7 claim: not observed in staged metadata

Required Alpha6 runtime-preview tools represented by the candidate:

- `umg_envoy_block_library_sleeve_graph_drilldown`
- `umg_envoy_sleeve_select`
- `umg_envoy_sleeve_resolve`
- `umg_envoy_runtime_compile`
- `umg_envoy_runtime_preview`

## Forbidden File Scan

Forbidden file scan of the staging root was clean for:

- `node_modules`
- `.git`
- `.env*`
- `UMG-Block-Library`
- `alpha6-local-install-verify-backups`
- `logs`
- `temp`

Note:
- the verified local tgz at the staging root is expected in this lane

## Installed Candidate

Installed extension path:

- `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`

OpenClaw plugin state:

- plugin info result: passed
- loaded: yes
- version: `0.3.0-alpha.6`
- entrypoint/source: `~\.openclaw\extensions\umg-envoy-agent\dist\plugin-entry.js`
- recorded version: `0.3.0-alpha.6`
- install origin: path/global install

OpenClaw health:

- `ok`: `true`
- blocking plugin load error: none observed

OpenClaw doctor:

- completed successfully
- no plugin errors
- no channel security warnings
- non-blocking housekeeping warnings only:
  - orphan transcript files
  - browser attach/version setup reminders
  - memory-search embedding provider not configured

Notes:
- installed extension directory contains extra local development material beyond the packed artifact shape
- live runtime verification still passed against the installed candidate
- installed extension was not modified during this publish-gate lane

## Runtime Proof

Fresh live probe executed directly against the installed candidate tool registrations.

Runtime preview input:

```json
{
  "sleeveId": "neomagnetar-dynamic-persona-v1",
  "previewFormat": "summary",
  "includeActiveStack": true,
  "includeMoltMap": true,
  "includeEnvelope": true,
  "includeToolRequests": true
}
```

Confirmed:

- sleeveId: `neomagnetar-dynamic-persona-v1`
- `outputContract.contractId`: `umg.runtime.preview.v1`
- previewStatus: `RUNTIME_PREVIEW_READY`
- compileStatus: `COMPILED`
- runtimeSpecVersion: `RuntimeSpecV0`
- Active Stack preview: confirmed
- response-envelope preview: confirmed
- declared tool requests: confirmed
- execution status: `not_performed`
- `automaticResponseTakeover`: `false`
- `RangeError`: not observed
- `Maximum call stack size exceeded`: not observed
- trigger evaluation: not performed
- uncontrolled execution: not performed
- UMG-Block-Library mutation: not performed

## Regression

Confirmed old Alpha6 tools still present:

- `umg_envoy_block_library_status`
- `umg_envoy_block_library_manifest_index`
- `umg_envoy_block_library_manifest_entry_lookup`
- `umg_envoy_block_library_target_shallow_load_gate`
- `umg_envoy_block_library_target_shallow_load_single`
- `umg_envoy_block_library_target_shallow_summary_normalize`
- `umg_envoy_block_library_neoblock_inspect`
- `umg_envoy_block_library_moltblock_visible_extract`
- `umg_envoy_block_library_molt_map_fragment`
- `umg_envoy_block_library_molt_map_compose`
- `umg_envoy_block_library_response_envelope_fragment`
- `umg_envoy_block_library_active_stack_projection`
- `umg_envoy_block_library_sleeve_graph_index`

Minimum live regression probes passed:

- sleeve graph index works
- response envelope fragment works
- Active Stack projection works
- recursion bug did not return
- no `RangeError`
- no `Maximum call stack size exceeded`

## Safety

Confirmed in this lane:

- no publish performed
- no ClawHub publish
- no npm publish
- no GitHub release
- no Alpha7 cut
- no runtime behavior changes
- no source feature work
- no UMG-Block-Library mutation
- no `.gitmodules` change
- no trigger evaluation
- no uncontrolled execution
- `automaticResponseTakeover = false`

## Destination Readiness

ClawHub destination inspection result:

- publish destination: known (`ClawHub`, package id `umg-envoy-agent`, owner `neomagnetar`)
- auth/config status: ready for inspection and likely publish-capable (`clawhub whoami` succeeded)
- current public latest version: `0.3.0-alpha.6`
- public package summary/tool surface appears stale relative to the staged candidate
- public latest package reports older tool surface, including older runtime tools and missing the verified publish-gate candidate surface

Observed public package metadata from destination inspection:

- Summary: `Minimized public alpha.6 UMG Envoy Agent for OpenClaw`
- Latest: `0.3.0-alpha.6`
- Tools reflect an older surface, not the verified staged candidate tool list
- Updated: `2026-05-15T16:09:36.747Z`

Known blocker before publish execution:

- destination already has `0.3.0-alpha.6`
- this gate did not verify that the public package sync workflow supports replacing or overwriting an existing same-version release
- because the current public `0.3.0-alpha.6` appears stale, same-version publish safety is not proven
- publish execution could fail, be rejected, or create ambiguous public state unless the same-version replacement policy is explicitly confirmed first

## Version Policy

Current recommendation before this gate was to keep `0.3.0-alpha.6`.

Confirmed:

- this sync is intended to align public/package state with already accepted Alpha6 local live state
- no Alpha7 features are being added in this lane
- no semantic need for Alpha7 in order to verify the current candidate

But final gate result on version policy:

- version policy status: `conflict / unproven for destination execution`
- reason: public destination already reports latest version `0.3.0-alpha.6`, while the verified local candidate represents a materially newer public surface
- this lane did not prove same-version overwrite/replacement is supported and safe

## Recommendation

Exact correction lane:

`ALPHA6_VERSION_BUMP_AND_PACKAGE_SYNC_PREP`

Reason:
- publish execution is not safe to recommend until version-conflict policy is resolved
- the cleanest conservative path is to prepare a version-bumped package sync candidate, then rerun prep, local install verify, and publish gate

## Commit Plan

Intended commit message if a report-only commit is created:

`Gate alpha6 public package sync publish`

Caution:
- repo working tree is highly dirty
- only the publish-gate report should be staged if a commit is made
- no tgz, backups, installed extension files, `.gitmodules`, or unrelated reports should be staged

## Failure Handling Summary

- package artifact remains valid: yes
- installed extension was modified in this lane: no
- files changed in this lane: publish-gate report only
- safest retry path: resolve version/destination policy first, then run the exact correction lane above
