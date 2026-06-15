# Package Hygiene and Staging Set Triage — 0.3.0-alpha.15

## 1. Purpose

This lane performed a narrow, non-mutating triage of current package-hygiene warnings and the intended future staging set for `umg-envoy-agent` `0.3.0-alpha.15`.

This lane did not stage, commit, delete, patch, publish, or run live runtime validation.

## 2. Repo State Summary

| Item | Value |
|---|---|
| Branch | `main` |
| HEAD | `b88341c77201014faf0d12671ffbb962d08a58d1` |
| Source changed | no |
| Manifest changed | no |
| Package metadata changed | no |
| Version changed | no |
| Workflow changed | yes — `.github/workflows/ci.yml` untracked |
| Publication changed | no |
| Live runtime validation | not run |

## 3. Current Modified / Untracked Inventory

| File / Path | Status | Classification | Recommended disposition | Notes |
|---|---|---|---|---|
| `README.md` | modified | intentional alpha.15 professionalization artifact | stage later | tracked docs positioning / boundary update |
| `PUBLIC-VARIANT-OVERVIEW.md` | modified | intentional alpha.15 professionalization artifact | stage later | tracked public-surface clarification |
| `.github/workflows/ci.yml` | untracked | intentional alpha.15 professionalization artifact | stage later | bounded CI/workflow addition |
| `docs/RELEASE-TRUTH-0.3.0-alpha.15.md` | untracked | intentional alpha.15 professionalization artifact | stage later | release-truth evidence doc |
| `docs/CAPABILITY-SURFACE-RECONCILIATION-PLAN-0.3.0-alpha.15.md` | untracked | intentional alpha.15 professionalization artifact | stage later | reconciliation plan |
| `docs/LOAD-SLEEVE-SURFACE-DECISION-0.3.0-alpha.15.md` | untracked | intentional alpha.15 professionalization artifact | stage later | surface decision record |
| `docs/OPENCLAW-HOST-TOOL-VISIBILITY-SEMANTICS-LOAD-SLEEVE-0.3.0-alpha.15.md` | untracked | intentional alpha.15 professionalization artifact | stage later | host semantics evidence doc |
| `docs/GOVERNANCE-EXECUTION-CONTRACT-0.3.0-alpha.15.md` | untracked | intentional alpha.15 professionalization artifact | stage later | execution boundary contract |
| `docs/CI-GATE-AUTOMATION-PLAN-0.3.0-alpha.15.md` | untracked | intentional alpha.15 professionalization artifact | stage later | CI gate plan |
| `docs/FRONTIER-AGENT-GOVERNANCE-PACK-0.3.0-alpha.15.md` | untracked | intentional alpha.15 professionalization artifact | stage later | packaging / positioning doc |
| `docs/REPO-STATE-AND-PACKAGE-HYGIENE-REVIEW-0.3.0-alpha.15.md` | untracked | intentional alpha.15 professionalization artifact | operator review | prior review lane output; stage only if operator wants evidence trail preserved |
| `docs/PACKAGE-HYGIENE-AND-STAGING-SET-TRIAGE-0.3.0-alpha.15.md` | untracked | intentional alpha.15 professionalization artifact | operator review | current triage report |
| `.publish-diagnostics-alpha14-2026-05-30/` | untracked | local diagnostics artifact | do not stage | publication-adjacent scratch corpus |
| `.publish-diagnostics-alpha15-2026-05-30/` | untracked | local diagnostics artifact | do not stage | publication-adjacent scratch corpus |
| `docs/repo_state_status_short_alpha15.txt` | untracked | diagnostic artifact | do not stage diagnostic artifact | prior evidence capture |
| `docs/repo_state_diff_name_only_alpha15.txt` | untracked | diagnostic artifact | do not stage diagnostic artifact | prior evidence capture |
| `docs/repo_state_untracked_alpha15.txt` | untracked | diagnostic artifact | do not stage diagnostic artifact | prior evidence capture |
| `docs/npm_pack_dry_run_alpha15.log` | untracked | diagnostic artifact | keep as evidence | useful baseline pack evidence referenced by prior review and signal corpus |
| `docs/package_hygiene_signal_hits_alpha15.txt` | untracked | diagnostic artifact | keep as evidence | useful grep-style evidence corpus |
| `docs/package_hygiene_triage_status_short_alpha15.txt` | untracked | diagnostic artifact | do not stage diagnostic artifact | current lane scratch evidence |
| `docs/package_hygiene_triage_diff_name_only_alpha15.txt` | untracked | diagnostic artifact | do not stage diagnostic artifact | current lane scratch evidence |
| `docs/package_hygiene_triage_untracked_alpha15.txt` | untracked | diagnostic artifact | do not stage diagnostic artifact | current lane scratch evidence |
| `docs/package_hygiene_triage_npm_pack_dry_run_alpha15.log` | untracked | diagnostic artifact | do not stage diagnostic artifact | current lane scratch log; file ended up empty after shell redirection issue |
| `docs/package_hygiene_triage_package_files_and_scripts_alpha15.json` | untracked | diagnostic artifact | do not stage diagnostic artifact | current lane scratch extract |
| `docs/package_hygiene_triage_check_ignore_publish_diagnostics_alpha15.txt` | untracked | diagnostic artifact | do not stage diagnostic artifact | current lane scratch extract |
| `docs/package_hygiene_triage_check_ignore_archives_alpha15.txt` | untracked | diagnostic artifact | do not stage diagnostic artifact | current lane scratch extract |
| `docs/repo_state_expected_docs_diff_alpha15.patch` | untracked | diagnostic artifact | do not stage diagnostic artifact | scratch diff artifact |

