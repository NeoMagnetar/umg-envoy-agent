export function projectControlledActionAuditPacketReviewBundle(input) {
    const attentionItems = [];
    if (input.sourceExport.redactionApplied) {
        attentionItems.push({
            itemId: `${input.reviewBundleId}.redaction`,
            severity: 'notice',
            category: 'redaction',
            message: 'Source export contains redacted fields; reviewer should account for reduced detail.',
        });
    }
    const routeReviewCards = input.sourceExport.routes.map((route, index) => {
        let reviewStatus = 'review_attention_required';
        const reviewerFocus = [];
        if (route.routeClass === 'metadata_only' || route.auditStatus === 'metadata_only') {
            reviewStatus = 'metadata_only';
            reviewerFocus.push('confirm metadata-only route remains non-actionable');
            attentionItems.push({
                itemId: `${input.reviewBundleId}.metadata.${index + 1}`,
                routeId: route.routeId,
                severity: 'info',
                category: 'metadata_only',
                message: `Route ${route.routeId} is metadata-only and not an action review candidate.`,
            });
        }
        else if (route.auditStatus === 'audit_incomplete') {
            reviewStatus = 'review_incomplete';
            reviewerFocus.push('inspect incomplete evidence chain');
            attentionItems.push({
                itemId: `${input.reviewBundleId}.incomplete.${index + 1}`,
                routeId: route.routeId,
                severity: 'warning',
                category: 'incomplete_evidence',
                message: `Route ${route.routeId} has incomplete audit evidence.`,
            });
        }
        else if (route.auditStatus === 'audit_ready_blocked') {
            reviewStatus = 'review_ready_blocked';
            reviewerFocus.push('review blocked reasons');
            reviewerFocus.push('review missing requirements');
            reviewerFocus.push('confirm hard boundaries');
        }
        else if (route.auditStatus === 'audit_ready_execution_future_only') {
            reviewStatus = 'review_ready_execution_future_only';
            reviewerFocus.push('review future-only execution boundary conditions');
        }
        else if (route.auditStatus === 'audit_ready_future_action_capable') {
            reviewStatus = 'review_ready_future_action_capable';
            reviewerFocus.push('review future action-capable posture');
        }
        if (route.riskLevel === 'high' || route.riskLevel === 'critical') {
            attentionItems.push({
                itemId: `${input.reviewBundleId}.risk.${index + 1}`,
                routeId: route.routeId,
                severity: route.riskLevel === 'critical' ? 'critical' : 'warning',
                category: 'risk_level',
                message: `Route ${route.routeId} has ${route.riskLevel} risk and requires careful review.`,
            });
        }
        for (const reason of route.blockedReasons) {
            attentionItems.push({
                itemId: `${input.reviewBundleId}.blocked.${index + 1}.${reason}`,
                routeId: route.routeId,
                severity: ['blocked_direct_source_disabled', 'blocked_automatic_takeover_disabled', 'blocked_write_actions_disabled'].includes(reason) ? 'notice' : 'warning',
                category: 'blocked_reason',
                message: `Route ${route.routeId} reports blocked reason ${reason}.`,
            });
        }
        for (const req of route.missingRequirements) {
            attentionItems.push({
                itemId: `${input.reviewBundleId}.missing.${index + 1}.${req}`,
                routeId: route.routeId,
                severity: 'warning',
                category: 'missing_requirement',
                message: `Route ${route.routeId} is missing requirement ${req}.`,
            });
        }
        return {
            routeId: route.routeId,
            linkedActionId: route.linkedActionId,
            linkedPolicyId: route.linkedPolicyId,
            routeClass: route.routeClass,
            riskLevel: route.riskLevel,
            auditStatus: route.auditStatus,
            reviewStatus,
            reviewerFocus,
            evidenceStatus: {
                policy: route.evidence.policy ?? 'missing',
                approval: route.evidence.approval ?? 'missing',
                checkpoint: route.evidence.checkpoint ?? 'missing',
                decisionSimulation: route.evidence.decisionSimulation ?? 'missing',
                dryRun: route.evidence.dryRun ?? 'missing',
                blockedRouteSummary: route.evidence.blockedRouteSummary ?? 'missing',
                readinessMatrix: route.evidence.readinessMatrix ?? 'missing',
                policyToReadinessIntegration: route.evidence.policyToReadinessIntegration ?? 'missing',
                policyTraceReport: route.evidence.policyTraceReport ?? 'missing',
            },
            blockedReasons: route.blockedReasons,
            missingRequirements: route.missingRequirements,
            satisfiedRequirements: route.satisfiedRequirements,
            traceEntryCount: route.traceEntryCount,
            traceStages: route.traceStages,
            hardBoundaryCount: route.hardBoundaryCount,
            executionPerformed: false,
            approvalGranted: false,
            reviewDecisionRecorded: false,
        };
    });
    return {
        reviewBundleId: input.reviewBundleId,
        generatedAt: input.generatedAt,
        reviewProfile: input.reviewProfile,
        auditPacketReviewBundleOnly: true,
        executionPerformed: false,
        approvalGranted: false,
        reviewDecisionRecorded: false,
        fileWritten: false,
        externalTransmissionPerformed: false,
        sourceExport: {
            exportId: input.sourceExport.exportId,
            exportFormat: input.sourceExport.exportFormat,
            exportProfile: input.sourceExport.exportProfile,
        },
        sourcePacket: input.sourceExport.sourcePacket,
        reviewSummary: {
            totalRoutes: input.sourceExport.exportSummary.totalRoutes,
            reviewableRoutes: routeReviewCards.filter((card) => card.reviewStatus !== 'metadata_only').length,
            blockedRoutes: input.sourceExport.exportSummary.blockedRoutes,
            metadataOnlyRoutes: input.sourceExport.exportSummary.metadataOnlyRoutes,
            futureActionCapableRoutes: input.sourceExport.exportSummary.futureActionCapableRoutes,
            executionFutureOnlyRoutes: input.sourceExport.exportSummary.executionFutureOnlyRoutes,
            auditIncompleteRoutes: input.sourceExport.exportSummary.auditIncompleteRoutes,
            redactedRoutes: input.sourceExport.exportSummary.redactedRoutes,
            totalBlockedReasons: input.sourceExport.exportSummary.totalBlockedReasons,
            totalMissingRequirements: input.sourceExport.exportSummary.totalMissingRequirements,
            totalSatisfiedRequirements: input.sourceExport.exportSummary.totalSatisfiedRequirements,
            totalTraceEntries: input.sourceExport.exportSummary.totalTraceEntries,
            highRiskRoutes: routeReviewCards.filter((card) => card.riskLevel === 'high').length,
            criticalRiskRoutes: routeReviewCards.filter((card) => card.riskLevel === 'critical').length,
            executionPerformedCount: 0,
            approvalGrantedCount: 0,
            reviewDecisionRecordedCount: 0,
        },
        routeReviewCards,
        attentionItems,
        hardBoundaries: {
            ...input.sourceExport.hardBoundaries,
            reviewBundleDoesNotEqualApproval: true,
            reviewBundleDoesNotEqualExecution: true,
        },
        reviewerNotes: input.reviewerNotes ?? [],
    };
}
