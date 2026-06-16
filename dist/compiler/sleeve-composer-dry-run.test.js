import { loadCognitiveRegistry, validateCognitiveRegistry } from "./cognitive-registry.js";
import { composeSleeveDryRun } from "./sleeve-composer-dry-run.js";
let passed = 0;
let failed = 0;
function assert(label, condition) {
    if (condition) {
        console.log(`PASS: ${label}`);
        passed++;
    }
    else {
        console.log(`FAIL: ${label}`);
        failed++;
    }
}
function cloneRegistry(registry) {
    return JSON.parse(JSON.stringify(registry));
}
console.log("=== Sleeve Composer Dry-Run Tests ===");
const registry = loadCognitiveRegistry();
const validation = validateCognitiveRegistry(registry);
const sleevePlan = composeSleeveDryRun({ intent: "explain a sleeve and show block usage" });
const codePlan = composeSleeveDryRun({ intent: "safe public code generation" });
const postPlan = composeSleeveDryRun({ intent: "draft a public post" });
const repeatedSleevePlan = composeSleeveDryRun({ intent: "explain a sleeve and show block usage" });
assert("sleeve explanation intent composes from NS.SLEEVE_EXPLAINER", sleevePlan.ok === true && sleevePlan.selected_neostack?.id === "NS.SLEEVE_EXPLAINER");
assert("code generation intent composes from NS.PUBLIC_CODER_RUNTIME", codePlan.ok === true && codePlan.selected_neostack?.id === "NS.PUBLIC_CODER_RUNTIME");
assert("public post/generation intent composes from NS.SAFE_GENERATION_PLANNER", postPlan.ok === true && postPlan.selected_neostack?.id === "NS.SAFE_GENERATION_PLANNER");
assert("all MOLT refs resolve", validation.missingMoltRefs.length === 0 && [sleevePlan, codePlan, postPlan].every((plan) => plan.resolved_molt_blocks.length > 0));
assert("all NeoBlock refs resolve", validation.missingNeoBlockRefs.length === 0 && [sleevePlan, codePlan, postPlan].every((plan) => plan.resolved_neoblocks.length > 0));
assert("all NeoStack refs resolve", validation.ok === true && [sleevePlan, codePlan, postPlan].every((plan) => Boolean(plan.selected_neostack?.id)));
assert("composition_trace is present", [sleevePlan, codePlan, postPlan].every((plan) => plan.composition_trace.length >= 5));
assert("selection_trace is preserved", [sleevePlan, codePlan, postPlan].every((plan) => plan.selection_trace.length >= 3));
assert("non_executing is true", [sleevePlan, codePlan, postPlan].every((plan) => plan.non_executing === true));
assert("writes_enabled is false", [sleevePlan, codePlan, postPlan].every((plan) => plan.writes_enabled === false));
assert("sleeve outline includes proposed sleeve id and steps", Boolean(sleevePlan.proposed_sleeve_id) && sleevePlan.sleeve_outline?.steps.length === sleevePlan.resolved_neoblocks.length);
assert("deterministic output for repeated same intent", JSON.stringify(sleevePlan) === JSON.stringify(repeatedSleevePlan));
const brokenNeoBlockRegistry = cloneRegistry(registry);
brokenNeoBlockRegistry.neostacks[0].neoblock_refs.push({
    id: "NB.MISSING",
    enabled: true,
    order: 99,
    role: "missing-test",
});
const brokenNeoBlockResult = composeSleeveDryRun({
    intent: "explain a sleeve and show block usage",
    registry: brokenNeoBlockRegistry,
});
assert("unresolved NeoBlock reference path fails closed", brokenNeoBlockResult.ok === false && brokenNeoBlockResult.errors.some((error) => error.includes("Unresolved NeoBlock reference")) && brokenNeoBlockResult.non_executing === true && brokenNeoBlockResult.writes_enabled === false);
const brokenMoltRegistry = cloneRegistry(registry);
brokenMoltRegistry.neoblocks[0].molt_refs.push({
    id: "MOLT.MISSING",
    enabled: true,
    role: "missing-test",
});
const brokenMoltResult = composeSleeveDryRun({
    intent: "explain a sleeve and show block usage",
    registry: brokenMoltRegistry,
});
assert("unresolved MOLT reference path fails closed", brokenMoltResult.ok === false && brokenMoltResult.errors.some((error) => error.includes("Unresolved MOLT reference")) && brokenMoltResult.non_executing === true && brokenMoltResult.writes_enabled === false);
console.log(`=== Sleeve Composer Dry-Run Tests Complete: ${passed} passed, ${failed} failed ===`);
if (failed > 0)
    process.exit(1);
