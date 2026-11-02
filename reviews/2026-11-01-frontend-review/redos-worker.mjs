import { fileURLToPath, pathToFileURL } from 'node:url';

const file = fileURLToPath(
  new URL('../../rsconcept/frontend/src/services/search/text-matcher.ts', import.meta.url)
);
const { TextMatcher } = await import(pathToFileURL(file).href);
const length = Number(process.argv[2] ?? 22);
const started = Date.now();
const matched = new TextMatcher('(a+)+$').test(`${'a'.repeat(length)}b`);
console.log(JSON.stringify({ length, matched, elapsedMs: Date.now() - started }));
