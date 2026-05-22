# UMG-ENVOY-ALPHA6-PHASE4-RESOLVER-CONTRACT.md

## Purpose
This Phase 4 document defines the resolver contract for Alpha.6 **on paper only**.

It does not implement runtime loading.
It does not patch plugin behavior.
It does not publish a release.

The goal is to define:
- read modes
- authoritative entrypoints
- precedence rules
- allowlist and denylist lanes
- conflict/hold rules
- how Alpha.6 should decide what to read later

Active root:
- `C:\.openclaw\workspace\UMG-Block-Library`

---

## 1. Phase 4 Verdict

**ALPHA6_PHASE4_RESOLVER_CONTRACT_DEFINED**

---

## 2. Core Principle

There is **one product**:
- `UMG Envoy Agent`

There are **multiple content states/lanes inside the same library**:
- direct/source-oriented machine discovery
- curated public/package-facing machine discovery
- human-readable explanation/reference
- secondary/export machine lanes

Alpha.6 must not treat lane differences as separate products.
Instead:
- one product
- one resolver contract
- mode/manifest rules determine what is discoverable

---

## 3. Resolver Modes

The contract defines two resolver modes.

### Mode A — `direct_source`
Purpose:
- maintainer/developer/source-oriented machine discovery
- authoritative structural inspection of the real library

Primary entrypoint family:
- `AI/MANIFESTS/`

Expected object lanes:
- `AI/SLEEVES/`
- `AI/NEOSTACKS/`
- `AI/NEOBLOCKS/`
- `AI/MOLT-BLOCKS/`
- `AI/GATES/` when needed

### Mode B — `public_curated`
Purpose:
- public/plugin/package-facing machine discovery
- promotion-filtered, success-path-oriented resolution

Primary entrypoint family:
- `sleeves/manifests/`

Expected object lanes:
- top-level `sleeves/`
- explicitly promoted package-facing machine artifacts
- only whatever later governance allows beyond sleeves

### Not a mode
These are **not** resolver modes and should not be treated as starting points:
- `HUMAN/`
- `blocks/molt/subjects/` as canonical source
- artifacts, backups, publish-stage, release-clean, inspect, Resleever

---

## 4. Authoritative Entrypoints By Mode

### 4.1 `direct_source` authoritative entrypoints
In precedence order:

1. `AI/MANIFESTS/release-approved-content.json`
2. `AI/MANIFESTS/sleeve-catalog.json`
3. `AI/MANIFESTS/neostack-library-index.json`
4. `AI/MANIFESTS/neoblock-library-index.json`
5. `AI/MANIFESTS/molt-block-library-index.json`
6. `AI/MANIFESTS/gate-library-index.json`
7. `AI/MANIFESTS/MANIFEST.NS.UMG.LANGCHAIN_BRIDGE.v0.1.json` when bridge-specific discovery is needed

Interpretation:
- `release-approved-content.json` is a release/public-scope filter signal
- `sleeve-catalog.json` is the sleeve discovery anchor
- the remaining indexes define downward traversal into stacks, neoblocks, blocks, and gates

### 4.2 `public_curated` authoritative entrypoints
In precedence order:

1. `sleeves/manifests/catalog.json`
2. `sleeves/manifests/README.md` for interpretation of statuses/promotions
3. resolved `source_path` targets under top-level `sleeves/`

Interpretation:
- public mode begins from the curated package-facing sleeve catalog
- source-oriented AI manifests do not override public catalog posture in this mode unless a future governance rule explicitly allows it

---

## 5. Allowlist Roots

### 5.1 Global mandatory allowlist root
- `C:\.openclaw\workspace\UMG-Block-Library`

No resolver logic should leave this active root when resolving Alpha.6 library content unless a future governance rule explicitly allows multi-root resolution.

### 5.2 `direct_source` allowlist subpaths
- `AI/MANIFESTS/`
- `AI/SLEEVES/`
- `AI/NEOSTACKS/`
- `AI/NEOBLOCKS/`
- `AI/MOLT-BLOCKS/`
- `AI/GATES/`
- `AI/COMPILER/` only if later needed for reference metadata, not as primary content discovery
- `META/` only for governance/interpretation, not as primary content objects

