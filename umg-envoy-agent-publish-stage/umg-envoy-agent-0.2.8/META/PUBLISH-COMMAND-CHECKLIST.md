# Publish Command Checklist

Use this checklist only if the user explicitly approves a later publish/upload phase.
This phase does not run these commands.

## Before any publish/upload command
- [ ] Confirm user explicitly approved publish/upload
- [ ] Confirm candidate artifact path is correct
- [ ] Confirm candidate SHA-256 is `389417497433B3A71B09BFD528ACCE3A453CEE98488DDD1D7A74CB7A7A78AEBC`
- [ ] Confirm branch is `fix/public-envoy-surface-v0.2.9`
- [ ] Confirm no-publish hold is being intentionally lifted by user approval only

## Publish/upload execution expectations
- [ ] Run only the intended upload/publish command(s)
- [ ] Capture exact command output
- [ ] Record any upload artifact URL, package ID, or confirmation ID
- [ ] Do not tag a release unless separately authorized

## Immediately after publish/upload
- [ ] Record whether upload succeeded or failed
- [ ] Capture any ClawHub response or panel evidence
- [ ] Start post-upload scan/reputation follow-up

## Final reminder
Passing this checklist still does not replace post-upload evidence review.
