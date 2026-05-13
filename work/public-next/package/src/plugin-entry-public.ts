import fs from "node:fs";
import { Type } from "@sinclair/typebox";
import { parseUMGPath } from "./umg-path-parser.js";
import { renderUMGPath } from "./umg-path-renderer.js";
import { validateUMGPath } from "./umg-path-validator.js";
import { buildPublicPath } from "./public-path-builder.js";
import type {
  BlockLibrarySummary,
  PluginConfig,
  PublicBlock,
  PublicSleeve,
  RuntimeSpec,
  RuntimeValidationResult,
  CompileSleeveResult
} from "./types.js";

function effectiveConfig(config?: PluginConfig) {
  return {
    allowRuntimeWrites: false,
    contentMode: "bundled-public",
    compilerMode: "public-readonly",
    debug: false,
    defaultSleeveId: "public-basic-envoy",
    ...config
  };
}

function packageRootFromModule(metaUrl: string): string {
  const moduleDir = new URL(".", metaUrl).pathname.replace(/^\/[A-Za-z]:/, (m) => m.slice(1));
  const candidateA = new URL("../", metaUrl).pathname.replace(/^\/[A-Za-z]:/, (m) => m.slice(1));
  const candidateB = new URL("../../", metaUrl).pathname.replace(/^\/[A-Za-z]:/, (m) => m.slice(1));
  if (fs.existsSync(`${candidateA}public-content`) || fs.existsSync(`${candidateA}\\public-content`)) return candidateA;
  return candidateB;
}

function publicContentRoot(metaUrl = import.meta.url): string {
  const root = packageRootFromModule(metaUrl).replace(/[\\/]$/, "");
  return `${root}/public-content`.replace(/\//g, "\\");
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function listJsonFiles(dir: string): string[] {
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => `${dir}\\${name}`);
}

function loadBlocks(root: string): PublicBlock[] {
  return listJsonFiles(`${root}\\blocks`).map((file) => readJson<PublicBlock>(file));
}

function loadSleeves(root: string): PublicSleeve[] {
  return listJsonFiles(`${root}\\sleeves`).map((file) => readJson<PublicSleeve>(file));
}

function loadSleeveById(root: string, sleeveId: string): PublicSleeve | undefined {
  return loadSleeves(root).find((sleeve) => sleeve.sleeve_id === sleeveId);
}

function loadBlockMap(root: string): Map<string, PublicBlock> {
  return new Map(loadBlocks(root).map((block) => [block.block_id, block]));
}

function summarizeBlockLibraries(root: string): BlockLibrarySummary {
  const blocks = loadBlocks(root);
  const byKind: Record<string, number> = {};
  for (const block of blocks) {
    byKind[block.kind] = (byKind[block.kind] ?? 0) + 1;
  }
  return {
    totalBlocks: blocks.length,
    byKind,
    blockIds: blocks.map((block) => block.block_id)
  };
}

function validateRuntimeOutput(input: unknown): RuntimeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
  if (!isRecord(input)) {
    return { ok: false, valid: false, errors: ["runtime output must be an object"], warnings: [] };
  }

  for (const key of ["runtimespec_id", "sleeve_id", "snap_id", "primary_shell_block_id"] as const) {
    if (typeof input[key] !== "string" || input[key].trim() === "") {
      errors.push(`missing required field: ${key}`);
    }
  }

  for (const key of ["active_blocks", "prompt_parts", "constraints", "tool_requests", "errors", "warnings"] as const) {
    if (!Array.isArray(input[key])) {
      errors.push(`${key} must be an array`);
    }
  }

  for (const key of ["strategy", "context", "values", "format"] as const) {
    if (!isRecord(input[key])) {
      errors.push(`${key} must be an object`);
    }
  }

  if (Array.isArray(input.active_blocks) && input.active_blocks.some((entry) => typeof entry !== "string")) {
    errors.push("active block list is valid only when all entries are strings");
  }

  if (Array.isArray(input.prompt_parts)) {
    for (const part of input.prompt_parts) {
      if (!isRecord(part)) {
        errors.push("prompt_parts entries must be objects");
        break;
      }
      if (typeof part.block_id !== "string" || typeof part.kind !== "string" || typeof part.text !== "string") {
        errors.push("prompt_parts entries must include block_id, kind, and text");
        break;
      }
      if (typeof part.authority !== "number") {
        errors.push("prompt_parts entries must include numeric authority");
        break;
      }
    }
  }

  if (typeof input.primary_shell_block_id === "string" && Array.isArray(input.active_blocks) && !input.active_blocks.includes(input.primary_shell_block_id)) {
    warnings.push("primary shell exists but is not present in active_blocks");
  }

  return {
    ok: errors.length === 0,
    valid: errors.length === 0,
    errors,
    warnings
  };
}

