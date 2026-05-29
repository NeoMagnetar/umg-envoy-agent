import { type ActionGateRuntimeReportViewMode } from "./action-gate-types.js";
import type { PluginConfig } from "./types.js";
export declare function effectiveConfig(config?: PluginConfig): {
    allowRuntimeWrites: boolean;
    contentMode: "bundled-public" | string;
    compilerMode: "bundled-adapter" | "external-cli" | string;
    debug: boolean;
    defaultSleeveId?: string;
    compilerBridge?: import("./types.js").CompilerBridgeConfig;
    relationMatrix?: import("./types.js").RelationMatrixConfig;
};
export declare function statusPayload(config?: PluginConfig): {
    ok: boolean;
    plugin: string;
    version: string;
    compilerAdapter: string;
    contentMode: string;
    compilerMode: string;
    allowRuntimeWrites: boolean;
    sampleSleeves: number;
    sampleBlocks: number;
    supportedTools: string[];
};
export declare function createRuntimeReportToolSurface(input: {
    toolId: string;
    toolName?: string;
    mode?: ActionGateRuntimeReportViewMode;
}): import("./action-gate-types.js").ActionGateRuntimeReportView;
declare const entry: {
    id: string;
    name: string;
    description: string;
    register(api: {
        registerTool: (definition: any, options?: {
            optional?: boolean;
        }) => void;
        registerCli?: (register: any, options?: {
            commands?: string[];
        }) => void;
    }, config?: PluginConfig): void;
};
export default entry;
