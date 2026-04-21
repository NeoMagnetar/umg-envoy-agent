import type { RelationshipKind, UMGPathDocument, ValidationIssue } from "./umg-path-types.js";
export declare function validateUMGPath(doc: UMGPathDocument): ValidationIssue[];
export declare function summarizeValidationIssues(issues: ValidationIssue[]): {
    ok: boolean;
    errors: number;
    warnings: number;
};
export declare function hasValidationErrors(issues: ValidationIssue[]): boolean;
export declare function isCanonicalRelationshipKind(kind: RelationshipKind): boolean;
export declare function plannerValidatorStage(): string;
export declare function plannerValidatorCapabilities(): string[];
export default validateUMGPath;
