# UMG Envoy Agent v0.2.10 Release Notes

UMG Envoy Agent v0.2.10 is a packaging hygiene release.

## What changed

This release preserves the corrected public-safe plugin code from `v0.2.9` while cleaning the published package contents so the public artifact no longer includes accidental audit byproducts, duplicate package tarballs, or release/audit working files.

Packaging corrections include:
- explicit package file allowlist for the public artifact
- exclusion of local audit folders and staging byproducts from packed output
- preservation of the corrected bundled-adapter/public-safe surface from `v0.2.9`

## What did not change

This release does not:
- reintroduce public bridge-execution tools
- widen runtime behavior
- delete preserved dev/local bridge source
- touch Desktop Bridge or PhaseBridge work

## Release intent

This is a clean ClawPack/public-artifact hygiene release intended to keep the published package aligned with its actual public-safe purpose.