const KIND_ORDER: Record<PublicBlock["kind"], number> = {
  primary: 0,
  directive: 1,
  instruction: 2,
  subject: 3,
  philosophy: 4,
  blueprint: 5,
  trigger: 6
};

function compileSleeveReadonly(sleeveId: string, _config?: PluginConfig, metaUrl = import.meta.url): CompileSleeveResult {
  const root = publicContentRoot(metaUrl);
  const sleeve = loadSleeveById(root, sleeveId);
  if (!sleeve) {
    throw new Error(`Unknown sleeve: ${sleeveId}`);
  }
  const blockMap = loadBlockMap(root);
  const enabledRefs = sleeve.block_refs.filter((ref) => ref.enabled !== false);
  const activeBlocks = enabledRefs.map((ref) => ref.block_id);
  const promptParts = enabledRefs
    .map((ref) => blockMap.get(ref.block_id))
    .filter((block): block is PublicBlock => block !== undefined && block.enabled !== false)
    .sort((a, b) => a.authority - b.authority || KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.block_id.localeCompare(b.block_id))
    .map((block) => ({
      block_id: block.block_id,
      kind: block.kind,
      authority: block.authority,
      text: block.text
    }));

  const errors = enabledRefs.filter((ref) => !blockMap.has(ref.block_id)).map((ref) => `missing block reference: ${ref.block_id}`);
  const warnings = sleeve.block_refs.filter((ref) => ref.enabled === false).map((ref) => `disabled block skipped: ${ref.block_id}`);

  const runtimeSpec: RuntimeSpec = {
    runtimespec_id: `runtime-${sleeve.sleeve_id}`,
    sleeve_id: sleeve.sleeve_id,
    snap_id: sleeve.snap_id ?? "default",
    primary_shell_block_id: sleeve.primary_shell_block_id,
    active_blocks: activeBlocks,
    prompt_parts: promptParts,
    strategy: sleeve.strategy ?? {},
    constraints: sleeve.constraints ?? [],
    context: sleeve.context ?? {},
    values: sleeve.values ?? {},
    format: sleeve.format ?? {},
    tool_requests: sleeve.tool_requests ?? [],
    errors,
    warnings
  };

  const validation = validateRuntimeOutput(runtimeSpec);
  runtimeSpec.errors.push(...validation.errors.filter((entry) => !runtimeSpec.errors.includes(entry)));
  runtimeSpec.warnings.push(...validation.warnings.filter((entry) => !runtimeSpec.warnings.includes(entry)));

  return {
    ok: runtimeSpec.errors.length === 0,
    sleeveId: sleeve.sleeve_id,
    runtimeSpec
  };
}

function runPublicSmoke(metaUrl = import.meta.url) {
  const root = publicContentRoot(metaUrl);
  const blocks = loadBlocks(root);
  const sleeves = loadSleeves(root);
  const compile = compileSleeveReadonly("public-basic-envoy", undefined, metaUrl);
  const validExample = validateRuntimeOutput(readJson(`${root}\\examples\\valid-runtime-output.json`));
  const invalidExample = validateRuntimeOutput(readJson(`${root}\\examples\\invalid-runtime-output.json`));
  const errors: string[] = [];
  if (!fs.existsSync(root)) errors.push("public-content root missing");
  if (!fs.existsSync(`${root}\\blocks`)) errors.push("blocks folder missing");
  if (!fs.existsSync(`${root}\\sleeves`)) errors.push("sleeves folder missing");
  if (blocks.length < 7) errors.push("expected at least 7 sample blocks");
  if (sleeves.length < 2) errors.push("expected at least 2 sample sleeves");
  if (!compile.ok) errors.push(...compile.runtimeSpec.errors);
  if (!validExample.valid) errors.push(...validExample.errors);
  if (invalidExample.valid) errors.push("invalid runtime output unexpectedly validated");
  return {
    ok: errors.length === 0,
    plugin: "umg-envoy-agent",
    version: "0.3.0-alpha.5",
    compilerAdapter: "not-shipped-publicly",
    contentMode: "bundled-public",
    sampleSleeves: sleeves.length,
    sampleBlocks: blocks.length,
    runtimeValidation: validExample.valid && !invalidExample.valid ? "passed" : "failed",
    errors
  };
}

