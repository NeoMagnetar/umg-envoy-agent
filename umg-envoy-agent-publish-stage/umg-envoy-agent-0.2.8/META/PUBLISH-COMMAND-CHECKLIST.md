# Publish Command Checklist

Use this checklist only if the user explicitly approves a later publish/upload phase.
This phase does not run these commands.

## Before any publish/upload command
- [ ] Confirm user explicitly approved publish/upload
- [ ] Confirm candidate artifact path is correct
- [ ] Confirm candidate SHA-256 is `016951EBB535CB93032D5BD0979A06227B5AC6DB98EC79D48EAAA40614CEC418`
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
