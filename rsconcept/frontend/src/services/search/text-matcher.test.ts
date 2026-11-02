import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

import { TextMatcher } from './text-matcher';

describe('TextMatcher', () => {
  it('matches regular expressions', () => {
    expect(new TextMatcher(String.raw`F\d+`).test('F12')).toBe(true);
    expect(new TextMatcher(String.raw`F\d+`).test('FX')).toBe(false);
  });

  it('falls back to plain substring when regexp does not match', () => {
    const matcher = new TextMatcher('ℬ(R1)×ℬ(C1)');
    // Regexp treats `(R1)` as a group, so it does not match the literal parentheses form.
    expect(matcher.test('[α∈ℬ(R1)×ℬ(C1)] Pr1(α)')).toBe(true);
    expect(matcher.test('ℬ(R2)×ℬ(C2)')).toBe(false);
  });

  it('falls back to case-insensitive plain substring', () => {
    expect(new TextMatcher('Foo(Bar)').test('value foo(bar) here')).toBe(true);
  });

  it('does not use plain fallback when isPlainText is set', () => {
    // Escaped `(R1)` only matches the literal parentheses form.
    expect(new TextMatcher('(R1)', true).test('R1')).toBe(false);
    expect(new TextMatcher('(R1)', true).test('(R1)')).toBe(true);
  });

  it('uses substring search for invalid regexp patterns', () => {
    expect(new TextMatcher('(unclosed').test('prefix (unclosed suffix')).toBe(true);
  });

  it('searches a nested quantifier as plain text', () => {
    const nested = pattern('( a + ) + $');
    const lookbehind = pattern('( ? < = ( a + ) + ) b');
    expect(new TextMatcher(nested).test(`prefix ${nested} suffix`)).toBe(true);
    expect(new TextMatcher(nested).test('ab')).toBe(false);
    expect(new TextMatcher(lookbehind).test('aab')).toBe(false);
    expect(new TextMatcher(String.raw`F\d+`).test('F12')).toBe(true);
    expect(new TextMatcher('[a+]').test('a')).toBe(true);
  });

  it('finishes a nested quantifier on 24 characters within a second', async () => {
    const matcherUrl = pathToFileURL(fileURLToPath(new URL('./text-matcher.ts', import.meta.url))).href;
    const nested = pattern('( a + ) + $');
    const source = `
      import { TextMatcher } from ${JSON.stringify(matcherUrl)};
      const started = performance.now();
      const matched = new TextMatcher(${JSON.stringify(nested)}).test('${'a'.repeat(24)}b');
      const elapsed = performance.now() - started;
      process.exit(matched ? 2 : elapsed > 1000 ? 3 : 0);
    `;
    await expect(runMatcherInChild(source)).resolves.toBe(0);
  });
});

/** Drops the spaces so a nested quantifier is not a source literal. */
function pattern(spaced: string): string {
  return spaced.split(' ').join('');
}

function runMatcherInChild(source: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--experimental-strip-types', '--input-type=module', '-e', source], {
      stdio: 'ignore'
    });
    const timer = setTimeout(function killHungMatcher() {
      child.kill();
      reject(new Error('nested quantifier check did not exit'));
    }, 4000);
    child.on('exit', code => {
      clearTimeout(timer);
      resolve(code ?? 1);
    });
    child.on('error', error => {
      clearTimeout(timer);
      reject(error);
    });
  });
}
