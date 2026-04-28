import type { CompilerBridgeRequest, CompilerInvocationResult } from "../types.js";
export declare function buildCompilerInvocation(request: CompilerBridgeRequest, canonicalIrPath: string, outputDir: string): {
    command: string;
    args: string[];
    cliPath: string;
    timeoutMs: number;
};
export declare function runCompilerProcess(request: CompilerBridgeRequest, canonicalIrPath: string, outputDir: string): Promise<CompilerInvocationResult>;
