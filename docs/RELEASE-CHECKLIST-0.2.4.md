# UMG Envoy Agent 0.2.4 Release Checklist

Metadata polish boundary only.
Do not publish, tag, push, or create a GitHub release until this checklist is explicitly approved.

## Required validation

- `npm run build`
- `npm run check`
- `npm run smoke`
- `npm run validate:umg:e2e -- --sleevePath "<path>" --libraryRoot "<path>" --compilerRepoPath "<path>"`
- `npm run pack:dry`

## Metadata expectations

- short package/plugin description is clear for ClawHub listing use
- README no longer contains stale pre-publication ClawHub wording
- package keywords support intentional discovery tags
- no runtime behavior changes

## Package hygiene expectations

- `package.json` ships
- `openclaw.plugin.json` ships
- `README.md` ships
- `dist/` ships
- `docs/` ships
- `public-content/` ships
- `package-lock.json` remains excluded from the packed artifact
- `scripts/validate-umg-e2e.mjs` remains repo-only
- untracked reports remain excluded from the packed artifact
- runtime outputs remain excluded from the packed artifact

## Publication boundary checks

- no ClawHub publish performed
- no npm publish performed
- no tag created
- no GitHub release created
