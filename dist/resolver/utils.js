export function stripBom(raw) {
    return raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
}
export function readJsonLoose(raw) {
    return JSON.parse(stripBom(raw));
}
