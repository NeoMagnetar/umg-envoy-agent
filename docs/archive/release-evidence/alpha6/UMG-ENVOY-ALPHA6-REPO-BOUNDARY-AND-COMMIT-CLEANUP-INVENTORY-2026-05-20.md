# UMG Envoy Alpha6 — Repo Boundary and Commit Cleanup Inventory

Date: 2026-05-20

## Repo Boundary

### Actual repo root

- actual git repo root: `C:\.openclaw\workspace`

### Package path ownership

- package path: `C:\.openclaw\workspace\work\public-next\package`
- package path is **inside the same workspace repo**, not a separate nested repo

### Report file ownership

Workspace-root reports are owned by the same repo root:
- `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-VERSION-BUMP-AND-PACKAGE-SYNC-PREP-2026-05-19.md`
- `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-PACKAGE-ARTIFACT-DIST-COMPILER-INCLUSION-FIX-2026-05-20.md`
- `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-PUBLIC-PACKAGE-SYNC-PUBLISH-GATE-RETRY-2026-05-20.md`
- `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-PUBLIC-PACKAGE-SYNC-PUBLISH-EXECUTION-2026-05-20.md`
- `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-DIRTY-TREE-INVENTORY-BEFORE-VERSION-BUMP-2026-05-19.md`
- `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-DIRTY-TREE-BEFORE-VERSION-BUMP-2026-05-19.patch`

### Staging artifact ownership

Generated staging / release verification paths are outside the intended commit set for this lane, including:
- `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\...`
- `C:\.openclaw\workspace\alpha6-local-install-verify-backups\...`
- `C:\.openclaw\workspace\alpha6-package-extract-verify\...`

These appear inside the same broad workspace tree but are **lane-related artifacts**, not commit targets for this cleanup lane.

## Dirty Workspace Classification

The workspace repo contains three classes of dirt.

### A. Lane-relevant and should commit

Tracked package files:
- `work/public-next/package/README.md`
- `work/public-next/package/openclaw.plugin.json`
- `work/public-next/package/package-lock.json`
- `work/public-next/package/package.json`
- `work/public-next/package/scripts/alpha6-real-block-library-manifest-index-smoke.mjs`
- `work/public-next/package/scripts/alpha6-real-block-library-sleeve-graph-index-smoke.mjs`
- `work/public-next/package/scripts/alpha6-response-envelope-active-stack-recursion-fix-smoke.mjs`
- `work/public-next/package/src/plugin-entry-public.ts`
- `work/public-next/package/src/plugin-entry.ts`
- `work/public-next/package/tsconfig.json`

Workspace-root Alpha6 reports / audit artifacts:
- `UMG-ENVOY-ALPHA6-DIRTY-TREE-INVENTORY-BEFORE-VERSION-BUMP-2026-05-19.md`
- `UMG-ENVOY-ALPHA6-DIRTY-TREE-BEFORE-VERSION-BUMP-2026-05-19.patch`
- `UMG-ENVOY-ALPHA6-VERSION-BUMP-AND-PACKAGE-SYNC-PREP-2026-05-19.md`
- `UMG-ENVOY-ALPHA6-PACKAGE-ARTIFACT-DIST-COMPILER-INCLUSION-FIX-2026-05-20.md`
- `UMG-ENVOY-ALPHA6-PUBLIC-PACKAGE-SYNC-PUBLISH-GATE-RETRY-2026-05-20.md`
- `UMG-ENVOY-ALPHA6-PUBLIC-PACKAGE-SYNC-PUBLISH-EXECUTION-2026-05-20.md`
- `UMG-ENVOY-ALPHA6-REPO-BOUNDARY-AND-COMMIT-CLEANUP-INVENTORY-2026-05-20.md`

Reason:
- these files document the accepted Alpha6 package sync path to `0.3.0-alpha.7`
- they include the version bump, package inclusion fix, publish gate retry, and publish execution evidence

### B. Lane-related but should not commit

Do not commit:
- local staged tgz/package artifacts under `umg-envoy-agent-publish-stage/`
- install rollback folders under `alpha6-local-install-verify-backups/`
- extracted package validation folders under `alpha6-package-extract-verify/`
- installed extension files under `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`
- temp probe scripts / temp extracts / diagnostic outputs

Reason:
- generated verification artifacts
- operational rollback material
- runtime environment state, not source-of-truth repo content

### C. Unrelated dirty files

Clearly unrelated workspace drift includes:
- massive tracked deletions under `artifacts/umg-envoy-agent-plugin/vendor/UMG_Envoy_Resleever/...`
- tracked modifications under `skills/clawhub-plugin-packager/...`
- tracked deletions under `skills/clawhub-packager/...`
- broad untracked directories under `artifacts/`, `skills/`, `work/public-current/`, `work/openclaw-personal/`, `work/schema-fix-inspect/`, `work/public-next/package/_*inspect/`, and many other workspace-level lanes
- package-adjacent generated/untracked files not needed for the Alpha6 sync audit commit, including `_inspect*`, `_alpha*inspect`, old tgz files, extra dist trees, config, docs, compiler source expansions, and archived release folders outside the explicit Alpha6 commit list

Reason:
- not required to document the accepted Alpha6 public sync lane
- staging these would contaminate the audit commit

## Public State Check

Non-disruptive verification remains good:
- ClawHub latest public version: `0.3.0-alpha.7`
- local installed extension remains `0.3.0-alpha.7`
- OpenClaw health previously verified OK
- no restart required for this cleanup lane

## Staging Policy

Safe staging approach for this lane:
- run from repo root: `C:\.openclaw\workspace`
- use explicit relative paths only
- do **not** use `git add .` or `git add -A`
- inspect `git diff --cached --name-status` before commit
- if any unrelated file appears staged, unstage it explicitly

## Commit Safety Read

This lane appears commit-isolatable **if and only if** staging is limited to the explicit A-list above.

No destructive cleanup should be performed.
