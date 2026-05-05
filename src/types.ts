export type PermissionLevel = "read_only" | "draft_only" | "safe_execute" | "approval_required" | "blocked";
export type RiskClass = "low" | "medium" | "high" | "destructive" | "sensitive";
export type BridgeMode = "direct_openclaw_tool_bridge" | "mcp_adapter_bridge" | "mock_test_bridge";

export interface ToolDefinition {
  tool_id: string;
  tool_name: string;
  description: string;
  runtime_target: "openclaw" | "mcp" | "mock" | "local_python" | "http_api";
  input_schema: Record<string, unknown>;
  output_schema: Record<string, unknown>;
  permission_level: PermissionLevel;
  risk_class: RiskClass;
  requires_approval: boolean;
  trace_enabled: boolean;
  secrets_policy?: "none" | "runtime_only_never_to_model" | "blocked";
}

export interface LangChainBridgePayload {
  neostack_id: "NS.UMG.LANGCHAIN_BRIDGE.v0.1";
  call_mode: "simple_agent" | "langgraph_workflow" | "rag" | "tool_bridge_only" | "validation_only";
  invoke_mode?: "dry_run" | "direct_execute" | "agent_execute";
  bridge_mode: BridgeMode;
  sleeve_id: string;
  task: { user_intent: string; input?: unknown; constraints?: string[] };
  provider: { mode: "static" | "dynamic" | "local" | "fallback"; preferred?: string; fallback?: string; model?: string };
  tools: { allowed?: string[]; approval_required?: string[]; blocked?: string[]; definitions?: ToolDefinition[] };
  trace: { enabled: boolean; mode?: "minimal" | "full" | "debug" };
  retrieval?: { enabled?: boolean; mode?: "2_step_rag" | "agentic_rag" | "hybrid_rag"; sources?: string[] };
  langgraph?: { enabled?: boolean; checkpointing?: boolean; human_in_loop?: boolean; max_steps?: number };
  output?: { structured?: boolean; schema_name?: string; json_schema?: Record<string, unknown> };
}

export type ApprovalState = "approval_required" | "approval_pending" | "approval_granted" | "approval_denied" | "approval_expired" | "approval_cancelled" | "approval_edited";

export interface ApprovalCheckpoint {
  approval_id: string;
  status: ApprovalState;
  neostack_id: string;
  sleeve_id: string;
  tool: {
    tool_id: string;
    tool_name: string;
    permission_level: string;
    risk_class: string;
  };
  requested_action: {
    summary: string;
    input_preview: Record<string, unknown>;
  };
  policy: {
    reason: string;
    may_execute_without_approval: false;
    allowed_decisions: Array<"approve" | "deny" | "edit">;
  };
  trace: Array<{
    event_type: string;
    timestamp_utc: string;
    sleeve_id: string;
    neostack_id: string;
    tool_id?: string | null;
    message: string;
    data?: Record<string, unknown>;
  }>;
}

export interface ApprovalDecision {
  approval_id: string;
  decision: "approve" | "deny" | "edit";
  decided_by: string;
  decided_at?: string;
  edited_input?: Record<string, unknown> | null;
  reason?: string;
  execute_now: false;
}

export interface ApprovalResumeContract {
  resume_id: string;
  approval_id: string;
  status: "resume_prepared";
  may_execute: false;
  requires_next_phase_executor: true;
  approved_tool: {
    tool_id: string;
    tool_name: string;
    risk_class: string;
    permission_level: string;
  };
  approved_input: Record<string, unknown>;
  trace: Array<{
    event_type: string;
    timestamp_utc: string;
    sleeve_id: string;
    neostack_id: string;
    tool_id?: string | null;
    message: string;
    data?: Record<string, unknown>;
  }>;
}

export interface PluginConfig {
  allowRuntimeWrites?: boolean;
  contentMode?: "bundled-public" | string;
  compilerMode?: "bundled-adapter" | "external-cli" | string;
  debug?: boolean;
  defaultSleeveId?: string;
  compilerBridge?: CompilerBridgeConfig;
  relationMatrix?: RelationMatrixConfig;
}

export interface PublicBlock {
  block_id: string;
  kind: "trigger" | "directive" | "instruction" | "subject" | "primary" | "philosophy" | "blueprint";
  title: string;
  text: string;
  authority: number;
  enabled?: boolean;
  tags?: string[];
}

export interface SleeveBlockRef {
  block_id: string;
  enabled?: boolean;
}

export interface PublicSleeve {
  sleeve_id: string;
  title: string;
  snap_id?: string;
  primary_shell_block_id: string;
  block_refs: SleeveBlockRef[];
  strategy?: Record<string, unknown>;
  constraints?: string[];
  context?: Record<string, unknown>;
  values?: Record<string, unknown>;
  format?: Record<string, unknown>;
  tool_requests?: Array<Record<string, unknown>>;
}

