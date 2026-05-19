# UMG Envoy / OpenClaw Restore Recovery — 2026-05-18

## Context
System was recovered to May 9 state, creating mismatch between OpenClaw config, installed UMG Envoy extension metadata, and actual built plugin output.

## Initial Failure
OpenClaw could not discover/load `umg-envoy-agent` cleanly.
The restored extension metadata referenced `dist/plugin-entry-public.js`, while the recovered local build actually loaded through `dist/plugin-entry.js`.

## Recovery Performed
- Repaired installed extension manifest/metadata to match actual built entry.
- Confirmed plugin code could be imported directly by Node.
- Repaired OpenClaw config/install metadata.
- Updated `C:\Users\Magne\.openclaw\openclaw.json` install record to local path source:
  - source: path
  - sourcePath: C:\Users\Magne\.openclaw\extensions\umg-envoy-agent
  - installPath: C:\Users\Magne\.openclaw\extensions\umg-envoy-agent
  - version: 0.3.0-alpha.6

## Current Live State
- `umg-envoy-agent` is loaded again.
- Runtime version reports `0.3.0-alpha.6`.
- Runtime source is `global:umg-envoy-agent/dist/plugin-entry.js`.
- Current surface is compiler-backed, not the public alpha.5 `plugin-entry-public.js` surface.

## Public Baseline Reference
Verified public ClawHub release remains:
- package: umg-envoy-agent
- version: 0.3.0-alpha.5
- source ref: umg-envoy-agent-v0.3.0-alpha.5
- artifact: npm-pack / tgz
- public entrypoint: dist/plugin-entry-public.js
- scan status: clean

## Important Boundary
Do not use broad `git add -A`.
Workspace contains unrelated modified/untracked files.
Commit only this recovery note unless a later targeted source commit is deliberately prepared.

## Next Recommended Work
Use the recovered alpha6 local state as a working checkpoint.
Before further development:
1. Capture live plugin info.
2. Capture doctor output.
3. Capture exact active tool list.
4. Decide whether alpha6 should formalize the compiler-backed surface or rebuild the public-safe entrypoint forward.
5. Continue toward real UMG Block Library resolver under one unified project track.
