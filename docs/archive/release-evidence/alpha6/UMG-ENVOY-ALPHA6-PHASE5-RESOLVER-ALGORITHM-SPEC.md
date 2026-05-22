# UMG-ENVOY-ALPHA6-PHASE5-RESOLVER-ALGORITHM-SPEC.md

## Purpose
This Phase 5 document translates the Alpha.6 resolver contract into a precise design-only algorithm specification.

This is still **not** an implementation.
No runtime code is changed.
No plugin behavior is altered.
No release is published.

The goal is to define:
- inputs
- outputs
- state flow
- pseudo-code
- error/hold shapes
- trace/debug shapes
- normalization rules
- mode-specific traversal behavior

Active root:
- `C:\.openclaw\workspace\UMG-Block-Library`

---

## 1. Phase 5 Verdict

**ALPHA6_PHASE5_RESOLVER_ALGORITHM_SPEC_COMPLETE**

---

## 2. Scope

This algorithm spec covers only read-only content discovery and object resolution planning for Alpha.6.

It does not cover:
- live runtime execution
- tool activation
- sleeve execution
- content mutation
- publish flows
- Resleever integration

---

## 3. Resolver Inputs

### Required inputs
- `activeRoot: string`
- `mode: "direct_source" | "public_curated"`

### Optional inputs
- `requestedSleeveId?: string`
- `requestedCatalogId?: string`
- `requestedSourcePath?: string`
- `allowBridgeManifest?: boolean`
- `trace?: boolean`
- `strict?: boolean`

### Environment assumptions
- `activeRoot` must already be chosen by Phase 1 logic
- the active root must remain inside:
  - `C:\.openclaw\workspace\UMG-Block-Library`

---

## 4. Resolver Outputs

### Success output shape
```json
{
  "ok": true,
  "mode": "direct_source",
  "activeRoot": "C:\\...\\UMG-Block-Library",
  "entrypointsUsed": [],
  "resolvedCatalogs": [],
  "resolvedObjects": [],
  "releaseFilterApplied": false,
  "warnings": [],
  "trace": []
}
```

### Hold output shape
```json
{
  "ok": false,
  "kind": "hold",
  "code": "HOLD_RESOLVER_MODE_UNCLEAR",
  "message": "Resolver mode not specified.",
  "activeRoot": "C:\\...\\UMG-Block-Library",
  "details": {},
  "trace": []
}
```

### Hard reject output shape
```json
{
  "ok": false,
  "kind": "reject",
  "code": "HOLD_DENYLIST_PATH_SELECTED",
  "message": "Selected path falls under denylist classification.",
  "activeRoot": "C:\\...\\UMG-Block-Library",
  "details": {},
  "trace": []
}
```

---

## 5. Resolver State Machine

The resolver should follow this state order:

1. `INIT`
2. `VALIDATE_ROOT`
3. `VALIDATE_MODE`
4. `LOAD_MODE_ENTRYPOINTS`
5. `PARSE_ENTRYPOINTS`
6. `APPLY_MODE_PRECEDENCE`
7. `RESOLVE_REFERENCED_PATHS`
8. `VALIDATE_ALLOW_DENY_RULES`
9. `APPLY_RELEASE_FILTERS`
10. `ASSEMBLE_RESOLUTION_RESULT`
11. `RETURN_SUCCESS`

Possible terminal hold/reject states:
- `HOLD_RESOLVER_MODE_UNCLEAR`
- `HOLD_ENTRYPOINT_MISSING`
- `HOLD_ENTRYPOINT_PARSE_FAILED`
- `HOLD_REFERENCED_OBJECT_MISSING`
- `HOLD_CROSS_LANE_CONFLICT_UNRESOLVED`
- `HOLD_DENYLIST_PATH_SELECTED`
- `HOLD_UNSCOPED_EXPORT_LANE`
- `HOLD_ACTIVE_ROOT_INVALID`

---

## 6. Path Normalization Rules

Before using any path:

1. normalize slashes
2. collapse `.` and `..`
3. resolve relative paths against the owning manifest/catalog file directory
4. convert to absolute path
5. verify resolved path stays under `activeRoot`
6. reject path if it exits `activeRoot`
7. reject path if any segment matches denylist class

### Path normalization pseudo-code
```text
function normalizeAndBindPath(baseFile, relativeOrAbsolutePath, activeRoot):
  candidate = resolve(baseFile.directory, relativeOrAbsolutePath)
  normalized = normalize(candidate)

  if not normalized.startsWith(activeRoot):
    return HOLD_DENYLIST_PATH_SELECTED or HOLD_REFERENCED_OBJECT_MISSING

  if containsDenylistSegment(normalized):
    return HOLD_DENYLIST_PATH_SELECTED

  return normalized
```

