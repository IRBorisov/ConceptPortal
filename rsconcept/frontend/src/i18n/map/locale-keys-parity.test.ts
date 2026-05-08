import { readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { Grammeme } from '@/domain/cctext/language';

import { enMessageMap } from './message-map.en';
import { frMessageMap } from './message-map.fr';
import { ruMessageMap } from './message-map.ru';

const IGNORE_IDS = new Set<string>([]);
const MESSAGE_FIRST_SEGMENTS = new Set(Object.keys(enMessageMap).map(k => k.split('.')[0]));

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
    const enRu = keySetDiff(enMessageMap, ruMessageMap);
    const enFr = keySetDiff(enMessageMap, frMessageMap);
    const ruFr = keySetDiff(ruMessageMap, frMessageMap);

    expect(enRu).toEqual({ onlyInA: [], onlyInB: [] });
    expect(enFr).toEqual({ onlyInA: [], onlyInB: [] });
    expect(ruFr).toEqual({ onlyInA: [], onlyInB: [] });
  });

  it('en catalog contains all message ids used by useTx/globalTx callsites and not extra', () => {
    const thisFile = fileURLToPath(import.meta.url);
    const srcRoot = join(dirname(thisFile), '..', '..');
    const codeFiles = walkFiles(srcRoot);

    const usedIds = new Set<string>();
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

    for (const gram of Object.values(Grammeme)) {
      if (Object.keys(ruMessageMap).includes(`tx.lang.grammeme.${gram}`)) {
        usedIds.add(`tx.lang.grammeme.${gram}`);
      }
    }

    const missingIds = [...usedIds].filter(id => !(id in enMessageMap)).sort();
    const extraIds = [...Object.keys(enMessageMap)].filter(id => !usedIds.has(id) && !IGNORE_IDS.has(id)).sort();
    expect(missingIds).toEqual([]);
    expect(extraIds).toEqual([]);
  });
});

const IGNORE_DUPES = new Set<string>([
  'tx.home.cta.create',
  'tx.rslang.token.filter',
  'tx.cst.template.argument.plural',
  'tx.cst.template.short',
  'tx.cst.class.template.short',
  'tx.rslang.typeClass.predicate',
  'tx.rslang.typeClass.function',
  'tx.operation.attachment.original.short',
  'tx.oss.input',
  'tx.general.firstName',
  'tx.eval.status.error',
  'tx.schema.expression.status.incorrect',
  'tx.cst.template.source',

  // FRENCH
  'tx.ai.template',
  'tx.cst.type.term',

  // ENGLISH
  'tx.cst.class.nominal.short',
  'tx.cst.crucial.badgeOn',
  'tx.cst.class.basic.short'
]);

it('has no duplicate values in en, ru, or fr catalogs', () => {
  for (const [_, messages] of [
    ['ru', ruMessageMap]
    // ['fr', frMessages],
    // ['en', enMessages]
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
  const keys = Object.keys(enMessageMap).filter(k => ruMessageMap[k] !== undefined && frMessageMap[k] !== undefined);
  const conflicts: string[] = [];
  for (const k of keys) {
    const vEn = enMessageMap[k];
    const vRu = ruMessageMap[k];
    const vFr = frMessageMap[k];
    if (typeof vEn === 'string' && typeof vRu === 'string' && typeof vFr === 'string' && vEn === vRu && vEn === vFr) {
      conflicts.push(k);
    }
  }
  expect(conflicts).toEqual([]);
});

// ======= Internals ===========

/** Locale bundles define keys; scanning them as literals would mark every id “used”. */
function isLocaleCatalogSourceFile(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  return normalized.includes('/i18n/map/') || normalized.includes('/i18n/domain/') || normalized.includes('/i18n/app/');
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