## 4. Package Surface Hygiene Findings

| Finding | Classification | Evidence | Ships in npm pack? | Risk | Recommended later lane |
|---|---|---|---:|---|---|
| compiled test artifacts in npm pack output | REAL_PACKAGE_SURFACE_RISK | `docs/npm_pack_dry_run_alpha15.log` lists multiple `dist/**/*.test.js` and `dist/**/*.test.d.ts` entries; package `files` includes full `dist/` | yes | packaged test artifacts enlarge and blur the public package surface | exclude compiled test artifacts from published package or split build/test outputs |
| stale release draft/root artifact references | DOC_ONLY_CONTEXT_REFERENCE | `docs/RELEASE-CHECKLIST-0.2.6.md` and `docs/RELEASE-CHECKLIST-0.2.7.md` reference `GITHUB-RELEASE-DRAFT-v0.2.0.md`; no root draft file was shown as changed or shipping | yes, as docs text only | low package risk, mild browse confusion risk | later docs cleanup lane to retire stale historical checklist references |
| stale local-path staging script reference | NOT_PRESENT | no hit for `prepare-clawhub-stage` in current inspected docs corpus; no changed script observed | no | none in this lane | none |
| archive/tarball-style references | DOC_ONLY_CONTEXT_REFERENCE | pack logs include `.tgz` filename; `.gitignore` explicitly ignores `*.tgz`, `*.zip`, `ARTIFACT-ARCHIVE/`, `.compare-approved-tarball/`, `META/` | pack log only, not as package baggage evidence | low package risk; mostly contextual | no urgent lane beyond normal docs/log cleanup |
| local/private-path-style references | REPO_BROWSE_HYGIENE_RISK | docs contain local Windows paths such as `C:\.openclaw\workspace\...` and private-environment references like `NeoUO` | yes, because `docs/` ships | public-browse/docs professionalism issue; not a credential leak by itself | docs scrub/rephrase lane for public-packaged docs |
| secret/token/api-key/password signals | LOG_CORPUS_NOISE | signal search terms matched generic words in docs/log corpus but no concrete secret/token/password values were evidenced | no confirmed secret payload | low if left as-is; keep watch | no secret response lane needed; retain review awareness |
| `.publish-diagnostics-alpha14-2026-05-30/` | GITIGNORED_LOCAL_ARTIFACT | present untracked; not included in package `files`; intended as local diagnostics corpus | no | local clutter only | leave untracked or archive outside repo in later hygiene lane |
| `.publish-diagnostics-alpha15-2026-05-30/` | GITIGNORED_LOCAL_ARTIFACT | present untracked; not included in package `files`; intended as local diagnostics corpus | no | local clutter only | leave untracked or archive outside repo in later hygiene lane |
| shipped diagnostic evidence logs under `docs/` | REAL_PACKAGE_SURFACE_RISK | `docs/npm_pack_dry_run_alpha15.log`, `docs/repo_state_*.txt`, `docs/package_hygiene_signal_hits_alpha15.txt`, and current triage scratch files appear in pack output because `docs/` is shipped wholesale | yes | internal scratch evidence currently expands public package contents | later lane should decide whether to narrow `docs/` shipping set or relocate diagnostics outside shipped docs |

## 5. Repo Browse Hygiene Findings

