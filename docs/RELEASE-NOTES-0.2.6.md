# UMG Envoy Agent v0.2.6

UMG Envoy Agent v0.2.6 is the intended ClawHub latest/default release and describes UMG Envoy Agent as a modular cognitive architecture runtime.

## Highlights

- Includes the reserved `latest` tag explicitly during ClawHub publish.
- Fixes the release-process issue where custom semantic tags replaced the default `latest` tag.
- Preserves the hardened staged artifact surface introduced in v0.2.5.
- Keeps runtime, compiler, relation matrix, and artifact resolver behavior unchanged.

## Why this release exists

The installed `clawhub` package publish implementation uses a tag-set rule equivalent to:

```js
const tags = parseTags(options.tags ?? "latest");
```

That means:
- omitting `--tags` defaults publish to `latest`
- supplying `--tags` replaces the default tag set
- earlier semantic-tag publishes did not carry `latest`
- package-level latest/default therefore stayed pinned to an older release

v0.2.6 is the deterministic correction release for that package-level routing issue.

## Validation

- `npm run build`
- `npm run check`
- `npm run smoke`
- `npm run pack:dry`
- canonical `npm run validate:umg:e2e`
- hardened staging inventory audit

## Scope

- no runtime/compiler/relation/artifact-resolver behavior changes
- no artifact-surface broadening from the hardened v0.2.5 model
- no same-version republish of v0.2.5
