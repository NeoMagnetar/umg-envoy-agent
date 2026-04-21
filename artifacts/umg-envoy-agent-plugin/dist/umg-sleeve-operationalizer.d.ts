import type { UMGPathDocument } from "./umg-path-types.js";
import type { ResolvedPaths } from "./types.js";
export interface SleeveOperationalProfile {
    id: string;
    preferredStacks?: string[];
    preferredBlocks?: string[];
    preferredMolts?: string[];
    winner?: string;
    fallbackToSharedModulation?: boolean;
}
export interface SleeveOperationalProfilesFile {
    version?: string;
    profiles: SleeveOperationalProfile[];
}
export interface OperationalizeSleeveRouteParams {
    inputText: string;
    sleeveId?: string;
    fallbackDoc: UMGPathDocument;
    profiles: SleeveOperationalProfilesFile;
}
export interface OperationalizeSleeveRouteResult {
    doc: UMGPathDocument;
    profileId: string | null;
}
export declare function loadSleeveOperationalProfiles(paths: ResolvedPaths): SleeveOperationalProfilesFile;
export declare function operationalizeSleeveRoute(params: OperationalizeSleeveRouteParams): OperationalizeSleeveRouteResult;
