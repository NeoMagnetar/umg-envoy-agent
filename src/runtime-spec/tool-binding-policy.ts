import type { NormalizedArtifact } from "../resolver/block-library-config.js";
import type { RuntimeSpecToolBindings, RuntimeSpecV0 } from "./types.js";
import type { SleeveToolBindingV0, ToolExecutionMode, ToolRiskLevel } from "./tool-binding-policy-types.js";

export interface KnownToolSurfaceV0 {
  tool_id: string;
  aliases?: string[];
  status?: "available" | "metadata_only" | "mock_only" | "blocked";
  default_risk_level?: ToolRiskLevel;
  default_execution_mode?: ToolExecutionMode;
  approval_required?: boolean;
  governance_policy?: string;
}

export const DEFAULT_KNOWN_TOOL_SURFACES: KnownToolSurfaceV0[] = [
  {
    tool_id: "langchain_bridge",
    aliases: ["langchain", "langchain bridge"],
    status: "available",
    default_risk_level: "medium",
    default_execution_mode: "approval_required",
    approval_required: true,
    governance_policy: "langchain_governed"
  },
  {
    tool_id: "langchain.agent_mode",
    aliases: ["agent mode", "langchain agent"],
    status: "available",
    default_risk_level: "medium",
    default_execution_mode: "approval_required",
    approval_required: true,
    governance_policy: "langchain_agent_mode_requires_approval"
  },
  {
    tool_id: "resolver.library_status",
    aliases: ["library status", "resolver status", "umg library status"],
    status: "metadata_only",
    default_risk_level: "none",
    default_execution_mode: "metadata_only",
    approval_required: false,
    governance_policy: "plugin_native_metadata_only"
  },
  {
    tool_id: "resolver.library_search",
    aliases: ["library search", "resolver search", "search library"],
    status: "metadata_only",
    default_risk_level: "none",
    default_execution_mode: "metadata_only",
    approval_required: false,
    governance_policy: "plugin_native_metadata_only"
  },
  {
    tool_id: "tool.capability_summary",
    aliases: ["tool capability summary", "capability summary", "governed tool capabilities"],
    status: "metadata_only",
    default_risk_level: "none",
    default_execution_mode: "metadata_only",
    approval_required: false,
    governance_policy: "plugin_native_metadata_only"
  },
  {
    tool_id: "mcp.server_metadata",
    aliases: ["mcp metadata", "server metadata"],
    status: "metadata_only",
    default_risk_level: "none",
    default_execution_mode: "metadata_only",
    approval_required: false,
    governance_policy: "mcp_metadata_only"
  },
  {
    tool_id: "mcp.real_remote_execution",
    aliases: ["remote mcp execution", "real remote execution"],
    status: "blocked",
    default_risk_level: "high",
    default_execution_mode: "blocked",
    approval_required: true,
    governance_policy: "mcp_remote_execution_blocked"
  },
  {
    tool_id: "desktop_bridge.file_scan",
    aliases: ["file scan", "desktop bridge file scan", "file inventory"],
    status: "available",
    default_risk_level: "low",
    default_execution_mode: "dry_run",
    approval_required: false,
    governance_policy: "desktop_bridge_read_only_dry_run"
  },
  {
    tool_id: "desktop_bridge.file_write",
    aliases: ["file write", "write file"],
    status: "available",
    default_risk_level: "high",
    default_execution_mode: "approval_required",
    approval_required: true,
    governance_policy: "file_write_requires_approval"
  },
  {
    tool_id: "desktop_bridge.file_delete",
    aliases: ["delete file", "file delete", "cleanup sleeve"],
    status: "blocked",
    default_risk_level: "destructive",
    default_execution_mode: "blocked",
    approval_required: true,
    governance_policy: "destructive_file_action_blocked_by_default"
  },
  {
    tool_id: "phasebridge.workflow_plan",
    aliases: ["phasebridge plan", "workflow plan"],
    status: "available",
    default_risk_level: "low",
    default_execution_mode: "dry_run",
    approval_required: false,
    governance_policy: "phasebridge_plan_dry_run"
  },
  {
    tool_id: "phasebridge.workflow_execute",
    aliases: ["phasebridge execute", "workflow execute"],
    status: "available",
    default_risk_level: "high",
    default_execution_mode: "approval_required",
    approval_required: true,
    governance_policy: "phasebridge_execution_requires_approval"
  }
];

const TOOL_FIELDS = [
  "tools",
  "tool_bindings",
  "requested_tools",
  "required_tools",
  "capabilities.tools",
  "runtime.tools",
  "execution.tools",
  "adapter_bindings",
  "mcp_tools",
  "desktop_bridge",
  "phasebridge",
  "langchain_tools"
] as const;

