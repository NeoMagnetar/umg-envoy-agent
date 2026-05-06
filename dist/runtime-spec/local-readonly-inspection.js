import path from "node:path";
import { stableHash } from "./approval-checkpoint-contract.js";
const POLICY_VERSION = "local-readonly-inspection/v0";
const DEFAULT_MAX_DEPTH = 2;
const DEFAULT_MAX_ITEMS = 100;
const HARD_MAX_DEPTH = 5;
const HARD_MAX_ITEMS = 500;
const DEFAULT_BLOCKED_PATH_PATTERNS = [
    "c:\\",
    "c:\\windows",
    "c:\\program files",
    "c:\\program files (x86)",
    "\\appdata",
    "\\.ssh",
    "\\.aws",
    "\\.config",
    "\\.openai",
    "\\node_modules",
    "\\.git",
    "credentials",
    "credential",
    "browser profile",
    "profiles"
];
const SENSITIVE_FILENAME_PATTERNS = [".env", ".pem", ".key", "id_rsa", "credentials", "secrets", "token", "password"];
export function buildLocalReadOnlyInspectionScope(input) {
    const warnings = [];
    const root_path = normalizeScopePath(input.root_path);
    const requestedIncludeFileContents = Boolean(input.include_file_contents);
    let max_depth = input.max_depth ?? DEFAULT_MAX_DEPTH;
    let max_items = input.max_items ?? DEFAULT_MAX_ITEMS;
    if (max_depth > HARD_MAX_DEPTH) {
        max_depth = HARD_MAX_DEPTH;
        warnings.push("max_depth clamped to hard max 5");
    }
    if (max_items > HARD_MAX_ITEMS) {
        max_items = HARD_MAX_ITEMS;
        warnings.push("max_items clamped to hard max 500");
    }
    if (requestedIncludeFileContents) {
        warnings.push("include_file_contents forced to false by alpha policy");
    }
    const scope = {
        root_path,
        allowed: false,
        recursive: Boolean(input.recursive ?? false),
        max_depth,
        max_items,
        include_hidden: Boolean(input.include_hidden ?? false),
        include_system_paths: Boolean(input.include_system_paths ?? false),
        include_file_contents: false,
        allowed_extensions: input.allowed_extensions ? [...input.allowed_extensions] : undefined,
        blocked_extensions: input.blocked_extensions ? [...input.blocked_extensions] : undefined,
        blocked_path_patterns: [...DEFAULT_BLOCKED_PATH_PATTERNS],
        reason: input.reason ?? "Local read-only metadata inspection requires explicit exact-scope approval."
    };
    const validation = validateLocalReadOnlyInspectionScopeDryRun({ scope });
    scope.allowed = validation.allowed;
    scope.reason = validation.allowed ? scope.reason : validation.blocked_reasons[0] ?? scope.reason;
    if (warnings.length > 0) {
        scope.reason = `${scope.reason} Warnings: ${warnings.join("; ")}`;
    }
    return scope;
}
export function hashLocalReadOnlyInspectionScope(scope) {
    return `scope_${stableHash({
        root_path: normalizeScopePath(scope.root_path),
        recursive: scope.recursive,
        max_depth: scope.max_depth,
        max_items: scope.max_items,
        include_hidden: scope.include_hidden,
        include_system_paths: scope.include_system_paths,
        include_file_contents: scope.include_file_contents,
        allowed_extensions: scope.allowed_extensions ?? [],
        blocked_extensions: scope.blocked_extensions ?? [],
        blocked_path_patterns: scope.blocked_path_patterns,
        policy_version: POLICY_VERSION
    })}`;
}
export function validateLocalReadOnlyInspectionScopeDryRun(input) {
    const { scope } = input;
    const normalized = normalizeScopePath(scope.root_path).toLowerCase();
    const blocked_reasons = [];
    const warnings = [];
    if (normalized === "c:\\" || normalized === "/")
        blocked_reasons.push("root drive scan outside alpha policy");
    if (normalized.startsWith("c:\\windows") || normalized.startsWith("c:\\program files") || normalized.startsWith("c:\\program files (x86)"))
        blocked_reasons.push("system path blocked by local read-only alpha policy");
    if (normalized.includes("\\appdata") || normalized.includes("\\.ssh") || normalized.includes("\\.aws") || normalized.includes("\\.config") || normalized.includes("\\.openai"))
        blocked_reasons.push("private/system path blocked by local read-only alpha policy");
    if (normalized.includes("\\.git") || normalized.includes("credential") || normalized.includes("browser profile") || normalized.includes("profiles"))
        blocked_reasons.push("sensitive path blocked by local read-only alpha policy");
    if (scope.include_hidden)
        blocked_reasons.push("hidden paths are blocked by default in local read-only alpha");
    if (scope.include_system_paths)
        blocked_reasons.push("system paths are blocked by default in local read-only alpha");
    if (scope.include_file_contents)
        blocked_reasons.push("file contents are outside local read-only alpha policy");
    if (scope.max_depth > HARD_MAX_DEPTH)
        warnings.push("max_depth exceeds hard policy and should be clamped");
    if (scope.max_items > HARD_MAX_ITEMS)
        warnings.push("max_items exceeds hard policy and should be clamped");
    if (SENSITIVE_FILENAME_PATTERNS.some((pattern) => normalized.endsWith(pattern) || normalized.includes(`\\${pattern}`)))
        warnings.push("scope includes sensitive filename pattern; matching items should be skipped or redacted");
    return {
        allowed: blocked_reasons.length === 0,
        blocked_reasons: dedupe(blocked_reasons),
        warnings: dedupe(warnings)
    };
}
export function buildLocalReadOnlyInspectionPreflightDryRun(input) {
    const { runtimeSpec, handoff, approvalRequest, checkpoint, scope } = input;
    const scope_hash = hashLocalReadOnlyInspectionScope(scope);
    const scopeValidation = validateLocalReadOnlyInspectionScopeDryRun({ scope });
    const checkpointScopeHash = checkpoint?.snapshot?.extra_hashes?.local_inspection_scope_hash;
    const checks = [
        makeCheck("tool_id_exact", handoff.tool_plan.requested.includes("desktop_bridge.file_scan"), handoff.tool_plan.requested.includes("desktop_bridge.file_scan") ? "Tool id matches desktop_bridge.file_scan." : "desktop_bridge.file_scan is not present in requested tool plan."),
        makeCheck("tool_classified_local_readonly", handoff.tool_plan.bindings.some((binding) => binding.tool_id === "desktop_bridge.file_scan" && binding.governance_policy === "local_readonly_scope_required"), handoff.tool_plan.bindings.some((binding) => binding.tool_id === "desktop_bridge.file_scan" && binding.governance_policy === "local_readonly_scope_required") ? "desktop_bridge.file_scan is classified as approval-required local read-only intent." : "desktop_bridge.file_scan is not classified as local read-only approval intent."),
        makeCheck("scope_policy_valid", scopeValidation.allowed, scopeValidation.allowed ? "Scope passes local read-only alpha policy." : scopeValidation.blocked_reasons.join("; ")),
        makeCheck("approval_present", Boolean(approvalRequest), approvalRequest ? "Approval request exists for future exact-scope review." : "Explicit exact-scope approval request is required."),
        makeCheck("checkpoint_present", Boolean(checkpoint), checkpoint ? "Checkpoint exists for future replay-safe execution." : "Checkpoint is required before local inspection can proceed."),
        makeCheck("file_contents_false", scope.include_file_contents === false, scope.include_file_contents === false ? "File contents remain disabled." : "File contents are outside local read-only alpha policy."),
        makeCheck("write_delete_external_shell_false", true, "Writes, deletes, shell execution, and external calls remain disabled in this mock layer."),
        makeCheck("scope_hash_match", !checkpoint || !checkpointScopeHash || checkpointScopeHash === scope_hash, !checkpoint ? "No checkpoint scope hash present yet." : !checkpointScopeHash ? "Checkpoint exists but does not yet carry a local scope hash." : checkpointScopeHash === scope_hash ? "Checkpoint scope hash matches requested scope." : "Scope hash mismatch between checkpoint and requested scope."),
        makeCheck("support_docs_not_authorizing", !handoff.tool_plan.bindings.some((binding) => binding.tool_id === "desktop_bridge.file_scan" && binding.provenance?.source_kind === "support_only"), !handoff.tool_plan.bindings.some((binding) => binding.tool_id === "desktop_bridge.file_scan" && binding.provenance?.source_kind === "support_only") ? "Support docs are not authorizing file access." : "Support docs cannot authorize local file access.")
    ];
    let status = "pass_future_only";
    if (!scopeValidation.allowed)
        status = "blocked";
    else if (!approvalRequest)
        status = "approval_required";
    else if (!checkpoint)
        status = "checkpoint_required";
    else if (checkpointScopeHash && checkpointScopeHash !== scope_hash)
        status = "invalid";
    return {
        preflight_id: `local_preflight_${stableHash({ runtime_spec_id: runtimeSpec.runtime_spec_id, handoff_id: handoff.handoff_id, scope_hash, status })}`,
        runtime_spec_id: runtimeSpec.runtime_spec_id,
        handoff_id: handoff.handoff_id,
        tool_id: "desktop_bridge.file_scan",
        status,
        scope_hash,
        checks,
        execution_boundary: {
            local_inspection_performed: false,
            file_contents_read: false,
            write_performed: false,
            delete_performed: false,
            shell_command_executed: false,
            external_calls_performed: false,
            statement: "No local inspection performed."
        },
        warnings: dedupe([
            ...scopeValidation.warnings,
            ...(scope.root_path !== normalizeScopePath(scope.root_path) ? ["root path normalized for policy checks"] : [])
        ])
    };
}
export function buildLocalReadOnlyInspectionMockResultDryRun(input) {
    const preflight = buildLocalReadOnlyInspectionPreflightDryRun(input);
    const redacted_root = redactScopePath(input.scope.root_path);
    return {
        result_id: `local_readonly_mock_${stableHash({ runtime_spec_id: input.runtimeSpec.runtime_spec_id, handoff_id: input.handoff.handoff_id, scope_hash: preflight.scope_hash, status: preflight.status })}`,
        runtime_spec_id: input.runtimeSpec.runtime_spec_id,
        handoff_id: input.handoff.handoff_id,
        approval_request_id: input.approvalRequest?.approval_request_id,
        checkpoint_id: input.checkpoint?.checkpoint_id,
        tool_id: "desktop_bridge.file_scan",
        status: preflight.status === "pass_future_only" ? "preflight_pass_future_only" : preflight.status,
        scope: input.scope,
        scope_hash: preflight.scope_hash,
        redacted_root,
        preflight,
        payload_policy: {
            payload_type: "read_only_file_metadata",
            contains_file_contents: false,
            contains_sensitive_data: false,
            redaction_required: true,
            max_items: input.scope.max_items,
            max_depth: input.scope.max_depth
        },
        execution_boundary: {
            local_inspection_performed: false,
            file_contents_read: false,
            write_performed: false,
            delete_performed: false,
            external_calls_performed: false,
            shell_command_executed: false,
            statement: "No local inspection performed."
        },
        warnings: [...preflight.warnings]
    };
}
export function redactScopePath(root_path) {
    const normalized = normalizeScopePath(root_path);
    const parts = normalized.split(/[\\/]+/).filter(Boolean);
    if (parts.length <= 2)
        return normalized;
    return `${parts[0]}\\...\\${parts.slice(-2).join("\\")}`;
}
export function normalizeScopePath(root_path) {
    const trimmed = root_path.trim();
    if (!trimmed)
        return trimmed;
    const normalized = path.win32.normalize(trimmed).replace(/\/+/, "\\");
    return normalized.endsWith("\\") && normalized.length > 3 ? normalized.slice(0, -1) : normalized;
}
function makeCheck(check, passed, reason) {
    return { check, passed, reason };
}
function dedupe(values) {
    return values.filter((value, index, array) => Boolean(value) && array.indexOf(value) === index);
}
