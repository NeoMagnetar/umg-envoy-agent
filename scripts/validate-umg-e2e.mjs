import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import { emitRelationMatrix } from "../dist/compiler/relation-matrix-emitter.js";

const REQUIRED_RELATIONS = {
  routeGovernance: "OVR.GOV.UMG.ROUTE_CONTROLLER.v1 -F-> route.umg.core_reference.default [GO]",
  overlay: "SLV.UMG.CORE_REFERENCE.v1 -O-> OVR.GOV.UMG.ROUTE_CONTROLLER.v1 [A]",
  neostackNeoblock: "NS.UMG.CORE.COMPILER_FLOW.v1 -V-> NB.UMG.REQUEST_INTAKE.v1 [A]",
  neoblockChain1: "NB.UMG.REQUEST_INTAKE.v1 -H- NB.UMG.ARTIFACT_RESOLUTION.v1 [A]",
  neoblockChain2: "NB.UMG.ARTIFACT_RESOLUTION.v1 -H- NB.UMG.IR_NORMALIZATION.v1 [A]",
  cap1: "OVR.GOV.UMG.ROUTE_CONTROLLER.v1 -C- CAP.ARTIFACT.RESOLVE [VISIBLE]",
  cap2: "OVR.GOV.UMG.ROUTE_CONTROLLER.v1 -C- CAP.IR.BUILD [VISIBLE]",
  cap3: "OVR.GOV.UMG.ROUTE_CONTROLLER.v1 -C- CAP.COMPILER.COMPILE [VISIBLE]",
  cap4: "OVR.GOV.UMG.ROUTE_CONTROLLER.v1 -C- CAP.TRACE.EMIT [VISIBLE]",
  cap5: "OVR.GOV.UMG.ROUTE_CONTROLLER.v1 -C- CAP.MATRIX.EMIT [VISIBLE]"
};

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token?.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      out[key] = true;
      continue;
    }
    out[key] = next;
    i += 1;
  }
  return out;
}

function requiredValue(cli, envName, label) {
  const value = cli ?? process.env[envName];
  if (!value || typeof value !== "string") {
    throw new Error(`missing ${label}; provide --${label} or ${envName}`);
  }
  return path.resolve(value);
}

function optionalValue(cli, envName) {
  const value = cli ?? process.env[envName];
  return value && typeof value === "string" ? path.resolve(value) : undefined;
}

function boolFlag(value, envName, defaultValue = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return ["1", "true", "yes", "on"].includes(value.toLowerCase());
  }
  const envValue = process.env[envName];
  if (typeof envValue === "string") {
    return ["1", "true", "yes", "on"].includes(envValue.toLowerCase());
  }
  return defaultValue;
}

function rel(p) {
  return path.relative(process.cwd(), p) || ".";
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function listRuntimeOutputs(root) {
  const matches = [];
  const targetNames = new Set(["runtime-spec.json", "trace.json", "diagnostics.json", "relation-matrix.umg", "resolved.ir.json"]);
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (targetNames.has(entry.name)) {
        matches.push(full);
      }
    }
  }
  if (fs.existsSync(root)) walk(root);
  return matches;
}

function gitPorcelain(repoPath) {
  return execFileSync("git", ["-C", repoPath, "status", "--porcelain"], { encoding: "utf8" }).trim();
}

async function runMode(common, outputDir, relationMatrixMode) {
  return emitRelationMatrix({
    ...common,
    outputDir,
    relationMatrixMode,
    allowCompilerBridge: true,
    allowRelationMatrixEmit: true
  });
}

