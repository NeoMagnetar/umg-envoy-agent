# Release Checklist — UMG Envoy Agent v0.2.6

## Intent

ClawHub latest-tag correction release with modular cognitive architecture runtime metadata polish.

## Versioning

- [ ] `package.json` -> `0.2.6`
- [ ] `package-lock.json` -> `0.2.6`
- [ ] `openclaw.plugin.json` -> `0.2.6`
- [ ] smoke/status version surfaces -> `0.2.6`
- [ ] built `dist` version surfaces -> `0.2.6`

## Documentation

- [ ] `CHANGELOG.md` updated for `0.2.6`
- [ ] `docs/RELEASE-NOTES-0.2.6.md` added
- [ ] this checklist added
- [ ] release notes clearly state registry-tag correction intent

## Validation

- [ ] `npm run build`
- [ ] `npm run check`
- [ ] `npm run smoke`
- [ ] `npm run pack:dry`
- [ ] canonical `npm run validate:umg:e2e`

## Hardened staging

- [ ] staging root regenerated
- [ ] staged top-level contents only:
  - [ ] `package.json`
  - [ ] `openclaw.plugin.json`
  - [ ] `README.md`
  - [ ] `dist/`
  - [ ] `docs/`
  - [ ] `public-content/`
- [ ] forbidden contents absent:
  - [ ] `scripts/`
  - [ ] `src/`
  - [ ] `config/`
  - [ ] `package-lock.json`
  - [ ] local reports
  - [ ] `GITHUB-RELEASE-DRAFT-v0.2.0.md`
  - [ ] `node_modules/`
  - [ ] runtime/temp outputs

## Publish preparation

- [ ] exact ClawHub tag list prepared with reserved `latest`
- [ ] publish command prepared but not executed
- [ ] source commit/ref prepared for `v0.2.6`

## Git hygiene

- [ ] only intended tracked changes present
- [ ] known local untracked reports untouched
- [ ] local commit prepared