---

## 7. Mode-Specific Entrypoint Loading

### 7.1 `direct_source` mode
Load these entrypoints in this order:
1. `AI/MANIFESTS/release-approved-content.json`
2. `AI/MANIFESTS/sleeve-catalog.json`
3. `AI/MANIFESTS/neostack-library-index.json`
4. `AI/MANIFESTS/neoblock-library-index.json`
5. `AI/MANIFESTS/molt-block-library-index.json`
6. `AI/MANIFESTS/gate-library-index.json`
7. `AI/MANIFESTS/MANIFEST.NS.UMG.LANGCHAIN_BRIDGE.v0.1.json` only when `allowBridgeManifest == true`

### 7.2 `public_curated` mode
Load these entrypoints in this order:
1. `sleeves/manifests/catalog.json`
2. `sleeves/manifests/README.md` for status interpretation only

---

## 8. Entrypoint Parsing Rules

### JSON entrypoints
For JSON entrypoints:
- file must exist
- file must parse
- top-level object must exist
- required key families must exist where applicable

### Direct-source manifest key expectations
Not every file needs the same keys, but minimum expectations should be conservative:

| Entrypoint | Expected key families |
|---|---|
| `sleeve-catalog.json` | `catalog_status`, `catalog_scope`, `sleeves` |
| `molt-block-library-index.json` | `id`, `path`, `title` |
| `neoblock-library-index.json` | `id`, `path`, `title` |
| `neostack-library-index.json` | `id`, `path`, `title` |
| `gate-library-index.json` | `gates` or equivalent gate listing object |
| `release-approved-content.json` | `approved`, `release`, `status` |

### Public-curated manifest key expectations
| Entrypoint | Expected key families |
|---|---|
| `sleeves/manifests/catalog.json` | `catalog_status`, `catalog_scope`, `sleeves` |

If parse fails or key families are absent:
- hold, do not guess schema repair

---

## 9. Mode Selection Algorithm

### Pseudo-code
```text
function selectMode(input):
  if input.mode == 'direct_source':
    return direct_source

  if input.mode == 'public_curated':
    return public_curated

  return HOLD_RESOLVER_MODE_UNCLEAR
```

### Rule
There is no implicit mixed mode.
There is no fallback to recursive scanning.
Mode must be explicit.

---

## 10. Direct Source Resolution Algorithm

### Purpose
Discover source-oriented machine content using canonical AI manifest and object lanes.

### Pseudo-code
```text
function resolveDirectSource(input):
  trace('mode=direct_source')

  validateActiveRoot(input.activeRoot)

  entrypoints = loadDirectSourceEntrypoints(input.activeRoot)
  parseAll(entrypoints)

  releaseFilter = entrypoints.releaseApprovedContent
  sleeveCatalog = entrypoints.sleeveCatalog
  neostackIndex = entrypoints.neostackIndex
  neoblockIndex = entrypoints.neoblockIndex
  moltIndex = entrypoints.moltIndex
  gateIndex = entrypoints.gateIndex

  resolved = {}

  if input.requestedSleeveId exists:
    sleeveEntry = find sleeve by id in sleeveCatalog.sleeves
    if not found:
      return HOLD_REFERENCED_OBJECT_MISSING

    sleevePath = normalizeAndBindPath(sleeveCatalog.file, sleeveEntry.source_path, activeRoot)
    validateAllowlist(sleevePath, mode='direct_source')
    ensureExists(sleevePath)
    resolved.sleeve = parseJson(sleevePath) or parseSleeveFolder(sleevePath)

  resolved.indexes.neostacks = neostackIndex
  resolved.indexes.neoblocks = neoblockIndex
  resolved.indexes.molt = moltIndex
  resolved.indexes.gates = gateIndex
  resolved.releaseFilter = releaseFilter

  return success(resolved)
```

### Notes
- `release-approved-content.json` is loaded in direct mode but does not automatically hide source objects.
- it acts as governance/filter context, warning signal, and public-scope constraint input.

---

## 11. Public Curated Resolution Algorithm

### Purpose
Discover promotion-filtered machine content intended for public/plugin/package-facing use.

### Pseudo-code
```text
function resolvePublicCurated(input):
  trace('mode=public_curated')

  validateActiveRoot(input.activeRoot)

  catalog = loadJson(activeRoot + '/sleeves/manifests/catalog.json')
  readme = loadText(activeRoot + '/sleeves/manifests/README.md')

  if input.requestedCatalogId exists:
    entry = find sleeve by id in catalog.sleeves
    if not found:
      return HOLD_REFERENCED_OBJECT_MISSING

    sourcePath = normalizeAndBindPath(catalog.file, entry.source_path, activeRoot)
    validateAllowlist(sourcePath, mode='public_curated')
    ensureExists(sourcePath)

    if entry.status in ['historical_non_promoted']:
      return HOLD_CROSS_LANE_CONFLICT_UNRESOLVED or policy reject

    resolvedObject = parseJson(sourcePath)

  return success({
    publicCatalog: catalog,
    requestedObject: resolvedObject,
    interpretationSource: readme
  })
```

