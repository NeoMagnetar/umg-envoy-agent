# UMG-ENVOY-ALPHA6-IMPLEMENTATION-STEP3-RESULTS.md

## 1. Verdict

**ALPHA6_PUBLIC_CURATED_SLEEVE_INSPECT_READY**

---

## 2. Scope

Implementation Step 3 added safe shallow inspection for one public-curated sleeve target path, using the Step 2 resolver classification as the gate.

Important outcome:
- the inspect capability is implemented
- it enforces public-curated policy
- it does not recursively resolve the full graph
- it does not execute anything
- it does not write anything

Also important current-catalog truth:
- the current curated catalog snapshot does **not** contain a presently loadable sleeve file under the strict Step 3 allowlist/runtime checks
- so Step 3 currently proves safe rejection behavior and shallow-inspect mechanics, but does not yet produce a successful loaded inspection from the current catalog snapshot

That is a catalog-state fact, not a resolver crash.

---

## 3. Files Changed

### Modified files
- `C:\.openclaw\workspace\work\public-next\package\src\real-library-resolver.ts`
- `C:\.openclaw\workspace\work\public-next\package\src\plugin-entry-public.ts`
- `C:\.openclaw\workspace\work\public-next\package\scripts\alpha6-real-library-resolver-smoke.mjs`

### Built outputs updated
- `C:\.openclaw\workspace\work\public-next\package\dist\real-library-resolver.js`
- `C:\.openclaw\workspace\work\public-next\package\dist\real-library-resolver.d.ts`
- `C:\.openclaw\workspace\work\public-next\package\dist\plugin-entry-public.js`
- `C:\.openclaw\workspace\work\public-next\package\dist\plugin-entry-public.d.ts`

### New report file
- `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-IMPLEMENTATION-STEP3-RESULTS.md`

---

## 4. Whether `umg_envoy_real_sleeve_inspect` Was Added

**Yes.**

New tool added:
- `umg_envoy_real_sleeve_inspect`

Behavior:
- accepts `sleeveId`
- optional `libraryRoot`
- uses `public_curated` mode only
- reuses the Step 2 catalog resolver
- only attempts inspection after catalog classification
- refuses archive/forbidden/outside-allowlist targets
- loads JSON read-only only when policy allows
- returns shallow summary only

CLI helper added:
- `umg-envoy real-sleeve-inspect --sleeve <id>`

---

## 5. Final Registered Tool Count

Final registered tool count after Step 3:
- `18`

Composition:
- original alpha.5 tools: `15`
- Step 1 tool: `umg_envoy_real_library_status`
- Step 2 tool: `umg_envoy_real_sleeve_list`
- Step 3 tool: `umg_envoy_real_sleeve_inspect`

---

## 6. What Step 3 Added In Code

### New inspect API in resolver
Added:
- `inspectRealLibraryPublicCuratedSleeve(input)`

New inspect result shape includes:
- `ok`
- `mode`
- `libraryRoot`
- `sleeveId`
- `sourcePath`
- `resolvedSourcePath`
- `resolutionStatus`
- `loaded`
- `summary`
- `warnings`
- `errors`
- `trace`

### New inspect summary shape
When loadable and parseable, summary is prepared to include:
- `id`
- `name`
- `title`
- `version`
- `status`
- `topLevelKeys`
- `metadataKeys`
- `sleeveKeys`
- `referenceCounts`
  - `neostacks`
  - `neoblocks`
  - `moltBlocks`
  - `tools`
  - `gates`
  - `triggers`

### New inspect-specific hold codes implemented
- `HOLD_SLEEVE_ID_REQUIRED`
- `HOLD_SLEEVE_NOT_FOUND`
- `HOLD_SLEEVE_NOT_LOADABLE_PUBLIC_CURATED`
- `HOLD_SLEEVE_SOURCE_PATH_FORBIDDEN`
- `HOLD_SLEEVE_SOURCE_PATH_OUTSIDE_ALLOWLIST`
- `HOLD_SLEEVE_FILE_MISSING`
- `HOLD_SLEEVE_PARSE_FAILED`
- `HOLD_SLEEVE_SHAPE_UNKNOWN`

---

## 7. Current Catalog Reality Found During Step 3

This is the key practical finding from Step 3.

Current curated catalog still has:
- `sleeveCount: 3`

But current safe loadable count under strict Step 3 policy is:
- `loadableSleeveCount: 0`

