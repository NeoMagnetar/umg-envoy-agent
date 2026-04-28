import fs from "node:fs";
import path from "node:path";
import type { LoadedSleeveFile, SleeveLoadRequest, SleeveLoadResult } from "../types.js";

function stripBom(raw: string): string {
  return raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
}

export function loadSleeveFile(request: SleeveLoadRequest): SleeveLoadResult {
  const resolvedPath = path.resolve(request.sleevePath);

  if (!fs.existsSync(resolvedPath)) {
    return {
      ok: false,
      sleevePath: resolvedPath,
      warnings: [],
      errors: [`sleeve file does not exist: ${resolvedPath}`]
    };
  }

  let raw = "";
  try {
    raw = fs.readFileSync(resolvedPath, "utf8");
  } catch (error) {
    return {
      ok: false,
      sleevePath: resolvedPath,
      warnings: [],
      errors: [`failed to read sleeve file: ${resolvedPath}`, String(error)]
    };
  }

  let parsed: LoadedSleeveFile;
  try {
    parsed = JSON.parse(stripBom(raw)) as LoadedSleeveFile;
  } catch (error) {
    return {
      ok: false,
      sleevePath: resolvedPath,
      warnings: [],
      errors: ["sleeve JSON is malformed", String(error)]
    };
  }

  return {
    ok: true,
    sleevePath: resolvedPath,
    loadedSleeve: parsed,
    warnings: [],
    errors: []
  };
}
