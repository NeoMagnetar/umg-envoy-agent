# UMG-ENVOY-ALPHA6-PHASE3-AUTHORITATIVE-ENTRYPOINT-MAP.md

## Purpose
This Phase 3 report identifies the likely authoritative entrypoint files and the lane-to-lane relationships inside the active UMG Block Library root.

Active root:
- `C:\.openclaw\workspace\UMG-Block-Library`

This is still read-only planning.
No resolver implementation was performed.
No runtime behavior was changed.

---

## 1. Phase 3 Verdict

**ALPHA6_PHASE3_ENTRYPOINT_MAP_COMPLETE**

---

## 2. Main Outcome

The library appears to support **two intentionally different machine-facing entrypoint regimes** inside one project:

1. **Direct / source-oriented machine discovery**
   - centered in `AI/MANIFESTS/`
   - backed by `AI/SLEEVES/`, `AI/MOLT-BLOCKS/`, `AI/NEOBLOCKS/`, `AI/NEOSTACKS/`

2. **Curated public / package-facing machine discovery**
   - centered in `sleeves/manifests/catalog.json`
   - backed by top-level `sleeves/`

This matches the earlier Phase 2 finding that the repo is intentionally multi-lane rather than accidentally duplicated.

---

## 3. Active Root

- **active_root:** `C:\.openclaw\workspace\UMG-Block-Library`
- **phase1_status:** `ALPHA6_REAL_LIBRARY_ROOT_FOUND`
- **phase2_status:** `ALPHA6_PHASE2_STRUCTURE_MAP_COMPLETE`
- **phase3_mode:** `read-only authoritative entrypoint map`

---

## 4. Primary Authoritative Entrypoints

### 4.1 Direct/source-oriented machine manifest entrypoints

These are the strongest candidates for authoritative machine discovery in a future direct/source-oriented Alpha.6 mode.

| File | Role | Why it matters |
|---|---|---|
| `AI/MANIFESTS/sleeve-catalog.json` | direct sleeve discovery entrypoint | explicitly documented as direct/source-oriented machine sleeve catalog |
| `AI/MANIFESTS/molt-block-library-index.json` | MOLT library discovery entrypoint | indexes canonical machine-readable MOLT block libraries |
| `AI/MANIFESTS/neoblock-library-index.json` | NeoBlock discovery entrypoint | source-oriented machine index for NeoBlock lane |
| `AI/MANIFESTS/neostack-library-index.json` | NeoStack discovery entrypoint | source-oriented machine index for NeoStack lane |
| `AI/MANIFESTS/gate-library-index.json` | gate discovery entrypoint | gate discovery/index surface |
| `AI/MANIFESTS/release-approved-content.json` | release-approved content filter / policy signal | lists intentionally approved first-public-population content surfaces |
| `AI/MANIFESTS/MANIFEST.NS.UMG.LANGCHAIN_BRIDGE.v0.1.json` | special-purpose bridge manifest | indicates specialized machine-facing bridge manifest surface |

### 4.2 Curated public/package-facing machine entrypoints

These are the strongest candidates for authoritative public/package-facing discovery.

| File | Role | Why it matters |
|---|---|---|
| `sleeves/manifests/catalog.json` | public package-facing sleeve discovery entrypoint | explicitly documented as curated public machine catalog |
| `sleeves/manifests/README.md` | machine catalog doctrine/explanation | explains promotion posture and why public catalog may differ from direct machine catalog |

### 4.3 Canonical machine object lanes behind the manifests

These are not just indexes; they are the actual machine-readable object lanes the manifests point toward.

| Lane | Typical object form | Status |
|---|---|---|
| `AI/SLEEVES/` | sleeve folders with `sleeve.json`, lockfiles, manifests | canonical machine source |
| `AI/MOLT-BLOCKS/` | JSON library files | canonical machine source |
| `AI/NEOBLOCKS/` | JSON NeoBlock objects | likely canonical machine source |
| `AI/NEOSTACKS/` | JSON NeoStack objects | likely canonical machine source |

---

## 5. Concrete File Evidence

### 5.1 AI manifest lane files found
Observed files under `AI/MANIFESTS/`:
- `gate-library-index.json`
- `MANIFEST.NS.UMG.LANGCHAIN_BRIDGE.v0.1.json`
- `molt-block-library-index.json`
- `neoblock-library-index.json`
- `neostack-library-index.json`
- `release-approved-content.json`
- `sleeve-catalog.json`
- `README.md`

### 5.2 Parsed top-level keys from key manifest files

