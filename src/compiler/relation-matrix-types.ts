export type RelationMatrixMode = "response-only" | "temp-write" | "both";

export interface RelationMatrixConfig {
  allowRelationMatrixEmit?: boolean;
  relationMatrixMode?: RelationMatrixMode;
  relationMatrixTempRoot?: string | null;
  relationMatrixWritePolicy?: "temp-only";
  relationMatrixFormat?: "umg-v0.1-ascii";
}

export interface RelationMatrixLine {
  line_kind: "node_state" | "relation" | "diagnostic" | "comment";
  from?: string | null;
  relation_code?: string | null;
  to?: string | null;
  states?: string[];
  text?: string | null;
}

export interface RelationMatrixStatus {
  route: string | null;
  overlayCount: number;
  neostackCount: number;
  neoblockCount: number;
  capabilityCount: number;
  diagnosticCount: number;
}

export interface RelationMatrixRequest {
  sleevePath: string;
  libraryRoot: string;
  compilerRepoPath?: string;
  compilerCliPath?: string;
  compilerCommand?: string;
  outputDir?: string;
  timeoutMs?: number;
  allowCompilerBridge?: boolean;
  allowRelationMatrixEmit?: boolean;
  relationMatrixMode?: RelationMatrixMode;
  relationMatrixTempRoot?: string;
}

export interface RelationMatrixResult {
  ok: boolean;
  sleevePath: string;
  libraryRoot: string;
  bridgeResult?: Record<string, unknown>;
  runtimeSpec?: unknown;
  trace?: unknown;
  diagnostics?: unknown;
  relationMatrixText?: string;
  relationMatrix?: {
    matrix_version: string;
    kind: "snapshot";
    header: Record<string, unknown>;
    lines: RelationMatrixLine[];
    validation?: Record<string, unknown>;
    notes?: string | null;
  };
  relationMatrixPath?: string | null;
  matrixStatus?: RelationMatrixStatus;
  warnings: string[];
  errors: string[];
  boundary: {
    compilerInvoked: boolean;
    relationMatrixEmitted: boolean;
    relationMatrixWritten: boolean;
    umgBlockLibraryModified: false;
    compilerRepoModified: false;
  };
}
