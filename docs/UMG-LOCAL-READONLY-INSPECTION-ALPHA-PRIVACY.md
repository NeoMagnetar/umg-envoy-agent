# UMG Local Read-Only Inspection Alpha Privacy

## Status
Design gate only.

## Sensitive Filename Policy
For alpha v0, sensitive-pattern filenames should be skipped or redacted by filename/path pattern only.

Recommended patterns to flag:
- `.env`
- `*.pem`
- `*.key`
- `id_rsa`
- `credentials`
- `secrets`
- `token`
- `password`

Recommended alpha behavior:
- do not inspect file contents to determine sensitivity
- detect only by filename/path pattern
- either omit the item or include a skipped metadata row with `skipped_reason`

## Username / Home Path Rule
Do not expose usernames unnecessarily.

Prefer:
- relative path from approved root
- redacted absolute root display

Avoid:
- full home-profile path output
- private app/config paths
- credential store paths

## Hidden / System Path Rule
Hidden and system paths are blocked by default.

They should not appear unless a future stricter policy explicitly allows them.

## Support Doc Rule
Support docs may explain policy, but they cannot authorize local file access.

## Design Boundary
This phase defines privacy and redaction policy only.