| File | Parsed keys |
|---|---|
| `AI/MANIFESTS/gate-library-index.json` | `gates`, `notes`, `scope`, `status` |
| `AI/MANIFESTS/molt-block-library-index.json` | `category`, `declared_count`, `id`, `path`, `store`, `title`, `types` |
| `AI/MANIFESTS/neoblock-library-index.json` | `category`, `declared_count`, `id`, `path`, `store`, `title` |
| `AI/MANIFESTS/neostack-library-index.json` | `category`, `declared_count`, `id`, `path`, `store`, `title` |
| `AI/MANIFESTS/sleeve-catalog.json` | `catalog_scope`, `catalog_status`, `generated_at`, `notes`, `sleeves` |
| `AI/MANIFESTS/release-approved-content.json` | `approved`, `notes`, `release`, `status` |

### 5.3 Parsed object-shape evidence from downstream lanes

| File | Parsed keys | Meaning |
|---|---|---|
| `AI/SLEEVES/categories/core/SLV.UMG.CORE_REFERENCE.v1/sleeve.json` | `identity`, `metadata`, `provenance`, `sleeve` | machine sleeve payload shape |
| `AI/SLEEVES/categories/core/SLV.UMG.CORE_REFERENCE.v1/sleeve.lock.json` | `lockfile_version`, `notes`, `resolution_state`, `resolved_artifacts`, `resolved_at`, `resolved_by`, `sleeve_id`, `sleeve_version` | machine sleeve resolution/lock metadata |
| `AI/SLEEVES/categories/meta-random/sample-basic-minimal/manifest.json` | `id`, `name`, `notes`, `source_path`, `status` | source-oriented sleeve manifest entry |
| `AI/NEOBLOCKS/categories/core/NB.UMG.COMPILER_EXECUTION.v1.json` | `identity`, `metadata`, `neoblock`, `provenance` | machine NeoBlock payload shape |
| `AI/NEOSTACKS/categories/core/NS.UMG.CORE.COMPILER_FLOW.v1.json` | `identity`, `metadata`, `neostack`, `provenance` | machine NeoStack payload shape |

This is strong evidence that the middle layers are not just placeholders; they already contain structured machine objects.

---

## 6. Relationship Between the Two Sleeve Catalogs

### 6.1 Direct/source-oriented sleeve catalog
File:
- `AI/MANIFESTS/sleeve-catalog.json`

Observed meaning:
- `catalog_status`: `curated_authoritative_direct_sleeve_catalog`
- describes itself as authoritative for directly cataloged sleeve JSON source entries
- explicitly says broader sleeve/library surfaces may be derived/provisional

Observed example statuses in direct/source catalog:
- `top_level_source`
- `generated`
- `archived`

Interpretation:
- this lane is trying to tell maintainers and tooling what the source-oriented sleeve universe looks like
- it includes material that may be historical/generated/archived, because source visibility matters here

### 6.2 Curated public/package-facing sleeve catalog
File:
- `sleeves/manifests/catalog.json`

Observed meaning:
- `catalog_status`: `public_package_curated_sleeve_catalog`
- describes itself as bundled public-facing sleeve catalog for package use
- intentionally classifies entries by promotion posture

Observed example statuses in public/package catalog:
- `needs_normalization`
- `promoted_reference`
- `compatibility_reference`

Interpretation:
- this lane is not trying to expose every source sleeve equally
- it is promotion-filtered and package-facing
- it is the safer public consumption layer

### 6.3 Practical relationship rule
For future Alpha.6 planning:
- `AI/MANIFESTS/sleeve-catalog.json` should be treated as the **source-oriented authoritative sleeve discovery file**
- `sleeves/manifests/catalog.json` should be treated as the **curated public/package-facing sleeve discovery file**
- they should **not** be merged conceptually
- differences are intentional, not necessarily bugs

---

## 7. Relationship Between AI MOLT and blocks/molt/subjects

### 7.1 Canonical MOLT source lane
File/lane:
- `AI/MOLT-BLOCKS/`

Evidence:
- explicitly described as canonical machine-readable source in multiple docs
- contains broad machine-readable library files and category files

### 7.2 Export/public lane
File/lane:
- `blocks/molt/subjects/`

Observed files:
- `aim.library.v1.0.0.json`
- `need.library.v1.0.0.json`
- `use.library.v1.0.0.json`
- `README.md`

Observed README meaning:
- machine-facing public/package/export lane
- should not be assumed canonical authoring shelf
- authority unresolved / export-facing secondary

### 7.3 Practical relationship rule
For future Alpha.6 planning:
- `AI/MOLT-BLOCKS/` should be treated as the **primary machine MOLT source lane**
- `blocks/molt/subjects/` should be treated as **secondary/export/public-facing derived lane**
- Alpha.6 should not silently replace AI MOLT source with blocks/molt/subjects

---

## 8. Likely Authoritative File Entry Order For Future Direct/Source Mode

If a future resolver needs a deterministic read order for direct/source-oriented discovery, the most sensible Phase 3 planning order appears to be:

1. `AI/MANIFESTS/release-approved-content.json`
   - use as release/public-scope policy signal
2. `AI/MANIFESTS/sleeve-catalog.json`
   - sleeve discovery anchor