### 5.3 `public_curated` allowlist subpaths
- `sleeves/manifests/`
- top-level `sleeves/`
- any package-facing artifact subpaths explicitly referenced by curated manifest entries
- `META/` only for governance/interpretation, not as primary content objects

---

## 6. Denylist Roots And Hard Reject Lanes

These are denied regardless of resolver mode unless the user explicitly reclassifies them.

### Workspace-level denylist classes
- `backup`
- `backups`
- `plugin-backups`
- `archive`
- `legacy`
- `scratch`
- `worklogs`
- `publish-stage`
- `release-clean`
- `staging`
- `inspect`
- `old-alpha`
- `previous-alpha`
- extracted package/artifact folders
- `Resleever`
- `UMG_Envoy_Resleever`

### Specific known non-source lanes from current workspace
- `C:\.openclaw\workspace\work\public-next\package`
- `C:\.openclaw\workspace\umg-envoy-agent-publish-stage`
- `C:\.openclaw\workspace\umg-envoy-agent-release-clean`
- `C:\.openclaw\workspace\plugin-backups`
- `C:\.openclaw\workspace\backups`
- `C:\.openclaw\workspace\_inspect_umg_alpha2_tgz`
- `C:\.openclaw\workspace\artifacts\...\UMG_Envoy_Resleever`

### In-root denylist behavior
Inside the active root, these are denied as **primary content sources**:
- `HUMAN/`
- `blocks/molt/subjects/` as canonical source
- `AI/EXAMPLES/`
- `AI/FIXTURES/`
- `AI/RUNTIME-REFERENCE/` as canonical source
- `AI/OVERLAYS/` unless explicitly selected by future governance

Note:
- denied as primary source does **not** mean useless; it means the resolver must not silently treat them as the authoritative starting point

---

## 7. Precedence Rules

### Rule 1 — Mode first
The resolver must decide mode before reading content:
- `direct_source`
- `public_curated`

No mixed implicit mode.
If mode cannot be determined, hold.

### Rule 2 — Entrypoint before object lane
The resolver must start from the authoritative manifest/catalog entrypoint for the chosen mode.
It must not start by recursively scanning object folders first.

### Rule 3 — Manifest/catalog beats raw folder presence
If a folder contains content but the chosen authoritative catalog does not reference or authorize it for that mode, the resolver must not assume it is active for that mode.

### Rule 4 — Source catalog and public catalog are intentionally allowed to differ
Differences between:
- `AI/MANIFESTS/sleeve-catalog.json`
- `sleeves/manifests/catalog.json`

are not automatically bugs.
In `direct_source`, the AI manifest lane wins.
In `public_curated`, the sleeves/manifests lane wins.

### Rule 5 — Canonical machine source beats export lane
When both appear to describe similar content:
- `AI/MOLT-BLOCKS/` beats `blocks/molt/subjects/`

unless a future governance rule explicitly requests export/public-lane resolution.

### Rule 6 — Machine source beats human-readable explanation
When HUMAN and machine lanes differ, machine lanes control machine resolution.
HUMAN is explanation/reference only unless a future explicit rule says otherwise.

### Rule 7 — Release-approved filter constrains public/public-like resolution
If `release-approved-content.json` excludes or omits a surface, Alpha.6 should treat that as a caution signal for public/package-oriented resolution.
It may still be visible in `direct_source` mode, but not automatically promoted.

### Rule 8 — Explicit denylist beats all soft evidence
If a candidate path is artifact/staging/backup/Resleever-classified, it is rejected even if it looks structurally rich.

---

## 8. Conflict Resolution Rules

### Conflict A — Same sleeve appears in both catalogs with different statuses
Resolution:
- in `direct_source`, trust `AI/MANIFESTS/sleeve-catalog.json` for source status
- in `public_curated`, trust `sleeves/manifests/catalog.json` for public posture
- do not merge statuses into one blended status automatically

