import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { CstType, EvalStatus, RSToolWrapperClient } from '../index';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const tsxCli = resolve(packageRoot, 'node_modules/tsx/dist/cli.mjs');

describe('RSToolWrapperClient integration', () => {
  it('runs createSession, patch, model, and evaluate over stdio', async () => {
    const client = new RSToolWrapperClient({
      command: process.execPath,
      args: [tsxCli, resolve(packageRoot, 'src/wrapper/stdio-wrapper.ts')],
      cwd: packageRoot
    });

    try {
      await client.waitUntilReady();

      const methods = await client.call<string[]>('methods');
      expect(methods).toContain('applySchemaPatch');

      const session = await client.call<{ sessionId: string; contractVersion: string }>('createSession', {
        initial: { title: 'Wrapper test' }
      });
      expect(session.sessionId).toBeTruthy();

      await client.call('applySchemaPatch', {
        sessionId: session.sessionId,
        items: [{ alias: 'X1' }, { alias: 'D1', definitionFormal: '1+2' }]
      });

      await client.call('setModelValues', {
        sessionId: session.sessionId,
        set: [{ target: 1, value: { 0: 'zero' } }]
      });

      const evalResult = await client.call<{ success: boolean; value: number; status: number }>('evaluate', {
        sessionId: session.sessionId,
        constituentId: 2
      });
      expect(evalResult.success).toBe(true);
      expect(evalResult.value).toBe(3);
      expect(evalResult.status).toBe(EvalStatus.HAS_DATA);

      const analysis = await client.call<{ success: boolean; diagnostics: unknown[] }>('analyzeExpression', {
        sessionId: session.sessionId,
        expression: '(',
        cstType: CstType.TERM
      });
      expect(analysis.success).toBe(false);
      expect(analysis.diagnostics.length).toBeGreaterThan(0);
    } finally {
      await client.close();
    }
  }, 30_000);
});
