export interface ControlledActionReviewDecisionPacketProjectionInput {
    packetId: string;
    packetType: 'controlled_action_review_decision_packet';
    schemaVersion: string;
    status: 'schema_validated' | 'example' | 'runtime_projection_input' | 'invalid';
    createdAt?: string;
    sourceReviewBundle: {
        reviewBundleId: string;
        sourceExportId: string;
        sourcePacketId: string;
        reviewBundleDoesNotEqualApproval: true;
        reviewBundleDoesNotEqualExecution: true;
    };
    decisionRequest: {
        decisionRequestId: string;
        reviewBundleId: string;
        requestedBy: string;
        requestedAt?: string;
        targetRoutes: ControlledActionReviewDecisionPacketProjectionTargetRoute[];
        executionPerformed: false;
        approvalGranted: false;
    };
    decisionResult: {
        decisionResultId: string;
        decisionRequestId: string;
        resultState: 'review_decision_recorded_metadata_only' | 'review_decision_denied' | 'review_decision_needs_more_evidence' | 'review_decision_incomplete' | 'review_decision_dry_run_only' | 'review_decision_future_execution_review_only' | 'review_decision_revoked' | 'review_decision_superseded' | 'review_decision_expired' | 'review_decision_rejected_invalid';
        routeDecisionResults: ControlledActionReviewDecisionPacketProjectionRouteDecisionResult[];
        approvalGranted: false;
        executionPerformed: false;
    };
    evidenceRequirements: Record<string, ControlledActionReviewDecisionPacketEvidenceRequirement>;
    hardBoundaries: ControlledActionReviewDecisionPacketProjectionHardBoundaries;
    blockedDecisionCategories: ControlledActionReviewDecisionPacketBlockedDecisionCategory[];
    executionPerformed: false;
    approvalGranted: false;
    reviewDecisionRecorded: boolean;
    reviewDecisionPacketDoesNotEqualApproval: true;
    reviewDecisionPacketDoesNotEqualExecution: true;
}
export interface ControlledActionReviewDecisionPacketProjectionTargetRoute {
    routeId: string;
    requestedDecision: 'deny' | 'request_more_evidence' | 'mark_incomplete' | 'approve_for_dry_run_only' | 'approve_for_future_execution_review_only' | 'revoke_prior_review' | 'supersede_prior_review' | 'expire_review' | 'no_decision';
    reviewReason: string;
    evidencePresent: string[];
    evidenceMissing: string[];
    blockedReasonsReviewed: string[];
    missingRequirementsReviewed: string[];
    hardBoundariesReviewed: string[];
}
export interface ControlledActionReviewDecisionPacketProjectionRouteDecisionResult {
    routeId: string;
    decision: 'deny' | 'request_more_evidence' | 'mark_incomplete' | 'approve_for_dry_run_only' | 'approve_for_future_execution_review_only' | 'revoke_prior_review' | 'supersede_prior_review' | 'expire_review' | 'no_decision';
    decisionAccepted: boolean;
    decisionDoesNotGrantApproval: true;
    decisionDoesNotGrantExecution: true;
    executionPerformed: false;
}
export interface ControlledActionReviewDecisionPacketEvidenceRequirement {
    required: boolean;
    present: boolean;
    referenceId?: string;
    notes?: string[];
}
export interface ControlledActionReviewDecisionPacketBlockedDecisionCategory {
    category: 'execute_action' | 'approve_for_execution' | 'authorize_write_action' | 'authorize_bridge_action' | 'enable_direct_source' | 'enable_automatic_response_takeover' | 'publish_package' | 'restart_openclaw' | 'mutate_block_library' | 'touch_resleever';
    reason: string;
    requiresFutureLane: boolean;
    requiresExplicitApproval: boolean;
}
export interface ControlledActionReviewDecisionPacketProjectionHardBoundaries {
    policyDoesNotEqualExecution: true;
    approvalDoesNotEqualExecution: true;
    checkpointDoesNotEqualExecution: true;
    dryRunDoesNotEqualExecution: true;
    decisionSimulationDoesNotEqualExecution: true;
    decisionSimulationOnly: true;
    readinessDoesNotEqualExecution: true;
    traceReportDoesNotEqualExecution: true;
    auditPacketDoesNotEqualExecution: true;
    auditPacketExportDoesNotEqualExecution: true;
    reviewBundleDoesNotEqualApproval: true;
    reviewBundleDoesNotEqualExecution: true;
    reviewDecisionPacketDoesNotEqualApproval: true;
    reviewDecisionPacketDoesNotEqualExecution: true;
    executionPerformed: false;
    approvalGranted: false;
    writeActionPerformed: false;
    bridgeActionPerformed: false;
    fileWritten: false;
    externalTransmissionPerformed: false;
    packagePublished: false;
    directSourceEnabled: false;
    automaticResponseTakeoverEnabled: false;
}
export interface ControlledActionReviewDecisionPacketProjection {
    projectionId: string;
    packetId: string;
    schemaVersion: string;
    projectedAt?: string;
    reviewDecisionPacketProjectionOnly: true;
    executionPerformed: false;
    approvalGranted: false;
    reviewDecisionRecorded: boolean;
    liveDecisionRecorded: false;
    sourceReviewBundle: {
        reviewBundleId: string;
        sourceExportId: string;
        sourcePacketId: string;
    };
    decisionRequestSummary: {
        decisionRequestId: string;
        targetRouteCount: number;
        requestedDecisionTypes: string[];
    };
    decisionResultSummary: {
        decisionResultId: string;
        resultState: string;
        routeDecisionResultCount: number;
        acceptedDecisionCount: number;
        rejectedDecisionCount: number;
    };
    routeDecisionProjections: ControlledActionReviewDecisionPacketRouteProjection[];
    evidenceSummary: {
        totalEvidenceItems: number;
        requiredEvidenceItems: number;
        presentEvidenceItems: number;
        missingEvidenceItems: number;
    };
    blockedDecisionCategorySummary: {
        totalBlockedCategories: number;
        categories: string[];
    };
    hardBoundaries: ControlledActionReviewDecisionPacketProjectionHardBoundaries;
    projectionNotes: string[];
}
export interface ControlledActionReviewDecisionPacketRouteProjection {
    routeId: string;
    requestedDecision: string;
    resultDecision?: string;
    decisionProjectionStatus: 'metadata_only' | 'denied_metadata_only' | 'needs_more_evidence_metadata_only' | 'incomplete_metadata_only' | 'dry_run_only_metadata' | 'future_execution_review_only_metadata' | 'revoked_metadata_only' | 'superseded_metadata_only' | 'expired_metadata_only' | 'no_decision_metadata_only' | 'invalid_or_rejected_metadata_only';
    decisionAccepted: boolean;
    evidencePresent: string[];
    evidenceMissing: string[];
    blockedReasonsReviewed: string[];
    missingRequirementsReviewed: string[];
    hardBoundariesReviewed: string[];
    decisionDoesNotGrantApproval: true;
    decisionDoesNotGrantExecution: true;
    approvalGranted: false;
    executionPerformed: false;
}
export declare function projectControlledActionReviewDecisionPacket(input: ControlledActionReviewDecisionPacketProjectionInput): ControlledActionReviewDecisionPacketProjection;
