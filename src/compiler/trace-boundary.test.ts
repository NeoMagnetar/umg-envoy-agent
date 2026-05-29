import { normalizeTraceBoundary } from "./trace-boundary.js";

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean) {
  if (condition) {
    console.log(`PASS: ${label}`);
    passed++;
  } else {
    console.log(`FAIL: ${label}`);
    failed++;
  }
}

console.log("=== Trace Boundary Alignment Tests ===");

const normalTraceBoundary = normalizeTraceBoundary({
  events: [
    { code: "INFO_PRIORITY_RESOLVED", message: "Priority conflict resolved: cand-b selected; suppressed [cand-a]." }
  ]
}, "external_trace");
assert("external trace marked valid audit artifact", normalTraceBoundary.status === "valid_audit_artifact");
assert("external trace auditOnly true", normalTraceBoundary.auditOnly === true);
assert("external trace note mentions audit/provenance", normalTraceBoundary.boundaryNote?.includes("audit/provenance") === true);

const localTraceBoundary = normalizeTraceBoundary({
  events: [
    { code: "INFO_BLOCK_EXCLUDED_GOVERNANCE", message: "Block blk_instr_forbidden excluded from active participation because governance forbids it." }
  ]
}, "local_trace");
assert("local trace marked valid audit artifact", localTraceBoundary.status === "valid_audit_artifact");

const permissionViolation = normalizeTraceBoundary({
  events: [
    { code: "BAD_TRACE", message: "Trace confirms permission granted and approved to execute." }
  ]
}, "external_trace");
assert("permission/approval language flagged as boundary violation", permissionViolation.status === "boundary_violation");
assert("permission violation warning emitted", permissionViolation.warnings.some((w) => w.includes("boundary violation")));

const unknownBoundary = normalizeTraceBoundary({ events: [] }, "unknown");
assert("unknown source yields metadata warning state", unknownBoundary.status === "missing_boundary_metadata");
assert("unknown source does not gain authority", unknownBoundary.auditOnly === null);

console.log(`=== Trace Boundary Alignment Tests Complete: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
