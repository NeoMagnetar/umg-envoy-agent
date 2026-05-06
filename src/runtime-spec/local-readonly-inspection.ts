import fs from "node:fs/promises";
import path from "node:path";
import type { ApprovalRequestV0, ExecutionCheckpointRecordV0 } from "./approval-checkpoint-contract-types.js";
import { stableHash } from "./approval-checkpoint-contract.js";
import type { GovernedExecutionHandoffV0 } from "./governed-execution-handoff-types.js";
import type { LocalReadOnlyFileMetadataV0, LocalReadOnlyInspectionResultV0, LocalReadOnlyInspectionScopeV0 } from "./local-readonly-inspection-types.js";
import type { RuntimeSpecV0 } from "./types.js";

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

export interface LocalReadOnlyInspectionPreflightResultV0 {
  preflight_id: string;
  runtime_spec_id: string;
  handoff_id: string;
  tool_id: "desktop_bridge.file_scan";
  status: "pass_future_only" | "approval_required" | "checkpoint_required" | "blocked" | "invalid";
  scope_hash: string;
  checks: {
    check: string;
    passed: boolean;
    reason: string;
  }[];
  execution_boundary: {
    local_inspection_performed: false;
    file_contents_read: false;
    write_performed: false;
    delete_performed: false;
    shell_command_executed: false;
    external_calls_performed: false;
    statement: "No local inspection performed.";
  };
  warnings: string[];
}

export interface LocalReadOnlyInspectionMockResultV0 {
  result_id: string;
  runtime_spec_id: string;
  handoff_id: string;
  approval_request_id?: string;
  checkpoint_id?: string;
  tool_id: "desktop_bridge.file_scan";
  status: "approval_required" | "checkpoint_required" | "preflight_pass_future_only" | "blocked" | "invalid";
  scope: LocalReadOnlyInspectionScopeV0;
  scope_hash: string;
  redacted_root: string;
  preflight: LocalReadOnlyInspectionPreflightResultV0;
  payload_policy: {
    payload_type: "read_only_file_metadata";
    contains_file_contents: false;
    contains_sensitive_data: false;
    redaction_required: boolean;
    max_items: number;
    max_depth: number;
  };
  execution_boundary: {
    local_inspection_performed: false;
    file_contents_read: false;
    write_performed: false;
    delete_performed: false;
    external_calls_performed: false;
    shell_command_executed: false;
    statement: "No local inspection performed.";
  };
  warnings: string[];
}

