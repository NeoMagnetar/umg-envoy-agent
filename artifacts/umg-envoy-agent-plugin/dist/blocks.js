import { readJsonFile } from "./fs-utils.js";
export function readBlockCategoryIndex(paths) {
    return readJsonFile(paths.blockCategoryIndexPath);
}
export function readBlockLibraryIndex(paths) {
    return readJsonFile(paths.blockLibraryIndexPath);
}
