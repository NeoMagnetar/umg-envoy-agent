# Post-Publish Scan Checklist

Use this checklist only after an explicitly approved later upload/publish step.

## Post-upload evidence capture
- [ ] Capture upload confirmation
- [ ] Capture ClawHub package URL or panel evidence
- [ ] Capture refreshed ClawHub reputation/verdict
- [ ] Capture any new static analysis verdict
- [ ] Capture any VirusTotal or vendor evidence shown after upload

## Review checks
- [ ] Confirm verdict is no longer stale, or record if it remains stale
- [ ] Confirm no new dangerous-exec static analysis finding reappears, or record if it does
- [ ] Confirm the uploaded artifact identity being reviewed is the intended `0.2.9` candidate
- [ ] Confirm post-upload evidence is attached to the correct package/version

## Decision checks
- [ ] If post-upload evidence is clean, move to post-upload review decision
- [ ] If stale remains, continue deferral/support follow-up
- [ ] If new detections appear, pause and inspect exact behavior

## Final reminder
A successful upload is not the end of review.
Post-upload scan evidence still governs trust decisions.
