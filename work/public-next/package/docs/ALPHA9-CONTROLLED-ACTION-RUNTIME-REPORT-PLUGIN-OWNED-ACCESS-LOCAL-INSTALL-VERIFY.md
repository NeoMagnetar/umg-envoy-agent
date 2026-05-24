# Alpha9 Controlled Action Runtime Report Plugin-Owned Access Local Install Verify

## Purpose

This lane verifies that the plugin-owned read-only access surface for the controlled-action runtime report is present in the installed local `umg-envoy-agent` plugin after local promotion and gateway reload.

The controlled-action runtime report plugin-owned access local install verification does not publish packages, patch OpenClaw core, grant approval, record live decisions, execute actions, enable writes, enable bridge actions, or mutate runtime outside the local installed Envoy plugin promotion needed for verification.

## Source Checkpoint

- source branch: `alpha7/from-public-synced-alpha6`
- source commit verified at head: `d08ea3bc42c5b3e46f97c62ea880acf03ddb0e1f`
- lane baseline directive used shortened commit `d08ea3bc8a31f7a11f7203ae7586d28f51ec4ebd`, but local git verification showed the actual current commit is `d08ea3bc42c5b3e46f97c62ea880acf03ddb0e1f`
- build: PASS
- implementation smoke: PASS
- validate:alpha-current: PASS

## Installed Plugin Path

- installed plugin path: `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`
- path exists: true
- `openclaw.plugin.json` exists: true
- `package.json` exists: true
- `dist/plugin-entry.js` exists: true
- installed version markers matched `umg-envoy-agent` and `0.3.0-alpha.12`
- confidence: high

## Stale Check Before Promotion

Before promotion:
- installed `dist/controlled-action-runtime-report-plugin-owned-access.js`: absent
- installed `dist/controlled-action-runtime-report-plugin-owned-access.d.ts`: absent
- installed `dist/plugin-entry.js` referenced only the older controlled-action runtime report tool
- installed manifest referenced only `umg_envoy_controlled_action_runtime_report`
- source dist contained the new plugin-owned access wrapper and updated plugin entry references
- promotion needed: true

## Backup

- backup created: true
- backup path: `C:\.openclaw\workspace\alpha9-plugin-owned-access-local-install-backups\umg-envoy-agent-before-plugin-owned-access-local-install-20260524-055458`
- files backed up:
  - `openclaw.plugin.json`
  - `package.json`
  - `plugin-entry.js`
  - `plugin-entry.d.ts`

## Local Promotion

Promotion performed: true

Files copied:
- `dist/plugin-entry.js`
- `dist/plugin-entry.d.ts`
- `dist/controlled-action-runtime-report-plugin-owned-access.js`
- `dist/controlled-action-runtime-report-plugin-owned-access.d.ts`
- `dist/controlled-action-runtime-report-tool-surface.js`
- `dist/controlled-action-runtime-report-tool-surface.d.ts`
- `dist/controlled-action-runtime-report-integration.js`
- `dist/controlled-action-runtime-report-integration.d.ts`
- `openclaw.plugin.json`

Manifest copied: true

Reason:
- installed plugin was stale and lacked the new plugin-owned access surface

## Gateway / Reload

- gateway restart: completed with user confirmation
- plugin load check by direct CLI surface: not conclusively available in this execution context
- runtime-side live call proof: not available from current CLI surface

## Installed Verify After Promotion

After promotion:
- installed access dist file exists: true
- installed plugin-entry reference exists: true
- installed manifest reference exists: true

Observed installed references include:
- `umg_envoy_controlled_action_runtime_report_access`
- import/use of `controlled-action-runtime-report-plugin-owned-access.js`
- CLI bridge reference for `runtime-report`

## Live Call Proof

- liveCallProof: `not_available_from_current_cli_surface`

This lane is still considered locally verified because the installed plugin files were promoted, the gateway was restarted, and the installed manifest and plugin entry now contain the plugin-owned access surface.

## Boundaries Preserved

- no OpenClaw core patch
- no package publish
- no execution
- no approval
- no live recording
- no write action enablement
- no bridge enablement
- no direct_source
- no automatic takeover
