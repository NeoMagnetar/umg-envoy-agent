import fs from "node:fs";
import { Type } from "@sinclair/typebox";
import { compileSleeveById } from "./compiler/compiler-adapter.js";
import { runCompilerSmoke } from "./compiler/compiler-smoke.js";
import { getCompilerMatrixStatus } from "./compiler/compiler-matrix.js";
import { loadSleeves, publicContentRoot, summarizeBlockLibraries } from "./compiler/content-loader.js";
import { validateRuntimeOutput } from "./compiler/runtime-validator.js";
import { loadSleeveFile } from "./compiler/sleeve-loader.js";
import { validateSleeveStructure } from "./compiler/sleeve-schema-validator.js";
import { resolveSleeveArtifacts } from "./compiler/artifact-resolver.js";
import { runCompilerBridge } from "./compiler/compiler-bridge.js";
import { emitRelationMatrix } from "./compiler/relation-matrix-emitter.js";
import { parseUMGPath } from "./umg-path-parser.js";
import { renderUMGPath } from "./umg-path-renderer.js";
import { validateUMGPath } from "./umg-path-validator.js";
import { buildPublicPath } from "./public-path-builder.js";
import type { CompilerInputPreview, PluginConfig, SleeveLoadResult } from "./types.js";

function effectiveConfig(config?: PluginConfig) {
  return {
    allowRuntimeWrites: false,
    contentMode: "bundled-public",
    compilerMode: "bundled-adapter",
    debug: false,
    ...config
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
    version: "0.2.4",
    compilerAdapter: "available",
    contentMode: cfg.contentMode,
    compilerMode: cfg.compilerMode,
    allowRuntimeWrites: Boolean(cfg.allowRuntimeWrites),
    sampleSleeves: sleeves.length,
    sampleBlocks: libraries.totalBlocks,
    supportedTools: [
      "umg_envoy_status",
      "umg_envoy_compiler_smoke_test",
      "umg_envoy_list_sleeves",
      "umg_envoy_list_block_libraries",
      "umg_envoy_compile_sleeve",
      "umg_envoy_validate_runtime_output",
      "umg_envoy_compare_sleeves",
      "umg_envoy_parse_path",
      "umg_envoy_validate_path",
      "umg_envoy_render_path",
      "umg_envoy_build_path",
      "umg_envoy_matrix_status",
      "umg_envoy_load_sleeve",
      "umg_envoy_compile_ir_bridge",
      "umg_envoy_emit_relation_matrix"
    ]
  };
}

function compareSleeves(left: string, right: string, config?: PluginConfig) {
  const leftCompiled = compileSleeveById(left, config, import.meta.url);
  const rightCompiled = compileSleeveById(right, config, import.meta.url);
  return {
    ok: leftCompiled.ok && rightCompiled.ok,
    left: {
      sleeveId: leftCompiled.sleeveId,
      active_blocks: leftCompiled.runtimeSpec.active_blocks,
      prompt_parts: leftCompiled.runtimeSpec.prompt_parts.map((part) => part.block_id)
    },
    right: {
      sleeveId: rightCompiled.sleeveId,
      active_blocks: rightCompiled.runtimeSpec.active_blocks,
      prompt_parts: rightCompiled.runtimeSpec.prompt_parts.map((part) => part.block_id)
    },
    onlyLeftBlocks: leftCompiled.runtimeSpec.active_blocks.filter((id) => !rightCompiled.runtimeSpec.active_blocks.includes(id)),
    onlyRightBlocks: rightCompiled.runtimeSpec.active_blocks.filter((id) => !leftCompiled.runtimeSpec.active_blocks.includes(id))
  };
}

function buildCompilerInputPreview(result: SleeveLoadResult, libraryRoot: string): CompilerInputPreview | undefined {
  if (!result.loadedSleeve || !result.artifactResolution) {
    return undefined;
  }

  const dependencies = result.loadedSleeve.sleeve?.dependencies;
  const entries = result.artifactResolution.entries;

  return {
    mode: "canonical-preparation-preview",
    sleeveArtifactId: result.loadedSleeve.identity?.artifact_id ?? null,
    sleevePath: result.sleevePath,
    libraryRoot,
    routeCount: Array.isArray(result.loadedSleeve.sleeve?.routes) ? result.loadedSleeve.sleeve.routes.length : 0,
    dependencyCounts: {
      sleeves: Array.isArray(dependencies?.sleeve_ids) ? dependencies.sleeve_ids.length : 0,
      neostacks: Array.isArray(dependencies?.neostack_ids) ? dependencies.neostack_ids.length : 0,
      bundles: Array.isArray(dependencies?.bundle_ids) ? dependencies.bundle_ids.length : 0,
      overlays: Array.isArray(dependencies?.overlay_ids) ? dependencies.overlay_ids.length : 0,
      schemas: Array.isArray(dependencies?.schema_ids) ? dependencies.schema_ids.length : 0
    },
    resolvedArtifactCounts: {
      resolved: entries.filter((entry) => entry.status === "resolved").length,
      missing: entries.filter((entry) => entry.status === "missing").length,
      invalid: entries.filter((entry) => entry.status === "invalid").length
    },
    stageBoundary: {
      compilerInvoked: false,
      stage8BridgeDeferred: true,
      runtimeOutputsWritten: false
    }
  };
}

