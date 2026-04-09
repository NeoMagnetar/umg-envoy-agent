# Browser Stability Runbook

## Purpose

This runbook defines the stable operating sequence for browser work performed through the packaged skill.

The target is the **OpenClaw-managed browser** used as a dedicated work browser.

## Conceptual model

- **Dashboard / Control UI** = controller
- **Managed browser profile** = worker

Do not conflate the two.

## Standard run sequence

### 1. Preflight

Before any page action:

- confirm the browser tool is responsive
- ensure the managed browser target is running/available
- list or inspect tabs
- reacquire the intended working tab or open a new one if needed
- inspect page state before interacting

If preflight fails, recover first.

### 2. Execute one bounded action

Perform exactly one of the following:

- open or navigate to a page
- click one specific target
- fill one form field or one grouped set of fields
- submit one form
- press one key action

Avoid stacking speculative actions.

### 3. Validate

After every mutation, verify the result using one or more of:

- page title
- visible text
- expected element presence
- URL/state change
- download or output confirmation

### 4. Recover once

If validation fails, use one bounded recovery step:

- reload or reopen once
- reacquire tab and focus it
- resnapshot the page and retry the exact target once

Do not thrash.

### 5. Escalate

Stop and report if you hit:

- login/auth boundaries
- captcha or anti-bot flows
- browser permission prompts that require user intent
- repeated unexpected DOM/state drift after one recovery

## Failure phase reporting

Always report the failing phase explicitly:

- startup
- navigation
- element acquisition
- action
- validation

Example:

> Failed in validation: the click completed, but the expected destination text did not appear after one reload-based recovery.

## Tab policy

- reuse the current work tab when continuing the same workflow
- open a fresh work tab when starting an unrelated task
- do not switch browser modes mid-run

## Recovery examples

### Profile unavailable
- restart or reopen the managed browser target
- recheck browser availability before navigating

### Tab disappeared
- list tabs
- reacquire by URL/title
- focus the tab or open a replacement tab

### Page incomplete or stale
- reload once
- snapshot again
- verify target text/element before acting

### Missing auth
- stop and tell the user auth is absent
- do not click around trying random entry points

## Non-goals

This runbook does not try to solve every website.

It exists to reduce ambiguity and force deterministic, inspectable browser behavior.