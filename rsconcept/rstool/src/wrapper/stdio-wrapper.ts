#!/usr/bin/env node
import readline from 'node:readline';

import { RSToolAgent } from '../models/rstool-agent';
import { handleStdioRequest, type StdioRequest, type StdioResponse } from './stdio-handler';

const persistenceDir = process.env.RSTOOL_PERSISTENCE_DIR;
const tool = new RSToolAgent(persistenceDir ? { persistenceDir } : {});

function writeResponse(response: StdioResponse): void {
  if (!process.stdout.writable || process.stdout.destroyed || process.stdout.writableEnded) {
    return;
  }
  try {
    process.stdout.write(`${JSON.stringify(response)}\n`);
  } catch {
    // The client might have already closed stdout (EPIPE). Safe to ignore.
  }
}

const input = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity
});

writeResponse({
  id: null,
  ok: true,
  result: {
    ready: true,
    wrapper: 'rstool-stdio',
    contractVersion: tool.contractVersion
  }
});

input.on('line', line => {
  if (!line.trim()) {
    return;
  }
  try {
    const request = JSON.parse(line) as StdioRequest;
    if (!('id' in request) || !('method' in request)) {
      throw new Error('Request must include "id" and "method"');
    }
    void handleStdioRequest(tool, request).then(writeResponse);
  } catch (error) {
    writeResponse({
      id: null,
      ok: false,
      error: {
        code: 'BAD_REQUEST',
        message: error instanceof Error ? error.message : 'Invalid JSON'
      }
    });
  }
});
