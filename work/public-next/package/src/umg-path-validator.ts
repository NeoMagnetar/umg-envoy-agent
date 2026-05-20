import type { UMGPathDocument, ValidationIssue } from "./umg-path-types.js";

function push(
  issues: ValidationIssue[],
  severity: ValidationIssue["severity"],
  code: string,
  message: string,
  path?: string
): void {
  issues.push({ severity, code, message, path });
}

export function validateUMGPath(doc: UMGPathDocument): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!doc.use) push(issues, "error", "MISSING_USE", "USE is required", "use");
  if (!doc.aim) push(issues, "error", "MISSING_AIM", "AIM is required", "aim");
  if (!doc.sleeveId) push(issues, "error", "MISSING_SLEEVE", "SLV is required", "sleeveId");
  if (!doc.compiler?.stages?.length) push(issues, "error", "MISSING_COMPILER_STAGES", "CMP stages are required", "compiler");
  if (!doc.stacks?.length) push(issues, "warning", "NO_STACKS", "Planner document has no STACK declarations");

  return issues;
}

export default validateUMGPath;
