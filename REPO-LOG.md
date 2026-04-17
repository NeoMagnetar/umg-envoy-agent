# Repo Log

## 2026-04-17

### UMG Envoy Agent packaging + docs pass
- refreshed `artifacts/umg-envoy-agent-plugin/README.md` for release-facing install/use guidance
- added `artifacts/umg-envoy-agent-plugin/docs/INSTALL.md`
- added `artifacts/umg-envoy-agent-plugin/docs/RELEASE-NOTES-0.1.0.md`
- refreshed `artifacts/umg-envoy-agent-plugin/docs/SETUP-AND-OPERATION.md`
- built packaged release zip:
  - `artifacts/releases/umg-envoy-agent-0.1.0.zip`
- packaging excludes `node_modules/` and preserves a clean plugin folder for handoff/download
