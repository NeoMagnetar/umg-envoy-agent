import type { RuntimeSpec, RuntimeValidationResult } from "../types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function validateRuntimeOutput(input: unknown): RuntimeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(input)) {
    return { ok: false, valid: false, errors: ["runtime output must be an object"], warnings: [] };
  }

  for (const key of ["runtimespec_id", "sleeve_id", "snap_id", "primary_shell_block_id"] as const) {
    if (typeof input[key] !== "string" || input[key].trim() === "") {
      errors.push(`missing required field: ${key}`);
    }
  }

  for (const key of ["active_blocks", "prompt_parts", "constraints", "tool_requests", "errors", "warnings"] as const) {
    if (!Array.isArray(input[key])) {
      errors.push(`${key} must be an array`);
    }
  }

  for (const key of ["strategy", "context", "values", "format"] as const) {
    if (!isRecord(input[key])) {
      errors.push(`${key} must be an object`);
    }
  }

  if (Array.isArray(input.active_blocks) && input.active_blocks.some((entry) => typeof entry !== "string")) {
    errors.push("active block list is valid only when all entries are strings");
  }

  if (Array.isArray(input.prompt_parts)) {
    for (const part of input.prompt_parts) {
      if (!isRecord(part)) {
        errors.push("prompt_parts entries must be objects");
        break;
      }
      if (typeof part.block_id !== "string" || typeof part.kind !== "string" || typeof part.text !== "string") {
        errors.push("prompt_parts entries must include block_id, kind, and text");
        break;
      }
      if (typeof part.authority !== "number") {
        errors.push("prompt_parts entries must include numeric authority");
        break;
      }
    }
  }

  if (typeof input.primary_shell_block_id === "string" && Array.isArray(input.active_blocks) && !input.active_blocks.includes(input.primary_shell_block_id)) {
    warnings.push("primary shell exists but is not present in active_blocks");
  }

  return {
    ok: errors.length === 0,
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export function assertValidRuntimeOutput(input: unknown): RuntimeSpec {
  const result = validateRuntimeOutput(input);
  if (!result.valid) {
    throw new Error(result.errors.join("; "));
  }
  return input as RuntimeSpec;
}
