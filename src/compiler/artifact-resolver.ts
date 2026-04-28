import fs from "node:fs";
import path from "node:path";
import type {
  ArtifactResolutionEntry,
  ArtifactResolutionResult,
  LoadedSleeveFile
} from "../types.js";

function addEntry(entries: ArtifactResolutionEntry[], entry: ArtifactResolutionEntry) {
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
    default:
      return null;
  }
}

function resolveList(entries: ArtifactResolutionEntry[], libraryRoot: string, artifactType: ArtifactResolutionEntry["artifactType"], values: unknown) {
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
      exists,
      status: exists ? "resolved" : "missing"
    });
  }
}

export function resolveSleeveArtifacts(libraryRootInput: string, sleeve: LoadedSleeveFile): ArtifactResolutionResult {
  const libraryRoot = path.resolve(libraryRootInput);
  const entries: ArtifactResolutionEntry[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

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

  resolveList(entries, libraryRoot, "sleeve", sleeve.sleeve?.dependencies?.sleeve_ids);
  resolveList(entries, libraryRoot, "neostack", sleeve.sleeve?.dependencies?.neostack_ids);
  resolveList(entries, libraryRoot, "overlay", sleeve.sleeve?.dependencies?.overlay_ids);
  resolveList(entries, libraryRoot, "schema", sleeve.sleeve?.dependencies?.schema_ids);
  resolveList(entries, libraryRoot, "neostack", sleeve.sleeve?.composition?.neostack_ids);
  resolveList(entries, libraryRoot, "overlay", sleeve.sleeve?.composition?.overlay_ids);
  resolveList(entries, libraryRoot, "bundle", sleeve.sleeve?.dependencies?.bundle_ids);
  resolveList(entries, libraryRoot, "bundle", sleeve.sleeve?.composition?.bundle_ids);

  const missing = entries.filter((entry) => entry.status === "missing");
  const invalid = entries.filter((entry) => entry.status === "invalid");

  if (missing.length > 0) {
    warnings.push(`${missing.length} referenced artifacts were not found under the provided library root`);
  }
  if (invalid.length > 0) {
    errors.push(`${invalid.length} artifact references were invalid`);
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
