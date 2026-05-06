export function stableHash(value) {
    const serialized = stableStringify(value);
    let hash = 2166136261;
    for (let index = 0; index < serialized.length; index += 1) {
        hash ^= serialized.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return `h_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
export function buildApprovalRequestDryRun(input) {
    const { handoff, expiresAt } = input;
    const approval_items = handoff.approval.approval_items.map((item, index) => ({
        item_id: `${handoff.handoff_id}:approval_item:${index}:${item.tool_id}`,
        tool_id: item.tool_id,
        requested_by: item.requested_by,
        risk_level: item.risk_level,
        execution_mode: item.execution_mode,
        reason: item.reason,
        user_visible_risk: renderUserVisibleRisk(item.tool_id, item.risk_level),
        approval_scope: "single_handoff",
        status: "requires_approval"
    }));
    const blocked_items = handoff.blocking.blocked_items.map((item) => ({
        tool_id: item.tool_id,
        risk_level: item.risk_level,
        reason: item.blocked_reason,
        requested_by: item.requested_by
    }));
    const status = resolveApprovalRequestStatus(handoff);
    return {
        approval_request_id: `approval_request_${stableHash({ handoff_id: handoff.handoff_id, status, requested: handoff.tool_plan.requested })}`,
        handoff_id: handoff.handoff_id,
        runtime_spec_id: handoff.runtime_spec_id,
        trace_id: handoff.trace_id,
        matrix_id: handoff.matrix_id,
        molt_map_id: handoff.molt_map_id,
        status,
        mode: "dry_run",
        requested_action_summary: summarizeRequestedAction(handoff),
        selected_context: cloneSelectedContext(handoff),
        approval_items,
        blocked_items,
        user_visible_summary: {
            title: status === "blocked" ? "Approval blocked for future governed execution request" : status === "required" ? "Approval required for future governed execution request" : "Approval not required for this dry-run request",
            plain_language_summary: summarizePlainLanguage(handoff, status),
            tools_requested: [...handoff.tool_plan.requested],
            risks: approval_items.map((item) => item.user_visible_risk),
            blocked_items: blocked_items.map((item) => `${item.tool_id} — ${item.reason}`),
            checkpoint_required: handoff.checkpoint.checkpoint_required,
            execution_statement: "No tools executed."
        },
        constraints: {
            expires_at: expiresAt,
            single_use: true,
            exact_match_required: true,
            blocked_items_cannot_be_approved: true
        },
        warnings: dedupe([
            ...handoff.warnings,
            ...(blocked_items.length > 0 ? ["blocked items remain non-approvable under v0"] : []),
            ...(status === "required" ? ["approval remains future-only and non-executing in this phase"] : [])
        ])
    };
}
export function buildExecutionCheckpointRecordDryRun(input) {
    const { handoff, approvalRequest } = input;
    const policyVersion = input.policyVersion ?? "approval-checkpoint-contract/v0";
    const runtime_spec_hash = stableHash({ runtime_spec_id: handoff.runtime_spec_id, trace_id: handoff.trace_id });
    const tool_plan_hash = stableHash(handoff.tool_plan);
    const selected_context_hash = stableHash(handoff.selected_context);
    const approval_request_hash = approvalRequest ? stableHash({
        approval_request_id: approvalRequest.approval_request_id,
        handoff_id: approvalRequest.handoff_id,
        runtime_spec_id: approvalRequest.runtime_spec_id,
        approval_items: approvalRequest.approval_items,
        blocked_items: approvalRequest.blocked_items,
        constraints: approvalRequest.constraints
    }) : undefined;
    return {
        checkpoint_id: `checkpoint_${stableHash({ handoff_id: handoff.handoff_id, runtime_spec_hash, tool_plan_hash, selected_context_hash, approval_request_hash, policyVersion })}`,
        handoff_id: handoff.handoff_id,
        approval_request_id: approvalRequest?.approval_request_id,
        runtime_spec_id: handoff.runtime_spec_id,
        trace_id: handoff.trace_id,
        status: resolveCheckpointStatus(handoff),
        snapshot: {
            runtime_spec_hash,
            tool_plan_hash,
            selected_context_hash,
            approval_request_hash,
            policy_version: policyVersion
        },
        replay_guard: {
            exact_match_required: true,
            expires_at: approvalRequest?.constraints.expires_at,
            blocked_if_policy_changed: true,
            blocked_if_runtime_spec_changed: true,
            blocked_if_tool_plan_changed: true
        },
        execution_boundary: {
            execution_performed: false,
            checkpoint_written: false,
            statement: "No tools executed."
        },
        warnings: dedupe([
            ...handoff.warnings,
            "checkpoint record is read-only in this phase",
            "checkpoint persistence is not implemented"
        ])
    };
}
export function buildExecutionResumeReferenceDryRun(input) {
    const { handoff, checkpoint, approvalRequest } = input;
    const checkpointRequired = handoff.checkpoint.checkpoint_required;
    const checkpointValid = Boolean(checkpoint && checkpoint.handoff_id === handoff.handoff_id && checkpoint.runtime_spec_id === handoff.runtime_spec_id && checkpoint.status !== "invalid" && checkpoint.status !== "expired");
    const status = checkpointRequired
        ? checkpointValid
            ? "resume_ready_future_only"
            : "requires_checkpoint"
        : "not_applicable";
    return {
        resume_reference_id: `resume_reference_${stableHash({ handoff_id: handoff.handoff_id, checkpoint_id: checkpoint?.checkpoint_id ?? "missing", approval_request_id: approvalRequest?.approval_request_id ?? "none", status })}`,
        checkpoint_id: checkpoint?.checkpoint_id ?? "checkpoint_missing_future_only",
        handoff_id: handoff.handoff_id,
        runtime_spec_id: handoff.runtime_spec_id,
        status,
        resume_guard: {
            checkpoint_required: true,
            approval_required: handoff.approval.approval_required,
            exact_match_required: true,
            policy_revalidation_required: true
        },
        execution_boundary: {
            resume_performed: false,
            execution_performed: false,
            statement: "No tools executed."
        }
    };
}
export function buildPreflightValidationDryRun(input) {
    const { handoff, approvalRequest, checkpoint, resumeReference } = input;
    const currentPolicyVersion = input.currentPolicyVersion ?? checkpoint?.snapshot.policy_version ?? "approval-checkpoint-contract/v0";
    const expectedRuntimeSpecHash = stableHash({ runtime_spec_id: handoff.runtime_spec_id, trace_id: handoff.trace_id });
    const expectedToolPlanHash = stableHash(handoff.tool_plan);
    const expectedSelectedContextHash = stableHash(handoff.selected_context);
    const expectedApprovalRequestHash = approvalRequest ? stableHash({
        approval_request_id: approvalRequest.approval_request_id,
        handoff_id: approvalRequest.handoff_id,
        runtime_spec_id: approvalRequest.runtime_spec_id,
        approval_items: approvalRequest.approval_items,
        blocked_items: approvalRequest.blocked_items,
        constraints: approvalRequest.constraints
    }) : undefined;
    const checks = [
        check("runtime_spec_match", !checkpoint || checkpoint.snapshot.runtime_spec_hash === expectedRuntimeSpecHash, !checkpoint ? "No checkpoint snapshot present; runtime match remains future-only." : checkpoint.snapshot.runtime_spec_hash === expectedRuntimeSpecHash ? "RuntimeSpec snapshot matches handoff." : "RuntimeSpec mismatch between handoff and checkpoint."),
        check("tool_plan_match", !checkpoint || checkpoint.snapshot.tool_plan_hash === expectedToolPlanHash, !checkpoint ? "No checkpoint snapshot present; tool-plan match remains future-only." : checkpoint.snapshot.tool_plan_hash === expectedToolPlanHash ? "Tool plan snapshot matches handoff." : "Tool plan mismatch between handoff and checkpoint."),
        check("selected_context_match", !checkpoint || checkpoint.snapshot.selected_context_hash === expectedSelectedContextHash, !checkpoint ? "No checkpoint snapshot present; selected-context match remains future-only." : checkpoint.snapshot.selected_context_hash === expectedSelectedContextHash ? "Selected context snapshot matches handoff." : "Selected context mismatch between handoff and checkpoint."),
        check("approval_request_match", !approvalRequest || approvalRequest.handoff_id === handoff.handoff_id, !approvalRequest ? "No approval request attached; match remains future-only." : approvalRequest.handoff_id === handoff.handoff_id ? "Approval request matches handoff." : "Approval request points at a different handoff."),
        check("approval_scope_match", !approvalRequest || approvalRequest.approval_items.every((item) => item.approval_scope === "single_handoff"), !approvalRequest ? "No approval scope attached; scope remains future-only." : approvalRequest.approval_items.every((item) => item.approval_scope === "single_handoff") ? "Approval scope remains exact-scope for this handoff." : "Approval scope does not remain exact-scope."),
        check("blocked_tools_absent", handoff.blocking.blocked_items.length === 0, handoff.blocking.blocked_items.length === 0 ? "No blocked tools are present in the execution set." : `Blocked tools remain present: ${handoff.blocking.blocked_items.map((item) => item.tool_id).join(", ")}.`),
        check("unknown_tools_absent", !handoff.tool_plan.bindings.some((binding) => binding.status === "unknown"), handoff.tool_plan.bindings.some((binding) => binding.status === "unknown") ? "Unknown tool binding is present." : "No unknown tools are present."),
        check("policy_version_match", !checkpoint || checkpoint.snapshot.policy_version === currentPolicyVersion, !checkpoint ? "No checkpoint policy snapshot present; policy match remains future-only." : checkpoint.snapshot.policy_version === currentPolicyVersion ? "Policy version matches." : "Policy version mismatch requires revalidation."),
        check("checkpoint_required", !handoff.checkpoint.checkpoint_required || Boolean(checkpoint), !handoff.checkpoint.checkpoint_required ? "Checkpoint is not required for this dry-run path." : checkpoint ? "Required checkpoint is present as a read-only contract object." : "Checkpoint is required before future execution discussion can continue."),
        check("resume_reference_valid", !resumeReference || (resumeReference.handoff_id === handoff.handoff_id && resumeReference.runtime_spec_id === handoff.runtime_spec_id && resumeReference.status !== "invalid" && resumeReference.status !== "expired"), !resumeReference ? "No resume reference attached; resume remains future-only." : resumeReference.handoff_id === handoff.handoff_id && resumeReference.runtime_spec_id === handoff.runtime_spec_id && resumeReference.status !== "invalid" && resumeReference.status !== "expired" ? "Resume reference matches current handoff." : "Resume reference is invalid for this handoff."),
        check("support_doc_tool_source_absent", !handoff.tool_plan.bindings.some((binding) => binding.provenance?.source_kind === "support_only"), handoff.tool_plan.bindings.some((binding) => binding.provenance?.source_kind === "support_only") ? "Support-doc-derived tool request detected." : "No support-doc-derived tool request detected."),
        check("execution_mode_not_blocked", !handoff.blocking.blocked && handoff.mode === "dry_run", handoff.blocking.blocked ? "Execution mode remains blocked by governance." : handoff.mode === "dry_run" ? "Execution mode remains dry-run only." : "Execution mode is not limited to dry-run.")
    ];
    const hasBlocked = checks.some((item) => (item.check === "blocked_tools_absent" || item.check === "execution_mode_not_blocked") && !item.passed);
    const hasInvalid = checks.some((item) => !item.passed) && !hasBlocked;
    if (checkpoint && expectedApprovalRequestHash && checkpoint.snapshot.approval_request_hash && checkpoint.snapshot.approval_request_hash !== expectedApprovalRequestHash) {
        checks.push(check("approval_request_match", false, "Approval request hash mismatch between checkpoint and current request."));
    }
    const status = hasBlocked ? "blocked" : checks.some((item) => !item.passed) ? "invalid" : "pass_future_only";
    return {
        preflight_id: `preflight_${stableHash({ handoff_id: handoff.handoff_id, runtime_spec_id: handoff.runtime_spec_id, status, checks: checks.map((item) => [item.check, item.passed]) })}`,
        handoff_id: handoff.handoff_id,
        runtime_spec_id: handoff.runtime_spec_id,
        status,
        checks,
        execution_boundary: {
            execution_performed: false,
            statement: "No tools executed."
        },
        warnings: dedupe([
            ...handoff.warnings,
            ...(status !== "pass_future_only" ? ["preflight did not authorize execution"] : ["preflight pass is future-only and non-authorizing"])
        ])
    };
}
function resolveApprovalRequestStatus(handoff) {
    if (handoff.blocking.blocked)
        return "blocked";
    if (handoff.approval.approval_required)
        return "required";
    if (handoff.mode !== "dry_run")
        return "invalid";
    return "not_required";
}
function resolveCheckpointStatus(handoff) {
    if (handoff.blocking.blocked)
        return "not_required";
    if (handoff.checkpoint.checkpoint_required)
        return "required";
    if (handoff.tool_plan.metadata_only.length > 0)
        return "not_required";
    if (handoff.tool_plan.available.length > 0)
        return "not_required";
    return "draft";
}
function summarizeRequestedAction(handoff) {
    if (handoff.blocking.blocked_items.length > 0) {
        return `Future governed execution request is blocked for ${handoff.blocking.blocked_items.map((item) => item.tool_id).join(", ")}.`;
    }
    if (handoff.approval.approval_items.length > 0) {
        return `Future governed execution would require approval for ${handoff.approval.approval_items.map((item) => item.tool_id).join(", ")}.`;
    }
    if (handoff.tool_plan.metadata_only.length > 0) {
        return `Dry-run request remains metadata-only for ${handoff.tool_plan.metadata_only.join(", ")}.`;
    }
    if (handoff.tool_plan.available.length > 0) {
        return `Dry-run request remains read-only for ${handoff.tool_plan.available.join(", ")}.`;
    }
    return "No future governed execution action is currently requested.";
}
function summarizePlainLanguage(handoff, status) {
    if (status === "blocked")
        return "This dry-run request includes blocked tools that cannot be approved under conservative v0 governance.";
    if (status === "required")
        return "This dry-run request identified tool actions that would require explicit exact-scope approval before any future execution discussion.";
    if (handoff.tool_plan.metadata_only.length > 0)
        return "This dry-run request remains metadata-only and does not require approval.";
    return "This dry-run request does not currently require approval.";
}
function renderUserVisibleRisk(toolId, riskLevel) {
    if (toolId.includes("delete"))
        return `${toolId} can remove or destroy data.`;
    if (toolId.includes("write"))
        return `${toolId} can change files or persisted state.`;
    if (toolId.includes("langchain"))
        return `${toolId} can broaden governed workflow behavior and requires explicit approval.`;
    return `${toolId} carries ${riskLevel} risk under governed execution policy.`;
}
function cloneSelectedContext(handoff) {
    return {
        runtime_kind: handoff.selected_context.runtime_kind,
        active_sleeve: handoff.selected_context.active_sleeve,
        active_neostacks: [...handoff.selected_context.active_neostacks],
        active_neoblocks: [...handoff.selected_context.active_neoblocks],
        active_molt_blocks: [...handoff.selected_context.active_molt_blocks]
    };
}
function check(checkName, passed, reason) {
    return { check: checkName, passed, reason };
}
function dedupe(values) {
    return values.filter((value, index, array) => Boolean(value) && array.indexOf(value) === index);
}
function stableStringify(value) {
    if (value === null || typeof value !== "object")
        return JSON.stringify(value);
    if (Array.isArray(value))
        return `[${value.map((item) => stableStringify(item)).join(",")}]`;
    const entries = Object.entries(value).sort(([left], [right]) => left.localeCompare(right));
    return `{${entries.map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`).join(",")}}`;
}
