export function getRiskClassPolicy(riskClass) {
    switch (riskClass) {
        case "read_only":
            return {
                directExecutionAllowed: true,
                approvalRequired: false,
                previewRequired: false,
                dryRunRequired: false,
                dryRunSupported: false,
                rollbackRequired: false,
                backupRequired: false,
                externalTransmissionAllowed: false,
                requiresToolResultAudit: true,
            };
        case "dry_run_only":
            return {
                directExecutionAllowed: false,
                approvalRequired: false,
                previewRequired: false,
                dryRunRequired: true,
                dryRunSupported: true,
                rollbackRequired: false,
                backupRequired: false,
                externalTransmissionAllowed: false,
                requiresToolResultAudit: true,
            };
        case "preview_only":
            return {
                directExecutionAllowed: false,
                approvalRequired: false,
                previewRequired: true,
                dryRunRequired: false,
                dryRunSupported: true,
                rollbackRequired: false,
                backupRequired: false,
                externalTransmissionAllowed: false,
                requiresToolResultAudit: true,
            };
        case "low_risk_direct":
            return {
                directExecutionAllowed: true,
                approvalRequired: false,
                previewRequired: false,
                dryRunRequired: false,
                dryRunSupported: true,
                rollbackRequired: false,
                backupRequired: false,
                externalTransmissionAllowed: false,
                requiresToolResultAudit: true,
            };
        case "approval_gated_write":
            return {
                directExecutionAllowed: false,
                approvalRequired: true,
                previewRequired: false,
                dryRunRequired: false,
                dryRunSupported: true,
                rollbackRequired: true,
                backupRequired: true,
                externalTransmissionAllowed: false,
                requiresToolResultAudit: true,
            };
        case "destructive_or_sensitive":
            return {
                directExecutionAllowed: false,
                approvalRequired: true,
                previewRequired: true,
                dryRunRequired: true,
                dryRunSupported: true,
                rollbackRequired: true,
                backupRequired: true,
                externalTransmissionAllowed: false,
                requiresToolResultAudit: true,
            };
        case "external_transmission":
            return {
                directExecutionAllowed: false,
                approvalRequired: true,
                previewRequired: true,
                dryRunRequired: false,
                dryRunSupported: true,
                rollbackRequired: false,
                backupRequired: false,
                externalTransmissionAllowed: true,
                requiresToolResultAudit: true,
            };
        case "blocked":
        default:
            return {
                directExecutionAllowed: false,
                approvalRequired: false,
                previewRequired: false,
                dryRunRequired: false,
                dryRunSupported: false,
                rollbackRequired: false,
                backupRequired: false,
                externalTransmissionAllowed: false,
                requiresToolResultAudit: false,
            };
    }
}
export function classifyRiskClassPolicy(riskClass) {
    return getRiskClassPolicy(riskClass);
}
export function createToolCapabilityRegistry(entries) {
    const entriesByToolId = {};
    for (const entry of entries) {
        entriesByToolId[entry.toolId] = entry;
    }
    return { entriesByToolId };
}
export function resolveToolCapability(registry, toolId) {
    return registry.entriesByToolId[toolId] ?? null;
}
export function isToolCapabilityKnown(registry, toolId) {
    return resolveToolCapability(registry, toolId) !== null;
}
export function canToolRunDirectly(capability) {
    return capability?.directExecutionAllowed === true;
}
export function requiresApprovalForCapability(capability) {
    return capability?.approvalRequired === true;
}
export function requiresPreviewForCapability(capability) {
    return capability?.previewRequired === true;
}
export function requiresDryRunForCapability(capability) {
    return capability?.dryRunRequired === true;
}
export function requiresBackupForCapability(capability) {
    return capability?.backupRequired === true;
}
export function canProceedDirectly(actionGate) {
    return actionGate.finalDecision === "allow_direct" && actionGate.gateState === "allowed_direct";
}
export function requiresApproval(actionGate) {
    return actionGate.approvalRequirement.required;
}
export function requiresPreview(actionGate) {
    return actionGate.previewRequirement.required;
}
export function requiresRollback(actionGate) {
    return actionGate.rollbackRequirement.required;
}
export function createBlockedUnknownToolGate(input) {
    const runtimeBoundaryValid = input.sourceRuntimeSpecBoundaryStatus === "valid_non_executing_artifact" && input.sourceRuntimeSpecNonExecuting === true;
    const traceBoundaryValid = input.sourceTraceBoundaryStatus === "valid_audit_artifact" && input.sourceTraceAuditOnly === true;
    return {
        actionId: input.actionId,
        sourceRuntimeSpecBoundaryStatus: input.sourceRuntimeSpecBoundaryStatus,
        sourceRuntimeSpecNonExecuting: input.sourceRuntimeSpecNonExecuting,
        sourceTraceBoundaryStatus: input.sourceTraceBoundaryStatus,
        sourceTraceAuditOnly: input.sourceTraceAuditOnly,
        proposedToolName: input.proposedToolName,
        proposedToolId: input.proposedToolId,
        actionKind: input.actionKind,
        riskClass: "blocked",
        gateState: "blocked",
        requiredChecks: {
            runtimeSpecBoundaryValid: runtimeBoundaryValid,
            traceBoundaryValid,
            allowlistSatisfied: false,
            previewSatisfied: false,
            dryRunSatisfied: false,
            approvalSatisfied: false,
            rollbackPrepared: false,
        },
        approvalRequirement: { required: false, reason: null },
        previewRequirement: { required: false, reason: null },
        dryRunRequirement: { required: false, reason: null },
        allowlistRequirement: { required: false, reason: "Unknown tools are never directly executable by default." },
        rollbackRequirement: { required: false, reason: null },
        finalDecision: runtimeBoundaryValid && traceBoundaryValid ? "review_required" : "block",
        auditMeta: {
            auditReference: null,
            decisionReason: runtimeBoundaryValid && traceBoundaryValid
                ? "Tool capability is unknown to the registry; execution remains review-required and blocked from direct execution."
                : "Boundary validation failed or is incomplete; unknown tool cannot proceed.",
            notes: [
                "Unknown tool ids must not auto-map to direct execution or approval-gated execution.",
                "RuntimeSpec and Trace may inform planning but do not authorize execution by themselves."
            ],
        },
    };
}
export function createProposedActionGate(input) {
    const policy = getRiskClassPolicy(input.riskClass);
    const runtimeBoundaryValid = input.sourceRuntimeSpecBoundaryStatus === "valid_non_executing_artifact" && input.sourceRuntimeSpecNonExecuting === true;
    const traceBoundaryValid = input.sourceTraceBoundaryStatus === "valid_audit_artifact" && input.sourceTraceAuditOnly === true;
    let gateState = "proposed";
    let finalDecision = "review_required";
    let decisionReason = "Action proposed for policy evaluation.";
    if (!runtimeBoundaryValid || !traceBoundaryValid) {
        gateState = "blocked";
        finalDecision = "block";
        decisionReason = "Boundary validation failed or is incomplete; compiler artifacts cannot authorize execution.";
    }
    else if (input.riskClass === "blocked") {
        gateState = "blocked";
        finalDecision = "block";
        decisionReason = "Tool capability is blocked by policy.";
    }
    else if (policy.approvalRequired) {
        gateState = "approval_required";
        finalDecision = "allow_after_approval";
        decisionReason = "Approval is required before execution can proceed.";
    }
    else if (policy.previewRequired) {
        gateState = "preview_required";
        finalDecision = "require_preview";
        decisionReason = "Preview is required before execution can proceed.";
    }
    else if (policy.dryRunRequired) {
        gateState = "dry_run_required";
        finalDecision = "require_dry_run";
        decisionReason = "Dry-run is required before execution can proceed.";
    }
    else if (policy.directExecutionAllowed) {
        gateState = "allowed_direct";
        finalDecision = "allow_direct";
        decisionReason = "Direct execution may proceed under allowlisted low-risk policy.";
    }
    return {
        actionId: input.actionId,
        sourceRuntimeSpecBoundaryStatus: input.sourceRuntimeSpecBoundaryStatus,
        sourceRuntimeSpecNonExecuting: input.sourceRuntimeSpecNonExecuting,
        sourceTraceBoundaryStatus: input.sourceTraceBoundaryStatus,
        sourceTraceAuditOnly: input.sourceTraceAuditOnly,
        proposedToolName: input.proposedToolName,
        proposedToolId: input.proposedToolId,
        actionKind: input.actionKind,
        riskClass: input.riskClass,
        gateState,
        requiredChecks: {
            runtimeSpecBoundaryValid: runtimeBoundaryValid,
            traceBoundaryValid,
            allowlistSatisfied: policy.directExecutionAllowed,
            previewSatisfied: !policy.previewRequired,
            dryRunSatisfied: !policy.dryRunRequired,
            approvalSatisfied: !policy.approvalRequired,
            rollbackPrepared: !policy.rollbackRequired,
        },
        approvalRequirement: { required: policy.approvalRequired, reason: policy.approvalRequired ? "Risk class requires approval." : null },
        previewRequirement: { required: policy.previewRequired, reason: policy.previewRequired ? "Risk class requires preview." : null },
        dryRunRequirement: { required: policy.dryRunRequired, reason: policy.dryRunRequired ? "Risk class requires dry-run." : null },
        allowlistRequirement: { required: policy.directExecutionAllowed, reason: policy.directExecutionAllowed ? "Direct execution requires allowlisted policy match." : null },
        rollbackRequirement: { required: policy.rollbackRequired, reason: policy.rollbackRequired ? "Risk class requires rollback/backup planning." : null },
        finalDecision,
        auditMeta: {
            auditReference: null,
            decisionReason,
            notes: ["RuntimeSpec and Trace may inform planning but do not authorize execution by themselves."],
        },
    };
}
