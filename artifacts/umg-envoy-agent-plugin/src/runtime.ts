import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readJsonFile } from "./fs-utils.js";
import type {
  ActiveSleeveState,
  ActiveStackState,
  CompilerInvocationResult,
  PromotionPreview,
  RuntimeSummary,
  RuntimeValidationResult,
  SleeveCatalog,
  SleeveCatalogEntry
} from "./models.js";
import type { PluginConfig, ResolvedPaths } from "./types.js";

const execFileAsync = promisify(execFile);

function resolveNpmCommand(): string {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function toAbsoluteFrom(baseDir: string, maybeRelative?: string): string | null {
  if (!maybeRelative || typeof maybeRelative !== "string") {
    return null;
  }

  if (path.isAbsolute(maybeRelative)) {
    return maybeRelative;
  }

  return path.resolve(baseDir, maybeRelative);
}

export function readSleeveCatalog(paths: ResolvedPaths): SleeveCatalog {
  return readJsonFile<SleeveCatalog>(paths.sleeveCatalogPath);
}

export function listSleeves(paths: ResolvedPaths): Array<SleeveCatalogEntry & { resolvedSourcePath: string | null }> {
  const catalog = readSleeveCatalog(paths);
  const manifestDir = path.dirname(paths.sleeveCatalogPath);

  return (catalog.sleeves || []).map((entry) => ({
    ...entry,
    resolvedSourcePath: toAbsoluteFrom(manifestDir, entry.source_path)
  }));
}

export function resolveSleeveSourcePath(paths: ResolvedPaths, sleeveId: string): string {
  const sleeves = listSleeves(paths);
  const match = sleeves.find((entry) => entry.id === sleeveId);

  if (!match) {
    throw new Error(`Sleeve '${sleeveId}' was not found in sleeve catalog.`);
  }

  if (!match.resolvedSourcePath || !fs.existsSync(match.resolvedSourcePath)) {
    throw new Error(
      `Sleeve '${sleeveId}' does not currently resolve to a readable source file. Catalog path: ${match.source_path ?? "(missing)"}`
    );
  }

  return match.resolvedSourcePath;
}

export function readActiveSleeve(paths: ResolvedPaths): ActiveSleeveState {
  return readJsonFile<ActiveSleeveState>(paths.activeSleevePath);
}

export function readActiveStack(paths: ResolvedPaths): ActiveStackState {
  return readJsonFile<ActiveStackState>(paths.activeStackPath);
}

export function compareSleeves(
  paths: ResolvedPaths,
  leftSleeveId: string,
  rightSleeveId: string
): Record<string, unknown> {
  const leftPath = resolveSleeveSourcePath(paths, leftSleeveId);
  const rightPath = resolveSleeveSourcePath(paths, rightSleeveId);
  const left = readJsonFile<any>(leftPath);
  const right = readJsonFile<any>(rightPath);

  const leftStacks = Array.isArray(left?.stacks) ? left.stacks : [];
  const rightStacks = Array.isArray(right?.stacks) ? right.stacks : [];

  return {
    left: {
      sleeveId: leftSleeveId,
      sourcePath: leftPath,
      mode: left?.mode ?? null,
      bpMode: left?.bpMode ?? null,
      stacks: leftStacks
    },
    right: {
      sleeveId: rightSleeveId,
      sourcePath: rightPath,
      mode: right?.mode ?? null,
      bpMode: right?.bpMode ?? null,
      stacks: rightStacks
    },
    differences: {
      modeChanged: (left?.mode ?? null) !== (right?.mode ?? null),
      bpModeChanged: (left?.bpMode ?? null) !== (right?.bpMode ?? null),
      stacksOnlyInLeft: leftStacks.filter((item: string) => !rightStacks.includes(item)),
      stacksOnlyInRight: rightStacks.filter((item: string) => !leftStacks.includes(item)),
      stackCountLeft: leftStacks.length,
      stackCountRight: rightStacks.length
    }
  };
}

function summarizeCompiledRuntime(compiled: any): RuntimeSummary {
  const runtime = compiled?.runtime ?? {};
  const neoBlocks = Array.isArray(runtime?.neoBlocks) ? runtime.neoBlocks : [];
  const activeSelections = neoBlocks[0]?.active ?? {};

  return {
    sleeveId: runtime?.sleeveId,
    sleeveName: runtime?.sleeveName,
    matchedTriggerIds: Array.isArray(runtime?.matchedTriggerIds) ? runtime.matchedTriggerIds : [],
    activeStackIds: Array.isArray(runtime?.activeStackIds) ? runtime.activeStackIds : [],
    stackCount: Array.isArray(runtime?.stacks) ? runtime.stacks.length : 0,
    useIds: Array.isArray(activeSelections?.useIds) ? activeSelections.useIds : [],
    aimIds: Array.isArray(activeSelections?.aimIds) ? activeSelections.aimIds : [],
    needIds: Array.isArray(activeSelections?.needIds) ? activeSelections.needIds : [],
    gateTriggerIds: Array.isArray(activeSelections?.gateTriggerIds) ? activeSelections.gateTriggerIds : [],
    compilerVersion: runtime?.meta?.compilerVersion ?? null
  };
}

export function summarizeActiveRuntime(paths: ResolvedPaths): Record<string, unknown> {
  const sleeve = readActiveSleeve(paths);
  const stack = readActiveStack(paths);
  const runtimeSpec = (stack as any)?.runtimeSpec ?? null;
  const runtimeSummary = runtimeSpec ? summarizeCompiledRuntime({ runtime: runtimeSpec }) : null;

  return {
    activeSleeve: {
      active: sleeve.active,
      sleeveId: sleeve.sleeve_id,
      sleeveName: sleeve.sleeve_name,
      compilerVersion: sleeve.compiler_version,
      promotedAt: sleeve.promoted_at,
      promotionLabel: sleeve.promotion_label,
      hasErrors: sleeve.has_errors,
      traceSummary: sleeve.trace_summary ?? null
    },
    activeRuntime: runtimeSummary,
    activeStack: stack
  };
}

function ensureCompilerBuildable(paths: ResolvedPaths): void {
  const packagePath = paths.compilerPackageJson;
  if (!fs.existsSync(packagePath)) {
    throw new Error(`Compiler package metadata missing at ${packagePath}`);
  }
}

async function ensureCompilerBuilt(paths: ResolvedPaths): Promise<string> {
  ensureCompilerBuildable(paths);

  const distCli = path.join(paths.compilerV0Root, "dist", "cli.js");
  if (fs.existsSync(distCli)) {
    return distCli;
  }

  const npmCmd = resolveNpmCommand();

  await execFileAsync(npmCmd, ["install"], {
    cwd: paths.compilerV0Root,
    windowsHide: true
  });

  await execFileAsync(npmCmd, ["run", "build"], {
    cwd: paths.compilerV0Root,
    windowsHide: true
  });

  if (!fs.existsSync(distCli)) {
    throw new Error(`Compiler build completed without producing ${distCli}`);
  }

  return distCli;
}

export function validateCompiledRuntime(compiled: any): RuntimeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!compiled || typeof compiled !== "object") {
    errors.push("Compiled runtime is not an object.");
    return { ok: false, errors, warnings };
  }

  if (!compiled?.runtime || typeof compiled.runtime !== "object") {
    errors.push("Missing runtime object.");
  }

  if (!compiled?.trace || typeof compiled.trace !== "object") {
    warnings.push("Missing trace object.");
  }

  if (compiled?.runtime && typeof compiled.runtime === "object") {
    if (typeof compiled.runtime.sleeveId !== "string" || !compiled.runtime.sleeveId.trim()) {
      errors.push("runtime.sleeveId is missing or invalid.");
    }

    if (!Array.isArray(compiled.runtime.stacks)) {
      errors.push("runtime.stacks is missing or not an array.");
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings
  };
}

