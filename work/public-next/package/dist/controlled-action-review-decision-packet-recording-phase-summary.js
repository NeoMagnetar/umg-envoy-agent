export function projectControlledActionReviewDecisionPacketRecordingPhaseSummary(input) {
    const hard = input.hardBoundaries;
    const boundarySummary = {
        recordingBoundaryIntact: hard.recordingImplemented === false &&
            hard.recordingPerformed === false &&
            hard.liveDecisionRecorded === false &&
            hard.reviewDecisionRecorded === false,
        approvalBoundaryIntact: hard.approvalGranted === false,
        executionBoundaryIntact: hard.executionPerformed === false,
        transmissionBoundaryIntact: hard.fileWritten === false &&
            hard.externalTransmissionPerformed === false &&
            hard.packagePublished === false,
        directSourceBoundaryIntact: hard.directSourceEnabled === false,
        automaticTakeoverBoundaryIntact: hard.automaticResponseTakeoverEnabled === false,
    };
    const hasRequiredLaneNames = [
        'review decision packet recording design',
        'review decision packet recording schema',
        'review decision packet recording runtime projection',
        'review decision packet recording audit summary',
        'review decision packet recording review export',
        'review decision packet recording handoff bundle',
    ].every((requiredLane) => input.completedLanes.some((lane) => lane.laneName === requiredLane));
    const boundariesIntact = boundarySummary.recordingBoundaryIntact &&
        boundarySummary.approvalBoundaryIntact &&
        boundarySummary.executionBoundaryIntact &&
        boundarySummary.transmissionBoundaryIntact &&
        boundarySummary.directSourceBoundaryIntact &&
        boundarySummary.automaticTakeoverBoundaryIntact;
    let phaseStatus = input.phaseStatus;
    if (!boundariesIntact) {
        phaseStatus = 'blocked';
    }
    else if (!hasRequiredLaneNames) {
        phaseStatus = 'incomplete';
    }
    else if (input.validation.buildPassed &&
        input.validation.validateAlphaCurrentPassed &&
        input.validation.failedCommands.length === 0 &&
        input.completedLanes.some((lane) => lane.laneName === 'review decision packet recording handoff bundle')) {
        phaseStatus = 'handoff_ready';
    }
    return {
        phaseSummaryId: input.phaseSummaryId,
        generatedAt: input.generatedAt,
        phaseName: input.phaseName,
        phaseStatus,
        phaseSummaryOnly: true,
        recordingImplemented: false,
        recordingPerformed: false,
        liveDecisionRecorded: false,
        reviewDecisionRecorded: false,
        approvalGranted: false,
        executionPerformed: false,
        fileWritten: false,
        externalTransmissionPerformed: false,
        packagePublished: false,
        baseline: {
            branch: input.baseline.branch,
            packageVersion: input.baseline.packageVersion,
            currentCommit: input.baseline.currentCommit,
            correctedPriorCheckpoint: input.baseline.correctedPriorCheckpoint,
            parkedResidue: input.baseline.parkedResidue ?? [],
        },
        completedLaneCount: input.completedLanes.length,
        completedLanes: input.completedLanes,
        validationSummary: {
            buildPassed: input.validation.buildPassed,
            validateAlphaCurrentPassed: input.validation.validateAlphaCurrentPassed,
            totalValidationCommands: input.validation.validationCommands.length,
            failedValidationCommands: input.validation.failedCommands.length,
        },
        boundarySummary,
        recommendedNextLane: input.recommendedNextLane || 'ALPHA9_CONTROLLED_ACTION_EXECUTION_PHASE_HANDOFF_REPORT_SOURCE',
        mustPreserveBoundaries: input.mustPreserveBoundaries,
        mustNotDoNext: input.mustNotDoNext,
        phaseNotes: input.phaseNotes ?? [],
        hardBoundaries: hard,
    };
}
