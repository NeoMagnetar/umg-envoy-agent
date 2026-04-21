# Stage 4b ID Alignment

## Purpose
Provide a narrow, explicit, traceable bridge between current runtime modulation ids and authoritative legend-backed ids.

This layer exists to support runtime planner semantic resolution without pretending runtime modulation ids are themselves canonical truth.

## Rule
Do not use fuzzy aliasing.
Do not silently rewrite ids without trace.
Do not let this alignment layer replace Block Library / Resleever canon.

## Current file
- `config/runtime-legend-alignment.default.json`

## Current behavior
The Stage 4 runtime planner now records alignment trace entries that show:
- emitted runtime id
- resolved authoritative/discovered id
- status
- mapping source

Statuses:
- `authoritative`
- `discovered`
- `unresolved`

## Why this is useful
This lets the planner pipeline pass semantic legend resolution while preserving visibility into the fact that it is crossing a bridge.

It also keeps future decisions open:
- keep the mapping layer as a stable bridge
- or later migrate runtime ids closer to canon once the authoritative manifests are strong enough

## Current caution
This file is a bridge, not the long-term source of truth.
The preferred long-term direction remains cleaner authoritative manifests/catalogs inside the Block Library / Resleever assets themselves.
