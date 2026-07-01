import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { CstType, CONTRACT_VERSION, RSToolAgent } from '../models';
import { handleStdioRequest, STDIO_METHODS } from './stdio-handler';

describe('handleStdioRequest', () => {
  const tool = new RSToolAgent();

  it('responds to ping with contract version', async () => {
    const response = await handleStdioRequest(tool, { id: 1, method: 'ping' });
    expect(response).toEqual({
      id: 1,
      ok: true,
      result: { pong: true, contractVersion: CONTRACT_VERSION }
    });
  });

  it('lists contract methods', async () => {
    const response = await handleStdioRequest(tool, { id: 2, method: 'methods' });
    expect(response.ok).toBe(true);
    expect(response.result).toEqual(STDIO_METHODS);
  });

  it('applies schema patch through the wrapper', async () => {
    const response = await handleStdioRequest(tool, {
      id: 3,
      method: 'applySchemaPatch',
      params: { items: [{ alias: 'X1' }] }
    });
    expect(response.ok).toBe(true);
    expect((response.result as { success: boolean }).success).toBe(true);
  });

  it('evaluates a constituent', async () => {
    const sessionTool = new RSToolAgent();
    await handleStdioRequest(sessionTool, {
      id: 10,
      method: 'applySchemaPatch',
      params: {
        items: [{ alias: 'X1' }, { alias: 'D1', definitionFormal: '1+2' }]
      }
    });
    const response = await handleStdioRequest(sessionTool, {
      id: 11,
      method: 'evaluate',
      params: { constituentId: 2 }
    });
    expect(response.ok).toBe(true);
    expect((response.result as { value: number }).value).toBe(3);
  });

  it('returns METHOD_NOT_FOUND for unknown methods', async () => {
    const response = await handleStdioRequest(tool, { id: 4, method: 'notReal' });
    expect(response.ok).toBe(false);
    expect(response.error?.code).toBe('METHOD_NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when setCurrentSession lacks sessionId', async () => {
    const response = await handleStdioRequest(tool, { id: 5, method: 'setCurrentSession', params: {} });
    expect(response.ok).toBe(false);
    expect(response.error?.code).toBe('INTERNAL_ERROR');
    expect(response.error?.message).toMatch(/sessionId/);
  });

  it('returns INTERNAL_ERROR for unknown session id', async () => {
    const sessionTool = new RSToolAgent();
    const response = await handleStdioRequest(sessionTool, {
      id: 6,
      method: 'setCurrentSession',
      params: { sessionId: randomUUID() }
    });
    expect(response.ok).toBe(false);
    expect(response.error?.code).toBe('INTERNAL_ERROR');
    expect(response.error?.message).toMatch(/Unknown session/);
  });

  it('filters diagnostics by constituentId param', async () => {
    const sessionTool = new RSToolAgent();
    const created = await handleStdioRequest(sessionTool, { id: 20, method: 'createSession' });
    const sessionId = (created.result as { sessionId: string }).sessionId;
    await handleStdioRequest(sessionTool, {
      id: 21,
      method: 'applySchemaPatch',
      params: {
        sessionId,
        mode: 'best_effort',
        items: [{ alias: 'X1', cstType: CstType.BASE, definitionFormal: 'Z' }]
      }
    });

    const all = await handleStdioRequest(sessionTool, { id: 22, method: 'listDiagnostics', params: { sessionId } });
    const filtered = await handleStdioRequest(sessionTool, {
      id: 23,
      method: 'listDiagnostics',
      params: { sessionId, constituentId: 1 }
    });
    expect((all.result as unknown[]).length).toBeGreaterThan(0);
    expect(filtered.result).toEqual(all.result);
  });
});
