export interface ActionGatePolicyProjection {
    packageVersion: string;
    gateId: string;
    gateVersion: string;
    executionAuthorityExpanded: boolean;
    summary: {
        actionRouteCount: number;
        blockedCategoryCount: number;
        approvalRequiredCount: number;
        previewOnlyCount: number;
        forbiddenCount: number;
    };
    bridgePolicies: {
        desktopBridge: {
            enabledNow: boolean;
            futureActionFamilies: string[];
        };
        phaseBridge: {
            enabledNow: boolean;
            futureActionFamilies: string[];
        };
    };
    routes: Array<{
        actionId: string;
        actionClass: string;
        riskLevel: string;
        allowedExecutionMode: string;
        approvalRequired: boolean;
        allowlistRequired: boolean;
        scopeKind: string;
        scopeTarget: string;
        dryRunRequired: boolean;
        backupRequired: boolean;
        auditRequired: boolean;
        enabledNow: boolean;
        routeVisibleAsMetadata: boolean;
        blockedCategories: string[];
    }>;
    metadataVisibility: {
        blockedRoutesVisibleAsMetadata: boolean;
        approvalNeededVisibleAsMetadata: boolean;
        riskSummariesVisibleAsMetadata: boolean;
        executionEnabled: boolean;
    };
}
export declare function projectControlledActionGatePolicy(): ActionGatePolicyProjection;
