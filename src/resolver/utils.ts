export function stripBom(raw: string): string {
  return raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
}

export function readJsonLoose(raw: string) {
  return JSON.parse(stripBom(raw));
}
