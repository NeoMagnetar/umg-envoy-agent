export interface RuntimeReportComponentDescriptor {
    componentName: string;
    region: 'header' | 'status_strip' | 'navigation' | 'active_route' | 'safety_evidence_chain' | 'blocked_capabilities' | 'next_safe_step' | 'panel_drawer' | 'ascii_fallback' | 'boundary_footer';
    description: string;
    requiredProps: string[];
    safetyNotes: string[];
}
export declare const runtimeReportComponentDescriptors: RuntimeReportComponentDescriptor[];
