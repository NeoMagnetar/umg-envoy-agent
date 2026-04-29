# UMG Envoy Agent 0.2.3 Release Checklist

Publication-cleanup boundary only.
Do not publish, tag, push, or create a GitHub release until this checklist is explicitly approved.

## Required validation

- `npm run check`
- `npm run build`
- `npm run smoke`
- `npm run validate:umg:e2e -- --sleevePath "<path>" --libraryRoot "<path>" --compilerRepoPath "<path>"`
- `npm run pack:dry`

## Documentation expectations

- docs no longer claim active RC status for the current package state
- README includes a plain-English UMG / Envoy explanation
- README includes a glossary
- README includes a fresh tester quickstart
- ClawHub-first publication note is present and clearly marked as a separate later step

## Package hygiene expectations

- `package-lock.json` is excluded from the packed artifact
- `scripts/validate-umg-e2e.mjs` remains repo-only
- untracked reports are excluded from the packed artifact
- runtime outputs are excluded from the packed artifact
- `README.md` ships
- `docs/` ships
- `public-content/` ships
- `dist/` ships
- `openclaw.plugin.json` ships

## Publication boundary checks

- no ClawHub publish performed
- no npm publish performed
- no tag created
- no GitHub release created
