# TOOL-RUNTIME-32B — v0.2.10 Publish Command Plan

## Source-of-truth candidate
- package: `umg-envoy-agent`
- version: `0.2.10`
- branch: `fix/v0.2.10-packaging-hygiene`
- artifact: `umg-envoy-agent-0.2.10.tgz`
- artifact path: `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.2.8\umg-envoy-agent-0.2.10.tgz`
- SHA-256: `C8B15CD9738A90D845094D5C03D326B6AC6B4B98D4C852B4A47A2D9B0953D661`

## Publish-source rule
Do not publish from the folder.
Do not use a legacy ZIP path.
Use the verified tarball identity as the approval source of truth.

## Provenance prerequisite
Before a future publish command is executed:
- push `fix/v0.2.10-packaging-hygiene` to `origin` because it is not remotely present yet
- confirm the exact intended remote commit URL resolves in `NeoMagnetar/umg-envoy-agent`
- use the packaging candidate commit `d373678b5cd3f5c6d83c9c7c11668e148c2bda2d` as the preferred publish provenance anchor unless a later explicitly approved gate refresh changes the source sha
- then use the matching `--source-repo`, `--source-commit`, `--source-ref`, and `--source-path` values

## Planned command shape
```text
clawhub package publish "C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.2.8" --family code-plugin --name umg-envoy-agent --display-name "UMG Envoy Agent" --version 0.2.10 --changelog "Packaging hygiene release: preserves the corrected public-safe plugin code from v0.2.9 while removing accidental audit/build byproducts from the published public artifact." --source-repo NeoMagnetar/umg-envoy-agent --source-commit <verified-remote-commit> --source-ref fix/v0.2.10-packaging-hygiene --source-path .
```

## Reminder
This is a command plan only.
It does not authorize publish.
