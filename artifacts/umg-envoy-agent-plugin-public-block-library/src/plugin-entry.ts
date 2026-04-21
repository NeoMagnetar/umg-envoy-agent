import { Type } from "@sinclair/typebox";
import { parseUMGPath } from "./umg-path-parser.js";
import { renderUMGPath } from "./umg-path-renderer.js";
import { validateUMGPath } from "./umg-path-validator.js";
import type { PluginConfig } from "./types.js";
import type { UMGPathDocument } from "./umg-path-types.js";

function buildPublicPathFromMessage(message: string, sleeveId?: string): UMGPathDocument {
  return {
    use: "build_live_runtime_path",
    aim: "human_inspectable_planner_route",
    need: ["validated_route", "planner_visibility", "compiler_handoff_ready"],
    sleeveId: sleeveId ?? "sample-basic-minimal",
    triggers: [],
    gates: [],
    loadedStacks: ["S.MOD.01", "S.MOD.02", "S.MOD.03"],
    stacks: [
      {
        id: "S.MOD.01",
        blocks: [
          {
            id: "NB.MOD.01",
            molts: [{ state: /playful/i.test(message) ? "active" : "latent", role: "I", id: /playful/i.test(message) ? "INST.MOD.002" : "INST.MOD.003" }]
          }
        ]
      },
      {
        id: "S.MOD.02",
        blocks: [
          {
            id: "NB.MOD.02",
            molts: [{ state: /direct/i.test(message) ? "active" : "latent", role: "I", id: /direct/i.test(message) ? "INST.MOD.101" : "INST.MOD.102" }]
          }
        ]
      },
      {
        id: "S.MOD.03",
        blocks: [
          {
            id: "NB.MOD.03",
            molts: [{ state: /list|bullet/i.test(message) ? "active" : "latent", role: "I", id: /list|bullet/i.test(message) ? "INST.MOD.201" : "INST.MOD.202" }]
          }
        ]
      }
    ],
    relationships: [],
    bundles: [],
    merges: [],
    winners: [{ key: "chain", value: "NB.MOD.03>INST.MOD.201" }],
    compiler: { stages: ["validate", "normalize", "compile", "emit"] }
  };
}

function publicMatrixSummary() {
  return {
    total: 3,
    supported: ["parse-path", "validate-path", "render-path", "build-path"],
    failClosed: true,
    internalOnlyAbsent: ["path-trace", "adapter-trace", "compiler-trace"]
  };
}

function registerCliBridge(api: any, _config?: PluginConfig) {
  api.registerCli(
    ({ program }: { program: any }) => {
      const root = program.command("umg-envoy").description("Public-safe UMG planner utilities");

      root.command("status").action(async () => {
        console.log(JSON.stringify({
          lane: "public-safe",
          supported: ["parse-path", "validate-path", "render-path", "build-path", "matrix-status"],
          failClosed: ["invalid planner docs are blocked", "unsupported semantics are not widened in public lane"],
          notWidened: ["path-trace", "adapter-trace", "compiler-trace", "raw bridge provenance", "internal operator lane details"]
        }, null, 2));
      });

      root.command("parse-path")
        .requiredOption("--file <path>")
        .action(async (opts: { file: string }) => {
          const fs = await import("node:fs");
          const raw = fs.readFileSync(opts.file, "utf8");
          console.log(JSON.stringify(parseUMGPath(raw), null, 2));
        });

      root.command("validate-path")
        .requiredOption("--file <path>")
        .action(async (opts: { file: string }) => {
          const fs = await import("node:fs");
          const raw = fs.readFileSync(opts.file, "utf8");
          const parsed = parseUMGPath(raw);
          const issues = validateUMGPath(parsed);
          console.log(JSON.stringify({ ok: issues.every((issue: { severity: string }) => issue.severity !== "error"), issues }, null, 2));
          if (issues.some((issue: { severity: string }) => issue.severity === "error")) {
            process.exitCode = 1;
          }
        });

      root.command("render-path")
        .requiredOption("--file <path>")
        .action(async (opts: { file: string }) => {
          const fs = await import("node:fs");
          const raw = fs.readFileSync(opts.file, "utf8");
          const parsed = opts.file.toLowerCase().endsWith('.json') ? JSON.parse(raw) : parseUMGPath(raw);
          console.log(renderUMGPath(parsed));
        });

      root.command("build-path")
        .requiredOption("--message <text>")
        .option("--sleeve <id>")
        .action(async (opts: { message: string; sleeve?: string }) => {
          console.log(renderUMGPath(buildPublicPathFromMessage(opts.message, opts.sleeve)));
        });

      root.command("matrix-status")
        .action(async () => {
          console.log(JSON.stringify(publicMatrixSummary(), null, 2));
        });
    },
    { commands: ["umg-envoy"] }
  );
}

const entry = {
  id: "umg-envoy-agent",
  name: "UMG Envoy Agent",
  description: "Public-safe UMG planner plugin surface for OpenClaw.",
  register(api: { registerTool: (definition: any, options?: { optional?: boolean }) => void; registerCli?: (register: any, options?: { commands?: string[] }) => void }, config?: PluginConfig) {
    registerCliBridge(api, config);

    api.registerTool(
      {
        name: "umg_envoy_status",
        description: "Report current public-safe lane status and fail-closed posture.",
        parameters: Type.Object({}, { additionalProperties: false }),
        async execute() {
          return {
            content: [{
              type: "text",
              text: [
                "UMG Envoy Agent public-safe status:",
                "- public-safe planner shorthand surface enabled",
                "- full internal trace/operator surfaces intentionally not widened",
                "- fail-closed posture preserved for invalid/unsupported intent"
              ].join("\n")
            }]
          };
        }
      },
      { optional: true }
    );
  }
};

export default entry;
