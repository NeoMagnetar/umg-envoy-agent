# Final Publish Source of Truth

## Only approved candidate source to use if explicit approval is given later

### Package
- `umg-envoy-agent`

### Version
- `0.2.9`

### Branch
- `fix/public-envoy-surface-v0.2.9`

### Commit
- `96d954f`

### Artifact filename
- `umg-envoy-agent-0.2.9.tgz`

### Artifact path
- `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.2.8\umg-envoy-agent-0.2.9.tgz`

### SHA-256
- `389417497433B3A71B09BFD528ACCE3A453CEE98488DDD1D7A74CB7A7A78AEBC`

## Non-source artifacts that must not be used for publish
- `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.2.8\umg-envoy-agent-0.2.8.tgz`
- any extracted `_inspect_*` package folders
- `C:\.openclaw\workspace\tmp-umg-envoy-consumer-audit`
- installed copy under `tmp-umg-envoy-consumer-audit\node_modules\umg-envoy-agent`
- any future auto-generated tarball with a different hash unless the approval gate is intentionally refreshed again

## Branch/path rule
Any future upload/publish command must reference the exact artifact path above, from the exact branch above, using the exact hash above.

## Final reminder
Do not infer source-of-truth status from folder name alone.
Use the exact artifact path + hash pair.
