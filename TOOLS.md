# TOOLS.md - Local Notes

Skills define how tools work. This file stores environment-specific notes that are unique to this setup.

Use it as a practical cheat sheet for:
- local paths
- device names
- aliases
- environment-specific conventions
- operational notes that should not live inside shared skills

## Local Environment Notes

Add setup-specific notes here when useful, for example:
- camera names and locations
- SSH hosts and aliases
- preferred TTS voices
- browser profiles
- device nicknames
- recurring local project paths

Keep this file concrete and operational.

## NeoUO / ServUO Dev Lane Notes

- Validation milestone recorded: `C:\.openclaw\workspace\DEV-LANE-VALIDATION-2026-04-11.md`
- Dev shard root: `C:\UO\Server\Neo Ultima Online\NeoUO-Dev`
- Dev shard config file for client data path: `C:\UO\Server\Neo Ultima Online\NeoUO-Dev\Config\DataPath.cfg`
- Dev shard runtime lane: `C:\UO\Client\UOFiles-Test`
- Shared/default lane: `C:\UO\Client\UOFiles`
- Reserved editor/tools lane: `C:\UO\Client\UOFiles-Editor`
- Dev listener: `127.0.0.1:2594`

## Razor / Outlands Local Working Paths

### Primary Razor profile workspace
- `C:\OpenClawWorkspace\Outlands\live-profiles\UMG ENVOY AGENT.xml`

### Draft profile
- `C:\OpenClawWorkspace\Outlands\drafts\UMG ENVOY AGENT-working.xml`

### Backups
- `C:\OpenClawWorkspace\Outlands\backups\`

## Razor / Assistant Working Directories

### Workspace-backed profile directory
- `C:\OpenClawWorkspace\Outlands\live-profiles`

### Workspace-backed macros directory
- `C:\OpenClawWorkspace\Outlands\assistant\macros`

### Drafts
- `C:\OpenClawWorkspace\Outlands\drafts`

### Audit / inspection outputs
- `C:\OpenClawWorkspace\Outlands\audit`

## Live Paths Used By The App

These may resolve through junctions into writable workspace paths:

### Live Assistant Profiles
- `C:\Program Files (x86)\Ultima Online Outlands\ClassicUO\Data\Plugins\Assistant\Profiles`

### Live Assistant Macros
- `C:\Program Files (x86)\Ultima Online Outlands\ClassicUO\Data\Plugins\Assistant\Macros`

### Live Assistant Scripts
- `C:\Program Files (x86)\Ultima Online Outlands\ClassicUO\Data\Plugins\Assistant\Scripts`

## Current Mutable Assistant Surfaces

These are the main Assistant surfaces that matter for local agent work:
- Profiles
- Macros
- Scripts

## Working Conventions

For Razor / Outlands edits:
1. inspect first
2. back up before risky changes
3. prefer draft-first when uncertainty is high
4. patch narrowly
5. report exact file paths and changed lines

For macro work:
- macro bodies live as separate `.macro` files
- profile hotkeys reference them with `Play: ...` entries

## Notes

Add future local notes here as the setup grows:
- GitHub local clone paths
- UMG repo paths
- browser profile details
- tool-specific local aliases
- agent work surfaces

## Razor Schema Pack

Local legend:
- `C:\OpenClawWorkspace\Outlands\razor-spec\legend.md`

Macro exemplars:
- `C:\OpenClawWorkspace\Outlands\razor-spec\examples\macros`

Profile exemplars:
- `C:\OpenClawWorkspace\Outlands\razor-spec\examples\profiles`

Script exemplars:
- `C:\OpenClawWorkspace\Outlands\razor-spec\examples\scripts`

Use this schema pack before attempting Razor profile, macro, or script edits.

### Razor Macro Semantics

- `!Loop` at the top of a `.macro` file means the macro repeats
- omit `!Loop` for one-shot actions
- use `!Loop` only for deliberate repeat behavior