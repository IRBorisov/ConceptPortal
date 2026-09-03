import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { CstType, EvalStatus, RSToolWrapperClient } from '../index';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const tsxCli = fileURLToPath(import.meta.resolve('tsx/cli'));
const wrapperEntry = resolve(packageRoot, 'src/wrapper/stdio-wrapper.ts');

describe('RSToolWrapperClient integration', () => {
  it('rejects readiness and calls when the wrapper command cannot start', async () => {
    const client = new RSToolWrapperClient({
      command: resolve(packageRoot, 'definitely-missing-rstool-wrapper-binary'),
      args: [],
      cwd: packageRoot
    });
    try {
      await expect(client.waitUntilReady()).rejects.toThrow(/ENOENT/);
      await expect(client.call('methods')).rejects.toThrow(/ENOENT/);
    } finally {
      await client.close();
    }
  }, 30_000);

  it('rejects outstanding calls when the wrapper exits before responding', async () => {
    const client = new RSToolWrapperClient({
      command: process.execPath,
      args: ['-e', 'process.stdin.resume(); setTimeout(() => process.exit(3), 200)'],
      cwd: packageRoot
    });
    try {
      await expect(client.call('methods')).rejects.toThrow(/exited before responding \(code 3/);
    } finally {
      await client.close();
    }
  }, 30_000);

  it('starts the default npm wrapper without a shell', async () => {
    const client = new RSToolWrapperClient({ cwd: packageRoot });
    try {
      await client.waitUntilReady();
      const methods = await client.call<string[]>('methods');
      expect(methods).toContain('applySchemaPatch');
    } finally {
      await client.close();
    }
  }, 30_000);

  it('runs createSession, patch, model, and evaluate over stdio', async () => {
    const client = new RSToolWrapperClient({
      command: process.execPath,
      args: [tsxCli, wrapperEntry],
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
