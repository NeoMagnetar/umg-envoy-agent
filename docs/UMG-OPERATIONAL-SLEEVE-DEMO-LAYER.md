# UMG Operational Sleeve Demo Layer

This layer makes selected UMG sleeves demo-ready without broad live execution.

## Demo-ready sleeves
- `SL.UMG.LIBRARY_RESEARCH_DEMO.v0.1`
- `SL.UMG.LOCAL_READONLY_WORKSPACE_DEMO.v0.1`
- `SL.UMG.LANGCHAIN_BRIDGE_DEMO.v0.1`

## Safety model
Operational sleeve demo does not mean unrestricted sleeve execution.
It means allowlisted sleeve demo paths with explicit runtime display and governance boundaries.

## Modes
- `demo_metadata`
- `demo_plan_only`
- `demo_handoff_only`
- `demo_local_readonly`

## LangChain bridge rule
The LangChain bridge demo is handoff-only / HITL-preview only in this pass.
It does not start LangChain agent mode.
