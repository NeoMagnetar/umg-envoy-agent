# UMG Envoy Alpha20B Governance Doc Correction Blocked

## 1. Verdict

UMG_ENVOY_ALPHA20B_ALPHA15_DOC_RECONCILIATION_CORRECTION_BLOCKED

The targeted correction in `docs/GOVERNANCE-EXECUTION-CONTRACT-0.3.0-alpha.15.md` was applied narrowly and resolves the unqualified `17 tools` wording. During the required four-document re-check, additional unchanged contradictory pre-reconciliation text was found in the Alpha15 load-sleeve decision documents. The doc-only commit was not prepared or executed.

## 2. Repo State

- Repo path: `C:\.openclaw\workspace\umg-envoy-agent-release-clean`
- Branch: `main`
- Baseline HEAD: `c0ffb87b24d0567ca6e84a182240dfd4857f344f`

## 3. Exact Wording Correction

In `docs/GOVERNANCE-EXECUTION-CONTRACT-0.3.0-alpha.15.md`, the unqualified tool-count bullet was changed from:

```text
- manifest-declared public surface now contains 17 tools
```

to:

```text
- at the Alpha15 load-sleeve checkpoint, the manifest-declared tool count was 17. Current post-Alpha19 manifest truth is 22 tools.
```

This correction is narrow, preserves the historical Alpha15 `17 tools` fact, and no longer implies that the current manifest has only 17 tools.

## 4. New Contradictions Found During Required Re-Check

### `docs/LOAD-SLEEVE-SURFACE-DECISION-0.3.0-alpha.15.md`

The reviewed diff changes the main recommendation to:

```text
RECOMMEND_ADD_LOAD_SLEEVE_TO_MANIFEST_AS_PUBLIC_READONLY_TOOL
```

But later unchanged text still says:

```text
`umg_envoy_load_sleeve` remains:
- source-present
- manifest-absent
- excluded from the low-risk direct runner
- not part of the alpha.15 manifest-declared public surface
```

and also ends with:

```text
Final recommendation:
`SAFE_TO_KEEP_DOC_CLASSIFICATION`
```

These lines conflict with the reconciled manifest-declared load-sleeve state.

### `docs/OPENCLAW-HOST-TOOL-VISIBILITY-SEMANTICS-LOAD-SLEEVE-0.3.0-alpha.15.md`

The reviewed diff changes the recommendation to:

```text
DECLARE_RUNTIME_VISIBLE_LOAD_SLEEVE_AS_MANIFEST_READONLY_TOOL
```

But earlier unchanged text still states that Alpha15 can safely describe `umg_envoy_load_sleeve` as absent from `openclaw.plugin.json` and not part of the current host-visible public surface.

This can remain useful as historical static-source evidence only if explicitly scoped as superseded by later runtime reconciliation.

## 5. Package-Inclusion Risk

The four Alpha15 docs are package-included. Committing the current set would ship mixed conclusions:

- reconciled conclusion: `umg_envoy_load_sleeve` is manifest-declared read-only
- stale conclusion: `umg_envoy_load_sleeve` remains manifest-absent/non-public

That is release-readiness blocking.

## 6. Gates

Lightweight gates were not run because the required document coherence check failed before the gate stage.

## 7. Recommended Correction Order

1. Keep the governance doc tool-count correction.
2. In `docs/LOAD-SLEEVE-SURFACE-DECISION-0.3.0-alpha.15.md`, either update or explicitly mark the stale "manifest-absent" / `SAFE_TO_KEEP_DOC_CLASSIFICATION` section as superseded by runtime reconciliation.
3. In `docs/OPENCLAW-HOST-TOOL-VISIBILITY-SEMANTICS-LOAD-SLEEVE-0.3.0-alpha.15.md`, either update or explicitly scope the static manifest-absence analysis as superseded by the runtime reconciliation conclusion.
4. Re-run the four-doc review, then run `npm run check`, `npm run build`, and `npm pack --dry-run`.
5. Commit only the reconciled Alpha15 docs and Alpha20A/Alpha20B reports if the four-doc set is coherent.

## 8. Commands Run

```powershell
git branch --show-current
git rev-parse HEAD
git status --short
git diff -- docs/GOVERNANCE-EXECUTION-CONTRACT-0.3.0-alpha.15.md
rg "manifest-absent|not manifest-declared|not part of the current|17 tools|22 tools|umg_envoy_load_sleeve" PUBLIC-VARIANT-OVERVIEW.md docs/GOVERNANCE-EXECUTION-CONTRACT-0.3.0-alpha.15.md docs/LOAD-SLEEVE-SURFACE-DECISION-0.3.0-alpha.15.md docs/OPENCLAW-HOST-TOOL-VISIBILITY-SEMANTICS-LOAD-SLEEVE-0.3.0-alpha.15.md
Select-String -Path docs/LOAD-SLEEVE-SURFACE-DECISION-0.3.0-alpha.15.md -Pattern "manifest-absent|not manifest-declared|What Not To Change Yet|Recommendation" -Context 3,4
Select-String -Path docs/OPENCLAW-HOST-TOOL-VISIBILITY-SEMANTICS-LOAD-SLEEVE-0.3.0-alpha.15.md -Pattern "manifest-absent|not manifest-declared|SAFE_TO_KEEP_DOC_CLASSIFICATION|DECLARE_RUNTIME_VISIBLE|Recommendation|Meaning For" -Context 3,4
```

Results:

- Baseline branch/HEAD check: pass
- Targeted governance diff check: pass
- Four-doc coherence check: failed due to remaining contradictory pre-reconciliation wording
- Gates: not run
- Commit: not run
- Push: not run

## 9. Boundary Confirmation

- Installed extension mutated: no
- ClawHub changed: no
- Publication changed: no
- Version changed: no
- Source changed: no
- Tests changed: no
- Manifest changed: no
- Generated dist changed: no
- Generated sleeves executed: no
- Generated sleeves written: no
