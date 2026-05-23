function mapDecisionStatus(decision, accepted) {
    if (!accepted)
        return 'invalid_or_rejected_metadata_only';
    switch (decision) {
        case 'deny': return 'denied_metadata_only';
        case 'request_more_evidence': return 'needs_more_evidence_metadata_only';
        case 'mark_incomplete': return 'incomplete_metadata_only';
        case 'approve_for_dry_run_only': return 'dry_run_only_metadata';
        case 'approve_for_future_execution_review_only': return 'future_execution_review_only_metadata';
        case 'revoke_prior_review': return 'revoked_metadata_only';
        case 'supersede_prior_review': return 'superseded_metadata_only';
        case 'expire_review': return 'expired_metadata_only';
        case 'no_decision': return 'no_decision_metadata_only';
        default: return 'invalid_or_rejected_metadata_only';
    }
}
export function projectControlledActionReviewDecisionPacket(input) {
    const routeDecisionProjections = input.decisionRequest.targetRoutes.map((targetRoute) => {
        const result = input.decisionResult.routeDecisionResults.find((item) => item.routeId === targetRoute.routeId);
        const accepted = result?.decisionAccepted ?? false;
        return {
            routeId: targetRoute.routeId,
            requestedDecision: targetRoute.requestedDecision,
            resultDecision: result?.decision,
            decisionProjectionStatus: mapDecisionStatus(result?.decision ?? targetRoute.requestedDecision, accepted),
            decisionAccepted: accepted,
            evidencePresent: targetRoute.evidencePresent,
            evidenceMissing: targetRoute.evidenceMissing,
            blockedReasonsReviewed: targetRoute.blockedReasonsReviewed,
            missingRequirementsReviewed: targetRoute.missingRequirementsReviewed,
            hardBoundariesReviewed: targetRoute.hardBoundariesReviewed,
            decisionDoesNotGrantApproval: true,
            decisionDoesNotGrantExecution: true,
            approvalGranted: false,
            executionPerformed: false,
        };
    });
    const evidenceItems = Object.values(input.evidenceRequirements);
    return {
        projectionId: `projection.${input.packetId}`,
        packetId: input.packetId,
        schemaVersion: input.schemaVersion,
        projectedAt: input.createdAt,
        reviewDecisionPacketProjectionOnly: true,
        executionPerformed: false,
        approvalGranted: false,
        reviewDecisionRecorded: input.reviewDecisionRecorded,
        liveDecisionRecorded: false,
        sourceReviewBundle: {
            reviewBundleId: input.sourceReviewBundle.reviewBundleId,
            sourceExportId: input.sourceReviewBundle.sourceExportId,
            sourcePacketId: input.sourceReviewBundle.sourcePacketId,
        },
        decisionRequestSummary: {
            decisionRequestId: input.decisionRequest.decisionRequestId,
            targetRouteCount: input.decisionRequest.targetRoutes.length,
            requestedDecisionTypes: [...new Set(input.decisionRequest.targetRoutes.map((route) => route.requestedDecision))],
        },
        decisionResultSummary: {
            decisionResultId: input.decisionResult.decisionResultId,
            resultState: input.decisionResult.resultState,
            routeDecisionResultCount: input.decisionResult.routeDecisionResults.length,
            acceptedDecisionCount: input.decisionResult.routeDecisionResults.filter((route) => route.decisionAccepted).length,
            rejectedDecisionCount: input.decisionResult.routeDecisionResults.filter((route) => !route.decisionAccepted).length,
        },
        routeDecisionProjections,
        evidenceSummary: {
            totalEvidenceItems: evidenceItems.length,
            requiredEvidenceItems: evidenceItems.filter((item) => item.required).length,
            presentEvidenceItems: evidenceItems.filter((item) => item.present).length,
            missingEvidenceItems: evidenceItems.filter((item) => item.required && !item.present).length,
        },
        blockedDecisionCategorySummary: {
            totalBlockedCategories: input.blockedDecisionCategories.length,
            categories: input.blockedDecisionCategories.map((item) => item.category),
        },
        hardBoundaries: input.hardBoundaries,
        projectionNotes: [
            'Projection remains metadata-only.',
            'No live review decision was recorded by this helper.',
            'No approval or execution authority was granted.',
        ],
    };
}
