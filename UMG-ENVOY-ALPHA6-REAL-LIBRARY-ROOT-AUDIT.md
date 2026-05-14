# UMG-ENVOY-ALPHA6-REAL-LIBRARY-ROOT-AUDIT.md

## 1. Verdict

**ALPHA6_REAL_LIBRARY_ROOT_FOUND**

---

## 2. Chosen Active Root

- **active_root:** `C:\.openclaw\workspace\UMG-Block-Library`
- **exists:** `true`
- **reason_selected:** Exact candidate root name match; appears to be a real source repo; has canonical-looking AI/HUMAN split; contains machine-readable manifests, sleeves, MOLT/NeoBlock/NeoStack-oriented content; is not inside a package output, backup, staging, release-clean, publish-stage, inspect, or Resleever path; has human-readable README/START-HERE guidance explicitly describing the repository as a public UMG block-library surface.
- **confidence:** `high`
- **git_remote:** `https://github.com/NeoMagnetar/UMG-Block-Library.git`
- **git_branch:** `master`
- **dirty_status_summary:** `clean from observed git status output (no status entries returned)`

---

## 3. Candidate Roots Found

| Candidate | Exists | Score | Status | Reason |
|---|---:|---:|---|---|
| `C:\.openclaw\workspace\UMG-Block-Library` | yes | 26 | SELECTED | Exact root-name match; real Git repo; correct remote; AI/HUMAN split; manifests present; many probable library artifacts; not in forbidden path class |
| `C:\.openclaw\workspace\umg-envoy-agent-release-clean` | yes | -8 | REJECTED_ARTIFACT | Path explicitly indicates release-clean artifact lane, not source root |
| `C:\.openclaw\workspace\umg-envoy-agent-publish-stage` | yes | -8 | REJECTED_STAGING | Path explicitly indicates publish-stage lane |
| `C:\.openclaw\workspace\work\public-next\package` | yes | -9 | REJECTED_INSTALLED_PLUGIN | Package worktree / packaged plugin lane; not the real block library root |
| `C:\.openclaw\workspace\artifacts\releases\umg-envoy-agent-0.1.0\umg-envoy-agent-plugin\vendor\UMG_Envoy_Resleever` | yes | -16 | REJECTED_RESLEEVER | Explicit Resleever path inside old release artifacts |
| `C:\.openclaw\workspace\plugin-backups` | yes | -8 | REJECTED_BACKUP | Explicit backup lane |
| `C:\.openclaw\workspace\backups` | yes | -8 | REJECTED_BACKUP | Explicit backup lane |
| `C:\.openclaw\workspace\_inspect_umg_alpha2_tgz` | yes | -6 | REJECTED_ARTIFACT | Explicit inspect/extracted artifact lane |

### Scoring rationale used
Strong positive evidence observed for selected root:
- exact folder name `UMG-Block-Library` = `+5`
- Git remote points to real UMG Block Library repo = `+5`
- top-level AI / HUMAN split = `+4`
- has MOLT / NeoBlock / NeoStack / Sleeve evidence = `+5`
- has manifest/index/catalog evidence = `+4`
- contains many block/sleeve files = `+3`

No hard-reject path pattern matched the selected root.

---

## 4. Rejected Paths

| Path | Rejection Reason | Evidence |
|---|---|---|
| `C:\.openclaw\workspace\umg-envoy-agent-release-clean` | release artifact / non-source lane | name contains `release-clean` |
| `C:\.openclaw\workspace\umg-envoy-agent-publish-stage` | staging lane | name contains `publish-stage` |
| `C:\.openclaw\workspace\work\public-next\package` | package output / plugin packaging lane | package manifest and plugin metadata for published plugin live here |
| `C:\.openclaw\workspace\plugin-backups` | backup lane | name contains `plugin-backups` |
| `C:\.openclaw\workspace\backups` | backup lane | name contains `backups` |
| `C:\.openclaw\workspace\_inspect_umg_alpha2_tgz` | inspect/extracted artifact lane | name contains `inspect`; used for artifact inspection |
| `C:\.openclaw\workspace\artifacts\releases\umg-envoy-agent-0.1.0\umg-envoy-agent-plugin\vendor\UMG_Envoy_Resleever` | Resleever artifact lane | explicit `UMG_Envoy_Resleever` path inside old release artifacts |
| `C:\.openclaw\workspace\archive` | archive lane | explicit archive path class |
| `C:\.openclaw\workspace\release-staging` | staging lane | explicit staging path class |
| `C:\.openclaw\workspace\plugin-backups` | backup lane | explicit backup path class |

