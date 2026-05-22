# UMG Envoy Agent Alpha.6 — Publish Provenance Args Gate

Date: 2026-05-14

## Verdict

`HOLD_ALPHA6_PUBLISH_PROVENANCE_HUMAN_APPROVAL_REQUIRED`

## Current State

The approved Alpha.6 publish command was executed, but ClawHub rejected it.

Executed command:
`clawhub package publish C:\.openclaw\workspace\alpha6-publish-execution-prep\candidate-0.3.0-alpha.6-a6dc752\umg-envoy-agent-0.3.0-alpha.6.tgz`

Result:
- failed with exit code `1`

ClawHub error:
- `Error: --source-repo and --source-commit required for code plugins`

Important:
- Alpha.6 is still not published.

## Locked Candidate Tuple Rechecked

| Field | Value |
|---|---|
| candidate path | `C:\.openclaw\workspace\alpha6-publish-execution-prep\candidate-0.3.0-alpha.6-a6dc752\umg-envoy-agent-0.3.0-alpha.6.tgz` |
| package name | `umg-envoy-agent` |
| package version | `0.3.0-alpha.6` |
| filename | `umg-envoy-agent-0.3.0-alpha.6.tgz` |
| SHA256 | `369E5F7A7350618961E8CE708338F52164FE52AAA21D1C2B7B6F3A0450A831C6` |
| SHA256 match | yes |

## Derived Publish Provenance Args

Derived required provenance values:

| Arg | Value |
|---|---|
| `--source-repo` | `NeoMagnetar/umg-envoy-agent` |
| `--source-commit` | `c66f00e6af84e5c17f452d09c4ec5fb9733baa03` |

Derivation basis:
- git remote origin = `https://github.com/NeoMagnetar/umg-envoy-agent.git`
- publish execution prep commit = `c66f00e6af84e5c17f452d09c4ec5fb9733baa03`
- candidate artifact remains the previously approved tarball tied to that prep state

## Corrected Publish Command

Not executed:

```powershell
clawhub package publish C:\.openclaw\workspace\alpha6-publish-execution-prep\candidate-0.3.0-alpha.6-a6dc752\umg-envoy-agent-0.3.0-alpha.6.tgz --source-repo NeoMagnetar/umg-envoy-agent --source-commit c66f00e6af84e5c17f452d09c4ec5fb9733baa03
```

## Safety / Non-Actions

This step did not:
- retry publish automatically
- run ClawHub publish again
- run npm publish
- upload package anywhere
- create a new tarball
- modify package metadata
- modify source files
- modify dist files
- modify UMG-Block-Library
- modify .gitmodules
- stage candidate tgz
- stage raw evidence files
- stage local install artifacts
- stage node_modules
- stage artifacts/
- stage skills/

## Approval Requirement

Publishing remains blocked until the user explicitly approves this corrected exact tuple:

candidate path:
`C:\.openclaw\workspace\alpha6-publish-execution-prep\candidate-0.3.0-alpha.6-a6dc752\umg-envoy-agent-0.3.0-alpha.6.tgz`

SHA256:
`369E5F7A7350618961E8CE708338F52164FE52AAA21D1C2B7B6F3A0450A831C6`

source-repo:
`NeoMagnetar/umg-envoy-agent`

source-commit:
`c66f00e6af84e5c17f452d09c4ec5fb9733baa03`

corrected command:
`clawhub package publish C:\.openclaw\workspace\alpha6-publish-execution-prep\candidate-0.3.0-alpha.6-a6dc752\umg-envoy-agent-0.3.0-alpha.6.tgz --source-repo NeoMagnetar/umg-envoy-agent --source-commit c66f00e6af84e5c17f452d09c4ec5fb9733baa03`

Required explicit approval phrase:

`APPROVE_ALPHA6_PUBLISH_WITH_PROVENANCE candidate=C:\.openclaw\workspace\alpha6-publish-execution-prep\candidate-0.3.0-alpha.6-a6dc752\umg-envoy-agent-0.3.0-alpha.6.tgz sha256=369E5F7A7350618961E8CE708338F52164FE52AAA21D1C2B7B6F3A0450A831C6 source_repo=NeoMagnetar/umg-envoy-agent source_commit=c66f00e6af84e5c17f452d09c4ec5fb9733baa03 command="clawhub package publish C:\.openclaw\workspace\alpha6-publish-execution-prep\candidate-0.3.0-alpha.6-a6dc752\umg-envoy-agent-0.3.0-alpha.6.tgz --source-repo NeoMagnetar/umg-envoy-agent --source-commit c66f00e6af84e5c17f452d09c4ec5fb9733baa03"`

## Gate Decision

Current gate result:
`HOLD_ALPHA6_PUBLISH_PROVENANCE_HUMAN_APPROVAL_REQUIRED`

Required next task after explicit approval:
`ALPHA6_PUBLISH_EXECUTION_WITH_PROVENANCE`
