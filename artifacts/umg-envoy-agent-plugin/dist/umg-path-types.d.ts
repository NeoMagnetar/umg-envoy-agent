export type MoltRoleCode = "T" | "D" | "I" | "S" | "P" | "H" | "B";
export type PlannerNodeState = "active" | "latent" | "suppressed" | "off";
export type PlannerWinnerKind = "chain" | string;
export type RelationshipKind = "PAR" | "SEQ" | "CHN" | "NEST" | "OVR";
export type BundleIntent = "ALT" | "RANK" | "COACT";
export interface GateStateChange {
    state: "active" | "suppressed";
    id: string;
}
export interface MoltNode {
    state: PlannerNodeState;
    role: MoltRoleCode;
    id: string;
}
export interface NeoBlockNode {
    id: string;
    molts: MoltNode[];
}
export interface NeoStackNode {
    id: string;
    blocks: NeoBlockNode[];
}
export interface RelationshipDeclaration {
    kind: RelationshipKind;
    raw: string;
    members: string[];
}
export interface BundleDeclaration {
    role: MoltRoleCode;
    intent: BundleIntent;
    members: string[];
}
export interface MergeDeclaration {
    role: MoltRoleCode;
    sources: string[];
    result: string;
}
export interface WinnerDeclaration {
    key: string;
    value: string;
}
export interface CompilerStageList {
    stages: string[];
}
export interface UMGPathDocument {
    use: string;
    aim: string;
    need: string[];
    sleeveId: string;
    triggers: string[];
    gates: GateStateChange[];
    loadedStacks: string[];
    stacks: NeoStackNode[];
    relationships: RelationshipDeclaration[];
    bundles: BundleDeclaration[];
    merges: MergeDeclaration[];
    winners: WinnerDeclaration[];
    compiler: CompilerStageList;
}
export interface ValidationIssue {
    severity: "error" | "warning";
    code: string;
    message: string;
    path?: string;
}
export interface PlannerLegend {
    stackDisplayOrder?: string[];
    blockToNeoBlock?: Record<string, string>;
    neoBlockToStack?: Record<string, string>;
    blockRoleMap?: Record<string, MoltRoleCode>;
}
export interface BuilderOptions {
    use: string;
    aim: string;
    need?: string[];
    sleeveId?: string;
    legend?: PlannerLegend;
    compilerStages?: string[];
}