### Notes
- public statuses matter in this mode
- source-oriented AI manifest lane does not override public catalog statuses in this mode

---

## 12. Allowlist Validation Algorithm

### Pseudo-code
```text
function validateAllowlist(path, mode):
  if mode == 'direct_source':
    allowedPrefixes = [
      activeRoot + '\\AI\\MANIFESTS\\',
      activeRoot + '\\AI\\SLEEVES\\',
      activeRoot + '\\AI\\NEOSTACKS\\',
      activeRoot + '\\AI\\NEOBLOCKS\\',
      activeRoot + '\\AI\\MOLT-BLOCKS\\',
      activeRoot + '\\AI\\GATES\\',
      activeRoot + '\\META\\'
    ]

  if mode == 'public_curated':
    allowedPrefixes = [
      activeRoot + '\\sleeves\\manifests\\',
      activeRoot + '\\sleeves\\',
      activeRoot + '\\META\\'
    ]

  if path does not start with any allowed prefix:
    return HOLD_DENYLIST_PATH_SELECTED

  return ok
```

### Important caution
`META/` is allowed for interpretation/governance support only, not as a primary object lane.

---

## 13. Denylist Validation Algorithm

### Pseudo-code
```text
function containsDenylistSegment(path):
  denySegments = [
    'backup', 'backups', 'plugin-backups', 'archive', 'legacy', 'scratch',
    'worklogs', 'publish-stage', 'release-clean', 'staging', 'inspect',
    'old-alpha', 'previous-alpha', 'Resleever', 'UMG_Envoy_Resleever'
  ]

  for segment in path.segments:
    if segment case-insensitive matches denySegments:
      return true

  return false
```

### Special in-root denials as primary source
Even within `activeRoot`, primary-source resolution must not start from:
- `HUMAN/`
- `blocks/molt/subjects/`
- `AI/EXAMPLES/`
- `AI/FIXTURES/`
- `AI/RUNTIME-REFERENCE/`
- `AI/OVERLAYS/` unless future governance explicitly allows it

---

## 14. Source Path Resolution Rules

When manifest entries include `source_path`:

1. resolve relative to the manifest/catalog file location
2. normalize absolute path
3. enforce active-root boundary
4. enforce mode allowlist
5. enforce denylist
6. require target to exist
7. require target parseability when expected to be JSON

### If target is a file
- parse according to extension

### If target is a folder
resolver should check conservative folder expectations, for example:
- `sleeve.json`
- `manifest.json`
- `sleeve.lock.json`

If multiple plausible object files exist and no explicit rule distinguishes them:
- hold instead of guessing

---

## 15. Status Interpretation Rules

### Direct-source sleeve statuses
Observed examples:
- `top_level_source`
- `generated`
- `archived`

Rule:
- these statuses describe source state, not public promotion posture
- do not reinterpret them as public-safe/public-promoted automatically

### Public-curated sleeve statuses
Observed examples:
- `needs_normalization`
- `promoted_reference`
- `compatibility_reference`
- possible future `historical_non_promoted`

Rule:
- these statuses control public/package-facing interpretation
- `promoted_reference` is strongest safe public success-path candidate
- `compatibility_reference` is visible but should be treated cautiously
- `needs_normalization` should not automatically be treated as top-trust success-path content without policy allowance

---

## 16. Cross-Lane Conflict Algorithm

### Pseudo-code
```text
function resolveCrossLaneConflict(mode, sourceEntry, publicEntry):
  if mode == 'direct_source':
    return sourceEntry

  if mode == 'public_curated':
    return publicEntry

  return HOLD_CROSS_LANE_CONFLICT_UNRESOLVED
```

### Example conflicts
- same sleeve id appears in both catalogs with different status
- one catalog exposes source while the other intentionally hides or downgrades promotion posture
- public catalog says compatibility only, but direct source catalog says generated/top-level source

Resolution principle:
- mode selects authority
- not blended merge

---

## 17. Release Filter Handling

### Purpose
Use `release-approved-content.json` as a governance/public-scope signal.

