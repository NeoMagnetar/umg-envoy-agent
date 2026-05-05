import fs from "node:fs";
import path from "node:path";
import type { LoadedNeostackFile, NeostackLoadRequest, NeostackLoadResult } from "../types.js";

function stripBom(raw: string): string {
  return raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
}

export function neostackPathFromId(libraryRoot: string, neostackId: string): string {
  return path.join(path.resolve(libraryRoot), "AI", "NEOSTACKS", "categories", "core", `${neostackId}.json`);
}

export function loadNeostackFile(request: NeostackLoadRequest): NeostackLoadResult {
  const resolvedPath = request.neostackId ? neostackPathFromId(request.libraryRoot, request.neostackId) : path.resolve(request.neostackPath ?? "");

  if (!fs.existsSync(resolvedPath)) {
    return {
      ok: false,
      neostackPath: resolvedPath,
      warnings: [],
      errors: [`neostack file does not exist: ${resolvedPath}`]
    };
  }

  let raw = "";
  try {
    raw = fs.readFileSync(resolvedPath, "utf8");
  } catch (error) {
    return {
      ok: false,
      neostackPath: resolvedPath,
      warnings: [],
      errors: [`failed to read neostack file: ${resolvedPath}`, String(error)]
    };
  }

  let parsed: LoadedNeostackFile;
  try {
    parsed = JSON.parse(stripBom(raw)) as LoadedNeostackFile;
  } catch (error) {
    return {
      ok: false,
      neostackPath: resolvedPath,
      warnings: [],
      errors: ["neostack JSON is malformed", String(error)]
    };
  }

  return {
    ok: true,
    neostackPath: resolvedPath,
    loadedNeostack: parsed,
    warnings: [],
    errors: []
  };
}
