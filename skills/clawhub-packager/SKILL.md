---
name: clawhub-packager
description: Package a stability-first OpenClaw browser skill that standardizes browser work onto the OpenClaw-managed browser profile with mandatory preflight, single-action execution, validation, bounded recovery, and clear failure reporting.
user-invocable: true
command-dispatch: browser-skill
---

# clawhub-packager

Package browser-operation skills for OpenClaw as narrow, auditable skill folders rather than broad "browse however you want" helpers.

## Use this skill when

- the user wants to create, package, tidy, or publish a browser-focused OpenClaw skill
- the goal is reliability and repeatability, not "make the model better at clicking websites"
- the skill should constrain browser behavior onto a stable operating lane
- the skill should target the built-in OpenClaw-managed browser profile rather than personal Chrome sessions

## Core framing

This skill treats browser automation as an **operations layer**, not a freeform browsing style.

The public, stability-first default contract is:

- agent work happens only in the **OpenClaw-managed browser profile**
- browser work is controlled through the built-in **browser** tool
- the dashboard/control UI is the **control surface**
- the managed browser is the **work surface**
- each run starts with **preflight**
- each mutation is followed by **validation**
- recovery is **bounded and explicit**

For v1 packaging, do **not** design around:

- `profile="user"`
- attach-only remote CDP flows
- informal reuse of whatever browser happens to be open
- giant speculative action chains

Those can exist as advanced/operator-only variants later, but they are the wrong default for a public stability-first skill.

## Packaging target

Create a normal OpenClaw skill folder in the workspace with:

- `SKILL.md`
- `RUNBOOK.md`
- `SAFETY.md`
- optional examples such as `PATTERNS.md`

Keep frontmatter simple and single-line where practical.

## What the packaged skill must solve

1. **Profile ambiguity**  
   Choose one canonical profile: the OpenClaw-managed browser profile. Do not default to `user`.

2. **Lifecycle fragility**  
   Require preflight every run. If startup/preflight fails, recover before attempting page actions.

3. **Action ambiguity**  
   Normalize tasks into navigate → verify → act → verify.

4. **Recovery ambiguity**  
   Define the first one or two recovery moves for common failures.

5. **Session contamination**  
   Forbid personal browsing/session assumptions in the shared/public skill.

6. **Prompt sprawl**  
   Instruct the agent to decompose long goals into small checked phases.

## Required operating contract for the packaged browser skill

Every browser run should follow this sequence:

1. **Preflight**
   - verify browser tool availability
   - ensure the OpenClaw-managed browser is available
   - inspect tabs and reacquire or open the target tab
   - verify page readiness before interaction

2. **Execution**
   - perform one bounded navigation or one bounded UI mutation

3. **Validation**
   - verify title, visible text, element presence, or other clear page outcome

4. **Recovery**
   - retry once with a reasoned recovery step
   - if still broken, stop and report the exact failed phase

5. **Escalation**
   - if auth, captcha, permission prompts, or similar boundaries appear, stop improvising and surface the boundary to the user

## Failure reporting discipline

The packaged skill should teach the agent to report failures by phase:

- startup
- navigation
- element acquisition
- action
- validation

Avoid vague failure summaries like "the browser seems weird." Prefer exact phase language.

## Scope boundaries for v1

Do not include in v1:

- giant selector heuristics
- browser hacks or unofficial attachments
- promises about captchas or anti-bot flows
- dependence on memory-search availability
- support for personal Chrome session attachment as a default path

Version `0.1.0` should be documentation-only behavior shaping.

## Recommended naming

Prefer names like:

- `stable-browser-lane`
- `browser-stability-operator`

Avoid names that imply unconstrained browser control.

## Deliverable expectations

When asked to build the package:

1. create the skill folder under `workspace/skills/...`
2. write the core docs cleanly
3. keep wording narrow and public-safe
4. if asked, prepare it for ClawHub publish using the normal skill-folder format
5. if publishing, use the ClawHub CLI with explicit slug/name/version/changelog

## Suggested documentation structure

### `SKILL.md`
- frontmatter
- activation and scope
- stable browser contract
- default profile and lifecycle rules
- failure handling rules

### `RUNBOOK.md`
- startup/preflight
- standard execution loop
- validation rules
- first-line recovery moves
- stop/escalate conditions

### `SAFETY.md`
- no personal browser/profile
- no credentials in prompts
- no hidden secret extraction
- no unsafe persistence assumptions
- no sensitive-account expectations in the automation profile

### `PATTERNS.md` (optional)
- open page and verify content
- search and summarize
- authenticated flow with explicit user confirmation
- download and verify save/result

## Authoring guidance

Be boring on purpose. Favor a narrow, reliable public contract over breadth.

The goal is not magical browser intelligence. The goal is one stable browsing lane.