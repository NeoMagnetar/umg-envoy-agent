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
export function createLowRiskAllowlistPolicy() {
    return {
        allowlistTag: "low-risk-direct",
        allowedRiskClasses: ["read_only", "low_risk_direct"],
        notes: [
            "Low-risk direct does not mean unrestricted execution.",
            "Eligibility requires a known capability, valid boundaries, and explicit allowlist policy.",
            "Writes, deletes, publishing, plugin mutation, and external transmission are not low-risk direct.",
        ],
    };
}
export function evaluateLowRiskDirectEligibility(actionGate, capability, policy = createLowRiskAllowlistPolicy()) {
    const baseNotes = [
        ...policy.notes,
        "This decision is an eligibility artifact only and does not execute a tool.",
        "ToolResult must be created later by an actual execution lane, not by allowlist evaluation.",
        "RuntimeSpec and Trace may inform planning but do not authorize execution by themselves.",
    ];
    if (!capability) {
        return {
            actionId: actionGate.actionId,
            toolId: actionGate.proposedToolId,
            toolName: actionGate.proposedToolName,
            status: "blocked_unknown_tool",
            eligible: false,
            reasonCode: "unknown_tool",
            reason: "Unknown tools are not eligible for low-risk direct execution.",
            requiresToolResultAuditLater: false,
            notes: baseNotes,
        };
    }
    if (!actionGate.requiredChecks.runtimeSpecBoundaryValid || !actionGate.requiredChecks.traceBoundaryValid) {
        return {
            actionId: actionGate.actionId,
            toolId: capability.toolId,
            toolName: capability.toolName,
            status: "blocked_boundary_violation",
            eligible: false,
            reasonCode: "boundary_violation",
            reason: "Boundary validation failed or is incomplete; direct execution eligibility is blocked.",
            requiresToolResultAuditLater: capability.requiresToolResultAudit,
            notes: baseNotes,
        };
    }
    if (!policy.allowedRiskClasses.includes(capability.allowedRiskClass)) {
        return {
            actionId: actionGate.actionId,
            toolId: capability.toolId,
            toolName: capability.toolName,
            status: "blocked_risk_class",
            eligible: false,
            reasonCode: "risk_class_not_allowed",
            reason: "Only read_only and low_risk_direct capabilities may be considered for low-risk direct eligibility.",
            requiresToolResultAuditLater: capability.requiresToolResultAudit,
            notes: baseNotes,
        };
    }
    if (capability.previewRequired || actionGate.previewRequirement.required) {
        return {
            actionId: actionGate.actionId,
            toolId: capability.toolId,
            toolName: capability.toolName,
            status: "blocked_requires_preview",
            eligible: false,
            reasonCode: "preview_required",
            reason: "Capabilities that require preview are not eligible for low-risk direct execution.",
            requiresToolResultAuditLater: capability.requiresToolResultAudit,
            notes: baseNotes,
        };
    }
    if (capability.dryRunRequired || actionGate.dryRunRequirement.required) {
        return {
            actionId: actionGate.actionId,
            toolId: capability.toolId,
            toolName: capability.toolName,
            status: "blocked_requires_dry_run",
            eligible: false,
            reasonCode: "dry_run_required",
            reason: "Capabilities that require dry-run are not eligible for low-risk direct execution.",
            requiresToolResultAuditLater: capability.requiresToolResultAudit,
            notes: baseNotes,
        };
    }
    if (capability.approvalRequired || actionGate.approvalRequirement.required) {
        return {
            actionId: actionGate.actionId,
            toolId: capability.toolId,
            toolName: capability.toolName,
            status: "blocked_requires_approval",
            eligible: false,
            reasonCode: "approval_required",
            reason: "Capabilities that require approval are not eligible for low-risk direct execution.",
            requiresToolResultAuditLater: capability.requiresToolResultAudit,
            notes: baseNotes,
        };
    }
    if (capability.externalTransmissionAllowed) {
        return {
            actionId: actionGate.actionId,
            toolId: capability.toolId,
            toolName: capability.toolName,
            status: "blocked_external_transmission",
            eligible: false,
            reasonCode: "external_transmission",
            reason: "External transmission is not eligible for low-risk direct execution.",
            requiresToolResultAuditLater: capability.requiresToolResultAudit,
            notes: baseNotes,
        };
    }
    if (capability.backupRequired || capability.rollbackSupported) {
        return {
            actionId: actionGate.actionId,
            toolId: capability.toolId,
            toolName: capability.toolName,
            status: "blocked_mutation_risk",
            eligible: false,
            reasonCode: "mutation_or_rollback_risk",
            reason: "Capabilities with backup or rollback posture are treated as mutation-risk and not eligible for low-risk direct execution.",
            requiresToolResultAuditLater: capability.requiresToolResultAudit,
            notes: baseNotes,
        };
    }
    if (!capability.directExecutionAllowed) {
        return {
            actionId: actionGate.actionId,
            toolId: capability.toolId,
            toolName: capability.toolName,
            status: "blocked_risk_class",
            eligible: false,
            reasonCode: "direct_execution_not_allowed",
            reason: "Capability policy does not allow direct execution.",
            requiresToolResultAuditLater: capability.requiresToolResultAudit,
            notes: baseNotes,
        };
    }
    if (!(capability.allowlistTags ?? []).includes(policy.allowlistTag)) {
        return {
            actionId: actionGate.actionId,
            toolId: capability.toolId,
            toolName: capability.toolName,
            status: "blocked_not_allowlisted",
            eligible: false,
            reasonCode: "missing_allowlist_tag",
            reason: "Capability is not explicitly allowlisted for low-risk direct execution.",
            requiresToolResultAuditLater: capability.requiresToolResultAudit,
            notes: baseNotes,
        };
    }
    return {
        actionId: actionGate.actionId,
        toolId: capability.toolId,
        toolName: capability.toolName,
        status: "allowed_low_risk_direct",
        eligible: true,
        reasonCode: "eligible_low_risk_direct",
        reason: "Capability is known, bounded, local-only, non-mutating, and explicitly allowlisted for low-risk direct execution.",
        requiresToolResultAuditLater: capability.requiresToolResultAudit,
        notes: baseNotes,
    };
}
export function canProceedLowRiskDirect(actionGate, capability, policy) {
    return evaluateLowRiskDirectEligibility(actionGate, capability, policy).eligible;
}
export function planActionGatePreviewDryRun(actionGate, capability) {
    const runtimeBoundaryValid = actionGate.requiredChecks.runtimeSpecBoundaryValid;
    const traceBoundaryValid = actionGate.requiredChecks.traceBoundaryValid;
    const fallbackPolicy = getRiskClassPolicy(actionGate.riskClass);
    const previewRequired = capability?.previewRequired ?? fallbackPolicy.previewRequired;
    const dryRunRequired = capability?.dryRunRequired ?? fallbackPolicy.dryRunRequired;
    const dryRunSupported = capability?.dryRunSupported ?? fallbackPolicy.dryRunSupported;
    const approvalRequired = capability?.approvalRequired ?? fallbackPolicy.approvalRequired;
    const backupRequired = capability?.backupRequired ?? fallbackPolicy.backupRequired;
    const rollbackRequired = fallbackPolicy.rollbackRequired;
    const externalTransmission = capability?.externalTransmissionAllowed ?? fallbackPolicy.externalTransmissionAllowed;
    const notes = [
        "Preview and dry-run planning do not execute tools.",
        "Preview and dry-run do not equal approval or execution.",
        "RuntimeSpec and Trace may inform planning but do not authorize execution by themselves.",
    ];
    if (!runtimeBoundaryValid || !traceBoundaryValid) {
        return {
            actionId: actionGate.actionId,
            toolId: actionGate.proposedToolId,
            toolName: actionGate.proposedToolName,
            riskClass: actionGate.riskClass,
            status: previewRequired ? "blocked_before_preview" : "blocked_before_dry_run",
            blocked: true,
            approvalRequiredLater: approvalRequired,
            previewPlan: {
                required: previewRequired,
                status: "blocked",
                reasonCode: "boundary_blocked",
                reason: "Boundary validation failed or is incomplete; pre-execution planning cannot authorize or advance execution.",
            },
            dryRunPlan: {
                required: dryRunRequired,
                supported: dryRunSupported,
                status: "blocked",
                reasonCode: "boundary_blocked",
                reason: "Boundary validation failed or is incomplete; dry-run planning cannot proceed.",
            },
            backupRequired,
            rollbackRequired,
            externalTransmission,
            notes,
        };
    }
    if (actionGate.riskClass === "blocked" || actionGate.gateState === "blocked" || actionGate.finalDecision === "block") {
        return {
            actionId: actionGate.actionId,
            toolId: actionGate.proposedToolId,
            toolName: actionGate.proposedToolName,
            riskClass: actionGate.riskClass,
            status: previewRequired ? "blocked_before_preview" : "blocked_before_dry_run",
            blocked: true,
            approvalRequiredLater: false,
            previewPlan: {
                required: previewRequired,
                status: "blocked",
                reasonCode: "policy_blocked",
                reason: "Capability is blocked by policy and does not become executable through preview.",
            },
            dryRunPlan: {
                required: dryRunRequired,
                supported: dryRunSupported,
                status: "blocked",
                reasonCode: "policy_blocked",
                reason: "Capability is blocked by policy and does not become executable through dry-run.",
            },
            backupRequired,
            rollbackRequired,
            externalTransmission,
            notes,
        };
    }
    if (actionGate.finalDecision === "review_required") {
        return {
            actionId: actionGate.actionId,
            toolId: actionGate.proposedToolId,
            toolName: actionGate.proposedToolName,
            riskClass: actionGate.riskClass,
            status: previewRequired ? "blocked_before_preview" : "blocked_before_dry_run",
            blocked: true,
            approvalRequiredLater: approvalRequired,
            previewPlan: {
                required: previewRequired,
                status: "blocked",
                reasonCode: "review_required",
                reason: "Capability remains review-required and does not advance through preview planning alone.",
            },
            dryRunPlan: {
                required: dryRunRequired,
                supported: dryRunSupported,
                status: "blocked",
                reasonCode: "review_required",
                reason: "Capability remains review-required and does not advance through dry-run planning alone.",
            },
            backupRequired,
            rollbackRequired,
            externalTransmission,
            notes,
        };
    }
    if (previewRequired) {
        return {
            actionId: actionGate.actionId,
            toolId: actionGate.proposedToolId,
            toolName: actionGate.proposedToolName,
            riskClass: actionGate.riskClass,
            status: approvalRequired ? "approval_required_after_preview" : "preview_required",
            blocked: false,
            approvalRequiredLater: approvalRequired,
            previewPlan: {
                required: true,
                status: "required",
                reasonCode: "preview_required_by_policy",
                reason: "Capability policy requires preview before any later execution lane can proceed.",
            },
            dryRunPlan: {
                required: dryRunRequired,
                supported: dryRunSupported,
                status: dryRunRequired ? (dryRunSupported ? "ready" : "blocked") : "not_required",
                reasonCode: dryRunRequired
                    ? (dryRunSupported ? "dry_run_supported_after_preview" : "dry_run_required_but_unsupported")
                    : "dry_run_not_required",
                reason: dryRunRequired
                    ? (dryRunSupported
                        ? "Dry-run is also required and appears supportable after preview planning."
                        : "Dry-run is required by policy but not marked as supported by this capability.")
                    : "Dry-run is not required by current capability policy.",
            },
            backupRequired,
            rollbackRequired,
            externalTransmission,
            notes,
        };
    }
    if (dryRunRequired) {
        return {
            actionId: actionGate.actionId,
            toolId: actionGate.proposedToolId,
            toolName: actionGate.proposedToolName,
            riskClass: actionGate.riskClass,
            status: dryRunSupported ? (approvalRequired ? "approval_required_after_preview" : "dry_run_required") : "blocked_before_dry_run",
            blocked: !dryRunSupported,
            approvalRequiredLater: approvalRequired,
            previewPlan: {
                required: false,
                status: "not_required",
                reasonCode: "preview_not_required",
                reason: "Preview is not required by current capability policy.",
            },
            dryRunPlan: {
                required: true,
                supported: dryRunSupported,
                status: dryRunSupported ? "required" : "blocked",
                reasonCode: dryRunSupported ? "dry_run_required_by_policy" : "dry_run_required_but_unsupported",
                reason: dryRunSupported
                    ? "Capability policy requires a non-mutating dry-run before any later execution lane can proceed."
                    : "Dry-run is required by policy but this capability is not marked as dry-run supportable.",
            },
            backupRequired,
            rollbackRequired,
            externalTransmission,
            notes,
        };
    }
    return {
        actionId: actionGate.actionId,
        toolId: actionGate.proposedToolId,
        toolName: actionGate.proposedToolName,
        riskClass: actionGate.riskClass,
        status: "preview_not_required",
        blocked: false,
        approvalRequiredLater: approvalRequired,
        previewPlan: {
            required: false,
            status: "not_required",
            reasonCode: "preview_not_required",
            reason: "Preview is not required by current capability policy.",
        },
        dryRunPlan: {
            required: false,
            supported: dryRunSupported,
            status: "not_required",
            reasonCode: "dry_run_not_required",
            reason: "Dry-run is not required by current capability policy.",
        },
        backupRequired,
        rollbackRequired,
        externalTransmission,
        notes,
    };
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
