export type SleeveSelectionConfidence = "high" | "medium" | "low" | "none";
export type SleeveSelectionPolicy = "conservative_v0";
export interface SleeveSelectionCandidateV0 {
    sleeve_id: string;
    title?: string;
    description?: string;
    score: number;
    confidence: SleeveSelectionConfidence;
    selected: boolean;
    reasons: string[];
    warnings: string[];
    provenance: {
        source_kind?: string;
        discovery_method?: string;
        generated_from_lane?: string;
        path?: string;
    };
}
export interface ActiveSleeveSelectionV0 {
    active_sleeve: string | null;
    selection_confidence: SleeveSelectionConfidence;
    candidate_sleeves: SleeveSelectionCandidateV0[];
    selection_policy: SleeveSelectionPolicy;
    warnings: string[];
}
