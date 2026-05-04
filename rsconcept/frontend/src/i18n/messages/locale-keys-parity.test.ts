import { readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { enMessages } from './en';
import { frMessages } from './fr';
import { ruMessages } from './ru';

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

  it('en catalog contains all message ids used by useTx/globalTx callsites', () => {
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
    }
    const missingIds = [...usedIds].filter(id => !(id in enMessages)).sort();
    expect(missingIds).toEqual([]);
  });
});

// ======= Internals ===========

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
    if (ext === '.ts' || ext === '.tsx') {
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
    if (id.includes('${')) {
      continue;
    }
    if (!id.includes('.')) {
      continue;
    }
    ids.add(id);
  }
  return [...ids];
}
