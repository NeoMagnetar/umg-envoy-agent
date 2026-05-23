import type { ControlledActionReviewDecisionPacketRecordingHardBoundaries } from './controlled-action-review-decision-packet-recording-projection.js';
export interface ControlledActionReviewDecisionPacketRecordingAuditSummaryInput {
    summaryId: string;
    generatedAt?: string;
    sourceProjection: {
        projectionId: string;
        recordingPacketId: string;
        schemaVersion: string;
        reviewDecisionPacketRecordingProjectionOnly: true;
        recordingImplemented: false;
        recordingPerformed: false;
        liveDecisionRecorded: false;
        reviewDecisionRecorded: false;
        approvalGranted: false;
        executionPerformed: false;
        sourceReviewDecisionPacket: {
            reviewDecisionPacketId: string;
            reviewDecisionPacketSchemaId: string;
            reviewDecisionPacketProjectionId: string;
        };
        sourceProjection: {
            projectionId: string;
            packetId: string;
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
        };
        recordingVocabularySummary: {
            allowedRecordingStateCount: number;
            allowedRecordingActionCount: number;
            blockedRecordingActionCount: number;
            allowedRecordingStates: string[];
            allowedRecordingActions: string[];
            blockedRecordingActions: string[];
        };
        evidenceSummary: {
            totalEvidenceItems: number;
            requiredEvidenceItems: number;
            presentEvidenceItems: number;
            missingEvidenceItems: number;
        };
        policySummary: {
            idempotencyRequired: boolean;
            sideEffectsAllowed: false;
            supersessionMetadataOnly: boolean;
            revocationMetadataOnly: boolean;
            expirationMetadataOnly: boolean;
            auditTrailRequired: boolean;
            retentionMetadataOnly: boolean;
        };
        hardBoundaries: ControlledActionReviewDecisionPacketRecordingAuditSummaryHardBoundaries;
        projectionNotes: string[];
    };
}
export interface ControlledActionReviewDecisionPacketRecordingAuditSummaryHardBoundaries extends ControlledActionReviewDecisionPacketRecordingHardBoundaries {
}
export interface ControlledActionReviewDecisionPacketRecordingAuditFinding {
    findingId: string;
    severity: 'info' | 'notice' | 'warning' | 'critical';
    category: 'recording_state' | 'recording_action' | 'missing_evidence' | 'blocked_recording_action' | 'policy' | 'hard_boundary' | 'metadata_only' | 'lifecycle' | 'retention';
    message: string;
}
export interface ControlledActionReviewDecisionPacketRecordingAuditSummary {
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
        recordingStatus: 'design_only' | 'not_started' | 'requested_metadata_only' | 'validated_metadata_only' | 'rejected_invalid_metadata_only' | 'rejected_missing_evidence_metadata_only' | 'recorded_metadata_only_future_lane' | 'superseded_metadata_only' | 'revoked_metadata_only' | 'expired_metadata_only' | 'unknown_metadata_only';
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
    auditFindings: ControlledActionReviewDecisionPacketRecordingAuditFinding[];
    hardBoundaries: ControlledActionReviewDecisionPacketRecordingAuditSummaryHardBoundaries;
    recordingImplemented: false;
    recordingPerformed: false;
    liveDecisionRecorded: false;
    reviewDecisionRecorded: false;
    approvalGranted: false;
    executionPerformed: false;
}
export declare function projectControlledActionReviewDecisionPacketRecordingAuditSummary(input: ControlledActionReviewDecisionPacketRecordingAuditSummaryInput): ControlledActionReviewDecisionPacketRecordingAuditSummary;