function statusPayload(config?: PluginConfig) {
  const cfg = effectiveConfig(config);
  const root = publicContentRoot(import.meta.url);
  const sleeves = loadSleeves(root);
  const libraries = summarizeBlockLibraries(root);
  return {
    ok: true,
    plugin: "umg-envoy-agent",
    version: "0.3.0-alpha.5",
    publicEntrypoint: "dist/plugin-entry-public.js",
    contentMode: cfg.contentMode,
    compilerMode: cfg.compilerMode,
    allowRuntimeWrites: false,
    sampleSleeves: sleeves.length,
    sampleBlocks: libraries.totalBlocks,
    supportedTools: [
      "umg_envoy_status",
      "umg_envoy_library_status",
      "umg_envoy_library_search",
      "umg_envoy_runtime_spec_dry_run",
      "umg_envoy_runtime_visibility_header",
      "umg_envoy_runtime_molt_map",
      "umg_envoy_runtime_dashboard",
      "umg_envoy_runtime_ir_matrix",
      "umg_envoy_runtime_inspect",
      "umg_envoy_local_readonly_plan",
      "umg_envoy_local_readonly_scan",
      "umg_envoy_alpha_demo",
      "umg_envoy_sleeve_list",
      "umg_envoy_sleeve_inspect",
      "umg_envoy_sleeve_demo"
    ]
  };
}

function searchBlocks(query: string, metaUrl = import.meta.url) {
  const q = query.trim().toLowerCase();
  const blocks = loadBlocks(publicContentRoot(metaUrl));
  const matches = blocks.filter((block) => {
    const hay = [block.block_id, block.title, block.kind, block.text, ...(block.tags ?? [])].join(" \n").toLowerCase();
    return q.length === 0 || hay.includes(q);
  });
  return {
    ok: true,
    query,
    count: matches.length,
    results: matches.slice(0, 25).map((block) => ({
      block_id: block.block_id,
      kind: block.kind,
      title: block.title,
      authority: block.authority,
      tags: block.tags ?? []
    }))
  };
}

function runtimeInspect(sleeveId: string, config?: PluginConfig) {
  const compiled = compileSleeveReadonly(sleeveId, config, import.meta.url);
  return {
    ok: compiled.ok,
    sleeveId: compiled.sleeveId,
    activeBlocks: compiled.runtimeSpec.active_blocks,
    promptParts: compiled.runtimeSpec.prompt_parts.map((part) => ({
      block_id: part.block_id,
      kind: part.kind,
      authority: part.authority
    })),
    warnings: compiled.runtimeSpec.warnings,
    errors: compiled.runtimeSpec.errors
  };
}

function runtimeVisibilityHeader(sleeveId: string, config?: PluginConfig) {
  const compiled = compileSleeveReadonly(sleeveId, config, import.meta.url);
  return {
    ok: compiled.ok,
    sleeveId: compiled.sleeveId,
    header: [
      `UMG Envoy public visibility header`,
      `sleeve: ${compiled.sleeveId}`,
      `primary shell: ${compiled.runtimeSpec.primary_shell_block_id}`,
      `active blocks: ${compiled.runtimeSpec.active_blocks.length}`,
      `prompt parts: ${compiled.runtimeSpec.prompt_parts.length}`
    ].join("\n")
  };
}

function runtimeMoltMap(sleeveId: string, config?: PluginConfig) {
  const compiled = compileSleeveReadonly(sleeveId, config, import.meta.url);
  return {
    ok: compiled.ok,
    sleeveId: compiled.sleeveId,
    moltMap: compiled.runtimeSpec.prompt_parts.map((part, index) => ({
      order: index + 1,
      block_id: part.block_id,
      kind: part.kind,
      authority: part.authority
    }))
  };
}

