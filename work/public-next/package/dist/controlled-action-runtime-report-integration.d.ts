export interface ControlledActionRuntimeReportInput {
    reportId: string;
    generatedAt?: string;
    runtimeContext: {
        packageVersion: string;
        branch: string;
        baselineCommit: string;
        activeSleeveId?: string;
        activeNeoStackIds?: string[];
        activeRouteId?: string;
        mode: 'read_only_report' | 'inspection' | 'debug';
    };
    route?: {
        routeId: string;
        routeClass: 'metadata_only' | 'read_only' | 'action_capable' | 'bridge_action_candidate';
        riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
        routeStatus: 'metadata_only' | 'blocked' | 'future_action_capable' | 'execution_ready_future_only' | 'incomplete';
    };
    policy: {
        policyPresent: boolean;
        requiredGates: string[];
        policyStatus: 'present' | 'missing' | 'incomplete';
    };
    readiness: {
        readinessStatus: string;
        executionEligibility: string;
        satisfiedRequirements: string[];
        missingRequirements: string[];
    };
    blocked: {
        blockedReasons: string[];
        blockedCapabilityIds: string[];
    };
    evidence: {
        auditPacketPresent: boolean;
        auditExportPresent: boolean;
        reviewBundlePresent: boolean;
        recordingMetadataPresent: boolean;
        phaseHandoffReportPresent: boolean;
        evidenceComplete: boolean;
        missingEvidenceItems: number;
    };
    review: {
        reviewDecisionPacketPresent: boolean;
        reviewDecisionProjectionPresent: boolean;
        reviewDecisionRecorded: false;
        approvalGranted: false;
    };
    recording: {
        recordingImplemented: false;
        recordingPerformed: false;
        liveDecisionRecorded: false;
        recordingStatus: string;
    };
    boundaries: {
        directSourceEnabled: false;
        automaticResponseTakeoverEnabled: false;
        fileWritten: false;
        externalTransmissionPerformed: false;
        packagePublished: false;
        openClawRestarted: false;
        executionPerformed: false;
    };
    validation: {
        buildPassed: boolean;
        validateAlphaCurrentPassed: boolean;
        smokeChainPassed: boolean;
    };
    recommendedNextLane: string;
}
export interface ControlledActionRuntimeReportNavigationItem {
    id: string;
    label: string;
    targetPanel: 'activeRoute' | 'safetyEvidenceChain' | 'blockedCapabilities' | 'readiness' | 'auditAndReview' | 'recordingMetadata' | 'hardBoundaries' | 'nextSafeStep';
    status: 'active' | 'warning' | 'blocked' | 'complete' | 'info';
}
export interface ControlledActionRuntimeReportPanelRow {
    label: string;
    value: string;
    marker: 'ok' | 'blocked' | 'warning' | 'info' | 'off';
}
export interface ControlledActionRuntimeReportPanel {
    panelId: string;
    title: string;
    status: 'active' | 'warning' | 'blocked' | 'complete' | 'info';
    rows: ControlledActionRuntimeReportPanelRow[];
}
export interface ControlledActionRuntimeReport {
    reportId: string;
    generatedAt?: string;
    runtimeReportOnly: true;
    runtimeReportDoesNotEqualExecution: true;
    executionPerformed: false;
    approvalGranted: false;
    recordingPerformed: false;
    liveDecisionRecorded: false;
    fileWritten: false;
    externalTransmissionPerformed: false;
    packagePublished: false;
    openClawRestarted: false;
    runtimeContext: {
        packageVersion: string;
        branch: string;
        baselineCommit: string;
        activeSleeveId?: string;
        activeNeoStackIds: string[];
        activeRouteId?: string;
        mode: string;
    };
    overview: {
        title: string;
        overallStatus: 'report_ready' | 'blocked' | 'metadata_only' | 'handoff_ready' | 'incomplete';
        routeStatus: string;
        riskLevel: string;
        nextSafeLane: string;
    };
    navigation: ControlledActionRuntimeReportNavigationItem[];
    panels: {
        activeRoute: ControlledActionRuntimeReportPanel;
        safetyEvidenceChain: ControlledActionRuntimeReportPanel;
        blockedCapabilities: ControlledActionRuntimeReportPanel;
        readiness: ControlledActionRuntimeReportPanel;
        auditAndReview: ControlledActionRuntimeReportPanel;
        recordingMetadata: ControlledActionRuntimeReportPanel;
        hardBoundaries: ControlledActionRuntimeReportPanel;
        nextSafeStep: ControlledActionRuntimeReportPanel;
    };
    asciiReport: string;
    hardBoundaries: {
        policyDoesNotEqualExecution: true;
        approvalDoesNotEqualExecution: true;
        checkpointDoesNotEqualExecution: true;
        dryRunDoesNotEqualExecution: true;
        decisionSimulationDoesNotEqualExecution: true;
        readinessDoesNotEqualExecution: true;
        traceReportDoesNotEqualExecution: true;
        auditPacketDoesNotEqualExecution: true;
        reviewBundleDoesNotEqualApproval: true;
        reviewBundleDoesNotEqualExecution: true;
        recordingDoesNotEqualApproval: true;
        recordingDoesNotEqualExecution: true;
        runtimeReportDoesNotEqualExecution: true;
    };
}
export declare function buildControlledActionRuntimeReportNavigation(report: Pick<ControlledActionRuntimeReport, 'panels'>): ControlledActionRuntimeReportNavigationItem[];
export declare function renderControlledActionRuntimeReportAscii(report: ControlledActionRuntimeReport): string;
export declare function projectControlledActionRuntimeReport(input: ControlledActionRuntimeReportInput): ControlledActionRuntimeReport;
