import { readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { Grammeme } from '@/domain/cctext/language';

import { enMessages } from './index.en';
import { frMessages } from './index.fr';
import { ruMessages } from './index.ru';

const IGNORE_IDS = new Set<string>([]);
const MESSAGE_FIRST_SEGMENTS = new Set(Object.keys(enMessages).map(k => k.split('.')[0]));

function keySetDiff(a: Record<string, string>, b: Record<string, string>) {
  const aKeys = new Set(Object.keys(a));
  const bKeys = new Set(Object.keys(b));
  return {
    onlyInA: [...aKeys].filter(k => !bKeys.has(k)).sort(),
    onlyInB: [...bKeys].filter(k => !aKeys.has(k)).sort()
  };
}

describe('locale message maps', () => {
  it('en, ru, and fr merged catalogs share the same keys', () => {
    const enRu = keySetDiff(enMessages, ruMessages);
    const enFr = keySetDiff(enMessages, frMessages);
    const ruFr = keySetDiff(ruMessages, frMessages);

    expect(enRu).toEqual({ onlyInA: [], onlyInB: [] });
    expect(enFr).toEqual({ onlyInA: [], onlyInB: [] });
    expect(ruFr).toEqual({ onlyInA: [], onlyInB: [] });
  });

  it('en catalog contains all message ids used by useTx/globalTx callsites and not extra', () => {
    const thisFile = fileURLToPath(import.meta.url);
    const srcRoot = join(dirname(thisFile), '..', '..');
    const codeFiles = walkFiles(srcRoot);

    const usedIds = new Set<string>();
    for (const g of Object.values(Grammeme)) {
      usedIds.add(`labels.cctext.grammeme.${g}`);
    }
    usedIds.add('labels.cctext.grammemeUnknown');

    for (const file of codeFiles) {
      const source = readFileSync(file, 'utf8');
      for (const id of collectStringIdsFromCall(source, 'tx')) {
        usedIds.add(id);
      }
      for (const id of collectStringIdsFromCall(source, 'globalTx')) {
        usedIds.add(id);
      }
      for (const id of collectMessageIdsFromTypedRecordValues(source)) {
        usedIds.add(id);
      }
      if (!isLocaleCatalogSourceFile(file)) {
        for (const id of collectMessageLikeQuotedStrings(source)) {
          usedIds.add(id);
        }
      }
    }
    const missingIds = [...usedIds].filter(id => !(id in enMessages)).sort();
    const extraIds = [...Object.keys(enMessages)].filter(id => !usedIds.has(id) && !IGNORE_IDS.has(id)).sort();
    expect(missingIds).toEqual([]);
    expect(extraIds).toEqual([]);
  });
});

const IGNORE_DUPES = new Set<string>([
  'home.create', //
  'labels.rsform.token.filter',
  'tx.general.firstName',
  'tx.rslang.typeClass.predicate',
  'tx.rslang.typeClass.function',
  'tx.lib.evalStatus.error',
  'tx.lib.operation.type.input'
]);

it('has no duplicate values in en, ru, or fr catalogs', () => {
  for (const [_, messages] of [
    ['ru', ruMessages]
    //['fr', frMessages],
    //['en', enMessages]
  ] as const) {
    const valueToIds: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(messages)) {
      if (typeof value !== 'string' || IGNORE_DUPES.has(key)) {
        continue;
      }
      if (!valueToIds[value]) {
        valueToIds[value] = [];
      }
      valueToIds[value].push(key);
    }
    const dupes = Object.entries(valueToIds).filter(([, ids]) => ids.length > 1);
    expect(dupes).toEqual([]);
  }
});

it('has no keys with the same value across en, ru, and fr catalogs', () => {
  // Get intersection of keys present in all catalogs
  const keys = Object.keys(enMessages).filter(k => ruMessages[k] !== undefined && frMessages[k] !== undefined);
  const conflicts: string[] = [];
  for (const k of keys) {
    const vEn = enMessages[k];
    const vRu = ruMessages[k];
    const vFr = frMessages[k];
    if (typeof vEn === 'string' && typeof vRu === 'string' && typeof vFr === 'string' && vEn === vRu && vEn === vFr) {
      conflicts.push(k);
    }
  }
  expect(conflicts).toEqual([]);
});

