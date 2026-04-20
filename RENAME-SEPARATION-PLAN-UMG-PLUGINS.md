# Rename / Separation Plan — UMG Envoy Plugin Family

Generated: 2026-04-20

## Strategy

Do **not** continue evolving both plugins as co-equal products.

### Canonical path
1. finalize `umg-envoy-agent` as the real Resleever/internal plugin
2. update the workspace to reflect that finalized version
3. only then create a fresh public derivative from the stabilized internal base

---

## Part 1 — What stays in the canonical Resleever plugin

Plugin:
- `umg-envoy-agent`

Keep as canonical:
- plugin id `umg-envoy-agent`
- internal default content root `vendor/UMG_Envoy_Resleever`
- existing internal tool family `umg_envoy_*`
- existing internal CLI root `umg-envoy`
- existing internal hook surfaces (subject to cleanup only inside the internal lane)
- compile/promote/rollback behavior as the first fully working version target
- internal authoring/scaffold operations

Rationale:
- this is the real internal lane
- this is the plugin you said should become fully functional first
- it should become the workspace source-of-record target

---

## Part 2 — What should happen to the current public package now

Plugin:
- `umg-envoy-agent-public-block-library`

Immediate rule:
- freeze it as a reference/review lane
- do not treat it as the canonical implementation target anymore

Allowed now:
- keep current repair-lane notes and reports
- use it as evidence of what was learned
- stop using it as the primary design authority

Do **not** do now:
- continue deep parallel productization
- keep patching public identity while the canonical internal plugin is still unfinished

---

## Part 3 — What must be separated later in the public derivative rebuild

When the public plugin is rebuilt from the finalized internal plugin, change these deliberately:

### 1. Plugin identity
Current public id:
- `umg-envoy-agent-public-block-library`

Keep or refine that, but ensure it is unmistakably public-lane specific.

### 2. CLI identity
Current collision:
- both use `umg-envoy`

Future public CLI should become lane-specific, for example one of:
- `umg-envoy-blocklib`
- `umg-blocklib-envoy`
- `umg-envoy-public`

Recommendation:
- internal plugin keeps `umg-envoy`
- public derivative gets a new explicit CLI root

### 3. Hook identity
Current collision:
- shared hook names

Future public hook names must encode the lane, e.g.:
- `umg-blocklib-before-prompt-build-triggers`
- `umg-blocklib-message-sending-exact-response`

Recommendation:
- internal plugin keeps the existing hook lineage unless later renamed for clarity
- public derivative gets distinct hook names

### 4. Tool identity
Current collision:
- both export the same `umg_envoy_*` tool names

Future public derivative options:
- rename to `umg_blocklib_*`
- or expose a reduced public-safe tool set under distinct names

Recommendation:
- internal plugin keeps `umg_envoy_*`
- public derivative gets lane-specific tool namespace

### 5. Config wording
Future public plugin config should avoid misleading internal terminology.

Specifically:
- replace ambiguous `resleeverRoot` wording with something like `contentRoot` or `blockLibraryRoot` if appropriate
- keep `compilerRoot` only if truly applicable
- document public-safe defaults clearly

### 6. Path doctrine
Future public plugin should not keep fallback logic that silently re-enters the private internal resleever lane.

Recommendation:
- public derivative pathing should resolve only against its intended public content root unless an intentional override is passed

---

## Part 4 — Shared-core policy

Some logic may eventually become shared in a common internal module, but **not now** if that slows down the canonical plugin finish.

### Safe-to-share conceptually later
- compiler invocation helpers
- runtime output validation helpers
- backup generation helpers
- sleeve catalog readers
- compare/list helper logic

### Keep lane-specific
- plugin id and metadata
- CLI root
- hook names
- tool names
- default content-root doctrine
- docs and packaging

Recommendation now:
- do not introduce a new shared package yet
- finish the internal plugin first
- extract shared code only after the internal plugin is stable

---

## Part 5 — Execution sequence

### Sequence 1 — now
- produce boundary/collision/separation planning artifacts
- lock canonical authority to `umg-envoy-agent`

### Sequence 2 — next
- identify source-of-record for `umg-envoy-agent`
- audit and stabilize the internal plugin
- get compile/promote/rollback fully functional
- make workspace reflect that finished version

### Sequence 3 — later
- clone a fresh public derivative from the stabilized internal plugin
- rename/public-clean all colliding surfaces
- repoint doctrine to UMG Block Library
- package for ClawHub/public use

---

## Concrete rename recommendations

### Internal canonical plugin
- plugin id: `umg-envoy-agent` (keep)
- CLI root: `umg-envoy` (keep)
- tool prefix: `umg_envoy_` (keep)
- content root naming: `resleeverRoot` (keep, internal lane)

### Future public derivative plugin
- plugin id: keep `umg-envoy-agent-public-block-library` or shorten only if clarity improves
- CLI root: change from `umg-envoy` to a public-specific root
- tool prefix: change from `umg_envoy_` to a public-specific namespace
- config field: consider replacing `resleeverRoot` with `contentRoot` / `blockLibraryRoot`

---

## Final rule

Until the internal plugin is finished:
- **all serious functional work goes into `umg-envoy-agent`**
- the public package is a later derivative and should not be allowed to define the architecture
