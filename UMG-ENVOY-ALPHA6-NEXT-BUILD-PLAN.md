# UMG Envoy Alpha6 Next Build Plan

## Goal
Stabilize the current recovered alpha6 runtime into one intentional product line.

## Current Truth
The currently loaded runtime is the compiler-backed surface from:
- `~\.openclaw\extensions\umg-envoy-agent\dist\plugin-entry.js`

But the installed manifest metadata still describes the public alpha6 tool family.

That means the immediate next build goal is not "add more features" first.
It is:
- unify runtime truth
- unify manifest truth
- unify package truth

## Recommended Build Sequence

### Step 1 — Declare one alpha6 runtime truth
Choose one of these explicitly:
- **Option A:** compiler-backed `plugin-entry.js` becomes official alpha6 runtime
- **Option B:** public-safe `plugin-entry-public.js` is rebuilt and restored as official alpha6 runtime

Recommendation: **Option A** for local development continuity, because it is the currently loaded, verified, read-only live surface.

### Step 2 — Align manifests and package metadata
If Option A is chosen:
- update `openclaw.plugin.json` tool declarations to match the compiler-backed live tool list
- update package description/README text so it no longer claims a different active surface
- ensure `package.json` OpenClaw extension metadata points only to the actual runtime truth

### Step 3 — Recreate explicit contract docs
Write one authoritative tool-surface contract for alpha6 covering:
- tool names
- required parameters
- readonly vs side-effect status
- content sources
- compile semantics
- expected RuntimeSpec-like output contract

### Step 4 — Add parser contract examples
The path parser tools failed on a naive freeform string because they require a stricter path syntax.
Add:
- one valid minimal path fixture
- one invalid path fixture
- one validation/readme note documenting the exact grammar

### Step 5 — Expand from compiler-backed bundled content to resolver-backed content
Only after the runtime/manifest truth is aligned:
- add the real block-library resolver intentionally
- keep it read-only first
- verify source boundaries before any broader activation work

## Immediate Deliverables
1. manifest/runtime alignment patch
2. minimal valid-path fixture docs
3. alpha6 tool-surface contract doc
4. follow-up resolver design note

## Non-Goals Right Now
- publishing to ClawHub
- forcing alpha5 back into place
- broad repository cleanup
- mixing backup artifacts into runtime source
- touching unrelated OpenClaw doctor warnings

## Exit Criteria For This Build Step
Alpha6 can be considered stabilized for the next step when:
- plugin metadata matches the live loaded runtime surface
- safe tool probes pass with known-good fixtures
- one authoritative alpha6 contract doc exists
- no ambiguity remains about which entrypoint is the product truth