function buildTraceSummary(compiled: any, sourcePath: string, sleeveId: string) {
  const runtimeSummary = summarizeCompiledRuntime(compiled);

  return {
    generatedBy: "umg-envoy-agent-plugin",
    generatedAt: new Date().toISOString(),
    sleeveId,
    sourcePath,
    summary: {
      activeSleeveId: compiled?.runtime?.sleeveId ?? sleeveId,
      stackCount: runtimeSummary.stackCount ?? 0,
      runtimeMode: compiled?.runtime?.mode ?? null,
      compilerStrategy: compiled?.runtime?.meta?.compilerVersion ?? null,
      matchedTriggerIds: runtimeSummary.matchedTriggerIds ?? [],
      activeStackIds: runtimeSummary.activeStackIds ?? [],
      useIds: runtimeSummary.useIds ?? [],
      aimIds: runtimeSummary.aimIds ?? [],
      needIds: runtimeSummary.needIds ?? [],
      gateTriggerIds: runtimeSummary.gateTriggerIds ?? [],
      traceEvents: Array.isArray(compiled?.trace?.events) ? compiled.trace.events.length : 0
    }
  };
}

export async function compileSleeveById(
  paths: ResolvedPaths,
  sleeveId: string,
  options: { pretty?: boolean } = {}
): Promise<CompilerInvocationResult> {
  const sourcePath = resolveSleeveSourcePath(paths, sleeveId);
  const cliPath = await ensureCompilerBuilt(paths);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputPath = path.join(paths.resleeverRuntimeDir, "compile-output", `${sleeveId}--plugin-compile--${timestamp}.runtime.json`);
  const tracePath = path.join(paths.resleeverRuntimeDir, "traces", `${sleeveId}--plugin-compile--${timestamp}.trace.json`);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.mkdirSync(path.dirname(tracePath), { recursive: true });

  const args = [cliPath, "compile", "--in", sourcePath, "--out", outputPath];
  if (options.pretty) {
    args.push("--pretty");
  }

  const { stdout, stderr } = await execFileAsync("node", args, {
    cwd: paths.compilerV0Root,
    windowsHide: true
  });

  const rawOutput = [stdout, stderr].filter(Boolean).join("\n").trim();
  const parsedRuntime = readJsonFile<any>(outputPath);
  const validation = validateCompiledRuntime(parsedRuntime);

  if (!validation.ok) {
    throw new Error(`Compiled runtime failed validation: ${validation.errors.join(" | ")}`);
  }

  const tracePayload = buildTraceSummary(parsedRuntime, sourcePath, sleeveId);
  fs.writeFileSync(tracePath, JSON.stringify(tracePayload, null, 2) + "\n", "utf8");

  return {
    outputPath,
    rawOutput,
    parsedRuntime,
    tracePath,
    runtimeSummary: summarizeCompiledRuntime(parsedRuntime)
  };
}