export function classifySleeveToolBindingsDryRun(input: {
  runtimeSpec: RuntimeSpecV0;
  registryArtifacts: NormalizedArtifact[];
  selectedArtifacts?: NormalizedArtifact[];
  knownTools?: KnownToolSurfaceV0[];
}): RuntimeSpecToolBindings & {
  metadata_only: string[];
  mock_only: string[];
  unavailable: string[];
  unknown: string[];
  bindings: SleeveToolBindingV0[];
  warnings: string[];
} {
  const knownTools = input.knownTools ?? DEFAULT_KNOWN_TOOL_SURFACES;
  const selectedArtifacts = input.selectedArtifacts ?? resolveSelectedArtifacts(input.runtimeSpec, input.registryArtifacts);
  const warnings: string[] = [];
  const requestedBindings = new Map<string, SleeveToolBindingV0>();

  for (const artifact of selectedArtifacts) {
    for (const toolId of extractArtifactToolIds(artifact)) {
      addOrMergeBinding(requestedBindings, buildBindingFromArtifact(toolId, artifact, knownTools));
    }
  }

  for (const toolId of input.runtimeSpec.input.requested_tools) {
    addOrMergeBinding(requestedBindings, buildBindingFromRuntimeSpec(toolId, input.runtimeSpec, knownTools));
  }

  for (const toolId of input.runtimeSpec.tool_bindings.requested) {
    addOrMergeBinding(requestedBindings, buildBindingFromRuntimeSpec(toolId, input.runtimeSpec, knownTools));
  }

  for (const supportArtifactId of input.runtimeSpec.selection.support_artifacts) {
    const supportArtifact = input.registryArtifacts.find((artifact) => artifact.id === supportArtifactId);
    if (!supportArtifact) continue;
    const supportToolIds = extractArtifactToolIds(supportArtifact);
    if (supportToolIds.length > 0) {
      warnings.push("support docs do not declare executable tool bindings");
    }
  }

  if (requestedBindings.size === 0) {
    const inferred = inferTaskLevelTools(input.runtimeSpec.input.user_task, knownTools);
    for (const toolId of inferred) {
      addOrMergeBinding(requestedBindings, buildBindingFromRuntimeSpec(toolId, input.runtimeSpec, knownTools, ["task classifier signal"]))
    }
  }

  if (requestedBindings.size === 0) {
    warnings.push("no declared tool bindings found");
  }

  const bindings = [...requestedBindings.values()].map((binding) => finalizeBinding(binding, input.runtimeSpec, knownTools));
  const requested = bindings.map((binding) => binding.tool_id);
  const available = bindings.filter((binding) => binding.status === "available").map((binding) => binding.tool_id);
  const blocked = bindings.filter((binding) => binding.status === "blocked").map((binding) => binding.tool_id);
  const requires_approval = bindings.filter((binding) => binding.status === "requires_approval").map((binding) => binding.tool_id);
  const metadata_only = bindings.filter((binding) => binding.status === "metadata_only").map((binding) => binding.tool_id);
  const mock_only = bindings.filter((binding) => binding.status === "mock_only").map((binding) => binding.tool_id);
  const unavailable = bindings.filter((binding) => binding.status === "unavailable").map((binding) => binding.tool_id);
  const unknown = bindings.filter((binding) => binding.status === "unknown").map((binding) => binding.tool_id);

  return {
    requested: uniqueStrings(requested),
    available: uniqueStrings(available),
    blocked: uniqueStrings(blocked),
    requires_approval: uniqueStrings(requires_approval),
    metadata_only: uniqueStrings(metadata_only),
    mock_only: uniqueStrings(mock_only),
    unavailable: uniqueStrings(unavailable),
    unknown: uniqueStrings(unknown),
    bindings,
    warnings: uniqueStrings(warnings.concat(bindings.flatMap((binding) => binding.warnings)))
  };
}

function resolveSelectedArtifacts(runtimeSpec: RuntimeSpecV0, registryArtifacts: NormalizedArtifact[]): NormalizedArtifact[] {
  const ids = [
    runtimeSpec.selection.active_sleeve,
    ...runtimeSpec.selection.active_neostacks,
    ...runtimeSpec.selection.active_neoblocks,
    ...runtimeSpec.selection.active_molt_blocks
  ].filter(Boolean) as string[];
  return ids
    .map((id) => registryArtifacts.find((artifact) => artifact.id === id))
    .filter((artifact): artifact is NormalizedArtifact => Boolean(artifact));
}

function extractArtifactToolIds(artifact: NormalizedArtifact): string[] {
  const raw = artifact.raw as Record<string, unknown> | undefined;
  const values = TOOL_FIELDS.flatMap((field) => getFieldStrings(raw, field));
  const mapped = values.flatMap((value) => mapLooseToolReference(value));
  return uniqueStrings(mapped);
}

