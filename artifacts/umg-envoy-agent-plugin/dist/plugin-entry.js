import fs from "node:fs";
import { Type } from "@sinclair/typebox";
import { createMoltBlock, createNeoBlock, createNeoStack, createSleeve, validateArtifact } from "./authoring.js";
import { buildActivationTraceView, buildRuntimeActivationPayload, deriveCompilerV0TriggerState } from "./activation-runtime.js";
import { parseUMGPath } from "./umg-path-parser.js";
import { renderUMGPath } from "./umg-path-renderer.js";
import { validateUMGPath, validateUMGPathSemantically } from "./umg-path-validator.js";
import { buildPlannerFromRuntimeMessage } from "./umg-runtime-planner.js";
import { runCompilerSmokeTest } from "./compiler-smoke.js";
import { readBlockCategoryIndex, readBlockLibraryIndex } from "./blocks.js";
import { resolvePaths } from "./paths.js";
import { listRuntimeBackups, rollbackRuntimeFromBackup } from "./rollback.js";
import { compareSleeves, compileSleeveById, listSleeves, previewPromotion, promoteCompiledRuntime, summarizeActiveRuntime, validateCompiledRuntime } from "./runtime.js";
import { scaffoldMicroAgentBlock } from "./scaffold.js";
import { extractLatestUserText, loadTriggerBlocks, resolveTriggerBehaviorFromUserText } from "./trigger-hooks.js";
function loadHostPluginConfigFallback() {
    try {
        const configPath = "C:\\Users\\Magne\\.openclaw\\openclaw.json";
        const raw = fs.readFileSync(configPath, "utf8");
        const parsed = JSON.parse(raw);
        return parsed?.plugins?.entries?.["openclaw-umg-envoy-agent"]?.config ?? {};
    }
    catch {
        return {};
    }
}
function effectiveConfig(config, overrides) {
    return { ...loadHostPluginConfigFallback(), ...(config ?? {}), ...(overrides ?? {}) };
}
function pickAllowRuntimeWritesOverride(value) {
    return typeof value === "boolean" ? { allowRuntimeWrites: value } : undefined;
}
function registerCliBridge(api, config) {
    api.registerCli(({ program }) => {
        const root = program.command("umg-envoy").description("UMG Envoy Agent validation and runtime utilities");
        root.command("status").action(async () => {
            const cfg = effectiveConfig(config);
            const paths = resolvePaths(cfg);
            console.log(JSON.stringify({
                stage: "stage-5-validation",
                doctrineAnchor: paths.doctrineAnchor,
                compilerRoot: paths.compilerV0Root,
                resleeverRoot: paths.resleeverRoot,
                allowRuntimeWrites: Boolean(cfg.allowRuntimeWrites),
                configSource: {
                    injectedConfigPresent: Boolean(config),
                    effectiveConfig: cfg
                }
            }, null, 2));
        });
        root.command("activation-trace")
            .requiredOption("--message <text>")
            .option("--sleeve <id>")
            .action(async (opts) => {
            const cfg = effectiveConfig(config);
            const paths = resolvePaths(cfg);
            const trace = buildActivationTraceView({
                paths,
                messages: [{ role: "user", content: opts.message }],
                sleeveId: opts.sleeve,
                provenance: ["cli:umg-envoy activation-trace"],
                notes: ["debug surface for runtime activation and compiler-v0 adapter"]
            });
            console.log(JSON.stringify(trace, null, 2));
        });
        root.command("compiler-smoke")
            .requiredOption("--message <text>")
            .option("--sleeve <id>")
            .action(async (opts) => {
            const cfg = effectiveConfig(config);
            const paths = resolvePaths(cfg);
            const result = await runCompilerSmokeTest({
                paths,
                message: opts.message,
                sleeveId: opts.sleeve
            });
            console.log(JSON.stringify(result, null, 2));
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
            .option("--semantic")
            .action(async (opts) => {
            const fs = await import("node:fs");
            const raw = fs.readFileSync(opts.file, "utf8");
            const parsed = parseUMGPath(raw);
            const cfg = effectiveConfig(config);
            const paths = resolvePaths(cfg);
            const issues = opts.semantic ? validateUMGPathSemantically(parsed, paths) : validateUMGPath(parsed);
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
            const result = buildPlannerFromRuntimeMessage({
                message: opts.message,
                sleeveId: opts.sleeve,
                provenance: ["cli:umg-envoy build-path"],
                notes: ["stage-4 deterministic runtime planner build"],
                use: "build_live_runtime_path",
                aim: "human_inspectable_planner_route",
                need: ["validated_route", "planner_visibility", "compiler_handoff_ready"]
            }, effectiveConfig(config));
            console.log(renderUMGPath(result.doc));
        });
        root.command("path-trace")
            .requiredOption("--message <text>")
            .option("--sleeve <id>")
            .action(async (opts) => {
            const result = buildPlannerFromRuntimeMessage({
                message: opts.message,
                sleeveId: opts.sleeve,
                provenance: ["cli:umg-envoy path-trace"],
                notes: ["stage-4 runtime planner trace"],
                use: "build_live_runtime_path",
                aim: "inspectable_runtime_planner_trace",
                need: ["traceability", "structural_validity", "semantic_resolution"]
            }, effectiveConfig(config));
            console.log(JSON.stringify(result, null, 2));
        });
        root.command("list-sleeves").action(async () => {
            const cfg = effectiveConfig(config);
            const paths = resolvePaths(cfg);
            console.log(JSON.stringify(listSleeves(paths), null, 2));
        });
        root.command("read-active-runtime").action(async () => {
            const cfg = effectiveConfig(config);
            const paths = resolvePaths(cfg);
            console.log(JSON.stringify(summarizeActiveRuntime(paths), null, 2));
        });
        root.command("list-block-libraries").action(async () => {
            const cfg = effectiveConfig(config);
            const paths = resolvePaths(cfg);
            console.log(JSON.stringify({
                categoryIndex: readBlockCategoryIndex(paths),
                libraryIndex: readBlockLibraryIndex(paths)
            }, null, 2));
        });
        root.command("compare-sleeves")
            .requiredOption("--left <id>")
            .requiredOption("--right <id>")
            .action(async (opts) => {
            const cfg = effectiveConfig(config);
            const paths = resolvePaths(cfg);
            console.log(JSON.stringify(compareSleeves(paths, opts.left, opts.right), null, 2));
        });
        root.command("compile-sleeve")
            .requiredOption("--sleeve <id>")
            .option("--pretty")
            .action(async (opts) => {
            const cfg = effectiveConfig(config);
            const paths = resolvePaths(cfg);
            console.log(JSON.stringify(await compileSleeveById(paths, opts.sleeve, { pretty: opts.pretty }), null, 2));
        });
        root.command("validate-runtime-output")
            .requiredOption("--path <file>")
            .action(async (opts) => {
            const fs = await import("node:fs");
            const payload = JSON.parse(fs.readFileSync(opts.path, "utf8"));
            console.log(JSON.stringify(validateCompiledRuntime(payload), null, 2));
        });
        root.command("preview-promotion")
            .requiredOption("--path <file>")
            .requiredOption("--sleeve <id>")
            .option("--label <label>")
            .action(async (opts) => {
            const cfg = effectiveConfig(config);
            const paths = resolvePaths(cfg);
            console.log(JSON.stringify(previewPromotion(paths, opts.path, opts.sleeve, opts.label), null, 2));
        });
        root.command("promote-runtime")
            .requiredOption("--path <file>")
            .requiredOption("--sleeve <id>")
            .option("--label <label>")
            .option("--allow-runtime-writes")
            .action(async (opts) => {
            const cfg = effectiveConfig(config, pickAllowRuntimeWritesOverride(opts.allowRuntimeWrites));
            const paths = resolvePaths(cfg);
            console.log(JSON.stringify(promoteCompiledRuntime(paths, cfg, opts.path, opts.sleeve, opts.label), null, 2));
        });
        root.command("list-runtime-backups").action(async () => {
            const cfg = effectiveConfig(config);
            const paths = resolvePaths(cfg);
            console.log(JSON.stringify(listRuntimeBackups(paths), null, 2));
        });
        root.command("rollback-runtime")
            .requiredOption("--backup <dir>")
            .option("--allow-runtime-writes")
            .action(async (opts) => {
            const cfg = effectiveConfig(config, pickAllowRuntimeWritesOverride(opts.allowRuntimeWrites));
            const paths = resolvePaths(cfg);
            console.log(JSON.stringify(rollbackRuntimeFromBackup(paths, cfg, opts.backup), null, 2));
        });
        root.command("create-molt-block")
            .requiredOption("--id <id>")
            .requiredOption("--title <title>")
            .requiredOption("--molt-type <type>")
            .requiredOption("--summary <summary>")
            .option("--allow-runtime-writes")
            .action(async (opts) => {
            const cfg = effectiveConfig(config, pickAllowRuntimeWritesOverride(opts.allowRuntimeWrites));
            const paths = resolvePaths(cfg);
            console.log(JSON.stringify(createMoltBlock(paths, cfg, {
                id: opts.id,
                title: opts.title,
                moltType: opts.moltType,
                summary: opts.summary
            }), null, 2));
        });
        root.command("create-neoblock")
            .requiredOption("--id <id>")
            .requiredOption("--title <title>")
            .requiredOption("--summary <summary>")
            .option("--allow-runtime-writes")
            .action(async (opts) => {
            const cfg = effectiveConfig(config, pickAllowRuntimeWritesOverride(opts.allowRuntimeWrites));
            const paths = resolvePaths(cfg);
            console.log(JSON.stringify(createNeoBlock(paths, cfg, opts), null, 2));
        });
        root.command("create-neostack")
            .requiredOption("--id <id>")
            .requiredOption("--title <title>")
            .requiredOption("--summary <summary>")
            .option("--allow-runtime-writes")
            .action(async (opts) => {
            const cfg = effectiveConfig(config, pickAllowRuntimeWritesOverride(opts.allowRuntimeWrites));
            const paths = resolvePaths(cfg);
            console.log(JSON.stringify(createNeoStack(paths, cfg, opts), null, 2));
        });
        root.command("create-sleeve")
            .requiredOption("--id <id>")
            .requiredOption("--title <title>")
            .requiredOption("--stack <id...>")
            .option("--allow-runtime-writes")
            .action(async (opts) => {
            const cfg = effectiveConfig(config, pickAllowRuntimeWritesOverride(opts.allowRuntimeWrites));
            const paths = resolvePaths(cfg);
            console.log(JSON.stringify(createSleeve(paths, cfg, {
                id: opts.id,
                title: opts.title,
                stackIds: opts.stack
            }), null, 2));
        });
        root.command("validate-artifact")
            .requiredOption("--kind <kind>")
            .requiredOption("--path <file>")
            .action(async (opts) => {
            const fs = await import("node:fs");
            const payload = JSON.parse(fs.readFileSync(opts.path, "utf8"));
            console.log(JSON.stringify(validateArtifact(payload, opts.kind), null, 2));
        });
        root.command("scaffold-micro-agent")
            .requiredOption("--id <id>")
            .requiredOption("--title <title>")
            .requiredOption("--role <role>")
            .requiredOption("--summary <summary>")
            .option("--allow-runtime-writes")
            .action(async (opts) => {
            const cfg = effectiveConfig(config, pickAllowRuntimeWritesOverride(opts.allowRuntimeWrites));
            const paths = resolvePaths(cfg);
            console.log(JSON.stringify(scaffoldMicroAgentBlock(paths, cfg, opts), null, 2));
        });
    }, { commands: ["umg-envoy"] });
}
function registerExperimentalReplyTriggerHooks(api, config) {
    const debugDirectReplyBehavior = Boolean(config?.debugDirectReplyBehavior);
    if (typeof api.registerHook !== "function") {
        return;
    }
    const exactResponseBySession = new Map();
    api.registerHook("before_prompt_build", async (event) => {
        const sessionId = typeof event?.sessionId === "string" ? event.sessionId : "";
        const paths = resolvePaths(config ?? {});
        const triggerBlocks = loadTriggerBlocks(paths);
        const latestUserText = extractLatestUserText(Array.isArray(event?.messages) ? event.messages : []);
        const runtimeActivationPayload = buildRuntimeActivationPayload({
            paths,
            latestUserText,
            notes: ["derived from authored trigger manifests and latest user message"]
        });
        const compilerV0TriggerState = deriveCompilerV0TriggerState(runtimeActivationPayload);
        const resolved = resolveTriggerBehaviorFromUserText(latestUserText, triggerBlocks);
        if (!resolved) {
            if (sessionId) {
                exactResponseBySession.delete(sessionId);
            }
            return undefined;
        }
        if (resolved.kind === "exact_response") {
            if (sessionId) {
                exactResponseBySession.set(sessionId, resolved.content);
            }
            if (!debugDirectReplyBehavior) {
                return {
                    prependSystemContext: [
                        "UMG trigger detected for this reply.",
                        `Runtime activation triggerIds: ${JSON.stringify(runtimeActivationPayload.triggerIds)}.`,
                        `Compiler-v0 activeTriggerIds: ${JSON.stringify(compilerV0TriggerState.activeTriggerIds)}.`,
                        `Matched trigger block: ${resolved.triggerId}.`,
                        "Do not mention hidden routing, triggers, hooks, or internal control surfaces unless explicitly asked.",
                    ].join(" ")
                };
            }
            return {
                prependSystemContext: [
                    "UMG exact-response trigger is active for this reply only.",
                    `Matched trigger block: ${resolved.triggerId}.`,
                    `Reply with exactly this text and nothing else: ${JSON.stringify(resolved.content)}`,
                    "Do not add formatting, explanation, prefixes, suffixes, or extra punctuation.",
                    "Do not mention triggers, hooks, hidden modes, or internal routing.",
                ].join(" ")
            };
        }
        if (sessionId) {
            exactResponseBySession.delete(sessionId);
        }
        return {
            prependSystemContext: [
                `Runtime activation triggerIds: ${JSON.stringify(runtimeActivationPayload.triggerIds)}.`,
                `Compiler-v0 activeTriggerIds: ${JSON.stringify(compilerV0TriggerState.activeTriggerIds)}.`,
                `Matched trigger block: ${resolved.triggerId}.`,
                resolved.prependSystemContext
            ].join(" ")
        };
    }, {
        name: "umg-experimental-before-prompt-build-triggers",
        description: "Experimental reply-local trigger routing for UMG sleeve behavior tests.",
        priority: 100
    });
    api.registerHook("message_sending", async (event, ctx) => {
        const sessionId = typeof ctx?.sessionKey === "string" ? ctx.sessionKey : "";
        const forcedContent = sessionId ? exactResponseBySession.get(sessionId) : undefined;
        if (!forcedContent || !debugDirectReplyBehavior) {
            return undefined;
        }
        exactResponseBySession.delete(sessionId);
        return {
            content: forcedContent
        };
    }, {
        name: "umg-experimental-message-sending-exact-response",
        description: "Experimental exact-response override for UMG trigger tests.",
        priority: 100
    });
}
const entry = {
    id: "openclaw-umg-envoy-agent",
    name: "OpenClaw UMG Envoy Agent",
    description: "UMG cognitive runtime plugin that bridges doctrine, canonical compiler, and resleever operations.",
    register(api, config) {
        registerExperimentalReplyTriggerHooks(api, config);
        registerCliBridge(api, config);
        api.registerTool({
            name: "umg_envoy_activation_trace",
            description: "Inspect detected activation candidates, canonical runtime activation payload, and derived compiler-v0 triggerState for a message.",
            parameters: Type.Object({
                message: Type.String({ description: "Message text to inspect." }),
                sleeveId: Type.Optional(Type.String({ description: "Optional sleeve id hint." }))
            }, { additionalProperties: false }),
            async execute(_id, params) {
                const paths = resolvePaths(config ?? {});
                const trace = buildActivationTraceView({
                    paths,
                    messages: [{ role: "user", content: params.message }],
                    sleeveId: params.sleeveId,
                    provenance: ["tool:umg_envoy_activation_trace"],
                    notes: ["debug surface for runtime activation and compiler-v0 adapter"]
                });
                return {
                    content: [{ type: "text", text: JSON.stringify(trace, null, 2) }]
                };
            }
        }, { optional: true });
        api.registerTool({
            name: "umg_envoy_compiler_smoke_test",
            description: "Run a small end-to-end smoke test from message input through runtime activation, compiler-v0 triggerState adaptation, and compiler output/trace.",
            parameters: Type.Object({
                message: Type.String({ description: "Message text to inspect and pass through the smoke test lane." }),
                sleeveId: Type.Optional(Type.String({ description: "Optional sleeve id hint to include in runtime payload." }))
            }, { additionalProperties: false }),
            async execute(_id, params) {
                const paths = resolvePaths(config ?? {});
                const result = await runCompilerSmokeTest({
                    paths,
                    message: params.message,
                    sleeveId: params.sleeveId
                });
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
                };
            }
        }, { optional: true });
        api.registerTool({
            name: "umg_envoy_status",
            description: "Report plugin integration status, resolved paths, and current implementation stage.",
            parameters: Type.Object({}, { additionalProperties: false }),
            async execute() {
                const paths = resolvePaths(config ?? {});
                return {
                    content: [
                        {
                            type: "text",
                            text: [
                                "UMG Envoy Agent status:",
                                "- Stage 1 complete: plugin scaffold established.",
                                "- Stage 2 complete: doctrine anchor, compiler vendor tree, and resleever vendor tree integrated.",
                                "- Stage 3 active: runtime helpers and OpenClaw tool registrations are present.",
                                `- Doctrine anchor: ${paths.doctrineAnchor}`,
                                `- Compiler root: ${paths.compilerV0Root}`,
                                `- Resleever root: ${paths.resleeverRoot}`,
                                `- Runtime writes enabled: ${Boolean(config?.allowRuntimeWrites)}`
                            ].join("\n")
                        }
                    ]
                };
            }
        }, { optional: true });
        api.registerTool({
            name: "umg_envoy_list_sleeves",
            description: "List sleeves from the resleever sleeve catalog and resolve their source file paths.",
            parameters: Type.Object({}, { additionalProperties: false }),
            async execute() {
                const paths = resolvePaths(config ?? {});
                const sleeves = listSleeves(paths);
                return {
                    content: [{ type: "text", text: JSON.stringify(sleeves, null, 2) }]
                };
            }
        }, { optional: true });
        api.registerTool({
            name: "umg_envoy_read_active_runtime",
            description: "Read active sleeve and stack runtime state from the resleever runtime directory.",
            parameters: Type.Object({}, { additionalProperties: false }),
            async execute() {
                const paths = resolvePaths(config ?? {});
                const summary = summarizeActiveRuntime(paths);
                return {
                    content: [{ type: "text", text: JSON.stringify(summary, null, 2) }]
                };
            }
        }, { optional: true });
        api.registerTool({
            name: "umg_envoy_compare_sleeves",
            description: "Compare two sleeves and return mode and stack-level differences.",
            parameters: Type.Object({
                leftSleeveId: Type.String(),
                rightSleeveId: Type.String()
            }, { additionalProperties: false }),
            async execute(_id, params) {
                const paths = resolvePaths(config ?? {});
                const result = compareSleeves(paths, params.leftSleeveId, params.rightSleeveId);
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
                };
            }
        }, { optional: true });
        api.registerTool({
            name: "umg_envoy_list_block_libraries",
            description: "Read bundled or overridden block category and MOLT library index files.",
            parameters: Type.Object({}, { additionalProperties: false }),
            async execute() {
                const paths = resolvePaths(config ?? {});
                const categoryIndex = readBlockCategoryIndex(paths);
                const libraryIndex = readBlockLibraryIndex(paths);
                return {
                    content: [{ type: "text", text: JSON.stringify({ categoryIndex, libraryIndex }, null, 2) }]
                };
            }
        }, { optional: true });
        api.registerTool({
            name: "umg_envoy_compile_sleeve",
            description: "Compile a sleeve by id through the canonical UMG compiler and return the resulting runtime output path.",
            parameters: Type.Object({
                sleeveId: Type.String({ description: "Sleeve id from the sleeve catalog." }),
                pretty: Type.Optional(Type.Boolean({ description: "Pretty-print compiler output JSON." }))
            }, { additionalProperties: false }),
            async execute(_id, params) {
                const paths = resolvePaths(config ?? {});
                const result = await compileSleeveById(paths, params.sleeveId, { pretty: params.pretty });
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
                };
            }
        }, { optional: true });
        api.registerTool({
            name: "umg_envoy_validate_runtime_output",
            description: "Validate a compiled runtime JSON output before promotion or downstream use.",
            parameters: Type.Object({
                compiledOutputPath: Type.String({ description: "Path to the compiled runtime JSON output." })
            }, { additionalProperties: false }),
            async execute(_id, params) {
                const compiled = await import("node:fs").then(({ readFileSync }) => JSON.parse(readFileSync(params.compiledOutputPath, "utf8")));
                const validation = validateCompiledRuntime(compiled);
                return {
                    content: [{ type: "text", text: JSON.stringify(validation, null, 2) }]
                };
            }
        }, { optional: true });
        api.registerTool({
            name: "umg_envoy_preview_promotion",
            description: "Preview a runtime promotion and return the expected active-state changes without writing runtime files.",
            parameters: Type.Object({
                compiledOutputPath: Type.String({ description: "Path to the compiled runtime JSON output." }),
                sleeveId: Type.String({ description: "Sleeve id being promoted." }),
                promotionLabel: Type.Optional(Type.String({ description: "Optional human label for this promotion." }))
            }, { additionalProperties: false }),
            async execute(_id, params) {
                const paths = resolvePaths(config ?? {});
                const preview = previewPromotion(paths, params.compiledOutputPath, params.sleeveId, params.promotionLabel);
                return {
                    content: [{ type: "text", text: JSON.stringify(preview, null, 2) }]
                };
            }
        }, { optional: true });
        api.registerTool({
            name: "umg_envoy_promote_runtime",
            description: "Promote a compiled runtime output into active resleever state with validation and backup. Requires allowRuntimeWrites.",
            parameters: Type.Object({
                compiledOutputPath: Type.String({ description: "Path to the compiled runtime JSON output." }),
                sleeveId: Type.String({ description: "Sleeve id being promoted." }),
                promotionLabel: Type.Optional(Type.String({ description: "Optional human label for this promotion." }))
            }, { additionalProperties: false }),
            async execute(_id, params) {
                const cfg = effectiveConfig(config);
                const paths = resolvePaths(cfg);
                const result = promoteCompiledRuntime(paths, cfg, params.compiledOutputPath, params.sleeveId, params.promotionLabel);
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
                };
            }
        }, { optional: true });
        api.registerTool({
            name: "umg_envoy_list_runtime_backups",
            description: "List available runtime backup snapshots created before promotions.",
            parameters: Type.Object({}, { additionalProperties: false }),
            async execute() {
                const paths = resolvePaths(config ?? {});
                const backups = listRuntimeBackups(paths);
                return {
                    content: [{ type: "text", text: JSON.stringify(backups, null, 2) }]
                };
            }
        }, { optional: true });
        api.registerTool({
            name: "umg_envoy_rollback_runtime",
            description: "Restore active runtime files from a previous backup snapshot. Requires allowRuntimeWrites.",
            parameters: Type.Object({
                backupDir: Type.String({ description: "Path to a runtime backup directory." })
            }, { additionalProperties: false }),
            async execute(_id, params) {
                const cfg = effectiveConfig(config);
                const paths = resolvePaths(cfg);
                const result = rollbackRuntimeFromBackup(paths, cfg, params.backupDir);
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
                };
            }
        }, { optional: true });
        api.registerTool({
            name: "umg_envoy_create_molt_block",
            description: "Create a structured MOLT block artifact. Requires allowRuntimeWrites.",
            parameters: Type.Object({
                id: Type.String(),
                title: Type.String(),
                moltType: Type.String(),
                summary: Type.String(),
                authority: Type.Optional(Type.Number()),
                tags: Type.Optional(Type.Array(Type.String())),
                targetFolder: Type.Optional(Type.String())
            }, { additionalProperties: false }),
            async execute(_id, params) {
                const cfg = effectiveConfig(config);
                const paths = resolvePaths(cfg);
                const result = createMoltBlock(paths, cfg, params);
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
                };
            }
        }, { optional: true });
        api.registerTool({
            name: "umg_envoy_create_neoblock",
            description: "Create a structured NeoBlock artifact. Requires allowRuntimeWrites.",
            parameters: Type.Object({
                id: Type.String(),
                title: Type.String(),
                summary: Type.String(),
                blockIds: Type.Optional(Type.Array(Type.String())),
                targetFolder: Type.Optional(Type.String())
            }, { additionalProperties: false }),
            async execute(_id, params) {
                const cfg = effectiveConfig(config);
                const paths = resolvePaths(cfg);
                const result = createNeoBlock(paths, cfg, params);
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
                };
            }
        }, { optional: true });
        api.registerTool({
            name: "umg_envoy_create_neostack",
            description: "Create a structured NeoStack artifact. Requires allowRuntimeWrites.",
            parameters: Type.Object({
                id: Type.String(),
                title: Type.String(),
                summary: Type.String(),
                memberIds: Type.Optional(Type.Array(Type.String())),
                targetFolder: Type.Optional(Type.String())
            }, { additionalProperties: false }),
            async execute(_id, params) {
                const cfg = effectiveConfig(config);
                const paths = resolvePaths(cfg);
                const result = createNeoStack(paths, cfg, params);
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
                };
            }
        }, { optional: true });
        api.registerTool({
            name: "umg_envoy_create_sleeve",
            description: "Create a structured Sleeve artifact. Requires allowRuntimeWrites.",
            parameters: Type.Object({
                id: Type.String(),
                title: Type.String(),
                stackIds: Type.Array(Type.String()),
                mode: Type.Optional(Type.String()),
                bpMode: Type.Optional(Type.String()),
                notes: Type.Optional(Type.String()),
                targetFolder: Type.Optional(Type.String())
            }, { additionalProperties: false }),
            async execute(_id, params) {
                const cfg = effectiveConfig(config);
                const paths = resolvePaths(cfg);
                const result = createSleeve(paths, cfg, params);
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
                };
            }
        }, { optional: true });
        api.registerTool({
            name: "umg_envoy_validate_artifact",
            description: "Validate a UMG artifact payload as a MOLT block, NeoBlock, NeoStack, or Sleeve.",
            parameters: Type.Object({
                kind: Type.String(),
                payload: Type.Any()
            }, { additionalProperties: false }),
            async execute(_id, params) {
                const result = validateArtifact(params.payload, params.kind);
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
                };
            }
        }, { optional: true });
        api.registerTool({
            name: "umg_envoy_scaffold_micro_agent",
            description: "Create a first-pass micro-agent block scaffold in the resleever block tree. Requires allowRuntimeWrites.",
            parameters: Type.Object({
                id: Type.String(),
                title: Type.String(),
                role: Type.String(),
                summary: Type.String(),
                targetFolder: Type.Optional(Type.String())
            }, { additionalProperties: false }),
            async execute(_id, params) {
                const cfg = effectiveConfig(config);
                const paths = resolvePaths(cfg);
                const result = scaffoldMicroAgentBlock(paths, cfg, params);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            }
        }, { optional: true });
    }
};
export default entry;
