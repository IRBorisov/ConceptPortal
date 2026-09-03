import { describe, expect, it } from 'vitest';

import { limits } from './constants';
import { assertImportFileSize, convertToCSV, neutralizeCsvFormula } from './utils';

describe('neutralizeCsvFormula', () => {
  it('prefixes spreadsheet formula triggers with an apostrophe', () => {
    expect(neutralizeCsvFormula('=HYPERLINK("http://evil","x")')).toBe(`'=HYPERLINK("http://evil","x")`);
    expect(neutralizeCsvFormula('+CMD|calc!A0')).toBe(`'+CMD|calc!A0`);
    expect(neutralizeCsvFormula('-1+1')).toBe(`'-1+1`);
    expect(neutralizeCsvFormula('@SUM(A1:A2)')).toBe(`'@SUM(A1:A2)`);
    expect(neutralizeCsvFormula('\tcmd')).toBe(`'\tcmd`);
    expect(neutralizeCsvFormula('\rcmd')).toBe(`'\rcmd`);
  });

  it('leaves ordinary text untouched', () => {
    expect(neutralizeCsvFormula('Term 1')).toBe('Term 1');
    expect(neutralizeCsvFormula('')).toBe('');
    expect(neutralizeCsvFormula('a = b')).toBe('a = b');
  });
});

describe('convertToCSV', () => {
  it('neutralizes user strings but not numeric cells', async () => {
    const blob = convertToCSV([{ title: '=1+1', count: -5, note: 'ok' }]);
    const text = await blob.text();
    expect(text).toBe(`title,count,note\n'=1+1,-5,ok`);
  });

  it('quotes cells after neutralizing', async () => {
    const blob = convertToCSV([{ title: '=HYPERLINK("x")' }]);
    const text = await blob.text();
    expect(text).toBe(`title\n"'=HYPERLINK(""x"")"`);
  });
});

describe('assertImportFileSize', () => {
  it('accepts files within the limit', () => {
    const file = new File(['{}'], 'small.json');
    expect(() => assertImportFileSize(file)).not.toThrow();
  });

  it('rejects files over the limit before they are read', () => {
    const oversized = { size: limits.max_json_import_file_size_bytes + 1 } as File;
    expect(() => assertImportFileSize(oversized)).toThrow();
  });
});
