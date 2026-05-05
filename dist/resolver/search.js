export function searchRegistry(artifacts, query) {
    const text = (query.text ?? "").trim().toLowerCase();
    const limit = query.limit ?? 20;
    return artifacts
        .map((artifact) => {
        let score = 0;
        const reasons = [];
        if (query.kinds?.includes(artifact.kind)) {
            score += 20;
            reasons.push(`kind:${artifact.kind}`);
        }
        for (const domain of query.domains ?? []) {
            if (artifact.domains.includes(domain)) {
                score += 15;
                reasons.push(`domain:${domain}`);
            }
        }
        for (const capability of query.capabilities ?? []) {
            if (artifact.capabilities.includes(capability)) {
                score += 18;
                reasons.push(`capability:${capability}`);
            }
        }
        for (const tag of query.tags ?? []) {
            if (artifact.tags.includes(tag)) {
                score += 8;
                reasons.push(`tag:${tag}`);
            }
        }
        if (query.status?.includes(artifact.status)) {
            score += 5;
            reasons.push(`status:${artifact.status}`);
        }
        if (text) {
            const haystack = [artifact.id, artifact.title ?? "", artifact.description ?? "", artifact.tags.join(" "), artifact.domains.join(" "), artifact.capabilities.join(" ")].join("\n").toLowerCase();
            for (const term of text.split(/\s+/).filter(Boolean)) {
                if (haystack.includes(term)) {
                    score += 3;
                    reasons.push(`text:${term}`);
                }
            }
        }
        if (artifact.source.source_kind === "human_readable") {
            score -= 5;
            reasons.push("penalty:human_non_canonical");
        }
        return { artifact, score, reasons };
    })
        .filter((hit) => hit.score > 0 || (!text && !query.kinds && !query.domains && !query.capabilities && !query.tags && !query.status))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}