---

## 5. Resleever Scan

- **resleever_found:** `true`
- **inside_active_root:** `false`
- **workspace_locations:**
  - `C:\.openclaw\workspace\BOUNDARY-MAP-UMG-RESLEEVER-VS-BLOCKLIB.md`
  - `C:\.openclaw\workspace\FINAL-RESLEEVER-CANONICAL-STATUS.md`
  - `C:\.openclaw\workspace\RESLEEVER-PLUGIN-BASELINE-AUDIT.md`
  - `C:\.openclaw\workspace\RESLEEVER-SOURCE-OF-RECORD-DECLARATION.md`
  - `C:\.openclaw\workspace\RESLEEVER-STAGE-B4-B5-B6-REPORT.md`
  - `C:\.openclaw\workspace\RESLEEVER-TRUTH-AUDIT.md`
  - `C:\.openclaw\workspace\artifacts\releases\umg-envoy-agent-0.1.0\umg-envoy-agent-plugin\vendor\UMG_Envoy_Resleever\...`
- **classification:** `OUTSIDE_ACTIVE_ROOT_IGNORED`

Interpretation:
- Resleever is present elsewhere in the workspace and in old artifact lanes.
- No Resleever hit was observed inside `C:\.openclaw\workspace\UMG-Block-Library` during the focused candidate scan.
- Therefore Resleever is a workspace contamination risk in general, but **not** an active-root contamination blocker for Phase 1 as currently observed.

---

## 6. Top-Level Structure Snapshot

| Name | Type | Last Modified | Notes |
|---|---|---|---|
| `AI` | directory | `2026-04-27 23:28:43 local` | machine-readable shelf |
| `blocks` | directory | `2026-04-21 11:20:32 local` | secondary/export-style machine block lane present |
| `HUMAN` | directory | `2026-04-27 19:37:11 local` | human-readable shelf |
| `META` | directory | `2026-05-05 04:14:02 local` | meta status/scope lane |
| `sleeves` | directory | `2026-05-01 01:00:46 local` | public/package-facing machine sleeve artifact lane |
| `CHANGELOG.md` | file | observed | repo changelog present |
| `LICENSE` | file | observed | repo license present |
| `README-LANGCHAIN-BRIDGE-INSERT.md` | file | observed | ancillary README; not enough alone to affect root selection |
| `README.md` | file | observed | explicitly describes repo as UMG Block Library |
| `SECURITY.md` | file | observed | repo security doc present |
| `START-HERE.md` | file | observed | explicit operator onboarding doc |

Additional structure evidence from README and START-HERE:
- repo describes itself as a curated public UMG block-library surface
- AI/HUMAN split explicitly documented
- `AI/MANIFESTS/` and `sleeves/manifests/` explicitly called out as orientation points
- stack model documented: `MOLT Block -> NeoBlock -> NeoStack -> Sleeve`

---

## 7. Manifest / Index Files Found