export function previewPromotion(
  paths: ResolvedPaths,
  compiledOutputPath: string,
  sleeveId: string,
  promotionLabel?: string
): PromotionPreview {
  if (!fs.existsSync(compiledOutputPath)) {
    throw new Error(`Compiled runtime output not found: ${compiledOutputPath}`);
  }

  const current = readActiveSleeve(paths);
  const compiled = readJsonFile<any>(compiledOutputPath);
  const validation = validateCompiledRuntime(compiled);

  if (!validation.ok) {
    throw new Error(`Compiled runtime failed validation: ${validation.errors.join(" | ")}`);
  }

  const label = promotionLabel ?? sleeveId;
  const changes: string[] = [];

  if (current.sleeve_id !== sleeveId) {
    changes.push(`active sleeve id: ${current.sleeve_id ?? "(none)"} -> ${sleeveId}`);
  }

  if (current.promotion_label !== label) {
    changes.push(`promotion label: ${current.promotion_label ?? "(none)"} -> ${label}`);
  }

  changes.push(`compiled runtime source: ${compiledOutputPath}`);

  const runtimeSummary = summarizeCompiledRuntime(compiled);

  return {
    currentActive: {
      sleeveId: current.sleeve_id,
      sleeveName: current.sleeve_name,
      promotedAt: current.promoted_at
    },
    candidate: {
      sleeveId,
      compiledOutputPath,
      promotionLabel: label,
      compilerVersion: compiled?.runtime?.meta?.compilerVersion ?? compiled?.compilerMeta?.strategy ?? compiled?.compiler_version,
      matchedTriggerIds: runtimeSummary.matchedTriggerIds,
      activeStackIds: runtimeSummary.activeStackIds,
      useIds: runtimeSummary.useIds,
      aimIds: runtimeSummary.aimIds,
      needIds: runtimeSummary.needIds,
      gateTriggerIds: runtimeSummary.gateTriggerIds
    },
    changes
  };
}

function createPromotionBackup(paths: ResolvedPaths, sleeveId: string, promotionLabel: string, compiledOutputPath: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(paths.resleeverRuntimeDir, "backups", `${timestamp}-${sleeveId}-${promotionLabel}`);
  fs.mkdirSync(backupDir, { recursive: true });

  const previousActiveSleeve = fs.existsSync(paths.activeSleevePath)
    ? readJsonFile<any>(paths.activeSleevePath)
    : null;

  const previousActiveStack = fs.existsSync(paths.activeStackPath)
    ? readJsonFile<any>(paths.activeStackPath)
    : null;

  if (previousActiveSleeve) {
    fs.copyFileSync(paths.activeSleevePath, path.join(backupDir, "active-sleeve.json"));
  }

  if (previousActiveStack) {
    fs.copyFileSync(paths.activeStackPath, path.join(backupDir, "active-stack.json"));
  }

  const metadata = {
    backupCreatedAt: new Date().toISOString(),
    backupKind: "pre-promotion-runtime-snapshot",
    targetSleeveId: sleeveId,
    promotionLabel,
    compiledOutputPath,
    sourcePaths: {
      activeSleevePath: paths.activeSleevePath,
      activeStackPath: paths.activeStackPath
    },
    previousActive: {
      sleeveId: previousActiveSleeve?.sleeve_id ?? null,
      sleeveName: previousActiveSleeve?.sleeve_name ?? null,
      promotedAt: previousActiveSleeve?.promoted_at ?? null,
      promotionLabel: previousActiveSleeve?.promotion_label ?? null
    }
  };

  fs.writeFileSync(path.join(backupDir, "backup-metadata.json"), JSON.stringify(metadata, null, 2) + "\n", "utf8");

  return backupDir;
}

