import { loadBlocks, loadSleeves, publicContentRoot } from "./content-loader.js";

export function getCompilerMatrixStatus(metaUrl = import.meta.url) {
  const root = publicContentRoot(metaUrl);
  const sleeves = loadSleeves(root);
  const blocks = loadBlocks(root);
  return {
    ok: true,
    compilerAdapter: "available",
    contentMode: "bundled-public",
    compilerMode: "bundled-adapter",
    sampleSleeves: sleeves.length,
    sampleBlocks: blocks.length,
    blockKinds: Array.from(new Set(blocks.map((block) => block.kind))).sort()
  };
}