| File | Parse Status | Notes |
|---|---|---|
| `C:\.openclaw\workspace\UMG-Block-Library\AI\MANIFESTS\gate-library-index.json` | PARSED_JSON | keys: `gates`, `notes`, `scope`, `status` |
| `C:\.openclaw\workspace\UMG-Block-Library\AI\MANIFESTS\molt-block-library-index.json` | PARSED_JSON | keys: `category`, `declared_count`, `id`, `path`, `store`, `title`, `types` |
| `C:\.openclaw\workspace\UMG-Block-Library\AI\MANIFESTS\neoblock-library-index.json` | PARSED_JSON | keys: `category`, `declared_count`, `id`, `path`, `store`, `title` |
| `C:\.openclaw\workspace\UMG-Block-Library\AI\MANIFESTS\neostack-library-index.json` | PARSED_JSON | keys: `category`, `declared_count`, `id`, `path`, `store`, `title` |
| `C:\.openclaw\workspace\UMG-Block-Library\AI\MANIFESTS\sleeve-catalog.json` | PARSED_JSON | keys: `catalog_scope`, `catalog_status`, `generated_at`, `notes`, `sleeves` |
| `C:\.openclaw\workspace\UMG-Block-Library\README.md` | MARKDOWN_ONLY | root repo definition and lane explanation |
| `C:\.openclaw\workspace\UMG-Block-Library\START-HERE.md` | MARKDOWN_ONLY | orientation guide; points to AI manifests and sleeve catalogs |
| `C:\.openclaw\workspace\UMG-Block-Library\HUMAN\GATES\INDEX.md` | MARKDOWN_ONLY | human-readable index present |
| `C:\.openclaw\workspace\UMG-Block-Library\HUMAN\MOLT-BLOCKS\INDEX.md` | MARKDOWN_ONLY | human-readable index present |
| `C:\.openclaw\workspace\UMG-Block-Library\AI\SLEEVES\categories\meta-random\sample-basic-minimal\manifest.json` | NOT_INSPECTED_PHASE1 | discovered during manifest scan; not parsed in this phase |
| `C:\.openclaw\workspace\UMG-Block-Library\AI\SLEEVES\categories\meta-random\slv-operator\manifest.json` | NOT_INSPECTED_PHASE1 | discovered during manifest scan; not parsed in this phase |
| `C:\.openclaw\workspace\UMG-Block-Library\AI\SLEEVES\categories\meta-random\stage5-sleeve\manifest.json` | NOT_INSPECTED_PHASE1 | discovered during manifest scan; not parsed in this phase |

Manifest/index interpretation:
- multiple machine-readable manifests parsed successfully
- manifests are topically aligned with a real block library
- this is strong evidence that the chosen root is source-oriented rather than merely packaged output

---

## 8. Probable Artifact Counts

- **total_files:** `2397`
- **json_files:** `226`
- **markdown_files:** `2109`
- **yaml_files:** `0`
- **possible_molt_files:** `1756`
- **possible_neoblock_files:** `58`
- **possible_neostack_files:** `40`
- **possible_sleeve_files:** `96`
- **possible_manifest_files:** `19`

Interpretation:
- the candidate root looks like a substantial content repository, not a toy sample package
- counts strongly exceed what would be expected from the alpha.5 bundled public sample content alone

---

## 9. OpenClaw Config Findings

- **config_path:** `C:\Users\Magne\.openclaw\openclaw.json`
- **config_exists:** `true`
- **configured_umg_paths_found:** none for a dedicated block-library root in the inspected matching lines
- **notes:**
  - config shows plugin installation entries for `umg-envoy-agent`
  - observed installed plugin spec: `clawhub:umg-envoy-agent@0.3.0-alpha.5`
  - observed install path: `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`
  - no direct configured active UMG Block Library root was identified from the inspected matching config lines
  - therefore Phase 1 root selection relies primarily on filesystem and repository evidence rather than explicit OpenClaw config binding

---

## 10. Phase 2 Readiness

**READY_FOR_PHASE2_LIBRARY_STRUCTURE_MAP**

Rationale:
- a high-confidence real source root was found
- chosen root is not a backup/staging/artifact path
- chosen root is not Resleever
- manifest/index evidence exists and parses
- root is inspectable read-only
- candidate/rejected path reasoning is documented

---

## 11. Next Command Recommendation

**Proceed to Phase 2 using active root: `C:\.openclaw\workspace\UMG-Block-Library`**

Suggested Phase 2 focus:
- map canonical machine-readable library lanes
- distinguish canonical source lanes vs secondary/export/public-package lanes
- identify the exact subpaths Alpha.6 resolver should eventually read from this active root

---

## 12. Phase 1 Pass Criteria

Phase 1 pass conditions required:
- a real UMG Block Library root is found
- the active root is not a backup/staging/artifact folder
- the active root is not Resleever
- candidate roots are listed
- rejected roots are explained
- Resleever scan is reported
- top-level structure is shown
- manifest/index evidence is shown
- Phase 2 readiness is stated
- audit report file is created

