# UMG-ENVOY-ALPHA6-PHASE2-LIBRARY-STRUCTURE-MAP.md

## Purpose
This Phase 2 report maps the selected active UMG Block Library root in read-only mode.

Active root carried forward from Phase 1:
- `C:\.openclaw\workspace\UMG-Block-Library`

This phase does **not** implement the resolver.
It only classifies the internal library lanes so Alpha.6 can later choose what to read and what to ignore.

---

## 1. Phase 2 Verdict

**ALPHA6_PHASE2_STRUCTURE_MAP_COMPLETE**

---

## 2. Phase 2 Goal

Determine, inside the active library root:
- which lanes are canonical machine-readable source
- which lanes are human-readable mirrors or bridge shelves
- which lanes are curated public/package-facing catalogs
- which lanes are secondary/export lanes
- which lanes should likely be considered by a future Alpha.6 resolver
- which lanes should likely be ignored by a future Alpha.6 resolver unless explicitly requested

---

## 3. Active Root

- **active_root:** `C:\.openclaw\workspace\UMG-Block-Library`
- **phase1_verdict:** `ALPHA6_REAL_LIBRARY_ROOT_FOUND`
- **phase2_mode:** `read-only structure map`

---

## 4. Top-Level Root Structure

| Path | Class | Notes |
|---|---|---|
| `AI/` | machine/source side | primary machine-oriented namespace |
| `HUMAN/` | human-readable side | readable explanation / bridge namespace |
| `META/` | governance/meta side | status, scope, and governance definitions |
| `sleeves/` | curated public machine artifact side | package-facing machine sleeve lane |
| `blocks/` | secondary/export side | limited machine-facing export lane present |

Interpretation:
- The root is intentionally multi-lane.
- It is **not** a flat “all content is equally canonical” repository.
- The repo documents explicit lane differences and warns against collapsing them.

---

## 5. Canonicality Evidence From Readmes

### Root README
Observed claims from `README.md`:
- repo is a curated public UMG block-library surface
- `AI/` is the machine-readable shelf
- `HUMAN/` is the human-readable shelf
- top-level `sleeves/` is the public/package-facing machine sleeve artifact lane
- `AI/MOLT-BLOCKS/` is the canonical machine-readable source block lane
- `HUMAN/MOLT-BLOCKS/` is a readable browsing shelf
- `blocks/molt/subjects/` is a machine-facing secondary/export lane pending clarification

### `AI/README.md`
Observed claims:
- `AI/MOLT-BLOCKS/` is the current canonical machine-readable block library lane
- `AI/BLOCKS/` is not canonical in current repo state
- `AI/GATES/` and `AI/COMPILER/` are valid special-purpose AI lanes
- `AI/RUNTIME-REFERENCE/` is a public runtime/reference lane, distinct from fixture lanes

### `HUMAN/README.md`
Observed claims:
- `HUMAN/MOLT-BLOCKS/` is canonical for human-readable block browsing
- HUMAN is explanation-oriented, not machine-canonical

### `AI/MANIFESTS/README.md`
Observed claims:
- `AI/MANIFESTS/` is active/canonical
- authority class: canonical source
- intended for direct/source-oriented machine discovery
- explicitly distinct from `sleeves/manifests/`
- contains direct/source-oriented machine catalog(s)

### `sleeves/manifests/README.md`
Observed claims:
- this is the public/package-facing sleeve catalog lane
- machine-facing, but **curated public catalog**, not the same as direct/source-oriented manifests
- intentionally differs from `AI/MANIFESTS/sleeve-catalog.json` when needed

### `AI/SLEEVES/README.md`
Observed claims:
- `AI/SLEEVES/` is active/canonical
- canonical machine source for direct sleeve data
- promotion/catalog rules still apply
- not identical to public package-facing sleeve lane

### `HUMAN/SLEEVES/README.md`
Observed claims:
- HUMAN sleeves are public-readable
- authority class: compatibility/reference
- not automatically machine-facing runtime sleeves
- richer/broader than public machine lane in some cases

### `HUMAN/MOLT-BLOCKS/README.md`
Observed claims:
- `AI/MOLT-BLOCKS/` contains canonical machine-readable JSON libraries
- `blocks/molt/subjects/` appears to be secondary/export and should not replace AI source libraries

---

## 6. Lane Classification Map

### 6.1 Canonical machine-readable source lanes
These lanes have the strongest evidence for future Alpha.6 resolver consideration.

| Lane | Classification | Evidence |
|---|---|---|
| `AI/MOLT-BLOCKS/` | CANONICAL_MACHINE_SOURCE | explicitly called canonical in `AI/README.md` and `AI/MOLT-BLOCKS/README.md` |
| `AI/MANIFESTS/` | CANONICAL_MACHINE_SOURCE | explicitly called active/canonical machine manifest shelf |
| `AI/SLEEVES/` | CANONICAL_MACHINE_SOURCE | explicitly called active/canonical machine sleeve shelf |
| `AI/GATES/` | VALID_SPECIAL_MACHINE_LANE | named valid special-purpose AI lane in `AI/README.md` |
| `AI/COMPILER/` | VALID_SPECIAL_MACHINE_LANE | named valid special-purpose AI lane in `AI/README.md` |

