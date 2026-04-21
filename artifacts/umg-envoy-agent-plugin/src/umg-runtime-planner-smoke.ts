import { buildPlannerFromRuntimeMessage } from "./umg-runtime-planner.js";

export function runRuntimePlannerSmoke(): Record<string, unknown> {
  const result = buildPlannerFromRuntimeMessage({
    message: "please analyze this system and give me a concise bullet list",
    sleeveId: "sample-basic-minimal",
    provenance: ["smoke:runtime-planner"],
    notes: ["stage-4 runtime planner smoke"]
  });

  return {
    structural: result.structural,
    semantic: result.semantic,
    plannerTrace: result.plannerTrace,
    issueCodes: result.issues.map((issue) => issue.code),
    doc: {
      use: result.doc.use,
      aim: result.doc.aim,
      need: result.doc.need,
      sleeveId: result.doc.sleeveId,
      triggers: result.doc.triggers,
      loadedStacks: result.doc.loadedStacks,
      stackCount: result.doc.stacks.length,
      winnerCount: result.doc.winners.length
    }
  };
}