**Pass result:** all conditions satisfied.

---

## 13. Phase 1 Hold Criteria

Hold verdicts were considered but not selected because current evidence is sufficiently strong.

Not selected:
- `HOLD_LIBRARY_PATH_UNCLEAR`
- `HOLD_RESLEEVER_CONTAMINATION_RISK`
- `HOLD_NO_REAL_LIBRARY_FOUND`
- `HOLD_CANDIDATE_IS_ARTIFACT_OR_BACKUP`

Why not selected:
- one root clearly wins on naming, Git identity, structure, manifests, and content density
- Resleever was not found inside the selected root
- the selected root is not inside a package, backup, publish-stage, release-clean, or inspect path

---

## 14. What the Agent Should Say Back

### Summary
Phase 1 found a high-confidence real UMG Block Library source root.

### Verdict
`ALPHA6_REAL_LIBRARY_ROOT_FOUND`

### Active root or hold reason
Active root: `C:\.openclaw\workspace\UMG-Block-Library`

### Whether Phase 2 can begin
Yes — `READY_FOR_PHASE2_LIBRARY_STRUCTURE_MAP`

### Key Evidence
- candidate root count: `1` strong direct candidate; several obvious rejected non-source lanes
- selected path: `C:\.openclaw\workspace\UMG-Block-Library`
- rejected path count: multiple explicit rejects documented
- Resleever status: found in workspace artifacts/docs only, not inside active root
- manifest/index status: multiple JSON manifests parsed successfully

### Created File
`C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-REAL-LIBRARY-ROOT-AUDIT.md`

### Next Step
Proceed to Phase 2.

---

## 15. Copy-Paste Agent Instruction

Task: UMG Envoy Agent Alpha.6 Phase 1 — Real Block Library Source Root Audit

Continue from the verified UMG Envoy Agent 0.3.0-alpha.5 baseline. Do not patch alpha.5. Do not publish alpha.6. Do not execute tools. Do not activate Resleever. This is a read-only source-root audit.

Find the real active UMG-Block-Library source path for Alpha.6.

Check likely paths:
- `C:\.openclaw\workspace\UMG-Block-Library`
- `C:\.openclaw\workspace\umg-block-library`
- any configured UMG library path
- any repo/folder clearly named UMG-Block-Library

Reject as active source unless explicitly classified ACTIVE:
- backups
- plugin-backups
- old artifact folders
- staging packages
- publish-stage folders
- release-clean folders
- previous alpha inspect folders
- package extraction folders
- Resleever folders
- UMG_Envoy_Resleever

Perform:
- list candidate roots
- inspect git remote/branch/status for each candidate
- inspect top-level folder structure
- search for manifests/index/catalog files
- count likely MOLT, NeoBlock, NeoStack, Sleeve, manifest, markdown, JSON, and YAML files
- scan for Resleever inside candidates and workspace
- reject unsafe candidates with reasons
- select one active root only if evidence is clear
- if unclear, stop with hold verdict
- create the audit report

Create:
- `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-REAL-LIBRARY-ROOT-AUDIT.md`

Report these verdicts only:
- `ALPHA6_REAL_LIBRARY_ROOT_FOUND`
- `HOLD_LIBRARY_PATH_UNCLEAR`
- `HOLD_RESLEEVER_CONTAMINATION_RISK`
- `HOLD_NO_REAL_LIBRARY_FOUND`
- `HOLD_CANDIDATE_IS_ARTIFACT_OR_BACKUP`

Do not proceed to Phase 2 unless Phase 1 ends with:
- `ALPHA6_REAL_LIBRARY_ROOT_FOUND`

---

## 16. Simple Meaning

This phase answered the “find the real warehouse” question.

Current answer:
- the real library root is `C:\.openclaw\workspace\UMG-Block-Library`
- it looks like the real source repo
- it contains strong machine/human library structure
- it is not a backup/staging/artifact lane
- Resleever exists elsewhere in the workspace, but not inside the selected root in this audit
- Phase 2 can safely begin from this root
