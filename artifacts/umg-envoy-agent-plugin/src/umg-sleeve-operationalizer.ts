import fs from "node:fs";
import type { UMGPathDocument } from "./umg-path-types.js";
import type { ResolvedPaths } from "./types.js";

export interface SleeveOperationalProfile {
  id: string;
  preferredStacks?: string[];
  preferredBlocks?: string[];
  preferredMolts?: string[];
  winner?: string;
  fallbackToSharedModulation?: boolean;
}

export interface SleeveOperationalProfilesFile {
  version?: string;
  profiles: SleeveOperationalProfile[];
}

export interface OperationalizeSleeveRouteParams {
  inputText: string;
  sleeveId?: string;
  fallbackDoc: UMGPathDocument;
  profiles: SleeveOperationalProfilesFile;
}

export interface OperationalizeSleeveRouteResult {
  doc: UMGPathDocument;
  profileId: string | null;
}

function cloneDoc<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function applyPreferredStacks(doc: UMGPathDocument, preferredStacks: string[]): UMGPathDocument {
  if (preferredStacks.length === 0) return doc;

  const stackById = new Map(doc.stacks.map((stack) => [stack.id, stack]));
  const ordered = preferredStacks
    .map((id) => stackById.get(id))
    .filter((stack): stack is NonNullable<typeof stack> => Boolean(stack));

  const remainder = doc.stacks.filter((stack) => !preferredStacks.includes(stack.id));
  doc.stacks = [...ordered, ...remainder];
  doc.loadedStacks = unique([
    ...preferredStacks.filter((id) => ordered.some((stack) => stack.id === id)),
    ...doc.loadedStacks
  ]);
  return doc;
}

function applyPreferredBlocks(doc: UMGPathDocument, preferredBlocks: string[]): UMGPathDocument {
  if (preferredBlocks.length === 0) return doc;
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

function applyPreferredMolts(doc: UMGPathDocument, preferredMolts: string[]): UMGPathDocument {
  if (preferredMolts.length === 0) return doc;
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

function applyWinner(doc: UMGPathDocument, winner: string | undefined): UMGPathDocument {
  if (!winner) return doc;
  doc.winners = [{ key: "chain", value: winner }];
  return doc;
}

function findProfile(profiles: SleeveOperationalProfilesFile, sleeveId?: string): SleeveOperationalProfile | null {
  if (!sleeveId) return null;
  return profiles.profiles.find((profile) => profile.id === sleeveId) ?? null;
}

export function loadSleeveOperationalProfiles(paths: ResolvedPaths): SleeveOperationalProfilesFile {
  const raw = fs.readFileSync(paths.sleeveOperationalProfilesPath, "utf8");
  const parsed = JSON.parse(raw) as SleeveOperationalProfilesFile;

  return {
    version: parsed.version,
    profiles: Array.isArray(parsed.profiles) ? parsed.profiles : []
  };
}

export function operationalizeSleeveRoute(params: OperationalizeSleeveRouteParams): OperationalizeSleeveRouteResult {
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
