export function buildGovernedExecutionHandoffDryRun(input) {
    const { runtimeSpec } = input;
    const bindings = runtimeSpec.tool_bindings.bindings ?? [];
    const approvalItems = bindings
        .filter((binding) => binding.status === "requires_approval" && binding.execution_mode === "approval_required" && binding.approval_required)
        .map((binding) => ({
        tool_id: binding.tool_id,
        risk_level: binding.risk_level,
        execution_mode: binding.execution_mode,
        requested_by: {
            artifact_id: binding.requested_by.artifact_id,
            artifact_kind: binding.requested_by.artifact_kind
        },
        reason: approvalReason(binding.tool_id),
        approval_prompt_preview: `Future approval would be required for ${binding.tool_id}.`,
        status: "requires_approval"
    }));
    const blockedItems = bindings
        .filter((binding) => binding.status === "blocked" || binding.execution_mode === "blocked" || binding.status === "unknown")
        .map((binding) => ({
        tool_id: binding.tool_id,
        risk_level: binding.risk_level,
        blocked_reason: binding.blocked_reason ?? unknownBlockedReason(binding.tool_id),
        governance_policy: binding.governance_policy,
        requested_by: {
            artifact_id: binding.requested_by.artifact_id,
            artifact_kind: binding.requested_by.artifact_kind
        }
    }));
    const status = resolveHandoffStatus(runtimeSpec, bindings, approvalItems, blockedItems);
    const checkpoint = resolveCheckpointPolicy(status);
    const warnings = [
        ...(runtimeSpec.selection.selection_warnings ?? []),
        ...(runtimeSpec.tool_bindings.bindings?.flatMap((binding) => binding.warnings) ?? []),
        ...(status === "blocked" && blockedItems.some((item) => item.blocked_reason.includes("unknown")) ? ["unknown tool cannot be handed to execution safely"] : [])
    ].filter((value, index, array) => value && array.indexOf(value) === index);
    return {
        handoff_id: handoffId(runtimeSpec.runtime_spec_id, runtimeSpec.trace.trace_id, status),
        runtime_spec_id: runtimeSpec.runtime_spec_id,
        trace_id: runtimeSpec.trace.trace_id,
        matrix_id: input.irMatrixId ?? input.runtimeDashboard?.ir_matrix?.matrix_id ?? runtimeSpec.matrix.matrix_id,
        molt_map_id: input.moltMapId ?? input.runtimeDashboard?.molt_map?.molt_map_id,
        source: "RuntimeSpecV0",
        mode: "dry_run",
        selected_context: {
            runtime_kind: runtimeSpec.runtime_kind,
            active_sleeve: runtimeSpec.selection.active_sleeve,
            active_neostacks: [...runtimeSpec.selection.active_neostacks],
            active_neoblocks: [...runtimeSpec.selection.active_neoblocks],
            active_molt_blocks: [...runtimeSpec.selection.active_molt_blocks]
        },
        tool_plan: {
            requested: [...runtimeSpec.tool_bindings.requested],
            available: [...runtimeSpec.tool_bindings.available],
            requires_approval: [...runtimeSpec.tool_bindings.requires_approval],
            blocked: [...runtimeSpec.tool_bindings.blocked],
            metadata_only: [...(runtimeSpec.tool_bindings.metadata_only ?? [])],
            mock_only: [...(runtimeSpec.tool_bindings.mock_only ?? [])],
            bindings: bindings.map((binding) => ({ ...binding, warnings: [...binding.warnings] }))
        },
        approval: {
            approval_required: approvalItems.length > 0,
            approval_items: approvalItems,
            approval_status: blockedItems.length > 0 ? "blocked" : approvalItems.length > 0 ? "required" : status === "metadata_only" || status === "mock_only" ? "not_required" : status === "draft" || status === "ready_for_approval" ? "not_required" : "future_only"
        },
        checkpoint,
        blocking: {
            blocked: blockedItems.length > 0,
            blocked_items: blockedItems,
            blocked_reason: blockedItems.length > 0 ? blockedItems.map((item) => item.blocked_reason).join("; ") : undefined
        },
        execution_boundary: {
            execution_performed: false,
            live_activation_performed: false,
            external_calls_performed: false,
            statement: "No tools executed."
        },
        warnings
    };
}
function resolveHandoffStatus(runtimeSpec, bindings, approvalItems, blockedItems) {
    if ((runtimeSpec.tool_bindings.requested.length === 0) && (!bindings || bindings.length === 0))
        return "not_requested";
    if (blockedItems.length > 0)
        return "blocked";
    if (approvalItems.length > 0)
        return "requires_approval";
    if ((runtimeSpec.tool_bindings.metadata_only ?? []).length > 0 && runtimeSpec.tool_bindings.available.length === 0 && runtimeSpec.tool_bindings.requires_approval.length === 0)
        return "metadata_only";
    if ((runtimeSpec.tool_bindings.mock_only ?? []).length > 0 && runtimeSpec.tool_bindings.available.length === 0 && runtimeSpec.tool_bindings.requires_approval.length === 0)
        return "mock_only";
    if (runtimeSpec.tool_bindings.available.length > 0)
        return "draft";
    return "blocked";
}
function resolveCheckpointPolicy(status) {
    switch (status) {
        case "requires_approval":
            return {
                checkpoint_required: true,
                checkpoint_policy: "required_before_execution",
                resume_policy: "resume_requires_checkpoint"
            };
        case "blocked":
        case "metadata_only":
        case "mock_only":
        case "not_requested":
            return {
                checkpoint_required: false,
                checkpoint_policy: "not_required",
                resume_policy: "not_applicable"
            };
        case "draft":
        case "ready_for_approval":
        default:
            return {
                checkpoint_required: false,
                checkpoint_policy: "not_required",
                resume_policy: "not_applicable"
            };
    }
}
function approvalReason(toolId) {
    if (toolId === "langchain.agent_mode")
        return "LangChain agent mode requires approval.";
    if (toolId.includes("file_write"))
        return "File write requires approval.";
    if (toolId.includes("workflow_execute"))
        return "Workflow execution requires approval.";
    return "Tool requires approval under governed execution policy.";
}
function unknownBlockedReason(toolId) {
    if (toolId.includes("remote"))
        return "remote execution blocked by policy";
    return "unknown tool cannot be handed to execution safely";
}
function handoffId(runtimeSpecId, traceId, status) {
    const base = `${runtimeSpecId}:${traceId}:${status}`;
    let hash = 0;
    for (let index = 0; index < base.length; index += 1) {
        hash = ((hash << 5) - hash) + base.charCodeAt(index);
        hash |= 0;
    }
    return `handoff_${Math.abs(hash)}`;
}
