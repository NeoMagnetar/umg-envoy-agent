import { runtimeReportComponentDescriptors, type RuntimeReportComponentDescriptor } from './runtime-report-components.js';
import type {
  ControlledActionRuntimeReportViewModel,
  RuntimeReportPanelId,
} from './runtime-report-view-model.js';

export interface ControlledActionRuntimeReportDashboardProps {
  report: ControlledActionRuntimeReportViewModel;
  selectedPanel?: RuntimeReportPanelId;
  displayMode?: 'full' | 'compact' | 'ascii_fallback';
  showAsciiFallback?: boolean;
}

export interface ControlledActionRuntimeReportDashboardRenderModel {
  topLevelComponent: 'ControlledActionRuntimeReportDashboard';
  displayMode: 'full' | 'compact' | 'ascii_fallback';
  selectedPanel: RuntimeReportPanelId;
  regions: RuntimeReportComponentDescriptor[];
  report: ControlledActionRuntimeReportViewModel;
  invalidPanelNotice?: {
    requestedPanel: string;
    fallbackPanel: RuntimeReportPanelId;
    allowedPanels: RuntimeReportPanelId[];
  };
}

const allowedPanels: RuntimeReportPanelId[] = [
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

function normalizeSelectedPanel(panel?: RuntimeReportPanelId): RuntimeReportPanelId {
  return panel && allowedPanels.includes(panel) ? panel : 'overview';
}

export function buildControlledActionRuntimeReportDashboardRenderModel(
  props: ControlledActionRuntimeReportDashboardProps,
): ControlledActionRuntimeReportDashboardRenderModel {
  const displayMode = props.displayMode ?? 'full';
  const normalizedPanel = normalizeSelectedPanel(props.selectedPanel);
  const invalidPanelNotice = props.selectedPanel && !allowedPanels.includes(props.selectedPanel)
    ? {
        requestedPanel: props.selectedPanel,
        fallbackPanel: 'overview' as const,
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