function runtimeDashboard(config?: PluginConfig) {
  const root = publicContentRoot(import.meta.url);
  const sleeves = loadSleeves(root);
  const library = summarizeBlockLibraries(root);
  const defaultSleeveId = effectiveConfig(config).defaultSleeveId ?? "public-basic-envoy";
  const compiled = compileSleeveReadonly(defaultSleeveId, config, import.meta.url);
  return {
    ok: compiled.ok,
    defaultSleeveId,
    sleeveCount: sleeves.length,
    blockCount: library.totalBlocks,
    blockKinds: library.byKind,
    activeBlockCount: compiled.runtimeSpec.active_blocks.length,
    promptPartCount: compiled.runtimeSpec.prompt_parts.length,
    warnings: compiled.runtimeSpec.warnings,
    errors: compiled.runtimeSpec.errors
  };
}

function runtimeIrMatrix(config?: PluginConfig) {
  const root = publicContentRoot(import.meta.url);
  const sleeves = loadSleeves(root);
  const blocks = loadBlocks(root);
  return {
    ok: true,
    compilerAdapter: "not-shipped-publicly",
    contentMode: effectiveConfig(config).contentMode,
    compilerMode: effectiveConfig(config).compilerMode,
    sampleSleeves: sleeves.length,
    sampleBlocks: blocks.length,
    blockKinds: Array.from(new Set(blocks.map((block) => block.kind))).sort(),
    failClosed: true
  };
}

function localReadonlyPlan(message: string, sleeveId?: string) {
  const doc = buildPublicPath(message, sleeveId ?? "public-basic-envoy");
  const issues = validateUMGPath(doc);
  return {
    ok: issues.every((issue) => issue.severity !== "error"),
    mode: "readonly-plan",
    sleeveId: doc.sleeveId,
    issues,
    rendered: renderUMGPath(doc)
  };
}

function localReadonlyScan(query?: string) {
  const root = publicContentRoot(import.meta.url);
  const sleeves = loadSleeves(root);
  const library = summarizeBlockLibraries(root);
  const q = (query ?? "").trim().toLowerCase();
  const sleeveHits = sleeves.filter((sleeve) => q.length === 0 || `${sleeve.sleeve_id} ${sleeve.title}`.toLowerCase().includes(q));
  return {
    ok: true,
    query: query ?? "",
    sleeveHits: sleeveHits.map((sleeve) => ({ sleeve_id: sleeve.sleeve_id, title: sleeve.title })),
    blockSummary: library
  };
}

function alphaDemo(message?: string, sleeveId?: string) {
  const selectedSleeve = sleeveId ?? "public-basic-envoy";
  const plan = localReadonlyPlan(message ?? "Give me a concise public demo", selectedSleeve);
  const inspect = runtimeInspect(selectedSleeve);
  return {
    ok: plan.ok && inspect.ok,
    sleeveId: selectedSleeve,
    plan,
    inspect,
    note: "alpha demo stays in readonly public-safe mode"
  };
}

function sleeveList() {
  const root = publicContentRoot(import.meta.url);
  return {
    ok: true,
    sleeves: loadSleeves(root).map((sleeve) => ({
      sleeve_id: sleeve.sleeve_id,
      title: sleeve.title,
      primary_shell_block_id: sleeve.primary_shell_block_id,
      block_count: sleeve.block_refs.length
    }))
  };
}

function sleeveInspect(sleeveId: string, config?: PluginConfig) {
  const root = publicContentRoot(import.meta.url);
  const sleeve = loadSleeveById(root, sleeveId);
  if (!sleeve) {
    return { ok: false, error: `Unknown sleeve: ${sleeveId}` };
  }
  const compiled = compileSleeveReadonly(sleeveId, config, import.meta.url);
  return {
    ok: compiled.ok,
    sleeve,
    runtime: compiled.runtimeSpec
  };
}

function sleeveDemo(sleeveId?: string, message?: string) {
  const chosen = sleeveId ?? "public-basic-envoy";
  return {
    ok: true,
    sleeveId: chosen,
    previewPath: renderUMGPath(buildPublicPath(message ?? "demo", chosen)),
    runtime: compileSleeveReadonly(chosen, undefined, import.meta.url).runtimeSpec
  };
}