3. `AI/MANIFESTS/neostack-library-index.json`
   - stack discovery anchor
4. `AI/MANIFESTS/neoblock-library-index.json`
   - neoblock discovery anchor
5. `AI/MANIFESTS/molt-block-library-index.json`
   - MOLT discovery anchor
6. `AI/MANIFESTS/gate-library-index.json`
   - gate discovery anchor
7. follow `source_path` or indexed paths into:
   - `AI/SLEEVES/`
   - `AI/NEOSTACKS/`
   - `AI/NEOBLOCKS/`
   - `AI/MOLT-BLOCKS/`

Why this order:
- it begins with manifest-defined discovery
- it respects documented direct/source-oriented catalogs
- it defers object loading until manifest/index resolution says where to go

---

## 9. Likely Authoritative File Entry Order For Future Public/Package Mode

If a future resolver needs a deterministic read order for public/package-facing discovery, the most sensible planning order appears to be:

1. `sleeves/manifests/catalog.json`
2. referenced `source_path` targets under top-level `sleeves/`
3. only approved/promoted package-facing artifacts
4. optionally constrained supporting public-safe block lanes if governance later allows them

Why this order:
- it starts from the intentionally curated public package catalog
- it avoids leaking source-oriented historical/generated/archive lanes by default

---

## 10. Release-Approved Content File Implication

`AI/MANIFESTS/release-approved-content.json` is especially important.

Observed purpose from contents:
- lists doctrine
- lists schemas
- lists runtime-aligned surfaces
- lists approved MOLT categories
- lists approved MOLT library files

Implication:
- this file looks like a policy/filter bridge between the fuller source repo and what is intentionally approved for public population/release posture
- future Alpha.6 planning should probably treat this as a **governance filter** rather than as the sole content catalog

In plain language:
- the source catalogs tell you what exists
- release-approved-content tells you what is approved for a particular public population posture

---

## 11. Suggested Non-Resolver Planning Rules

These are not implementation commands; they are planning conclusions from the evidence.

### Rule A
Do not start discovery from `HUMAN/`.

### Rule B
Do not start discovery from `blocks/molt/subjects/` when seeking canonical source.

### Rule C
Use `AI/MANIFESTS/` as the first stop for direct/source-oriented machine discovery.

### Rule D
Use `sleeves/manifests/catalog.json` as the first stop for curated public/package-facing discovery.

### Rule E
Treat `release-approved-content.json` as a release-scope filter, not as a substitute for source discovery.

### Rule F
Treat `AI/SLEEVES/`, `AI/NEOSTACKS/`, `AI/NEOBLOCKS/`, and `AI/MOLT-BLOCKS/` as the object lanes behind the manifest/index discovery layer.

---

## 12. Confidence Notes

### High confidence
- `AI/MANIFESTS/` is the direct/source-oriented machine discovery authority lane
- `sleeves/manifests/catalog.json` is the curated public/package-facing machine discovery authority file
- `AI/MOLT-BLOCKS/` is canonical machine MOLT source
- `blocks/molt/subjects/` is secondary/export

### Moderate-to-high confidence
- `AI/NEOBLOCKS/` and `AI/NEOSTACKS/` are authoritative machine middle layers

Reason for slightly lower than absolute confidence:
- no README files were found in those exact directories during this pass
- however, file structure and parsed object shapes strongly support their source role

---

## 13. Recommended Phase 4 Focus

**Phase 4 should define the resolver contract on paper before code.**

Recommended questions for Phase 4:
1. What exact manifest/index files are mandatory inputs in direct/source mode?
2. What exact manifest/index files are mandatory inputs in public/package mode?
3. What precedence rules apply when direct/source and public/package catalogs disagree?
4. How should historical/generated/archived sleeve statuses be filtered in Alpha.6?
5. How should `release-approved-content.json` constrain loadable content in public mode?
6. Which subpaths are mandatory allowlist roots for direct/source mode?
7. Which subpaths are mandatory denylist roots regardless of mode?

---

## 14. Recommended Next Step

**Proceed to Phase 4: resolver contract and precedence rules, still without implementing runtime loading.**

---

## 15. Short Practical Summary

If the next agent needs the fastest possible truth:
- direct machine source starts at `AI/MANIFESTS/`
- public package discovery starts at `sleeves/manifests/catalog.json`
- real machine objects live under `AI/SLEEVES/`, `AI/NEOSTACKS/`, `AI/NEOBLOCKS/`, `AI/MOLT-BLOCKS/`
- `release-approved-content.json` acts like a release-scope governance filter
- `blocks/molt/subjects/` is export/public-facing, not primary source
- `HUMAN/` is for explanation, not default machine loading

---

## 16. Final Phase 3 State

- **phase3_status:** `complete`
- **resolver_implemented:** `false`
- **runtime_changed:** `false`
- **publish_attempted:** `false`
- **recommended_next_phase:** `Phase 4 — resolver contract and precedence rules`
