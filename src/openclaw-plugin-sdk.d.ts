declare module "openclaw/plugin-sdk/plugin-entry" {
  export interface PluginRegisterApi {
    registerTool(definition: any, options?: { optional?: boolean }): void;
    registerHook?(hookName: string | string[], handler: any, options?: { priority?: number; name?: string; description?: string }): void;
    on?(eventName: string, handler: any): void;
  }

  export function definePluginEntry<TConfig = unknown>(entry: {
    id: string;
    name: string;
    description?: string;
    register(api: PluginRegisterApi, config?: TConfig): void;
  }): any;
}