### Pseudo-code
```text
function applyReleaseFilter(mode, releaseFilter, resolvedObjects):
  if mode == 'direct_source':
    add warnings/annotations only
    do not automatically hide source objects unless strict public scope is requested

  if mode == 'public_curated':
    use releaseFilter as additional support signal
    but primary authority remains public curated catalog

  return annotatedResolution
```

### Practical rule
- In `direct_source`: release filter annotates, warns, or scopes public suitability.
- In `public_curated`: release filter can reinforce constraints but does not replace the curated catalog.

---

## 18. Trace / Debug Output Shape

If `trace == true`, the resolver should collect machine-readable trace steps.

### Trace step shape
```json
{
  "step": "LOAD_ENTRYPOINT",
  "path": "C:\\...\\AI\\MANIFESTS\\sleeve-catalog.json",
  "result": "ok",
  "details": {
    "keys": ["catalog_status", "catalog_scope", "sleeves"]
  }
}
```

### Suggested step names
- `INIT`
- `VALIDATE_ROOT`
- `VALIDATE_MODE`
- `LOAD_ENTRYPOINT`
- `PARSE_ENTRYPOINT`
- `RESOLVE_SOURCE_PATH`
- `VALIDATE_ALLOWLIST`
- `VALIDATE_DENYLIST`
- `LOAD_OBJECT`
- `APPLY_RELEASE_FILTER`
- `ASSEMBLE_RESULT`
- `RETURN_HOLD`
- `RETURN_SUCCESS`

---

## 19. Error / Hold Code Table

| Code | Meaning |
|---|---|
| `HOLD_ACTIVE_ROOT_INVALID` | active root missing or outside approved root |
| `HOLD_RESOLVER_MODE_UNCLEAR` | mode not specified or not recognized |
| `HOLD_ENTRYPOINT_MISSING` | authoritative entrypoint missing |
| `HOLD_ENTRYPOINT_PARSE_FAILED` | authoritative entrypoint cannot parse |
| `HOLD_REFERENCED_OBJECT_MISSING` | manifest referenced object missing |
| `HOLD_DENYLIST_PATH_SELECTED` | path resolves into rejected lane |
| `HOLD_UNSCOPED_EXPORT_LANE` | only export lane candidate available without canonical confirmation |
| `HOLD_CROSS_LANE_CONFLICT_UNRESOLVED` | conflict not safely resolvable with current rules |
| `HOLD_AMBIGUOUS_OBJECT_FOLDER` | folder contains multiple plausible object files with no deciding rule |

---

## 20. Strict Mode Behavior

If `strict == true`:
- any warning-worthy ambiguity becomes a hold
- `needs_normalization` public entries should not auto-pass as best-trust public success path
- export-lane fallback should be disallowed
- missing release filter annotations should be reported explicitly if relevant

If `strict == false`:
- warnings may be returned without halting, but denylist and parse failures still hold

---

## 21. Safe Default Behavior Recommendation

If future Alpha.6 runtime needs a safe default algorithm choice:

```text
defaultMode = public_curated
strict = true
trace = optional
```

Rationale:
- aligns with public/plugin-facing safety
- reduces accidental ingestion of source-only or historical content
- respects promotion posture

---

## 22. End-to-End Pseudo-code

```text
function resolveAlpha6Library(input):
  trace = []

  emit(INIT)

  if not isValidActiveRoot(input.activeRoot):
    return hold(HOLD_ACTIVE_ROOT_INVALID)

  emit(VALIDATE_ROOT)

  mode = selectMode(input)
  if mode is hold:
    return hold(HOLD_RESOLVER_MODE_UNCLEAR)

  emit(VALIDATE_MODE, mode)

  if mode == 'direct_source':
    result = resolveDirectSource(input)
  else if mode == 'public_curated':
    result = resolvePublicCurated(input)
  else:
    return hold(HOLD_RESOLVER_MODE_UNCLEAR)

  if result is hold or reject:
    return result

  emit(ASSEMBLE_RESULT)
  return success(result)
```

---

## 23. Recommended Phase 6 Focus

Phase 6 should be the last design step before any implementation.

Recommended deliverable:
- a concrete data-shape contract for normalized resolver outputs

Suggested focus:
1. normalized sleeve object shape
2. normalized neostack object shape
3. normalized neoblock object shape
4. normalized MOLT object shape
5. normalized trace output schema
6. normalized hold/reject schema
7. compatibility mapping between direct-source and public-curated identifiers

---

## 24. Recommended Next Step

**Proceed to Phase 6: normalized output/data-shape contract, still with no runtime implementation.**

---

## 25. Final Phase 5 State

- **phase5_status:** `complete`
- **implementation_started:** `false`
- **runtime_changed:** `false`
- **publish_attempted:** `false`
- **recommended_next_phase:** `Phase 6 — normalized output/data-shape contract`
