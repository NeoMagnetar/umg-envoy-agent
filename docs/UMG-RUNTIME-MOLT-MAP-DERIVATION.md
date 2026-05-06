# UMG Runtime MOLT Map Derivation Rules

## Trigger

Priority:
1. RuntimeSpec input/user task
2. selected Trigger MOLT block, if present later
3. trace event that created RuntimeSpec
4. derived default

## Directive

Priority:
1. selected Directive MOLT block
2. active sleeve directive metadata
3. active NeoStack description/capabilities
4. governance/tool-binding intent
5. derived default

## Instruction

Priority:
1. selected Instruction MOLT blocks
2. RuntimeSpec constraints.instructions
3. governance approval/tool policies
4. protected rules
5. derived default

## Subject

Priority:
1. selected Subject MOLT block
2. selected sleeve/NeoStack domain metadata
3. user task classification
4. derived default

## Primary

Priority:
1. selected Primary MOLT block
2. RuntimeSpec input.user_task
3. selected sleeve/NeoStack objective
4. derived default

## Philosophy

Priority:
1. selected Philosophy MOLT block
2. governance default
3. project default: auditability, user control, governed execution
4. n/a

## Blueprint

Priority:
1. selected Blueprint MOLT block
2. RuntimeSpec visibility/output mode
3. response/output formatting layer
4. derived default

## Examples

### Example 1 — LangChain NeoStack Dry-Run

- Trigger: User requested a governed LangChain workflow.
- Directive: Use governed LangChain bridge path without executing tools.
- Instruction: Execution remains dry-run; approval required for langchain.agent_mode.
- Subject: LangChain bridge workflow under UMG/OpenClaw governance.
- Primary: Compile a read-only RuntimeSpec for the requested workflow.
- Philosophy: Preserve user control, traceability, and governed execution boundaries.
- Blueprint: Runtime visibility header / structured dry-run output.

### Example 2 — Assembled Runtime / No Sleeve Found

- Trigger: User requested a file report.
- Directive: Assemble a dry-run runtime because no matching sleeve was found.
- Instruction: Do not execute tools; preserve no matching sleeve warning.
- Subject: One-off file report.
- Primary: Compile an assembled RuntimeSpec.
- Philosophy: Prefer truthful runtime state over pretending a sleeve exists.
- Blueprint: Structured dry-run runtime visibility output.

### Example 3 — Support Artifact Query

- Trigger: User requested an explanation.
- Directive: Attach support artifacts for explanation only.
- Instruction: Do not runtime-select support docs; do not execute tools.
- Subject: Sleeve documentation/explanation.
- Primary: Explain selected support context.
- Philosophy: Preserve separation between human docs and runtime artifacts.
- Blueprint: Explanatory response with support-only context.

## Boundary rules

1. MOLT Map is a declarative runtime projection.
2. MOLT Map is not hidden chain-of-thought.
3. MOLT Map does not execute anything.
4. MOLT Map does not activate sleeves.
5. MOLT Map does not change RuntimeSpec.
6. MOLT Map cannot make support docs runtime-selectable.
7. MOLT Map cannot bypass governance.
8. MOLT Map cannot bypass approval.
9. MOLT Map cannot change MCP or LangChain policy.
10. MOLT Map feeds future visibility/matrix layers only.

## Relationship to Matrix

MOLT Map comes before IR Matrix.

- MOLT Map answers: what cognitive roles are active?
- IR Matrix later answers: how are artifacts connected, routed, enabled, disabled, or blocked?

For this design pass:
- `matrix_available: false`
