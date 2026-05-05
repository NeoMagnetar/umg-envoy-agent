import type { LoadedNeostackFile, NeostackValidationResult, NeostackArtifactResolutionResult } from "../types.js";
export declare function validateNeostackStructure(neostackFile: LoadedNeostackFile): NeostackValidationResult;
export declare function resolveNeostackArtifacts(libraryRoot: string, neostackFile: LoadedNeostackFile): NeostackArtifactResolutionResult;
