import fs from "node:fs";
function cloneDoc(value) {
    return JSON.parse(JSON.stringify(value));
}
function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
}
function applyPreferredStacks(doc, preferredStacks) {
    if (preferredStacks.length === 0)
        return doc;
    const stackById = new Map(doc.stacks.map((stack) => [stack.id, stack]));
    const ordered = preferredStacks
        .map((id) => stackById.get(id))
        .filter((stack) => Boolean(stack));
    const remainder = doc.stacks.filter((stack) => !preferredStacks.includes(stack.id));
    doc.stacks = [...ordered, ...remainder];
    doc.loadedStacks = unique([
        ...preferredStacks.filter((id) => ordered.some((stack) => stack.id === id)),
        ...doc.loadedStacks
    ]);
    return doc;
}
function applyPreferredBlocks(doc, preferredBlocks) {
    if (preferredBlocks.length === 0)
        return doc;
    const preferredSet = new Set(preferredBlocks);
    doc.stacks = doc.stacks.map((stack) => {
        const orderedBlocks = [
            ...stack.blocks.filter((block) => preferredSet.has(block.id)).sort((a, b) => preferredBlocks.indexOf(a.id) - preferredBlocks.indexOf(b.id)),
            ...stack.blocks.filter((block) => !preferredSet.has(block.id))
        ];
        return { ...stack, blocks: orderedBlocks };
    });
    return doc;
}
function applyPreferredMolts(doc, preferredMolts) {
    if (preferredMolts.length === 0)
        return doc;
    const preferredSet = new Set(preferredMolts);
    doc.stacks = doc.stacks.map((stack) => ({
        ...stack,
        blocks: stack.blocks.map((block) => ({
            ...block,
            molts: [
                ...block.molts.filter((molt) => preferredSet.has(molt.id)).sort((a, b) => preferredMolts.indexOf(a.id) - preferredMolts.indexOf(b.id)),
                ...block.molts.filter((molt) => !preferredSet.has(molt.id))
            ]
        }))
    }));
    return doc;
}
function applyWinner(doc, winner) {
    if (!winner)
        return doc;
    doc.winners = [{ key: "chain", value: winner }];
    return doc;
}
function findProfile(profiles, sleeveId) {
    if (!sleeveId)
        return null;
    return profiles.profiles.find((profile) => profile.id === sleeveId) ?? null;
}
export function loadSleeveOperationalProfiles(paths) {
    const raw = fs.readFileSync(paths.sleeveOperationalProfilesPath, "utf8");
    const parsed = JSON.parse(raw);
    return {
        version: parsed.version,
        profiles: Array.isArray(parsed.profiles) ? parsed.profiles : []
    };
}
export function operationalizeSleeveRoute(params) {
    const profile = findProfile(params.profiles, params.sleeveId);
    if (!profile) {
        return {
            doc: cloneDoc(params.fallbackDoc),
            profileId: null
        };
    }
    let doc = cloneDoc(params.fallbackDoc);
    doc.sleeveId = profile.id;
    doc = applyPreferredStacks(doc, profile.preferredStacks ?? []);
    doc = applyPreferredBlocks(doc, profile.preferredBlocks ?? []);
    doc = applyPreferredMolts(doc, profile.preferredMolts ?? []);
    doc = applyWinner(doc, profile.winner);
    return {
        doc,
        profileId: profile.id
    };
}