function registerCliBridge(api: any, config?: PluginConfig) {
  if (typeof api?.registerCli !== "function") {
    return;
  }
  api.registerCli(({ program }: { program: any }) => {
    const root = program.command("umg-envoy").description("UMG Envoy Agent minimized public alpha.5 utilities");

    root.command("status").action(async () => console.log(JSON.stringify(statusPayload(config), null, 2)));
    root.command("library-status").action(async () => console.log(JSON.stringify({ ok: true, ...summarizeBlockLibraries(publicContentRoot(import.meta.url)) }, null, 2)));
    root.command("library-search").requiredOption("--query <text>").action(async (opts: { query: string }) => console.log(JSON.stringify(searchBlocks(opts.query), null, 2)));
    root.command("runtime-spec-dry-run").option("--sleeve <id>").requiredOption("--message <text>").action(async (opts: { sleeve?: string; message: string }) => console.log(JSON.stringify(localReadonlyPlan(opts.message, opts.sleeve), null, 2)));
    root.command("runtime-visibility-header").option("--sleeve <id>").action(async (opts: { sleeve?: string }) => console.log(JSON.stringify(runtimeVisibilityHeader(opts.sleeve ?? effectiveConfig(config).defaultSleeveId, config), null, 2)));
    root.command("runtime-molt-map").option("--sleeve <id>").action(async (opts: { sleeve?: string }) => console.log(JSON.stringify(runtimeMoltMap(opts.sleeve ?? effectiveConfig(config).defaultSleeveId, config), null, 2)));
    root.command("runtime-dashboard").action(async () => console.log(JSON.stringify(runtimeDashboard(config), null, 2)));
    root.command("runtime-ir-matrix").action(async () => console.log(JSON.stringify(runtimeIrMatrix(config), null, 2)));
    root.command("runtime-inspect").option("--sleeve <id>").action(async (opts: { sleeve?: string }) => console.log(JSON.stringify(runtimeInspect(opts.sleeve ?? effectiveConfig(config).defaultSleeveId, config), null, 2)));
    root.command("local-readonly-plan").requiredOption("--message <text>").option("--sleeve <id>").action(async (opts: { message: string; sleeve?: string }) => console.log(JSON.stringify(localReadonlyPlan(opts.message, opts.sleeve), null, 2)));
    root.command("local-readonly-scan").option("--query <text>").action(async (opts: { query?: string }) => console.log(JSON.stringify(localReadonlyScan(opts.query), null, 2)));
    root.command("alpha-demo").option("--message <text>").option("--sleeve <id>").action(async (opts: { message?: string; sleeve?: string }) => console.log(JSON.stringify(alphaDemo(opts.message, opts.sleeve), null, 2)));
    root.command("sleeve-list").action(async () => console.log(JSON.stringify(sleeveList(), null, 2)));
    root.command("sleeve-inspect").requiredOption("--sleeve <id>").action(async (opts: { sleeve: string }) => console.log(JSON.stringify(sleeveInspect(opts.sleeve, config), null, 2)));
    root.command("sleeve-demo").option("--sleeve <id>").option("--message <text>").action(async (opts: { sleeve?: string; message?: string }) => console.log(JSON.stringify(sleeveDemo(opts.sleeve, opts.message), null, 2)));
    root.command("parse-path").requiredOption("--file <path>").action(async (opts: { file: string }) => console.log(JSON.stringify(parseUMGPath(fs.readFileSync(opts.file, "utf8")), null, 2)));
    root.command("validate-path").requiredOption("--file <path>").action(async (opts: { file: string }) => { const issues = validateUMGPath(parseUMGPath(fs.readFileSync(opts.file, "utf8"))); console.log(JSON.stringify({ ok: issues.every((issue) => issue.severity !== "error"), issues }, null, 2)); });
    root.command("render-path").requiredOption("--file <path>").action(async (opts: { file: string }) => { const raw = fs.readFileSync(opts.file, "utf8"); const parsed = opts.file.toLowerCase().endsWith(".json") ? JSON.parse(raw) : parseUMGPath(raw); console.log(renderUMGPath(parsed)); });
    root.command("build-path").requiredOption("--message <text>").option("--sleeve <id>").action(async (opts: { message: string; sleeve?: string }) => console.log(renderUMGPath(buildPublicPath(opts.message, opts.sleeve ?? effectiveConfig(config).defaultSleeveId))));
  }, { commands: ["umg-envoy"] });
}

