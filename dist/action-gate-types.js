export function classifyRiskClassPolicy(riskClass) {
    switch (riskClass) {
        case "read_only":
            return { directExecutionAllowed: true, requiresApproval: false, requiresPreview: false, requiresDryRun: false, requiresRollback: false };
        case "dry_run_only":
            return { directExecutionAllowed: false, requiresApproval: false, requiresPreview: false, requiresDryRun: true, requiresRollback: false };
        case "preview_only":
            return { directExecutionAllowed: false, requiresApproval: false, requiresPreview: true, requiresDryRun: false, requiresRollback: false };
        case "low_risk_direct":
            return { directExecutionAllowed: true, requiresApproval: false, requiresPreview: false, requiresDryRun: false, requiresRollback: false };
        case "approval_gated_write":
            return { directExecutionAllowed: false, requiresApproval: true, requiresPreview: false, requiresDryRun: false, requiresRollback: true };
        case "destructive_or_sensitive":
            return { directExecutionAllowed: false, requiresApproval: true, requiresPreview: true, requiresDryRun: false, requiresRollback: true };
        case "external_transmission":
            return { directExecutionAllowed: false, requiresApproval: true, requiresPreview: true, requiresDryRun: false, requiresRollback: false };
        case "blocked":
        default:
            return { directExecutionAllowed: false, requiresApproval: false, requiresPreview: false, requiresDryRun: false, requiresRollback: false };
    }
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
export function createProposedActionGate(input) {
    const policy = classifyRiskClassPolicy(input.riskClass);
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
    else if (policy.requiresApproval) {
        gateState = "approval_required";
        finalDecision = "allow_after_approval";
        decisionReason = "Approval is required before execution can proceed.";
    }
    else if (policy.requiresPreview) {
        gateState = "preview_required";
        finalDecision = "require_preview";
        decisionReason = "Preview is required before execution can proceed.";
    }
    else if (policy.requiresDryRun) {
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
            previewSatisfied: !policy.requiresPreview,
            dryRunSatisfied: !policy.requiresDryRun,
            approvalSatisfied: !policy.requiresApproval,
            rollbackPrepared: !policy.requiresRollback,
        },
        approvalRequirement: { required: policy.requiresApproval, reason: policy.requiresApproval ? "Risk class requires approval." : null },
        previewRequirement: { required: policy.requiresPreview, reason: policy.requiresPreview ? "Risk class requires preview." : null },
        dryRunRequirement: { required: policy.requiresDryRun, reason: policy.requiresDryRun ? "Risk class requires dry-run." : null },
        allowlistRequirement: { required: policy.directExecutionAllowed, reason: policy.directExecutionAllowed ? "Direct execution requires allowlisted policy match." : null },
        rollbackRequirement: { required: policy.requiresRollback, reason: policy.requiresRollback ? "Risk class requires rollback/backup planning." : null },
        finalDecision,
        auditMeta: {
            auditReference: null,
            decisionReason,
            notes: ["RuntimeSpec and Trace may inform planning but do not authorize execution by themselves."],
        },
    };
}
