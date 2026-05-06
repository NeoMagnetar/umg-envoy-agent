import fs from "node:fs/promises";
import path from "node:path";
import { stableHash } from "./approval-checkpoint-contract.js";
const POLICY_VERSION = "local-readonly-inspection/v0";
export const LOCAL_READONLY_POLICY_VERSION = POLICY_VERSION;
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
    const tempPathFragment = "\\appdata\\local\\temp\\";
    if ((normalized.includes("\\appdata") && !normalized.includes(tempPathFragment)) || normalized.includes("\\.ssh") || normalized.includes("\\.aws") || normalized.includes("\\.config") || normalized.includes("\\.openai"))
        blocked_reasons.push("private/system path blocked by local read-only alpha policy");
    if (normalized.includes("\\.git") || normalized.includes("credential") || normalized.includes("browser profile"))
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
        makeCheck("write_delete_external_shell_false", true, "Writes, deletes, shell execution, and external calls remain disabled in this layer."),
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
export function buildLocalReadOnlyApprovalToken(input) {
    return `approval_scope_${stableHash({ scope_hash: input.scope_hash, tool_id: input.tool_id, policy_version: input.policy_version ?? POLICY_VERSION, payload_policy: "read_only_file_metadata" })}`;
}
export function verifyLocalReadOnlyApprovalToken(input) {
    return input.approval_token === buildLocalReadOnlyApprovalToken({ scope_hash: input.scope_hash, tool_id: input.tool_id, policy_version: input.policy_version });
}
export function buildLocalReadOnlyInspectionPlanDryRun(input) {
    const scope = buildLocalReadOnlyInspectionScope({
        root_path: input.root_path,
        recursive: input.recursive,
        max_depth: input.max_depth,
        max_items: input.max_items,
        include_hidden: input.include_hidden,
        include_system_paths: input.include_system_paths,
        include_file_contents: input.include_file_contents,
        reason: "Local read-only metadata inspection requested."
    });
    const redacted_root = redactScopePath(scope.root_path);
    const scope_hash = hashLocalReadOnlyInspectionScope(scope);
    const approval_request = buildApprovalRequestV0Bridge(input.handoff, scope, redacted_root);
    const checkpoint_preview = scope.allowed ? buildCheckpointV0Bridge(input.handoff, approval_request, scope_hash) : undefined;
    const preflight = buildLocalReadOnlyInspectionPreflightDryRun({
        runtimeSpec: input.runtimeSpec,
        handoff: input.handoff,
        approvalRequest: approval_request,
        checkpoint: checkpoint_preview,
        scope
    });
    const approval_token = scope.allowed ? buildLocalReadOnlyApprovalToken({ scope_hash, tool_id: "desktop_bridge.file_scan" }) : undefined;
    return {
        status: !scope.allowed ? "blocked" : checkpoint_preview ? "checkpoint_required" : "approval_required",
        scope,
        redacted_root,
        scope_hash,
        approval_token,
        approval_request,
        checkpoint_preview,
        preflight,
        execution_boundary: {
            local_inspection_performed: false,
            statement: "No local inspection performed."
        },
        warnings: [...preflight.warnings]
    };
}
export async function executeApprovedLocalReadOnlyMetadataScan(input) {
    const scope = buildLocalReadOnlyInspectionScope({
        root_path: input.root_path,
        recursive: input.recursive,
        max_depth: input.max_depth,
        max_items: input.max_items,
        include_hidden: input.include_hidden,
        include_system_paths: input.include_system_paths,
        include_file_contents: input.include_file_contents,
        reason: "Local read-only metadata inspection requested."
    });
    const scope_hash = hashLocalReadOnlyInspectionScope(scope);
    const redacted_root = redactScopePath(scope.root_path);
    if (!input.scope_hash || input.scope_hash !== scope_hash) {
        return buildRejectedLocalReadonlyResult(input.runtimeSpec.runtime_spec_id, input.handoff.handoff_id, scope, scope_hash, redacted_root, "invalid", ["scope hash mismatch"]);
    }
    if (!input.approval_token || !verifyLocalReadOnlyApprovalToken({ approval_token: input.approval_token, scope_hash, tool_id: "desktop_bridge.file_scan" })) {
        return buildRejectedLocalReadonlyResult(input.runtimeSpec.runtime_spec_id, input.handoff.handoff_id, scope, scope_hash, redacted_root, "invalid", ["missing or invalid approval token"]);
    }
    if (!input.user_approved_exact_scope) {
        return buildRejectedLocalReadonlyResult(input.runtimeSpec.runtime_spec_id, input.handoff.handoff_id, scope, scope_hash, redacted_root, "approval_required", ["explicit exact-scope approval flag is required"]);
    }
    if (!input.confirm_no_file_contents) {
        return buildRejectedLocalReadonlyResult(input.runtimeSpec.runtime_spec_id, input.handoff.handoff_id, scope, scope_hash, redacted_root, "invalid", ["confirm_no_file_contents must be true"]);
    }
    const approvalRequest = buildApprovalRequestV0Bridge(input.handoff, scope, redacted_root);
    const checkpoint = buildCheckpointV0Bridge(input.handoff, approvalRequest, scope_hash);
    const preflight = buildLocalReadOnlyInspectionPreflightDryRun({ runtimeSpec: input.runtimeSpec, handoff: input.handoff, approvalRequest: approvalRequest, checkpoint, scope });
    if (preflight.status !== "pass_future_only") {
        return buildRejectedLocalReadonlyResult(input.runtimeSpec.runtime_spec_id, input.handoff.handoff_id, scope, scope_hash, redacted_root, preflight.status === "blocked" ? "blocked" : preflight.status === "approval_required" ? "approval_required" : preflight.status === "checkpoint_required" ? "checkpoint_required" : "invalid", preflight.warnings);
    }
    return executeLocalReadOnlyMetadataScan({ runtimeSpec: input.runtimeSpec, handoff: input.handoff, approvalRequest, checkpoint, scope, preflight });
}
export async function executeLocalReadOnlyMetadataScan(input) {
    const { runtimeSpec, handoff, approvalRequest, checkpoint, scope, preflight } = input;
    const scope_hash = hashLocalReadOnlyInspectionScope(scope);
    const redacted_root = redactScopePath(scope.root_path);
    if (preflight.status !== "pass_future_only") {
        return blockedScanResult(runtimeSpec.runtime_spec_id, handoff.handoff_id, approvalRequest.approval_request_id, checkpoint.checkpoint_id, scope, redacted_root, "preflight_failed", "No local inspection performed.");
    }
    const checkpointScopeHash = checkpoint.snapshot.extra_hashes?.local_inspection_scope_hash;
    if (!checkpointScopeHash || checkpointScopeHash !== scope_hash) {
        return blockedScanResult(runtimeSpec.runtime_spec_id, handoff.handoff_id, approvalRequest.approval_request_id, checkpoint.checkpoint_id, scope, redacted_root, "preflight_failed", "No local inspection performed.", ["scope hash mismatch prevents local inspection"]);
    }
    const validation = validateLocalReadOnlyInspectionScopeDryRun({ scope });
    if (!validation.allowed) {
        return blockedScanResult(runtimeSpec.runtime_spec_id, handoff.handoff_id, approvalRequest.approval_request_id, checkpoint.checkpoint_id, scope, redacted_root, "blocked", "No local inspection performed.", validation.blocked_reasons);
    }
    const items = [];
    let file_count = 0;
    let directory_count = 0;
    let skipped_count = 0;
    let truncated = false;
    const warnings = [...preflight.warnings];
    const root = normalizeScopePath(scope.root_path);
    async function walk(currentPath, depth) {
        if (items.length >= scope.max_items) {
            truncated = true;
            return;
        }
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        for (const entry of entries) {
            if (items.length >= scope.max_items) {
                truncated = true;
                return;
            }
            const entryPath = path.join(currentPath, entry.name);
            const relative_path = normalizeRelativePath(path.relative(root, entryPath));
            if (!relative_path || relative_path.startsWith("..")) {
                skipped_count += 1;
                items.push(skippedMetadata(entry.name, relative_path || entry.name, depth + 1, "path_outside_scope"));
                continue;
            }
            if (isSensitiveName(entry.name) || isSensitiveName(relative_path)) {
                skipped_count += 1;
                items.push(skippedMetadata(redactSensitiveName(entry.name), redactSensitiveRelative(relative_path), depth + 1, "sensitive_filename_pattern"));
                continue;
            }
            let stats;
            try {
                stats = await fs.lstat(entryPath);
            }
            catch {
                skipped_count += 1;
                items.push(skippedMetadata(entry.name, relative_path, depth + 1, "metadata_unavailable"));
                continue;
            }
            if (stats.isSymbolicLink()) {
                skipped_count += 1;
                items.push(skippedMetadata(entry.name, relative_path, depth + 1, "symlink_or_reparse_point_not_followed"));
                continue;
            }
            if (entry.name.startsWith(".") && !scope.include_hidden) {
                skipped_count += 1;
                items.push(skippedMetadata(entry.name, relative_path, depth + 1, "hidden_path_blocked_by_policy"));
                continue;
            }
            if (stats.isDirectory()) {
                directory_count += 1;
                const child_count = depth + 1 <= scope.max_depth && scope.recursive ? await safeChildCount(entryPath) : undefined;
                items.push({
                    name: entry.name,
                    relative_path,
                    item_type: "directory",
                    modified_at: stats.mtime.toISOString(),
                    created_at: stats.birthtime ? stats.birthtime.toISOString() : undefined,
                    depth: depth + 1,
                    child_count
                });
                if (scope.recursive && depth + 1 < scope.max_depth) {
                    await walk(entryPath, depth + 1);
                }
                continue;
            }
            if (stats.isFile()) {
                file_count += 1;
                items.push({
                    name: entry.name,
                    relative_path,
                    item_type: "file",
                    extension: path.extname(entry.name) || undefined,
                    size_bytes: stats.size,
                    modified_at: stats.mtime.toISOString(),
                    created_at: stats.birthtime ? stats.birthtime.toISOString() : undefined,
                    depth: depth + 1
                });
            }
        }
    }
    await walk(root, 0);
    if (truncated)
        warnings.push("result truncated at max_items");
    return {
        result_id: `local_readonly_result_${stableHash({ runtime_spec_id: runtimeSpec.runtime_spec_id, handoff_id: handoff.handoff_id, scope_hash, item_count: items.length })}`,
        runtime_spec_id: runtimeSpec.runtime_spec_id,
        handoff_id: handoff.handoff_id,
        approval_request_id: approvalRequest.approval_request_id,
        checkpoint_id: checkpoint.checkpoint_id,
        tool_id: "desktop_bridge.file_scan",
        status: "executed_read_only",
        scope,
        payload_policy: {
            payload_type: "read_only_file_metadata",
            contains_file_contents: false,
            contains_sensitive_data: false,
            redaction_applied: true,
            max_items: scope.max_items,
            max_depth: scope.max_depth
        },
        summary: {
            root_path_redacted: redacted_root,
            item_count: items.length,
            file_count,
            directory_count,
            skipped_count,
            truncated
        },
        items,
        execution_boundary: {
            read_only_scan_performed: true,
            file_contents_read: false,
            write_performed: false,
            delete_performed: false,
            external_calls_performed: false,
            shell_command_executed: false,
            statement: "Local read-only metadata scan completed."
        },
        warnings
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
function normalizeRelativePath(value) {
    return value.replace(/\\/g, "/");
}
function isSensitiveName(value) {
    const lower = value.toLowerCase();
    return SENSITIVE_FILENAME_PATTERNS.some((pattern) => lower === pattern || lower.endsWith(pattern) || lower.includes(pattern));
}
function redactSensitiveName(value) {
    return value.startsWith(".") ? "[redacted-sensitive]" : `${value.slice(0, 1)}[redacted]`;
}
function redactSensitiveRelative(value) {
    const segments = value.split(/[\\/]+/);
    if (segments.length === 0)
        return "[redacted-sensitive]";
    segments[segments.length - 1] = redactSensitiveName(segments[segments.length - 1]);
    return segments.join("/");
}
function skippedMetadata(name, relative_path, depth, skipped_reason) {
    return {
        name,
        relative_path,
        item_type: "file",
        depth,
        skipped: true,
        skipped_reason
    };
}
async function safeChildCount(entryPath) {
    try {
        const entries = await fs.readdir(entryPath, { withFileTypes: true });
        return entries.length;
    }
    catch {
        return undefined;
    }
}
function buildApprovalRequestV0Bridge(handoff, scope, redacted_root) {
    return {
        approval_request_id: `approval_request_${stableHash({ handoff_id: handoff.handoff_id, tool_id: "desktop_bridge.file_scan", root: scope.root_path })}`,
        handoff_id: handoff.handoff_id,
        runtime_spec_id: handoff.runtime_spec_id,
        trace_id: handoff.trace_id,
        status: "required",
        mode: "dry_run",
        requested_action_summary: `Future local read-only metadata inspection would require approval for ${redacted_root}.`,
        selected_context: { ...handoff.selected_context },
        approval_items: [{
                item_id: `${handoff.handoff_id}:approval_item:desktop_bridge.file_scan`,
                tool_id: "desktop_bridge.file_scan",
                requested_by: { artifact_id: handoff.handoff_id, artifact_kind: "runtime_spec" },
                risk_level: "medium",
                execution_mode: "approval_required",
                reason: "exact local read-only metadata inspection",
                user_visible_risk: "desktop_bridge.file_scan can reveal local file and folder names, structure, and timestamps.",
                approval_scope: "single_handoff",
                status: "requires_approval"
            }],
        blocked_items: [],
        user_visible_summary: {
            title: "Approval required for local read-only metadata inspection",
            plain_language_summary: `Tool: desktop_bridge.file_scan; Root Path: ${redacted_root}; Recursive: ${scope.recursive}; Max Depth: ${scope.max_depth}; Max Items: ${scope.max_items}; File Contents: no; Writes: no; Deletes: no; External Calls: no.`,
            tools_requested: ["desktop_bridge.file_scan"],
            risks: ["Local metadata scan can reveal filenames, folder names, and timestamps."],
            blocked_items: [],
            checkpoint_required: true,
            execution_statement: "No tools executed."
        },
        constraints: {
            single_use: true,
            exact_match_required: true,
            blocked_items_cannot_be_approved: true
        },
        warnings: []
    };
}
function buildCheckpointV0Bridge(handoff, approvalRequest, scope_hash) {
    return {
        checkpoint_id: `checkpoint_${stableHash({ handoff_id: handoff.handoff_id, scope_hash })}`,
        handoff_id: handoff.handoff_id,
        approval_request_id: approvalRequest.approval_request_id,
        runtime_spec_id: handoff.runtime_spec_id,
        trace_id: handoff.trace_id,
        status: "required",
        snapshot: {
            runtime_spec_hash: stableHash({ runtime_spec_id: handoff.runtime_spec_id, trace_id: handoff.trace_id }),
            tool_plan_hash: stableHash(handoff.tool_plan),
            selected_context_hash: stableHash(handoff.selected_context),
            approval_request_hash: stableHash(approvalRequest),
            policy_version: POLICY_VERSION,
            extra_hashes: {
                local_inspection_scope_hash: scope_hash
            }
        },
        replay_guard: {
            exact_match_required: true,
            blocked_if_policy_changed: true,
            blocked_if_runtime_spec_changed: true,
            blocked_if_tool_plan_changed: true
        },
        execution_boundary: {
            execution_performed: false,
            checkpoint_written: false,
            statement: "No tools executed."
        },
        warnings: []
    };
}
function buildRejectedLocalReadonlyResult(runtime_spec_id, handoff_id, scope, scope_hash, redacted_root, status, warnings) {
    return {
        result_id: `local_readonly_mock_${stableHash({ runtime_spec_id, handoff_id, scope_hash, status })}`,
        runtime_spec_id,
        handoff_id,
        tool_id: "desktop_bridge.file_scan",
        status,
        scope,
        scope_hash,
        redacted_root,
        preflight: {
            preflight_id: `local_preflight_${stableHash({ runtime_spec_id, handoff_id, scope_hash, status })}`,
            runtime_spec_id,
            handoff_id,
            tool_id: "desktop_bridge.file_scan",
            status: status === "approval_required" ? "approval_required" : status === "checkpoint_required" ? "checkpoint_required" : status === "blocked" ? "blocked" : "invalid",
            scope_hash,
            checks: [],
            execution_boundary: {
                local_inspection_performed: false,
                file_contents_read: false,
                write_performed: false,
                delete_performed: false,
                shell_command_executed: false,
                external_calls_performed: false,
                statement: "No local inspection performed."
            },
            warnings
        },
        payload_policy: {
            payload_type: "read_only_file_metadata",
            contains_file_contents: false,
            contains_sensitive_data: false,
            redaction_required: true,
            max_items: scope.max_items,
            max_depth: scope.max_depth
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
        warnings
    };
}
function blockedScanResult(runtime_spec_id, handoff_id, approval_request_id, checkpoint_id, scope, redacted_root, status, statement, warnings = []) {
    return {
        result_id: `local_readonly_result_${stableHash({ runtime_spec_id, handoff_id, status, root: scope.root_path })}`,
        runtime_spec_id,
        handoff_id,
        approval_request_id,
        checkpoint_id,
        tool_id: "desktop_bridge.file_scan",
        status,
        scope,
        payload_policy: {
            payload_type: "read_only_file_metadata",
            contains_file_contents: false,
            contains_sensitive_data: false,
            redaction_applied: true,
            max_items: scope.max_items,
            max_depth: scope.max_depth
        },
        summary: {
            root_path_redacted: redacted_root,
            item_count: 0,
            file_count: 0,
            directory_count: 0,
            skipped_count: 0,
            truncated: false
        },
        items: [],
        execution_boundary: {
            read_only_scan_performed: false,
            file_contents_read: false,
            write_performed: false,
            delete_performed: false,
            external_calls_performed: false,
            shell_command_executed: false,
            statement
        },
        warnings
    };
}
function makeCheck(check, passed, reason) {
    return { check, passed, reason };
}
function dedupe(values) {
    return values.filter((value, index, array) => Boolean(value) && array.indexOf(value) === index);
}
