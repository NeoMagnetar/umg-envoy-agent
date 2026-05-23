import { projectControlledActionGatePolicy } from './action-gate-policy-projection.js';
import { projectApprovalFlowState } from './action-gate-approval-flow-projection.js';
import { projectApprovalCheckpointState } from './action-gate-approval-checkpoint-projection.js';
import { simulateApprovalDecision } from './action-gate-approval-decision-simulation.js';
import { projectControlledActionDryRun } from './controlled-action-dry-run-projection.js';
export function projectControlledActionBlockedRouteSummary() {
    const policy = projectControlledActionGatePolicy();
    const approval = projectApprovalFlowState();
    const checkpoint = projectApprovalCheckpointState();
    const decisionSimulation = simulateApprovalDecision('approve');
    const dryRun = projectControlledActionDryRun();
    const routes = policy.routes.map((route) => {
        const linkedApprovalId = route.approvalRequired ? approval.approvalId : null;
        const linkedCheckpointId = route.approvalRequired ? checkpoint.checkpointId : null;
        const linkedDecisionSimulationId = route.approvalRequired ? `simulation.${route.actionId}.approve` : null;
        const linkedDryRunId = route.dryRunRequired || route.allowedExecutionMode === 'preview_only' ? dryRun.dryRunId : null;
        const blockedReasons = new Set();
        if (!route.routeVisibleAsMetadata)
            blockedReasons.add('blocked_policy');
        if (route.approvalRequired)
            blockedReasons.add('blocked_no_approval');
        if (route.allowlistRequired)
            blockedReasons.add('blocked_no_allowlist');
        if (!route.enabledNow)
            blockedReasons.add('blocked_write_actions_disabled');
        if (route.dryRunRequired)
            blockedReasons.add('blocked_dry_run_required');
        if (route.allowedExecutionMode === 'preview_only')
            blockedReasons.add('blocked_preview_required');
        if (route.backupRequired)
            blockedReasons.add('blocked_backup_required');
        if (route.backupRequired)
            blockedReasons.add('blocked_rollback_required');
        if (!policy.bridgePolicies.desktopBridge.enabledNow && route.scopeTarget.startsWith('desktop.'))
            blockedReasons.add('blocked_bridge_not_implemented');
        if (!policy.bridgePolicies.phaseBridge.enabledNow && route.scopeTarget.startsWith('phasebridge.'))
            blockedReasons.add('blocked_bridge_not_implemented');
        blockedReasons.add('blocked_direct_source_disabled');
        blockedReasons.add('blocked_automatic_takeover_disabled');
        if (!route.scopeKind || !route.scopeTarget)
            blockedReasons.add('blocked_scope_invalid');
        if (route.allowedExecutionMode === 'forbidden')
            blockedReasons.add('metadata_only');
        let routeStatus = 'execution_ineligible';
        if (route.allowedExecutionMode === 'forbidden') {
            routeStatus = 'metadata_only';
        }
        else if (blockedReasons.has('blocked_bridge_not_implemented')) {
            routeStatus = 'blocked_bridge_not_implemented';
        }
        else if (blockedReasons.has('blocked_preview_required')) {
            routeStatus = 'blocked_preview_required';
        }
        else if (blockedReasons.has('blocked_dry_run_required')) {
            routeStatus = 'blocked_dry_run_required';
        }
        else if (blockedReasons.has('blocked_no_approval')) {
            routeStatus = 'blocked_no_approval';
        }
        else if (blockedReasons.has('blocked_no_allowlist')) {
            routeStatus = 'blocked_no_allowlist';
        }
        else if (blockedReasons.has('blocked_write_actions_disabled')) {
            routeStatus = 'future_action_capable';
        }
        const scopeBounded = route.scopeKind !== 'metadata_only';
        return {
            packageVersion: policy.packageVersion,
            blockedRouteSummaryId: `blocked-route-summary.${route.actionId}`,
            routeId: route.scopeTarget,
            linkedActionId: route.actionId,
            linkedPolicyId: policy.gateId,
            linkedApprovalId,
            linkedCheckpointId,
            linkedDecisionSimulationId,
            linkedDryRunId,
            routeClass: route.actionClass,
            riskLevel: route.riskLevel,
            routeStatus,
            blockedReasons: Array.from(blockedReasons),
            requiredApprovalState: route.approvalRequired ? approval.approvalState : 'not_required',
            requiredDryRunState: route.dryRunRequired || route.allowedExecutionMode === 'preview_only' ? dryRun.dryRunState : 'not_required',
            requiredAllowlistState: route.allowlistRequired ? 'allowlist_required_not_granted' : 'not_required',
            requiredScopeValidation: {
                scopeKind: route.scopeKind,
                scopeTarget: route.scopeTarget,
                scopeBounded,
                validNow: scopeBounded,
            },
            requiredBackupState: route.backupRequired ? 'backup_required_not_prepared' : 'not_required',
            requiredRollbackState: route.backupRequired ? dryRun.rollbackPreview.reversibility : 'not_required',
            bridgeImplementationStatus: blockedReasons.has('blocked_bridge_not_implemented') ? 'not_implemented' : 'not_required',
            directSourceStatus: 'disabled',
            automaticResponseTakeoverStatus: 'disabled',
            executionEligibility: {
                executionEligible: false,
                executionBlocked: true,
                reason: blockedReasons.has('blocked_bridge_not_implemented')
                    ? 'Route remains metadata-visible but bridge implementation is not enabled in this build.'
                    : route.approvalRequired
                        ? checkpoint.executionEligibility.reason
                        : dryRun.executionEligibilityAfterDryRun.reason,
            },
            executionPerformed: false,
            blockedRouteSummaryOnly: true,
            approvalDoesNotEqualExecution: route.approvalRequired ? approval.approvalDoesNotEqualExecution : true,
            checkpointDoesNotEqualExecution: route.approvalRequired ? checkpoint.checkpointDoesNotEqualExecution : true,
            dryRunDoesNotEqualExecution: linkedDryRunId !== null ? dryRun.dryRunDoesNotEqualExecution : true,
            decisionSimulationOnly: route.approvalRequired ? decisionSimulation.decisionSimulationOnly : true,
        };
    });
    return {
        packageVersion: policy.packageVersion,
        blockedRouteSummaryVersion: 'umg.controlled_action_blocked_route_summary.v1',
        sourcePolicyId: policy.gateId,
        routeCount: routes.length,
        blockedCount: routes.filter((route) => route.executionEligibility.executionBlocked).length,
        futureActionCapableCount: routes.filter((route) => route.routeStatus === 'future_action_capable').length,
        metadataOnlyCount: routes.filter((route) => route.routeStatus === 'metadata_only').length,
        executionEnabled: false,
        routes,
        summary: {
            directSourceStatus: 'disabled',
            automaticResponseTakeoverStatus: 'disabled',
            bridgeImplementationStatus: 'not_implemented',
            approvalRequiredVisibleAsMetadata: policy.metadataVisibility.approvalNeededVisibleAsMetadata,
            dryRunVisibleAsMetadata: true,
            blockedRoutesVisibleAsMetadata: policy.metadataVisibility.blockedRoutesVisibleAsMetadata,
        },
    };
}
