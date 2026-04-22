# UMG Envoy Agent (Public Block Library Variant)

## What this is

This is the public-facing review/package variant of the UMG Envoy Agent plugin.

It mirrors the same general architecture as the private lane:
- sleeves
- NeoStacks
- NeoBlocks
- MOLT blocks
- authored resolver rules
- traceable runtime activation

But it is wired to the public UMG Block Library as its preferred content source.

## What it is not

This is not the full private proprietary runtime lane.
It intentionally excludes:
- private sleeves not approved for release
- private runtime traces
- active runtime state
- proprietary-only content
- unready experimental content

## Source relationship

Private lane:
- active source-of-truth runtime plugin
- Resleever-backed

Public lane:
- release-safe mirror using the public UMG Block Library
- intended for review, demonstration, and public-facing packaging

## Current purpose

This package is the current public-safe plugin review build.
It exists so the public lane can be reviewed as a real plugin sibling rather than as a detached or decorative repo.
