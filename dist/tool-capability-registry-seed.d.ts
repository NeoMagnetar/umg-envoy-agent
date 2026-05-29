import { type ToolCapabilityRegistry, type ToolCapabilityRegistryEntry } from "./action-gate-types.js";
export declare const ENVOY_TOOL_CAPABILITY_REGISTRY_SEED: ToolCapabilityRegistryEntry[];
export declare function createEnvoyToolCapabilityRegistrySeed(): ToolCapabilityRegistry;
export declare function resolveEnvoySeededToolCapability(toolId: string): ToolCapabilityRegistryEntry | null;
