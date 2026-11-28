#!/usr/bin/env node
import { createHash, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';

import { createRSToolRpcServer } from '../http';

async function main() {
  const tokenPath = process.env.RSTOOL_RPC_TOKEN_FILE;
  const projectId = process.env.RSTOOL_RPC_PROJECT;
  const port = Number(process.env.RSTOOL_RPC_PORT ?? 8788);
  if (!tokenPath || !projectId || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(projectId) ||
      !Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid configuration');
  const token = (await readFile(tokenPath, 'utf8')).trim();
  if (!/^\S{32,4096}$/.test(token)) throw new Error('Invalid credential');
  const hash = (value: string) => createHash('sha256').update(value).digest();
  const expected = hash(token);
  const server = createRSToolRpcServer({
    verifyToken: supplied => timingSafeEqual(hash(supplied), expected) ? { subject: 'rpc-client', projectId } : null,
  });
  server.on('error', () => { process.stderr.write('Could not start rstool HTTP.\n'); process.exitCode = 1; });
  server.listen(port, '127.0.0.1');
}

void main().catch(() => { process.stderr.write('Check rstool HTTP project, token file and port.\n'); process.exitCode = 1; });
