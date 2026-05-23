function markerSymbol(marker) {
    switch (marker) {
        case 'ok':
            return '✓';
        case 'warning':
            return '!';
        case 'blocked':
            return '✗';
        case 'off':
            return '✗';
        default:
            return 'i';
    }
}
function panelStatusFromRows(rows) {
    if (rows.some((row) => row.marker === 'blocked'))
        return 'blocked';
    if (rows.some((row) => row.marker === 'warning'))
        return 'warning';
    if (rows.some((row) => row.marker === 'ok'))
        return 'complete';
    return 'info';
}
function padRight(value, width) {
    if (value.length >= width)
        return value.slice(0, width);
    return value + ' '.repeat(width - value.length);
}
function box(title, lines, width = 70) {
    const innerWidth = width - 4;
    const top = `┌${'─'.repeat(width - 2)}┐`;
    const titleLine = `│ ${padRight(title, innerWidth)} │`;
    const body = lines.map((line) => `│ ${padRight(line, innerWidth)} │`).join('\n');
    const bottom = `└${'─'.repeat(width - 2)}┘`;
    return [top, titleLine, body, bottom].join('\n');
}
function buildEvidenceRows(input) {
    const complete = (present) => (present ? 'ok' : 'warning');
    return [
        { label: 'policy projection', value: input.policy.policyPresent ? 'present' : 'missing', marker: complete(input.policy.policyPresent) },
        { label: 'approval/checkpoint metadata', value: input.review.reviewDecisionProjectionPresent ? 'present' : 'missing', marker: complete(input.review.reviewDecisionProjectionPresent) },
        { label: 'decision simulation', value: 'present', marker: 'ok' },
        { label: 'dry-run projection', value: 'present', marker: 'ok' },
        { label: 'blocked route summary', value: 'present', marker: 'ok' },
        { label: 'readiness matrix', value: 'present', marker: 'ok' },
        { label: 'policy trace/report', value: 'present', marker: 'ok' },
        { label: 'audit packet', value: input.evidence.auditPacketPresent ? 'present' : 'missing', marker: complete(input.evidence.auditPacketPresent) },
        { label: 'review bundle', value: input.evidence.reviewBundlePresent ? 'present' : 'missing', marker: complete(input.evidence.reviewBundlePresent) },
        { label: 'recording metadata', value: input.evidence.recordingMetadataPresent ? 'present' : 'missing', marker: complete(input.evidence.recordingMetadataPresent) },
        { label: 'phase handoff report', value: input.evidence.phaseHandoffReportPresent ? 'present' : 'missing', marker: complete(input.evidence.phaseHandoffReportPresent) },
    ];
}
export function buildControlledActionRuntimeReportNavigation(report) {
    return [
        { id: 'overview', label: 'Overview', targetPanel: 'activeRoute', status: 'info' },
        { id: 'active_route', label: 'Active Route', targetPanel: 'activeRoute', status: report.panels.activeRoute.status },
        { id: 'safety_evidence_chain', label: 'Safety Evidence Chain', targetPanel: 'safetyEvidenceChain', status: report.panels.safetyEvidenceChain.status },
        { id: 'blocked_capabilities', label: 'Blocked Capabilities', targetPanel: 'blockedCapabilities', status: report.panels.blockedCapabilities.status },
        { id: 'readiness', label: 'Readiness', targetPanel: 'readiness', status: report.panels.readiness.status },
        { id: 'audit_and_review', label: 'Audit and Review', targetPanel: 'auditAndReview', status: report.panels.auditAndReview.status },
        { id: 'recording_metadata', label: 'Recording Metadata', targetPanel: 'recordingMetadata', status: report.panels.recordingMetadata.status },
        { id: 'hard_boundaries', label: 'Hard Boundaries', targetPanel: 'hardBoundaries', status: report.panels.hardBoundaries.status },
        { id: 'next_safe_step', label: 'Next Safe Step', targetPanel: 'nextSafeStep', status: report.panels.nextSafeStep.status },
    ];
}
export function renderControlledActionRuntimeReportAscii(report) {
    const activeRouteLines = report.panels.activeRoute.rows.map((row) => `${row.label}: ${row.value}`);
    const evidenceLines = report.panels.safetyEvidenceChain.rows.map((row) => `${row.label} ${markerSymbol(row.marker)}`);
    const blockedLines = report.panels.blockedCapabilities.rows.map((row) => `${row.label} ${markerSymbol(row.marker)}`);
    const blockedReasons = report.panels.readiness.rows.filter((row) => row.marker !== 'ok').map((row) => `- ${row.label}: ${row.value}`);
    const nextLines = report.panels.nextSafeStep.rows.map((row) => row.value);
    return [
        box('UMG ENVOY RUNTIME REPORT', [
            `Mode: ${String(report.runtimeContext.mode).toUpperCase()} | Approval: FALSE | Execution: FALSE`,
            `Route Status: ${report.overview.routeStatus} | Risk: ${report.overview.riskLevel}`,
        ]),
        box('ACTIVE ROUTE', activeRouteLines),
        box('SAFETY EVIDENCE CHAIN', evidenceLines),
        box('BLOCKED CAPABILITIES', blockedLines),
        box('WHY BLOCKED / MISSING', blockedReasons.length ? blockedReasons : ['- no missing evidence or blocked reasons reported']),
        box('NEXT SAFE STEP', nextLines),
    ].join('\n\n');
}
export function projectControlledActionRuntimeReport(input) {
    const route = input.route ?? {
        routeId: 'n/a',
        routeClass: 'metadata_only',
        riskLevel: 'none',
        routeStatus: 'incomplete',
    };
    const activeRouteRows = [
        { label: 'routeId', value: route.routeId, marker: route.routeStatus === 'blocked' ? 'blocked' : 'info' },
        { label: 'routeClass', value: route.routeClass, marker: 'info' },
        { label: 'riskLevel', value: route.riskLevel, marker: route.riskLevel === 'high' || route.riskLevel === 'critical' ? 'warning' : 'info' },
        { label: 'routeStatus', value: route.routeStatus, marker: route.routeStatus === 'blocked' || route.routeStatus === 'incomplete' ? 'blocked' : 'info' },
    ];
    const evidenceRows = buildEvidenceRows(input);
    const blockedCapabilities = [
        'execute_action',
        'write_actions',
        'bridge_actions',
        'direct_source',
        'automatic_response_takeover',
        'package_publish',
        'openclaw_restart',
        'block_library_mutation',
        'resleever_touch',
    ].map((label) => ({ label, value: 'blocked', marker: 'blocked' }));
    const readinessRows = [
        { label: 'readinessStatus', value: input.readiness.readinessStatus, marker: input.evidence.evidenceComplete ? 'ok' : 'warning' },
        { label: 'executionEligibility', value: input.readiness.executionEligibility, marker: 'blocked' },
        ...input.blocked.blockedReasons.map((reason) => ({ label: 'blockedReason', value: reason, marker: 'blocked' })),
        ...(input.evidence.missingEvidenceItems > 0
            ? [{ label: 'missingEvidenceItems', value: String(input.evidence.missingEvidenceItems), marker: 'warning' }]
            : []),
    ];
    const auditRows = [
        { label: 'auditPacketPresent', value: String(input.evidence.auditPacketPresent), marker: input.evidence.auditPacketPresent ? 'ok' : 'warning' },
        { label: 'auditExportPresent', value: String(input.evidence.auditExportPresent), marker: input.evidence.auditExportPresent ? 'ok' : 'warning' },
        { label: 'reviewBundlePresent', value: String(input.evidence.reviewBundlePresent), marker: input.evidence.reviewBundlePresent ? 'ok' : 'warning' },
        { label: 'reviewDecisionPacketPresent', value: String(input.review.reviewDecisionPacketPresent), marker: input.review.reviewDecisionPacketPresent ? 'ok' : 'warning' },
        { label: 'reviewDecisionProjectionPresent', value: String(input.review.reviewDecisionProjectionPresent), marker: input.review.reviewDecisionProjectionPresent ? 'ok' : 'warning' },
        { label: 'reviewDecisionRecorded', value: String(input.review.reviewDecisionRecorded), marker: 'off' },
    ];
    const recordingRows = [
        { label: 'recordingImplemented', value: String(input.recording.recordingImplemented), marker: 'off' },
        { label: 'recordingPerformed', value: String(input.recording.recordingPerformed), marker: 'off' },
        { label: 'liveDecisionRecorded', value: String(input.recording.liveDecisionRecorded), marker: 'off' },
        { label: 'recordingStatus', value: input.recording.recordingStatus, marker: input.evidence.recordingMetadataPresent ? 'ok' : 'warning' },
    ];
    const hardBoundaryRows = [
        { label: 'direct_source', value: String(input.boundaries.directSourceEnabled), marker: 'off' },
        { label: 'automatic_response_takeover', value: String(input.boundaries.automaticResponseTakeoverEnabled), marker: 'off' },
        { label: 'fileWritten', value: String(input.boundaries.fileWritten), marker: 'off' },
        { label: 'externalTransmissionPerformed', value: String(input.boundaries.externalTransmissionPerformed), marker: 'off' },
        { label: 'packagePublished', value: String(input.boundaries.packagePublished), marker: 'off' },
        { label: 'openClawRestarted', value: String(input.boundaries.openClawRestarted), marker: 'off' },
        { label: 'executionPerformed', value: String(input.boundaries.executionPerformed), marker: 'off' },
    ];
    const nextRows = [
        { label: 'nextSafeLane', value: input.recommendedNextLane, marker: 'info' },
        { label: 'boundaryNote', value: 'Tool surface design is next only after this integrated report passes validation.', marker: 'info' },
        { label: 'safetyNote', value: 'No approval. No execution. No live recording.', marker: 'info' },
    ];
    const panels = {
        activeRoute: { panelId: 'active_route', title: 'ACTIVE ROUTE', status: panelStatusFromRows(activeRouteRows), rows: activeRouteRows },
        safetyEvidenceChain: { panelId: 'safety_evidence_chain', title: 'SAFETY EVIDENCE CHAIN', status: panelStatusFromRows(evidenceRows), rows: evidenceRows },
        blockedCapabilities: { panelId: 'blocked_capabilities', title: 'BLOCKED CAPABILITIES', status: 'blocked', rows: blockedCapabilities },
        readiness: { panelId: 'readiness', title: 'READINESS', status: panelStatusFromRows(readinessRows), rows: readinessRows },
        auditAndReview: { panelId: 'audit_and_review', title: 'AUDIT AND REVIEW', status: panelStatusFromRows(auditRows), rows: auditRows },
        recordingMetadata: { panelId: 'recording_metadata', title: 'RECORDING METADATA', status: panelStatusFromRows(recordingRows), rows: recordingRows },
        hardBoundaries: { panelId: 'hard_boundaries', title: 'HARD BOUNDARIES', status: 'blocked', rows: hardBoundaryRows },
        nextSafeStep: { panelId: 'next_safe_step', title: 'NEXT SAFE STEP', status: 'info', rows: nextRows },
    };
    const overallStatus = route.routeStatus === 'incomplete'
        ? 'incomplete'
        : route.routeStatus === 'metadata_only'
            ? 'metadata_only'
            : input.evidence.phaseHandoffReportPresent
                ? 'handoff_ready'
                : 'blocked';
    const reportBase = {
        reportId: input.reportId,
        generatedAt: input.generatedAt,
        runtimeReportOnly: true,
        runtimeReportDoesNotEqualExecution: true,
        executionPerformed: false,
        approvalGranted: false,
        recordingPerformed: false,
        liveDecisionRecorded: false,
        fileWritten: false,
        externalTransmissionPerformed: false,
        packagePublished: false,
        openClawRestarted: false,
        runtimeContext: {
            packageVersion: input.runtimeContext.packageVersion,
            branch: input.runtimeContext.branch,
            baselineCommit: input.runtimeContext.baselineCommit,
            activeSleeveId: input.runtimeContext.activeSleeveId,
            activeNeoStackIds: input.runtimeContext.activeNeoStackIds ?? [],
            activeRouteId: input.runtimeContext.activeRouteId,
            mode: input.runtimeContext.mode,
        },
        overview: {
            title: 'UMG ENVOY RUNTIME REPORT',
            overallStatus,
            routeStatus: route.routeStatus,
            riskLevel: route.riskLevel,
            nextSafeLane: input.recommendedNextLane || 'ALPHA9_CONTROLLED_ACTION_EXECUTION_RUNTIME_REPORT_TOOL_SURFACE_DESIGN_SOURCE',
        },
        panels,
        hardBoundaries: {
            policyDoesNotEqualExecution: true,
            approvalDoesNotEqualExecution: true,
            checkpointDoesNotEqualExecution: true,
            dryRunDoesNotEqualExecution: true,
            decisionSimulationDoesNotEqualExecution: true,
            readinessDoesNotEqualExecution: true,
            traceReportDoesNotEqualExecution: true,
            auditPacketDoesNotEqualExecution: true,
            reviewBundleDoesNotEqualApproval: true,
            reviewBundleDoesNotEqualExecution: true,
            recordingDoesNotEqualApproval: true,
            recordingDoesNotEqualExecution: true,
            runtimeReportDoesNotEqualExecution: true,
        },
    };
    const report = {
        ...reportBase,
        navigation: buildControlledActionRuntimeReportNavigation({ panels }),
        asciiReport: '',
    };
    report.asciiReport = renderControlledActionRuntimeReportAscii(report);
    return report;
}
