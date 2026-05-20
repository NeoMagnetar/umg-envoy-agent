export interface PluginConfig {
  allowRuntimeWrites?: boolean;
  contentMode?: "bundled-public" | string;
  compilerMode?: "bundled-adapter" | string;
  debug?: boolean;
  defaultSleeveId?: string;
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
