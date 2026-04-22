# AIM / NEED / USE Additions

Generated: 2026-04-20

The public HUMAN block lane now includes natural-language companion notes for three newly added machine-facing MOLT subject libraries:

- AIM
- NEED
- USE

## Why these were added
These libraries existed as structured JSON payloads sourced from the private Resleever lane, but the public HUMAN side did not yet explain them in a clean natural-language form.

## What was added
### Structured JSON in the public machine-facing block lane
- `blocks/molt/subjects/aim.library.v1.0.0.json`
- `blocks/molt/subjects/need.library.v1.0.0.json`
- `blocks/molt/subjects/use.library.v1.0.0.json`

### HUMAN-facing natural-language companions
- `HUMAN/MOLT-BLOCKS/aim/AIM-LIBRARY-v1.0.0.md`
- `HUMAN/MOLT-BLOCKS/need/NEED-LIBRARY-v1.0.0.md`
- `HUMAN/MOLT-BLOCKS/use/USE-LIBRARY-v1.0.0.md`

## Intent
This keeps the public HUMAN side closer to the cleaner explanatory style shown in the private source materials: machine JSON stays structured, but humans also get category-level natural-language explanation.
