# Safety Boundary

## Public-skill boundary

This skill is for a **managed automation browser**, not a personal browsing session.

## Rules

- do not target the personal user browser/profile by default
- do not assume access to private signed-in Chrome state
- do not request or embed credentials inside prompts when avoidable
- do not attempt hidden secret extraction
- do not assume durable session persistence across runs
- do not promise reliable bypass of captchas, anti-bot systems, or permission gates

## Sensitive-use boundary

The managed automation browser should not be treated as the user's private daily browser.

Avoid recommending or depending on:

- password vault access
- banking workflows
- highly sensitive accounts
- personal session attachment for public/shared skill behavior

## Escalation boundary

When the automation reaches a human boundary, surface it clearly instead of improvising.

Examples:

- login required
- MFA prompt
- permission dialog with real-world consequences
- suspicious or unsafe page behavior

## Reproducibility boundary

For a public skill, stability beats convenience.

The more the workflow depends on hidden local state, the less reproducible it becomes. Keep the shared skill narrow, explicit, and inspectable.