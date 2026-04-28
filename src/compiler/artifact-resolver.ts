import fs from "node:fs";
import path from "node:path";
import type {
  ArtifactResolutionEntry,
  ArtifactResolutionResult,
  LoadedSleeveFile
} from "../types.js";

function addEntry(entries: ArtifactResolutionEntry[], entry: ArtifactResolutionEntry) {
  const key = `${entry.artifactType}::${entry.artifactId}::${entry.sourceReason ?? ""}`;
  if (entries.some((existing) => `${existing.artifactType}::${existing.artifactId}::${existing.sourceReason ?? ""}` === key)) {
    return;
  }
  entries.push(entry);
}

function artifactPathFromId(libraryRoot: string, artifactType: ArtifactResolutionEntry["artifactType"], artifactId: string): string | null {
  switch (artifactType) {
    case "sleeve":
      return path.join(libraryRoot, "AI", "SLEEVES", "categories", "core", artifactId, "sleeve.json");
    case "neostack":
      return path.join(libraryRoot, "AI", "NEOSTACKS", "categories", "core", `${artifactId}.json`);
    case "overlay":
      return path.join(libraryRoot, "AI", "OVERLAYS", "categories", "governance", `${artifactId}.json`);
    case "schema":
      return path.join(libraryRoot, artifactId.replaceAll("/", path.sep));
    case "neoblock":
      return path.join(libraryRoot, "AI", "NEOBLOCKS", "categories", "core", `${artifactId}.json`);
    case "bundle":
      return path.join(libraryRoot, "AI", "BUNDLES", "categories", "core", `${artifactId}.json`);
    case "capability":
      return path.join(libraryRoot, "AI", "CAPABILITIES", `${artifactId}.json`);
    case "toolpack":
      return path.join(libraryRoot, "AI", "TOOLPACKS", `${artifactId}.json`);
    default:
      return null;
  }
}

function resolveList(
  entries: ArtifactResolutionEntry[],
  libraryRoot: string,
  artifactType: ArtifactResolutionEntry["artifactType"],
  values: unknown,
  sourceReason: string,
  sourceRef: string
) {
  if (!Array.isArray(values)) {
    return;
  }
  for (const raw of values) {
    const artifactId = typeof raw === "string" ? raw : null;
    if (!artifactId) {
      addEntry(entries, {
        artifactType,
        artifactId: String(raw),
        expectedPath: null,
        sourceRef,
        sourceReason,
        exists: false,
        status: "invalid"
      });
      continue;
    }
    const expectedPath = artifactPathFromId(libraryRoot, artifactType, artifactId);
    const exists = expectedPath ? fs.existsSync(expectedPath) : false;
    addEntry(entries, {
      artifactType,
      artifactId,
      expectedPath,
      sourceRef,
      sourceReason,
      exists,
      status: exists ? "resolved" : "missing"
    });
  }
}

function resolveNeoblocksFromLocalRefs(entries: ArtifactResolutionEntry[], libraryRoot: string, values: unknown) {
  if (!Array.isArray(values)) {
    return;
  }
  for (const ref of values) {
    if (!ref || typeof ref !== "object") {
      continue;
    }
    const record = ref as Record<string, unknown>;
    const artifactId = typeof record.artifact_id === "string"
      ? record.artifact_id
      : typeof record.block_id === "string"
        ? record.block_id
        : null;
    const artifactType = typeof record.artifact_type === "string" ? record.artifact_type : null;
    if (artifactType !== "neoblock" || !artifactId) {
      continue;
    }
    const expectedPath = artifactPathFromId(libraryRoot, "neoblock", artifactId);
    const exists = expectedPath ? fs.existsSync(expectedPath) : false;
    addEntry(entries, {
      artifactType: "neoblock",
      artifactId,
      expectedPath,
      sourceRef: `local_ref:${artifactId}`,
      sourceReason: "sleeve composition local_ref",
      exists,
      status: exists ? "resolved" : "missing"
    });
  }
}

