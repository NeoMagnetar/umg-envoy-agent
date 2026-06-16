# UMG Envoy Alpha20A Dirty Worktree Triage

## 1. Verdict

UMG_ENVOY_ALPHA20A_DIRTY_WORKTREE_TRIAGE_COMPLETE

This lane performed dirty-worktree triage only. No files were fixed, deleted, reverted, staged, committed, moved, or cleaned.

## 2. Repo State

| Item | Value |
|---|---|
| Repo path | `C:\.openclaw\workspace\umg-envoy-agent-release-clean` |
| Branch | `main` |
| HEAD | `c0ffb87b24d0567ca6e84a182240dfd4857f344f` |
| Previous verdict | `UMG_ENVOY_ALPHA20_RELEASE_HYGIENE_PUBLICATION_READINESS_BLOCKED` |

Runtime:

- model: `openai/gpt-5.5`
- reasoning: medium
- speed: standard / fast off

## 3. Exact Commands Run

| Command | Result |
|---|---|
| `git branch --show-current` | pass: `main` |
| `git rev-parse HEAD` | pass: `c0ffb87b24d0567ca6e84a182240dfd4857f344f` |
| `git status --short` | pass |
| `git ls-files --others --exclude-standard` with `Get-Item` size listing | pass |
| `git diff -- PUBLIC-VARIANT-OVERVIEW.md` | pass |
| `git diff -- docs/GOVERNANCE-EXECUTION-CONTRACT-0.3.0-alpha.15.md` | pass |
| `git diff -- docs/LOAD-SLEEVE-SURFACE-DECISION-0.3.0-alpha.15.md` | pass |
| `git diff -- docs/OPENCLAW-HOST-TOOL-VISIBILITY-SEMANTICS-LOAD-SLEEVE-0.3.0-alpha.15.md` | pass |
| `node -e "const p=require('./package.json'); console.log(JSON.stringify({files:p.files, scripts:p.scripts}, null, 2));"` | pass |
| `npm pack --dry-run --json` | pass |

## 4. Git Status Summary

Tracked dirty files:

- `PUBLIC-VARIANT-OVERVIEW.md`
- `docs/GOVERNANCE-EXECUTION-CONTRACT-0.3.0-alpha.15.md`
- `docs/LOAD-SLEEVE-SURFACE-DECISION-0.3.0-alpha.15.md`
- `docs/OPENCLAW-HOST-TOOL-VISIBILITY-SEMANTICS-LOAD-SLEEVE-0.3.0-alpha.15.md`

Untracked files are Alpha14/Alpha15 diagnostic artifacts plus the Alpha20 audit report.

No dirty source, test, manifest, generated `dist`, README, or `docs/TOOL-SURFACE.md` changes were present.

## 5. Tracked Dirty File Diffs

### `PUBLIC-VARIANT-OVERVIEW.md`

Observed diff:

- changes heading from `Source-present but not manifest-declared` to `Runtime reconciliation status`
- changes `umg_envoy_load_sleeve` wording from manifest-absent to manifest-declared read-only and excluded from low-risk direct runner

Assessment:

- Origin: Alpha15 load-sleeve runtime reconciliation
- Relation to Alpha16-19: not directly related
- Package included: yes
- Release risk: medium, because uncommitted tracked package content would be included in `npm pack`

### `docs/GOVERNANCE-EXECUTION-CONTRACT-0.3.0-alpha.15.md`

Observed diff:

- updates load-sleeve section to say manifest surface now contains 17 tools
- changes `umg_envoy_load_sleeve` from manifest-absent to manifest-declared read-only
- clarifies it is not arbitrary execution

Assessment:

- Origin: Alpha15 load-sleeve runtime reconciliation
- Relation to Alpha16-19: superseded by later 22-tool Alpha19 state
- Package included: yes
- Release risk: medium/high, because it is package-included and now stale relative to 22-tool source truth

### `docs/LOAD-SLEEVE-SURFACE-DECISION-0.3.0-alpha.15.md`

Observed diff:

- changes recommendation from `DEFER_PENDING_OPENCLAW_HOST_SEMANTICS` to `RECOMMEND_ADD_LOAD_SLEEVE_TO_MANIFEST_AS_PUBLIC_READONLY_TOOL`
- explains runtime truth superseded earlier static assumption

Assessment:

- Origin: Alpha15 load-sleeve runtime reconciliation
- Relation to Alpha16-19: not directly related
- Package included: yes
- Release risk: medium, because package content changes are uncommitted but likely historically useful

### `docs/OPENCLAW-HOST-TOOL-VISIBILITY-SEMANTICS-LOAD-SLEEVE-0.3.0-alpha.15.md`

Observed diff:

