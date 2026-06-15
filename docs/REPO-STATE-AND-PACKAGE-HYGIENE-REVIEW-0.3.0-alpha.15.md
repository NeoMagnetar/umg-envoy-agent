# Repo State and Package Hygiene Review — 0.3.0-alpha.15

## 1. Purpose

This is a read-only review of current repo state and package-hygiene posture for `umg-envoy-agent` `0.3.0-alpha.15`.

It identifies changed/untracked files, maps them to completed lanes where possible, checks for unexpected source/package/manifest/version drift, and summarizes package-hygiene signals without staging, cleaning, or committing anything.

## 2. Repo Snapshot

| Item | Value |
|---|---|
| Repo path | `C:\.openclaw\workspace\umg-envoy-agent-release-clean` |
| Branch | `main` |
| HEAD | `b88341c77201014faf0d12671ffbb962d08a58d1` |
| Git status summary | `M PUBLIC-VARIANT-OVERVIEW.md; M README.md; ?? .github/; ?? .publish-diagnostics-alpha14-2026-05-30/; ?? .publish-diagnostics-alpha15-2026-05-30/; ?? docs/CAPABILITY-SURFACE-RECONCILIATION-PLAN-0.3.0-alpha.15.md; ?? docs/CI-GATE-AUTOMATION-PLAN-0.3.0-alpha.15.md; ?? docs/FRONTIER-AGENT-GOVERNANCE-PACK-0.3.0-alpha.15.md; ?? docs/GOVERNANCE-EXECUTION-CONTRACT-0.3.0-alpha.15.md; ?? docs/LOAD-SLEEVE-SURFACE-DECISION-0.3.0-alpha.15.md; ?? docs/OPENCLAW-HOST-TOOL-VISIBILITY-SEMANTICS-LOAD-SLEEVE-0.3.0-alpha.15.md; ?? docs/RELEASE-TRUTH-0.3.0-alpha.15.md` |

## 3. Changed / Untracked File Inventory

| File | Status | Classification | Lane / Reason | Notes |
|---|---|---|---|---|
| `PUBLIC-VARIANT-OVERVIEW.md` | `M` | `EXPECTED_DOC_CHANGE` | alpha.15 public-surface reconciliation lane | tracked doc modified as expected |
| `README.md` | `M` | `EXPECTED_DOC_CHANGE` | README positioning/discoverability plus prior alpha.15 reconciliation edits | tracked doc modified as expected |
| `.github/` | `??` | `EXPECTED_WORKFLOW_ADDITION` | minimal CI workflow lane | contains `.github/workflows/ci.yml` |
| `.publish-diagnostics-alpha14-2026-05-30/` | `??` | `PRE_EXISTING_ARTIFACT` | pre-existing publication diagnostics artifact | untracked diagnostics folder |
| `.publish-diagnostics-alpha15-2026-05-30/` | `??` | `PRE_EXISTING_ARTIFACT` | pre-existing publication diagnostics artifact | untracked diagnostics folder |
| `docs/CAPABILITY-SURFACE-RECONCILIATION-PLAN-0.3.0-alpha.15.md` | `??` | `EXPECTED_DOC_CHANGE` | capability-surface reconciliation plan lane | untracked doc artifact |
| `docs/CI-GATE-AUTOMATION-PLAN-0.3.0-alpha.15.md` | `??` | `EXPECTED_DOC_CHANGE` | CI gate automation plan lane | untracked doc artifact |
| `docs/FRONTIER-AGENT-GOVERNANCE-PACK-0.3.0-alpha.15.md` | `??` | `EXPECTED_DOC_CHANGE` | frontier-agent positioning lane | untracked doc artifact |
| `docs/GOVERNANCE-EXECUTION-CONTRACT-0.3.0-alpha.15.md` | `??` | `EXPECTED_DOC_CHANGE` | governance execution contract lane | untracked doc artifact |
| `docs/LOAD-SLEEVE-SURFACE-DECISION-0.3.0-alpha.15.md` | `??` | `EXPECTED_DOC_CHANGE` | load_sleeve decision-record lane | untracked doc artifact |
| `docs/OPENCLAW-HOST-TOOL-VISIBILITY-SEMANTICS-LOAD-SLEEVE-0.3.0-alpha.15.md` | `??` | `EXPECTED_DOC_CHANGE` | host-semantics evidence lane | untracked doc artifact |
| `docs/RELEASE-TRUTH-0.3.0-alpha.15.md` | `??` | `EXPECTED_DOC_CHANGE` | release-truth lane | untracked doc artifact |

## 4. Guardrail Check

| Area | Changed? | Evidence | Notes |
|---|---:|---|---|
| source | no | `docs/repo_state_diff_name_only_alpha15.txt` | No `src/**` changes detected. |
| dist | no | `docs/repo_state_diff_name_only_alpha15.txt` | No `dist/**` changes detected. |
| package metadata | no | `docs/repo_state_diff_name_only_alpha15.txt` | `package.json` and `package-lock.json` unchanged. |
| manifest | no | `docs/repo_state_diff_name_only_alpha15.txt` | `openclaw.plugin.json` unchanged. |
| version/release state | no | `docs/repo_state_diff_name_only_alpha15.txt` | No `CHANGELOG.md`, `GITHUB-RELEASE-DRAFT*`, or `scripts/prepare-clawhub-stage.ps1` changes detected. |
| workflow | yes | `docs/repo_state_status_short_alpha15.txt` | `.github/workflows/ci.yml` addition is expected from the CI lane. |

## 5. Package Hygiene Signals

| Signal | Found? | Evidence | Risk | Recommended later lane |
|---|---:|---|---|---|
| compiled test artifacts in pack output | yes | `docs/npm_pack_dry_run_alpha15.log`, `docs/package_hygiene_signal_hits_alpha15.txt` | package appears to include compiled `.test.js` / `.test.d.ts` artifacts; likely intentional today, but worth explicit review for public package hygiene | Lane I — package hygiene / staging review |
| stale release draft/root artifact | yes | `docs/package_hygiene_signal_hits_alpha15.txt` | signal file found release-oriented references and artifact-style terms in docs/log corpus; requires human review to distinguish harmless references from stale release debris | Lane I — package hygiene / staging review |
| stale local-path staging script | no | `docs/package_hygiene_signal_hits_alpha15.txt` | no direct hit for `prepare-clawhub-stage` in the inspected set | Lane I — package hygiene / staging review |
| private path or secret-like string | yes | `docs/package_hygiene_signal_hits_alpha15.txt` | docs/log corpus contains local-path or private-environment-style strings such as Windows paths / NeoUO references; no proof of live secret exposure, but still a hygiene warning | Lane I — package hygiene / staging review |
| archive/tarball material in package | yes | `docs/package_hygiene_signal_hits_alpha15.txt` | `.tgz` / archive-style references appear in inspected corpus; confirm they are only pack-log references and not shipped baggage | Lane I — package hygiene / staging review |

## 6. Intended Staging Set Recommendation

The following files appear intended to stage later, but were **not** staged in this lane:

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

## 7. Items Requiring Operator Review

- No unexpected source, manifest, package, or version/release-state changes were detected in the current inventory.
- The two untracked `.publish-diagnostics-*` folders appear pre-existing and should be consciously included or excluded in a later operator-approved hygiene lane.
- Package-hygiene signals indicate compiled test artifacts and private-path-style references should be reviewed before any public packaging or release claim.

## 8. Recommended Next Lane

Lane I — package hygiene / untracked-doc staging review.
