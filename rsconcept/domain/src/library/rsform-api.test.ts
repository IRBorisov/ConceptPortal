import { describe, expect, it } from 'vitest';

import { CstType } from './rsform';
import { validateAliasFormat } from './rsform-api';

describe('validateAliasFormat', () => {
  it('accepts alias with type prefix and numeric suffix', () => {
    expect(validateAliasFormat('X1', CstType.BASE)).toBe(true);
    expect(validateAliasFormat('D12', CstType.TERM)).toBe(true);
  });

  it('rejects alias with wrong prefix for type', () => {
    expect(validateAliasFormat('D1', CstType.BASE)).toBe(false);
  });

  it('rejects alias without numeric suffix', () => {
    expect(validateAliasFormat('X', CstType.BASE)).toBe(false);
    expect(validateAliasFormat('XA', CstType.BASE)).toBe(false);
  });

  it('rejects duplicate-looking aliases with non-digit suffix', () => {
    expect(validateAliasFormat('X1a', CstType.BASE)).toBe(false);
  });
});