function resolveNeoblocksFromNeostacks(entries: ArtifactResolutionEntry[], libraryRoot: string) {
  const stacks = entries.filter((entry) => entry.artifactType === "neostack" && entry.exists && entry.expectedPath);
  for (const stack of stacks) {
    try {
      const raw = fs.readFileSync(stack.expectedPath!, "utf8").replace(/^\uFEFF/, "");
      const parsed = JSON.parse(raw) as Record<string, any>;
      const stackSection = parsed.neostack ?? parsed;
      const blockIds = [
        ...(Array.isArray(stackSection?.dependencies?.neoblock_ids) ? stackSection.dependencies.neoblock_ids : []),
        ...(Array.isArray(stackSection?.composition?.neoblock_ids) ? stackSection.composition.neoblock_ids : []),
        ...(Array.isArray(stackSection?.blocks) ? stackSection.blocks.map((item: any) => typeof item === "string" ? item : item?.artifact_id ?? item?.block_id).filter(Boolean) : [])
      ];
      resolveList(entries, libraryRoot, "neoblock", blockIds, "neostack member", `neostack:${stack.artifactId}`);
    } catch {
      addEntry(entries, {
        artifactType: "neoblock",
        artifactId: `UNREADABLE_FROM_${stack.artifactId}`,
        expectedPath: stack.expectedPath,
        sourceRef: `neostack:${stack.artifactId}`,
        sourceReason: "neostack member read failure",
        exists: false,
        status: "invalid"
      });
    }
  }
}

export function resolveSleeveArtifacts(libraryRootInput: string, sleeve: LoadedSleeveFile): ArtifactResolutionResult {
  const libraryRoot = path.resolve(libraryRootInput);
  const entries: ArtifactResolutionEntry[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const sleeveId = sleeve.identity?.artifact_id ?? "UNKNOWN.SLEEVE";

  if (!fs.existsSync(libraryRoot)) {
    return {
      ok: false,
      libraryRoot,
      entries: [],
      missing: [],
      warnings: [],
      errors: [`library root does not exist: ${libraryRoot}`]
    };
  }

  resolveList(entries, libraryRoot, "sleeve", sleeve.sleeve?.dependencies?.sleeve_ids, "sleeve dependency", `sleeve:${sleeveId}`);
  resolveList(entries, libraryRoot, "neostack", sleeve.sleeve?.dependencies?.neostack_ids, "sleeve dependency", `sleeve:${sleeveId}`);
  resolveList(entries, libraryRoot, "overlay", sleeve.sleeve?.dependencies?.overlay_ids, "sleeve dependency", `sleeve:${sleeveId}`);
  resolveList(entries, libraryRoot, "schema", sleeve.sleeve?.dependencies?.schema_ids, "sleeve dependency", `sleeve:${sleeveId}`);
  resolveList(entries, libraryRoot, "bundle", sleeve.sleeve?.dependencies?.bundle_ids, "sleeve dependency", `sleeve:${sleeveId}`);
  resolveList(entries, libraryRoot, "capability", sleeve.sleeve?.dependencies?.capability_ids, "sleeve dependency", `sleeve:${sleeveId}`);
  resolveList(entries, libraryRoot, "toolpack", sleeve.sleeve?.dependencies?.toolpack_ids, "sleeve dependency", `sleeve:${sleeveId}`);
  resolveList(entries, libraryRoot, "neostack", sleeve.sleeve?.composition?.neostack_ids, "sleeve composition", `sleeve:${sleeveId}`);
  resolveList(entries, libraryRoot, "overlay", sleeve.sleeve?.composition?.overlay_ids, "governance overlay", `sleeve:${sleeveId}`);
  resolveList(entries, libraryRoot, "bundle", sleeve.sleeve?.composition?.bundle_ids, "sleeve composition", `sleeve:${sleeveId}`);
  resolveList(entries, libraryRoot, "neoblock", sleeve.sleeve?.composition?.neoblock_ids, "sleeve composition", `sleeve:${sleeveId}`);
  resolveList(entries, libraryRoot, "capability", sleeve.sleeve?.capabilities?.required, "capability declaration required", `sleeve:${sleeveId}`);
  resolveList(entries, libraryRoot, "capability", sleeve.sleeve?.capabilities?.optional, "capability declaration optional", `sleeve:${sleeveId}`);
  resolveNeoblocksFromLocalRefs(entries, libraryRoot, sleeve.sleeve?.composition?.local_refs);
  resolveNeoblocksFromNeostacks(entries, libraryRoot);

  const missing = entries.filter((entry) => entry.status === "missing");
  const invalid = entries.filter((entry) => entry.status === "invalid");

  if (missing.length > 0) {
    warnings.push(`${missing.length} referenced artifacts were not found under the provided library root`);
  }
  if (invalid.length > 0) {
    errors.push(`${invalid.length} artifact references were invalid or unreadable`);
  }

  return {
    ok: errors.length === 0,
    libraryRoot,
    entries,
    missing,
    warnings,
    errors
  };
}
