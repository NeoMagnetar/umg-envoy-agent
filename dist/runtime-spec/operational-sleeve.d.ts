import type { OperationalSleeveDemoResultV0, OperationalSleeveProfileV0 } from "./operational-sleeve-types.js";
export declare function listOperationalSleeves(): OperationalSleeveProfileV0[];
export declare function inspectOperationalSleeve(input: {
    sleeve_id: string;
    include_molt_map?: boolean;
    include_ir_matrix?: boolean;
    display_mode?: "compact" | "developer" | "debug";
}): OperationalSleeveDemoResultV0;
export declare function demoOperationalSleeve(input: {
    sleeve_id: string;
    query?: string;
    kind?: string;
    limit?: number;
    root_path?: string;
    recursive?: boolean;
    max_depth?: number;
    max_items?: number;
    display_mode?: "compact" | "developer" | "debug";
}): OperationalSleeveDemoResultV0;
