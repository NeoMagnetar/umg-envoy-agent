# Publish Abort / Rollback Checklist

Use this checklist if a later explicitly approved upload/publish attempt is interrupted, fails, or produces immediate evidence concerns.

## Abort triggers
- [ ] user withdraws approval before command execution
- [ ] upload command fails
- [ ] uploaded artifact identity appears inconsistent
- [ ] post-upload evidence immediately shows a new blocking concern
- [ ] wrong artifact/path/hash is about to be used

## Abort actions
- [ ] stop further publish/upload actions
- [ ] record exact failure or concern
- [ ] preserve branch and staged artifact state
- [ ] do not improvise corrective upload attempts without review
- [ ] return to documented review posture

## Rollback posture
- [ ] keep current branch for forensic review if needed
- [ ] preserve staged local candidate
- [ ] preserve no-publish decision discipline unless approval is renewed later
- [ ] do not delete bridge source or broaden scope in response to upload trouble

## Final reminder
Abort/rollback in this lane means stop and review, not panic-publish or panic-delete.