function buildBindingFromArtifact(toolId: string, artifact: NormalizedArtifact, knownTools: KnownToolSurfaceV0[]): SleeveToolBindingV0 {
  const known = resolveKnownTool(toolId, knownTools);
  return {
    tool_id: known?.tool_id ?? toolId,
    label: known?.tool_id ?? toolId,
    requested_by: {
      artifact_id: artifact.id,
      artifact_kind: normalizeArtifactKind(artifact.kind)
    },
    status: statusFromKnownTool(known),
    risk_level: known?.default_risk_level ?? "medium",
    execution_mode: known?.default_execution_mode ?? "dry_run",
    approval_required: Boolean(known?.approval_required),
    blocked_reason: known?.status === "blocked" ? known.governance_policy ?? "blocked by governance" : undefined,
    governance_policy: known?.governance_policy,
    provenance: {
      source_kind: artifact.source.source_kind,
      discovery_method: artifact.source.discovery_method,
      generated_from_lane: getGeneratedLane(artifact),
      path: artifact.source.path
    },
    warnings: []
  };
}

function buildBindingFromRuntimeSpec(toolId: string, runtimeSpec: RuntimeSpecV0, knownTools: KnownToolSurfaceV0[], extraWarnings: string[] = []): SleeveToolBindingV0 {
  const known = resolveKnownTool(toolId, knownTools);
  return {
    tool_id: known?.tool_id ?? toolId,
    label: known?.tool_id ?? toolId,
    requested_by: {
      artifact_id: runtimeSpec.runtime_spec_id,
      artifact_kind: "runtime_spec"
    },
    status: statusFromKnownTool(known),
    risk_level: known?.default_risk_level ?? "unknown" as ToolRiskLevel,
    execution_mode: known?.default_execution_mode ?? "dry_run",
    approval_required: Boolean(known?.approval_required),
    blocked_reason: known?.status === "blocked" ? known.governance_policy ?? "blocked by governance" : undefined,
    governance_policy: known?.governance_policy,
    warnings: extraWarnings
  };
}

function finalizeBinding(binding: SleeveToolBindingV0, runtimeSpec: RuntimeSpecV0, knownTools: KnownToolSurfaceV0[]): SleeveToolBindingV0 {
  const known = resolveKnownTool(binding.tool_id, knownTools);
  const warnings = [...binding.warnings];
  let status = binding.status;
  let riskLevel = binding.risk_level;
  let executionMode = binding.execution_mode;
  let approvalRequired = binding.approval_required;
  let blockedReason = binding.blocked_reason;

  if (runtimeSpec.tool_bindings.blocked.includes(binding.tool_id) || known?.status === "blocked") {
    status = "blocked";
    executionMode = "blocked";
    approvalRequired = true;
    if (!blockedReason) blockedReason = known?.governance_policy ?? "blocked by governance";
  } else if (runtimeSpec.tool_bindings.requires_approval.includes(binding.tool_id) || known?.default_execution_mode === "approval_required") {
    status = "requires_approval";
    executionMode = "approval_required";
    approvalRequired = true;
  } else if (known?.status === "metadata_only") {
    status = "metadata_only";
    executionMode = "metadata_only";
    riskLevel = "none";
    approvalRequired = false;
  } else if (known?.status === "mock_only") {
    status = "mock_only";
    executionMode = "mock_only";
  } else if (runtimeSpec.tool_bindings.available.includes(binding.tool_id) || known?.status === "available") {
    status = approvalRequired ? "requires_approval" : "available";
    executionMode = approvalRequired ? "approval_required" : (known?.default_execution_mode ?? "dry_run");
  } else if (!known) {
    status = isDangerousUnknownTool(binding.tool_id) ? "blocked" : "unknown";
    executionMode = status === "blocked" ? "blocked" : "dry_run";
    riskLevel = status === "blocked" ? "high" : "medium";
    approvalRequired = status === "blocked";
    if (status === "blocked") {
      blockedReason = "unknown remote execution blocked by default";
      warnings.push("unknown tool blocked by default");
    }
  }

  if (binding.tool_id.includes("delete")) {
    status = "blocked";
    riskLevel = "destructive";
    executionMode = "blocked";
    approvalRequired = true;
    blockedReason = "destructive action blocked by default";
  }

  return {
    ...binding,
    status,
    risk_level: riskLevel,
    execution_mode: executionMode,
    approval_required: approvalRequired,
    blocked_reason: blockedReason,
    warnings: uniqueStrings(warnings)
  };
}

function normalizeArtifactKind(kind: string): SleeveToolBindingV0["requested_by"]["artifact_kind"] {
  if (kind === "sleeve" || kind === "neostack" || kind === "neoblock" || kind === "molt_block") return kind;
  return "runtime_spec";
}

