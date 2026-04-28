import type { RelationMatrixLine } from "./relation-matrix-types.js";
export declare function renderRelationMatrixText(input: {
    header: {
        sleeve?: string | null;
        route?: string | null;
        ir?: string | null;
        runtime_spec?: string | null;
    };
    lines: RelationMatrixLine[];
}): string;
