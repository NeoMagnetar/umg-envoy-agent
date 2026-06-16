import { loadCognitiveRegistry, validateCognitiveRegistry } from "./cognitive-registry.js";
import { validateComposedSleeveDryRun } from "./composed-sleeve-validator-dry-run.js";
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
function cloneComposition(composition) {
    return JSON.parse(JSON.stringify(composition));
}
console.log("=== Composed Sleeve Validator Dry-Run Tests ===");
const registry = loadCognitiveRegistry();
const registryValidation = validateCognitiveRegistry(registry);
const sleeveValidation = validateComposedSleeveDryRun({ intent: "explain a sleeve and show block usage" });
const codeValidation = validateComposedSleeveDryRun({ intent: "safe public code generation" });
const postValidation = validateComposedSleeveDryRun({ intent: "draft a public post" });
const repeatedSleeveValidation = validateComposedSleeveDryRun({ intent: "explain a sleeve and show block usage" });
assert("sleeve explanation intent validates successfully", sleeveValidation.ok === true && sleeveValidation.selected_neostack?.id === "NS.SLEEVE_EXPLAINER" && sleeveValidation.validation_status === "valid_dry_run");
assert("code generation intent validates successfully", codeValidation.ok === true && codeValidation.selected_neostack?.id === "NS.PUBLIC_CODER_RUNTIME" && codeValidation.validation_status === "valid_dry_run");
assert("public post/generation intent validates successfully", postValidation.ok === true && postValidation.selected_neostack?.id === "NS.SAFE_GENERATION_PLANNER" && postValidation.validation_status === "valid_dry_run");
assert("validation_trace is present", [sleeveValidation, codeValidation, postValidation].every((result) => result.validation_trace.length > 0));
assert("selection_trace is preserved", [sleeveValidation, codeValidation, postValidation].every((result) => result.selection_trace.length >= 3));
assert("composition_trace is preserved", [sleeveValidation, codeValidation, postValidation].every((result) => result.composition_trace.length >= 5));
assert("all NeoStack refs resolve", registryValidation.missingNeoBlockRefs.length === 0 && [sleeveValidation, codeValidation, postValidation].every((result) => Boolean(result.selected_neostack?.id)));
assert("all NeoBlock refs resolve", [sleeveValidation, codeValidation, postValidation].every((result) => result.resolved_neoblocks.length > 0));
assert("all MOLT refs resolve", registryValidation.missingMoltRefs.length === 0 && [sleeveValidation, codeValidation, postValidation].every((result) => result.resolved_molt_blocks.length > 0));
assert("non_executing remains true", [sleeveValidation, codeValidation, postValidation].every((result) => result.safety.non_executing === true));
assert("writes_enabled remains false", [sleeveValidation, codeValidation, postValidation].every((result) => result.safety.writes_enabled === false));
assert("execution_allowed remains false", [sleeveValidation, codeValidation, postValidation].every((result) => result.safety.execution_allowed === false));
assert("mutation_allowed remains false", [sleeveValidation, codeValidation, postValidation].every((result) => result.safety.mutation_allowed === false));
assert("publish_allowed remains false", [sleeveValidation, codeValidation, postValidation].every((result) => result.safety.publish_allowed === false));
assert("source tools are identified", sleeveValidation.source.composer_tool === "umg_envoy_compose_sleeve_dry_run" && sleeveValidation.source.validator_tool === "umg_envoy_validate_composed_sleeve_dry_run");
const validComposition = composeSleeveDryRun({ intent: "explain a sleeve and show block usage" });
const missingNeoStackRegistry = cloneRegistry(registry);
missingNeoStackRegistry.neostacks = missingNeoStackRegistry.neostacks.filter((entry) => entry.id !== "NS.SLEEVE_EXPLAINER");
const missingNeoStackValidation = validateComposedSleeveDryRun({
    intent: "explain a sleeve and show block usage",
    registry: missingNeoStackRegistry,
    composition: validComposition,
});
assert("unresolved NeoStack path fails closed", missingNeoStackValidation.ok === false && missingNeoStackValidation.validation_status === "invalid_dry_run" && missingNeoStackValidation.validation_errors.some((error) => error.includes("Selected NeoStack resolves")));
const missingNeoBlockComposition = cloneComposition(validComposition);
missingNeoBlockComposition.resolved_neoblocks[0].id = "NB.MISSING";
const missingNeoBlockValidation = validateComposedSleeveDryRun({
    intent: "explain a sleeve and show block usage",
    composition: missingNeoBlockComposition,
});
assert("unresolved NeoBlock path fails closed", missingNeoBlockValidation.ok === false && missingNeoBlockValidation.validation_errors.some((error) => error.includes("resolved NeoBlocks")));
const missingMoltComposition = cloneComposition(validComposition);
missingMoltComposition.resolved_molt_blocks[0].id = "MOLT.MISSING";
const missingMoltValidation = validateComposedSleeveDryRun({
    intent: "explain a sleeve and show block usage",
    composition: missingMoltComposition,
});
assert("unresolved MOLT path fails closed", missingMoltValidation.ok === false && missingMoltValidation.validation_errors.some((error) => error.includes("resolved MOLT")));
const emptyIntentValidation = validateComposedSleeveDryRun({ intent: "" });
assert("empty intent fails safely", emptyIntentValidation.ok === false && emptyIntentValidation.safety.non_executing === true && emptyIntentValidation.safety.writes_enabled === false);
const unsupportedIntentValidation = validateComposedSleeveDryRun({ intent: "zzzz qqqq frobnicate" });
assert("unsupported intent fails safely", unsupportedIntentValidation.ok === false && unsupportedIntentValidation.validation_errors.some((error) => error.includes("matching intent signals")));
assert("deterministic repeated input returns equivalent validation result", JSON.stringify(sleeveValidation) === JSON.stringify(repeatedSleeveValidation));
console.log(`=== Composed Sleeve Validator Dry-Run Tests Complete: ${passed} passed, ${failed} failed ===`);
if (failed > 0)
    process.exit(1);