### 6.2 Human-readable mirror / bridge lanes
These should generally not be treated as primary machine resolver input lanes.

| Lane | Classification | Evidence |
|---|---|---|
| `HUMAN/MOLT-BLOCKS/` | HUMAN_READABLE_MIRROR | readable explanation shelf; not machine JSON source |
| `HUMAN/NEOBLOCKS/` | HUMAN_READABLE_BRIDGE | structured-reference bridge |
| `HUMAN/NEOSTACKS/` | HUMAN_READABLE_BRIDGE | structured-reference bridge |
| `HUMAN/SLEEVES/` | HUMAN_READABLE_REFERENCE | compatibility/reference, not guaranteed machine-runtime sleeves |
| `HUMAN/GATES/` | HUMAN_SPECIAL_PURPOSE | valid human-facing lane |
| `HUMAN/GLOSSARY/`, `HUMAN/GUIDES/`, `HUMAN/INDEXES/` | HUMAN_SUPPORTING_DOCS | explanation and navigation support |

### 6.3 Curated public/package-facing machine lanes
These are machine-facing, but they are **promotion-filtered** rather than direct source-of-record.

| Lane | Classification | Evidence |
|---|---|---|
| `sleeves/manifests/` | PACKAGE_FACING_CURATED_MACHINE_CATALOG | explicitly described as curated public/package-facing machine catalog |
| top-level `sleeves/` | PACKAGE_FACING_MACHINE_ARTIFACT_LANE | root README and sleeves/manifests README both frame this as package/public machine lane |

### 6.4 Secondary/export lanes
These are machine-facing but should not be assumed canonical without explicit resolver rules.

| Lane | Classification | Evidence |
|---|---|---|
| `blocks/molt/` | SECONDARY_EXPORT_LANE | root README + HUMAN/AI MOLT docs describe `blocks/molt/subjects/` as machine-facing secondary/export lane pending clarification |
| `AI/RUNTIME-REFERENCE/` | PUBLIC_RUNTIME_REFERENCE_LANE | valid public runtime/reference lane, but distinct from canonical source/fixture doctrine |
| `AI/EXAMPLES/` | EXAMPLE_LANE | examples, not primary authoritative source |
| `AI/FIXTURES/` | FIXTURE_LANE | supportive/testing/reference role, not canonical authoring lane |
| `AI/OVERLAYS/` | OVERLAY_LANE | special-purpose, not directly identified as canonical source in current docs |
| `AI/CAPABILITIES/` | SUPPORTING_MACHINE_LANE | machine-oriented, but canonicality not explicitly asserted in the inspected docs |

---

## 7. Lane Counts Snapshot

Observed file counts:

| Lane | Exists | Total Files | JSON Files | Markdown Files |
|---|---:|---:|---:|---:|
| `AI/MOLT-BLOCKS` | yes | 28 | 24 | 1 |
| `AI/NEOBLOCKS` | yes | 34 | 26 | 0 |
| `AI/NEOSTACKS` | yes | 15 | 7 | 0 |
| `AI/SLEEVES` | yes | 17 | 6 | 2 |
| `AI/MANIFESTS` | yes | 9 | 7 | 1 |
| `HUMAN/MOLT-BLOCKS` | yes | 1709 | 0 | 1700 |
| `HUMAN/NEOBLOCKS` | yes | 11 | 0 | 10 |
| `HUMAN/NEOSTACKS` | yes | 12 | 0 | 11 |
| `HUMAN/SLEEVES` | yes | 54 | 0 | 46 |
| `sleeves/manifests` | yes | 2 | 1 | 1 |
| `blocks/molt` | yes | 4 | 3 | 1 |

Interpretation:
- `AI/MOLT-BLOCKS`, `AI/MANIFESTS`, and `AI/SLEEVES` are compact but clearly machine-oriented.
- `HUMAN/MOLT-BLOCKS` is large and strongly human-readable.
- `blocks/molt` is very small relative to `AI/MOLT-BLOCKS`, supporting the idea that it is a secondary/export lane rather than the primary authoring source.
- `sleeves/manifests` is intentionally curated and narrow.

---

## 8. Canonical Machine Source Recommendation for Alpha.6

### Recommended direct/source-oriented machine lanes
If Alpha.6 later gains a real-library resolver, the best starting lanes appear to be:

1. `AI/MANIFESTS/`
2. `AI/SLEEVES/`
3. `AI/MOLT-BLOCKS/`
4. `AI/NEOBLOCKS/`
5. `AI/NEOSTACKS/`
6. `AI/GATES/` where needed

### Why these lanes
- They are machine-readable.
- They are described as canonical or direct/source-oriented in the inspected docs.
- They align with the documented MOLT → NeoBlock → NeoStack → Sleeve model.
- They avoid promotion-only filtering and human-readable compatibility layers.

