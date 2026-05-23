function makeTrace(routeId, index, entry) {
    return { traceId: `${routeId}.trace.${index + 1}`, ...entry };
}
export function projectControlledActionPolicyTraceReport(input) {
    const rows = input.routes.map((route) => {
        const traceEntries = [];
        let idx = 0;
        for (const [key, value] of Object.entries(route.policyRequirements)) {
            traceEntries.push(makeTrace(route.routeId, idx++, {
                stage: 'policy_requirement',
                sourceField: `policyRequirements.${key}`,
                sourceValue: value,
                targetField: `readinessResult.readinessGates.${key.replace('Required', '').replace('Present', '').replace('Validation', '')}`,
                targetValue: route.readinessResult.readinessGates[key.replace('Required', '').replace('Validation', '').replace('Present', '').replace(/^policy$/, 'policy')] ?? null,
                result: value ? 'future_only' : 'not_required',
                message: `Policy requirement ${key} evaluated as ${String(value)}.`,
            }));
        }
        for (const [key, value] of Object.entries(route.routeState)) {
            traceEntries.push(makeTrace(route.routeId, idx++, {
                stage: 'route_state_check',
                sourceField: `routeState.${key}`,
                sourceValue: value,
                targetField: `readinessResult.readinessGates.${key}`,
                targetValue: null,
                result: value === false ? 'missing' : 'satisfied',
                message: `Route state ${key} checked as ${String(value)}.`,
            }));
        }
        for (const [key, value] of Object.entries(route.readinessResult.readinessGates)) {
            traceEntries.push(makeTrace(route.routeId, idx++, {
                stage: 'readiness_gate',
                sourceField: `readinessResult.readinessGates.${key}`,
                sourceValue: value,
                targetField: 'readinessResult.readinessStatus',
                targetValue: route.readinessResult.readinessStatus,
                result: route.readinessResult.readinessStatus === 'metadata_only'
                    ? 'metadata_only'
                    : value === 'missing'
                        ? 'missing'
                        : value === 'invalid'
                            ? 'invalid'
                            : value === 'not_required'
                                ? 'not_required'
                                : route.readinessResult.executionEligibility === 'eligible_after_future_execution_lane'
                                    ? 'future_only'
                                    : 'satisfied',
                message: route.readinessResult.readinessStatus === 'metadata_only'
                    ? `Readiness gate ${key} participates in metadata_only reporting.`
                    : `Readiness gate ${key} resolved to ${String(value)}.`,
            }));
        }
        for (const reason of route.readinessResult.blockedReasons) {
            traceEntries.push(makeTrace(route.routeId, idx++, {
                stage: 'blocked_reason',
                sourceField: 'readinessResult.blockedReasons',
                sourceValue: reason,
                targetField: 'readinessResult.readinessStatus',
                targetValue: route.readinessResult.readinessStatus,
                result: route.routeClass === 'metadata_only' ? 'metadata_only' : route.readinessResult.executionEligibility === 'eligible_after_future_execution_lane' ? 'future_only' : 'blocked',
                message: `Blocked reason emitted: ${reason}.`,
            }));
        }
        for (const requirement of route.readinessResult.missingRequirements) {
            traceEntries.push(makeTrace(route.routeId, idx++, {
                stage: 'missing_requirement',
                sourceField: 'readinessResult.missingRequirements',
                sourceValue: requirement,
                targetField: `readinessResult.readinessGates.${requirement}`,
                targetValue: route.readinessResult.readinessGates[requirement] ?? null,
                result: 'missing',
                message: `Missing requirement recorded for ${requirement}.`,
            }));
        }
        for (const requirement of route.readinessResult.satisfiedRequirements) {
            traceEntries.push(makeTrace(route.routeId, idx++, {
                stage: 'satisfied_requirement',
                sourceField: 'readinessResult.satisfiedRequirements',
                sourceValue: requirement,
                targetField: `readinessResult.readinessGates.${requirement}`,
                targetValue: route.readinessResult.readinessGates[requirement] ?? null,
                result: 'satisfied',
                message: `Satisfied requirement recorded for ${requirement}.`,
            }));
        }
        for (const [name, value] of Object.entries({
            policyDoesNotEqualExecution: true,
            approvalDoesNotEqualExecution: true,
            checkpointDoesNotEqualExecution: true,
            dryRunDoesNotEqualExecution: true,
            decisionSimulationOnly: true,
            readinessDoesNotEqualExecution: true,
            traceReportDoesNotEqualExecution: true,
            executionPerformed: false,
        })) {
            traceEntries.push(makeTrace(route.routeId, idx++, {
                stage: 'hard_boundary',
                sourceField: name,
                sourceValue: value,
                targetField: name,
                targetValue: value,
                result: name === 'executionPerformed' ? 'boundary_disabled' : 'boundary_disabled',
                message: `Hard boundary ${name} remains ${String(value)}.`,
            }));
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
            linkedPolicyToReadinessIntegrationId: route.linkedPolicyToReadinessIntegrationId,
            routeClass: route.routeClass,
            riskLevel: route.riskLevel,
            readinessStatus: route.readinessResult.readinessStatus,
            executionEligibility: route.readinessResult.executionEligibility,
            traceEntries,
            blockedReasons: route.readinessResult.blockedReasons,
            missingRequirements: route.readinessResult.missingRequirements,
            satisfiedRequirements: route.readinessResult.satisfiedRequirements,
            executionPerformed: false,
            policyDoesNotEqualExecution: true,
            approvalDoesNotEqualExecution: true,
            checkpointDoesNotEqualExecution: true,
            dryRunDoesNotEqualExecution: true,
            decisionSimulationOnly: true,
            readinessDoesNotEqualExecution: true,
            traceReportDoesNotEqualExecution: true,
        };
    });
    return {
        reportId: input.reportId,
        generatedAt: input.generatedAt,
        policyTraceReportOnly: true,
        executionPerformed: false,
        rows,
        summary: {
            totalRoutes: rows.length,
            policyPresentRoutes: input.routes.filter((route) => route.policyRequirements.policyPresent).length,
            policyMissingRoutes: input.routes.filter((route) => !route.policyRequirements.policyPresent).length,
            blockedRoutes: rows.filter((row) => row.readinessStatus === 'blocked').length,
            metadataOnlyRoutes: rows.filter((row) => row.readinessStatus === 'metadata_only').length,
            futureActionCapableRoutes: rows.filter((row) => row.readinessStatus === 'future_action_capable').length,
            executionReadyFutureOnlyRoutes: rows.filter((row) => row.readinessStatus === 'execution_ready_future_only').length,
            totalTraceEntries: rows.reduce((sum, row) => sum + row.traceEntries.length, 0),
            executionPerformedCount: 0,
        },
        hardBoundaries: {
            policyDoesNotEqualExecution: true,
            approvalDoesNotEqualExecution: true,
            checkpointDoesNotEqualExecution: true,
            dryRunDoesNotEqualExecution: true,
            decisionSimulationOnly: true,
            readinessDoesNotEqualExecution: true,
            traceReportDoesNotEqualExecution: true,
        },
    };
}
