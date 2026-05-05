import type { NeostackLoadRequest, NeostackLoadResult } from "../types.js";
export declare function neostackPathFromId(libraryRoot: string, neostackId: string): string;
export declare function loadNeostackFile(request: NeostackLoadRequest): NeostackLoadResult;
