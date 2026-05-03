# TOOL-RUNTIME-30C — Publish Result

## Command executed
```text
clawhub package publish "C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.2.8" --family code-plugin --name umg-envoy-agent --display-name "UMG Envoy Agent" --version 0.2.9 --changelog "Public surface correction release: removes shipped process-execution bridge exposure from the public artifact, aligns bundled-adapter-only public posture, and updates package metadata/docs for the corrected public package boundary." --source-repo NeoMagnetar/umg-envoy-agent --source-commit d92d984ebabd66d010a1c9f6a3065084082bbf24 --source-ref fix/public-envoy-surface-v0.2.9 --source-path .
```

## Provenance used
- source repo: `NeoMagnetar/umg-envoy-agent`
- source commit: `d92d984ebabd66d010a1c9f6a3065084082bbf24`
- source ref: `fix/public-envoy-surface-v0.2.9`
- source path: `.`

## Candidate identity
- package: `umg-envoy-agent`
- version: `0.2.9`
- artifact: `umg-envoy-agent-0.2.9.tgz`
- local SHA-256: `389417497433B3A71B09BFD528ACCE3A453CEE98488DDD1D7A74CB7A7A78AEBC`

## Publish execution result
- exit code: `0`
- result line: `OK. Published umg-envoy-agent@0.2.9 (rd7ef3p11zrzjt1ba6f0ba3xy58613cg)`

## Immediate ClawHub evidence
From immediate `clawhub package inspect umg-envoy-agent` after publish:
- package exists: yes
- latest version: `0.2.9`
- owner: `neomagnetar`
- verification: `source-linked / artifact-only`
- verification summary: `Validated package structure and linked the release to source metadata.`
- source repo: `NeoMagnetar/umg-envoy-agent`
- source commit: `d92d984ebabd66d010a1c9f6a3065084082bbf24`
- source ref: `fix/public-envoy-surface-v0.2.9`
- scan status: `pending`

## Boundary confirmations
- no GitHub release tag was created in this phase
- no historical `v0.2.8` artifacts were mutated
- no compiler bridge source was deleted
- no Desktop Bridge work was touched
- no PhaseBridge work was touched

## Important note
Publish/upload succeeded, but ClawHub clearance is not yet established because the scan status is still `pending`.