export interface RuntimeSpec {
  runtimespec_id: string;
  sleeve_id: string;
  snap_id: string;
  primary_shell_block_id: string;
  active_blocks: string[];
  prompt_parts: Array<{
    block_id: string;
    kind: string;
    authority: number;
    text: string;
  }>;
  strategy: Record<string, unknown>;
  constraints: string[];
  context: Record<string, unknown>;
  values: Record<string, unknown>;
  format: Record<string, unknown>;
  tool_requests: Array<Record<string, unknown>>;
  errors: string[];
  warnings: string[];
}

export interface RuntimeValidationResult {
  ok: boolean;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CompileSleeveResult {
  ok: boolean;
  sleeveId: string;
  runtimeSpec: RuntimeSpec;
}

export interface BlockLibrarySummary {
  totalBlocks: number;
  byKind: Record<string, number>;
  blockIds: string[];
}

export interface SleeveLoadRequest {
  sleevePath: string;
  libraryRoot?: string;
}

export interface LoadedArtifactIdentity {
  artifact_id?: string;
  artifact_type?: string;
  version?: string;
  [key: string]: unknown;
}

export interface LoadedSleeveFile {
  identity?: LoadedArtifactIdentity;
  provenance?: Record<string, unknown>;
  sleeve?: {
    name?: string;
    description?: string;
    dependencies?: {
      sleeve_ids?: string[];
      neostack_ids?: string[];
      bundle_ids?: string[];
      overlay_ids?: string[];
      schema_ids?: string[];
      capability_ids?: string[];
      toolpack_ids?: string[];
      [key: string]: unknown;
    };
    composition?: {
      neostack_ids?: string[];
      neoblock_ids?: string[];
      bundle_ids?: string[];
      overlay_ids?: string[];
      local_refs?: unknown[];
      [key: string]: unknown;
    };
    routes?: Array<Record<string, unknown>>;
    runtime?: {
      services?: string[];
      [key: string]: unknown;
    };
    capabilities?: {
      required?: string[];
      optional?: string[];
      [key: string]: unknown;
    };
    activation?: Record<string, unknown>;
    [key: string]: unknown;
  };
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface SleeveValidationResult {
  ok: boolean;
  valid: boolean;
  mode: "structural";
  errors: string[];
  warnings: string[];
}

export interface ArtifactResolutionEntry {
  artifactType: "sleeve" | "neostack" | "neoblock" | "overlay" | "bundle" | "schema" | "capability" | "toolpack";
  artifactId: string;
  expectedPath: string | null;
  sourceRef?: string | null;
  sourceReason?: string | null;
  exists: boolean;
  status: "resolved" | "missing" | "invalid";
}

export interface ArtifactResolutionResult {
  ok: boolean;
  libraryRoot: string;
  entries: ArtifactResolutionEntry[];
  missing: ArtifactResolutionEntry[];
  warnings: string[];
  errors: string[];
}

export interface LoadedNeostackFile {
  identity?: LoadedArtifactIdentity;
  provenance?: Record<string, unknown>;
  neostack?: {
    name?: string;
    description?: string;
    status?: string;
    version?: string;
    category?: string;
    tags?: string[];
    composition?: {
      neoblock_ids?: string[];
      ordered_groups?: Array<Record<string, unknown>>;
      [key: string]: unknown;
    };
    routes?: Array<Record<string, unknown>>;
    activation?: Record<string, unknown>;
    overlays?: string[];
    capabilities?: string[];
    examples?: string[];
    notes?: string;
    [key: string]: unknown;
  };
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface NeostackLoadRequest {
  libraryRoot: string;
  neostackId?: string;
  neostackPath?: string;
}

export interface NeostackValidationResult {
  ok: boolean;
  valid: boolean;
  mode: "structural";
  errors: string[];
  warnings: string[];
}

export interface NeostackArtifactResolutionResult {
  ok: boolean;
  libraryRoot: string;
  entries: ArtifactResolutionEntry[];
  missing: ArtifactResolutionEntry[];
  warnings: string[];
  errors: string[];
}

export interface NeostackLoadResult {
  ok: boolean;
  neostackPath: string;
  loadedNeostack?: LoadedNeostackFile;
  validation?: NeostackValidationResult;
  artifactResolution?: NeostackArtifactResolutionResult;
  warnings: string[];
  errors: string[];
}

export interface CompilerInputPreview {
  mode: "canonical-preparation-preview";
  sleeveArtifactId: string | null;
  sleevePath: string;
  libraryRoot: string;
  routeCount: number;
  dependencyCounts: {
    sleeves: number;
    neostacks: number;
    bundles: number;
    overlays: number;
    schemas: number;
  };
  resolvedArtifactCounts: {
    resolved: number;
    missing: number;
    invalid: number;
  };
  stageBoundary: {
    compilerInvoked: false;
    stage8BridgeDeferred: boolean;
    runtimeOutputsWritten: false;
  };
}

export interface SleeveLoadResult {
  ok: boolean;
  sleevePath: string;
  loadedSleeve?: LoadedSleeveFile;
  validation?: SleeveValidationResult;
  artifactResolution?: ArtifactResolutionResult;
  compilerInputPreview?: CompilerInputPreview;
  warnings: string[];
  errors: string[];
}

export interface CompilerBridgeConfig {
  allowCompilerBridge?: boolean;
  compilerMode?: "bundled-adapter" | "external-cli";
  compilerRepoPath?: string | null;
  compilerCliPath?: string | null;
  compilerCommand?: string | null;
  compilerTimeoutMs?: number;
  compilerTempRoot?: string | null;
}

export type RelationMatrixMode = "response-only" | "temp-write" | "both";

export interface RelationMatrixConfig {
  allowRelationMatrixEmit?: boolean;
  relationMatrixMode?: RelationMatrixMode;
  relationMatrixTempRoot?: string | null;
  relationMatrixWritePolicy?: "temp-only";
  relationMatrixFormat?: "umg-v0.1-ascii";
}

export interface CompilerBridgeRequest {
  sleevePath: string;
  libraryRoot: string;
  compilerRepoPath?: string;
  compilerCliPath?: string;
  compilerCommand?: string;
  outputDir?: string;
  timeoutMs?: number;
  allowCompilerBridge?: boolean;
  compilerTempRoot?: string;
}

export interface CanonicalIrBuildResult {
  ok: boolean;
  inputPath: string;
  canonicalIr?: Record<string, unknown>;
  compilerInputPreview?: CompilerInputPreview;
  warnings: string[];
  errors: string[];
}

export interface CompilerInvocationResult {
  ok: boolean;
  mode: "external-cli";
  commandPath: string;
  timeoutMs: number;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  stdoutSummary?: string;
  stderrSummary?: string;
  timedOut: boolean;
}

export interface CompilerBridgeResult {
  ok: boolean;
  sleevePath: string;
  libraryRoot: string;
  loadedSleeveSummary?: {
    artifactId: string | null;
    routeCount: number;
    dependencyCounts: {
      sleeves: number;
      neostacks: number;
      bundles: number;
      overlays: number;
      schemas: number;
    };
  };
  validation?: SleeveValidationResult;
  artifactResolution?: ArtifactResolutionResult;
  canonicalIr?: Record<string, unknown>;
  compilerInvocation?: CompilerInvocationResult;
  runtimeSpec?: unknown;
  trace?: unknown;
  diagnostics?: unknown;
  outputFiles?: {
    canonicalIrPath: string;
    runtimeSpecPath: string | null;
    tracePath: string | null;
    diagnosticsPath: string | null;
  };
  warnings: string[];
  errors: string[];
  boundary: {
    compilerInvoked: boolean;
    relationMatrixEmitted: false | boolean;
    umgBlockLibraryModified: false;
    compilerRepoModified: false;
  };
}

export interface RelationMatrixLine {
  line_kind: "node_state" | "relation" | "diagnostic" | "comment";
  from?: string | null;
  relation_code?: string | null;
  to?: string | null;
  states?: string[];
  text?: string | null;
}

export interface RelationMatrixStatus {
  route: string | null;
  overlayCount: number;
  neostackCount: number;
  neoblockCount: number;
  capabilityCount: number;
  diagnosticCount: number;
}

export interface RelationMatrixRequest {
  sleevePath: string;
  libraryRoot: string;
  compilerRepoPath?: string;
  compilerCliPath?: string;
  compilerCommand?: string;
  outputDir?: string;
  timeoutMs?: number;
  allowCompilerBridge?: boolean;
  allowRelationMatrixEmit?: boolean;
  relationMatrixMode?: RelationMatrixMode;
  relationMatrixTempRoot?: string;
}

export interface RelationMatrixResult {
  ok: boolean;
  sleevePath: string;
  libraryRoot: string;
  bridgeResult?: Record<string, unknown>;
  runtimeSpec?: unknown;
  trace?: unknown;
  diagnostics?: unknown;
  relationMatrixText?: string;
  relationMatrix?: {
    matrix_version: string;
    kind: "snapshot";
    header: Record<string, unknown>;
    lines: RelationMatrixLine[];
    validation?: Record<string, unknown>;
    notes?: string | null;
  };
  relationMatrixPath?: string | null;
  matrixStatus?: RelationMatrixStatus;
  warnings: string[];
  errors: string[];
  boundary: {
    compilerInvoked: boolean;
    relationMatrixEmitted: boolean;
    relationMatrixWritten: boolean;
    umgBlockLibraryModified: false;
    compilerRepoModified: false;
  };
}