const entry = {
  id: "umg-envoy-agent",
  name: "UMG Envoy Agent",
  description: "Minimized public alpha.5 UMG Envoy Agent for OpenClaw",
  register(api: { registerTool: (definition: any, options?: { optional?: boolean }) => void; registerCli?: (register: any, options?: { commands?: string[] }) => void }, config?: PluginConfig) {
    registerCliBridge(api, config);

    api.registerTool({ name: "umg_envoy_status", description: "Report public alpha.5 status.", parameters: Type.Object({}, { additionalProperties: false }), async execute() { return { content: [{ type: "text", text: JSON.stringify(statusPayload(config), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_library_status", description: "Summarize bundled public block library status.", parameters: Type.Object({}, { additionalProperties: false }), async execute() { return { content: [{ type: "text", text: JSON.stringify({ ok: true, ...summarizeBlockLibraries(publicContentRoot(import.meta.url)) }, null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_library_search", description: "Search bundled public block content.", parameters: Type.Object({ query: Type.String() }, { additionalProperties: false }), async execute(input: { query: string }) { return { content: [{ type: "text", text: JSON.stringify(searchBlocks(input.query), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_runtime_spec_dry_run", description: "Build a readonly RuntimeSpec-style plan without execution.", parameters: Type.Object({ message: Type.String(), sleeveId: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { message: string; sleeveId?: string }) { return { content: [{ type: "text", text: JSON.stringify(localReadonlyPlan(input.message, input.sleeveId), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_runtime_visibility_header", description: "Return a concise visibility header for the selected public sleeve runtime.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { sleeveId?: string }) { return { content: [{ type: "text", text: JSON.stringify(runtimeVisibilityHeader(input.sleeveId ?? effectiveConfig(config).defaultSleeveId, config), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_runtime_molt_map", description: "Return readonly ordering and public molt-style mapping for the selected sleeve.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { sleeveId?: string }) { return { content: [{ type: "text", text: JSON.stringify(runtimeMoltMap(input.sleeveId ?? effectiveConfig(config).defaultSleeveId, config), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_runtime_dashboard", description: "Report readonly public runtime dashboard stats.", parameters: Type.Object({}, { additionalProperties: false }), async execute() { return { content: [{ type: "text", text: JSON.stringify(runtimeDashboard(config), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_runtime_ir_matrix", description: "Report public readonly IR matrix status.", parameters: Type.Object({}, { additionalProperties: false }), async execute() { return { content: [{ type: "text", text: JSON.stringify(runtimeIrMatrix(config), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_runtime_inspect", description: "Inspect readonly RuntimeSpec-like output for a public sleeve.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { sleeveId?: string }) { return { content: [{ type: "text", text: JSON.stringify(runtimeInspect(input.sleeveId ?? effectiveConfig(config).defaultSleeveId, config), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_local_readonly_plan", description: "Create a local readonly plan from a message.", parameters: Type.Object({ message: Type.String(), sleeveId: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { message: string; sleeveId?: string }) { return { content: [{ type: "text", text: JSON.stringify(localReadonlyPlan(input.message, input.sleeveId), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_local_readonly_scan", description: "Scan bundled public content without writes or execution.", parameters: Type.Object({ query: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { query?: string }) { return { content: [{ type: "text", text: JSON.stringify(localReadonlyScan(input.query), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_alpha_demo", description: "Run the public alpha demo in readonly mode.", parameters: Type.Object({ message: Type.Optional(Type.String()), sleeveId: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { message?: string; sleeveId?: string }) { return { content: [{ type: "text", text: JSON.stringify(alphaDemo(input.message, input.sleeveId), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_sleeve_list", description: "List bundled public sleeves.", parameters: Type.Object({}, { additionalProperties: false }), async execute() { return { content: [{ type: "text", text: JSON.stringify(sleeveList(), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_sleeve_inspect", description: "Inspect a bundled public sleeve and its readonly runtime.", parameters: Type.Object({ sleeveId: Type.String() }, { additionalProperties: false }), async execute(input: { sleeveId: string }) { return { content: [{ type: "text", text: JSON.stringify(sleeveInspect(input.sleeveId, config), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_sleeve_demo", description: "Show a sleeve-scoped public readonly demo payload.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()), message: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { sleeveId?: string; message?: string }) { return { content: [{ type: "text", text: JSON.stringify(sleeveDemo(input.sleeveId, input.message), null, 2) }] }; } }, { optional: true });
  }
};

if (process.argv.includes("--smoke")) {
  console.log(JSON.stringify(runPublicSmoke(import.meta.url), null, 2));
}

export default entry;