export function buildLocalReadOnlyInspectionScope(input: {
  root_path: string;
  recursive?: boolean;
  max_depth?: number;
  max_items?: number;
  include_hidden?: boolean;
  include_system_paths?: boolean;
  include_file_contents?: boolean;
  allowed_extensions?: string[];
  blocked_extensions?: string[];
  reason?: string;
}): LocalReadOnlyInspectionScopeV0 {
  const warnings: string[] = [];
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

  const scope: LocalReadOnlyInspectionScopeV0 = {
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

export function hashLocalReadOnlyInspectionScope(scope: LocalReadOnlyInspectionScopeV0): string {
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

export function validateLocalReadOnlyInspectionScopeDryRun(input: {
  scope: LocalReadOnlyInspectionScopeV0;
}): {
  allowed: boolean;
  blocked_reasons: string[];
  warnings: string[];
} {
  const { scope } = input;
  const normalized = normalizeScopePath(scope.root_path).toLowerCase();
  const blocked_reasons: string[] = [];
  const warnings: string[] = [];

  if (normalized === "c:\\" || normalized === "/") blocked_reasons.push("root drive scan outside alpha policy");
  if (normalized.startsWith("c:\\windows") || normalized.startsWith("c:\\program files") || normalized.startsWith("c:\\program files (x86)")) blocked_reasons.push("system path blocked by local read-only alpha policy");
  const tempPathFragment = "\\appdata\\local\\temp\\";
  if ((normalized.includes("\\appdata") && !normalized.includes(tempPathFragment)) || normalized.includes("\\.ssh") || normalized.includes("\\.aws") || normalized.includes("\\.config") || normalized.includes("\\.openai")) blocked_reasons.push("private/system path blocked by local read-only alpha policy");
  if (normalized.includes("\\.git") || normalized.includes("credential") || normalized.includes("browser profile")) blocked_reasons.push("sensitive path blocked by local read-only alpha policy");
  if (scope.include_hidden) blocked_reasons.push("hidden paths are blocked by default in local read-only alpha");
  if (scope.include_system_paths) blocked_reasons.push("system paths are blocked by default in local read-only alpha");
  if (scope.include_file_contents) blocked_reasons.push("file contents are outside local read-only alpha policy");
  if (scope.max_depth > HARD_MAX_DEPTH) warnings.push("max_depth exceeds hard policy and should be clamped");
  if (scope.max_items > HARD_MAX_ITEMS) warnings.push("max_items exceeds hard policy and should be clamped");
  if (SENSITIVE_FILENAME_PATTERNS.some((pattern) => normalized.endsWith(pattern) || normalized.includes(`\\${pattern}`))) warnings.push("scope includes sensitive filename pattern; matching items should be skipped or redacted");

  return {
    allowed: blocked_reasons.length === 0,
    blocked_reasons: dedupe(blocked_reasons),
    warnings: dedupe(warnings)
  };
}

export function buildLocalReadOnlyInspectionPreflightDryRun(input: {
  runtimeSpec: RuntimeSpecV0;
  handoff: GovernedExecutionHandoffV0;
  approvalRequest?: ApprovalRequestV0;
  checkpoint?: ExecutionCheckpointRecordV0;
  scope: LocalReadOnlyInspectionScopeV0;
}): LocalReadOnlyInspectionPreflightResultV0 {
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

  let status: LocalReadOnlyInspectionPreflightResultV0["status"] = "pass_future_only";
  if (!scopeValidation.allowed) status = "blocked";
  else if (!approvalRequest) status = "approval_required";
  else if (!checkpoint) status = "checkpoint_required";
  else if (checkpointScopeHash && checkpointScopeHash !== scope_hash) status = "invalid";

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

export function buildLocalReadOnlyInspectionMockResultDryRun(input: {
  runtimeSpec: RuntimeSpecV0;
  handoff: GovernedExecutionHandoffV0;
  approvalRequest?: ApprovalRequestV0;
  checkpoint?: ExecutionCheckpointRecordV0;
  scope: LocalReadOnlyInspectionScopeV0;
}): LocalReadOnlyInspectionMockResultV0 {
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

export async function executeLocalReadOnlyMetadataScan(input: {
  runtimeSpec: RuntimeSpecV0;
  handoff: GovernedExecutionHandoffV0;
  approvalRequest: ApprovalRequestV0;
  checkpoint: ExecutionCheckpointRecordV0;
  scope: LocalReadOnlyInspectionScopeV0;
  preflight: LocalReadOnlyInspectionPreflightResultV0;
}): Promise<LocalReadOnlyInspectionResultV0> {
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

  const items: LocalReadOnlyFileMetadataV0[] = [];
  let file_count = 0;
  let directory_count = 0;
  let skipped_count = 0;
  let truncated = false;
  const warnings: string[] = [...preflight.warnings];
  const root = normalizeScopePath(scope.root_path);

  async function walk(currentPath: string, depth: number): Promise<void> {
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
      } catch {
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
  if (truncated) warnings.push("result truncated at max_items");

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

export function redactScopePath(root_path: string): string {
  const normalized = normalizeScopePath(root_path);
  const parts = normalized.split(/[\\/]+/).filter(Boolean);
  if (parts.length <= 2) return normalized;
  return `${parts[0]}\\...\\${parts.slice(-2).join("\\")}`;
}

export function normalizeScopePath(root_path: string): string {
  const trimmed = root_path.trim();
  if (!trimmed) return trimmed;
  const normalized = path.win32.normalize(trimmed).replace(/\/+/, "\\");
  return normalized.endsWith("\\") && normalized.length > 3 ? normalized.slice(0, -1) : normalized;
}

function normalizeRelativePath(value: string): string {
  return value.replace(/\\/g, "/");
}

function isSensitiveName(value: string): boolean {
  const lower = value.toLowerCase();
  return SENSITIVE_FILENAME_PATTERNS.some((pattern) => lower === pattern || lower.endsWith(pattern) || lower.includes(pattern));
}

function redactSensitiveName(value: string): string {
  return value.startsWith(".") ? "[redacted-sensitive]" : `${value.slice(0, 1)}[redacted]`;
}

function redactSensitiveRelative(value: string): string {
  const segments = value.split(/[\\/]+/);
  if (segments.length === 0) return "[redacted-sensitive]";
  segments[segments.length - 1] = redactSensitiveName(segments[segments.length - 1]);
  return segments.join("/");
}

function skippedMetadata(name: string, relative_path: string, depth: number, skipped_reason: string): LocalReadOnlyFileMetadataV0 {
  return {
    name,
    relative_path,
    item_type: "file",
    depth,
    skipped: true,
    skipped_reason
  };
}

async function safeChildCount(entryPath: string): Promise<number | undefined> {
  try {
    const entries = await fs.readdir(entryPath, { withFileTypes: true });
    return entries.length;
  } catch {
    return undefined;
  }
}

function blockedScanResult(runtime_spec_id: string, handoff_id: string, approval_request_id: string, checkpoint_id: string, scope: LocalReadOnlyInspectionScopeV0, redacted_root: string, status: "blocked" | "preflight_failed", statement: string, warnings: string[] = []): LocalReadOnlyInspectionResultV0 {
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

function makeCheck(check: string, passed: boolean, reason: string) {
  return { check, passed, reason };
}

function dedupe(values: string[]): string[] {
  return values.filter((value, index, array) => Boolean(value) && array.indexOf(value) === index);
}