### Conflict B — A HUMAN sleeve exists but no public machine sleeve exists
Resolution:
- do not manufacture a machine sleeve from HUMAN docs
- mark as human-readable only / unresolved for machine runtime use

### Conflict C — Export lane has file, canonical lane differs or omits
Resolution:
- canonical lane wins
- export lane remains secondary/reference unless explicitly requested by policy

### Conflict D — Object file exists but manifest does not reference it in chosen mode
Resolution:
- object is not loadable by default in that mode
- treat as unreferenced or not active for that mode

### Conflict E — Manifest references a missing object file
Resolution:
- hold resolution for that object
- do not silently substitute from another lane
- report missing target explicitly

---

## 9. Hold Conditions

The future resolver should stop and report a hold instead of guessing when any of these occur.

### `HOLD_RESOLVER_MODE_UNCLEAR`
Use when:
- mode was not specified
- no safe default mode is configured

### `HOLD_ENTRYPOINT_MISSING`
Use when:
- chosen authoritative manifest/catalog file is missing

### `HOLD_ENTRYPOINT_PARSE_FAILED`
Use when:
- chosen authoritative manifest/catalog file fails to parse

### `HOLD_REFERENCED_OBJECT_MISSING`
Use when:
- manifest/catalog references object file that does not exist

### `HOLD_CROSS_LANE_CONFLICT_UNRESOLVED`
Use when:
- direct/source and public/package interpretations conflict in a way the current precedence rules do not fully resolve

### `HOLD_DENYLIST_PATH_SELECTED`
Use when:
- resolution would require artifact/backup/staging/Resleever path

### `HOLD_UNSCOPED_EXPORT_LANE`
Use when:
- only export lane objects are available and canonical source lane evidence is missing or contradictory

---

## 10. Safe Default Recommendation

If Alpha.6 later needs a single safe default for user-facing runtime/plugin behavior, the safest default appears to be:

**default mode: `public_curated`**

Why:
- it respects promotion posture
- it aligns better with public/plugin exposure
- it avoids accidentally ingesting historical/generated/source-only materials as if they were promoted public runtime assets

At the same time:
- maintainer/dev inspection features may still need explicit `direct_source` mode

This does **not** create two products.
It creates one product with one resolver contract and explicit mode choice.

---

## 11. Resolver Contract Summary Table

| Area | Contract |
|---|---|
| Product model | one product, multiple lane states |
| Active root | `C:\.openclaw\workspace\UMG-Block-Library` |
| Primary modes | `direct_source`, `public_curated` |
| Direct-source entrypoint | `AI/MANIFESTS/` |
| Public-curated entrypoint | `sleeves/manifests/catalog.json` |
| Canonical machine sleeve lane | `AI/SLEEVES/` |
| Canonical machine MOLT lane | `AI/MOLT-BLOCKS/` |
| Likely canonical machine middle layers | `AI/NEOBLOCKS/`, `AI/NEOSTACKS/` |
| Human shelf role | explanation/reference only |
| Export lane role | secondary/export only |
| Public scope filter | `AI/MANIFESTS/release-approved-content.json` |
| Hard rejects | artifacts, backups, staging, Resleever, inspect lanes |

---

## 12. Suggested Phase 5 Focus

Phase 5 should still remain design-first, not runtime-first.

Recommended Phase 5 deliverable:
- a precise pseudo-code or state-machine style resolver algorithm doc using this contract

Suggested contents:
1. mode selection inputs
2. entrypoint parsing order
3. path normalization rules
4. allowed `source_path` resolution behavior
5. object existence checks
6. hold/error return shapes
7. trace/debug output shape
8. release-manifest gating logic

---

## 13. Recommended Next Step

**Proceed to Phase 5: resolver algorithm spec / pseudo-code, still without implementing runtime loading.**

---

## 14. Final Phase 4 State

- **phase4_status:** `complete`
- **runtime_implemented:** `false`
- **runtime_changed:** `false`
- **publish_attempted:** `false`
- **recommended_next_phase:** `Phase 5 — resolver algorithm specification`