Reason:
- `slv-operator` currently resolves to `C:\.openclaw\workspace\UMG-Block-Library\sleeves\SLV.OPERATOR.json`
- that path is inside the allowlist but is currently missing on disk
- therefore it is classified as:
  - `SOURCE_PATH_MISSING_ON_DISK`

Other known entries:
- `sample-basic-minimal` resolves into `archive` and is rejected as forbidden
- another entry remains outside current allowlist / not loadable under current Step 3 public-curated policy

Meaning:
- Step 3 implementation is working as policy enforcement
- the current catalog snapshot does not yet provide a valid successfully loadable inspect target

---

## 8. Loadable Sleeve Inspected

### Honest result
No curated sleeve was successfully loaded and shallow-inspected from the current catalog snapshot.

Why:
- no entry currently satisfies all of these at once:
  - `LOADABLE_PUBLIC_CURATED`
  - source path exists on disk
  - source path is safe under the strict `sleeves/` allowlist policy

So the implementation is ready, but the current catalog state blocks a successful live inspect path.

This is a **content-state limitation**, not a plugin crash.

---

## 9. Shallow Summary Result

### Current live result
A successful loaded shallow summary was **not** produced in the final current-catalog smoke run because no entry qualified for safe loading.

### Implemented summary capability
If a future curated entry becomes safely loadable, the resolver will return a shallow summary shaped like:
```json
{
  "id": "...",
  "name": "...",
  "title": "...",
  "version": "...",
  "status": "...",
  "topLevelKeys": [],
  "metadataKeys": [],
  "sleeveKeys": [],
  "referenceCounts": {
    "neostacks": 0,
    "neoblocks": 0,
    "moltBlocks": 0,
    "tools": 0,
    "gates": 0,
    "triggers": 0
  }
}
```

---

## 10. Rejected Unsafe Sleeve Inspection Result

Confirmed working:
- archive-backed entry inspection is rejected
- file is **not** loaded
- resolver does **not** follow unsafe path

Observed rejection:
- sleeve id: `sample-basic-minimal`
- result code: `HOLD_SLEEVE_SOURCE_PATH_FORBIDDEN`

This satisfies the Step 3 policy requirement that archive-backed catalog entries must not be inspected.

---

## 11. Missing / Unknown Sleeve Behavior

Confirmed working:

### Unknown sleeve id
Observed result:
- code: `HOLD_SLEEVE_NOT_FOUND`

### Missing source path case
Smoke result:
- skipped because the current catalog snapshot has no `NO_SOURCE_PATH` entry

### Missing on-disk path case
Observed current catalog reality:
- `slv-operator` is currently blocked by missing on-disk target
- current inspect path returns non-loadable hold instead of crashing

---

## 12. Smoke Results

### Command: `npm run check`
Result:
- passed

### Command: `npm run build`
Result:
- passed

### Command: `node scripts/alpha6-real-library-resolver-smoke.mjs`
Result:
- passed

### Smoke assertions covered
1. check passes
2. build passes
3. smoke script passes
4. original alpha.5 tools still register
5. tool count is now `18`
6. real curated catalog still loads
7. sleeve list still returns `3` catalog entries
8. current loadable count is stably `0` for this catalog snapshot
9. inspect path exists and safely rejects current non-loadable `slv-operator` target
10. inspect rejects `REJECTED_FORBIDDEN_SOURCE_PATH` entry
11. unknown sleeve id rejects cleanly
12. no recursive graph resolution is performed
13. no execution occurs

---

## 13. Confirmation That Original Alpha.5 Tools Still Register

**Yes.**

No regression detected for the original 15 alpha.5 tools.

Additional real-library tools now registered:
- `umg_envoy_real_library_status`
- `umg_envoy_real_sleeve_list`
- `umg_envoy_real_sleeve_inspect`

---

## 14. Confirmation That No Recursive Graph Resolution Was Added

**Confirmed.**

Trace explicitly reports:
- `recursiveResolution: not_performed_step3`

Step 3 does not traverse full:
- MOLT graph
- NeoBlock graph
- NeoStack graph
- runtime execution graph

It remains shallow and readonly.

---

## 15. Whether Step 4 Can Begin

**Yes.**

But Step 4 should start from the honest catalog-state reality:
- the inspect capability exists
- the current curated catalog snapshot does not yet yield a successfully loadable inspect target

Most likely Step 4 focus:
- distinguish between policy-correct non-loadable entries vs true curated success-path entries
- possibly add a curated-target diagnostics tool/report
- or refine curated target selection / existence checks before deeper inspection

---

## 16. Final Verdict

**ALPHA6_PUBLIC_CURATED_SLEEVE_INSPECT_READY**
