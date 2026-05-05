import fs from "node:fs";
import path from "node:path";
function defaultConfig() {
    return {
        umg_block_library: {
            version: "0.1.0",
            mode: "auto",
            visibility_mode: "developer",
            sources: [
                {
                    name: "packaged_samples",
                    kind: "local",
                    path: "./public-content/blocks",
                    priority: 10,
                    required: true,
                    canonical: false
                },
                {
                    name: "full_umg_block_library",
                    kind: "local",
                    path: "C:/.openclaw/workspace/UMG-Block-Library",
                    priority: 100,
                    required: false,
                    canonical: true
                }
            ],
            indexes: {
                enabled: true,
                output_dir: "C:/.openclaw/umg/index",
                refresh_on_start: false,
                allow_stale: true
            }
        }
    };
}
export function loadBlockLibraryConfig(configPath) {
    const candidates = [
        configPath,
        process.env.UMG_BLOCK_LIBRARY_CONFIG,
        path.resolve(process.cwd(), "block-library.config.json"),
        "C:/.openclaw/umg/block-library.config.json"
    ].filter((value) => Boolean(value));
    for (const candidate of candidates) {
        if (!fs.existsSync(candidate))
            continue;
        return JSON.parse(fs.readFileSync(candidate, "utf8"));
    }
    return defaultConfig();
}
