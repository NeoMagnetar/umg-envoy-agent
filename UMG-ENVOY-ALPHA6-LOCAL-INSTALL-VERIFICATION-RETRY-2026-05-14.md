# UMG Envoy Agent Alpha.6 — Local Install Verification Retry

Date: 2026-05-14

## Verdict

`ALPHA6_LOCAL_INSTALL_VERIFICATION_RETRY_READY`

## Baseline

Previous hold:
- `HOLD_ALPHA6_LOCAL_INSTALL_START_STATE_NOT_CLEAN`

Corrective audit:
- `ALPHA6_BASELINE_COMMIT_IDENTITY_AUDIT_READY`

Baseline audit commit:
- `dceccbe8d1dddebfad02ce7177c536e92df42d6b`

Accepted baseline for this retry:
- `dceccbe8d1dddebfad02ce7177c536e92df42d6b`

## Scope

This step created a local package tarball and installed it into an isolated temporary consumer project.

This step did not:
- publish alpha.6
- run ClawHub publish
- upload package anywhere
- modify package metadata
- modify source files
- modify UMG-Block-Library
- modify .gitmodules
- stage generated package artifacts
- commit node_modules

## Pre-Install Verification

Passed:
- `npm run check`
- `npm run build`
- `node scripts/alpha6-real-library-resolver-smoke.mjs`

## Local Package Artifact

| Field | Value |
|---|---|
| tarball path | `C:\.openclaw\workspace\alpha6-local-install-verify-retry\pack\umg-envoy-agent-0.3.0-alpha.6.tgz` |
| package name | `umg-envoy-agent` |
| package version | `0.3.0-alpha.6` |
| filename | `umg-envoy-agent-0.3.0-alpha.6.tgz` |

## Install Target

| Field | Value |
|---|---|
| consumer project | `C:\.openclaw\workspace\alpha6-local-install-verify-retry\consumer` |
| install command | `npm install ..\pack\umg-envoy-agent-0.3.0-alpha.6.tgz --ignore-scripts` |
| installed root | `consumer\node_modules\umg-envoy-agent` |

## Required Installed Files

| Required File / Lane | Present |
|---|---|
| `package.json` | yes |
| `openclaw.plugin.json` | yes |
| `README.md` | yes |
| `PUBLIC-VARIANT-README.md` | yes |
| `dist/plugin-entry-public.js` | yes |
| `dist/real-library-resolver.js` | yes |
| `public-content/` | yes |

## Entry Load Verification

| Check | Result |
|---|---|
| `require.resolve('umg-envoy-agent')` | passed |
| `require('umg-envoy-agent')` | passed |
| export keys printed | yes |

## Metadata Verification

| Field | Value |
|---|---|
| installed package name | `umg-envoy-agent` |
| installed package version | `0.3.0-alpha.6` |
| plugin entry exists | yes |
| resolver dist exists | yes |
| public-content exists | yes |

## Forbidden Installed Content Check

Forbidden installed package entries found:
- `0`

## Local Artifacts Not Committed

Not committed:
- `alpha6-local-install-verify-retry/`
- local `.tgz`
- install `node_modules/`
- local install logs
- pack JSON logs

## Holds Before Publish

Alpha.6 must not be published yet.

Remaining hold:
- `HOLD_PUBLISH_UNTIL_NO_PUBLISH_FINAL_GATE`

## Required Next Task

Next task:
`ALPHA6_NO_PUBLISH_FINAL_GATE`

