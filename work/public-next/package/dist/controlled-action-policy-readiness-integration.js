function requirementGate(required, ok, states) {
    if (!required)
        return states.notRequired;
    return ok ? states.ok : states.missing;
}
export function projectControlledActionPolicyToReadinessIntegration(input) {
    const rows = input.routes.map((route) => {
        const blockedReasons = new Set();
        const actionLike = route.routeClass === 'action_capable' || route.routeClass === 'bridge_action_candidate';
        if (!route.policy.present && actionLike)
            blockedReasons.add('blocked_policy_missing');
        if (route.policy.approvalRequired && (!route.state.approvalPresent || !route.state.approvalValid))
            blockedReasons.add('blocked_no_approval');
        if (route.policy.dryRunRequired && (!route.state.dryRunPresent || !route.state.dryRunValid))
            blockedReasons.add('blocked_dry_run_required');
        if (route.policy.allowlistRequired && !route.state.allowlistSatisfied)
            blockedReasons.add('blocked_no_allowlist');
        if (route.policy.scopeValidationRequired && !route.state.scopeValid)
            blockedReasons.add('blocked_scope_invalid');
        if (route.policy.backupRequired && !route.state.backupSatisfied)
            blockedReasons.add('blocked_backup_required');
        if (route.policy.rollbackRequired && !route.state.rollbackSatisfied)
            blockedReasons.add('blocked_rollback_required');
        if (route.policy.bridgeImplementationRequired && !route.state.bridgeImplemented)
            blockedReasons.add('blocked_bridge_not_implemented');
        if (route.policy.writeActionsRequired && !route.state.writeActionsEnabled)
            blockedReasons.add('blocked_write_actions_disabled');
        if (route.policy.directSourceRequired && !route.state.directSourceEnabled)
            blockedReasons.add('blocked_direct_source_disabled');
        if (route.policy.automaticResponseTakeoverRequired && !route.state.automaticResponseTakeoverEnabled)
            blockedReasons.add('blocked_automatic_takeover_disabled');
        const readinessGates = {
            policy: route.policy.present ? 'present' : 'missing',
            approval: route.policy.approvalRequired
                ? (!route.state.approvalPresent ? 'missing' : route.state.approvalValid ? 'satisfied' : 'invalid')
                : 'not_required',
            checkpoint: route.policy.approvalRequired
                ? (!route.state.checkpointPresent ? 'missing' : route.state.checkpointValid ? 'satisfied' : 'invalid')
                : 'not_required',
            decisionSimulation: route.policy.approvalRequired ? (route.state.decisionSimulationPresent ? 'present' : 'missing') : 'not_required',
            dryRun: route.policy.dryRunRequired
                ? (!route.state.dryRunPresent ? 'missing' : route.state.dryRunValid ? 'satisfied' : 'invalid')
                : 'not_required',
            allowlist: requirementGate(route.policy.allowlistRequired, route.state.allowlistSatisfied, { ok: 'satisfied', missing: 'missing', notRequired: 'not_required' }),
            scope: route.policy.scopeValidationRequired ? (route.state.scopeValid ? 'valid' : 'invalid') : 'not_required',
            backup: requirementGate(route.policy.backupRequired, route.state.backupSatisfied, { ok: 'satisfied', missing: 'required_missing', notRequired: 'not_required' }),
            rollback: requirementGate(route.policy.rollbackRequired, route.state.rollbackSatisfied, { ok: 'satisfied', missing: 'required_missing', notRequired: 'not_required' }),
            bridgeImplementation: requirementGate(route.policy.bridgeImplementationRequired, route.state.bridgeImplemented, { ok: 'available', missing: 'missing', notRequired: 'not_required' }),
            writeActions: route.policy.writeActionsRequired ? (route.state.writeActionsEnabled ? 'enabled' : 'disabled') : 'not_required',
            directSource: route.policy.directSourceRequired ? (route.state.directSourceEnabled ? 'enabled' : 'disabled') : 'not_required',
            automaticResponseTakeover: route.policy.automaticResponseTakeoverRequired ? (route.state.automaticResponseTakeoverEnabled ? 'enabled' : 'disabled') : 'not_required',
        };
        const missingRequirements = [];
        const satisfiedRequirements = [];
        Object.entries(readinessGates).forEach(([key, value]) => {
            if (['missing', 'invalid', 'required_missing', 'disabled'].includes(value))
                missingRequirements.push(key);
            if (['present', 'satisfied', 'valid', 'available', 'enabled'].includes(value))
                satisfiedRequirements.push(key);
        });
        let readinessStatus = 'blocked';
        let executionEligibility = 'ineligible';
        const onlyAuthorityBoundaries = Array.from(blockedReasons).every((reason) => [
            'blocked_write_actions_disabled',
            'blocked_direct_source_disabled',
            'blocked_automatic_takeover_disabled',
        ].includes(reason));
        if (route.routeClass === 'metadata_only') {
            readinessStatus = 'metadata_only';
            executionEligibility = 'ineligible';
        }
        else if (!route.policy.present && actionLike) {
            readinessStatus = 'policy_missing';
            executionEligibility = 'ineligible';
        }
        else if (blockedReasons.size === 0) {
            readinessStatus = 'future_action_capable';
            executionEligibility = 'future_only';
        }
        else if (onlyAuthorityBoundaries) {
            readinessStatus = 'execution_ready_future_only';
            executionEligibility = 'eligible_after_future_execution_lane';
        }
        else {
            readinessStatus = 'blocked';
            executionEligibility = route.policy.present ? 'future_only' : 'ineligible';
        }
        return {
            routeId: route.routeId,
            linkedActionId: route.linkedActionId,
            linkedPolicyId: route.linkedPolicyId,
            linkedApprovalId: route.linkedApprovalId,
            linkedCheckpointId: route.linkedCheckpointId,
            linkedDecisionSimulationId: route.linkedDecisionSimulationId,
            linkedDryRunId: route.linkedDryRunId,
            linkedBlockedRouteSummaryId: route.linkedBlockedRouteSummaryId,
            linkedReadinessMatrixId: route.linkedReadinessMatrixId,
            routeClass: route.routeClass,
            riskLevel: route.riskLevel,
            policyPresent: route.policy.present,
            policyRequirements: route.policy,
            readinessGates,
            blockedReasons: Array.from(blockedReasons),
            missingRequirements,
            satisfiedRequirements,
            readinessStatus,
            executionEligibility,
            executionPerformed: false,
            policyDoesNotEqualExecution: true,
            approvalDoesNotEqualExecution: true,
            checkpointDoesNotEqualExecution: true,
            dryRunDoesNotEqualExecution: true,
            decisionSimulationOnly: true,
            readinessDoesNotEqualExecution: true,
        };
    });
    return {
        integrationId: input.integrationId,
        generatedAt: input.generatedAt,
        policyToReadinessIntegrationOnly: true,
        executionPerformed: false,
        policyDoesNotEqualExecution: true,
        readinessDoesNotEqualExecution: true,
        rows,
        summary: {
            totalRoutes: rows.length,
            policyPresentRoutes: rows.filter((row) => row.policyPresent).length,
            policyMissingRoutes: rows.filter((row) => !row.policyPresent).length,
            blockedRoutes: rows.filter((row) => row.readinessStatus === 'blocked').length,
            futureActionCapableRoutes: rows.filter((row) => row.readinessStatus === 'future_action_capable').length,
            executionReadyFutureOnlyRoutes: rows.filter((row) => row.readinessStatus === 'execution_ready_future_only').length,
            executionPerformedCount: 0,
        },
    };
}
