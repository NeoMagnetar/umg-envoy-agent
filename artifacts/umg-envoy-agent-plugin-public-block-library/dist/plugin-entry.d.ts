import type { PluginConfig } from "./types.js";
declare const entry: {
    id: string;
    name: string;
    description: string;
    register(api: {
        registerTool: (definition: any, options?: {
            optional?: boolean;
        }) => void;
        registerCli?: (register: any, options?: {
            commands?: string[];
        }) => void;
    }, config?: PluginConfig): void;
};
export default entry;