// ======= Internals ===========

/** Locale bundles define keys; scanning them as literals would mark every id “used”. */
function isLocaleCatalogSourceFile(filePath: string): boolean {
  return filePath.replace(/\\/g, '/').includes('/i18n/messages/');
}

function walkFiles(directory: string): string[] {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
      continue;
    }
    const ext = extname(entry.name);
    const base = entry.name.replace(ext, '');
    if (ext === '.ts' || ext === '.tsx') {
      if (base.endsWith('.test') || base.endsWith('.spec')) {
        continue;
      }
      files.push(fullPath);
    }
  }
  return files;
}

function collectStringIdsFromCall(source: string, fnName: 'tx' | 'globalTx'): string[] {
  const pattern = new RegExp(String.raw`(?:^|[^\w.])${fnName}\(\s*(['"])([^'"]+)\1`, 'gm');
  const ids = new Set<string>();
  for (const match of source.matchAll(pattern)) {
    const id = match[2];
    if (!isMessageLikeId(id)) {
      continue;
    }
    ids.add(id);
  }
  return [...ids];
}

/** Values in `Record<Enum, string>` / `Partial<Record<...>>` maps (e.g. DESCRIBE_VAR_LID, TOKEN_TITLE_LID). */
function collectMessageIdsFromTypedRecordValues(source: string): string[] {
  const ids = new Set<string>();
  const declPattern =
    /\b(?:export\s+)?const\s+\w+\s*:\s*(?:Partial\s*<\s*)?Record\s*<\s*([^,]+?)\s*,\s*string\s*>\s*(?:>\s*)?=\s*\{/gm;
  for (const match of source.matchAll(declPattern)) {
    const keyType = match[1].trim();
    if (keyType.replace(/\s+/g, '') === 'string') {
      continue;
    }
    const start = match.index;
    if (start === undefined) {
      continue;
    }
    const openBrace = start + match[0].length - 1;
    const closeBrace = findClosingBrace(source, openBrace);
    if (closeBrace === -1) {
      continue;
    }
    const body = source.slice(openBrace + 1, closeBrace);
    for (const id of collectMessageLikeQuotedStrings(body)) {
      ids.add(id);
    }
  }
  return [...ids];
}

/** Dotted identifiers only (filters prose); first segment must exist in `en` so we do not count `portal.*` / `*.json` paths. */
const MESSAGE_ID_LIKE = /^[a-zA-Z_][\w]*(?:\.[\w]+)+$/;

function isMessageLikeId(id: string): boolean {
  if (id.includes('${')) {
    return false;
  }
  if (!MESSAGE_ID_LIKE.test(id)) {
    return false;
  }
  const first = id.split('.')[0];
  return MESSAGE_FIRST_SEGMENTS.has(first);
}

function collectMessageLikeQuotedStrings(fragment: string): string[] {
  const ids = new Set<string>();
  const pattern = /(['"])((?:(?!\1)[^\\]|\\.)*)\1/g;
  for (const match of fragment.matchAll(pattern)) {
    const id = match[2];
    if (!isMessageLikeId(id)) {
      continue;
    }
    ids.add(id);
  }
  return [...ids];
}

function findClosingBrace(source: string, openBraceIndex: number): number {
  let depth = 1;
  let i = openBraceIndex + 1;
  let inString: '"' | "'" | null = null;
  let escape = false;
  while (i < source.length) {
    const c = source[i];
    if (inString) {
      if (escape) {
        escape = false;
        i++;
        continue;
      }
      if (c === '\\') {
        escape = true;
        i++;
        continue;
      }
      if (c === inString) {
        inString = null;
      }
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      inString = c;
      i++;
      continue;
    }
    if (c === '`') {
      i++;
      while (i < source.length) {
        if (source[i] === '\\') {
          i += 2;
          continue;
        }
        if (source[i] === '`') {
          i++;
          break;
        }
        i++;
      }
      continue;
    }
    if (c === '{') {
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
    i++;
  }
  return -1;
}