- changes recommendation from `SAFE_TO_KEEP_DOC_CLASSIFICATION` to `DECLARE_RUNTIME_VISIBLE_LOAD_SLEEVE_AS_MANIFEST_READONLY_TOOL`
- changes load-sleeve wording from source-present/non-manifest to manifest-declared public read-only

Assessment:

- Origin: Alpha15 load-sleeve runtime reconciliation
- Relation to Alpha16-19: not directly related
- Package included: yes
- Release risk: medium, because package content changes are uncommitted

## 6. Complete Dirty-File Inventory

| Path | Git status | Tracked? | Package included? | Origin / likely phase | Risk | Recommended action | Requires approval? |
|---|---|---:|---:|---|---|---|---:|
| `PUBLIC-VARIANT-OVERVIEW.md` | `M` | yes | yes | Alpha15 load-sleeve reconciliation wording | medium | review and either commit with Alpha15 reconciliation docs or revert if obsolete | yes |
| `docs/GOVERNANCE-EXECUTION-CONTRACT-0.3.0-alpha.15.md` | `M` | yes | yes | Alpha15 governance/load-sleeve reconciliation | medium/high | update to current 22-tool truth or commit/revert in a dedicated docs lane | yes |
| `docs/LOAD-SLEEVE-SURFACE-DECISION-0.3.0-alpha.15.md` | `M` | yes | yes | Alpha15 load-sleeve decision update | medium | commit or revert in dedicated Alpha15 docs reconciliation lane | yes |
| `docs/OPENCLAW-HOST-TOOL-VISIBILITY-SEMANTICS-LOAD-SLEEVE-0.3.0-alpha.15.md` | `M` | yes | yes | Alpha15 host-visibility reconciliation | medium | commit or revert in dedicated Alpha15 docs reconciliation lane | yes |
| `.publish-diagnostics-alpha14-2026-05-30/` files | `??` | no | no | Alpha14 publish diagnostics | low | archive outside package or ignore in dedicated cleanup lane | yes |
| `.publish-diagnostics-alpha15-2026-05-30/` files | `??` | no | no | Alpha15 publish diagnostics | low | archive outside package or ignore in dedicated cleanup lane | yes |
| `docs/DECLARE-LOAD-SLEEVE-RUNTIME-SURFACE-0.3.0-alpha.15.md` | `??` | no | no | Alpha15 load-sleeve declaration report | low/medium | decide whether to keep as tracked history or archive outside package | yes |
| `docs/INSTALLED-EXTENSION-ALPHA15-LIVE-RUNTIME-VALIDATION.md` | `??` | no | no | Alpha15 installed validation | low/medium | decide whether to track or archive | yes |
| `docs/INSTALLED-EXTENSION-ALPHA15-REPLACEMENT-LIVE-RUNTIME-VALIDATION.md` | `??` | no | no | Alpha15 replacement validation | low/medium | decide whether to track or archive | yes |
| `docs/LIVE-RUNTIME-VALIDATION-0.3.0-alpha.15.md` | `??` | no | no | Alpha15 live validation | low/medium | decide whether to track or archive | yes |
| `docs/LOAD-SLEEVE-RUNTIME-SURFACE-RECONCILIATION-0.3.0-alpha.15.md` | `??` | no | no | Alpha15 load-sleeve reconciliation | low/medium | decide whether to track or archive | yes |
| `docs/REINSTALL-DECLARED-LOAD-SLEEVE-LIVE-RUNTIME-VALIDATION-0.3.0-alpha.15.md` | `??` | no | no | Alpha15 reinstall/live validation | low/medium | decide whether to track or archive | yes |
| `docs/UMG-ENVOY-ALPHA20-RELEASE-HYGIENE-PUBLICATION-READINESS-AUDIT.md` | `??` | no | no | Alpha20 audit report | low | commit with Alpha20 audit lane if desired | yes |
| `docs/final_staging_diff_name_only_alpha15.txt` | `??` | no | no | Alpha15 staging diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/final_staging_manifest_tools_alpha15.txt` | `??` | no | no | Alpha15 staging diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/final_staging_status_short_alpha15.txt` | `??` | no | no | Alpha15 staging diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/functional_gate_manifest_tools_alpha15.txt` | `??` | no | no | Alpha15 functional gate diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/functional_gate_scripts_alpha15.json` | `??` | no | no | Alpha15 functional gate diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/functional_gate_umg_content_inventory_alpha15.txt` | `??` | no | no | Alpha15 content inventory diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/functional_gate_umg_tool_system_hits_alpha15.txt` | `??` | no | no | Alpha15 diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/npm_pack_dry_run_alpha15.log` | `??` | no | no | Alpha15 pack diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/package_hygiene_signal_hits_alpha15.txt` | `??` | no | no | Alpha15 package hygiene diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/package_hygiene_triage_check_ignore_archives_alpha15.txt` | `??` | no | no | Alpha15 hygiene diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/package_hygiene_triage_check_ignore_publish_diagnostics_alpha15.txt` | `??` | no | no | Alpha15 hygiene diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/package_hygiene_triage_diff_name_only_alpha15.txt` | `??` | no | no | Alpha15 hygiene diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/package_hygiene_triage_npm_pack_dry_run_alpha15.log` | `??` | no | no | Alpha15 hygiene diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/package_hygiene_triage_package_files_and_scripts_alpha15.json` | `??` | no | no | Alpha15 hygiene diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/package_hygiene_triage_status_short_alpha15.txt` | `??` | no | no | Alpha15 hygiene diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/package_hygiene_triage_untracked_alpha15.txt` | `??` | no | no | Alpha15 hygiene diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/package_surface_after_cleanup_npm_pack_alpha15.log` | `??` | no | no | Alpha15 package surface diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/package_surface_after_cleanup_risk_hits_alpha15.txt` | `??` | no | no | Alpha15 package surface diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/package_surface_before_cleanup_npm_pack_alpha15.log` | `??` | no | no | Alpha15 package surface diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/package_surface_before_cleanup_risk_hits_alpha15.txt` | `??` | no | no | Alpha15 package surface diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/package_surface_current_package_json_alpha15.json` | `??` | no | no | Alpha15 package surface diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/package_surface_existing_npmignore_alpha15.txt` | `??` | no | no | Alpha15 package surface diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/package_surface_validation_npm_pack_alpha15.log` | `??` | no | no | Alpha15 package surface diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/repo_state_diff_name_only_alpha15.txt` | `??` | no | no | Alpha15 repo-state diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/repo_state_expected_docs_diff_alpha15.patch` | `??` | no | no | Alpha15 expected docs patch | low/medium | review before deleting; may document intended changes | yes |
| `docs/repo_state_status_short_alpha15.txt` | `??` | no | no | Alpha15 repo-state diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/repo_state_untracked_alpha15.txt` | `??` | no | no | Alpha15 repo-state diagnostic | low | archive/ignore/remove with approval | yes |
| `docs/UMG-ENVOY-ALPHA20A-DIRTY-WORKTREE-TRIAGE.md` | `??` | no | no | Alpha20A triage report | low | commit later if operator approves | yes |

## 7. Package Inclusion Risk

`package.json` uses an explicit `files` allowlist.

Package-included dirty tracked files:

- `PUBLIC-VARIANT-OVERVIEW.md`
- `docs/GOVERNANCE-EXECUTION-CONTRACT-0.3.0-alpha.15.md`
- `docs/LOAD-SLEEVE-SURFACE-DECISION-0.3.0-alpha.15.md`
- `docs/OPENCLAW-HOST-TOOL-VISIBILITY-SEMANTICS-LOAD-SLEEVE-0.3.0-alpha.15.md`

Package-excluded untracked files:

- Alpha14/Alpha15 publish diagnostics folders
- Alpha15 `.txt`, `.json`, `.log`, and `.patch` diagnostics
- Alpha20/Alpha20A audit reports unless added to `package.json.files`

Important:

The tracked dirty files are release-blocking for publication hygiene because `npm pack` will include their current working-tree contents.

## 8. Category Summary

| Category | Present? | Notes |
|---|---:|---|
| Pre-existing Alpha15 docs/diagnostics | yes | majority of dirty/untracked inventory |
| Package-included dirty docs | yes | four tracked files |
| Generated dist changes | no | none dirty |
| README changes | no | clean |
| `docs/TOOL-SURFACE.md` changes | no | clean |
| Source/test/manifest changes | no | clean |
| Unknown/unrelated files | no new unknowns | all files have plausible Alpha14/15/20 audit origin |

## 9. Recommended Action Order

1. Decide whether to keep the four tracked Alpha15 reconciliation edits.
2. If keeping them, update stale wording such as 17-tool references to current 22-tool truth in a dedicated docs lane, then commit that lane.
3. If not keeping them, revert only with explicit operator approval.
4. Decide whether Alpha15 untracked reports should become tracked historical reports or be archived outside the package/repo surface.
5. Consider adding a repo-local diagnostics ignore/archive convention so future validation logs do not sit in `docs/`.
6. Commit the Alpha20 and Alpha20A reports only if the operator wants audit history tracked.

## 10. Boundary Confirmation

- files changed by this lane: yes, this report only
- anything committed: no
- anything deleted/reverted: no
- installed extension mutated: no
- ClawHub changed: no
- publication changed: no
- version changed: no
- generated sleeves executed: no
- writes enabled: no
