export function projectControlledActionReviewDecisionPacketRecordingHandoffBundle(input) {
    const source = input.sourceReviewExport;
    const continuationFocus = [];
    if (!source.reviewExportSummary.evidenceComplete) {
        continuationFocus.push('Resolve missing evidence before future metadata recording implementation.');
    }
    if (source.reviewExportSummary.criticalFindingCount > 0) {
        continuationFocus.push('Review critical audit findings before continuing.');
    }
    if (source.reviewExportSummary.warningFindingCount > 0) {
        continuationFocus.push('Review warning audit findings before continuing.');
    }
    if (source.reviewExportSummary.highRiskBlockedActionsPresent) {
        continuationFocus.push('Confirm high-risk blocked recording actions remain blocked.');
    }
    continuationFocus.push('Preserve non-recording, non-approval, and non-execution boundaries.');
    const mustPreserveBoundaries = [
        'recordingImplemented=false',
        'recordingPerformed=false',
        'liveDecisionRecorded=false',
        'approvalGranted=false',
        'executionPerformed=false',
        'fileWritten=false',
        'externalTransmissionPerformed=false',
        'packagePublished=false',
        'direct_source remains disabled',
        'automatic response takeover remains disabled',
    ];
    const mustNotDoNext = [
        'do not implement live recording',
        'do not record a live review decision',
        'do not grant approval',
        'do not execute actions',
        'do not implement write actions',
        'do not enable bridge actions',
        'do not mutate UMG-Block-Library',
        'do not touch Resleever',
        'do not publish package',
        'do not restart OpenClaw',
    ];
    return {
        handoffBundleId: input.handoffBundleId,
        generatedAt: input.generatedAt,
        handoffProfile: input.handoffProfile,
        recordingHandoffBundleOnly: true,
        sourceReviewExportBundled: true,
        fileWritten: false,
        externalTransmissionPerformed: false,
        packagePublished: false,
        bundleSent: false,
        recordingImplemented: false,
        recordingPerformed: false,
        liveDecisionRecorded: false,
        reviewDecisionRecorded: false,
        approvalGranted: false,
        executionPerformed: false,
        sourceReviewExport: {
            exportId: source.exportId,
            exportFormat: source.exportFormat,
            exportProfile: source.exportProfile,
        },
        sourceSummary: source.sourceSummary,
        sourceProjection: source.sourceProjection,
        sourceReviewDecisionPacket: source.sourceReviewDecisionPacket,
        recordingRequestSummary: source.recordingRequestSummary,
        recordingResultSummary: source.recordingResultSummary,
        handoffSummary: {
            evidenceComplete: source.reviewExportSummary.evidenceComplete,
            missingEvidenceItems: source.reviewExportSummary.missingEvidenceItems,
            missingEvidenceRatio: source.reviewExportSummary.missingEvidenceRatio,
            auditFindingCount: source.reviewExportSummary.auditFindingCount,
            criticalFindingCount: source.reviewExportSummary.criticalFindingCount,
            warningFindingCount: source.reviewExportSummary.warningFindingCount,
            blockedRecordingActionCount: source.reviewExportSummary.blockedRecordingActionCount,
            highRiskBlockedActionsPresent: source.reviewExportSummary.highRiskBlockedActionsPresent,
            redactionApplied: source.redactionApplied,
        },
        reviewerFocus: source.reviewFocus,
        continuationFocus,
        exportedAuditFindings: source.exportedAuditFindings,
        blockedRecordingActions: source.blockedRecordingActions,
        mustPreserveBoundaries,
        mustNotDoNext,
        recommendedNextLane: input.recommendedNextLane ?? 'ALPHA9_CONTROLLED_ACTION_EXECUTION_REVIEW_DECISION_PACKET_RECORDING_HANDOFF_REVIEW_SOURCE',
        hardBoundaries: {
            recordingHandoffBundleDoesNotEqualRecording: true,
            recordingHandoffBundleDoesNotEqualApproval: true,
            recordingHandoffBundleDoesNotEqualExecution: true,
            recordingReviewExportDoesNotEqualRecording: true,
            recordingReviewExportDoesNotEqualApproval: true,
            recordingReviewExportDoesNotEqualExecution: true,
            recordingDoesNotEqualApproval: true,
            recordingDoesNotEqualExecution: true,
        },
        handoffNotes: input.handoffNotes ?? [],
    };
}
