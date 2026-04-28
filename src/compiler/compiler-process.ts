import path from "node:path";
import { spawn } from "node:child_process";
import type { CompilerBridgeRequest, CompilerInvocationResult } from "../types.js";

function resolveCompilerCliPath(request: CompilerBridgeRequest): string {
  if (request.compilerCliPath) {
    return path.resolve(request.compilerCliPath);
  }
  if (request.compilerRepoPath) {
    return path.resolve(request.compilerRepoPath, "compiler-v0", "dist", "cli.js");
  }
  throw new Error("compilerCliPath or compilerRepoPath is required for compiler bridge execution");
}

export function buildCompilerInvocation(request: CompilerBridgeRequest, canonicalIrPath: string, outputDir: string): { command: string; args: string[]; cliPath: string; timeoutMs: number } {
  const cliPath = resolveCompilerCliPath(request);
  const timeoutMs = request.timeoutMs ?? 30000;

  return {
    command: "node",
    args: [cliPath, "compile-ir", "--in", path.resolve(canonicalIrPath), "--out-dir", path.resolve(outputDir)],
    cliPath,
    timeoutMs
  };
}

export async function runCompilerProcess(request: CompilerBridgeRequest, canonicalIrPath: string, outputDir: string): Promise<CompilerInvocationResult> {
  const invocation = buildCompilerInvocation(request, canonicalIrPath, outputDir);

  return await new Promise((resolve) => {
    const child = spawn(invocation.command, invocation.args, {
      windowsHide: true,
      shell: false
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, invocation.timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({
        ok: false,
        mode: "external-cli",
        commandPath: invocation.cliPath,
        timeoutMs: invocation.timeoutMs,
        exitCode: null,
        stdout,
        stderr: `${stderr}${error}`,
        timedOut
      });
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        ok: code === 0 && !timedOut,
        mode: "external-cli",
        commandPath: invocation.cliPath,
        timeoutMs: invocation.timeoutMs,
        exitCode: code,
        stdout,
        stderr,
        timedOut
      });
    });
  });
}