function loadSleevePreview(sleevePath: string, libraryRoot: string): SleeveLoadResult {
  const loaded = loadSleeveFile({ sleevePath, libraryRoot });
  if (!loaded.ok || !loaded.loadedSleeve) {
    return loaded;
  }

  const validation = validateSleeveStructure(loaded.loadedSleeve);
  const artifactResolution = resolveSleeveArtifacts(libraryRoot, loaded.loadedSleeve);
  const compilerInputPreview = buildCompilerInputPreview({ ...loaded, validation, artifactResolution }, libraryRoot);

  return {
    ok: loaded.ok && validation.ok && artifactResolution.ok,
    sleevePath: loaded.sleevePath,
    loadedSleeve: loaded.loadedSleeve,
    validation,
    artifactResolution,
    compilerInputPreview,
    warnings: [...loaded.warnings, ...validation.warnings, ...artifactResolution.warnings],
    errors: [...loaded.errors, ...validation.errors, ...artifactResolution.errors]
  };
}

function registerCliBridge(api: any, config?: PluginConfig) {
  api.registerCli(({ program }: { program: any }) => {
    const root = program.command("umg-envoy").description("Public compiler-backed UMG Envoy Agent");

    root.command("status").action(async () => {
      console.log(JSON.stringify(statusPayload(config), null, 2));
    });

    root.command("compiler-smoke").action(async () => {
      console.log(JSON.stringify(runCompilerSmoke(import.meta.url), null, 2));
    });

    root.command("list-sleeves").action(async () => {
      console.log(JSON.stringify(loadSleeves(publicContentRoot(import.meta.url)), null, 2));
    });

    root.command("list-block-libraries").action(async () => {
      console.log(JSON.stringify(summarizeBlockLibraries(publicContentRoot(import.meta.url)), null, 2));
    });

    root.command("compile-sleeve")
      .requiredOption("--sleeve <id>")
      .action(async (opts: { sleeve: string }) => {
        console.log(JSON.stringify(compileSleeveById(opts.sleeve, config, import.meta.url), null, 2));
      });

    root.command("validate-runtime-output")
      .requiredOption("--file <path>")
      .action(async (opts: { file: string }) => {
        console.log(JSON.stringify(validateRuntimeOutput(JSON.parse(fs.readFileSync(opts.file, "utf8"))), null, 2));
      });

    root.command("compare-sleeves")
      .requiredOption("--left <id>")
      .requiredOption("--right <id>")
      .action(async (opts: { left: string; right: string }) => {
        console.log(JSON.stringify(compareSleeves(opts.left, opts.right, config), null, 2));
      });

    root.command("parse-path")
      .requiredOption("--file <path>")
      .action(async (opts: { file: string }) => {
        console.log(JSON.stringify(parseUMGPath(fs.readFileSync(opts.file, "utf8")), null, 2));
      });

    root.command("validate-path")
      .requiredOption("--file <path>")
      .action(async (opts: { file: string }) => {
        const issues = validateUMGPath(parseUMGPath(fs.readFileSync(opts.file, "utf8")));
        console.log(JSON.stringify({ ok: issues.every((issue) => issue.severity !== "error"), issues }, null, 2));
      });

    root.command("render-path")
      .requiredOption("--file <path>")
      .action(async (opts: { file: string }) => {
        const raw = fs.readFileSync(opts.file, "utf8");
        const parsed = opts.file.toLowerCase().endsWith(".json") ? JSON.parse(raw) : parseUMGPath(raw);
        console.log(renderUMGPath(parsed));
      });

    root.command("build-path")
      .requiredOption("--message <text>")
      .option("--sleeve <id>")
      .action(async (opts: { message: string; sleeve?: string }) => {
        console.log(renderUMGPath(buildPublicPath(opts.message, opts.sleeve ?? config?.defaultSleeveId ?? "public-basic-envoy")));
      });

    root.command("matrix-status").action(async () => {
      console.log(JSON.stringify(getCompilerMatrixStatus(import.meta.url), null, 2));
    });

    root.command("load-sleeve")
      .requiredOption("--sleeve-path <path>")
      .requiredOption("--library-root <path>")
      .action(async (opts: { sleevePath: string; libraryRoot: string }) => {
        console.log(JSON.stringify(loadSleevePreview(opts.sleevePath, opts.libraryRoot), null, 2));
      });

    root.command("compile-ir-bridge")
      .requiredOption("--sleeve-path <path>")
      .requiredOption("--library-root <path>")
      .option("--compiler-repo-path <path>")
      .option("--compiler-cli-path <path>")
      .option("--output-dir <path>")
      .option("--timeout-ms <number>")
      .action(async (opts: { sleevePath: string; libraryRoot: string; compilerRepoPath?: string; compilerCliPath?: string; outputDir?: string; timeoutMs?: string }) => {
        const result = await runCompilerBridge({
          sleevePath: opts.sleevePath,
          libraryRoot: opts.libraryRoot,
          compilerRepoPath: opts.compilerRepoPath,
          compilerCliPath: opts.compilerCliPath,
          outputDir: opts.outputDir,
          timeoutMs: opts.timeoutMs ? Number(opts.timeoutMs) : undefined,
          allowCompilerBridge: true
        });
        console.log(JSON.stringify(result, null, 2));
      });

    root.command("emit-relation-matrix")
      .requiredOption("--sleeve-path <path>")
      .requiredOption("--library-root <path>")
      .option("--compiler-repo-path <path>")
      .option("--compiler-cli-path <path>")
      .option("--output-dir <path>")
      .option("--timeout-ms <number>")
      .option("--relation-matrix-mode <mode>")
      .action(async (opts: { sleevePath: string; libraryRoot: string; compilerRepoPath?: string; compilerCliPath?: string; outputDir?: string; timeoutMs?: string; relationMatrixMode?: string }) => {
        const result = await emitRelationMatrix({
          sleevePath: opts.sleevePath,
          libraryRoot: opts.libraryRoot,
          compilerRepoPath: opts.compilerRepoPath,
          compilerCliPath: opts.compilerCliPath,
          outputDir: opts.outputDir,
          timeoutMs: opts.timeoutMs ? Number(opts.timeoutMs) : undefined,
          allowCompilerBridge: true,
          allowRelationMatrixEmit: true,
          relationMatrixMode: (opts.relationMatrixMode as any) ?? "response-only"
        }, config?.relationMatrix);
        console.log(JSON.stringify(result, null, 2));
      });
  }, { commands: ["umg-envoy"] });
}

