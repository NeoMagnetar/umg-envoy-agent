import { normalizeRuntimeSpecBoundary } from "./runtime-spec-boundary.js";
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
console.log("=== RuntimeSpec Boundary Ingestion Tests ===");
const localBoundary = normalizeRuntimeSpecBoundary({ runtimespec_id: "local-1" }, "local_adapter");
assert("local adapter marked valid non-executing artifact", localBoundary.status === "valid_non_executing_artifact");
assert("local adapter nonExecuting true", localBoundary.nonExecuting === true);
assert("local adapter artifactKind runtime_spec", localBoundary.artifactKind === "runtime_spec");
const externalSleeveBoundary = normalizeRuntimeSpecBoundary({
    meta: {
        artifactKind: "runtime_spec",
        nonExecuting: true,
        boundaryNote: "RuntimeSpec is a non-executing compiler artifact and does not grant permission or perform execution."
    }
}, "external_sleeve_runtime");
assert("external sleeve metadata preserved", externalSleeveBoundary.status === "valid_non_executing_artifact");
assert("external sleeve boundary note preserved", externalSleeveBoundary.boundaryNote?.includes("non-executing compiler artifact") === true);
const externalIrBoundary = normalizeRuntimeSpecBoundary({
    state: {
        artifact_kind: "runtime_spec",
        non_executing: true,
        boundary_note: "RuntimeSpec is a non-executing compiler artifact and does not grant permission or perform execution."
    }
}, "external_ir_runtime_spec");
assert("external IR metadata preserved", externalIrBoundary.status === "valid_non_executing_artifact");
assert("external IR artifact kind preserved", externalIrBoundary.artifactKind === "runtime_spec");
const missingBoundary = normalizeRuntimeSpecBoundary({ runtime: {} }, "unknown");
assert("missing metadata becomes warning state", missingBoundary.status === "missing_boundary_metadata");
assert("missing metadata does not infer execution authority", missingBoundary.nonExecuting === null);
assert("missing metadata warning emitted", missingBoundary.warnings.length > 0);
const falseBoundary = normalizeRuntimeSpecBoundary({
    state: {
        artifact_kind: "runtime_spec",
        non_executing: false,
        boundary_note: "bad"
    }
}, "external_ir_runtime_spec");
assert("false non-executing metadata flagged", falseBoundary.status === "boundary_violation");
assert("false non-executing metadata does not become executable", falseBoundary.nonExecuting === false);
console.log(`=== RuntimeSpec Boundary Ingestion Tests Complete: ${passed} passed, ${failed} failed ===`);
if (failed > 0)
    process.exit(1);
