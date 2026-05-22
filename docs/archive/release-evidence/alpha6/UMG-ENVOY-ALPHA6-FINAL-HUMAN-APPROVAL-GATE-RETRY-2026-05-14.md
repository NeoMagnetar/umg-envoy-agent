# UMG Envoy Agent Alpha.6 — Final Human Approval Gate Retry

Date: 2026-05-14

## Verdict

`HOLD_ALPHA6_FINAL_HUMAN_APPROVAL_REQUIRED`

## Prior Stop

Prior stop:
`HOLD_FINAL_APPROVAL_START_STATE_NOT_CLEAN`

## Refined Finding

Known local unstaged dirty lanes were present, but cached index was clean and no forbidden paths were staged.

## Baseline

Previous step:
- `ALPHA6_PUBLISH_EXECUTION_PREP_READY`

Publish execution prep commit:
- `c66f00e6af84e5c17f452d09c4ec5fb9733baa03`

## Start-State Classifier

Confirmed:
- `HEAD = c66f00e6af84e5c17f452d09c4ec5fb9733baa03`
- cached diff was empty before report staging
- no forbidden paths were staged

Dirty worktree classification:
- `alpha6-publish-execution-prep/ = LOCAL_CANDIDATE_EVIDENCE_UNSTAGED`
- `alpha6-local-install-verify-retry/ = LOCAL_INSTALL_EVIDENCE_UNSTAGED`
- `artifacts/ = HISTORICAL_ARTIFACT_LANE_UNSTAGED`
- `skills/ = SEPARATE_WORKSTREAM_UNSTAGED`
- `work/public-next/package/dist/ = LOCAL_BUILD_OUTPUT_UNSTAGED`
- `work/public-next/package/*.tgz = HISTORICAL_LOCAL_PACKAGE_ARTIFACTS_UNSTAGED`
- `work/public-next/package/_inspect* = LOCAL_DIAGNOSTIC_UNSTAGED`
- `work/public-next/package/_alpha* = LOCAL_DIAGNOSTIC_UNSTAGED`
- `work/public-next/package/config/ = UNREVIEWED_PACKAGE_SIDE_LOCAL_WORK_UNSTAGED`
- `work/public-next/package/docs/ = UNREVIEWED_PACKAGE_SIDE_LOCAL_WORK_UNSTAGED`
- `work/public-next/package/src/ untracked additions = UNREVIEWED_PACKAGE_SIDE_LOCAL_WORK_UNSTAGED`

## Scope

This was a final human approval gate retry.

This step did not:
- publish alpha.6
- run ClawHub publish
- run npm publish
- upload package anywhere
- run npm pack
- run npm install
- create another tgz
- modify package metadata
- modify source files
- modify dist files intentionally for release mutation
- modify UMG-Block-Library
- modify .gitmodules
- stage candidate tgz
- stage raw evidence files
- stage local install artifacts
- stage node_modules
- stage artifacts/
- stage skills/
- stage backups/
- stage release/staging folders
- stage Resleever lanes

## Candidate Artifact

| Field | Value |
|---|---|
| candidate path | `C:\.openclaw\workspace\alpha6-publish-execution-prep\candidate-0.3.0-alpha.6-a6dc752\umg-envoy-agent-0.3.0-alpha.6.tgz` |
| package name | `umg-envoy-agent` |
| package version | `0.3.0-alpha.6` |
| filename | `umg-envoy-agent-0.3.0-alpha.6.tgz` |

## Candidate SHA256

| Field | Value |
|---|---|
| algorithm | `SHA256` |
| expected hash | `369E5F7A7350618961E8CE708338F52164FE52AAA21D1C2B7B6F3A0450A831C6` |
| actual hash | `369E5F7A7350618961E8CE708338F52164FE52AAA21D1C2B7B6F3A0450A831C6` |
| match | yes |

## Required Files Present

| Required File / Lane | Present |
|---|---|
| `package.json` | yes |
| `openclaw.plugin.json` | yes |
| `README.md` | yes |
| `PUBLIC-VARIANT-README.md` | yes |
| `dist/plugin-entry-public.js` | yes |
| `dist/real-library-resolver.js` | yes |
| `public-content/` | yes |

## Forbidden Files Check

Forbidden candidate entries found:
- `0`

## Runtime Verification

Passed:
- `npm run check`
- `npm run build`
- `node scripts/alpha6-real-library-resolver-smoke.mjs`

Confirmed:
- tool count remains `18`
- runtime/status version = `0.3.0-alpha.6`
- shallow-load runtime summary works
- no recursion
- no execution

## No Publish Verification

Confirmed:
- no Alpha.6 publish execution evidence appears in recent git log scan
- cached diff remained empty before report staging
- no publish performed
- no ClawHub publish performed
- no npm publish performed
- no upload performed

## Prepared Publish Command

Not executed:

```powershell
clawhub package publish C:\.openclaw\workspace\alpha6-publish-execution-prep\candidate-0.3.0-alpha.6-a6dc752\umg-envoy-agent-0.3.0-alpha.6.tgz
```

## Approval Requirement

Publishing remains blocked until the user explicitly approves this exact tuple:

candidate path:
`C:\.openclaw\workspace\alpha6-publish-execution-prep\candidate-0.3.0-alpha.6-a6dc752\umg-envoy-agent-0.3.0-alpha.6.tgz`

SHA256:
`369E5F7A7350618961E8CE708338F52164FE52AAA21D1C2B7B6F3A0450A831C6`

command:
`clawhub package publish C:\.openclaw\workspace\alpha6-publish-execution-prep\candidate-0.3.0-alpha.6-a6dc752\umg-envoy-agent-0.3.0-alpha.6.tgz`

Required approval phrase:

`APPROVE_ALPHA6_PUBLISH candidate=C:\.openclaw\workspace\alpha6-publish-execution-prep\candidate-0.3.0-alpha.6-a6dc752\umg-envoy-agent-0.3.0-alpha.6.tgz sha256=369E5F7A7350618961E8CE708338F52164FE52AAA21D1C2B7B6F3A0450A831C6 command="clawhub package publish C:\.openclaw\workspace\alpha6-publish-execution-prep\candidate-0.3.0-alpha.6-a6dc752\umg-envoy-agent-0.3.0-alpha.6.tgz"`

## Gate Decision

Current gate result:

`HOLD_ALPHA6_FINAL_HUMAN_APPROVAL_REQUIRED`

Required next task after explicit approval:

`ALPHA6_PUBLISH_EXECUTION`
