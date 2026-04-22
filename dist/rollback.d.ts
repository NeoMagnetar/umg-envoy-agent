import type { PluginConfig, ResolvedPaths } from "./types.js";
export declare function listRuntimeBackups(paths: ResolvedPaths): Array<{
    backupDir: string;
    backupMetadataPath: string;
    hasMetadata: boolean;
}>;
export declare function rollbackRuntimeFromBackup(paths: ResolvedPaths, config: PluginConfig, backupDir: string): {
    restoredAt: string;
    backupDir: string;
    restoredActiveSleevePath: string;
    restoredActiveStackPath: string;
};
