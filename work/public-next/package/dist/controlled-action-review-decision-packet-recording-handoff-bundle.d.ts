export interface ControlledActionReviewDecisionPacketRecordingHandoffFinding {
    findingId: string;
    severity: 'info' | 'notice' | 'warning' | 'critical';
    category: string;
    message: string;
}
export interface ControlledActionReviewDecisionPacketRecordingHandoffSourceReviewExport {
    exportId: string;
    generatedAt?: string;
    exportFormat: string;
    exportProfile: string;
    recordingReviewExportOnly: true;
    recordingAuditSummaryExported: true;
    fileWritten: false;
    externalTransmissionPerformed: false;
    packagePublished: false;
    recordingImplemented: false;
    recordingPerformed: false;
    liveDecisionRecorded: false;
    reviewDecisionRecorded: false;
    approvalGranted: false;
    executionPerformed: false;
    sourceSummary: {
        summaryId: string;
        generatedAt?: string;
    };
    sourceProjection: {
        projectionId: string;
        recordingPacketId: string;
        schemaVersion: string;
    };
    sourceReviewDecisionPacket: {
        reviewDecisionPacketId: string;
        reviewDecisionPacketSchemaId: string;
        reviewDecisionPacketProjectionId: string;
    };
    recordingRequestSummary: {
        recordingRequestId: string;
        requestedRecordingAction: string;
        requestedBy: string;
        requestedAt?: string;
    };
    recordingResultSummary: {
        recordingResultId: string;
        recordingState: string;
        recordingAccepted: boolean;
        recordingStatus: string;
    };
    reviewExportSummary: {
        evidenceComplete: boolean;
        totalEvidenceItems: number;
        requiredEvidenceItems: number;
        presentEvidenceItems: number;
        missingEvidenceItems: number;
        missingEvidenceRatio: number;
        auditFindingCount: number;
        criticalFindingCount: number;
        warningFindingCount: number;
        blockedRecordingActionCount: number;
        highRiskBlockedActionsPresent: boolean;
    };
    reviewFocus: string[];
    exportedAuditFindings: ControlledActionReviewDecisionPacketRecordingHandoffFinding[];
    redactionApplied: boolean;
    blockedRecordingActions: string[];
    hardBoundaries: {
        recordingReviewExportDoesNotEqualRecording: true;
        recordingReviewExportDoesNotEqualApproval: true;
        recordingReviewExportDoesNotEqualExecution: true;
        recordingAuditSummaryDoesNotEqualRecording: true;
        recordingDoesNotEqualApproval: true;
        recordingDoesNotEqualExecution: true;
    };
    exportNotes: string[];
}
export interface ControlledActionReviewDecisionPacketRecordingHandoffBundleInput {
    handoffBundleId: string;
    generatedAt?: string;
    handoffProfile: 'agent_to_agent' | 'human_reviewer' | 'debug_continuation' | 'compliance_reviewer' | 'future_lane_handoff';
    sourceReviewExport: ControlledActionReviewDecisionPacketRecordingHandoffSourceReviewExport;
    recommendedNextLane?: string;
    handoffNotes?: string[];
}
export interface ControlledActionReviewDecisionPacketRecordingHandoffBundle {
    handoffBundleId: string;
    generatedAt?: string;
    handoffProfile: string;
    recordingHandoffBundleOnly: true;
    sourceReviewExportBundled: true;
    fileWritten: false;
    externalTransmissionPerformed: false;
    packagePublished: false;
    bundleSent: false;
    recordingImplemented: false;
    recordingPerformed: false;
    liveDecisionRecorded: false;
    reviewDecisionRecorded: false;
    approvalGranted: false;
    executionPerformed: false;
    sourceReviewExport: {
        exportId: string;
        exportFormat: string;
        exportProfile: string;
    };
    sourceSummary: {
        summaryId: string;
        generatedAt?: string;
    };
    sourceProjection: {
        projectionId: string;
        recordingPacketId: string;
        schemaVersion: string;
    };
    sourceReviewDecisionPacket: {
        reviewDecisionPacketId: string;
        reviewDecisionPacketSchemaId: string;
        reviewDecisionPacketProjectionId: string;
    };
    recordingRequestSummary: {
        recordingRequestId: string;
        requestedRecordingAction: string;
        requestedBy: string;
        requestedAt?: string;
    };
    recordingResultSummary: {
        recordingResultId: string;
        recordingState: string;
        recordingAccepted: boolean;
        recordingStatus: string;
    };
    handoffSummary: {
        evidenceComplete: boolean;
        missingEvidenceItems: number;
        missingEvidenceRatio: number;
        auditFindingCount: number;
        criticalFindingCount: number;
        warningFindingCount: number;
        blockedRecordingActionCount: number;
        highRiskBlockedActionsPresent: boolean;
        redactionApplied: boolean;
    };
    reviewerFocus: string[];
    continuationFocus: string[];
    exportedAuditFindings: ControlledActionReviewDecisionPacketRecordingHandoffFinding[];
    blockedRecordingActions: string[];
    mustPreserveBoundaries: string[];
    mustNotDoNext: string[];
    recommendedNextLane: string;
    hardBoundaries: {
        recordingHandoffBundleDoesNotEqualRecording: true;
        recordingHandoffBundleDoesNotEqualApproval: true;
        recordingHandoffBundleDoesNotEqualExecution: true;
        recordingReviewExportDoesNotEqualRecording: true;
        recordingReviewExportDoesNotEqualApproval: true;
        recordingReviewExportDoesNotEqualExecution: true;
        recordingDoesNotEqualApproval: true;
        recordingDoesNotEqualExecution: true;
    };
    handoffNotes: string[];
}
export declare function projectControlledActionReviewDecisionPacketRecordingHandoffBundle(input: ControlledActionReviewDecisionPacketRecordingHandoffBundleInput): ControlledActionReviewDecisionPacketRecordingHandoffBundle;
