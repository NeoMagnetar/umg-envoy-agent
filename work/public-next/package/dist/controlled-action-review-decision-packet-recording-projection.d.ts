export type ControlledActionReviewDecisionPacketRecordingState = 'recording_design_only' | 'recording_not_started' | 'recording_requested_metadata_only' | 'recording_validated_metadata_only' | 'recording_rejected_invalid' | 'recording_rejected_missing_evidence' | 'recording_recorded_metadata_only_future_lane' | 'recording_superseded_metadata_only' | 'recording_revoked_metadata_only' | 'recording_expired_metadata_only';
export type ControlledActionReviewDecisionPacketRecordingAction = 'validate_recording_request' | 'reject_invalid_recording_request' | 'reject_missing_evidence' | 'record_metadata_only_future_lane' | 'supersede_recorded_metadata' | 'revoke_recorded_metadata' | 'expire_recorded_metadata' | 'no_recording_action';
export interface ControlledActionReviewDecisionPacketRecordingEvidenceRequirement {
    required: boolean;
    present: boolean;
    referenceId?: string;
    notes?: string[];
}
export interface ControlledActionReviewDecisionPacketBlockedRecordingAction {
    action: 'record_live_decision_now' | 'grant_approval' | 'approve_for_execution' | 'execute_action' | 'authorize_write_action' | 'authorize_bridge_action' | 'enable_direct_source' | 'enable_automatic_response_takeover' | 'write_recording_file' | 'transmit_recording' | 'publish_package' | 'restart_openclaw' | 'mutate_block_library' | 'touch_resleever';
    reason: string;
    requiresFutureLane: boolean;
    requiresExplicitApproval: boolean;
    requiresImplementation: boolean;
}
export interface ControlledActionReviewDecisionPacketRecordingIdempotencyPolicy {
    idempotencyRequired: true;
    idempotencyKeyFields: string[];
    duplicateRequestBehavior: 'return_existing_metadata' | 'reject_duplicate' | 'require_supersession';
    duplicateRecordingBehavior: 'return_existing_metadata' | 'reject_duplicate' | 'supersede_explicitly';
    sideEffectsAllowed: false;
}
export interface ControlledActionReviewDecisionPacketRecordingLifecyclePolicy {
    enabled: boolean;
    metadataOnly: true;
    deletesHistory: false;
    grantsApproval: false;
    grantsExecution: false;
    notes?: string[];
}
export interface ControlledActionReviewDecisionPacketRecordingAuditTrail {
    auditTrailRequired: true;
    recordsRequest: boolean;
    recordsResult: boolean;
    recordsEvidence: boolean;
    recordsHardBoundaries: boolean;
    recordsSupersession: boolean;
    recordsRevocation: boolean;
    recordsExpiration: boolean;
    externalTransmissionPerformed: false;
    fileWritten: false;
}
export interface ControlledActionReviewDecisionPacketRecordingRetentionPolicy {
    retentionPolicyDefined: boolean;
    metadataOnly: true;
    deletesHistory: false;
    allowsExternalTransmission: false;
    notes?: string[];
}
export interface ControlledActionReviewDecisionPacketRecordingHardBoundaries {
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
    reviewDecisionPacketProjectionDoesNotEqualApproval: true;
    reviewDecisionPacketProjectionDoesNotEqualExecution: true;
    recordingSchemaDoesNotEqualRecording: true;
    recordingDoesNotEqualApproval: true;
    recordingDoesNotEqualExecution: true;
    recordingImplemented: false;
    recordingPerformed: false;
    liveDecisionRecorded: false;
    approvalGranted: false;
    executionPerformed: false;
    writeActionPerformed: false;
    bridgeActionPerformed: false;
    fileWritten: false;
    externalTransmissionPerformed: false;
    packagePublished: false;
    directSourceEnabled: false;
    automaticResponseTakeoverEnabled: false;
}
export interface ControlledActionReviewDecisionPacketRecordingRequest {
    recordingRequestId: string;
    reviewDecisionPacketId: string;
    reviewDecisionPacketProjectionId: string;
    requestedRecordingAction: ControlledActionReviewDecisionPacketRecordingAction;
    requestedBy: string;
    requestedAt?: string;
    recordingReason: string;
    executionPerformed: false;
    approvalGranted: false;
    recordingPerformed: false;
}
export interface ControlledActionReviewDecisionPacketRecordingResult {
    recordingResultId: string;
    recordingRequestId: string;
    recordingState: ControlledActionReviewDecisionPacketRecordingState;
    recordingAccepted: boolean;
    recordingPerformed: false;
    liveDecisionRecorded: false;
    approvalGranted: false;
    executionPerformed: false;
    recordingDoesNotEqualApproval: true;
    recordingDoesNotEqualExecution: true;
}
export interface ControlledActionReviewDecisionPacketRecordingProjectionInput {
    recordingPacketId: string;
    packetType: 'controlled_action_review_decision_packet_recording';
    schemaVersion: string;
    status: 'schema_validated' | 'example' | 'runtime_projection_input' | 'invalid';
    createdAt?: string;
    sourceReviewDecisionPacket: {
        reviewDecisionPacketId: string;
        reviewDecisionPacketSchemaId: string;
        reviewDecisionPacketProjectionId: string;
        reviewDecisionPacketDoesNotEqualApproval: true;
        reviewDecisionPacketDoesNotEqualExecution: true;
    };
    sourceProjection: {
        projectionId: string;
        packetId: string;
        reviewDecisionPacketProjectionOnly: true;
        approvalGranted: false;
        executionPerformed: false;
        liveDecisionRecorded: false;
    };
    recordingRequest: ControlledActionReviewDecisionPacketRecordingRequest;
    recordingResult: ControlledActionReviewDecisionPacketRecordingResult;
    allowedRecordingStates: ControlledActionReviewDecisionPacketRecordingState[];
    allowedRecordingActions: ControlledActionReviewDecisionPacketRecordingAction[];
    blockedRecordingActions: ControlledActionReviewDecisionPacketBlockedRecordingAction[];
    evidenceRequirements: Record<string, ControlledActionReviewDecisionPacketRecordingEvidenceRequirement>;
    idempotencyPolicy: ControlledActionReviewDecisionPacketRecordingIdempotencyPolicy;
    supersessionPolicy: ControlledActionReviewDecisionPacketRecordingLifecyclePolicy;
    revocationPolicy: ControlledActionReviewDecisionPacketRecordingLifecyclePolicy;
    expirationPolicy: ControlledActionReviewDecisionPacketRecordingLifecyclePolicy;
    auditTrail: ControlledActionReviewDecisionPacketRecordingAuditTrail;
    retentionPolicy: ControlledActionReviewDecisionPacketRecordingRetentionPolicy;
    hardBoundaries: ControlledActionReviewDecisionPacketRecordingHardBoundaries;
    recordingImplemented: false;
    recordingPerformed: false;
    liveDecisionRecorded: false;
    reviewDecisionRecorded: false;
    approvalGranted: false;
    executionPerformed: false;
    recordingSchemaDoesNotEqualRecording: true;
    recordingDoesNotEqualApproval: true;
    recordingDoesNotEqualExecution: true;
}
export interface ControlledActionReviewDecisionPacketRecordingProjection {
    projectionId: string;
    recordingPacketId: string;
    schemaVersion: string;
    projectedAt?: string;
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
    hardBoundaries: ControlledActionReviewDecisionPacketRecordingHardBoundaries;
    projectionNotes: string[];
}
export declare function projectControlledActionReviewDecisionPacketRecording(input: ControlledActionReviewDecisionPacketRecordingProjectionInput): ControlledActionReviewDecisionPacketRecordingProjection;
