export interface ControlledActionReviewDecisionPacketRecordingReviewExportFindingInput {
    findingId: string;
    severity: 'info' | 'notice' | 'warning' | 'critical';
    category: 'recording_state' | 'recording_action' | 'missing_evidence' | 'blocked_recording_action' | 'policy' | 'hard_boundary' | 'metadata_only' | 'lifecycle' | 'retention';
    message: string;
}
export interface ControlledActionReviewDecisionPacketRecordingReviewExportInput {
    exportId: string;
    generatedAt?: string;
    exportFormat: 'review_json' | 'handoff_json' | 'debug_json' | 'compliance_json';
    exportProfile: 'internal_review' | 'agent_handoff' | 'debug_review' | 'compliance_review';
    sourceSummary: {
        summaryId: string;
        generatedAt?: string;
        recordingAuditSummaryOnly: true;
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
        evidenceAudit: {
            totalEvidenceItems: number;
            requiredEvidenceItems: number;
            presentEvidenceItems: number;
            missingEvidenceItems: number;
            evidenceComplete: boolean;
            missingEvidenceRatio: number;
        };
        recordingVocabularyAudit: {
            allowedRecordingStateCount: number;
            allowedRecordingActionCount: number;
            blockedRecordingActionCount: number;
            blockedRecordingActions: string[];
            highRiskBlockedActionsPresent: boolean;
        };
        policyAudit: {
            idempotencyRequired: boolean;
            sideEffectsAllowed: false;
            lifecycleMetadataOnly: boolean;
            auditTrailRequired: boolean;
            retentionMetadataOnly: boolean;
        };
        boundaryAudit: {
            hardBoundaryCount: number;
            recordingBoundaryIntact: boolean;
            approvalBoundaryIntact: boolean;
            executionBoundaryIntact: boolean;
            transmissionBoundaryIntact: boolean;
            bridgeBoundaryIntact: boolean;
            directSourceBoundaryIntact: boolean;
            automaticTakeoverBoundaryIntact: boolean;
        };
        auditFindings: ControlledActionReviewDecisionPacketRecordingReviewExportFindingInput[];
        recordingImplemented: false;
        recordingPerformed: false;
        liveDecisionRecorded: false;
        reviewDecisionRecorded: false;
        approvalGranted: false;
        executionPerformed: false;
    };
    redactionPolicy?: {
        redactSummaryId?: boolean;
        redactRecordingPacketId?: boolean;
        redactReviewDecisionPacketId?: boolean;
        redactRequestedBy?: boolean;
        redactTimestamps?: boolean;
        includeAuditFindings?: boolean;
        includeBlockedRecordingActions?: boolean;
        includeEvidenceCounts?: boolean;
        includePolicyAudit?: boolean;
        includeBoundaryAudit?: boolean;
    };
    exportNotes?: string[];
}
export interface ControlledActionReviewDecisionPacketRecordingReviewExportFinding {
    findingId: string;
    severity: 'info' | 'notice' | 'warning' | 'critical';
    category: string;
    message: string;
}
export interface ControlledActionReviewDecisionPacketRecordingReviewExport {
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
    exportedAuditFindings: ControlledActionReviewDecisionPacketRecordingReviewExportFinding[];
    redactionApplied: boolean;
    redactionPolicy: {
        redactSummaryId: boolean;
        redactRecordingPacketId: boolean;
        redactReviewDecisionPacketId: boolean;
        redactRequestedBy: boolean;
        redactTimestamps: boolean;
        includeAuditFindings: boolean;
        includeBlockedRecordingActions: boolean;
        includeEvidenceCounts: boolean;
        includePolicyAudit: boolean;
        includeBoundaryAudit: boolean;
    };
    blockedRecordingActions: string[];
    policyAudit?: {
        idempotencyRequired: boolean;
        sideEffectsAllowed: false;
        lifecycleMetadataOnly: boolean;
        auditTrailRequired: boolean;
        retentionMetadataOnly: boolean;
    };
    boundaryAudit?: {
        hardBoundaryCount: number;
        recordingBoundaryIntact: boolean;
        approvalBoundaryIntact: boolean;
        executionBoundaryIntact: boolean;
        transmissionBoundaryIntact: boolean;
        bridgeBoundaryIntact: boolean;
        directSourceBoundaryIntact: boolean;
        automaticTakeoverBoundaryIntact: boolean;
    };
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
export declare function projectControlledActionReviewDecisionPacketRecordingReviewExport(input: ControlledActionReviewDecisionPacketRecordingReviewExportInput): ControlledActionReviewDecisionPacketRecordingReviewExport;
