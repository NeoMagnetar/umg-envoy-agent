import { createApprovalCheckpoint } from "./approval-checkpoint.js";
import { storeApprovalCheckpoint } from "./approval-store.js";
export const NEOSTACK_ID = "NS.UMG.LANGCHAIN_BRIDGE.v0.1";
function event(payload, event_type, message, data = {}, tool_id = null) {
    return {
        event_type,
        timestamp_utc: new Date().toISOString(),
        sleeve_id: payload.sleeve_id ?? "UNKNOWN",
        neostack_id: NEOSTACK_ID,
        tool_id,
        message,
        data
    };
}
export function validatePayload(payload) {
    if (payload.neostack_id !== NEOSTACK_ID)
        throw new Error(`Wrong neostack_id: ${payload.neostack_id}`);
    for (const key of ["call_mode", "sleeve_id", "task", "provider", "tools", "trace"]) {
        if (!(key in payload))
            throw new Error(`Missing required runtime field: ${key}`);
    }
    return [event(payload, "RUNTIME_CONTRACT_VALIDATED", "Runtime payload accepted.")];
}
export function filterTools(payload) {
    const allowed = new Set(payload.tools.allowed ?? []);
    const approval = new Set(payload.tools.approval_required ?? []);
    const blocked = new Set(payload.tools.blocked ?? []);
    const definitions = payload.tools.definitions ?? [];
    const events = [event(payload, "SLEEVE_PERMISSION_PROFILE_APPLIED", "Sleeve permission profile applied before tool registration.", { allowed: [...allowed], approval_required: [...approval], blocked: [...blocked] })];
    const decisions = definitions.map((tool) => {
        let decision = "deny";
        let reason = "Tool was not explicitly allowed by the sleeve permission profile.";
        if (blocked.has(tool.tool_name) || tool.permission_level === "blocked") {
            decision = "deny";
            reason = "Tool is blocked by sleeve or tool contract.";
        }
        else if (approval.has(tool.tool_name) || tool.requires_approval || ["high", "destructive", "sensitive"].includes(tool.risk_class) || tool.permission_level === "approval_required") {
            decision = "approval_required";
            reason = "Tool requires approval because of sleeve profile, permission level, or risk class.";
        }
        else if (allowed.has(tool.tool_name) && ["read_only", "draft_only", "safe_execute"].includes(tool.permission_level)) {
            decision = "allow";
            reason = "Tool is explicitly allowed and below approval threshold.";
        }
        events.push(event(payload, "TOOL_DECISION", reason, { tool_name: tool.tool_name, decision, permission_level: tool.permission_level, risk_class: tool.risk_class }, tool.tool_id));
        return { tool, decision, reason };
    });
    events.push(event(payload, "TOOLS_FILTERED", "Tool permission filtering complete.", { allowed_count: decisions.filter(d => d.decision === "allow").length, approval_count: decisions.filter(d => d.decision === "approval_required").length, denied_count: decisions.filter(d => d.decision === "deny").length }));
    return { decisions, events };
}
const PHASE2_ALLOWLIST = new Set(["umg_envoy_status"]);
function canExecuteInPhase2(tool, decision) {
    return decision === "allow"
        && tool.tool_name === "umg_envoy_status"
        && PHASE2_ALLOWLIST.has(tool.tool_name)
        && tool.permission_level === "read_only"
        && tool.risk_class === "low";
}
export async function invokeLangChainBridge(payload, options) {
    const trace_events = [event(payload, "NEOSTACK_LOADED", "UMG LangChain Bridge loaded."), event(payload, "NEOSTACK_INVOKE_RECEIVED", "NeoStack invoke request received.", { call_mode: payload.call_mode, bridge_mode: payload.bridge_mode })];
    trace_events.push(...validatePayload(payload));
    const { decisions, events } = filterTools(payload);
    trace_events.push(...events);
    for (const decision of decisions) {
        trace_events.push(event(payload, "TOOL_PERMISSION_CLASSIFIED", `Tool ${decision.tool.tool_name} classified as ${decision.decision}.`, {
            tool_name: decision.tool.tool_name,
            decision: decision.decision,
            permission_level: decision.tool.permission_level,
            risk_class: decision.tool.risk_class
        }, decision.tool.tool_id));
    }
    const allowed_tools = decisions.filter(d => d.decision === "allow").map(d => d.tool);
    const approval_requests = decisions.filter(d => d.decision === "approval_required");
    const denied_tools = decisions.filter(d => d.decision === "deny");
    const approval_checkpoints = approval_requests.map((item) => {
        const checkpoint = createApprovalCheckpoint(payload, item.tool);
        const stored = storeApprovalCheckpoint(checkpoint);
        stored.trace = [
            ...stored.trace,
            event(payload, "APPROVAL_CHECKPOINT_STORED", "Approval checkpoint stored in the local approval store.", { approval_id: stored.approval_id }, item.tool.tool_id)
        ];
        return stored;
    });
    const execution_results = [];
    const warnings = [];
    const errors = [];
    for (let i = 0; i < approval_requests.length; i++) {
        const item = approval_requests[i];
        const checkpoint = approval_checkpoints[i];
        trace_events.push(event(payload, "TOOL_EXECUTION_SKIPPED_APPROVAL_REQUIRED", "Tool execution skipped because approval is required.", { tool_name: item.tool.tool_name, approval_id: checkpoint?.approval_id ?? null }, item.tool.tool_id));
        if (checkpoint) {
            trace_events.push(...checkpoint.trace);
        }
    }
    for (const item of denied_tools) {
        trace_events.push(event(payload, "TOOL_EXECUTION_DENIED", "Tool execution denied by permission filter.", { tool_name: item.tool.tool_name }, item.tool.tool_id));
    }
    const executor = options?.executor;
    const invokeMode = payload.invoke_mode ?? (payload.call_mode === "validation_only" ? "dry_run" : executor ? "direct_execute" : "dry_run");
    if (invokeMode === "dry_run" || payload.call_mode === "validation_only" || !executor && invokeMode !== "agent_execute") {
        trace_events.push(event(payload, "PROVIDER_SELECTED", "Provider selection placeholder emitted. Bind to LangChain provider adapter in runtime.", payload.provider));
        trace_events.push(event(payload, "AGENT_OR_GRAPH_CREATED", "Execution runtime placeholder emitted. Bind to create_agent or LangGraph graph runtime as needed.", { call_mode: payload.call_mode, bridge_mode: payload.bridge_mode }));
        trace_events.push(event(payload, "NEOSTACK_INVOKE_COMPLETED", "Dry-run NeoStack invocation completed without executing external tools."));
        return {
            neostack_id: NEOSTACK_ID,
            sleeve_id: payload.sleeve_id,
            status: "dry_run_ready",
            result: "LangChain Bridge payload validated. Tools filtered. Bind real LangChain/OpenClaw runtime to execute.",
            allowed_tools,
            approval_requests,
            approval_checkpoints,
            denied_tools,
            execution_results,
            trace_events,
            warnings: ["This adapter is safe-by-default and does not execute tools until OpenClaw/LangChain bindings are attached."],
            errors
        };
    }
    if (invokeMode === "agent_execute") {
        trace_events.push(event(payload, "LANGCHAIN_AGENT_MODE_REQUESTED", "LangChain agent execution mode requested."));
        if (!executor || !options?.agentRunner) {
            const error = "LangChain agent execution is unavailable because the executor or agent runner is not bound.";
            errors.push(error);
            trace_events.push(event(payload, "LANGCHAIN_AGENT_CREATE_FAILED", "LangChain agent execution prerequisites are missing.", { error }));
            trace_events.push(event(payload, "NEOSTACK_INVOKE_COMPLETED", "NeoStack invocation completed with LangChain agent setup failure."));
            return {
                neostack_id: NEOSTACK_ID,
                sleeve_id: payload.sleeve_id,
                status: "agent_execution_unavailable",
                result: "LangChain agent execution is unavailable.",
                allowed_tools,
                approval_requests,
                approval_checkpoints,
                denied_tools,
                execution_results,
                trace_events,
                warnings,
                errors
            };
        }
        const approvedTools = decisions.filter((item) => canExecuteInPhase2(item.tool, item.decision)).map((item) => item.tool);
        const boundExecutor = executor;
        const agentResult = await options.agentRunner(payload, approvedTools, boundExecutor);
        execution_results.push({ mode: "agent_execute", status: agentResult.status ?? (agentResult.ok ? "succeeded" : "failed"), output: agentResult.output ?? null, reason: agentResult.reason ?? null, provider: agentResult.provider ?? null, missing: agentResult.missing ?? [], executed: agentResult.executed ?? false, tools_exposed_to_agent: agentResult.tools_exposed_to_agent ?? [] });
        trace_events.push(...agentResult.traceEvents);
        warnings.push(...agentResult.warnings);
        errors.push(...agentResult.errors);
        trace_events.push(event(payload, "NEOSTACK_INVOKE_COMPLETED", "NeoStack invocation completed.", { executed_count: execution_results.length, invoke_mode: invokeMode }));
        return {
            neostack_id: NEOSTACK_ID,
            sleeve_id: payload.sleeve_id,
            ok: agentResult.ok,
            mode: "agent_execute",
            status: agentResult.status ?? (agentResult.ok ? "agent_execution_complete" : "agent_execution_failed"),
            reason: agentResult.reason,
            provider: agentResult.provider,
            missing: agentResult.missing ?? [],
            executed: agentResult.executed ?? false,
            tools_exposed_to_agent: agentResult.tools_exposed_to_agent ?? approvedTools.map((tool) => tool.tool_name),
            message: agentResult.message ?? (agentResult.ok ? "Phase 3 LangChain agent execution completed." : "Phase 3 LangChain agent execution failed."),
            result: agentResult.ok ? "Phase 3 LangChain agent execution completed." : "Phase 3 LangChain agent execution failed.",
            allowed_tools,
            approval_requests,
            approval_checkpoints,
            denied_tools,
            execution_results,
            trace_events,
            warnings,
            errors
        };
    }
    const directExecutor = executor;
    for (const item of decisions) {
        const tool = item.tool;
        if (!canExecuteInPhase2(tool, item.decision)) {
            if (item.decision === "allow") {
                warnings.push(`Allowed tool is not executable in Phase 2: ${tool.tool_name}`);
                trace_events.push(event(payload, "TOOL_EXECUTION_DENIED", "Allowed tool is outside the hardcoded Phase 2 execution allowlist or safety envelope.", { tool_name: tool.tool_name }, tool.tool_id));
            }
            continue;
        }
        trace_events.push(event(payload, "TOOL_EXECUTION_ALLOWED", "Tool execution allowed by Phase 2 read-only binding policy.", { tool_name: tool.tool_name }, tool.tool_id));
        trace_events.push(event(payload, "TOOL_EXECUTION_STARTED", "Tool execution started.", { tool_name: tool.tool_name }, tool.tool_id));
        try {
            const output = await directExecutor.execute(tool.tool_name, {});
            execution_results.push({ tool_name: tool.tool_name, tool_id: tool.tool_id, status: "succeeded", output });
            trace_events.push(event(payload, "TOOL_EXECUTION_SUCCEEDED", "Tool execution succeeded.", { tool_name: tool.tool_name }, tool.tool_id));
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            execution_results.push({ tool_name: tool.tool_name, tool_id: tool.tool_id, status: "failed", error: message });
            errors.push(`Tool execution failed for ${tool.tool_name}: ${message}`);
            trace_events.push(event(payload, "TOOL_EXECUTION_FAILED", "Tool execution failed.", { tool_name: tool.tool_name, error: message }, tool.tool_id));
        }
    }
    trace_events.push(event(payload, "NEOSTACK_INVOKE_COMPLETED", "NeoStack invocation completed.", { executed_count: execution_results.length, invoke_mode: invokeMode }));
    return {
        neostack_id: NEOSTACK_ID,
        sleeve_id: payload.sleeve_id,
        status: errors.length === 0 ? "execution_complete" : "execution_failed",
        result: execution_results.length > 0 ? "Phase 2 read-only tool execution completed." : "No executable Phase 2 tools were run.",
        allowed_tools,
        approval_requests,
        approval_checkpoints,
        denied_tools,
        execution_results,
        trace_events,
        warnings,
        errors
    };
}