function summarizeResult(result, modeLabel) {
  return {
    mode: modeLabel,
    sleeveLoad: Boolean(result.bridgeResult?.loadedSleeveSummary?.artifactId),
    artifactResolution: Boolean(result.bridgeResult?.artifactResolution?.ok),
    compilerExitCode: result.bridgeResult?.compilerInvocation?.exitCode ?? null,
    runtimeSpecCaptured: Boolean(result.runtimeSpec),
    traceCaptured: Boolean(result.trace),
    diagnosticsCaptured: Boolean(result.diagnostics),
    relationMatrixTextReturned: typeof result.relationMatrixText === "string" && result.relationMatrixText.length > 0,
    relationMatrixPath: result.relationMatrixPath ?? null,
    warnings: Array.isArray(result.warnings) ? result.warnings.length : 0,
    errors: Array.isArray(result.errors) ? result.errors.length : 0
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sleevePath = requiredValue(args.sleevePath, "UMG_E2E_SLEEVE_PATH", "sleevePath");
  const libraryRoot = requiredValue(args.libraryRoot, "UMG_E2E_LIBRARY_ROOT", "libraryRoot");
  const compilerRepoPath = requiredValue(args.compilerRepoPath, "UMG_E2E_COMPILER_REPO_PATH", "compilerRepoPath");
  const tempRoot = optionalValue(args.tempRoot, "UMG_E2E_TEMP_ROOT") ?? path.resolve(process.cwd(), ".tmp-stage11b-e2e");
  const keepTemp = boolFlag(args.keepTemp, "UMG_E2E_KEEP_TEMP", false);

  assert(fs.existsSync(sleevePath), `sleevePath not found: ${sleevePath}`);
  assert(fs.existsSync(libraryRoot), `libraryRoot not found: ${libraryRoot}`);
  assert(fs.existsSync(compilerRepoPath), `compilerRepoPath not found: ${compilerRepoPath}`);

  const beforeEnvoy = gitPorcelain(process.cwd());
  const beforeLibrary = gitPorcelain(libraryRoot);
  const beforeCompiler = gitPorcelain(compilerRepoPath);

  assert(beforeLibrary === "", "UMG-Block-Library must be clean before validate-umg:e2e runs");
  assert(beforeCompiler === "", "umg-compiler must be clean before validate-umg:e2e runs");

  fs.rmSync(tempRoot, { recursive: true, force: true });
  fs.mkdirSync(tempRoot, { recursive: true });

  const common = { sleevePath, libraryRoot, compilerRepoPath };
  const responseDir = path.join(tempRoot, "response-only");
  const tempWriteDir = path.join(tempRoot, "temp-write");

  let responseOnly;
  let tempWrite;
  try {
    responseOnly = await runMode(common, responseDir, "response-only");
    tempWrite = await runMode(common, tempWriteDir, "temp-write");

    assert(responseOnly.ok, "response-only relation matrix run failed");
    assert(tempWrite.ok, "temp-write relation matrix run failed");

    assert(responseOnly.bridgeResult?.compilerInvocation?.exitCode === 0, "response-only compiler bridge exit code was not 0");
    assert(tempWrite.bridgeResult?.compilerInvocation?.exitCode === 0, "temp-write compiler bridge exit code was not 0");

    assert(Boolean(responseOnly.runtimeSpec), "response-only runtimeSpec missing");
    assert(Boolean(responseOnly.trace), "response-only trace missing");
    assert(Boolean(responseOnly.diagnostics), "response-only diagnostics missing");
    assert(Boolean(tempWrite.runtimeSpec), "temp-write runtimeSpec missing");
    assert(Boolean(tempWrite.trace), "temp-write trace missing");
    assert(Boolean(tempWrite.diagnostics), "temp-write diagnostics missing");

    assert(typeof responseOnly.relationMatrixText === "string" && responseOnly.relationMatrixText.length > 0, "response-only relationMatrixText missing");
    assert(typeof tempWrite.relationMatrixText === "string" && tempWrite.relationMatrixText.length > 0, "temp-write relationMatrixText missing");

    const responseMatrixPath = path.join(responseDir, "output", "relation-matrix.umg");
    const tempMatrixPath = path.join(tempWriteDir, "output", "relation-matrix.umg");
    assert(!fs.existsSync(responseMatrixPath), "response-only mode unexpectedly wrote relation-matrix.umg");
    assert(fs.existsSync(tempMatrixPath), "temp-write mode did not write relation-matrix.umg");

    const tempText = tempWrite.relationMatrixText;
    for (const [label, relation] of Object.entries(REQUIRED_RELATIONS)) {
      assert(tempText.includes(relation), `missing required relation ${label}: ${relation}`);
    }

    const expectedOutputFiles = [
      path.join(responseDir, "output", "runtime-spec.json"),
      path.join(responseDir, "output", "trace.json"),
      path.join(responseDir, "output", "diagnostics.json"),
      path.join(tempWriteDir, "output", "runtime-spec.json"),
      path.join(tempWriteDir, "output", "trace.json"),
      path.join(tempWriteDir, "output", "diagnostics.json"),
      path.join(responseDir, "input", "resolved.ir.json"),
      path.join(tempWriteDir, "input", "resolved.ir.json"),
      tempMatrixPath
    ];
    for (const file of expectedOutputFiles) {
      assert(fs.existsSync(file), `expected temp output missing: ${file}`);
    }

    const runtimeOutputs = listRuntimeOutputs(process.cwd());
    for (const file of runtimeOutputs) {
      assert(file.startsWith(tempRoot), `runtime output escaped temp root: ${file}`);
    }

    const afterLibrary = gitPorcelain(libraryRoot);
    const afterCompiler = gitPorcelain(compilerRepoPath);
    assert(afterLibrary === "", "UMG-Block-Library was modified during validation");
    assert(afterCompiler === "", "umg-compiler was modified during validation");

    console.log(JSON.stringify({
      ok: true,
      tempRoot: rel(tempRoot),
      responseOnly: summarizeResult(responseOnly, "response-only"),
      tempWrite: summarizeResult(tempWrite, "temp-write"),
      relationAssertions: Object.keys(REQUIRED_RELATIONS),
      contaminationGuard: {
        envoyBaselineCaptured: true,
        umgBlockLibraryClean: true,
        compilerRepoClean: true,
        runtimeOutputsConfinedToTempRoot: true
      },
      cleanup: {
        keepTemp,
        removedByDefault: !keepTemp
      },
      final: "PASS"
    }, null, 2));
  } finally {
    if (!keepTemp) {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  }

  const strayAfterCleanup = listRuntimeOutputs(process.cwd());
  assert(strayAfterCleanup.length === 0, `runtime outputs remain after cleanup: ${strayAfterCleanup.join(", ")}`);

  const finalEnvoy = gitPorcelain(process.cwd());
  const finalLibrary = gitPorcelain(libraryRoot);
  const finalCompiler = gitPorcelain(compilerRepoPath);
  assert(finalEnvoy === beforeEnvoy, "envoy repo tracked state changed during validate-umg:e2e cleanup");
  assert(finalLibrary === "", "UMG-Block-Library is not clean after validate-umg:e2e cleanup");
  assert(finalCompiler === "", "umg-compiler is not clean after validate-umg:e2e cleanup");
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, final: "FAIL", error: error instanceof Error ? error.message : String(error) }, null, 2));
  process.exit(1);
});
