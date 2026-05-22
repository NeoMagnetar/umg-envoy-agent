# RELEASE_LEDGER.md

## Public Release Ledger

- `0.3.0-alpha.6` = early real block-library/runtime path
- `0.3.0-alpha.7` = public sync / Alpha6 publish correction
- `0.3.0-alpha.8` = Alpha7 gated read-only execution and inspector surfaces
- `0.3.0-alpha.9` = bounded read-only orchestration
- `0.3.0-alpha.10` = active sleeve session state
- `0.3.0-alpha.11` = sleeve graph richness and provenance labeling
- `0.3.0-alpha.12` = clean native graph fixture/runtime integration package

## Meaning of labels

- **Lane names** are project phases / execution lanes.
- **Package versions** are public release artifacts.
- **ClawHub capability labels** are compatibility/category metadata.

## Canonical release hygiene reminder

When release state is healthy, the following should agree:
- `package.json`
- `package-lock.json`
- `openclaw.plugin.json`
- `README.md`
- ClawHub public latest
- installed extension version
- runtime smoke version
- source commit / published metadata linkage when available