### Important caution
`AI/NEOBLOCKS/` and `AI/NEOSTACKS/` did not have README files in the inspected pass, so their classification is inferred from:
- directory placement under `AI/`
- existence of machine-readable files
- repeated references from adjacent docs (`AI/MANIFESTS`, `AI/SLEEVES`, `HUMAN/NEOBLOCKS`, `HUMAN/NEOSTACKS`)

This is a strong but still slightly less explicit classification than `AI/MOLT-BLOCKS` or `AI/MANIFESTS`.

---

## 9. Public/Package-Facing Recommendation for Alpha.6

If Alpha.6 eventually needs a **public promoted** rather than **direct source** view, the best machine-facing curated lane appears to be:

1. `sleeves/manifests/catalog.json`
2. top-level `sleeves/` machine artifact lane

Interpretation:
- this is likely the right lane for package-facing exposure or public success-path enumeration
- this is likely **not** the full source-of-record lane for all direct source data

---

## 10. Likely Ignore / Do-Not-Load-By-Default Lanes

These should probably **not** be primary resolver inputs by default unless a future design explicitly opts in.

| Lane | Reason to ignore by default |
|---|---|
| `HUMAN/` subtree | human-readable explanation/reference layer, not canonical machine source |
| `blocks/molt/` | explicitly described as secondary/export pending clarification |
| `AI/EXAMPLES/` | examples are not source-of-record |
| `AI/FIXTURES/` | fixtures are supportive/test/reference lanes |
| `AI/RUNTIME-REFERENCE/` | runtime/reference lane, not same as canonical authoring lane |
| `AI/OVERLAYS/` | special-purpose lane; canonicality not established in this phase |
| `META/` | governance/status docs, not main content objects |

---

## 11. Resolver Design Implication (Read-Only Planning Only)

Without implementing the resolver, the Phase 2 structure strongly suggests Alpha.6 should eventually support at least two conceptual read modes:

### Mode A — direct/source-oriented library mode
Candidate source lanes:
- `AI/MANIFESTS/`
- `AI/SLEEVES/`
- `AI/MOLT-BLOCKS/`
- `AI/NEOBLOCKS/`
- `AI/NEOSTACKS/`

Use case:
- maintainer/developer/direct machine discovery
- deeper/full-source structure mapping

### Mode B — curated public/package-facing mode
Candidate source lanes:
- `sleeves/manifests/`
- top-level `sleeves/`
- possibly selected promoted machine references only

Use case:
- public/plugin exposure
- success-path package-facing behavior

This is **not** a recommendation to split the product identity.
It is a lane distinction inside one project, consistent with the Phase 1 strategic rule:
- one project
- multiple component states
- release manifest controls what loads and ships

---

## 12. Structural Findings That Matter Most

1. The repo itself explicitly documents lane differences; these are not accidental duplicates.
2. `AI/MANIFESTS/` and `sleeves/manifests/` are intentionally separate catalogs.
3. `AI/MOLT-BLOCKS/` is the clearest canonical machine-readable block lane.
4. `blocks/molt/subjects/` should **not** currently replace `AI/MOLT-BLOCKS/`.
5. `HUMAN/` shelves are real and useful, but they are explanation/compatibility lanes, not primary machine source.
6. The root structure supports future resolver work, but only if Alpha.6 obeys these lane boundaries.

---

## 13. Recommended Phase 3 Focus

**Phase 3 should map exact subpaths and object relationships for the eventual resolver, without enabling runtime loading yet.**

Suggested Phase 3 questions:
1. Which exact files in `AI/MANIFESTS/` should be authoritative entrypoints?
2. How should `AI/SLEEVES/` entries reconcile with `sleeves/manifests/catalog.json`?
3. Which `AI/NEOBLOCKS/` and `AI/NEOSTACKS/` objects are populated enough for deterministic reads?
4. What is the exact policy for ignoring `blocks/molt/` unless explicitly selected as export/reference?
5. What release-manifest mechanism should gate direct/source mode vs curated public mode?

---

## 14. Recommended Next Step

**Proceed to Phase 3 using active root `C:\.openclaw\workspace\UMG-Block-Library`, with focus on authoritative entrypoint files and exact lane-to-lane relationships.**

---

## 15. Concise Operational Summary

If a future agent needs the short version:
- `AI/MANIFESTS/` = canonical machine manifest discovery
- `AI/SLEEVES/` = canonical machine sleeve source
- `AI/MOLT-BLOCKS/` = canonical machine block source
- `AI/NEOBLOCKS/`, `AI/NEOSTACKS/` = likely canonical machine middle layers
- `sleeves/manifests/` = curated public/package-facing machine catalog
- `HUMAN/` = human-readable explanation/reference shelves
- `blocks/molt/` = secondary/export lane, not primary machine source

---

## 16. Final Phase 2 State

- **phase2_status:** `complete`
- **active_root:** `C:\.openclaw\workspace\UMG-Block-Library`
- **resolver_implemented:** `false`
- **runtime_changed:** `false`
- **publish_attempted:** `false`
- **recommended_next_phase:** `Phase 3 — authoritative entrypoint and lane relationship map`
