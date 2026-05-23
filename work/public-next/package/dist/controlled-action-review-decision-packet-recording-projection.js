export function projectControlledActionReviewDecisionPacketRecording(input) {
    const evidenceItems = Object.values(input.evidenceRequirements);
    return {
        projectionId: `projection.${input.recordingPacketId}`,
        recordingPacketId: input.recordingPacketId,
        schemaVersion: input.schemaVersion,
        projectedAt: input.createdAt,
        reviewDecisionPacketRecordingProjectionOnly: true,
        recordingImplemented: false,
        recordingPerformed: false,
        liveDecisionRecorded: false,
        reviewDecisionRecorded: false,
        approvalGranted: false,
        executionPerformed: false,
        sourceReviewDecisionPacket: {
            reviewDecisionPacketId: input.sourceReviewDecisionPacket.reviewDecisionPacketId,
            reviewDecisionPacketSchemaId: input.sourceReviewDecisionPacket.reviewDecisionPacketSchemaId,
            reviewDecisionPacketProjectionId: input.sourceReviewDecisionPacket.reviewDecisionPacketProjectionId,
        },
        sourceProjection: {
            projectionId: input.sourceProjection.projectionId,
            packetId: input.sourceProjection.packetId,
        },
        recordingRequestSummary: {
            recordingRequestId: input.recordingRequest.recordingRequestId,
            requestedRecordingAction: input.recordingRequest.requestedRecordingAction,
            requestedBy: input.recordingRequest.requestedBy,
            requestedAt: input.recordingRequest.requestedAt,
        },
        recordingResultSummary: {
            recordingResultId: input.recordingResult.recordingResultId,
            recordingState: input.recordingResult.recordingState,
            recordingAccepted: input.recordingResult.recordingAccepted,
        },
        recordingVocabularySummary: {
            allowedRecordingStateCount: input.allowedRecordingStates.length,
            allowedRecordingActionCount: input.allowedRecordingActions.length,
            blockedRecordingActionCount: input.blockedRecordingActions.length,
            allowedRecordingStates: input.allowedRecordingStates,
            allowedRecordingActions: input.allowedRecordingActions,
            blockedRecordingActions: input.blockedRecordingActions.map((item) => item.action),
        },
        evidenceSummary: {
            totalEvidenceItems: evidenceItems.length,
            requiredEvidenceItems: evidenceItems.filter((item) => item.required).length,
            presentEvidenceItems: evidenceItems.filter((item) => item.present).length,
            missingEvidenceItems: evidenceItems.filter((item) => item.required && !item.present).length,
        },
        policySummary: {
            idempotencyRequired: input.idempotencyPolicy.idempotencyRequired,
            sideEffectsAllowed: false,
            supersessionMetadataOnly: input.supersessionPolicy.metadataOnly,
            revocationMetadataOnly: input.revocationPolicy.metadataOnly,
            expirationMetadataOnly: input.expirationPolicy.metadataOnly,
            auditTrailRequired: input.auditTrail.auditTrailRequired,
            retentionMetadataOnly: input.retentionPolicy.metadataOnly,
        },
        hardBoundaries: input.hardBoundaries,
        projectionNotes: [
            `Recording state ${input.recordingResult.recordingState} remains metadata only.`,
            `Requested recording action ${input.recordingRequest.requestedRecordingAction} does not perform live recording in this lane.`,
            'No approval or execution authority was created by this projection.',
        ],
    };
}
