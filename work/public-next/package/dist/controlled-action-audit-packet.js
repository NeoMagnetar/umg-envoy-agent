export function projectControlledActionAuditPacket(input) {
    const routes = input.routes.map((route) => {
        const evidence = {
            policy: route.policySummary.policyPresent ? 'present' : 'missing',
            approval: !route.approvalSummary.approvalPresent
                ? 'missing'
                : route.approvalSummary.approvalValid ? 'present_valid' : 'present_invalid',
            checkpoint: !route.approvalSummary.checkpointPresent
                ? 'missing'
                : route.approvalSummary.checkpointValid ? 'present_valid' : 'present_invalid',
            decisionSimulation: route.approvalSummary.decisionSimulationPresent ? 'present' : 'missing',
            dryRun: !route.dryRunSummary.dryRunPresent
                ? 'missing'
                : route.dryRunSummary.dryRunValid ? 'present_valid' : 'present_invalid',
            blockedRouteSummary: route.linkedBlockedRouteSummaryId ? 'present' : 'missing',
            readinessMatrix: route.linkedReadinessMatrixId ? 'present' : 'missing',
            policyToReadinessIntegration: route.linkedPolicyToReadinessIntegrationId ? 'present' : 'missing',
            policyTraceReport: route.linkedPolicyTraceReportId ? 'present' : 'missing',
        };
        let auditStatus = 'audit_incomplete';
        const coreEvidencePresent = evidence.blockedRouteSummary === 'present' && evidence.readinessMatrix === 'present' && evidence.policyToReadinessIntegration === 'present' && evidence.policyTraceReport === 'present' && evidence.policy === 'present';
        if (route.routeClass === 'metadata_only') {
            auditStatus = 'metadata_only';
        }
        else if (!coreEvidencePresent) {
            auditStatus = 'audit_incomplete';
        }
        else if (route.readinessSummary.readinessStatus === 'execution_ready_future_only') {
            auditStatus = 'audit_ready_execution_future_only';
        }
        else if (route.blockedRouteSummary.blockedReasons.length > 0) {
            auditStatus = 'audit_ready_blocked';
        }
        else if (route.readinessSummary.readinessStatus === 'future_action_capable') {
            auditStatus = 'audit_ready_future_action_capable';
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
            linkedPolicyTraceReportId: route.linkedPolicyTraceReportId,
            routeClass: route.routeClass,
            riskLevel: route.riskLevel,
            auditStatus,
            evidence,
            blockedReasons: route.blockedRouteSummary.blockedReasons,
            missingRequirements: route.blockedRouteSummary.missingRequirements,
            satisfiedRequirements: route.blockedRouteSummary.satisfiedRequirements,
            traceEntryCount: route.traceSummary.traceEntryCount,
            traceStages: route.traceSummary.traceStages,
            hardBoundaryCount: route.traceSummary.hardBoundaryCount,
            executionPerformed: false,
            policyDoesNotEqualExecution: true,
            approvalDoesNotEqualExecution: true,
            checkpointDoesNotEqualExecution: true,
            dryRunDoesNotEqualExecution: true,
            decisionSimulationOnly: true,
            readinessDoesNotEqualExecution: true,
            traceReportDoesNotEqualExecution: true,
            auditPacketDoesNotEqualExecution: true,
        };
    });
    return {
        packetId: input.packetId,
        generatedAt: input.generatedAt,
        runtimeVersion: input.runtimeVersion,
        packageVersion: input.packageVersion,
        auditPacketOnly: true,
        executionPerformed: false,
        routes,
        summary: {
            totalRoutes: routes.length,
            metadataOnlyRoutes: routes.filter((route) => route.auditStatus === 'metadata_only').length,
            blockedRoutes: routes.filter((route) => route.auditStatus === 'audit_ready_blocked').length,
            futureActionCapableRoutes: routes.filter((route) => route.auditStatus === 'audit_ready_future_action_capable').length,
            executionFutureOnlyRoutes: routes.filter((route) => route.auditStatus === 'audit_ready_execution_future_only').length,
            auditIncompleteRoutes: routes.filter((route) => route.auditStatus === 'audit_incomplete').length,
            totalBlockedReasons: routes.reduce((sum, route) => sum + route.blockedReasons.length, 0),
            totalMissingRequirements: routes.reduce((sum, route) => sum + route.missingRequirements.length, 0),
            totalSatisfiedRequirements: routes.reduce((sum, route) => sum + route.satisfiedRequirements.length, 0),
            totalTraceEntries: routes.reduce((sum, route) => sum + route.traceEntryCount, 0),
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
            auditPacketDoesNotEqualExecution: true,
        },
    };
}
