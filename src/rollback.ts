import fs from "node:fs";
import path from "node:path";
import type { PluginConfig, ResolvedPaths } from "./types.js";

function getBackupMetadataPath(backupDir: string): string {
  return path.join(backupDir, "backup-metadata.json");
}

export function listRuntimeBackups(paths: ResolvedPaths): Array<{
  backupDir: string;
  backupMetadataPath: string;
  hasMetadata: boolean;
}> {
  const backupsRoot = path.join(paths.resleeverRuntimeDir, "backups");

  if (!fs.existsSync(backupsRoot)) {
    return [];
  }

  return fs
    .readdirSync(backupsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const backupDir = path.join(backupsRoot, entry.name);
      const backupMetadataPath = getBackupMetadataPath(backupDir);
      return {
        backupDir,
        backupMetadataPath,
        hasMetadata: fs.existsSync(backupMetadataPath)
      };
    })
    .sort((a, b) => b.backupDir.localeCompare(a.backupDir));
}

export function rollbackRuntimeFromBackup(
  paths: ResolvedPaths,
  config: PluginConfig,
  backupDir: string
): {
  restoredAt: string;
  backupDir: string;
  restoredActiveSleevePath: string;
  restoredActiveStackPath: string;
} {
  if (!config.allowRuntimeWrites) {
    throw new Error(
      "Runtime writes are disabled. Enable allowRuntimeWrites in plugin config before using rollback operations."
    );
  }

  const backupSleevePath = path.join(backupDir, "active-sleeve.json");
  const backupStackPath = path.join(backupDir, "active-stack.json");

  if (!fs.existsSync(backupSleevePath) || !fs.existsSync(backupStackPath)) {
    throw new Error(
      `Backup directory is missing active runtime files: ${backupDir}`
    );
  }

  fs.copyFileSync(backupSleevePath, paths.activeSleevePath);
  fs.copyFileSync(backupStackPath, paths.activeStackPath);

  const restoredAt = new Date().toISOString();
  const rollbackRecord = {
    restoredAt,
    restoredFromBackupDir: backupDir,
    restoredBy: "umg-envoy-agent-plugin"
  };

  fs.writeFileSync(
    path.join(backupDir, "rollback-record.json"),
    JSON.stringify(rollbackRecord, null, 2) + "\n",
    "utf8"
  );

  return {
    restoredAt,
    backupDir,
    restoredActiveSleevePath: paths.activeSleevePath,
    restoredActiveStackPath: paths.activeStackPath
  };
}
