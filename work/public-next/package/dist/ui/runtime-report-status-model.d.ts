export type RuntimeReportStatus = "complete" | "warning" | "blocked" | "off" | "info";
export type RuntimeReportMarker = "✓" | "!" | "✗" | "OFF" | "i";
export interface RuntimeReportStatusPresentation {
    status: RuntimeReportStatus;
    marker: RuntimeReportMarker;
    label: string;
    colorSemantic: "green" | "yellow" | "red" | "gray" | "blue" | "purple" | "orange";
}
export declare function getRuntimeReportStatusPresentation(status: RuntimeReportStatus): RuntimeReportStatusPresentation;
