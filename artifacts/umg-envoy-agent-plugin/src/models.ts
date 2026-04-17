export interface SleeveCatalogEntry {
  id: string;
  name?: string;
  status?: string;
  source_path?: string;
  notes?: string;
}

export interface SleeveCatalog {
  generated_at?: string;
  sleeves: SleeveCatalogEntry[];
}

export interface ActiveSleeveState {
  active?: boolean;
  sleeve_id?: string;
  sleeve_name?: string;
  compiler_version?: string;
  source_sleeve_path?: string;
  staged_input_path?: string;
  compile_output_path?: string;
  trace_path?: string;
  promotion_label?: string;
  promoted_at?: string;
  backup_folder?: string;
  has_errors?: boolean;
  notes?: string;
  trace_summary?: {
    events?: number;
    last_event?: string;
    matched_trigger_ids?: string[];
    active_stack_ids?: string[];
    use_ids?: string[];
    aim_ids?: string[];
    need_ids?: string[];
    gate_trigger_ids?: string[];
  };
  [key: string]: unknown;
}

export interface ActiveStackState {
  [key: string]: unknown;
}

export interface RuntimeSummary {
  sleeveId?: string;
  sleeveName?: string;
  matchedTriggerIds?: string[];
  activeStackIds?: string[];
  stackCount?: number;
  useIds?: string[];
  aimIds?: string[];
  needIds?: string[];
  gateTriggerIds?: string[];
  compilerVersion?: string;
}

export interface CompilerInvocationResult {
  outputPath: string;
  tracePath?: string;
  rawOutput: string;
  parsedRuntime: unknown;
  runtimeSummary?: RuntimeSummary;
}

export interface RuntimeValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export interface PromotionPreview {
  currentActive: {
    sleeveId?: string;
    sleeveName?: string;
    promotedAt?: string;
  };
  candidate: {
    sleeveId: string;
    compiledOutputPath: string;
    promotionLabel: string;
    compilerVersion?: string;
    matchedTriggerIds?: string[];
    activeStackIds?: string[];
    useIds?: string[];
    aimIds?: string[];
    needIds?: string[];
    gateTriggerIds?: string[];
  };
  changes: string[];
}
