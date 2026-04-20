# Two-Plugin Boundary Map

Generated: 2026-04-20

## Decision

The canonical internal plugin is:
- `umg-envoy-agent`
- rooted at `C:\.openclaw\workspace\artifacts\umg-envoy-agent-plugin`

The later public derivative plugin is:
- `umg-envoy-agent-public-block-library`
- currently worked in `C:\.openclaw\workspace\repair-lanes\umg-envoy-agent-public-v0-rc1`

## Authoritative roles

### Plugin A — Canonical internal plugin
**ID:** `umg-envoy-agent`

**Primary role:**
- bridge the canonical UMG compiler to the local `UMG_Envoy_Resleever` runtime/content tree
- provide the internal authoring/runtime lane
- serve as the true source of functionality first

**Default content root:**
- `vendor/UMG_Envoy_Resleever`

**Primary job:**
- read/write active resleever runtime state
- compile sleeves against the internal resleever lane
- support authoring and promotion flows

### Plugin B — Public derivative plugin
**ID:** `umg-envoy-agent-public-block-library`

**Primary role:**
- provide a public-facing sibling package wired to the bundled `UMG-Block-Library`
- support inspection/review and a narrower public-safe workflow
- become a later ClawHub/public distribution target

**Default content root:**
- `vendor/UMG-Block-Library`

**Primary job:**
- expose a public-safe compatibility surface
- support public package smoke testing and review workflows
- avoid private/internal resleever assumptions unless intentionally abstracted

---

## What belongs to the Resleever plugin only

These surfaces are internal-lane responsibilities and should be owned by `umg-envoy-agent`:

- direct default pathing to `vendor/UMG_Envoy_Resleever`
- internal runtime mutation as the canonical working lane
- internal authoring flows that assume the true resleever tree is present
- internal promotion/rollback semantics as the source-of-record runtime lane
- documentation framed around local/internal resleever operations
- any future “real” working version milestone

## What belongs to the public Block Library plugin only

These surfaces are public-lane responsibilities and should be owned by `umg-envoy-agent-public-block-library`:

- default pathing to `vendor/UMG-Block-Library`
- public package docs and review reports
- public compatibility surface packaging
- ClawHub/public upload hygiene
- public-safe content-root assumptions
- public-facing naming and install story

## What is legitimately shared core logic

These code areas are conceptually shared and can remain structurally similar, though not necessarily as one package yet:

- compiler invocation helpers
- runtime output validation logic
- sleeve catalog reading
- compare/list/read helper logic
- promotion preview logic
- backup creation logic
- artifact validation helpers
- TypeBox schema/tool registration patterns

## What is currently ambiguous / mixed

These areas are currently too shared or too lightly separated:

- CLI command identity (`umg-envoy` in both)
- hook identity (same hook names in both)
- tool names (`umg_envoy_*` in both)
- config fallback assumptions copied across lanes
- docs that present sibling behavior without strong lane separation
- identical tool semantics for two different default content roots

---

## Practical lane doctrine

### Resleever plugin doctrine
- this is the canonical plugin
- it should be finalized first
- it should define the authoritative internal runtime workflow
- the workspace should eventually reflect this plugin as the main version

### Public Block Library doctrine
- this is a derivative/public product
- it should be revisited only after the Resleever plugin is fully functional
- it should be re-cloned/reworked from a stable canonical base, not evolved in parallel as a peer authority

---

## Ownership summary

### `umg-envoy-agent`
Owns:
- internal runtime truth
- resleever lane
- canonical compile/promote/rollback behavior
- workspace source-of-record target

### `umg-envoy-agent-public-block-library`
Owns:
- public package identity
- UMG Block Library default content root
- review/public packaging lane
- future ClawHub-facing distribution variant

---

## Final boundary rule

From this point forward:
- **`umg-envoy-agent` is the primary product**
- **`umg-envoy-agent-public-block-library` is a later derivative product**

Do not treat them as co-equal authorities.
