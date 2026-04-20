# Collision List — UMG Envoy Resleever vs Public Block Library Plugins

Generated: 2026-04-20

## Summary

The two plugins are currently close enough in identity and surface area that they can collide at runtime and during maintenance.

Plugins:
- Internal/canonical: `umg-envoy-agent`
- Public/derivative: `umg-envoy-agent-public-block-library`

## 1. CLI command collision

### Collision
Both plugins register the same CLI command root:
- `umg-envoy`

### Evidence
In both `src/plugin-entry.ts` files:
- `program.command("umg-envoy")`

### Impact
- both plugins cannot cleanly coexist with distinct CLI ownership
- one plugin can shadow the other
- command behavior can become ambiguous during testing and support

---

## 2. Hook-name collision

### Collision
Both plugins register the same hook surfaces.

### Evidence
Observed runtime diagnostics already reported:
- `hook already registered: umg-experimental-before-prompt-build-triggers (umg-envoy-agent)`
- `hook already registered: umg-experimental-message-sending-exact-response (umg-envoy-agent)`

### Impact
- co-installation produces runtime conflicts
- whichever plugin loads first can block the other
- hook behavior may be attributed to the wrong lane

---

## 3. Tool-name collision

### Collision
Both plugins register the same tool names:
- `umg_envoy_activation_trace`
- `umg_envoy_compiler_smoke_test`
- `umg_envoy_status`
- `umg_envoy_list_sleeves`
- `umg_envoy_read_active_runtime`
- `umg_envoy_compare_sleeves`
- `umg_envoy_list_block_libraries`
- `umg_envoy_compile_sleeve`
- `umg_envoy_validate_runtime_output`
- `umg_envoy_preview_promotion`
- `umg_envoy_promote_runtime`
- `umg_envoy_list_runtime_backups`
- `umg_envoy_rollback_runtime`
- authoring/scaffold tools as well

### Impact
- tool namespace is not lane-specific
- if both are active, the runtime may not have a clean concept of which plugin owns the tool surface
- support/debugging becomes confusing

---

## 4. Shared command semantics with different content roots

### Collision
The two plugins expose the same operations but point at different default content roots.

### Internal default:
- `vendor/UMG_Envoy_Resleever`

### Public default:
- `vendor/UMG-Block-Library`

### Impact
- same command/tool name can imply different underlying data models or expectations
- users can think they are testing “the same thing” when they are not
- failure analysis becomes muddy

---

## 5. Config-shape collision / ambiguity

### Collision
Both plugins expose nearly identical config shapes:
- `workspaceRoot`
- `compilerRoot`
- `resleeverRoot`
- `allowRuntimeWrites`
- `defaultSleeveId`
- `debugDirectReplyBehavior`

### Impact
- operators can assume config semantics are identical when the underlying lane differs
- `resleeverRoot` is especially ambiguous in the public plugin, where it effectively means “content root override” rather than true private resleever root

---

## 6. Fallback config logic collision risk

### Collision
Both plugin lines use near-identical host-config fallback behavior in `plugin-entry.ts`.

### Impact
- copy/paste drift can silently point the wrong plugin at the wrong config entry
- this already happened once via a wrong plugin id fallback key in the public lane

---

## 7. Path doctrine collision

### Collision
The overall path resolver architecture is nearly identical in both plugins, differing mainly in the default content-root candidate.

### Internal lane:
- resolves directly to `UMG_Envoy_Resleever`

### Public lane:
- resolves first to `UMG-Block-Library`, then still includes a fallback to `UMG_Envoy_Resleever`

### Impact
- the public lane is not fully purified from internal assumptions
- fallback behavior increases the chance of accidental cross-lane behavior

---

## 8. Documentation identity collision

### Collision
Both plugins describe themselves as UMG Envoy Agent variants with highly overlapping language.

### Impact
- users/reviewers may treat them as minor packaging differences instead of distinct products
- makes support, release notes, and onboarding harder

---

## 9. Build/package lineage collision

### Collision
The public package is clearly a sibling/clone of the internal plugin rather than a sharply separated product.

### Impact
- bug fixes and identity changes can leak from one lane to the other inconsistently
- maintaining two drifting copies becomes fragile

---

## 10. Install/runtime coexistence collision

### Collision
Both plugins are installable in the same OpenClaw environment.

### Impact
- even when one is disabled, stale expectations about which one owns `umg-envoy` remain easy to trip over
- restarts are required for clean runtime state
- diagnostics can be misleading when old registration state is still in memory

---

## Severity ranking

### High severity
- CLI command collision
- hook collision
- tool-name collision
- install/runtime coexistence collision

### Medium severity
- config ambiguity
- fallback config logic drift
- path doctrine ambiguity

### Medium/low but important
- docs identity overlap
- package lineage confusion

---

## Conclusion

The two plugins are not yet separated enough to be treated as stable coexisting products.

Current safest rule:
- finalize the Resleever/internal plugin first
- treat the public Block Library plugin as a later derivative rebuild
- do not try to evolve them as peer products in parallel