| Finding | Classification | Evidence | Risk | Recommended later lane |
|---|---|---|---|---|
| shipped docs include historical release-checklist references | DOC_ONLY_CONTEXT_REFERENCE | `docs/RELEASE-CHECKLIST-0.2.6.md`, `docs/RELEASE-CHECKLIST-0.2.7.md` mention old release-draft filename | mild confusion for repo/package readers | historical docs pruning lane |
| shipped docs include local machine paths | REPO_BROWSE_HYGIENE_RISK | `docs/OPENCLAW-HOST-TOOL-VISIBILITY-SEMANTICS-LOAD-SLEEVE-0.3.0-alpha.15.md` and `docs/RELEASE-TRUTH-0.3.0-alpha.15.md` contain local path strings | professionalism / public-browse hygiene issue | public docs scrubbing lane |
| package ships diagnostics and review scratch logs via `docs/` | REPO_BROWSE_HYGIENE_RISK | pack output includes `docs/npm_pack_dry_run_alpha15.log`, `docs/repo_state_*.txt`, `docs/package_hygiene_signal_hits_alpha15.txt`, and current triage scratch outputs | repository and package look noisier than intended | package-docs curation lane |
| untracked publication diagnostics folders in repo root | GITIGNORED_LOCAL_ARTIFACT | `.publish-diagnostics-*` are present as untracked local artifacts | low public risk if never staged; moderate local clutter | later local cleanup lane |

## 6. Secret / Private Boundary Signals

| Signal | Found? | Evidence | Classification | Action |
|---|---:|---|---|---|
| concrete secrets / tokens / api keys / passwords | no | no literal credential values surfaced in reviewed pack log, package metadata, README, overview, or signal corpus | NOT_PRESENT | no secret-remediation lane required |
| local Windows paths | yes | path strings under shipped docs, including `C:\.openclaw\workspace\...` | REPO_BROWSE_HYGIENE_RISK | scrub or generalize in later docs lane |
| private-environment names like `NeoUO` | yes | signal corpus shows `NeoUO` mentions in shipped docs | DOC_ONLY_CONTEXT_REFERENCE | review whether those references belong in public package docs |
| `.publish-diagnostics-*` local publication folders | yes | untracked root directories observed | GITIGNORED_LOCAL_ARTIFACT | keep out of staging |

## 7. Proposed Future Staging Set

Recommended later staging set, if operator approves:

- `README.md`
- `PUBLIC-VARIANT-OVERVIEW.md`
- `.github/workflows/ci.yml`
- `docs/RELEASE-TRUTH-0.3.0-alpha.15.md`
- `docs/CAPABILITY-SURFACE-RECONCILIATION-PLAN-0.3.0-alpha.15.md`
- `docs/LOAD-SLEEVE-SURFACE-DECISION-0.3.0-alpha.15.md`
- `docs/OPENCLAW-HOST-TOOL-VISIBILITY-SEMANTICS-LOAD-SLEEVE-0.3.0-alpha.15.md`
- `docs/GOVERNANCE-EXECUTION-CONTRACT-0.3.0-alpha.15.md`
- `docs/CI-GATE-AUTOMATION-PLAN-0.3.0-alpha.15.md`
- `docs/FRONTIER-AGENT-GOVERNANCE-PACK-0.3.0-alpha.15.md`

Operator-review optional additions:

- `docs/REPO-STATE-AND-PACKAGE-HYGIENE-REVIEW-0.3.0-alpha.15.md`
- `docs/PACKAGE-HYGIENE-AND-STAGING-SET-TRIAGE-0.3.0-alpha.15.md`

## 8. Files Not Recommended For Staging

Not recommended for staging:

- `.publish-diagnostics-alpha14-2026-05-30/`
- `.publish-diagnostics-alpha15-2026-05-30/`
- `docs/repo_state_status_short_alpha15.txt`
- `docs/repo_state_diff_name_only_alpha15.txt`
- `docs/repo_state_untracked_alpha15.txt`
- `docs/package_hygiene_triage_status_short_alpha15.txt`
- `docs/package_hygiene_triage_diff_name_only_alpha15.txt`
- `docs/package_hygiene_triage_untracked_alpha15.txt`
- `docs/package_hygiene_triage_npm_pack_dry_run_alpha15.log`
- `docs/package_hygiene_triage_package_files_and_scripts_alpha15.json`
- `docs/package_hygiene_triage_check_ignore_publish_diagnostics_alpha15.txt`
- `docs/package_hygiene_triage_check_ignore_archives_alpha15.txt`
- `docs/repo_state_expected_docs_diff_alpha15.patch`

Evidence worth keeping locally but not staging by default:

- `docs/npm_pack_dry_run_alpha15.log`
- `docs/package_hygiene_signal_hits_alpha15.txt`

## 9. Cleanup Lanes Recommended

1. exclude compiled test artifacts from npm package, because they are confirmed to ship in `npm pack --dry-run`
2. decide whether shipped `docs/` should be narrowed so diagnostic logs and scratch evidence stop shipping in the package
3. scrub or generalize local-path references from shipped public docs
4. retire or quarantine stale historical release-checklist references if public-browse cleanliness matters for this package line

## 10. Final Recommendation

Run one narrow cleanup lane to stop compiled `dist/**/*.test.js` and `dist/**/*.test.d.ts` artifacts from shipping in the package before any operator-approved staging or publication-prep lane.