function resolveKnownTool(toolId: string, knownTools: KnownToolSurfaceV0[]): KnownToolSurfaceV0 | undefined {
  const lower = toolId.toLowerCase();
  return knownTools.find((tool) => tool.tool_id.toLowerCase() === lower || tool.aliases?.some((alias) => alias.toLowerCase() === lower));
}

function statusFromKnownTool(known?: KnownToolSurfaceV0): SleeveToolBindingV0["status"] {
  switch (known?.status) {
    case "metadata_only":
      return "metadata_only";
    case "mock_only":
      return "mock_only";
    case "blocked":
      return "blocked";
    case "available":
      return known.approval_required ? "requires_approval" : "available";
    default:
      return "requested";
  }
}

function getFieldStrings(raw: Record<string, unknown> | undefined, fieldPath: string): string[] {
  if (!raw) return [];
  const parts = fieldPath.split(".");
  let current: unknown = raw;
  for (const part of parts) {
    if (!current || typeof current !== "object") return [];
    current = (current as Record<string, unknown>)[part];
  }
  return flattenStrings(current);
}

function flattenStrings(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap((entry) => flattenStrings(entry));
  if (typeof value === "object") return Object.entries(value as Record<string, unknown>).flatMap(([key, entry]) => [key, ...flattenStrings(entry)]);
  return [];
}

function mapLooseToolReference(value: string): string[] {
  const lower = value.toLowerCase();
  const hits: string[] = [];
  if (lower.includes("langchain.agent_mode") || lower.includes("agent mode")) hits.push("langchain.agent_mode");
  if (lower.includes("langchain_bridge") || lower.includes("langchain bridge") || lower === "langchain") hits.push("langchain_bridge");
  if (lower.includes("resolver.library_status") || lower.includes("library status") || lower.includes("resolver status")) hits.push("resolver.library_status");
  if (lower.includes("resolver.library_search") || lower.includes("library search") || lower.includes("resolver search") || lower.includes("search library")) hits.push("resolver.library_search");
  if (lower.includes("tool.capability_summary") || lower.includes("tool capability summary") || lower.includes("capability summary") || lower.includes("governed tool capabilities")) hits.push("tool.capability_summary");
  if (lower.includes("mcp.server_metadata") || lower.includes("server metadata") || lower.includes("mcp metadata")) hits.push("mcp.server_metadata");
  if (lower.includes("mcp.real_remote_execution") || lower.includes("real remote execution")) hits.push("mcp.real_remote_execution");
  if (lower.includes("desktop_bridge.file_scan") || lower.includes("file scan") || lower.includes("file inventory")) hits.push("desktop_bridge.file_scan");
  if (lower.includes("desktop_bridge.file_write") || lower.includes("file write")) hits.push("desktop_bridge.file_write");
  if (lower.includes("desktop_bridge.file_delete") || lower.includes("file delete") || lower.includes("delete old files")) hits.push("desktop_bridge.file_delete");
  if (lower.includes("phasebridge.workflow_plan") || lower.includes("workflow plan")) hits.push("phasebridge.workflow_plan");
  if (lower.includes("phasebridge.workflow_execute") || lower.includes("workflow execute")) hits.push("phasebridge.workflow_execute");
  return hits.length > 0 ? hits : [value];
}

function inferTaskLevelTools(userTask: string, knownTools: KnownToolSurfaceV0[]): string[] {
  const lower = userTask.toLowerCase();
  const results: string[] = [];
  for (const tool of knownTools) {
    if (tool.aliases?.some((alias) => lower.includes(alias.toLowerCase())) || lower.includes(tool.tool_id.toLowerCase())) {
      results.push(tool.tool_id);
    }
  }
  return uniqueStrings(results);
}

function addOrMergeBinding(bindings: Map<string, SleeveToolBindingV0>, binding: SleeveToolBindingV0): void {
  const existing = bindings.get(binding.tool_id);
  if (!existing) {
    bindings.set(binding.tool_id, binding);
    return;
  }
  bindings.set(binding.tool_id, {
    ...existing,
    warnings: uniqueStrings([...existing.warnings, ...binding.warnings]),
    provenance: existing.provenance ?? binding.provenance
  });
}

function isDangerousUnknownTool(toolId: string): boolean {
  return /delete|destroy|remote|execute|publish|write|overwrite/.test(toolId.toLowerCase());
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function getGeneratedLane(artifact: NormalizedArtifact): string | undefined {
  const raw = artifact.raw as Record<string, unknown> | undefined;
  return typeof raw?.generated_from_lane === "string" ? raw.generated_from_lane : undefined;
}
