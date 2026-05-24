import { type RuntimeReportComponentDescriptor } from './runtime-report-components.js';
import type { ControlledActionRuntimeReportViewModel, RuntimeReportPanelId } from './runtime-report-view-model.js';
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
export declare function buildControlledActionRuntimeReportDashboardRenderModel(props: ControlledActionRuntimeReportDashboardProps): ControlledActionRuntimeReportDashboardRenderModel;
