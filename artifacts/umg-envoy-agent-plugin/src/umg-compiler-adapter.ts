import path from "node:path";
import { pathToFileURL } from "node:url";
import { resolvePaths } from "./paths.js";
import type { PluginConfig, ResolvedPaths } from "./types.js";
import type { UMGPathDocument, ValidationIssue } from "./umg-path-types.js";

export interface CompilerAdapterIssue extends ValidationIssue {}

export interface CompilerAdapterResult {
  ok: boolean;
  issues: CompilerAdapterIssue[];
  compilerInput: {
    sleeve: any;
    triggerState: { activeTriggerIds: string[] };
  } | null;
  trace: {
    plannerSummary: {
      sleeveId: string;
      stackIds: string[];
      blockIds: string[];
      moltIds: string[];
      winnerPath: string[];
      triggerIds: string[];
    };
    adapterSummary: {
      stackIds: string[];
      blockIds: string[];
      activeTriggerIds: string[];
      provenance: string[];
      bundleIds: string[];
      primaryIds: string[];
    };
  };
  compileResult?: unknown;
}

function push(issues: CompilerAdapterIssue[], severity: CompilerAdapterIssue["severity"], code: string, message: string, path?: string): void {
  issues.push({ severity, code, message, path });
}

function collectPlannerIds(doc: UMGPathDocument): { stackIds: string[]; blockIds: string[]; moltIds: string[] } {
  const stackIds = doc.stacks.map((stack) => stack.id);
  const blockIds = doc.stacks.flatMap((stack) => stack.blocks.map((block) => block.id));
  const moltIds = doc.stacks.flatMap((stack) => stack.blocks.flatMap((block) => block.molts.map((molt) => molt.id)));
  return { stackIds, blockIds, moltIds };
}

async function loadCompileSleeve(paths: ResolvedPaths): Promise<(sleeve: unknown, triggerState: unknown) => unknown> {
  const compilerModuleUrl = pathToFileURL(path.join(paths.compilerV0Root, "dist", "index.js")).href;
  const compilerModule = await import(compilerModuleUrl);
  if (typeof compilerModule.compileSleeve !== "function") {
    throw new Error(`compileSleeve export not found in compiler module: ${compilerModuleUrl}`);
  }
  return compilerModule.compileSleeve as (sleeve: unknown, triggerState: unknown) => unknown;
}

function mapRoleToMoltType(role: string): "directive" | "instruction" | "primary" | "subject" | "philosophy" | "blueprint" {
  if (role === "D") return "directive";
  if (role === "P") return "primary";
  if (role === "S") return "subject";
  if (role === "H") return "philosophy";
  if (role === "B") return "blueprint";
  return "instruction";
}

export function adaptPlannerToCompilerInput(doc: UMGPathDocument): CompilerAdapterResult {
  const issues: CompilerAdapterIssue[] = [];
  const plannerIds = collectPlannerIds(doc);

  if (doc.bundles.length > 0) {
    push(issues, "error", "ADAPTER_UNSUPPORTED_BUNDLES", "Planner bundles are not yet representable in current compiler-v0 adapter", "bundles");
  }
  if (doc.merges.length > 0) {
    push(issues, "error", "ADAPTER_UNSUPPORTED_MERGES", "Planner merges are not yet representable in current compiler-v0 adapter", "merges");
  }

  const blocks: any[] = [];
  const stacks: any[] = [];
  const bundleIds: string[] = [];
  const primaryIds: string[] = [];

  for (const stack of doc.stacks) {
    const primaryId = `${stack.id}::PRIMARY`;
    primaryIds.push(primaryId);
    blocks.push({
      id: primaryId,
      moltType: "primary",
      content: `PRIMARY ${stack.id}`,
      priorityOrder: 0,
      plannerSource: {
        stackId: stack.id,
        kind: "derived_primary"
      }
    });

    const stackBlockIds = [primaryId];
    const segments: any[] = [];

    for (const block of stack.blocks) {
      const instructionBlockIds: string[] = [];

      for (const [index, molt] of block.molts.entries()) {
        const blockId = `${block.id}::${molt.id}`;
        const moltType = mapRoleToMoltType(molt.role);
        blocks.push({
          id: blockId,
          moltType,
          content: `${molt.state.toUpperCase()} ${molt.id}`,
          priorityOrder: index + 1,
          plannerSource: {
            stackId: stack.id,
            blockId: block.id,
            moltId: molt.id,
            state: molt.state,
            role: molt.role
          }
        });
        stackBlockIds.push(blockId);
        if (moltType === "instruction") {
          instructionBlockIds.push(blockId);
        }
      }

      if (instructionBlockIds.length > 1) {
        const bundleId = `bundle.${stack.id}.${block.id}.alternates`;
        bundleIds.push(bundleId);
        segments.push({
          id: bundleId,
          kind: "bundle",
          blockIds: instructionBlockIds,
          intent: "alternates",
          axis: "stacked"
        });
      }
    }

    stacks.push({
      id: stack.id,
      name: stack.id,
      domainKey: stack.id,
      gate: {
        triggerIdsAny: doc.triggers
      },
      blockIds: stackBlockIds,
      segments,
      plannerSource: {
        stackId: stack.id,
        blockIds: stack.blocks.map((block) => block.id)
      }
    });
  }

  const triggers = doc.triggers.map((id) => ({ id, name: id }));
  const triggerState = { activeTriggerIds: [...doc.triggers] };

  const sleeve = {
    id: `planner_adapted__${doc.sleeveId}`,
    name: `Planner Adapted ${doc.sleeveId}`,
    version: "v0-planner-adapter",
    blocks,
    stacks,
    triggers,
    plannerMeta: {
      sourceSleeveId: doc.sleeveId,
      winnerPath: doc.winners,
      compilerStages: doc.compiler.stages,
      provenance: ["planner-adapter", "compiler-v0-compatible", "stage11-shape-aligned"]
    }
  };

  return {
    ok: !issues.some((issue) => issue.severity === "error"),
    issues,
    compilerInput: issues.some((issue) => issue.severity === "error")
      ? null
      : { sleeve, triggerState },
    trace: {
      plannerSummary: {
        sleeveId: doc.sleeveId,
        stackIds: plannerIds.stackIds,
        blockIds: plannerIds.blockIds,
        moltIds: plannerIds.moltIds,
        winnerPath: doc.winners.map((winner) => `${winner.key}=${winner.value}`),
        triggerIds: [...doc.triggers]
      },
      adapterSummary: {
        stackIds: stacks.map((stack) => stack.id),
        blockIds: blocks.map((block) => block.id),
        activeTriggerIds: triggerState.activeTriggerIds,
        provenance: ["planner-adapter", "compiler-v0-compatible", "stage11-shape-aligned"],
        bundleIds,
        primaryIds
      }
    }
  };
}

export async function compilePlannerWithAdapter(doc: UMGPathDocument, config?: PluginConfig): Promise<CompilerAdapterResult> {
  const paths = resolvePaths(config ?? {});
  const adapted = adaptPlannerToCompilerInput(doc);
  if (!adapted.ok || !adapted.compilerInput) {
    return adapted;
  }

  const compileSleeve = await loadCompileSleeve(paths);
  try {
    const compileResult = compileSleeve(adapted.compilerInput.sleeve, adapted.compilerInput.triggerState);
    return {
      ...adapted,
      compileResult
    };
  } catch (error) {
    return {
      ...adapted,
      ok: false,
      issues: [
        ...adapted.issues,
        {
          severity: "error",
          code: "ADAPTER_COMPILE_FAILED",
          message: error instanceof Error ? error.message : String(error)
        }
      ]
    };
  }
}
