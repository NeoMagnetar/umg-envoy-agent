# Release Checklist — UMG Envoy Agent v0.2.7

## Intent

Metadata-only compatibility correction release.

## Versioning

- [ ] `package.json` -> `0.2.7`
- [ ] `package-lock.json` -> `0.2.7`
- [ ] `openclaw.plugin.json` -> `0.2.7`
- [ ] smoke/status version surfaces -> `0.2.7`
- [ ] built `dist` version surfaces -> `0.2.7`

## Compatibility metadata

- [ ] `openclaw.compat.pluginApi` uses plugin API semver axis
- [ ] `openclaw.compat.pluginApi` -> `>=1.2.0`
- [ ] `openclaw.install.minHostVersion` present and uses host version axis
- [ ] `openclaw.install.minHostVersion` -> `>=2026.3.23-1`
- [ ] `openclaw.compat.minGatewayVersion` preserved if still used
- [ ] `openclaw.build.openclawVersion` preserved
- [ ] `openclaw.build.pluginSdkVersion` preserved

## Documentation

- [ ] `CHANGELOG.md` updated for `0.2.7`
- [ ] `docs/RELEASE-NOTES-0.2.7.md` added
- [ ] this checklist added
- [ ] release notes clearly state metadata-only compatibility correction intent

## Validation

- [ ] `npm run build`
- [ ] `npm run check`
- [ ] `npm run smoke`
- [ ] `npm run pack:dry`
- [ ] canonical `npm run validate:umg:e2e`

## Hardened staging

- [ ] staging root regenerated to `umg-envoy-agent-0.2.7`
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

## Release flow

- [ ] local commit prepared
- [ ] branch pushed
- [ ] PR opened
- [ ] no ClawHub publish in prep stage
- [ ] no install test in prep stage
