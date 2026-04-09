# Example Task Patterns

## Open page and verify content

1. Preflight the managed browser target
2. Open or focus the target tab
3. Navigate to the URL
4. Validate the page title or anchor text
5. Stop or continue with the next single action

## Search and summarize

1. Preflight
2. Open the search engine or source page
3. Type the query
4. Submit
5. Validate the result page loaded
6. Open one source
7. Validate source content
8. Summarize

## Login-required flow with explicit user confirmation

1. Preflight
2. Navigate to the application
3. Detect whether auth is already present
4. If auth is missing, stop and ask for user confirmation or user-performed login
5. Resume only after the authenticated state is visible
6. Continue one checked action at a time

## Download and verify

1. Preflight
2. Navigate to the download page
3. Validate the expected file/action target
4. Trigger one download action
5. Confirm the resulting state or file presence if tool support allows
6. Report success or the exact failed phase

## Multi-step website workflow

Break the request into phases:

- phase 1: reach the correct page
- phase 2: verify the target section
- phase 3: perform one mutation
- phase 4: validate the result
- phase 5: continue only if phase 4 passed

Never compress the whole workflow into one speculative action chain.