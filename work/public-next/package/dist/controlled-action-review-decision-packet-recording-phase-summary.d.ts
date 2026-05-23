export interface ControlledActionRecordingPhaseLaneSummary {
    laneName: string;
    commit?: string;
    status: 'ready' | 'pushed' | 'validated' | 'corrected_checkpoint' | 'parked';
    filesAdded?: string[];
    filesUpdated?: string[];
    validationPassed: boolean;
    boundaryFlagsConfirmed: string[];
}
export interface ControlledActionRecordingPhaseHardBoundaries {
    phaseSummaryOnly: true;
    recordingImplemented: false;
    recordingPerformed: false;
    liveDecisionRecorded: false;
    reviewDecisionRecorded: false;
    approvalGranted: false;
    executionPerformed: false;
    fileWritten: false;
    externalTransmissionPerformed: false;
    packagePublished: false;
    directSourceEnabled: false;
    automaticResponseTakeoverEnabled: false;
    phaseSummaryDoesNotEqualRecording: true;
    phaseSummaryDoesNotEqualApproval: true;
    phaseSummaryDoesNotEqualExecution: true;
}
export interface ControlledActionReviewDecisionPacketRecordingPhaseSummaryInput {
    phaseSummaryId: string;
    generatedAt?: string;
    phaseName: 'review_decision_packet_recording_phase';
    phaseStatus: 'ready' | 'validated' | 'handoff_ready' | 'blocked' | 'incomplete';
    baseline: {
        branch: string;
        packageVersion: string;
        currentCommit: string;
        correctedPriorCheckpoint?: string;
        parkedResidue?: string[];
    };
    completedLanes: ControlledActionRecordingPhaseLaneSummary[];
    validation: {
        buildPassed: boolean;
        validateAlphaCurrentPassed: boolean;
        validationCommands: string[];
        failedCommands: string[];
    };
    hardBoundaries: ControlledActionRecordingPhaseHardBoundaries;
    recommendedNextLane: string;
    mustPreserveBoundaries: string[];
    mustNotDoNext: string[];
    phaseNotes?: string[];
}
export interface ControlledActionReviewDecisionPacketRecordingPhaseSummary {
    phaseSummaryId: string;
    generatedAt?: string;
    phaseName: string;
    phaseStatus: string;
    phaseSummaryOnly: true;
    recordingImplemented: false;
    recordingPerformed: false;
    liveDecisionRecorded: false;
    reviewDecisionRecorded: false;
    approvalGranted: false;
    executionPerformed: false;
    fileWritten: false;
    externalTransmissionPerformed: false;
    packagePublished: false;
    baseline: {
        branch: string;
        packageVersion: string;
        currentCommit: string;
        correctedPriorCheckpoint?: string;
        parkedResidue: string[];
    };
    completedLaneCount: number;
    completedLanes: ControlledActionRecordingPhaseLaneSummary[];
    validationSummary: {
        buildPassed: boolean;
        validateAlphaCurrentPassed: boolean;
        totalValidationCommands: number;
        failedValidationCommands: number;
    };
    boundarySummary: {
        recordingBoundaryIntact: boolean;
        approvalBoundaryIntact: boolean;
        executionBoundaryIntact: boolean;
        transmissionBoundaryIntact: boolean;
        directSourceBoundaryIntact: boolean;
        automaticTakeoverBoundaryIntact: boolean;
    };
    recommendedNextLane: string;
    mustPreserveBoundaries: string[];
    mustNotDoNext: string[];
    phaseNotes: string[];
    hardBoundaries: ControlledActionRecordingPhaseHardBoundaries;
}
export declare function projectControlledActionReviewDecisionPacketRecordingPhaseSummary(input: ControlledActionReviewDecisionPacketRecordingPhaseSummaryInput): ControlledActionReviewDecisionPacketRecordingPhaseSummary;
