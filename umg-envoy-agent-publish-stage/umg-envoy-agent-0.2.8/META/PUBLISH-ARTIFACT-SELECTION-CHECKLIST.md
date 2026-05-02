# Publish Artifact Selection Checklist

Use this checklist before any later explicitly approved upload/publish step.

## Exact artifact selection
- [ ] Use `umg-envoy-agent-0.2.9.tgz`
- [ ] Use artifact path `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.2.8\umg-envoy-agent-0.2.9.tgz`
- [ ] Confirm SHA-256 `389417497433B3A71B09BFD528ACCE3A453CEE98488DDD1D7A74CB7A7A78AEBC`
- [ ] Confirm branch `fix/public-envoy-surface-v0.2.9`
- [ ] Confirm commit `96d954f` or a later explicitly reviewed successor on the same branch

## Do not use
- [ ] do not use `umg-envoy-agent-0.2.8.tgz`
- [ ] do not use any extracted `_inspect_*` folder as publish source
- [ ] do not use the temp consumer audit project as publish source
- [ ] do not use the installed `node_modules\umg-envoy-agent` copy as publish source
- [ ] do not use any stale approval wording that references the old pre-polish hash

## Final reminder
If artifact path, branch, or hash differ from the values above, stop and refresh the approval gate before any upload/publish attempt.
