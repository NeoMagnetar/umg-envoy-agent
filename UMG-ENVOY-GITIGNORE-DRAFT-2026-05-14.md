# UMG Envoy Agent — Gitignore Draft

Date: 2026-05-14

## Purpose

Draft ignore policy for local generated outputs, staging outputs, temp folders, and backup lanes.

This file is a draft only.
Do not apply blindly.

## Candidate `.gitignore` Additions

```gitignore
# Package/archive outputs
*.tgz
*.zip
*.log

# Local temp/scratch
tmp-*/
temp-*/
scratch/
review/
inspect/
inspection/

# Local staging/release workspaces
release-staging/
umg-envoy-agent-publish-stage/
umg-envoy-agent-release-clean/

# Local backups
backups/
plugin-backups/

# Node
node_modules/

# OS/editor
.DS_Store
Thumbs.db
```

## Do Not Ignore Blindly

Do not ignore these without policy decision:

- `dist/`
- `public-content/`
- `work/public-next/package/src/`
- `work/public-next/package/scripts/`
- `UMG-Block-Library/`
- `AI/`
- `sleeves/`

## Important Note

`.gitignore` does not remove tracked files.
Tracked artifact deletions still require explicit review.
