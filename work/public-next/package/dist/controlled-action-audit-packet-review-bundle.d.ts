export interface ControlledActionAuditPacketReviewBundleInput {
    reviewBundleId: string;
    generatedAt?: string;
    reviewProfile: 'internal_reviewer' | 'agent_handoff' | 'compliance_reviewer' | 'debug_reviewer' | 'approval_precheck';
    sourceExport: ControlledActionAuditPacketReviewBundleSourceExportInput;
    reviewerNotes?: string[];
}
export interface ControlledActionAuditPacketReviewBundleSourceExportInput {
    exportId: string;
    exportFormat: string;
    exportProfile: string;
    auditPacketExportOnly: true;
    executionPerformed: false;
    fileWritten: false;
    packagePublished: false;
    externalTransmissionPerformed: false;
    sourcePacket: {
        packetId: string;
        generatedAt?: string;
        runtimeVersion?: string;
        packageVersion?: string;
    };
    exportSummary: {
        totalRoutes: number;
        exportedRoutes: number;
        redactedRoutes: number;
        metadataOnlyRoutes: number;
        blockedRoutes: number;
        futureActionCapableRoutes: number;
        executionFutureOnlyRoutes: number;
        auditIncompleteRoutes: number;
        totalBlockedReasons: number;
        totalMissingRequirements: number;
        totalSatisfiedRequirements: number;
        totalTraceEntries: number;
        executionPerformedCount: 0;
    };
    redactionApplied: boolean;
    routes: ControlledActionAuditPacketReviewBundleRouteInput[];
    hardBoundaries: {
        policyDoesNotEqualExecution: true;
        approvalDoesNotEqualExecution: true;
        checkpointDoesNotEqualExecution: true;
        dryRunDoesNotEqualExecution: true;
        decisionSimulationOnly: true;
        readinessDoesNotEqualExecution: true;
        traceReportDoesNotEqualExecution: true;
        auditPacketDoesNotEqualExecution: true;
        auditPacketExportDoesNotEqualExecution: true;
    };
    exportNotes: string[];
}
export interface ControlledActionAuditPacketReviewBundleRouteInput {
    routeId: string;
    linkedActionId?: string;
    linkedPolicyId?: string;
    linkedApprovalId?: string;
    linkedCheckpointId?: string;
    linkedDecisionSimulationId?: string;
    linkedDryRunId?: string;
    linkedBlockedRouteSummaryId?: string;
    linkedReadinessMatrixId?: string;
    linkedPolicyToReadinessIntegrationId?: string;
    linkedPolicyTraceReportId?: string;
    routeClass: string;
    riskLevel: string;
    auditStatus: string;
    evidence: Record<string, string>;
    blockedReasons: string[];
    missingRequirements: string[];
    satisfiedRequirements: string[];
    traceEntryCount: number;
    traceStages: string[];
    hardBoundaryCount: number;
    executionPerformed: false;
}
export interface ControlledActionAuditPacketReviewBundle {
    reviewBundleId: string;
    generatedAt?: string;
    reviewProfile: string;
    auditPacketReviewBundleOnly: true;
    executionPerformed: false;
    approvalGranted: false;
    reviewDecisionRecorded: false;
    fileWritten: false;
    externalTransmissionPerformed: false;
    sourceExport: {
        exportId: string;
        exportFormat: string;
        exportProfile: string;
    };
    sourcePacket: {
        packetId: string;
        generatedAt?: string;
        runtimeVersion?: string;
        packageVersion?: string;
    };
    reviewSummary: ControlledActionAuditPacketReviewSummary;
    routeReviewCards: ControlledActionAuditPacketRouteReviewCard[];
    attentionItems: ControlledActionAuditPacketReviewAttentionItem[];
    hardBoundaries: {
        policyDoesNotEqualExecution: true;
        approvalDoesNotEqualExecution: true;
        checkpointDoesNotEqualExecution: true;
        dryRunDoesNotEqualExecution: true;
        decisionSimulationOnly: true;
        readinessDoesNotEqualExecution: true;
        traceReportDoesNotEqualExecution: true;
        auditPacketDoesNotEqualExecution: true;
        auditPacketExportDoesNotEqualExecution: true;
        reviewBundleDoesNotEqualApproval: true;
        reviewBundleDoesNotEqualExecution: true;
    };
    reviewerNotes: string[];
}
export interface ControlledActionAuditPacketReviewSummary {
    totalRoutes: number;
    reviewableRoutes: number;
    blockedRoutes: number;
    metadataOnlyRoutes: number;
    futureActionCapableRoutes: number;
    executionFutureOnlyRoutes: number;
    auditIncompleteRoutes: number;
    redactedRoutes: number;
    totalBlockedReasons: number;
    totalMissingRequirements: number;
    totalSatisfiedRequirements: number;
    totalTraceEntries: number;
    highRiskRoutes: number;
    criticalRiskRoutes: number;
    executionPerformedCount: 0;
    approvalGrantedCount: 0;
    reviewDecisionRecordedCount: 0;
}
export interface ControlledActionAuditPacketRouteReviewCard {
    routeId: string;
    linkedActionId?: string;
    linkedPolicyId?: string;
    routeClass: string;
    riskLevel: string;
    auditStatus: string;
    reviewStatus: 'metadata_only' | 'review_ready_blocked' | 'review_ready_future_action_capable' | 'review_ready_execution_future_only' | 'review_incomplete' | 'review_attention_required';
    reviewerFocus: string[];
    evidenceStatus: {
        policy: string;
        approval: string;
        checkpoint: string;
        decisionSimulation: string;
        dryRun: string;
        blockedRouteSummary: string;
        readinessMatrix: string;
        policyToReadinessIntegration: string;
        policyTraceReport: string;
    };
    blockedReasons: string[];
    missingRequirements: string[];
    satisfiedRequirements: string[];
    traceEntryCount: number;
    traceStages: string[];
    hardBoundaryCount: number;
    executionPerformed: false;
    approvalGranted: false;
    reviewDecisionRecorded: false;
}
export interface ControlledActionAuditPacketReviewAttentionItem {
    itemId: string;
    routeId?: string;
    severity: 'info' | 'notice' | 'warning' | 'critical';
    category: 'blocked_reason' | 'missing_requirement' | 'incomplete_evidence' | 'risk_level' | 'hard_boundary' | 'redaction' | 'future_action_capable' | 'metadata_only';
    message: string;
}
export declare function projectControlledActionAuditPacketReviewBundle(input: ControlledActionAuditPacketReviewBundleInput): ControlledActionAuditPacketReviewBundle;