const entry = {
  id: "umg-envoy-agent",
  name: "UMG Envoy Agent",
  description: "Public compiler-backed UMG Envoy Agent for OpenClaw",
  register(api: { registerTool: (definition: any, options?: { optional?: boolean }) => void; registerCli?: (register: any, options?: { commands?: string[] }) => void }, config?: PluginConfig) {
    registerCliBridge(api, config);

    api.registerTool({ name: "umg_envoy_status", description: "Report compiler-backed public package status.", parameters: Type.Object({}, { additionalProperties: false }), async execute() { return { content: [{ type: "text", text: JSON.stringify(statusPayload(config), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_compiler_smoke_test", description: "Run bundled public compiler smoke tests.", parameters: Type.Object({}, { additionalProperties: false }), async execute() { return { content: [{ type: "text", text: JSON.stringify(runCompilerSmoke(import.meta.url), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_list_sleeves", description: "List bundled public sleeves.", parameters: Type.Object({}, { additionalProperties: false }), async execute() { return { content: [{ type: "text", text: JSON.stringify(loadSleeves(publicContentRoot(import.meta.url)), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_list_block_libraries", description: "Summarize bundled public block libraries.", parameters: Type.Object({}, { additionalProperties: false }), async execute() { return { content: [{ type: "text", text: JSON.stringify(summarizeBlockLibraries(publicContentRoot(import.meta.url)), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_compile_sleeve", description: "Compile a bundled public sleeve into RuntimeSpec-like output.", parameters: Type.Object({ sleeveId: Type.String() }, { additionalProperties: false }), async execute(input: { sleeveId: string }) { return { content: [{ type: "text", text: JSON.stringify(compileSleeveById(input.sleeveId, config, import.meta.url), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_validate_runtime_output", description: "Validate RuntimeSpec-like output.", parameters: Type.Object({ runtimeOutput: Type.Any() }, { additionalProperties: false }), async execute(input: { runtimeOutput: unknown }) { return { content: [{ type: "text", text: JSON.stringify(validateRuntimeOutput(input.runtimeOutput), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_compare_sleeves", description: "Compare two bundled public sleeves.", parameters: Type.Object({ left: Type.String(), right: Type.String() }, { additionalProperties: false }), async execute(input: { left: string; right: string }) { return { content: [{ type: "text", text: JSON.stringify(compareSleeves(input.left, input.right, config), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_parse_path", description: "Parse a UMG path string.", parameters: Type.Object({ source: Type.String() }, { additionalProperties: false }), async execute(input: { source: string }) { return { content: [{ type: "text", text: JSON.stringify(parseUMGPath(input.source), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_validate_path", description: "Validate a parsed UMG path string.", parameters: Type.Object({ source: Type.String() }, { additionalProperties: false }), async execute(input: { source: string }) { const issues = validateUMGPath(parseUMGPath(input.source)); return { content: [{ type: "text", text: JSON.stringify({ ok: issues.every((issue) => issue.severity !== "error"), issues }, null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_render_path", description: "Render a parsed UMG path string back to text.", parameters: Type.Object({ source: Type.String() }, { additionalProperties: false }), async execute(input: { source: string }) { return { content: [{ type: "text", text: renderUMGPath(parseUMGPath(input.source)) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_build_path", description: "Build a public-safe UMG path document.", parameters: Type.Object({ message: Type.String(), sleeveId: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { message: string; sleeveId?: string }) { return { content: [{ type: "text", text: renderUMGPath(buildPublicPath(input.message, input.sleeveId ?? config?.defaultSleeveId ?? "public-basic-envoy")) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_matrix_status", description: "Report bundled compiler matrix status.", parameters: Type.Object({}, { additionalProperties: false }), async execute() { return { content: [{ type: "text", text: JSON.stringify(getCompilerMatrixStatus(import.meta.url), null, 2) }] }; } }, { optional: true });
    api.registerTool({
      name: "umg_envoy_load_sleeve",
      description: "Read-only sleeve loader that validates sleeve structure, resolves artifacts, and previews canonical compiler preparation without invoking the compiler.",
      parameters: Type.Object({ sleevePath: Type.String(), libraryRoot: Type.String() }, { additionalProperties: false }),
      async execute(input: { sleevePath: string; libraryRoot: string }) {
        return { content: [{ type: "text", text: JSON.stringify(loadSleevePreview(input.sleevePath, input.libraryRoot), null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_compile_ir_bridge",
      description: "Invoke the configured local umg-compiler compile-ir path using a constrained canonical IR bridge.",
      parameters: Type.Object({
        sleevePath: Type.String(),
        libraryRoot: Type.String(),
        compilerRepoPath: Type.Optional(Type.String()),
        compilerCliPath: Type.Optional(Type.String()),
        outputDir: Type.Optional(Type.String()),
        timeoutMs: Type.Optional(Type.Number()),
        allowCompilerBridge: Type.Optional(Type.Boolean())
      }, { additionalProperties: false }),
      async execute(input: { sleevePath: string; libraryRoot: string; compilerRepoPath?: string; compilerCliPath?: string; outputDir?: string; timeoutMs?: number; allowCompilerBridge?: boolean }) {
        return { content: [{ type: "text", text: JSON.stringify(await runCompilerBridge({ ...input, allowCompilerBridge: input.allowCompilerBridge ?? true }), null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_emit_relation_matrix",
      description: "Emit an ASCII-safe relation matrix projection after the compiler bridge.",
      parameters: Type.Object({
        sleevePath: Type.String(),
        libraryRoot: Type.String(),
        compilerRepoPath: Type.Optional(Type.String()),
        compilerCliPath: Type.Optional(Type.String()),
        outputDir: Type.Optional(Type.String()),
        timeoutMs: Type.Optional(Type.Number()),
        allowCompilerBridge: Type.Optional(Type.Boolean()),
        allowRelationMatrixEmit: Type.Optional(Type.Boolean()),
        relationMatrixMode: Type.Optional(Type.Union([Type.Literal("response-only"), Type.Literal("temp-write"), Type.Literal("both")]))
      }, { additionalProperties: false }),
      async execute(input: { sleevePath: string; libraryRoot: string; compilerRepoPath?: string; compilerCliPath?: string; outputDir?: string; timeoutMs?: number; allowCompilerBridge?: boolean; allowRelationMatrixEmit?: boolean; relationMatrixMode?: "response-only" | "temp-write" | "both" }) {
        return { content: [{ type: "text", text: JSON.stringify(await emitRelationMatrix({ ...input, allowCompilerBridge: input.allowCompilerBridge ?? true, allowRelationMatrixEmit: input.allowRelationMatrixEmit ?? false }, config?.relationMatrix), null, 2) }] };
      }
    }, { optional: true });
  }
};

if (process.argv.includes("--smoke")) {
  console.log(JSON.stringify(runCompilerSmoke(import.meta.url), null, 2));
}

export default entry;
