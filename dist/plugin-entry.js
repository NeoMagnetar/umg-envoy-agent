import { Type } from "@sinclair/typebox";
import { parseUMGPath } from "./umg-path-parser.js";
import { renderUMGPath } from "./umg-path-renderer.js";
import { validateUMGPath } from "./umg-path-validator.js";
import { buildSleeveAwarePublicPath } from "./umg-public-sleeve-builder.js";
function publicMatrixSummary() {
    return {
        total: 3,
        supported: ["parse-path", "validate-path", "render-path", "build-path"],
        failClosed: true,
        internalOnlyAbsent: ["path-trace", "adapter-trace", "compiler-trace"]
    };
}
function registerCliBridge(api, _config) {
    api.registerCli(({ program }) => {
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
            .action(async (opts) => {
            const fs = await import("node:fs");
            const raw = fs.readFileSync(opts.file, "utf8");
            console.log(JSON.stringify(parseUMGPath(raw), null, 2));
        });
        root.command("validate-path")
            .requiredOption("--file <path>")
            .action(async (opts) => {
            const fs = await import("node:fs");
            const raw = fs.readFileSync(opts.file, "utf8");
            const parsed = parseUMGPath(raw);
            const issues = validateUMGPath(parsed);
            console.log(JSON.stringify({ ok: issues.every((issue) => issue.severity !== "error"), issues }, null, 2));
            if (issues.some((issue) => issue.severity === "error")) {
                process.exitCode = 1;
            }
        });
        root.command("render-path")
            .requiredOption("--file <path>")
            .action(async (opts) => {
            const fs = await import("node:fs");
            const raw = fs.readFileSync(opts.file, "utf8");
            const parsed = opts.file.toLowerCase().endsWith('.json') ? JSON.parse(raw) : parseUMGPath(raw);
            console.log(renderUMGPath(parsed));
        });
        root.command("build-path")
            .requiredOption("--message <text>")
            .option("--sleeve <id>")
            .action(async (opts) => {
            console.log(renderUMGPath(buildSleeveAwarePublicPath(opts.message, opts.sleeve)));
        });
        root.command("matrix-status")
            .action(async () => {
            console.log(JSON.stringify(publicMatrixSummary(), null, 2));
        });
    }, { commands: ["umg-envoy"] });
}
const entry = {
    id: "umg-envoy-agent",
    name: "UMG Envoy Agent",
    description: "Public-safe UMG planner plugin surface for OpenClaw.",
    register(api, config) {
        registerCliBridge(api, config);
        api.registerTool({
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
                                "- public-safe sleeve-aware build-path enabled",
                                "- full internal trace/operator surfaces intentionally not widened",
                                "- fail-closed posture preserved for invalid/unsupported intent"
                            ].join("\n")
                        }]
                };
            }
        }, { optional: true });
    }
};
export default entry;
