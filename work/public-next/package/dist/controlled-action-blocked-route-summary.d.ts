export type BlockedRouteStatus = 'blocked_policy' | 'blocked_no_approval' | 'blocked_no_allowlist' | 'blocked_scope_invalid' | 'blocked_preview_required' | 'blocked_dry_run_required' | 'blocked_backup_required' | 'blocked_rollback_required' | 'blocked_bridge_not_implemented' | 'blocked_write_actions_disabled' | 'blocked_direct_source_disabled' | 'blocked_automatic_takeover_disabled' | 'metadata_only' | 'future_action_capable' | 'execution_ineligible';
export interface ControlledActionBlockedRouteSummary {
    packageVersion: string;
    blockedRouteSummaryId: string;
    routeId: string;
    linkedActionId: string;
    linkedPolicyId: string;
    linkedApprovalId: string | null;
    linkedCheckpointId: string | null;
    linkedDecisionSimulationId: string | null;
    linkedDryRunId: string | null;
    routeClass: string;
    riskLevel: string;
    routeStatus: BlockedRouteStatus;
    blockedReasons: string[];
    requiredApprovalState: string;
    requiredDryRunState: string;
    requiredAllowlistState: string;
    requiredScopeValidation: {
        scopeKind: string;
        scopeTarget: string;
        scopeBounded: boolean;
        validNow: boolean;
    };
    requiredBackupState: string;
    requiredRollbackState: string;
    bridgeImplementationStatus: string;
    directSourceStatus: string;
    automaticResponseTakeoverStatus: string;
    executionEligibility: {
        executionEligible: boolean;
        executionBlocked: boolean;
        reason: string;
    };
    executionPerformed: boolean;
    blockedRouteSummaryOnly: boolean;
    approvalDoesNotEqualExecution: boolean;
    checkpointDoesNotEqualExecution: boolean;
    dryRunDoesNotEqualExecution: boolean;
    decisionSimulationOnly: boolean;
}
export interface ControlledActionBlockedRouteSummaryProjection {
    packageVersion: string;
    blockedRouteSummaryVersion: 'umg.controlled_action_blocked_route_summary.v1';
    sourcePolicyId: string;
    routeCount: number;
    blockedCount: number;
    futureActionCapableCount: number;
    metadataOnlyCount: number;
    executionEnabled: false;
    routes: ControlledActionBlockedRouteSummary[];
    summary: {
        directSourceStatus: 'disabled';
        automaticResponseTakeoverStatus: 'disabled';
        bridgeImplementationStatus: 'not_implemented';
        approvalRequiredVisibleAsMetadata: boolean;
        dryRunVisibleAsMetadata: boolean;
        blockedRoutesVisibleAsMetadata: boolean;
    };
}
export declare function projectControlledActionBlockedRouteSummary(): ControlledActionBlockedRouteSummaryProjection;
