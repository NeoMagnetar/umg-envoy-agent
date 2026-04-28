import type { LoadedSleeveFile, SleeveValidationResult } from "../types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function validateSleeveStructure(input: unknown): SleeveValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(input)) {
    return { ok: false, valid: false, mode: "structural", errors: ["sleeve payload must be an object"], warnings: [] };
  }

  const artifact = input as LoadedSleeveFile;

  if (!isRecord(artifact.identity)) {
    errors.push("missing identity section");
  } else {
    if (typeof artifact.identity.artifact_id !== "string" || artifact.identity.artifact_id.trim() === "") {
      errors.push("identity.artifact_id must be a non-empty string");
    }
    if (artifact.identity.artifact_type !== "sleeve") {
      warnings.push("identity.artifact_type is not 'sleeve'");
    }
  }

  if (!isRecord(artifact.sleeve)) {
    errors.push("missing sleeve section");
  } else {
    if (typeof artifact.sleeve.name !== "string" || artifact.sleeve.name.trim() === "") {
      errors.push("sleeve.name must be a non-empty string");
    }

    const dependencies = artifact.sleeve.dependencies;
    if (!isRecord(dependencies)) {
      warnings.push("sleeve.dependencies missing or not an object");
    } else {
      for (const key of ["sleeve_ids", "neostack_ids", "bundle_ids", "overlay_ids", "schema_ids"] as const) {
        const value = dependencies[key];
        if (value !== undefined && !Array.isArray(value)) {
          errors.push(`sleeve.dependencies.${key} must be an array when present`);
        }
      }
    }

    const composition = artifact.sleeve.composition;
    if (!isRecord(composition)) {
      warnings.push("sleeve.composition missing or not an object");
    } else {
      for (const key of ["neostack_ids", "bundle_ids", "overlay_ids", "local_refs"] as const) {
        const value = composition[key];
        if (value !== undefined && !Array.isArray(value)) {
          errors.push(`sleeve.composition.${key} must be an array when present`);
        }
      }
    }

    if (Array.isArray(artifact.sleeve.routes)) {
      for (const route of artifact.sleeve.routes) {
        if (!isRecord(route)) {
          errors.push("sleeve.routes entries must be objects");
          break;
        }
        if (typeof route.route_id !== "string" || typeof route.target !== "string") {
          errors.push("sleeve.routes entries must include route_id and target strings");
          break;
        }
      }
    } else {
      warnings.push("sleeve.routes missing or not an array");
    }

    if (isRecord(artifact.sleeve.runtime) && Array.isArray(artifact.sleeve.runtime.services) && artifact.sleeve.runtime.services.includes("relation_matrix")) {
      warnings.push("runtime.services includes relation_matrix, but Stage 7B does not emit it");
    }

    if (isRecord(artifact.sleeve.capabilities) && Array.isArray(artifact.sleeve.capabilities.required) && artifact.sleeve.capabilities.required.includes("CAP.COMPILER.COMPILE")) {
      warnings.push("sleeve requires compiler capability, but compiler bridge remains deferred to Stage 8");
    }
  }

  return {
    ok: errors.length === 0,
    valid: errors.length === 0,
    mode: "structural",
    errors,
    warnings
  };
}
