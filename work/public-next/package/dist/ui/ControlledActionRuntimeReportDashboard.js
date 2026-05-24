import { runtimeReportComponentDescriptors } from './runtime-report-components.js';
const allowedPanels = [
    'overview',
    'active_route',
    'safety_evidence_chain',
    'blocked_capabilities',
    'readiness',
    'audit_and_review',
    'recording_metadata',
    'hard_boundaries',
    'next_safe_step',
];
function normalizeSelectedPanel(panel) {
    return panel && allowedPanels.includes(panel) ? panel : 'overview';
}
export function buildControlledActionRuntimeReportDashboardRenderModel(props) {
    const displayMode = props.displayMode ?? 'full';
    const normalizedPanel = normalizeSelectedPanel(props.selectedPanel);
    const invalidPanelNotice = props.selectedPanel && !allowedPanels.includes(props.selectedPanel)
        ? {
            requestedPanel: props.selectedPanel,
            fallbackPanel: 'overview',
            allowedPanels,
        }
        : undefined;
    return {
        topLevelComponent: 'ControlledActionRuntimeReportDashboard',
        displayMode,
        selectedPanel: normalizedPanel,
        regions: runtimeReportComponentDescriptors,
        report: {
            ...props.report,
            approvalGranted: false,
            executionPerformed: false,
            recordingPerformed: false,
            liveDecisionRecorded: false,
        },
        invalidPanelNotice,
    };
}
