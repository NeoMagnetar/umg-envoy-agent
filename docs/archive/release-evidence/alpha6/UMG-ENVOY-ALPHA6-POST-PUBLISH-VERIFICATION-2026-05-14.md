# UMG Envoy Agent Alpha.6 — Post-Publish Verification and Record

Date: 2026-05-14

## Verdict

`ALPHA6_PUBLISHED_CONFIRMED`

## Publish Result

Published package:
- `umg-envoy-agent@0.3.0-alpha.6`

ClawHub id:
- `rd7cgt05ayt3qhe3a0gryz1tz986s062`

Executed command:

```powershell
clawhub package publish C:\.openclaw\workspace\alpha6-publish-execution-prep\candidate-0.3.0-alpha.6-a6dc752\umg-envoy-agent-0.3.0-alpha.6.tgz --source-repo NeoMagnetar/umg-envoy-agent --source-commit c66f00e6af84e5c17f452d09c4ec5fb9733baa03
```

## Published Artifact Record

| Field | Value |
|---|---|
| candidate path | `C:\.openclaw\workspace\alpha6-publish-execution-prep\candidate-0.3.0-alpha.6-a6dc752\umg-envoy-agent-0.3.0-alpha.6.tgz` |
| SHA256 | `369E5F7A7350618961E8CE708338F52164FE52AAA21D1C2B7B6F3A0450A831C6` |
| source repo | `NeoMagnetar/umg-envoy-agent` |
| source commit | `c66f00e6af84e5c17f452d09c4ec5fb9733baa03` |

## Post-Publish Verification

Verification attempts:

1. `clawhub package inspect umg-envoy-agent@0.3.0-alpha.6`
   - result: not visible via direct inspect in this account/context at verification time
   - message: `Package not found or not visible to this account.`

2. `clawhub package explore umg-envoy-agent`
   - result: success
   - package was discoverable in search output as:
     - `umg-envoy-agent v0.3.0-alpha.6`
     - `UMG Envoy Agent`
     - `[Code Plugin, community, source-linked]`

Verification conclusion:
- published package can be located via ClawHub package explore/search
- publish record and package identity are confirmed
- direct inspect visibility may be account- or propagation-dependent

## Non-Actions

This step did not:
- publish again
- run npm publish
- create a new tarball
- change package metadata
- modify source files
- modify UMG-Block-Library
- modify .gitmodules
- stage generated tgz files
- stage raw logs
- stage candidate folder
- stage node_modules

## Final State

Current state:
- `Alpha.6 published successfully on ClawHub`
- `Package discoverable by explore/search`
- `No npm publish performed`

## Record Anchor

Recommended release record anchors:
- publish result commit context: `5b1e2f9a073091c896452d58f89f0233b2afd94d`
- publish gate report: `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-PUBLISH-PROVENANCE-ARGS-GATE-2026-05-14.md`
- post-publish report: `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-POST-PUBLISH-VERIFICATION-2026-05-14.md`