export function promoteCompiledRuntime(
  paths: ResolvedPaths,
  config: PluginConfig,
  compiledOutputPath: string,
  sleeveId: string,
  promotionLabel?: string
): { activeSleevePath: string; activeStackPath: string; promotedAt: string; backupDir: string; validation: RuntimeValidationResult } {
  if (!config.allowRuntimeWrites) {
    throw new Error(
      "Runtime writes are disabled. Enable allowRuntimeWrites in plugin config before using promote operations."
    );
  }

  if (!fs.existsSync(compiledOutputPath)) {
    throw new Error(`Compiled runtime output not found: ${compiledOutputPath}`);
  }

  const compiled = readJsonFile<any>(compiledOutputPath);
  const validation = validateCompiledRuntime(compiled);

  if (!validation.ok) {
    throw new Error(`Compiled runtime failed validation: ${validation.errors.join(" | ")}`);
  }

  const label = promotionLabel ?? sleeveId;
  const backupDir = createPromotionBackup(paths, sleeveId, label, compiledOutputPath);
  const promotedAt = new Date().toISOString();

  const activeSleeve: ActiveSleeveState = {
    active: true,
    sleeve_id: compiled?.runtime?.sleeveId ?? sleeveId,
    sleeve_name: compiled?.runtime?.sleeveName ?? sleeveId,
    compiler_version: compiled?.runtime?.meta?.compilerVersion ?? "compiler-v0",
    source_sleeve_path: resolveSleeveSourcePath(paths, sleeveId),
    compile_output_path: compiledOutputPath,
    trace_path: undefined,
    promoted_at: promotedAt,
    promotion_label: label,
    backup_folder: backupDir,
    has_errors: false,
    notes: "Updated via UMG Envoy Agent plugin",
    trace_summary: {
      events: Array.isArray(compiled?.trace?.events) ? compiled.trace.events.length : 0,
      last_event: Array.isArray(compiled?.trace?.events) && compiled.trace.events.length > 0
        ? compiled.trace.events[compiled.trace.events.length - 1]?.code ?? null
        : null,
      matched_trigger_ids: Array.isArray(compiled?.runtime?.matchedTriggerIds) ? compiled.runtime.matchedTriggerIds : [],
      active_stack_ids: Array.isArray(compiled?.runtime?.activeStackIds) ? compiled.runtime.activeStackIds : [],
      use_ids: Array.isArray(compiled?.runtime?.neoBlocks?.[0]?.active?.useIds) ? compiled.runtime.neoBlocks[0].active.useIds : [],
      aim_ids: Array.isArray(compiled?.runtime?.neoBlocks?.[0]?.active?.aimIds) ? compiled.runtime.neoBlocks[0].active.aimIds : [],
      need_ids: Array.isArray(compiled?.runtime?.neoBlocks?.[0]?.active?.needIds) ? compiled.runtime.neoBlocks[0].active.needIds : [],
      gate_trigger_ids: Array.isArray(compiled?.runtime?.neoBlocks?.[0]?.active?.gateTriggerIds) ? compiled.runtime.neoBlocks[0].active.gateTriggerIds : []
    }
  };

  const activeStack: Record<string, unknown> = {
    active: true,
    sleeve_id: compiled?.runtime?.sleeveId ?? sleeveId,
    promoted_at: promotedAt,
    runtimeSpec: compiled.runtime,
    trace: compiled.trace ?? null,
    promotionLabel: label,
    backupFolder: backupDir
  };

  fs.writeFileSync(paths.activeSleevePath, JSON.stringify(activeSleeve, null, 2) + "\n", "utf8");
  fs.writeFileSync(paths.activeStackPath, JSON.stringify(activeStack, null, 2) + "\n", "utf8");

  return {
    activeSleevePath: paths.activeSleevePath,
    activeStackPath: paths.activeStackPath,
    promotedAt,
    backupDir,
    validation
  };
}
