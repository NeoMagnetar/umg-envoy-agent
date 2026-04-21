export interface RuntimeSmokeCase {
    id: string;
    label: string;
    message: string;
    sleeveId?: string;
    expectSemanticOk?: boolean;
}
export declare function runRuntimeSmokeMatrix(): Record<string, unknown>;
