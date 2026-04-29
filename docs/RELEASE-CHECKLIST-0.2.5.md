# UMG Envoy Agent 0.2.5 Release Checklist

Hardened ClawHub release boundary only.
Do not publish, tag, push, or create a GitHub release until this checklist is explicitly approved.

## Version alignment

- package version is `0.2.5`
- plugin manifest version is `0.2.5`
- smoke/status-facing version surfaces are `0.2.5`

## Required validation

- `npm run build`
- `npm run check`
- `npm run smoke`
- `npm run validate:umg:e2e -- --sleevePath "<path>" --libraryRoot "<path>" --compilerRepoPath "<path>"`
- `npm run pack:dry`

## Staging directory requirements

- staging directory created fresh
- staging inventory matches intended hardened public surface exactly
- `package.json` present in staging
- `openclaw.plugin.json` present in staging
- `dist/plugin-entry.js` present in staging
- no untracked reports in staging
- no `scripts/` in staging
- no `src/` in staging
- no `config/` in staging
- no legacy draft files in staging
- no runtime outputs in staging
- no `node_modules/` in staging
- ClawHub publish command uses staging directory absolute path

## Publication boundary checks

- no ClawHub publish performed
- no npm publish performed
- no tag created
- no GitHub release created
