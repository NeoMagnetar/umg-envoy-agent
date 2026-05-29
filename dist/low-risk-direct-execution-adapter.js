import { createBlockedUnknownToolGate, createProposedActionGate, createToolResultAuditDraft, evaluateLowRiskDirectEligibility, } from "./action-gate-types.js";
import { resolveEnvoySeededToolCapability } from "./tool-capability-registry-seed.js";
import { statusPayload, createRuntimeReportToolSurface } from "./plugin-entry.js";
import { validateRuntimeOutput } from "./compiler/runtime-validator.js";
import { parseUMGPath } from "./umg-path-parser.js";
import { validateUMGPath } from "./umg-path-validator.js";
import { renderUMGPath } from "./umg-path-renderer.js";
export const LOW_RISK_DIRECT_TOOL_IDS = [
    "umg_envoy_status",
    "umg_envoy_validate_runtime_output",
    "umg_envoy_parse_path",
    "umg_envoy_validate_path",
    "umg_envoy_render_path",
    "umg_envoy_action_gate_runtime_report_view",
];
function summarizeInput(input) {
    try {
        return JSON.stringify(input ?? {});
    }
    catch {
        return "{}";
    }
}
function summarizeOutput(output) {
    if (typeof output === "string")
        return output;
    try {
        return JSON.stringify(output);
    }
    catch {
        return String(output);
    }
}
const LOW_RISK_DIRECT_HANDLER_MAP = {
    umg_envoy_status: () => statusPayload(),
    umg_envoy_validate_runtime_output: (input) => validateRuntimeOutput(input?.runtimeOutput),
    umg_envoy_parse_path: (input) => parseUMGPath(String(input?.source ?? "")),
    umg_envoy_validate_path: (input) => {
        const issues = validateUMGPath(parseUMGPath(String(input?.source ?? "")));
        return { ok: issues.every((issue) => issue.severity !== "error"), issues };
    },
    umg_envoy_render_path: (input) => renderUMGPath(parseUMGPath(String(input?.source ?? ""))),
    umg_envoy_action_gate_runtime_report_view: (input) => createRuntimeReportToolSurface({
        toolId: String(input?.toolId ?? "umg_envoy_status"),
        toolName: typeof input?.toolName === "string" ? input.toolName : undefined,
        mode: input?.mode === "full" || input?.mode === "compact" || input?.mode === "public_redacted"
            ? input.mode
            : "compact",
    }),
};
function createActionGateForRequest(request) {
    const capability = resolveEnvoySeededToolCapability(request.toolId);
    if (!capability) {
        return createBlockedUnknownToolGate({
            actionId: request.actionId ?? `low-risk-direct:${request.toolId}`,
            proposedToolName: request.toolName ?? request.toolId,
            proposedToolId: request.toolId,
            actionKind: "low_risk_direct_execution",
            sourceRuntimeSpecBoundaryStatus: request.sourceRuntimeSpecBoundaryStatus ?? "valid_non_executing_artifact",
            sourceRuntimeSpecNonExecuting: request.sourceRuntimeSpecNonExecuting ?? true,
            sourceTraceBoundaryStatus: request.sourceTraceBoundaryStatus ?? "valid_audit_artifact",
            sourceTraceAuditOnly: request.sourceTraceAuditOnly ?? true,
        });
    }
    return createProposedActionGate({
        actionId: request.actionId ?? `low-risk-direct:${request.toolId}`,
        proposedToolName: request.toolName ?? capability.toolName,
        proposedToolId: request.toolId,
        actionKind: "low_risk_direct_execution",
        riskClass: capability.allowedRiskClass,
        sourceRuntimeSpecBoundaryStatus: request.sourceRuntimeSpecBoundaryStatus ?? "valid_non_executing_artifact",
        sourceRuntimeSpecNonExecuting: request.sourceRuntimeSpecNonExecuting ?? true,
        sourceTraceBoundaryStatus: request.sourceTraceBoundaryStatus ?? "valid_audit_artifact",
        sourceTraceAuditOnly: request.sourceTraceAuditOnly ?? true,
    });
}
export function executeLowRiskDirectTool(request) {
    const capability = resolveEnvoySeededToolCapability(request.toolId);
    const actionGate = createActionGateForRequest(request);
    const blockedDraft = (status, outputSummary, warnings = [], errors = []) => ({
        ok: false,
        status,
        blocked: true,
        output: null,
        toolResult: createToolResultAuditDraft({
            actionGate,
            capability,
            executionStatus: status,
            inputSummary: summarizeInput(request.input),
            outputSummary,
            warnings,
            errors,
        }),
    });
    if (!LOW_RISK_DIRECT_TOOL_IDS.includes(request.toolId)) {
        return blockedDraft("execution_blocked", "Tool is not in the static low-risk direct adapter map.", [], ["tool_not_in_static_low_risk_direct_set"]);
    }
    if (request.toolId === "umg_envoy_load_sleeve") {
        return blockedDraft("execution_blocked", "umg_envoy_load_sleeve is intentionally excluded from the first low-risk direct adapter set.", [], ["load_sleeve_excluded"]);
    }
    if (!capability) {
        return blockedDraft("execution_blocked", "Unknown tool cannot run through the low-risk direct adapter.", [], ["unknown_tool"]);
    }
    if (capability.allowedRiskClass === "blocked" || capability.allowedRiskClass === "dry_run_only" || capability.allowedRiskClass === "preview_only" || capability.allowedRiskClass === "approval_gated_write" || capability.allowedRiskClass === "destructive_or_sensitive" || capability.allowedRiskClass === "external_transmission") {
        return blockedDraft("execution_blocked", "Capability risk class is not eligible for low-risk direct execution.", [], ["risk_class_not_eligible"]);
    }
    if (capability.directExecutionAllowed !== true || capability.approvalRequired || capability.previewRequired || capability.dryRunRequired || capability.externalTransmissionAllowed || capability.backupRequired || capability.rollbackSupported) {
        return blockedDraft("execution_blocked", "Capability policy does not satisfy low-risk direct adapter requirements.", [], ["capability_policy_not_eligible"]);
    }
    const lowRiskDecision = evaluateLowRiskDirectEligibility(actionGate, {
        ...capability,
        allowlistTags: ["low-risk-direct"],
    });
    if (!lowRiskDecision.eligible) {
        return blockedDraft("execution_denied", lowRiskDecision.reason, lowRiskDecision.notes, [lowRiskDecision.reasonCode]);
    }
    const handler = LOW_RISK_DIRECT_HANDLER_MAP[request.toolId];
    if (!handler) {
        return blockedDraft("execution_blocked", "No static handler is registered for this low-risk direct tool.", [], ["missing_static_handler"]);
    }
    const startedAt = new Date().toISOString();
    try {
        const output = handler(request.input);
        const finishedAt = new Date().toISOString();
        const toolResult = createToolResultAuditDraft({
            actionGate,
            capability,
            executionStatus: "executed_success",
            inputSummary: summarizeInput(request.input),
            outputSummary: summarizeOutput(output),
        });
        toolResult.startedAt = startedAt;
        toolResult.finishedAt = finishedAt;
        return {
            ok: true,
            status: "executed_success",
            blocked: false,
            output,
            toolResult,
        };
    }
    catch (error) {
        const finishedAt = new Date().toISOString();
        const message = error instanceof Error ? error.message : String(error);
        const toolResult = createToolResultAuditDraft({
            actionGate,
            capability,
            executionStatus: "executed_failure",
            inputSummary: summarizeInput(request.input),
            outputSummary: message,
            errors: [message],
        });
        toolResult.startedAt = startedAt;
        toolResult.finishedAt = finishedAt;
        return {
            ok: false,
            status: "executed_failure",
            blocked: false,
            output: null,
            toolResult,
        };
    }
}
