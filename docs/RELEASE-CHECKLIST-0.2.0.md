# Release Checklist 0.2.0

- [x] npm install succeeds
- [x] npm run check succeeds
- [x] npm run build succeeds
- [x] npm run smoke succeeds
- [x] dist/plugin-entry.js exists
- [x] openclaw.plugin.json points to dist/plugin-entry.js
- [x] public-content exists
- [x] sample sleeves compile
- [x] runtime validator passes valid sample
- [x] runtime validator rejects invalid sample
- [x] matrix/status counts are accurate
- [x] npm pack --dry-run excludes node_modules
- [x] package has no personal absolute paths
- [x] package has no private runtime state

## Verified smoke output

```json
{
  "ok": true,
  "plugin": "umg-envoy-agent",
  "version": "0.2.0",
  "compilerAdapter": "available",
  "contentMode": "bundled-public",
  "sampleSleeves": 2,
  "sampleBlocks": 7,
  "runtimeValidation": "passed",
  "errors": []
}
```

## Verified matrix/status counts

```json
{
  "ok": true,
  "compilerAdapter": "available",
  "contentMode": "bundled-public",
  "compilerMode": "bundled-adapter",
  "sampleSleeves": 2,
  "sampleBlocks": 7,
  "blockKinds": [
    "blueprint",
    "directive",
    "instruction",
    "philosophy",
    "primary",
    "subject",
    "trigger"
  ]
}
```
