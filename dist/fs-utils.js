import fs from "node:fs";
function stripBom(text) {
    return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}
export function readJsonFile(filePath) {
    return JSON.parse(stripBom(fs.readFileSync(filePath, "utf8")));
}
export function fileExists(filePath) {
    return fs.existsSync(filePath);
}
export function readTextFile(filePath) {
    return fs.readFileSync(filePath, "utf8");
}
