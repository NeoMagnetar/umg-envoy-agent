export interface PluginConfig {
    workspaceRoot?: string;
    compilerRoot?: string;
    resleeverRoot?: string;
    allowRuntimeWrites?: boolean;
    defaultSleeveId?: string;
    debugDirectReplyBehavior?: boolean;
    runtimeLegendAlignmentPath?: string;
}
export interface ResolvedPaths {
    pluginRoot: string;
    workspaceRoot: string;
    doctrineAnchor: string;
    compilerRoot: string;
    compilerV0Root: string;
    compilerCli: string;
    compilerPackageJson: string;
    resleeverRoot: string;
    resleeverSleevesDir: string;
    resleeverBlocksDir: string;
    resleeverRuntimeDir: string;
    resleeverCompilerDir: string;
    activeSleevePath: string;
    activeStackPath: string;
    sleeveCatalogPath: string;
    blockCategoryIndexPath: string;
    blockLibraryIndexPath: string;
    resolverRulesPath: string;
    runtimeLegendAlignmentPath: string;
}
